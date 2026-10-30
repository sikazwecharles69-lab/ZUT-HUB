const whatsappNumber = "260572205511";

function createWhatsAppOrderLink(itemName) {
    const message = `Hello ZUT Restaurant, I would like to order ${itemName}. Please confirm the price and availability.`;
    const link = document.createElement("a");
    link.className = "whatsapp-order-link";
    link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Order on WhatsApp";
    link.setAttribute("aria-label", `Order ${itemName} on WhatsApp`);
    return link;
}

document.querySelectorAll(".menu-item").forEach(item => {
    const itemName = item.querySelector("h4").textContent.trim();
    item.append(createWhatsAppOrderLink(itemName));
});

document.querySelectorAll(".price-category table").forEach(table => {
    const headerRow = table.querySelector("thead tr");
    const orderHeader = document.createElement("th");
    orderHeader.scope = "col";
    orderHeader.textContent = "Order";
    headerRow.append(orderHeader);

    table.querySelectorAll("tbody tr").forEach(row => {
        const itemName = row.cells[0].textContent.trim();
        const orderCell = document.createElement("td");
        orderCell.append(createWhatsAppOrderLink(itemName));
        row.append(orderCell);
    });
});

const slides = [...document.querySelectorAll(".menu-slide")];
const dotsContainer = document.querySelector(".carousel-dots");
const status = document.querySelector("#slide-status");
const pauseButton = document.querySelector(".carousel-toggle");
const foodSectionLinks = document.querySelectorAll(".food-section-nav a");

if (slides.length && dotsContainer && status && pauseButton) {
    let activeSlide = 0;
    let timer;
    let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function showSlide(index) {
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
            slide.hidden = i !== activeSlide;
            dotsContainer.children[i].setAttribute("aria-current", i === activeSlide ? "true" : "false");
        });
        foodSectionLinks.forEach((link, i) => {
            if (i === activeSlide) {
                link.setAttribute("aria-current", "true");
            } else {
                link.removeAttribute("aria-current");
            }
        });
        status.textContent = `${slides[activeSlide].getAttribute("aria-label")} menu`;
    }

    function startSlideshow() {
        window.clearInterval(timer);
        if (!paused) timer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
    }

    slides.forEach((slide, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Show ${slide.getAttribute("aria-label")}`);
        dot.addEventListener("click", () => {
            showSlide(i);
            startSlideshow();
        });
        dotsContainer.append(dot);
    });

    foodSectionLinks.forEach(link => {
        link.addEventListener("click", () => {
            paused = true;
            pauseButton.textContent = "Play slideshow";
            pauseButton.setAttribute("aria-pressed", "true");
            showSlide(Number(link.dataset.slideIndex));
            startSlideshow();
            document.querySelector("#food-list").focus({ preventScroll: true });
        });
    });

    document.querySelectorAll(".carousel-arrow").forEach(button => {
        button.addEventListener("click", () => {
            showSlide(activeSlide + Number(button.dataset.direction));
            startSlideshow();
        });
    });

    pauseButton.addEventListener("click", () => {
        paused = !paused;
        pauseButton.textContent = paused ? "Play slideshow" : "Pause slideshow";
        pauseButton.setAttribute("aria-pressed", String(paused));
        startSlideshow();
    });

    showSlide(0);
    pauseButton.textContent = paused ? "Play slideshow" : "Pause slideshow";
    pauseButton.setAttribute("aria-pressed", String(paused));
    startSlideshow();
}
