// ===============================
// RateMe - Clean script.js
// Fără GSAP / ScrollTrigger
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    initModals();
    initUserAuth();
    initButtons();
    initStarRating();
    initForms();
    initRevealOnScroll();
    initHomeSearch();
    initFeatureCards();
    initReviewCards();
    initNavbarScroll();
    initStatsCounter();
});

// ===============================
// MODALS
// ===============================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById("modal-overlay");

    if (!modal || !overlay) return;

    modal.classList.add("active");
    overlay.classList.add("active");
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById("modal-overlay");

    if (!modal || !overlay) return;

    modal.classList.remove("active");

    if (!document.querySelector(".modal.active")) {
        overlay.classList.remove("active");
    }
}

function closeAllModals() {
    const overlay = document.getElementById("modal-overlay");

    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
    });

    if (overlay) {
        overlay.classList.remove("active");
    }
}

function initModals() {
    const overlay = document.getElementById("modal-overlay");

    document.querySelectorAll(".modal-close").forEach(button => {
        button.addEventListener("click", () => {
            closeAllModals();
        });
    });

    if (overlay) {
        overlay.addEventListener("click", closeAllModals);
    }
}

// ===============================
// USER LOGIN / LOGOUT
// ===============================

function initUserAuth() {
    const navLoginBtn = document.getElementById("nav-login-btn");
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");

    updateLoginUI();

    if (navLoginBtn) {
        navLoginBtn.addEventListener("click", () => {
            openModal("login-modal");
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
    }
}

function handleLogin(event) {
    event.preventDefault();

    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");
    const passwordInput = document.getElementById("user-password");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!name || !email || !password) {
        showNotification("Please complete all fields.");
        return;
    }

    if (!email.includes("@")) {
        showNotification("Please enter a valid email.");
        return;
    }

    if (password.length < 6) {
        showNotification("Password must have at least 6 characters.");
        return;
    }

    const user = {
        name,
        email,
        joinedDate: new Date().toISOString()
    };

    localStorage.setItem("rateMe_user", JSON.stringify(user));

    updateLoginUI();
    closeModal("login-modal");
    showNotification(`Welcome, ${name}!`);
}

function logoutUser() {
    localStorage.removeItem("rateMe_user");
    updateLoginUI();
    closeModal("login-modal");
    showNotification("You have been logged out.");
}

function getCurrentUser() {
    const user = localStorage.getItem("rateMe_user");
    return user ? JSON.parse(user) : null;
}

function updateLoginUI() {
    const user = getCurrentUser();

    const loginContainer = document.getElementById("login-form-container");
    const loggedInfo = document.getElementById("logged-in-info");
    const loggedName = document.getElementById("logged-user-name");
    const loggedEmail = document.getElementById("logged-user-email");
    const navLoginBtn = document.getElementById("nav-login-btn");

    if (user) {
        if (loginContainer) loginContainer.style.display = "none";
        if (loggedInfo) loggedInfo.style.display = "block";
        if (loggedName) loggedName.textContent = user.name;
        if (loggedEmail) loggedEmail.textContent = user.email;
        if (navLoginBtn) navLoginBtn.textContent = `User: ${user.name}`;
    } else {
        if (loginContainer) loginContainer.style.display = "block";
        if (loggedInfo) loggedInfo.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Login";
    }
}

// ===============================
// BUTTONS
// ===============================

function initButtons() {
    const ctaButton = document.querySelector(".cta-button");
    const ctaLargeButtons = document.querySelectorAll(".cta-button-large");

    if (ctaButton) {
        ctaButton.addEventListener("click", () => {
            openModal("rating-modal");
        });
    }

    ctaLargeButtons.forEach(button => {
        button.addEventListener("click", () => {
            openModal("subscribe-modal");
        });
    });
}

// ===============================
// STAR RATING
// ===============================

function initStarRating() {
    const stars = document.querySelectorAll(".star-rating .star");

    stars.forEach(star => {
        star.addEventListener("click", () => {
            const value = Number(star.dataset.value);

            stars.forEach(item => {
                const itemValue = Number(item.dataset.value);

                if (itemValue <= value) {
                    item.classList.add("active");
                } else {
                    item.classList.remove("active");
                }
            });
        });
    });
}

function getSelectedRating() {
    return document.querySelectorAll(".star-rating .star.active").length;
}

// ===============================
// FORMS
// ===============================

function initForms() {
    const ratingForm = document.getElementById("rating-form");
    const subscribeForm = document.getElementById("subscribe-form");

    if (ratingForm) {
        ratingForm.addEventListener("submit", handleRatingSubmit);
    }

    if (subscribeForm) {
        subscribeForm.addEventListener("submit", handleSubscribeSubmit);
    }
}

function handleRatingSubmit(event) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
        showNotification("Please login first.");
        closeModal("rating-modal");
        openModal("login-modal");
        return;
    }

    const form = event.target;
    const subject = form.querySelector("input[type='text']").value.trim();
    const reviewText = form.querySelector("textarea").value.trim();
    const rating = getSelectedRating();

    if (!subject || !reviewText || rating === 0) {
        showNotification("Please complete the review and select a rating.");
        return;
    }

    const reviews = JSON.parse(localStorage.getItem("rateMe_reviews") || "[]");

    reviews.push({
        subject,
        reviewText,
        rating,
        userName: user.name,
        userEmail: user.email,
        date: new Date().toISOString()
    });

    localStorage.setItem("rateMe_reviews", JSON.stringify(reviews));

    form.reset();

    document.querySelectorAll(".star-rating .star").forEach(star => {
        star.classList.remove("active");
    });

    closeModal("rating-modal");
    openModal("success-modal");
}

function handleSubscribeSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.querySelector("input[type='email']").value.trim();
    const name = form.querySelector("input[type='text']").value.trim();

    if (!email || !name) {
        showNotification("Please complete all fields.");
        return;
    }

    const subscribers = JSON.parse(localStorage.getItem("rateMe_subscribers") || "[]");

    subscribers.push({
        name,
        email,
        date: new Date().toISOString()
    });

    localStorage.setItem("rateMe_subscribers", JSON.stringify(subscribers));

    form.reset();
    closeModal("subscribe-modal");
    showNotification(`Thank you, ${name}!`);
}

// ===============================
// NOTIFICATION TOAST
// ===============================

function showNotification(message) {
    const toast = document.getElementById("notification-toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// ===============================
// REVEAL ON SCROLL
// ===============================

function initRevealOnScroll() {
    const revealElements = document.querySelectorAll(".reveal");

    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
            }
        });
    }, {
        threshold: 0.15
    });

    revealElements.forEach(element => {
        observer.observe(element);
    });
}

// ===============================
// HOME SEARCH
// ===============================

function initHomeSearch() {
    const input = document.querySelector(".home-search input");
    const results = document.querySelector(".home-search-results, .search-results");

    if (!input || !results) return;

    results.className = "home-search-results";

    const items = [

    ...Array.from(document.querySelectorAll(".feature-card")).map(card => ({
        title: card.querySelector("h3")?.textContent.trim(),
        type: "Feature",
        element: card
    })),

    ...Array.from(document.querySelectorAll(".review-card")).map(card => ({
        title:
            card.querySelector(".reviewer-info h4")?.textContent.trim() ||
            card.querySelector("h3")?.textContent.trim(),
        type: "Review",
        element: card
    })),

    ...Array.from(document.querySelectorAll(".category-card")).map(card => ({
        title:
            card.querySelector(".category-name")?.textContent.trim() ||
            card.querySelector("h3")?.textContent.trim(),
        type: "Category",
        element: card
    })),

    ...[
        { title: "Restaurante", type: "Category", url: "category-detail.html?category=Restaurante" },
        { title: "Localuri", type: "Category", url: "category-detail.html?category=Localuri" },
        { title: "Produse", type: "Category", url: "category-detail.html?category=Produse" },
        { title: "Dining", type: "Category", url: "category-detail.html?category=Dining" },
        { title: "Shopping", type: "Category", url: "category-detail.html?category=Shopping" },
        { title: "Technology", type: "Category", url: "category-detail.html?category=Technology" },
        { title: "Cafenele", type: "Local", url: "category-detail.html?category=Cafenele" },
        { title: "Hoteluri", type: "Local", url: "category-detail.html?category=Hoteluri" },
        { title: "Magazine", type: "Product", url: "category-detail.html?category=Magazine" },
        { title: "Electronice", type: "Product", url: "category-detail.html?category=Electronice" }
    ].map(item => ({
        title: item.title,
        type: item.type,
        element: null,
        url: item.url
    }))

].filter(item => item.title);

    input.addEventListener("input", () => {
        const query = input.value.toLowerCase().trim();

        if (!query) {
            results.innerHTML = "";
            results.classList.remove("active");
            return;
        }

        const matches = items.filter(item =>
            item.title.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            results.innerHTML = `
                <button class="home-search-result" type="button">
                    <span>Nu s-a găsit nimic</span>
                    <small>Încearcă alt cuvânt</small>
                </button>
            `;
        } else {
            results.innerHTML = matches.map((item, index) => `
                <button class="home-search-result" type="button" data-index="${index}">
                    <span>${item.title}</span>
                    <small>${item.type}</small>
                </button>
            `).join("");
        }

        results.classList.add("active");

        results.querySelectorAll("[data-index]").forEach(button => {
            button.addEventListener("click", () => {
                const item = matches[Number(button.dataset.index)];

                input.value = "";
                results.innerHTML = "";
                results.classList.remove("active");

                                if (item.url) {
                    window.location.href = item.url;
                    return;
                }

                item.element.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                item.element.classList.add("search-highlight");

                setTimeout(() => {
                    item.element.classList.remove("search-highlight");
                }, 1500);
            });
        });
    });

    document.addEventListener("click", event => {
        if (!event.target.closest(".home-search")) {
            results.classList.remove("active");
        }
    });
}
// ===============================
// FEATURE CARDS
// ===============================

