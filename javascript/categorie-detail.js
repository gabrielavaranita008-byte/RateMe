let restaurantsData = [];

const SHEET_URL =
"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-4i625FxZ-XIlllAOlxdDgVtNwdHqhd46e_xLgUrcIlPrMuBTj4AlL5uiFy9c2rl18slDRBl3RRx7/pub?gid=0&single=true&output=csv";

document.addEventListener("DOMContentLoaded", () => {
    hideRestaurantReviewsSection();

    initTabs();
    initLoadMore();
    initModals();
    initUserAuth();
    initReviewForm();
    initGuidesLoadMore();
    initGuideModals();
    loadRestaurantsReviews();
    initRevealOnScroll();
});

function hideRestaurantReviewsSection() {
    const reviewsSection = document.getElementById("restaurant-reviews-section");

    if (reviewsSection) {
        reviewsSection.style.display = "none";
    }
}

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

async function loadRestaurantsReviews() {
    try {
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error("Google Sheets link is not accessible.");
        }

        const csv = await response.text();
        const rows = parseCSV(csv);

        restaurantsData = [];

        rows.slice(1).forEach(cols => {
            const restaurant = {
                id: cleanText(cols[0]),
                name: cleanText(cols[1]),
                placeId: cleanText(cols[3]),
                rating: cleanText(cols[4]),
                reviewsCount: cleanText(cols[5]),
                address: cleanText(cols[6]),
                review1: cleanText(cols[7]),
                review2: cleanText(cols[8]),
                review3: cleanText(cols[9])
            };

            if (restaurant.name) {
                restaurantsData.push(restaurant);
            }
        });

        initReviewButtons();
        renderRecentReviews();
        updateRestaurantCardsFromSheet();

    } catch (error) {
        console.error("Google Sheets error:", error);
        showNotification("Could not load reviews from Google Sheets.");
        initReviewButtons();
    }
}

function updateRestaurantCardsFromSheet() {
    const cards = document.querySelectorAll(".product-card");

    cards.forEach(card => {
        const title = card.querySelector("h3");
        const ratingElement = card.querySelector(".product-rating");

        if (!title || !ratingElement) return;

        const restaurantName = title.textContent.trim();

        const restaurant = restaurantsData.find(item =>
            normalizeName(item.name) === normalizeName(restaurantName)
        );

        if (!restaurant) return;

        ratingElement.textContent =
            `★★★★★ (${restaurant.rating || "No rating"} / 5 • ${restaurant.reviewsCount || "0"} reviews)`;
    });
}

function renderRecentReviews() {
    const recentPane = document.getElementById("recent-reviews");

    if (!recentPane) return;

    let recentReviewsContainer = recentPane.querySelector(".reviews-list");

    if (!recentReviewsContainer) {
        recentReviewsContainer = document.createElement("div");
        recentReviewsContainer.classList.add("reviews-list");
        recentPane.appendChild(recentReviewsContainer);
    }

    recentReviewsContainer.innerHTML = "";

    restaurantsData.forEach(restaurant => {
        const reviews = [
            restaurant.review1,
            restaurant.review2,
            restaurant.review3
        ].filter(review => review && review.trim() !== "");

        reviews.forEach((review, index) => {
            const reviewCard = document.createElement("div");
            reviewCard.classList.add("review-item", "visible");

            reviewCard.innerHTML = `
                <div class="review-avatar">
                    <img src="${getReviewAvatar(index)}" alt="User">
                </div>

                <div class="review-content">
                    <h4>${restaurant.name}</h4>

                    <p class="review-author">
                        ${getReviewTitle(index)} • Google Review
                    </p>

                    <div class="rating">
                        ★★★★★ ${restaurant.rating || "5.0"}
                    </div>

                    <p class="review-body">
                        ${review}
                    </p>

                    <div class="review-footer">
                        <button class="btn-helpful" onclick="markHelpful(this)">
                            👍 Helpful <span>0</span>
                        </button>

                        <button class="btn-reply" onclick="replyToReview('${escapeText(restaurant.name)}')">
                            💬 Reply
                        </button>
                    </div>
                </div>
            `;

            recentReviewsContainer.appendChild(reviewCard);
        });
    });

    initRecentReviewsLoadMore();
}

