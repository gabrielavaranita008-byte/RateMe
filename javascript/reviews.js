document.addEventListener("DOMContentLoaded", () => {
    initModals();
    initUserAuth();
    initReviewsSearch();
    initFilterButtons();
    initReviewCards();
    initLoadMore();
    addSavedUserReviews();
    updateReviewCount();
});

// MODAL SYSTEM

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

// USER AUTH

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
        if (navLoginBtn) navLoginBtn.textContent = `👤 ${user.name}`;
    } else {
        if (loginContainer) loginContainer.style.display = "block";
        if (loggedInfo) loggedInfo.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Login";
    }
}

// REVIEWS SEARCH + FILTER

let activeFilter = "All";

function getReviewItems() {
    return Array.from(document.querySelectorAll(".review-item"));
}

function getReviewData(item) {
    return {
        title: item.querySelector(".review-item-title")?.textContent.trim() || "",
        category: item.querySelector(".review-item-category")?.textContent.trim() || "",
        text: item.querySelector(".review-item-text")?.textContent.trim() || "",
        author: item.querySelector(".review-item-author strong")?.textContent.trim() || "",
        date: item.querySelector(".review-item-author small")?.textContent.trim() || "",
        rating: item.querySelector(".review-item-rating span:last-child")?.textContent.trim() || "0"
    };
}

function initReviewsSearch() {
    const searchInput = document.getElementById("review-search");

    if (!searchInput) return;

    searchInput.addEventListener("input", applyReviewsView);

    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get("search") || localStorage.getItem("rateMe_reviewSearch") || "";

    if (initialSearch) {
        searchInput.value = initialSearch;
        localStorage.removeItem("rateMe_reviewSearch");
        applyReviewsView();
    }
}

function initFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            activeFilter = button.textContent.trim();

            applyReviewsView();
        });
    });
}

function matchesFilter(data) {
    const rating = Number(data.rating);

    if (activeFilter === "All") return true;
    if (activeFilter === "Latest") return data.date.includes("day") || data.date.includes("Today");
    if (activeFilter === "Top Rated") return rating >= 4.8;
    if (activeFilter === "Most Popular") return ["Technology", "Shopping", "Travel & Adventure"].includes(data.category);
    if (activeFilter === "This Week") return !data.date.includes("weeks") && !data.date.includes("month");

    return true;
}

function applyReviewsView() {
    const searchInput = document.getElementById("review-search");
    const emptyReviews = document.getElementById("empty-reviews");

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    let visibleCount = 0;

    getReviewItems().forEach(item => {
        const data = getReviewData(item);

        const searchText = `
            ${data.title}
            ${data.category}
            ${data.text}
            ${data.author}
        `.toLowerCase();

        const isVisible = matchesFilter(data) && searchText.includes(query);

        item.style.display = isVisible ? "" : "none";

        if (isVisible) visibleCount++;
    });

    if (emptyReviews) {
        emptyReviews.style.display = visibleCount ? "none" : "block";
    }

    updateReviewCount();
}

function updateReviewCount() {
    const reviewCount = document.getElementById("review-count");

    if (!reviewCount) return;

    const visibleItems = getReviewItems().filter(item => item.style.display !== "none");

    reviewCount.textContent = `${visibleItems.length} review${visibleItems.length === 1 ? "" : "s"} found`;
}

// REVIEW CARDS

function initReviewCards() {
    getReviewItems().forEach(card => {
        wireReviewCard(card);
    });
}

function wireReviewCard(card) {
    card.addEventListener("click", () => {
        const data = getReviewData(card);
        const avatar = card.querySelector(".review-item-author img")?.src || "";

        localStorage.setItem("rateMe_selectedReview", JSON.stringify({
            ...data,
            avatar
        }));

        window.location.href = `review-detail.html?title=${encodeURIComponent(data.title)}`;
    });
}

// LOAD MORE

function initLoadMore() {
    const loadMoreBtn = document.querySelector(".load-more-btn");
    const reviewGrid = document.querySelector(".all-reviews-grid");

    if (!loadMoreBtn || !reviewGrid) return;

    loadMoreBtn.addEventListener("click", () => {
        const extraReviews = [
            {
                title: "Hidden Gem Cafe",
                category: "Dining",
                text: "Cozy place, excellent desserts, and a team that pays attention to small details.",
                author: "Nora Miles",
                date: "Today",
                rating: "4.9"
            },
            {
                title: "Smart Planner App",
                category: "Technology",
                text: "A clean app that helped me organize projects and daily habits.",
                author: "Leo Park",
                date: "Today",
                rating: "4.5"
            },
            {
                title: "Weekend Mountain Stay",
                category: "Travel & Adventure",
                text: "Beautiful views, quiet rooms, and very friendly hosts.",
                author: "Irina Costa",
                date: "Yesterday",
                rating: "5.0"
            }
        ];

        extraReviews.forEach(review => {
            const card = createReviewCard(review);
            reviewGrid.appendChild(card);
            wireReviewCard(card);
        });

        loadMoreBtn.textContent = "All Reviews Loaded";
        loadMoreBtn.disabled = true;

        applyReviewsView();
    });
}

function createReviewCard(review) {
    const card = document.createElement("div");
    card.className = "review-item";

    card.innerHTML = `
        <div class="review-item-header">
            <h3 class="review-item-title">${review.title}</h3>
            <p class="review-item-category">${review.category}</p>
        </div>

        <div class="review-item-body">
            <div class="review-item-rating">
                <span class="review-stars">${createStars(review.rating)}</span>
                <span>${review.rating}</span>
            </div>

            <p class="review-item-text">${review.text}</p>

            <div class="review-item-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.author)}" alt="Author">
                <div>
                    <strong>${review.author}</strong>
                    <small>${review.date}</small>
                </div>
            </div>
        </div>
    `;

    return card;
}

function createStars(rating) {
    const value = Math.round(Number(rating));
    return "★".repeat(value) + "☆".repeat(5 - value);
}

// SAVED USER REVIEWS

function addSavedUserReviews() {
    const reviewGrid = document.querySelector(".all-reviews-grid");

    if (!reviewGrid) return;

    const savedReviews = JSON.parse(localStorage.getItem("rateMe_reviews") || "[]");

    savedReviews.slice().reverse().forEach(review => {
        const title = review.subject || "Saved Review";

        const exists = Array.from(document.querySelectorAll(".review-item-title"))
            .some(item => item.textContent.trim() === title);

        if (exists) return;

        const card = createReviewCard({
            title,
            category: review.category || "User Review",
            text: review.reviewText || review.review || "Saved rating from RateMe.",
            author: review.userName || "RateMe User",
            date: "Today",
            rating: review.rating || "5"
        });

        reviewGrid.prepend(card);
        wireReviewCard(card);
    });
}

// ===============================
// NOTIFICATIONS
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

// GLOBAL FUNCTIONS

window.openModal = openModal;
window.closeAllModals = closeAllModals;