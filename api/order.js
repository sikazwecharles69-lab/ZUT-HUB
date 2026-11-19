const DEFAULT_GRAPH_API_VERSION = "v27.0";
const DEFAULT_RECIPIENT_NUMBER = "260572205511";
const MAX_FIELD_LENGTH = 1000;

function readText(value, maxLength = MAX_FIELD_LENGTH) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function reply(res, status, payload) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(status).json(payload);
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return reply(res, 405, { error: "Use the order form to submit an order." });
    }

    const origin = req.headers.origin;
    if (process.env.SITE_ORIGIN && origin !== process.env.SITE_ORIGIN) {
        return reply(res, 403, { error: "This order form is not authorized." });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const customerName = readText(body.customer_name, 120);
    const phone = readText(body.phone, 30);
    const orderType = readText(body.order_type, 20);
    const items = readText(body.items, MAX_FIELD_LENGTH);
    const deliveryAddress = readText(body.delivery_address, 300);
    const notes = readText(body.notes, MAX_FIELD_LENGTH);

    if (!customerName || !phone || !items || !["takeaway", "delivery"].includes(orderType)) {
        return reply(res, 400, { error: "Enter your name, phone number, order type, and items." });
    }
    if (orderType === "delivery" && !deliveryAddress) {
        return reply(res, 400, { error: "Enter the delivery address." });
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const templateName = process.env.WHATSAPP_ORDER_TEMPLATE_NAME;
    const templateLanguage = process.env.WHATSAPP_ORDER_TEMPLATE_LANGUAGE || "en_US";
    if (!accessToken || !phoneNumberId || !templateName) {
        return reply(res, 503, {
            error: "Order messaging is not set up yet. Please contact the restaurant by phone.",
        });
    }

    const orderReference = `ZUT-${Date.now().toString(36).toUpperCase()}`;
    const templateParameters = [
        orderReference,
        customerName,
        phone,
        orderType === "delivery" ? "Delivery" : "Takeaway",
        items,
        orderType === "delivery" ? deliveryAddress : "Not applicable",
        notes || "None",
    ].map(text => ({ type: "text", text }));

    const apiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
    const recipient = process.env.WHATSAPP_RECIPIENT_NUMBER || DEFAULT_RECIPIENT_NUMBER;
    const apiUrl = `https://graph.facebook.com/${apiVersion}/${encodeURIComponent(phoneNumberId)}/messages`;

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: recipient,
                type: "template",
                template: {
                    name: templateName,
                    language: { code: templateLanguage },
                    components: [{ type: "body", parameters: templateParameters }],
                },
            }),
            signal: AbortSignal.timeout(10000),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(result.messages) || !result.messages[0]?.id) {
            console.error("WhatsApp order send failed", {
                status: response.status,
                code: result.error?.code,
                type: result.error?.type,
            });
            return reply(res, 502, {
                error: "WhatsApp could not receive the order. Please call the restaurant.",
            });
        }

        return reply(res, 200, { ok: true, orderReference });
    } catch (error) {
        console.error("WhatsApp order request failed", error.name || "UnknownError");
        return reply(res, 502, {
            error: "WhatsApp could not receive the order. Please call the restaurant.",
        });
    }
};