function initReviewButtons() {
    document.querySelectorAll(".btn-review").forEach(button => {
        button.onclick = () => {
            const card = button.closest(".product-card");

            if (!card) {
                showNotification("Restaurant card not found.");
                return;
            }

            const title = card.querySelector("h3");

            if (!title) {
                showNotification("Restaurant name not found.");
                return;
            }

            const restaurantName = title.textContent.trim();

            const restaurant = restaurantsData.find(item =>
                normalizeName(item.name) === normalizeName(restaurantName)
            );

            if (!restaurant) {
                showNotification("Reviews not found for this restaurant.");
                return;
            }

            showGoogleReviews(restaurant);
        };
    });
}

function showGoogleReviews(restaurant) {
    const section = document.getElementById("restaurant-reviews-section");
    const name = document.getElementById("restaurant-name");
    const rating = document.getElementById("restaurant-rating");
    const address = document.getElementById("restaurant-address");
    const grid = document.getElementById("restaurant-reviews-grid");

    const tabs = document.querySelector(".category-tabs");
    const tabContent = document.querySelector(".tab-content");
    const backBtn = document.querySelector(".back-btn");

    if (!section || !name || !rating || !address || !grid) {
        showNotification("Reviews section is missing in HTML.");
        return;
    }

    name.textContent = restaurant.name;

    rating.textContent =
        `⭐ ${restaurant.rating || "No rating"} / 5 • ${restaurant.reviewsCount || "0"} Google reviews`;

    address.textContent =
        `📍 ${restaurant.address || "Address unavailable"}`;

    const reviews = [
        restaurant.review1,
        restaurant.review2,
        restaurant.review3
    ].filter(review => review && review.trim() !== "");

    if (reviews.length === 0) {
        grid.innerHTML = `
            <div class="insight-card review-user-card">
                <div class="review-user-header">
                    <img src="${getReviewAvatar(0)}" alt="User" class="review-user-avatar">

                    <div>
                        <h4>No reviews available</h4>
                        <p class="review-author">Google Reviews</p>
                        <div class="rating">★★★★★</div>
                    </div>
                </div>

                <p class="review-body">
                    There are no Google reviews saved for this restaurant yet.
                </p>
            </div>
        `;
    } else {
        grid.innerHTML = reviews.map((review, index) => `
            <div class="insight-card review-user-card">
                <div class="review-user-header">
                    <img src="${getReviewAvatar(index)}" alt="User" class="review-user-avatar">

                    <div>
                        <h4>${getReviewTitle(index)}</h4>
                        <p class="review-author">By Google User • Recent review</p>
                        <div class="rating">★★★★★ ${restaurant.rating || "5.0"}</div>
                    </div>
                </div>

                <p class="review-body">
                    ${review}
                </p>

                <div class="review-footer">
                    <button class="btn-helpful" onclick="markHelpful(this)">
                        👍 Helpful <span>0</span>
                    </button>

                    <button class="btn-reply" onclick="replyToReview('${escapeText(restaurant.name)}')">
                        💬 Reply
                    </button>
                </div>
            </div>
        `).join("");
    }

    if (tabs) tabs.style.display = "none";
    if (tabContent) tabContent.style.display = "none";

    section.style.display = "block";

    if (backBtn) {
        backBtn.textContent = "← Back to Restaurants";
        backBtn.removeAttribute("href");

        backBtn.onclick = function (event) {
            event.preventDefault();

            section.style.display = "none";

            if (tabs) tabs.style.display = "";
            if (tabContent) tabContent.style.display = "";

            backBtn.textContent = "← Back to Categories";
            backBtn.onclick = function () {
                window.location.href = "categories.html";
            };

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        };
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function getReviewTitle(index) {
    const titles = [
        "Amazing Dining Experience!",
        "Great Food and Atmosphere!",
        "Excellent Service!"
    ];

    return titles[index] || "Restaurant Review";
}

function getReviewAvatar(index) {
    const avatars = [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop"
    ];

    return avatars[index] || avatars[0];
}

function markHelpful(button) {
    const counter = button.querySelector("span");

    if (!counter) return;

    let count = Number(counter.textContent);

    count++;
    counter.textContent = count;

    button.disabled = true;
    button.classList.add("liked");
}

function replyToReview(restaurantName) {
    const user = getCurrentUser();

    if (!user) {
        showNotification("Please login before replying.");
        openModal("login-modal");
        return;
    }

    const titleInput = document.getElementById("category-review-title");
    const textInput = document.getElementById("category-review-text");

    if (titleInput) titleInput.value = restaurantName;
    if (textInput) textInput.focus();

    showNotification("You can write your reply in the review form below.");
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

function initRecentReviewsLoadMore() {
    const reviews = document.querySelectorAll("#recent-reviews .review-item");
    const button = document.getElementById("load-more-reviews-btn");

    if (!button || reviews.length === 0) return;

    let visible = 3;

    function updateReviews() {
        reviews.forEach((review, index) => {
            review.style.display = index < visible ? "flex" : "none";
        });

        if (visible >= reviews.length) {
            button.style.display = "none";
        } else {
            button.style.display = "inline-block";
        }
    }

    updateReviews();

    button.onclick = () => {
        visible += 3;
        updateReviews();
    };
}

function initGuidesLoadMore() {
    const guides = document.querySelectorAll("#guides .guide-card");
    const button = document.getElementById("load-more-guides-btn");

    if (!button || guides.length === 0) return;

    let visible = 2;

    function updateGuides() {
        guides.forEach((guide, index) => {
            guide.style.display = index < visible ? "flex" : "none";
        });

        if (visible >= guides.length) {
            button.style.display = "none";
        } else {
            button.style.display = "inline-block";
        }
    }

    updateGuides();

    button.onclick = () => {
        visible += 2;
        updateGuides();
    };
}

function initGuideModals() {
    const guideButtons = document.querySelectorAll(".guide-btn");

    const modal = document.getElementById("guide-modal");
    const modalTitle = document.getElementById("guide-modal-title");
    const modalText = document.getElementById("guide-modal-text");
    const closeBtn = document.getElementById("close-guide-modal");

    if (!modal || !modalTitle || !modalText || !closeBtn) return;

    guideButtons.forEach(button => {
        button.addEventListener("click", () => {
            const title = button.dataset.title;
            const content = button.dataset.content;

            button.classList.add("clicked");

            setTimeout(() => {
                button.classList.remove("clicked");
            }, 250);

            modalTitle.textContent = title;
            modalText.textContent = content;

            modal.classList.add("active");
        });
    });

    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });
}

function parseCSV(csv) {
    const rows = [];
    let currentRow = [];
    let currentValue = "";
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i];
        const nextChar = csv[i + 1];

        if (char === '"' && insideQuotes && nextChar === '"') {
            currentValue += '"';
            i++;
        } else if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === "," && !insideQuotes) {
            currentRow.push(currentValue);
            currentValue = "";
        } else if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (currentValue || currentRow.length > 0) {
                currentRow.push(currentValue);
                rows.push(currentRow);
                currentRow = [];
                currentValue = "";
            }
        } else {
            currentValue += char;
        }
    }

    if (currentValue || currentRow.length > 0) {
        currentRow.push(currentValue);
        rows.push(currentRow);
    }

    return rows;
}

function cleanText(text) {
    return text ? text.trim() : "";
}

function normalizeName(name) {
    return name
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/'/g, "")
        .replace(/’/g, "")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeText(text) {
    return String(text)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
}

window.markHelpful = markHelpful;
window.replyToReview = replyToReview;
window.openModal = openModal;
window.closeAllModals = closeAllModals;