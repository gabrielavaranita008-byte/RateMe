// ===== USER AUTHENTICATION & STORAGE =====
class UserManager {
    constructor() {
        this.currentUser = this.loadUser();
        this.init();
    }
    
    init() {
        const loginBtn = document.getElementById('nav-login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => openModal('login-modal'));
        }

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (event) => this.handleLogin(event));
        }
        
        const submitLoginBtn = document.getElementById('login-btn');
        if (submitLoginBtn && !submitLoginBtn.closest('form')) {
            submitLoginBtn.addEventListener('click', (event) => this.handleLogin(event));
        }
        
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        this.updateLoginUI();
    }
    
    handleLogin(event) {
        if (event) event.preventDefault();

        const nameInput = document.getElementById('user-name');
        const emailInput = document.getElementById('user-email');
        const passwordInput = document.getElementById('user-password');
        if (!nameInput || !emailInput || !passwordInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!name) {
            showNotification('❌ Please enter your name');
            return;
        }
        if (!email) {
            showNotification('❌ Please enter your email');
            return;
        }
        if (!password) {
            showNotification('❌ Please enter a password');
            return;
        }
        if (!email.includes('@')) {
            showNotification('❌ Please enter a valid email');
            return;
        }
        if (password.length < 6) {
            showNotification('❌ Password must be at least 6 characters');
            return;
        }
        
        // Show loading state
        const btn = document.getElementById('login-btn');
        const originalText = btn.textContent;
        btn.textContent = '⏳ Registering...';
        btn.disabled = true;
        
        // Animate button
        gsap.to(btn, {
            duration: 0.3,
            scale: 0.95,
            ease: 'power2.out'
        });
        
        // Simulate registration delay
        setTimeout(() => {
            const existingProfile = JSON.parse(localStorage.getItem('rateMe_profile') || '{}');
            this.currentUser = {
                name,
                email,
                password,
                joinedDate: existingProfile.joinedDate || new Date().toISOString()
            };
            localStorage.setItem('rateMe_user', JSON.stringify(this.currentUser));
            localStorage.setItem('rateMe_profile', JSON.stringify({
                ...existingProfile,
                name,
                email,
                joinedDate: this.currentUser.joinedDate,
                lastLogin: new Date().toISOString()
            }));
            
            this.updateLoginUI();
            showNotification(`Welcome ${name}! Your profile is saved.`);
            
            // Animate success
            gsap.from('.user-info', {
                duration: 0.6,
                opacity: 0,
                scale: 0.8,
                ease: 'back.out'
            });
            
            // Reset button
            gsap.to(btn, {
                duration: 0.3,
                scale: 1,
                ease: 'power2.out'
            });
            btn.textContent = originalText;
            btn.disabled = false;
            
            setTimeout(() => closeModal('login-modal'), 900);
        }, 1000);
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('rateMe_user');
        this.updateLoginUI();
        closeModal('login-modal');
        showNotification('👋 You have been logged out');
    }
    
    updateLoginUI() {
        const container = document.getElementById('login-form-container');
        const info = document.getElementById('logged-in-info');
        const navBtn = document.getElementById('nav-login-btn');
        
        if (this.currentUser && container && info) {
            container.style.display = 'none';
            info.style.display = 'block';
            document.getElementById('logged-user-name').textContent = this.currentUser.name;
            document.getElementById('logged-user-email').textContent = this.currentUser.email;
            
            if (navBtn) navBtn.textContent = `👤 ${this.currentUser.name}`;
        } else if (container && info) {
            container.style.display = 'block';
            info.style.display = 'none';
            if (navBtn) navBtn.textContent = '🔐 Login';
        }
    }
    
    loadUser() {
        const user = localStorage.getItem('rateMe_user');
        return user ? JSON.parse(user) : null;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
}

const userManager = new UserManager();

// ===== PAGE TRANSITION ANIMATIONS =====
function initPageTransition() {
    const links = document.querySelectorAll('a[href$=".html"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (!href.includes('.html')) return;
            
            e.preventDefault();
            
            // Create ripple effect
            createRipple(e, link);
            
            // Fade out animation
            gsap.to('body', {
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    window.location.href = href;
                }
            });
        });
    });

    // ===== REVIEW CARD CLICK HANDLER =====
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            createRipple(e, card);

            const author = card.querySelector('.reviewer-info h4')?.textContent.trim() || 'RateMe User';
            const role = card.querySelector('.reviewer-info p')?.textContent.trim() || 'Community Reviewer';
            const text = card.querySelector('.review-text')?.textContent.replaceAll('"', '').trim() || '';
            localStorage.setItem('rateMe_selectedReview', JSON.stringify({
                title: `Review from ${author}`,
                category: role,
                text,
                author,
                date: 'Featured on Home',
                rating: '5.0',
                avatar: card.querySelector('.reviewer-avatar')?.src || ''
            }));
            
            gsap.to('body', {
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    window.location.href = 'review-detail.html';
                }
            });
        });
    });

    // ===== CATEGORY CARD CLICK HANDLER =====
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            createRipple(e, card);
            
            gsap.to('body', {
                duration: 0.5,
                opacity: 0,
                onComplete: () => {
                    window.location.href = 'category-detail.html';
                }
            });
        });
    });
    
    // Fade in on page load
    gsap.from('body', {
        duration: 0.6,
        opacity: 0,
        delay: 0.1,
    });
}

