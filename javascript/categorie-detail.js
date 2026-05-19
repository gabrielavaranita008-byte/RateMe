document.addEventListener("DOMContentLoaded", () => {
    initTabs();
    initLoadMore();
    initModals();
    initUserAuth();
    initReviewButtons();
    initReviewForm();
    initRevealOnScroll();
});

function initTabs() {
    const buttons = document.querySelectorAll(".tab-btn");
    const panes = document.querySelectorAll(".tab-pane");

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            buttons.forEach(btn => btn.classList.remove("active"));
            panes.forEach(pane => pane.classList.remove("active"));

            button.classList.add("active");

            const targetPane = document.getElementById(button.dataset.tab);

            if (targetPane) {
                targetPane.classList.add("active");
            }
        });
    });
}

function initLoadMore() {
    const cards = document.querySelectorAll(".product-card");
    const loadMoreBtn = document.getElementById("load-more-btn");

    if (!loadMoreBtn || cards.length === 0) return;

    let visibleCards = 12;

    function updateCards() {
        cards.forEach((card, index) => {
            card.style.display = index < visibleCards ? "flex" : "none";
        });
    }

    updateCards();

    loadMoreBtn.addEventListener("click", () => {
        if (visibleCards === 12) {
            visibleCards = 16;
            loadMoreBtn.textContent = "Show All";
        } else {
            visibleCards = cards.length;
            updateCards();
            loadMoreBtn.remove();
            return;
        }

        updateCards();
    });
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById("modal-overlay");

    if (modal) modal.classList.add("active");
    if (overlay) overlay.classList.add("active");
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("active");
    });

    const overlay = document.getElementById("modal-overlay");

    if (overlay) {
        overlay.classList.remove("active");
    }
}

function initModals() {
    const loginBtn = document.getElementById("nav-login-btn");
    const overlay = document.getElementById("modal-overlay");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            openModal("login-modal");
        });
    }

    document.addEventListener("click", event => {
        if (event.target.closest(".modal-close")) {
            closeAllModals();
        }

        if (event.target === overlay) {
            closeAllModals();
        }
    });
}

function initUserAuth() {
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");

    updateLoginUI();

    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();

            const name = document.getElementById("user-name").value.trim();
            const email = document.getElementById("user-email").value.trim();
            const password = document.getElementById("user-password").value.trim();

            if (!name || !email || !password) {
                showNotification("Please complete all fields.");
                return;
            }

            if (!email.includes("@")) {
                showNotification("Please enter a valid email.");
                return;
            }

            const user = {
                name,
                email,
                joinedDate: new Date().toISOString()
            };

            localStorage.setItem("rateMe_user", JSON.stringify(user));

            updateLoginUI();
            closeAllModals();
            showNotification(`Welcome, ${name}!`);
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("rateMe_user");

            updateLoginUI();
            closeAllModals();
            showNotification("You have been logged out.");
        });
    }
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
        if (navLoginBtn) navLoginBtn.textContent = `${user.name}`;
    } else {
        if (loginContainer) loginContainer.style.display = "block";
        if (loggedInfo) loggedInfo.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Login";
    }
}

function initReviewButtons() {
    document.querySelectorAll(".btn-review").forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".product-card");
            const restaurantName = card.querySelector("h3").textContent.trim();

            localStorage.setItem("rateMe_selectedRestaurant", restaurantName);
            localStorage.setItem("rateMe_reviewSearch", restaurantName);

            window.location.href = `reviews.html?search=${encodeURIComponent(restaurantName)}`;
        });
    });
}

function initReviewForm() {
    const form = document.getElementById("category-review-form");

    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();

        const user = getCurrentUser();

        if (!user) {
            showNotification("Please login before publishing a review.");
            openModal("login-modal");
            return;
        }

        const subject = document.getElementById("category-review-title").value.trim();
        const rating = document.getElementById("category-review-rating").value;
        const review = document.getElementById("category-review-text").value.trim();

        if (!subject || !rating || !review) {
            showNotification("Please complete the review form.");
            return;
        }

        const reviews = JSON.parse(localStorage.getItem("rateMe_reviews") || "[]");

        reviews.push({
            subject,
            category: "Food",
            rating,
            review,
            userName: user.name,
            userEmail: user.email,
            timestamp: new Date().toISOString()
        });

        localStorage.setItem("rateMe_reviews", JSON.stringify(reviews));

        form.reset();

        showNotification("Review published successfully.");
    });
}

function showNotification(message) {
    const toast = document.getElementById("notification-toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function initRevealOnScroll() {
    const elements = document.querySelectorAll(
        ".product-card, .detail-section-block, .category-cta, .review-item, .guide-card, .trending-card"
    );

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    elements.forEach(element => observer.observe(element));
}

window.openModal = openModal;
window.closeAllModals = closeAllModals;