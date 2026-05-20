const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-4i625FxZ-XIlllAOlxdDgVtNwdHqhd46e_xLgUrcIlPrMuBTj4AlL5uiFy9c2rl18slDRBl3RRx7/pub?gid=0&single=true&output=csv";

let googleReviews = [];
let visibleReviews = 6;
let activeFilter = "All";

document.addEventListener("DOMContentLoaded", () => {
    initModals();
    initUserAuth();
    initReviewsSearch();
    initFilterButtons();
    initLoadMore();
    loadGoogleReviews();
});

/* MODALS */

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

/* USER AUTH */

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
        if (navLoginBtn) navLoginBtn.textContent = user.name;
    } else {
        if (loginContainer) loginContainer.style.display = "block";
        if (loggedInfo) loggedInfo.style.display = "none";
        if (navLoginBtn) navLoginBtn.textContent = "Login";
    }
}

/* LOAD GOOGLE SHEETS REVIEWS */

async function loadGoogleReviews() {
    try {
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error("Google Sheets link is not accessible.");
        }

        const csv = await response.text();
        const rows = parseCSV(csv);

        googleReviews = [];

        rows.slice(1).forEach(cols => {
            const restaurant = {
                name: cleanText(cols[1]),
                rating: cleanText(cols[4]),
                reviewsCount: cleanText(cols[5]),
                address: cleanText(cols[6]),
                reviews: [
                    cleanText(cols[7]),
                    cleanText(cols[8]),
                    cleanText(cols[9])
                ]
            };

            restaurant.reviews.forEach((review, index) => {
                if (!review) return;

                googleReviews.push({
                    title: restaurant.name,
                    category: "Dining",
                    text: review,
                    author: getReviewAuthor(index),
                    date: "Recent review",
                    rating: restaurant.rating || "5.0",
                    reviewsCount: restaurant.reviewsCount || "0",
                    address: restaurant.address,
                    avatar: getReviewAvatar(index)
                });
            });
        });

        visibleReviews = 6;
        renderGoogleReviews();

    } catch (error) {
        console.error("Google Sheets error:", error);
        showNotification("Could not load Google reviews.");
    }
}

/* RENDER REVIEWS */

function renderGoogleReviews() {
    const grid = document.querySelector(".all-reviews-grid");

    if (!grid) return;

    grid.innerHTML = "";

    const filteredReviews = getFilteredReviews();

    filteredReviews.slice(0, visibleReviews).forEach(review => {
        const card = document.createElement("div");
        card.className = "review-card";

        card.innerHTML = `
            <div class="review-card-header">
                <img src="${review.avatar}" alt="Author" class="review-card-avatar">

                <div>
                    <h3>${getReviewTitleByAuthor(review.author)}</h3>
                    <p class="review-card-author">By Google User • Recent review</p>
                    <div class="review-card-rating">
                        ${createStars(review.rating)} <span>${review.rating}</span>
                    </div>
                </div>
            </div>

            <p class="review-card-text">${review.text}</p>

            <div class="review-card-actions">
                <button onclick="markHelpful(event, this)">👍 Helpful <span>0</span></button>
                <button onclick="replyToReview(event)">💬 Reply</button>
            </div>
        `;

        card.addEventListener("click", () => {
            localStorage.setItem("rateMe_selectedReview", JSON.stringify(review));
            window.location.href = `review-detail.html?title=${encodeURIComponent(review.title)}`;
        });

        grid.appendChild(card);
    });

    updateReviewCount(Math.min(filteredReviews.length, visibleReviews));
    updateEmptyState(filteredReviews.length);
    updateLoadMoreButton(filteredReviews.length);
}

/* SEARCH + FILTER */

function initReviewsSearch() {
    const searchInput = document.getElementById("review-search");

    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        visibleReviews = 6;
        renderGoogleReviews();
    });
}

function initFilterButtons() {
    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");
            activeFilter = button.textContent.trim();

            visibleReviews = 6;
            renderGoogleReviews();
        });
    });
}