// ===== CREATE RIPPLE EFFECT =====
function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    if (!modal) return;
    
    // Show overlay
    overlay.classList.add('active');
    modal.classList.add('active');
    
    // Animate modal content
    gsap.from(modal.querySelector('.modal-content'), {
        duration: 0.5,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out',
    });
    
    // Blur background
    gsap.to('body > *:not(#modal-overlay):not(.modal):not(.notification-toast)', {
        duration: 0.4,
        filter: 'blur(5px)',
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const overlay = document.getElementById('modal-overlay');
    
    if (!modal) return;
    
    // Animate close
    gsap.to(modal.querySelector('.modal-content'), {
        duration: 0.3,
        scale: 0.8,
        opacity: 0,
        ease: 'back.in',
        onComplete: () => {
            modal.classList.remove('active');
        }
    });
    
    overlay.classList.remove('active');
    
    // Remove blur
    gsap.to('body > *:not(#modal-overlay):not(.modal):not(.notification-toast)', {
        duration: 0.4,
        filter: 'blur(0px)',
    });
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('modal-overlay').classList.remove('active');
    
    gsap.to('body > *:not(#modal-overlay):not(.modal):not(.notification-toast)', {
        duration: 0.4,
        filter: 'blur(0px)',
    });
}

// ===== SHOW NOTIFICATION =====
function showNotification(message, duration = 3000) {
    const toast = document.getElementById('notification-toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    gsap.to(toast, {
        duration: 0.4,
        opacity: 1,
    });
    
    setTimeout(() => {
        gsap.to(toast, {
            duration: 0.4,
            opacity: 0,
            onComplete: () => {
                toast.classList.remove('show');
            }
        });
    }, duration);
}

// ===== EXPANDABLE HOME CONTENT =====
const featureDetails = {
    'Visual Reviews': {
        label: 'Create visual posts',
        text: 'Add photos, a short story, a rating, and useful context so every review feels complete.',
        points: ['Image-first review layout', 'Clear rating summary', 'Saved under your profile after login']
    },
    'Trending Content': {
        label: 'Explore what is hot',
        text: 'See the reviews that are getting the most attention right now, grouped by topic and activity.',
        points: ['Top weekly reviews', 'Fast-growing categories', 'Community highlights']
    },
    'Verified Reviews': {
        label: 'Trust signals',
        text: 'Verified reviews can show who posted them, when they were saved, and what category they belong to.',
        points: ['Logged-in author', 'Review history', 'Clear review source']
    },
    'Lightning Fast': {
        label: 'Smooth interaction',
        text: 'Cards expand directly on the page with GSAP animations, so the site feels responsive and polished.',
        points: ['Animated opening panels', 'No corner-only messages', 'Mobile-friendly layout']
    },
    'Premium Quality': {
        label: 'Better experience',
        text: 'Premium tools can include richer profile stats, featured reviews, and cleaner content discovery.',
        points: ['Profile dashboard', 'Highlighted reviews', 'Polished transitions']
    },
    'Community First': {
        label: 'Built around users',
        text: 'The profile keeps the current user and their reviews together, making the site feel personal.',
        points: ['Personal saved data', 'Review count', 'Recent activity']
    }
};

function buildFeaturePanel(title) {
    const detail = featureDetails[title] || {
        label: 'More details',
        text: 'This section can be extended with richer content, examples, and actions.',
        points: ['Detailed information', 'Animated reveal', 'Clear next action']
    };

    return `
        <div class="feature-expanded-content">
            <span class="feature-kicker">${detail.label}</span>
            <p>${detail.text}</p>
            <div class="feature-points">
                ${detail.points.map(point => `<span>${point}</span>`).join('')}
            </div>
            <button class="feature-action" type="button">Open Details</button>
        </div>
    `;
}

function toggleFeatureCard(card) {
    const title = card.querySelector('h3')?.textContent.trim();
    if (!title) return;

    document.querySelectorAll('.feature-card.is-expanded').forEach(openCard => {
        if (openCard !== card) {
            const openPanel = openCard.querySelector('.feature-expanded-content');
            gsap.to(openPanel, {
                duration: 0.25,
                height: 0,
                opacity: 0,
                ease: 'power2.in',
                onComplete: () => openCard.classList.remove('is-expanded')
            });
        }
    });

    if (!card.querySelector('.feature-expanded-content')) {
        card.insertAdjacentHTML('beforeend', buildFeaturePanel(title));
    }

    const panel = card.querySelector('.feature-expanded-content');
    const isOpen = card.classList.contains('is-expanded');

    if (isOpen) {
        gsap.to(panel, {
            duration: 0.3,
            height: 0,
            opacity: 0,
            ease: 'power2.in',
            onComplete: () => card.classList.remove('is-expanded')
        });
        return;
    }

    card.classList.add('is-expanded');
    gsap.set(panel, { height: 'auto', opacity: 1 });
    const height = panel.offsetHeight;
    gsap.fromTo(panel,
        { height: 0, opacity: 0, y: -12 },
        { duration: 0.45, height, opacity: 1, y: 0, ease: 'power3.out', onComplete: () => gsap.set(panel, { height: 'auto' }) }
    );
    gsap.from(panel.querySelectorAll('.feature-points span, .feature-action'), {
        duration: 0.35,
        opacity: 0,
        y: 12,
        stagger: 0.06,
        ease: 'power2.out'
    });
}

