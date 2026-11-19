function createWebsiteOrderLink(itemName) {
    const link = document.createElement("a");
    const localPhpOrder = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    const orderUrl = new URL(localPhpOrder ? "order.php" : "order.html", document.baseURI);
    orderUrl.searchParams.set("items", `${itemName} x 1`);
    link.className = "website-order-link";
    link.href = orderUrl;
    link.textContent = "Order on website";
    link.setAttribute("aria-label", `Order ${itemName} on the website`);
    return link;
}

const localPhpOrder = ["localhost", "127.0.0.1"].includes(window.location.hostname);
if (localPhpOrder) {
    document.querySelectorAll('a[href="order.html"]').forEach(link => {
        link.href = new URL("order.php", document.baseURI).href;
    });
}

document.querySelectorAll(".menu-item").forEach(item => {
    const itemName = item.querySelector("h4").textContent.trim();
    item.append(createWebsiteOrderLink(itemName));
});

document.querySelectorAll(".price-category table").forEach(table => {
    const headerRow = table.querySelector("thead tr");
    const websiteOrderHeader = document.createElement("th");
    websiteOrderHeader.scope = "col";
    websiteOrderHeader.textContent = "Order";
    headerRow.append(websiteOrderHeader);

    table.querySelectorAll("tbody tr").forEach(row => {
        const itemName = row.cells[0].textContent.trim();
        const websiteOrderCell = document.createElement("td");
        websiteOrderCell.append(createWebsiteOrderLink(itemName));
        row.append(websiteOrderCell);
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