function getFilteredReviews() {
    const searchInput = document.getElementById("review-search");
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    return googleReviews.filter(review => {
        const text = `
            ${review.title}
            ${review.category}
            ${review.text}
            ${review.author}
            ${review.address}
        `.toLowerCase();

        const matchesSearch = text.includes(query);
        const matchesSelectedFilter = matchesFilter(review);

        return matchesSearch && matchesSelectedFilter;
    });
}

function matchesFilter(review) {
    const rating = Number(String(review.rating).replace(",", "."));
    const reviewsCount = Number(String(review.reviewsCount).replace(/\D/g, ""));

    if (activeFilter === "All") {
        return true;
    }

    if (activeFilter === "Latest") {
        return true;
    }

    if (activeFilter === "Top Rated") {
        return rating >= 4.7;
    }

    if (activeFilter === "Most Popular") {
        return reviewsCount >= 4000;
    }

    if (activeFilter === "This Week") {
        return review.title === "Pegas Terrace & Restaurant" ||
               review.title === "Divus Restaurant" ||
               review.title === "Fuior";
    }

    return true;
}

/* LOAD MORE */

function initLoadMore() {
    const loadMoreBtn = document.querySelector(".load-more-btn");

    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener("click", () => {
        visibleReviews += 6;
        renderGoogleReviews();
    });
}

function updateLoadMoreButton(totalFiltered) {
    const loadMoreBtn = document.querySelector(".load-more-btn");

    if (!loadMoreBtn) return;

    if (visibleReviews >= totalFiltered) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
        loadMoreBtn.textContent = "Load More Reviews";
        loadMoreBtn.disabled = false;
    }
}

/* COUNT + EMPTY */

function updateReviewCount(total) {
    const reviewCount = document.getElementById("review-count");

    if (!reviewCount) return;

    reviewCount.textContent = `${total} review${total === 1 ? "" : "s"} found`;
}

function updateEmptyState(total) {
    const emptyReviews = document.getElementById("empty-reviews");

    if (!emptyReviews) return;

    emptyReviews.style.display = total === 0 ? "block" : "none";
}

/* HELPERS */

function createStars(rating) {
    const value = Math.round(Number(String(rating).replace(",", "."))) || 0;
    return "★".repeat(value) + "☆".repeat(5 - value);
}

function getReviewAuthor(index) {
    const authors = [
        "Alexandra",
        "Michael",
        "Sophie"
    ];

    return authors[index] || "Google User";
}

function getReviewAvatar(index) {
    const avatars = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"
    ];

    return avatars[index] || avatars[0];
}

function cleanText(text) {
    return text ? text.trim() : "";
}

function parseCSV(csv) {
    const rows = [];
    let row = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const next = csv[i + 1];

        if (char === '"' && insideQuotes && next === '"') {
            current += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            row.push(current);
            current = "";
        } else if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (current || row.length) {
                row.push(current);
                rows.push(row);
                row = [];
                current = "";
            }
        } else {
            current += char;
        }
    }

    if (current || row.length) {
        row.push(current);
        rows.push(row);
    }

    return rows;
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

function getReviewTitleByAuthor(author) {
    const titles = {
        Alexandra: "Amazing Dining Experience!",
        Michael: "Great Food and Atmosphere!",
        Sophie: "Excellent Service!"
    };

    return titles[author] || "Restaurant Review";
}

function markHelpful(event, button) {
    event.stopPropagation();

    const span = button.querySelector("span");
    let value = Number(span.textContent);

    value++;
    span.textContent = value;

    button.disabled = true;
    button.classList.add("liked");
}

function replyToReview(event) {
    event.stopPropagation();

    const user = getCurrentUser();

    if (!user) {
        showNotification("Please login before replying.");
        openModal("login-modal");
        return;
    }

    showNotification("Reply feature will be available soon.");
}

window.markHelpful = markHelpful;
window.replyToReview = replyToReview;

window.openModal = openModal;
window.closeAllModals = closeAllModals;