function initHomeSearch() {
    const input = document.getElementById('home-search-input');
    const results = document.getElementById('home-search-results');
    if (!input || !results) return;

    const items = [
        ...[...document.querySelectorAll('.feature-card')].map(card => ({
            title: card.querySelector('h3')?.textContent.trim() || '',
            type: 'Feature',
            action: () => {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => toggleFeatureCard(card), 450);
            }
        })),
        ...[...document.querySelectorAll('.review-card')].map(card => ({
            title: card.querySelector('.reviewer-info h4')?.textContent.trim() || 'Review',
            type: 'Review',
            action: () => {
                const author = card.querySelector('.reviewer-info h4')?.textContent.trim() || 'RateMe User';
                const text = card.querySelector('.review-text')?.textContent.replaceAll('"', '').trim() || '';
                localStorage.setItem('rateMe_selectedReview', JSON.stringify({
                    title: `Review from ${author}`,
                    category: 'Community Review',
                    text,
                    author,
                    date: 'Featured on Home',
                    rating: '5.0',
                    avatar: card.querySelector('.reviewer-avatar')?.src || ''
                }));
                window.location.href = 'review-detail.html';
            }
        })),
        ...['Dining', 'Shopping', 'Travel', 'Technology', 'Entertainment', 'Fitness'].map(category => ({
            title: category,
            type: 'Category',
            action: () => {
                localStorage.setItem('rateMe_selectedCategory', category);
                window.location.href = `category-detail.html?category=${encodeURIComponent(category)}`;
            }
        }))
    ].filter(item => item.title);

    function renderResults() {
        const query = input.value.toLowerCase().trim();
        if (!query) {
            results.classList.remove('active');
            results.innerHTML = '';
            return;
        }

        const matches = items.filter(item => item.title.toLowerCase().includes(query)).slice(0, 6);
        results.innerHTML = matches.length
            ? matches.map((item, index) => `
                <button class="home-search-result" type="button" data-index="${index}">
                    <span>${item.title}</span>
                    <small>${item.type}</small>
                </button>
            `).join('')
            : '<button class="home-search-result" type="button"><span>No results found</span><small>Try another word</small></button>';

        results.classList.add('active');
        results.querySelectorAll('[data-index]').forEach(button => {
            button.addEventListener('click', () => {
                const item = matches[Number(button.dataset.index)];
                results.classList.remove('active');
                input.value = '';
                item.action();
            });
        });
        gsap.fromTo('.home-search-result', { opacity: 0, y: 8 }, { duration: 0.25, opacity: 1, y: 0, stagger: 0.04 });
    }

    input.addEventListener('input', renderResults);
    input.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        const first = results.querySelector('[data-index]');
        if (first) first.click();
    });
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.home-search')) results.classList.remove('active');
    });
}

// ===== BUTTON EVENT LISTENERS =====
function initButtonEvents() {
    // CTA Button - Rating Modal
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            openModal('rating-modal');
        });
    }
    
    // Get Started Button
    const ctaLargeButtons = document.querySelectorAll('.cta-button-large');
    ctaLargeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            openModal('subscribe-modal');
        });
    });
    
    // Feature Cards Click
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('click', (event) => {
            if (event.target.closest('.feature-action')) return;
            event.preventDefault();
            toggleFeatureCard(card);
        });
    });

    document.addEventListener('click', (event) => {
        const action = event.target.closest('.feature-action');
        if (!action) return;
        event.stopPropagation();

        const card = action.closest('.feature-card');
        const title = card.querySelector('h3')?.textContent.trim() || '';
        const routes = {
            'Visual Reviews': 'reviews.html',
            'Trending Content': 'reviews.html?search=Technology',
            'Verified Reviews': 'reviews.html?search=Top',
            'Lightning Fast': 'about.html',
            'Premium Quality': 'profile.html',
            'Community First': 'categories.html'
        };

        gsap.to('body', {
            duration: 0.35,
            opacity: 0,
            onComplete: () => {
                window.location.href = routes[title] || 'reviews.html';
            }
        });
    });

    // ===== CATEGORY CARD FEATURE ACTIONS =====
    document.addEventListener('click', (event) => {
        const button = event.target.closest('.feature-action');
        if (!button) return;

        const categoryCard = button.closest('.category-card');
        if (!categoryCard) return;

        const categoryName = categoryCard.querySelector('.category-name')?.textContent.trim();
        if (!categoryName) return;

        event.stopPropagation();
        event.preventDefault();

        // Animate and navigate to category-detail.html
        gsap.to('body', {
            duration: 0.35,
            opacity: 0,
            onComplete: () => {
                localStorage.setItem('rateMe_selectedCategory', categoryName);
                window.location.href = `category-detail.html?category=${encodeURIComponent(categoryName)}`;
            }
        });
    });
    
    // Review Cards Click - Navigate to review-detail.html
    document.querySelectorAll('.review-card').forEach(card => {
        card.addEventListener('click', () => {
            // Capture review data before navigating
            const reviewTitle = card.querySelector('h3')?.textContent.trim() || 'Review';
            const reviewCategory = card.querySelector('p')?.textContent.trim() || 'Reviews';
            const reviewText = card.querySelector('p:nth-of-type(2)')?.textContent.trim() || '';
            const authorImg = card.querySelector('img')?.src || '';
            const authorName = card.querySelector('strong')?.textContent.trim() || 'RateMe User';
            const authorDate = card.querySelector('strong').parentElement?.textContent.replace(authorName, '').trim() || '';
            
            // Save to sessionStorage for detail page
            sessionStorage.setItem('rateMe_currentReview', JSON.stringify({
                title: reviewTitle,
                category: reviewCategory,
                text: reviewText,
                author: authorName,
                date: authorDate,
                avatar: authorImg
            }));
            
            // Animate fade out and navigate
            gsap.to('body', {
                duration: 0.35,
                opacity: 0,
                onComplete: () => {
                    window.location.href = 'review-detail.html';
                }
            });
        });
    });
    
    // Star Rating - Enhanced
    initStarRating();
}

