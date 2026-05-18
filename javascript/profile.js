// ===============================
// RateMe - profile.js
// Fără GSAP
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    createLoginModal();
    initLoginSystem();
    loadUserProfile();
    initRevealOnScroll();
    initProfileInteractions();
});

// ===============================
// LOGIN MODAL
// ===============================

function createLoginModal() {
    if (document.getElementById("login-modal")) return;

    document.body.insertAdjacentHTML("beforeend", `
        <div id="modal-overlay" class="modal-overlay"></div>

        <div id="login-modal" class="modal">
            <div class="modal-content">
                <button type="button" class="modal-close">&times;</button>

                <h2>Login / Register</h2>

                <form id="login-form">
                    <div id="login-form-container">
                        <div class="form-group">
                            <label>Name:</label>
                            <input type="text" id="user-name" placeholder="Enter your name..." required>
                        </div>

                        <div class="form-group">
                            <label>Email:</label>
                            <input type="email" id="user-email" placeholder="Enter your email..." required>
                        </div>

                        <div class="form-group">
                            <label>Password:</label>
                            <input type="password" id="user-password" placeholder="Create a password..." required>
                        </div>

                        <button type="submit" class="modal-btn">Save Login</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="notification-toast" class="notification-toast"></div>
    `);
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
    if (overlay) overlay.classList.remove("active");
}

function initLoginSystem() {
    const navLoginBtn = document.getElementById("nav-login-btn");
    const loginForm = document.getElementById("login-form");
    const overlay = document.getElementById("modal-overlay");

    if (navLoginBtn) {
        navLoginBtn.addEventListener("click", () => {
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

        if (event.target.closest(".go-login-btn")) {
            openModal("login-modal");
        }

        if (event.target.closest(".logout-profile-btn")) {
            localStorage.removeItem("rateMe_user");
            loadUserProfile();
            showNotification("You have been logged out.");
        }
    });

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

            closeAllModals();
            loadUserProfile();
            initRevealOnScroll();

            showNotification(`Welcome, ${name}!`);
        });
    }
}

// ===============================
// PROFILE
// ===============================

function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem("rateMe_user") || "null");
    const reviews = JSON.parse(localStorage.getItem("rateMe_reviews") || "[]");

    const header = document.querySelector(".profile-header");
    const profileContent = document.querySelector(".profile-content");
    const reviewsSection = document.getElementById("profile-reviews-section");
    const navLoginBtn = document.getElementById("nav-login-btn");

    if (!user) {
        if (profileContent) profileContent.style.display = "none";
        if (reviewsSection) reviewsSection.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Login";

        if (header) {
            header.innerHTML = `
                <div class="profile-login-empty">
                    <h2>
                        <i class="fas fa-user"></i>
                        Welcome to Your Profile
                    </h2>

                    <p>Please login to view and manage your reviews</p>

                    <button type="button" class="go-login-btn">
                        Go to Login
                    </button>
                </div>
            `;
        }

        return;
    }

    if (profileContent) profileContent.style.display = "";
    if (reviewsSection) reviewsSection.style.display = "";
    if (navLoginBtn) navLoginBtn.textContent = `${user.name}`;

    const userReviews = reviews.filter(review =>
        review.userName === user.name || review.user === user.name
    );

    const averageRating = userReviews.length
        ? (userReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / userReviews.length).toFixed(1)
        : "0";

    if (header) {
        header.innerHTML = `
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}" alt="Profile" class="profile-avatar">

            <h1 class="profile-name">${user.name}</h1>
            <p class="profile-username">@${user.name.toLowerCase().replace(/\s/g, "")}</p>

            <p style="color: var(--text-light); margin: 10px 0 0 0;">
                Joined on ${new Date(user.joinedDate).toLocaleDateString()}
            </p>

            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="profile-stat-value">${userReviews.length}</span>
                    <span class="profile-stat-label">Reviews</span>
                </div>

                <div class="profile-stat">
                    <span class="profile-stat-value">${Math.max(userReviews.length * 24, 1)}</span>
                    <span class="profile-stat-label">Followers</span>
                </div>

                <div class="profile-stat">
                    <span class="profile-stat-value">${averageRating}★</span>
                    <span class="profile-stat-label">Avg Rating</span>
                </div>
            </div>

            <button class="edit-profile-btn">
                <i class="fas fa-edit"></i> Edit Profile
            </button>

            <button class="logout-profile-btn">
                Logout
            </button>
        `;
    }

    if (reviewsSection) {
        let reviewsHTML = `
            <h3 class="profile-section-title">
                <i class="fas fa-star"></i> My Reviews
            </h3>
        `;

        if (userReviews.length > 0) {
            userReviews.slice(0, 5).forEach(review => {
                const title = review.subject || "Quick rating";
                const body = review.reviewText || review.review || "Saved review from RateMe.";
                const date = review.timestamp || review.date || new Date().toISOString();

                reviewsHTML += `
                    <div class="profile-review">
                        <h4 class="profile-review-title">
                            ${"⭐".repeat(Number(review.rating || 0))} ${title}
                        </h4>

                        <p class="profile-review-text">
                            ${body.substring(0, 140)}${body.length > 140 ? "..." : ""}
                        </p>

                        <div class="profile-review-date">
                            ${new Date(date).toLocaleDateString()}
                        </div>
                    </div>
                `;
            });
        } else {
            reviewsHTML += `
                <div class="profile-review">
                    <h4 class="profile-review-title">No reviews yet</h4>
                    <p class="profile-review-text">
                        Your saved reviews will appear here after you submit them.
                    </p>
                </div>
            `;
        }

        reviewsSection.innerHTML = reviewsHTML;
    }
}

// ===============================
// REVEAL ON SCROLL
// ===============================

function initRevealOnScroll() {
    const elements = document.querySelectorAll(
        ".profile-header, .profile-section, .profile-review"
    );

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

// ===============================
// INTERACTIONS
// ===============================

function initProfileInteractions() {
    document.addEventListener("click", event => {
        const editBtn = event.target.closest(".edit-profile-btn");
        const review = event.target.closest(".profile-review");

        if (editBtn) {
            showNotification("Edit Profile mode activated!");
        }

        if (review) {
            const title = review.querySelector(".profile-review-title")?.textContent || "Review";
            showNotification(`Viewing: ${title.substring(0, 30)}...`);
        }
    });
}

// ===============================
// NOTIFICATION
// ===============================

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

// ===============================
// GLOBAL
// ===============================

window.openModal = openModal;
window.closeAllModals = closeAllModals;