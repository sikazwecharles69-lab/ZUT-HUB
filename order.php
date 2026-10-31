<?php
declare(strict_types=1);

session_start();
header("X-Content-Type-Options: nosniff");

if (!isset($_SESSION["order_csrf_token"])) {
    $_SESSION["order_csrf_token"] = bin2hex(random_bytes(32));
}

function escapeHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, "UTF-8");
}

function inputString(array $source, string $key, string $default = ""): string
{
    $value = $source[$key] ?? $default;
    return is_string($value) || is_numeric($value) ? trim((string) $value) : "";
}

$errors = [];
$successMessage = $_SESSION["order_success_message"] ?? "";
unset($_SESSION["order_success_message"]);

$form = [
    "customer_name" => "",
    "phone" => "",
    "order_type" => "takeaway",
    "items" => inputString($_GET, "items"),
    "delivery_address" => "",
    "notes" => "",
];

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    foreach ($form as $field => $default) {
        $form[$field] = inputString($_POST, $field, $default);
    }

    $submittedToken = inputString($_POST, "csrf_token");
    if (!hash_equals($_SESSION["order_csrf_token"], $submittedToken)) {
        $errors[] = "Your form session expired. Please review your order and submit it again.";
    }

    if ($form["customer_name"] === "" || strlen($form["customer_name"]) > 480) {
        $errors[] = "Enter your name (up to 120 characters).";
    }

    preg_match_all('/[0-9]/', $form["phone"], $phoneDigits);
    if (
        strlen($form["phone"]) > 120
        || !preg_match('/^[0-9+().\-\s]{7,30}$/', $form["phone"])
        || count($phoneDigits[0]) < 7
    ) {
        $errors[] = "Enter a valid phone number.";
    }

    if (!in_array($form["order_type"], ["takeaway", "delivery"], true)) {
        $errors[] = "Choose takeaway or delivery.";
    }

    if ($form["items"] === "" || strlen($form["items"]) > 4000) {
        $errors[] = "Enter the items you would like to order (up to 1,000 characters).";
    }

    if ($form["order_type"] === "delivery" && $form["delivery_address"] === "") {
        $errors[] = "Enter the delivery address.";
    }

    if (strlen($form["delivery_address"]) > 1200) {
        $errors[] = "The delivery address is too long.";
    }

    if (strlen($form["notes"]) > 4000) {
        $errors[] = "Order notes must be 1,000 characters or fewer.";
    }

    if ($form["order_type"] === "takeaway") {
        $form["delivery_address"] = "";
    }

    if (!$errors) {
        try {
            require __DIR__ . "/db.php";
            $statement = $conn->prepare(
                "INSERT INTO orders (customer_name, phone, order_type, items, delivery_address, notes)
                VALUES (?, ?, ?, ?, ?, ?)"
            );
            $customerName = $form["customer_name"];
            $phone = $form["phone"];
            $orderTypeValue = $form["order_type"];
            $items = $form["items"];
            $deliveryAddress = $form["delivery_address"] !== "" ? $form["delivery_address"] : null;
            $notes = $form["notes"];
            $statement->bind_param(
                "ssssss",
                $customerName,
                $phone,
                $orderTypeValue,
                $items,
                $deliveryAddress,
                $notes
            );
            $statement->execute();

            $_SESSION["order_success_message"] =
                "Your order was received. Your reference number is " . $conn->insert_id . ".";
            $_SESSION["order_csrf_token"] = bin2hex(random_bytes(32));
            header("Location: order.php");
            exit;
        } catch (RuntimeException $exception) {
            error_log("Restaurant order submission failed: " . $exception->getMessage());
            http_response_code(500);
            $errors[] = "We could not save your order. Please try again later or contact the restaurant by phone.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#111827">
    <title>Place an Order | ZUT Restaurant</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <a href="index.php#home" class="logo">ZUT <span>RESTAURANT</span></a>
        <nav class="main-navigation" aria-label="Main navigation">
            <a href="index.php#home">Home</a>
            <a href="index.php#menu">Menu</a>
            <a href="prices.html">Prices</a>
        </nav>
    </header>

    <main class="order-page">
        <section class="order-intro">
            <p class="eyebrow">ZUT RESTAURANT</p>
            <h1>Place an Order</h1>
            <p>Your contact and order details are saved so the restaurant can process your order. No payment is taken on this page.</p>
        </section>

        <?php if ($successMessage !== ""): ?>
            <p class="order-notice order-notice-success" role="status"><?= escapeHtml($successMessage) ?></p>
        <?php endif; ?>

        <?php if ($errors): ?>
            <div class="order-notice order-notice-error" role="alert">
                <p>Please check the following:</p>
                <ul>
                    <?php foreach ($errors as $error): ?>
                        <li><?= escapeHtml($error) ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <form class="order-form" method="post" action="order.php">
            <input type="hidden" name="csrf_token" value="<?= escapeHtml($_SESSION["order_csrf_token"]) ?>">

            <label for="customer-name">Your name</label>
            <input id="customer-name" name="customer_name" type="text" maxlength="120" autocomplete="name"
                   value="<?= escapeHtml($form["customer_name"]) ?>" required>

            <label for="phone">Phone number</label>
            <input id="phone" name="phone" type="tel" maxlength="30" autocomplete="tel"
                   value="<?= escapeHtml($form["phone"]) ?>" required>

            <label for="order-type">Order type</label>
            <select id="order-type" name="order_type" required>
                <option value="takeaway"<?= $form["order_type"] === "takeaway" ? " selected" : "" ?>>Takeaway</option>
                <option value="delivery"<?= $form["order_type"] === "delivery" ? " selected" : "" ?>>Delivery</option>
            </select>

            <div class="delivery-address-field">
                <label for="delivery-address">Delivery address</label>
                <textarea id="delivery-address" name="delivery_address" maxlength="300" rows="3"
                          autocomplete="street-address"><?= escapeHtml($form["delivery_address"]) ?></textarea>
            </div>

            <label for="items">Items and quantities</label>
            <textarea id="items" name="items" maxlength="1000" rows="5" required
                      placeholder="For example: 2 × Chicken and Rice, 1 × Coca-Cola"><?= escapeHtml($form["items"]) ?></textarea>

            <label for="notes">Additional notes <span class="form-optional">(optional)</span></label>
            <textarea id="notes" name="notes" maxlength="1000" rows="3"><?= escapeHtml($form["notes"]) ?></textarea>

            <button class="button order-submit" type="submit">Submit Order</button>
        </form>

        <p class="prices-back"><a class="button" href="index.php#menu">Back to Food Menu</a></p>
    </main>

    <footer>
        <p>Phone: 0964442250</p>
        <p>&copy; 2026 ZUT Restaurant. All rights reserved.</p>
    </footer>
    <script>
        const orderType = document.querySelector("#order-type");
        const addressField = document.querySelector("#delivery-address");

        function updateDeliveryAddress() {
            const isDelivery = orderType.value === "delivery";
            addressField.required = isDelivery;
            addressField.closest(".delivery-address-field").hidden = !isDelivery;
        }

        orderType.addEventListener("change", updateDeliveryAddress);
        updateDeliveryAddress();
    </script>
</body>
</html>