// ===== ENHANCED STAR RATING SYSTEM =====
function initStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            const user = userManager.getCurrentUser();
            if (!user) {
                showNotification('🔐 Please login first to rate!');
                openModal('login-modal');
                return;
            }
            
            selectedRating = parseInt(star.dataset.value);
            
            // Update active stars with 3D animation
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.classList.add('active');
                    gsap.to(s, {
                        duration: 0.3,
                        scale: 1.3,
                        rotationZ: 15,
                        ease: 'back.out'
                    });
                } else {
                    s.classList.remove('active');
                    gsap.to(s, {
                        duration: 0.3,
                        scale: 1,
                        rotationZ: 0
                    });
                }
            });
            
            // Update rating count
            const countDisplay = document.getElementById('rating-count');
            if (countDisplay) {
                countDisplay.textContent = `⭐ ${selectedRating}/5 - Great choice!`;
                gsap.from(countDisplay, {
                    duration: 0.4,
                    scale: 0,
                    opacity: 0,
                    ease: 'back.out'
                });
            }
            
            // Save rating to userData
            if (userManager.getCurrentUser()) {
                let reviews = JSON.parse(localStorage.getItem('rateMe_reviews') || '[]');
                reviews.push({
                    rating: selectedRating,
                    timestamp: new Date().toISOString(),
                    user: userManager.getCurrentUser().name
                });
                localStorage.setItem('rateMe_reviews', JSON.stringify(reviews));
            }
        });
        
        // Hover effect with 3D rotation
        star.addEventListener('mouseenter', () => {
            const hoverIndex = parseInt(star.dataset.value);
            stars.forEach((s, index) => {
                if (index < hoverIndex) {
                    gsap.to(s, {
                        duration: 0.2,
                        scale: 1.2,
                        rotationX: 45,
                        color: '#fbbf24'
                    });
                } else {
                    gsap.to(s, {
                        duration: 0.2,
                        scale: 1,
                        rotationX: 0,
                        color: 'rgba(251, 191, 36, 0.3)'
                    });
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach((s, index) => {
                if (s.classList.contains('active')) {
                    gsap.to(s, {
                        duration: 0.2,
                        scale: 1.1,
                        rotationX: 0,
                        color: '#fbbf24'
                    });
                } else {
                    gsap.to(s, {
                        duration: 0.2,
                        scale: 1,
                        rotationX: 0,
                        color: 'rgba(251, 191, 36, 0.3)'
                    });
                }
            });
        });
    });
}

// ===== FORM SUBMISSIONS =====
function initFormHandlers() {
    const ratingForm = document.getElementById('rating-form');
    if (ratingForm) {
        ratingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const user = userManager.getCurrentUser();
            if (!user) {
                showNotification('🔐 Please login to submit a review');
                openModal('login-modal');
                return;
            }
            
            // Get form data
            const subject = ratingForm.querySelector('input[type="text"]').value;
            const textarea = ratingForm.querySelector('textarea').value;
            const ratingValue = document.querySelectorAll('.star-rating .star.active').length;
            
            if (!subject || !textarea || !ratingValue) {
                showNotification('❌ Please fill all fields and select a rating');
                return;
            }
            
            // Show loading animation
            const btn = ratingForm.querySelector('.modal-btn');
            const originalText = btn.textContent;
            gsap.to(btn, { duration: 0.3, scale: 0.95 });
            btn.textContent = '⏳ Saving...';
            
            // Save review to localStorage
            let reviews = JSON.parse(localStorage.getItem('rateMe_reviews') || '[]');
            reviews.push({
                subject: subject,
                review: textarea,
                rating: ratingValue,
                userName: user.name,
                userEmail: user.email,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('rateMe_reviews', JSON.stringify(reviews));
            
            // Simulate submission delay
            setTimeout(() => {
                closeModal('rating-modal');
                openModal('success-modal');
                
                // Update success message
                const successMsg = document.getElementById('success-message');
                if (successMsg) {
                    successMsg.textContent = `✨ "${subject}" reviewed with ⭐${ratingValue}/5 - Thanks ${user.name}!`;
                }
                
                ratingForm.reset();
                document.querySelectorAll('.star-rating .star').forEach(s => {
                    s.classList.remove('active');
                });
                
                gsap.to(btn, { duration: 0.3, scale: 1 });
                btn.textContent = originalText;
            }, 1000);
        });
    }
    
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = subscribeForm.querySelector('input[type="email"]').value;
            const name = subscribeForm.querySelector('input[type="text"]').value;
            
            // Save subscriber
            let subscribers = JSON.parse(localStorage.getItem('rateMe_subscribers') || '[]');
            subscribers.push({ name, email, timestamp: new Date().toISOString() });
            localStorage.setItem('rateMe_subscribers', JSON.stringify(subscribers));
            
            const btn = subscribeForm.querySelector('.modal-btn');
            gsap.to(btn, { duration: 0.3, scale: 0.95 });
            
            setTimeout(() => {
                closeModal('subscribe-modal');
                showNotification(`✨ Welcome ${name}! Check ${email} for exclusive updates!`);
                subscribeForm.reset();
                gsap.to(btn, { duration: 0.3, scale: 1 });
            }, 800);
        });
    }
}

