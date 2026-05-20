document.addEventListener("DOMContentLoaded", () => {
    ensureEditProfileModalExists();
    initLoginSystem();
    initProfileSystem();
    initRevealOnScroll();
});

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

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("rateMe_user") || "null");
}

function saveCurrentUser(user) {
    localStorage.setItem("rateMe_user", JSON.stringify(user));
}

function initLoginSystem() {
    const navLoginBtn = document.getElementById("nav-login-btn");
    const loginForm = document.getElementById("login-form");

    if (navLoginBtn) {
        navLoginBtn.addEventListener("click", () => {
            openModal("login-modal");
        });
    }

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

            const user = {
                name,
                email,
                bio: "Passionate about discovering and sharing the best experiences.",
                title: "Reviewer",
                joinedDate: new Date().toISOString()
            };

            saveCurrentUser(user);
            closeAllModals();
            loadUserProfile();
            showNotification("Login saved successfully.");
        });
    }

    document.addEventListener("click", event => {
        if (event.target.closest(".modal-close")) {
            closeAllModals();
        }

        if (event.target.id === "modal-overlay") {
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
}

function initProfileSystem() {
    loadUserProfile();

    document.addEventListener("click", event => {
        const editBtn = event.target.closest(".edit-profile-btn");

        if (editBtn) {
            event.preventDefault();
            openEditProfileModal();
        }
    });

    const editForm = document.getElementById("edit-profile-form");

    if (editForm) {
        editForm.addEventListener("submit", event => {
            event.preventDefault();

            const user = getCurrentUser() || {};

            user.name = document.getElementById("edit-profile-name").value.trim();
            user.email = document.getElementById("edit-profile-email").value.trim();
            user.bio = document.getElementById("edit-profile-bio").value.trim();
            user.title = document.getElementById("edit-profile-title").value.trim();

            if (!user.name || !user.email) {
                showNotification("Please complete all required fields.");
                return;
            }

            if (!user.joinedDate) {
                user.joinedDate = new Date().toISOString();
            }

            saveCurrentUser(user);
            closeAllModals();
            loadUserProfile();
            showNotification("Profile updated successfully.");
        });
    }
}

function loadUserProfile() {
    const user = getCurrentUser();
    const reviews = JSON.parse(localStorage.getItem("rateMe_reviews") || "[]");

    const header = document.querySelector(".profile-header");
    const profileContent = document.querySelector(".profile-content");
    const reviewsSection = document.getElementById("profile-reviews-section");
    const navLoginBtn = document.getElementById("nav-login-btn");

    if (!user) {
        if (profileContent) profileContent.style.display = "none";
        if (reviewsSection) reviewsSection.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Conectare";

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

        refreshRevealOnScroll();
        return;
    }

    if (profileContent) profileContent.style.display = "";
    if (reviewsSection) reviewsSection.style.display = "";
    if (navLoginBtn) navLoginBtn.textContent = user.name;

    const userReviews = reviews.filter(review =>
        review.userName === user.name || review.user === user.name
    );

    const averageRating = userReviews.length
        ? (userReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / userReviews.length).toFixed(1)
        : "0";

    if (header) {
        header.innerHTML = `
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}" 
                 alt="Profile" 
                 class="profile-avatar">

            <h1 class="profile-name">${user.name}</h1>

            <p class="profile-username">
                @${user.name.toLowerCase().replace(/\s/g, "")}
            </p>

            <p style="color: var(--text-light); margin: 10px 0 0 0;">
                ${user.bio || "RateMe user"}
            </p>

            <p style="color: var(--primary); margin-top: 8px; font-weight: 600;">
                ${user.title || "Reviewer"}
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

            <button type="button" class="edit-profile-btn">
                <i class="fas fa-edit"></i> Edit Profile
            </button>

            <button type="button" class="logout-profile-btn">
                Logout
            </button>
        `;
    }

    refreshRevealOnScroll();
}

function openEditProfileModal() {
    const user = getCurrentUser();

    if (!user) {
        openModal("login-modal");
        return;
    }

    document.getElementById("edit-profile-name").value = user.name || "";
    document.getElementById("edit-profile-email").value = user.email || "";
    document.getElementById("edit-profile-bio").value = user.bio || "";
    document.getElementById("edit-profile-title").value = user.title || "";

    openModal("edit-profile-modal");
}

function ensureEditProfileModalExists() {
    if (document.getElementById("edit-profile-modal")) return;

    document.body.insertAdjacentHTML("beforeend", `
        <div id="edit-profile-modal" class="modal">
            <div class="modal-content">
                <button type="button" class="modal-close">&times;</button>

                <h2>Edit Profile</h2>

                <form id="edit-profile-form">
                    <div class="form-group">
                        <label>Full Name:</label>
                        <input type="text" id="edit-profile-name" placeholder="Enter your name..." required>
                    </div>

                    <div class="form-group">
                        <label>Email:</label>
                        <input type="email" id="edit-profile-email" placeholder="Enter your email..." required>
                    </div>

                    <div class="form-group">
                        <label>Bio:</label>
                        <textarea id="edit-profile-bio" placeholder="Tell us about yourself..." rows="4"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Profession/Title:</label>
                        <input type="text" id="edit-profile-title" placeholder="e.g., Tech Enthusiast..." required>
                    </div>

                    <button type="submit" class="modal-btn">Save Changes</button>
                </form>
            </div>
        </div>
    `);
}

function initRevealOnScroll() {
    refreshRevealOnScroll();
}

function refreshRevealOnScroll() {
    const elements = document.querySelectorAll(
        ".profile-header, .profile-section, .profile-review"
    );

    if (!elements.length) return;

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
        element.classList.remove("visible");
        observer.observe(element);
    });
}

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

window.openModal = openModal;
window.closeAllModals = closeAllModals;
window.openEditProfileModal = openEditProfileModal;