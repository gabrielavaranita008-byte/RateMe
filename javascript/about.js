// ===============================
// RateMe - about.js
// Fără GSAP
// ===============================

document.addEventListener("DOMContentLoaded", () => {
    initRevealOnScroll();
    initValueCards();
    initTeamMembers();
    initSocialLinks();
    initModals();
    initUserAuth();
});

// ===============================
// REVEAL ON SCROLL
// ===============================

function initRevealOnScroll() {
    const elements = document.querySelectorAll(
        ".about-hero, .about-grid, .value-card, .team-member"
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

    elements.forEach(element => {
        observer.observe(element);
    });
}

// ===============================
// VALUE CARDS
// ===============================

function initValueCards() {
    document.querySelectorAll(".value-card").forEach(card => {

        card.addEventListener("mouseenter", () => {
            card.style.transform = "translateY(-10px)";
            card.style.boxShadow = "0 20px 50px rgba(139, 92, 246, 0.3)";

            const icon = card.querySelector(".value-icon");

            if (icon) {
                icon.style.transform = "scale(1.15) rotate(10deg)";
            }
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "";
            card.style.boxShadow = "";

            const icon = card.querySelector(".value-icon");

            if (icon) {
                icon.style.transform = "";
            }
        });

    });
}

// ===============================
// TEAM MEMBERS
// ===============================

function initTeamMembers() {
    document.querySelectorAll(".team-member").forEach(member => {

        member.addEventListener("mouseenter", () => {
            member.style.transform = "translateY(-10px)";
            member.style.boxShadow = "0 30px 70px rgba(236, 72, 153, 0.3)";

            const image = member.querySelector(".team-member-image img");

            if (image) {
                image.style.transform = "scale(1.08)";
            }
        });

        member.addEventListener("mouseleave", () => {
            member.style.transform = "";
            member.style.boxShadow = "";

            const image = member.querySelector(".team-member-image img");

            if (image) {
                image.style.transform = "";
            }
        });

        member.addEventListener("click", () => {
            const memberName = member.querySelector("h4")?.textContent || "Team Member";

            showNotification(`Meet ${memberName}!`);
        });

    });
}

// ===============================
// SOCIAL LINKS
// ===============================

function initSocialLinks() {
    document.querySelectorAll(".team-member-socials a, .social-links a")
        .forEach(link => {

            link.addEventListener("mouseenter", () => {
                link.style.transform = "scale(1.2)";
            });

            link.addEventListener("mouseleave", () => {
                link.style.transform = "";
            });

            link.addEventListener("click", event => {
                event.preventDefault();

                showNotification("Opening social profile...");
            });

        });
}

// ===============================
// MODALS
// ===============================

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

// ===============================
// USER AUTH
// ===============================

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

        if (navLoginBtn) {
            navLoginBtn.textContent = `👤 ${user.name}`;
        }

    } else {

        if (loginContainer) loginContainer.style.display = "block";
        if (loggedInfo) loggedInfo.style.display = "none";

        if (navLoginBtn) {
            navLoginBtn.textContent = "Login";
        }

    }
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
// GLOBAL FUNCTIONS
// ===============================

window.openModal = openModal;
window.closeAllModals = closeAllModals;