// ===== MODAL CLOSE HANDLERS =====
function initModalClosers() {
    document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking overlay
    document.getElementById('modal-overlay').addEventListener('click', () => {
        closeAllModals();
    });
}

// ===== HERO SECTION ANIMATIONS =====
function initHeroAnimations() {
    const timeline = gsap.timeline();

    // Animate stars
    gsap.to('.star', {
        duration: 0.3,
        opacity: 1,
        stagger: 0.05,
        delay: 0.2,
    });

    // Floating stars animation
    gsap.to('.star', {
        duration: 3,
        y: -20,
        opacity: 0.3,
        repeat: -1,
        yoyo: true,
        stagger: 0.1,
        ease: 'sine.inOut',
    });

    // Animate shapes
    gsap.to('.shape-1', {
        duration: 6,
        x: 50,
        y: -30,
        rotation: 10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });

    gsap.to('.shape-2', {
        duration: 8,
        x: -50,
        y: 30,
        rotation: -10,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });

    gsap.to('.shape-3', {
        duration: 5,
        scale: 1.2,
        rotation: 360,
        repeat: -1,
        ease: 'sine.inOut',
    });

    // Animate hero title words
    timeline.from('.hero-title .word', {
        duration: 1,
        opacity: 0,
        y: 100,
        rotationX: 90,
        stagger: 0.2,
        ease: 'back.out',
    }, 0.2);

    // Animate subtitle
    timeline.from('.hero-subtitle', {
        duration: 1,
        opacity: 0,
        y: 50,
        blur: 10,
        ease: 'power3.out',
    }, '-=0.5');

    // Animate CTA button
    timeline.from('.cta-button', {
        duration: 1,
        opacity: 0,
        scale: 0,
        ease: 'elastic.out',
    }, '-=0.5');

    // CTA button hover effect
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('mouseenter', () => {
            gsap.to(ctaButton, {
                duration: 0.3,
                scale: 1.1,
                boxShadow: '0 30px 60px rgba(99, 102, 241, 0.5)',
            });
        });

        ctaButton.addEventListener('mouseleave', () => {
            gsap.to(ctaButton, {
                duration: 0.3,
                scale: 1,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            });
        });
    }
}

// ===== FEATURES SECTION ANIMATIONS =====
function initFeaturesAnimations() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach((card, index) => {
        // Set initial state - START VISIBLE
        gsap.set(card, { opacity: 1, y: 0, rotationX: 0 });
        
        // Animate on scroll - reveal with entrance effect
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                once: true,
            },
            duration: 0.8,
            opacity: 1,
            y: 0,
            rotationX: 0,
            delay: index * 0.15,
            ease: 'power3.out',
        });

        // Hover animation cu efect 3D
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                duration: 0.4,
                y: -15,
                boxShadow: '0 25px 50px rgba(99, 102, 241, 0.3)',
                ease: 'power2.out',
            });
            
            gsap.to(card.querySelector('.feature-icon'), {
                duration: 0.4,
                scale: 1.2,
                rotation: 10,
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.4,
                y: 0,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            });
            
            gsap.to(card.querySelector('.feature-icon'), {
                duration: 0.4,
                scale: 1,
                rotation: 0,
            });
        });
    });
}

// ===== REVIEWS SECTION ANIMATIONS =====
function initReviewsAnimations() {
    // REMOVED: Was conflicting with initParallaxEffect() review card animations
    // Both were trying to animate the same elements, causing opacity: 0
    // Parallax animation in initParallaxEffect() handles all review card animations now
}

