document.addEventListener("DOMContentLoaded", () => {
    initModals();
    initUserAuth();
    initCategoryCards();
    initStatCards();
    initRevealOnScroll();
});

// CATEGORY CARDS

const categoryDetails = {
    Food: ["Restaurants", "Cafe reviews", "Service ratings"],
    Shopping: ["Top products", "Store experience", "Value for money"],
    Travel: ["Hotels", "Destinations", "Adventure tips"],
    Technology: ["Apps", "Gadgets", "Software tools"],
    Entertainment: ["Movies", "Shows", "Games"],
    Fitness: ["Gyms", "Programs", "Wellness services"]
};

function initCategoryCards() {
    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", event => {
            if (event.target.closest(".open-category-btn")) return;
            toggleCategoryCard(card);
        });
    });

    document.addEventListener("click", event => {
        const button = event.target.closest(".open-category-btn");

        if (!button) return;

        event.stopPropagation();

        const card = button.closest(".category-card");
        const categoryName = card.querySelector(".category-name").textContent.trim();

        localStorage.setItem("rateMe_selectedCategory", categoryName);

        window.location.href = `category-detail.html?category=${encodeURIComponent(categoryName)}`;
    });
}

function toggleCategoryCard(card) {
    const categoryName = card.querySelector(".category-name").textContent.trim();
    const details = categoryDetails[categoryName] || [
        "Top reviews",
        "New activity",
        "Community picks"
    ];

    document.querySelectorAll(".category-card.is-expanded").forEach(openCard => {
        if (openCard !== card) {
            openCard.classList.remove("is-expanded");

            const oldDetails = openCard.querySelector(".category-expanded-details");
            if (oldDetails) oldDetails.remove();
        }
    });

    const existingDetails = card.querySelector(".category-expanded-details");

    if (existingDetails) {
        existingDetails.remove();
        card.classList.remove("is-expanded");
        return;
    }

    const detailsBox = document.createElement("div");
    detailsBox.className = "category-expanded-details";

    detailsBox.innerHTML = `
        <h4>What you can explore</h4>

        <div class="category-detail-grid">
            ${details.map(item => `
                <div class="category-detail-item">
                    <strong>${item}</strong>
                    <span>Open reviews, ratings, and saved activity for this area.</span>
                </div>
            `).join("")}
        </div>

        <a href="categorie-detail.html"><button class="open-category-btn" type="button">
            Open ${categoryName}
        </button></a>
    `;

    card.querySelector(".category-card-content").appendChild(detailsBox);
    card.classList.add("is-expanded");
}

// STAT CARDS

function initStatCards() {
    document.querySelectorAll(".stat-card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-8px)";
            card.style.boxShadow = "0 20px 50px rgba(99, 102, 241, 0.2)";
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.style.boxShadow = "";
        });
    });
}

// REVEAL ON SCROLL

function initRevealOnScroll() {
    const elements = document.querySelectorAll(".category-card, .stat-card");

    if (elements.length === 0) return;

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

    elements.forEach(element => {
        observer.observe(element);
    });
}

// MODALS

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
    if (overlay) overlay.classList.remove("active");
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

// USER LOGIN / LOGOUT

function initUserAuth() {
    const loginForm = document.getElementById("login-form");
    const logoutBtn = document.getElementById("logout-btn");

    updateLoginUI();

    if (loginForm) {
        loginForm.addEventListener("submit", event => {
            event.preventDefault();

            const nameInput = document.getElementById("user-name");
            const emailInput = document.getElementById("user-email");
            const passwordInput = document.getElementById("user-password");

            const name = nameInput ? nameInput.value.trim() : "";
            const email = emailInput ? emailInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value.trim() : "";

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
        if (navLoginBtn) navLoginBtn.textContent = `👤 ${user.name}`;
    } else {
        if (loginContainer) loginContainer.style.display = "block";
        if (loggedInfo) loggedInfo.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Login";
    }
}

// NOTIFICATION

function showNotification(message) {
    let toast = document.getElementById("notification-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "notification-toast";
        toast.className = "notification-toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// GLOBAL FUNCTIONS

window.openModal = openModal;
window.closeAllModals = closeAllModals;