function initFeatureCards() {
    document.querySelectorAll(".feature-card").forEach(card => {
        card.addEventListener("click", () => {
            card.classList.toggle("is-expanded");
        });
    });
}

// ===============================
// REVIEW CARDS
// ===============================

function initReviewCards() {
    document.querySelectorAll(".review-card").forEach(card => {
        card.addEventListener("click", () => {
            const author = card.querySelector(".reviewer-info h4")?.textContent.trim() || "RateMe User";
            const role = card.querySelector(".reviewer-info p")?.textContent.trim() || "Community Reviewer";
            const text = card.querySelector(".review-text")?.textContent.trim() || "";
            const avatar = card.querySelector(".reviewer-avatar")?.src || "";

            localStorage.setItem("rateMe_selectedReview", JSON.stringify({
                author,
                role,
                text,
                avatar,
                rating: "5.0"
            }));

            window.location.href = "review-detail.html";
        });
    });
}

// ===============================
// NAVBAR SCROLL EFFECT
// ===============================

function initNavbarScroll() {
    const navbar = document.querySelector(".navbar");

    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 100) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }
    });
}

// ===============================
// MAKE FUNCTIONS GLOBAL
// pentru onclick din HTML
// ===============================

window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;

//stats section
function initStatsCounter() {
    const stats = document.querySelectorAll(".stat-number");

    if (stats.length === 0) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            const stat = entry.target;
            const finalText = stat.textContent;
            const number = parseFloat(finalText.replace(/[^\d.]/g, ""));

            let suffix = "";
            if (finalText.includes("M+")) suffix = "M+";
            else if (finalText.includes("+")) suffix = "+";
            else if (finalText.includes("%")) suffix = "%";

            let current = 0;
            const duration = 1500;
            const startTime = performance.now();

            function animate(time) {
                const progress = Math.min((time - startTime) / duration, 1);
                const value = number * progress;

                if (finalText.includes("M+")) {
                    stat.textContent = value.toFixed(1) + suffix;
                } else if (finalText.includes("%")) {
                    stat.textContent = value.toFixed(1) + suffix;
                } else {
                    stat.textContent = Math.floor(value) + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    stat.textContent = finalText;
                }
            }

            requestAnimationFrame(animate);
            observer.unobserve(stat);
        });
    }, {
        threshold: 0.4
    });

    stats.forEach(stat => observer.observe(stat));
}

//feactures card
function initFeatureCards() {
    const featureDetails = {
        "Recenzii vizuale": {
            label: "More details",
            text: "Această secțiune poate fi extinsă cu imagini, exemple și detalii despre recenziile vizuale.",
            points: ["Detailed information", "Animated reveal", "Clear next action"]
        },

        "Conținut în trend": {
            label: "More details",
            text: "Aici pot fi afișate cele mai populare recenzii și categoriile care sunt în trend.",
            points: ["Popular reviews", "Trending categories", "Updated content"]
        },

        "Recenzii verificate": {
            label: "More details",
            text: "Această secțiune explică modul în care recenziile pot fi verificate și salvate corect.",
            points: ["Verified users", "Safe content", "Trust system"]
        },

        "Viteză fulger": {
            label: "More details",
            text: "Platforma oferă o experiență rapidă, cu încărcare eficientă și interacțiuni simple.",
            points: ["Fast loading", "Smooth scroll", "Quick actions"]
        },

        "Calitate premium": {
            label: "More details",
            text: "Designul premium oferă o experiență modernă, clară și ușor de utilizat.",
            points: ["Modern design", "Clean layout", "Premium tools"]
        },

        "Comunitatea pe primul loc": {
            label: "More details",
            text: "Utilizatorii pot contribui cu recenzii, opinii și experiențe personale.",
            points: ["User reviews", "Community feedback", "Personal profile"]
        }
    };

    document.querySelectorAll(".feature-card").forEach(card => {
        card.addEventListener("click", () => {
            const title = card.querySelector("h3")?.textContent.trim();

            document.querySelectorAll(".feature-card").forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove("is-expanded");

                    const oldPanel = otherCard.querySelector(".feature-expanded-content");
                    if (oldPanel) {
                        oldPanel.remove();
                    }
                }
            });

            const existingPanel = card.querySelector(".feature-expanded-content");

            if (existingPanel) {
                existingPanel.remove();
                card.classList.remove("is-expanded");
                return;
            }

            const detail = featureDetails[title] || {
                label: "More details",
                text: "This section can be extended with richer content, examples, and actions.",
                points: ["Detailed information", "Animated reveal", "Clear next action"]
            };

            const panel = document.createElement("div");
            panel.className = "feature-expanded-content";

            panel.innerHTML = `
                <span class="feature-kicker">${detail.label}</span>

                <p>${detail.text}</p>

                <div class="feature-points">
                    ${detail.points.map(point => `<span>${point}</span>`).join("")}
                </div>

                <a href="categorie-detail.html"><button class="feature-action" type="button">
                    Open Details
                </button></a>
            `;

            card.appendChild(panel);
            card.classList.add("is-expanded");
        });
    });
}