// ===== STATS SECTION ANIMATIONS =====
function initStatsAnimations() {
    const statItems = document.querySelectorAll('.stat-item');

    statItems.forEach((stat, index) => {
        // Animate stat item appearance
        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%',
                once: true,
            },
            duration: 0.8,
            opacity: 0,
            y: 50,
            scale: 0.8,
            delay: index * 0.1,
            ease: 'back.out',
        });

        // Number counter animation
        const statNumber = stat.querySelector('.stat-number');
        if (statNumber) {
            const finalValue = statNumber.textContent;
            
            gsap.from(statNumber, {
                scrollTrigger: {
                    trigger: stat,
                    start: 'top 80%',
                    once: true,
                },
                duration: 2.5,
                ease: 'power3.out',
                textContent: 0,
                snap: { textContent: 1 },
                onUpdate: function() {
                    const value = Math.ceil(this.targets()[0].textContent);
                    statNumber.textContent = value + (finalValue.slice(-1) === '+' || finalValue.includes('.') ? 
                        (finalValue.includes('+') ? '+' : (finalValue.includes('%') ? '%' : 'K+')) : '');
                }
            });
        }
    });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    // Section animations
    gsap.utils.toArray('section').forEach((section) => {
        if (section.classList.contains('hero')) return;

        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top center',
                toggleActions: 'play none none none',
            },
            opacity: 0.5,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
        });
    });
}

// ===== NAVIGATION ANIMATIONS =====
function initNavAnimations() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach((link) => {
        // Hover effect on nav links
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                duration: 0.3,
                color: 'var(--secondary)',
                ease: 'power2.out',
            });
        });

        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                duration: 0.3,
                color: 'var(--text)',
            });
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > 100) {
            gsap.to(navbar, {
                duration: 0.3,
                boxShadow: '0 10px 40px rgba(99, 102, 241, 0.2)',
            });
        } else {
            gsap.to(navbar, {
                duration: 0.3,
                boxShadow: '0 2px 20px rgba(0, 0, 0, 0.5)',
            });
        }
    });
}

// ===== CTA BUTTON ANIMATIONS =====
function initCTAAnimations() {
    const ctaButtons = document.querySelectorAll('.cta-button-large');

    ctaButtons.forEach((button) => {
        gsap.from(button, {
            scrollTrigger: {
                trigger: button.closest('section'),
                start: 'top 80%',
                once: true,
            },
            duration: 1,
            opacity: 0,
            scale: 0.5,
            y: 50,
            ease: 'elastic.out',
        });

        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                duration: 0.3,
                scale: 1.08,
                boxShadow: '0 30px 60px rgba(236, 72, 153, 0.4)',
                letterSpacing: '1px',
            });
            
            // Add sparkle effect
            createSparkles(button);
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                duration: 0.3,
                scale: 1,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
                letterSpacing: '0px',
            });
        });

        button.addEventListener('click', (e) => {
            // Ripple effect
            createRipple(e, button);
            
            // Bounce animation
            gsap.to(button, {
                duration: 0.1,
                scale: 0.95,
                onComplete: () => {
                    gsap.to(button, {
                        duration: 0.2,
                        scale: 1,
                    });
                }
            });
        });
    });
}

// ===== CREATE SPARKLES EFFECT =====
function createSparkles(element) {
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'absolute';
        sparkle.style.width = '4px';
        sparkle.style.height = '4px';
        sparkle.style.background = 'rgba(255, 255, 255, 1)';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        
        const angle = (Math.PI * 2 * i) / 5;
        const velocity = {
            x: Math.cos(angle) * 5,
            y: Math.sin(angle) * 5
        };
        
        const rect = element.getBoundingClientRect();
        sparkle.style.left = rect.width / 2 + 'px';
        sparkle.style.top = rect.height / 2 + 'px';
        
        element.appendChild(sparkle);
        
        gsap.to(sparkle, {
            duration: 0.6,
            x: velocity.x * 30,
            y: velocity.y * 30,
            opacity: 0,
            onComplete: () => sparkle.remove()
        });
    }
}

// ===== PARALLAX EFFECT =====
function initParallaxEffect() {
    // ===== ADVANCED PARALLAX SCROLLING =====
    
    // Parallax shapes in hero section
    gsap.to('.shape-1', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
        },
        y: 400,
        x: 100,
        rotation: 360,
        ease: 'none',
    });

    gsap.to('.shape-2', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
        },
        y: 300,
        x: -150,
        rotation: -360,
        ease: 'none',
    });

    gsap.to('.shape-3', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 2,
        },
        y: 500,
        x: 50,
        scale: 1.2,
        ease: 'none',
    });

    // Hero title - SET INITIAL STATE TO VISIBLE
    gsap.set('.hero-title', { opacity: 1 });
    
    // Hero title parallax - KEEP VISIBLE
    gsap.to('.hero-title', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom 30%',
            scrub: 1,
        },
        y: 150,
        opacity: 1,
        ease: 'none',
        immediateRender: false,
    });

    // Hero subtitle parallax
    gsap.to('.hero-subtitle', {
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom 40%',
            scrub: 1,
        },
        y: 100,
        opacity: 0.2,
        ease: 'none',
    });

    // ===== SECTION PARALLAX ANIMATIONS =====
    
    // Feature cards staggered parallax
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 0.5,
                once: false,
            },
            opacity: 0,
            y: 100 + index * 20,
            rotation: -5 + index * 2,
            scale: 0.9,
            ease: 'back.out',
        });

        // Add hover parallax
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2;

            gsap.to(card, {
                duration: 0.3,
                x: x,
                y: y,
                overwrite: 'auto',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                x: 0,
                y: 0,
                overwrite: 'auto',
            });
        });
    });

    // ===== REVIEWS PARALLAX =====
    const reviewCards = document.querySelectorAll('.review-card');
    reviewCards.forEach((card, index) => {
        // Set initial state - START VISIBLE (opacity 1)
        gsap.set(card, { opacity: 1 });
        
        // Animate on scroll - stay visible
        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                end: 'top 50%',
                scrub: 0.5,
                once: false,
            },
            opacity: 1,  // Keep visible
            y: 0,        // Normal position
            x: 0,
            rotation: 0,
            scale: 1,
            duration: 1,
            ease: 'back.out',
            immediateRender: false,
        });
    });

    // ===== STATS PARALLAX =====
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: '.stats-section',
                start: 'top 70%',
                end: 'top 20%',
                scrub: 0.8,
            },
            opacity: 0,
            y: 120 + index * 40,
            scale: 0.8,
            ease: 'power3.out',
        });
    });

    // ===== CATEGORY CARDS PARALLAX =====
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 10%',
                scrub: 1,
            },
            opacity: 0,
            y: 100,
            x: (index % 2 === 0 ? -80 : 80),
            scale: 0.85,
            rotation: (index % 2 === 0 ? 8 : -8),
            ease: 'back.out',
        });
    });

    // ===== PARALLAX TEXT EFFECT - REMOVED (WAS BREAKING LAYOUT) =====
    // Simple opacity fade on titles instead
    const titleElements = document.querySelectorAll('.section-title, h1, h2');
    titleElements.forEach((element) => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: 'top 80%',
                end: 'top 50%',
                scrub: 0.5,
            },
            opacity: 0,
            y: 30,
            ease: 'power2.out',
        });
    });

    // ===== SCROLL PROGRESS BAR =====
    if (!document.querySelector('.scroll-progress')) {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
    }

    gsap.to('.scroll-progress', {
        width: '100%',
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
        },
        ease: 'none',
    });

    // ===== PARALLAX BACKGROUND SHIFT - SIMPLIFIED =====
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        if (section.id !== 'home') {
            // Simple opacity shift instead of background-position
            gsap.from(section, {
                scrollTrigger: {
                    trigger: section,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: 1,
                    once: false,
                },
                opacity: 1,
                ease: 'power2.out',
            });
        }
    });

    // ===== FLOATING PARALLAX ELEMENTS =====
    gsap.to('.floating', {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
    });
}

// ===== ADVANCED MOUSE PARALLAX =====
function initAdvancedMouseParallax() {
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Apply subtle parallax to hero content
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const moveX = (mouseX - window.innerWidth / 2) * 0.01;
            const moveY = (mouseY - window.innerHeight / 2) * 0.01;

            gsap.to(heroContent, {
                duration: 0.8,
                x: moveX,
                y: moveY,
                overwrite: 'auto',
            });
        }

        // Apply parallax to shapes
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach((shape, index) => {
            const moveX = (mouseX - window.innerWidth / 2) * (0.01 + index * 0.01);
            const moveY = (mouseY - window.innerHeight / 2) * (0.01 + index * 0.01);

            gsap.to(shape, {
                duration: 1,
                x: moveX,
                y: moveY,
                overwrite: 'auto',
            });
        });
    });
}

// ===== PAGE LOAD ANIMATION =====
function initPageLoadAnimation() {
    gsap.from('body', {
        duration: 0.6,
        opacity: 0,
    });
}

// ===== MOUSE MOVEMENT EFFECT =====
function initMouseFollowEffect() {
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Create a subtle glow effect on hero section
    const shapes = document.querySelectorAll('.shape');
    if (shapes.length > 0) {
        gsap.ticker.add(() => {
            shapes.forEach((shape) => {
                const rect = shape.getBoundingClientRect();
                const shapeX = rect.left + rect.width / 2;
                const shapeY = rect.top + rect.height / 2;

                const distance = Math.sqrt(
                    Math.pow(mouseX - shapeX, 2) + Math.pow(mouseY - shapeY, 2)
                );

                if (distance < 300) {
                    const attraction = (300 - distance) / 300;
                    gsap.to(shape, {
                        duration: 0.5,
                        x: (mouseX - shapeX) * attraction * 0.3,
                        y: (mouseY - shapeY) * attraction * 0.3,
                    });
                } else {
                    gsap.to(shape, {
                        duration: 0.5,
                        x: 0,
                        y: 0,
                    });
                }
            });
        });
    }
}

// ===== ADVANCED ANIMATIONS =====
function initAdvancedAnimations() {
    // Staggered fade-in for hero
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        gsap.from(heroContent.children, {
            duration: 0.8,
            opacity: 0,
            y: 30,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.3,
        });
    }

    // Animated background elements
    gsap.to('.stars-bg', {
        duration: 20,
        backgroundPosition: '100% 100%',
        repeat: -1,
        ease: 'none',
    });

    // Floating animation for buttons on hover
    document.querySelectorAll('.cta-button, .cta-button-large').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            gsap.to(btn, {
                duration: 0.4,
                y: -5,
                boxShadow: '0 40px 80px rgba(99, 102, 241, 0.5)',
                ease: 'power2.out',
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                duration: 0.4,
                y: 0,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            });
        });
    });

    // Word pop animation for section titles
    document.querySelectorAll('.section-title span').forEach((span, index) => {
        span.addEventListener('mouseenter', () => {
            gsap.to(span, {
                duration: 0.3,
                scale: 1.3,
                color: 'var(--secondary)',
                textShadow: '0 0 20px rgba(236, 72, 153, 0.6)',
            });
        });

        span.addEventListener('mouseleave', () => {
            gsap.to(span, {
                duration: 0.3,
                scale: 1,
                color: 'inherit',
                textShadow: 'none',
            });
        });
    });
}

// ===== TEXT ANIMATION =====
function initTextAnimations() {
    const sectionTitles = document.querySelectorAll('.section-title');

    sectionTitles.forEach((title) => {
        const text = title.textContent;
        title.textContent = '';

        const letters = text.split('');
        letters.forEach((letter) => {
            const span = document.createElement('span');
            span.textContent = letter;
            span.style.display = 'inline-block';
            span.style.opacity = '0';
            span.style.transform = 'translateY(20px) rotateX(90deg)';
            title.appendChild(span);
        });

        const spans = title.querySelectorAll('span');
        gsap.from(spans, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                once: true,
            },
            duration: 0.5,
            opacity: 0,
            y: 20,
            rotationX: 90,
            stagger: 0.03,
            ease: 'back.out',
        });
    });
}

// ===== ENHANCED SCROLL ANIMATIONS WITH PARALLAX =====
function initEnhancedScrollAnimations() {
    // Staggered reveal animations
    const staggerItems = document.querySelectorAll('.feature-card, .review-card, .stat-card, .category-card');
    
    staggerItems.forEach((item, index) => {
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: 'top 90%',
                end: 'top 50%',
                scrub: 0.5,
                markers: false,
            },
            opacity: 0,
            y: 80,
            rotationX: -10,
            scale: 0.95,
            ease: 'power3.out',
            duration: 0.6,
        });
    });

    // Pin sections while content is revealed
    const sections = document.querySelectorAll('section');
    sections.forEach((section) => {
        // Don't pin hero section
        if (section.id === 'home') return;

        // Create a parallax effect on section backgrounds
        gsap.to(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                scrub: 1,
                onUpdate: (self) => {
                    // Shift background based on scroll
                    const shift = self.progress * 20;
                    gsap.set(section, {
                        backgroundPosition: `${shift}% 0%`,
                        backgroundSize: `${100 + shift}% auto`,
                    });
                },
            },
        });
    });

    // Animated counter effect for stats
    const statValues = document.querySelectorAll('.stat-card-value');
    statValues.forEach((stat) => {
        const finalValue = stat.textContent;
        const numericValue = parseFloat(finalValue);

        gsap.from(stat, {
            scrollTrigger: {
                trigger: stat,
                start: 'top 80%',
                end: 'top 50%',
                once: true,
            },
            innerText: 0,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out',
            onUpdate: function() {
                let current = gsap.getProperty(stat, 'innerText');
                if (finalValue.includes('K')) {
                    stat.innerText = (current / 1000).toFixed(1) + 'K';
                } else if (finalValue.includes('%')) {
                    stat.innerText = current.toFixed(1) + '%';
                } else {
                    stat.innerText = current.toFixed(0);
                }
            },
        });
    });

    // Parallax tilt effect on hover for cards
    document.querySelectorAll('.review-card, .feature-card, .category-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * 10;
            const rotateY = ((x - centerX) / centerX) * -10;

            gsap.to(card, {
                duration: 0.3,
                rotationX: rotateX,
                rotationY: rotateY,
                transformPerspective: 1000,
                overwrite: 'auto',
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                duration: 0.3,
                rotationX: 0,
                rotationY: 0,
                overwrite: 'auto',
            });
        });
    });

    // Parallax text reveal - SIMPLIFIED (no split, no layout breaking)
    document.querySelectorAll('.section-title').forEach((title) => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 0.5,
            },
            opacity: 0,
            y: 30,
            ease: 'power2.out',
        });
    });

    // Blur effect based on scroll velocity - REMOVED (causes layout issues)
    // Using simple opacity transitions instead
    window.addEventListener('scroll', () => {
        // Simple scroll event handler without heavy blur effects
    }, { passive: true });

    // Parallax footer effect
    const footer = document.querySelector('footer');
    if (footer) {
        gsap.from(footer, {
            scrollTrigger: {
                trigger: footer,
                start: 'top 80%',
                end: 'top 20%',
                scrub: 1,
            },
            opacity: 0,
            y: 100,
            ease: 'power2.out',
        });
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all animations
    initPageTransition();
    initButtonEvents();
    initFormHandlers();
    initModalClosers();
    initHeroAnimations();
    initFeaturesAnimations();
    initReviewsAnimations();
    initStatsAnimations();
    initScrollAnimations();
    initNavAnimations();
    initCTAAnimations();
    initParallaxEffect();
    initAdvancedMouseParallax();
    initMouseFollowEffect();
    initTextAnimations();
    initAdvancedAnimations();
    initHomeSearch();
    initEnhancedScrollAnimations();

    // Refresh ScrollTrigger after all animations are registered
    ScrollTrigger.refresh();

    // Update ScrollTrigger on resize
    window.addEventListener('resize', () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.refresh());
    });
});

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ===== SMOOTH SCROLL BEHAVIOR =====
gsap.registerPlugin(ScrollTrigger);
