// Helper functions
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

        function showNotification(message, duration = 3000) {
            const toast = document.createElement('div');
            toast.className = 'notification-toast show';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            gsap.to(toast, {
                duration: 0.4,
                opacity: 1,
            });
            
            setTimeout(() => {
                gsap.to(toast, {
                    duration: 0.4,
                    opacity: 0,
                    onComplete: () => toast.remove()
                });
            }, duration);
        }

        // Page transition
        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (!href.includes('.html')) return;
                e.preventDefault();
                
                // Ripple effect
                createRipple(e, link);
                
                gsap.to('body', {
                    duration: 0.5,
                    opacity: 0,
                    onComplete: () => {
                        window.location.href = href;
                    }
                });
            });
        });

        gsap.from('body', {
            duration: 0.6,
            opacity: 0,
            delay: 0.1,
        });

        const reviewGrid = document.querySelector('.all-reviews-grid');
        const searchInput = document.getElementById('review-search');
        const reviewCount = document.getElementById('review-count');
        const emptyReviews = document.getElementById('empty-reviews');
        let activeFilter = 'All';
        let loadedExtraReviews = 0;

        function addSavedUserReviews() {
            const saved = JSON.parse(localStorage.getItem('rateMe_reviews') || '[]');
            saved.slice().reverse().forEach(review => {
                const title = review.subject || 'Saved Review';
                if ([...document.querySelectorAll('.review-item-title')].some(item => item.textContent.trim() === title)) return;

                const card = document.createElement('div');
                card.className = 'review-item';
                card.innerHTML = `
                    <div class="review-item-header">
                        <h3 class="review-item-title">${title}</h3>
                        <p class="review-item-category">${review.category || 'User Review'}</p>
                    </div>
                    <div class="review-item-body">
                        <div class="review-item-rating">
                            <span class="review-stars">${'★'.repeat(Number(review.rating || 0))}${'☆'.repeat(5 - Number(review.rating || 0))}</span>
                            <span>${Number(review.rating || 0).toFixed(1)}</span>
                        </div>
                        <p class="review-item-text">${review.review || 'Saved rating from RateMe.'}</p>
                        <div class="review-item-author">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(review.userName || 'RateMe User')}" alt="Author">
                            <div>
                                <strong>${review.userName || 'RateMe User'}</strong>
                                <small>${review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 'Today'}</small>
                            </div>
                        </div>
                    </div>
                `;
                reviewGrid.prepend(card);
                wireReviewItem(card);
            });
        }

        function getReviewData(item) {
            const title = item.querySelector('.review-item-title')?.textContent.trim() || 'Untitled Review';
            const category = item.querySelector('.review-item-category')?.textContent.trim() || 'General';
            const text = item.querySelector('.review-item-text')?.textContent.trim() || '';
            const author = item.querySelector('.review-item-author strong')?.textContent.trim() || 'RateMe User';
            const date = item.querySelector('.review-item-author small')?.textContent.trim() || 'Today';
            const rating = item.querySelector('.review-item-rating span:last-child')?.textContent.trim() || '5.0';
            const avatar = item.querySelector('.review-item-author img')?.src || '';
            return { title, category, text, author, date, rating, avatar };
        }

        function normalize(value) {
            return value.toLowerCase().trim();
        }

        function matchesFilter(data) {
            if (activeFilter === 'All') return true;
            if (activeFilter === 'Latest') return ['2 days ago', '5 days ago', '1 week ago'].includes(data.date);
            if (activeFilter === 'Top Rated') return Number(data.rating) >= 4.8;
            if (activeFilter === 'Most Popular') return ['Technology', 'Shopping', 'Travel & Adventure'].includes(data.category);
            if (activeFilter === 'This Week') return !data.date.includes('weeks') && !data.date.includes('month');
            return true;
        }

        function applyReviewsView() {
            const query = normalize(searchInput.value);
            const items = [...document.querySelectorAll('.review-item')];
            let visibleCount = 0;

            items.forEach(item => {
                const data = getReviewData(item);
                const haystack = normalize(`${data.title} ${data.category} ${data.text} ${data.author}`);
                const isVisible = matchesFilter(data) && (!query || haystack.includes(query));

                if (isVisible) {
                    item.style.display = '';
                    visibleCount += 1;
                    gsap.fromTo(item, { opacity: 0, y: 18 }, { duration: 0.28, opacity: 1, y: 0, ease: 'power2.out' });
                } else {
                    item.style.display = 'none';
                }
            });

            reviewCount.textContent = `${visibleCount} review${visibleCount === 1 ? '' : 's'} found`;
            emptyReviews.style.display = visibleCount ? 'none' : 'block';
        }

        function openReviewDetail(item) {
            const data = getReviewData(item);
            localStorage.setItem('rateMe_selectedReview', JSON.stringify(data));
            gsap.to('body', {
                duration: 0.35,
                opacity: 0,
                onComplete: () => {
                    window.location.href = `review-detail.html?title=${encodeURIComponent(data.title)}`;
                }
            });
        }

        function wireReviewItem(item) {
            item.addEventListener('mouseenter', () => {
                gsap.to(item, { duration: 0.3, y: -10 });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(item, { duration: 0.3, y: 0 });
            });

            item.addEventListener('click', () => openReviewDetail(item));
        }

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                activeFilter = this.textContent.trim();
                gsap.fromTo(this, { scale: 0.94 }, { duration: 0.25, scale: 1, ease: 'back.out' });
                applyReviewsView();
            });
        });

        const params = new URLSearchParams(window.location.search);
        const initialSearch = params.get('search') || localStorage.getItem('rateMe_reviewSearch') || '';
        if (initialSearch) {
            searchInput.value = initialSearch;
            localStorage.removeItem('rateMe_reviewSearch');
        }

        searchInput.addEventListener('input', applyReviewsView);

        // Animate review items on load
        gsap.registerPlugin(ScrollTrigger);
        document.querySelectorAll('.review-item').forEach((item, index) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    once: true,
                },
                duration: 0.6,
                opacity: 0,
                y: 40,
                delay: index * 0.08,
                ease: 'power3.out',
            });
            wireReviewItem(item);
        });

        // Load more button
        document.querySelector('.load-more-btn').addEventListener('click', function() {
            gsap.to(this, {
                duration: 0.2,
                scale: 0.90,
                onComplete: () => {
                    gsap.to(this, {
                        duration: 0.3,
                        scale: 1,
                    });
                }
            });
            
            // Create ripple
            createRipple({ clientX: this.offsetWidth / 2, clientY: this.offsetHeight / 2 }, this);
            
            const extraReviews = [
                ['Hidden Gem Cafe', 'Dining', 'Cozy place, excellent desserts, and a team that pays attention to small details.', 'Nora Miles', 'Today', '4.9'],
                ['Smart Planner App', 'Technology', 'A clean app that actually helped me organize projects and daily habits.', 'Leo Park', 'Today', '2.5'],
                ['Weekend Mountain Stay', 'Travel & Adventure', 'Beautiful views, quiet rooms, and very friendly hosts. Worth every minute.', 'Irina Costa', 'Yesterday', '5.0']
            ];

            extraReviews.forEach((review, index) => {
                const [title, category, text, author, date, rating] = review;
                const card = document.createElement('div');
                card.className = 'review-item';
                card.innerHTML = `
                    <div class="review-item-header">
                        <h3 class="review-item-title">${title}</h3>
                        <p class="review-item-category">${category}</p>
                    </div>
                    <div class="review-item-body">
                        <div class="review-item-rating">
                            <span class="review-stars">★★★★★</span>
                            <span>${rating}</span>
                        </div>
                        <p class="review-item-text">${text}</p>
                        <div class="review-item-author">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author)}" alt="Author">
                            <div>
                                <strong>${author}</strong>
                                <small>${date}</small>
                            </div>
                        </div>
                    </div>
                `;
                reviewGrid.appendChild(card);
                wireReviewItem(card);
                gsap.from(card, { duration: 0.45, opacity: 0, y: 30, delay: index * 0.08, ease: 'power3.out' });
            });

            loadedExtraReviews += extraReviews.length;
            this.textContent = 'All Reviews Loaded';
            this.disabled = true;
            applyReviewsView();
        });

        addSavedUserReviews();
        applyReviewsView();

        // Load scripts
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
                
                const submitLoginBtn = document.getElementById('login-btn');
                if (submitLoginBtn) {
                    submitLoginBtn.addEventListener('click', () => this.handleLogin());
                }
                
                const logoutBtn = document.getElementById('logout-btn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => this.logout());
                }
                
                this.updateLoginUI();
            }
            
            handleLogin() {
                const name = document.getElementById('user-name').value;
                const email = document.getElementById('user-email').value;
                const password = document.getElementById('user-password').value;
                
                if (!name || !email || !password) {
                    showNotification('Please fill all fields');
                    return;
                }
                
                this.currentUser = { name, email, password, joinedDate: new Date().toISOString() };
                localStorage.setItem('rateMe_user', JSON.stringify(this.currentUser));
                
                this.updateLoginUI();
                showNotification(`Welcome ${name}! You are now logged in!`);
                
                gsap.from('.user-info', {
                    duration: 0.6,
                    opacity: 0,
                    scale: 0.8,
                    ease: 'back.out'
                });
                
                setTimeout(() => closeModal('login-modal'), 1500);
            }
            
            logout() {
                this.currentUser = null;
                localStorage.removeItem('rateMe_user');
                this.updateLoginUI();
                closeModal('login-modal');
                showNotification('You have been logged out');
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
                    if (navBtn) navBtn.textContent = 'Login';
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

        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            const overlay = document.getElementById('modal-overlay');
            
            if (!modal) return;
            
            modal.classList.add('active');
            overlay.classList.add('active');
            
            gsap.from(modal, {
                duration: 0.5,
                scale: 0,
                rotateX: -90,
                rotateY: 0,
                rotateZ: -45,
                ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            });
            
            gsap.to('body', { duration: 0.3, backdropFilter: 'blur(10px)' });
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            const overlay = document.getElementById('modal-overlay');
            
            if (!modal) return;
            
            modal.classList.remove('active');
            overlay.classList.remove('active');
            
            gsap.to(modal, {
                duration: 0.3,
                scale: 0.8,
                opacity: 0,
                onComplete: () => {
                    modal.style.opacity = '1';
                }
            });
        }

        function showNotification(message, duration = 3000) {
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
                z-index: 10000;
                font-weight: 500;
                animation: slideIn 0.3s ease-out;
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }

        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'reviews.html';
        });

        // Gallery thumbnails
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', () => {
                document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                
                const fullSrc = thumb.dataset.full;
                const mainImg = document.getElementById('main-image');
                
                gsap.to(mainImg, {
                    duration: 0.3,
                    opacity: 0,
                    onComplete: () => {
                        mainImg.src = fullSrc;
                        gsap.to(mainImg, { duration: 0.3, opacity: 1 });
                    }
                });
            });
        });

        function loadSelectedReview() {
            const selected = JSON.parse(localStorage.getItem('rateMe_selectedReview') || 'null');
            if (!selected) return;

            document.title = `${selected.title} - RateMe`;
            const reviewerName = document.getElementById('reviewer-name');
            const reviewerTitle = document.querySelector('.reviewer-title');
            const reviewerBio = document.querySelector('.reviewer-bio');
            const largeAvatar = document.querySelector('.large-avatar');
            const ratingValue = document.querySelector('.rating-value');
            const reviewDate = document.getElementById('review-date');
            const fullReviewText = document.getElementById('full-review-text');

            reviewerName.textContent = selected.author;
            reviewerTitle.textContent = selected.category;
            reviewerBio.textContent = `Trusted RateMe reviewer sharing honest thoughts about ${selected.category.toLowerCase()}.`;
            if (selected.avatar) largeAvatar.src = selected.avatar;
            ratingValue.textContent = `${selected.rating} / 5.0`;
            reviewDate.textContent = selected.date;
            fullReviewText.textContent = selected.text;

            const bigStars = document.querySelector('.big-stars');
            const roundedRating = Math.max(1, Math.round(Number(selected.rating || 5)));
            bigStars.textContent = '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);

            const relatedTitle = document.querySelector('.related-reviews h3');
            if (relatedTitle) relatedTitle.textContent = `More ${selected.category} Reviews`;

            gsap.from('.detail-info > *', {
                duration: 0.5,
                opacity: 0,
                y: 18,
                stagger: 0.08,
                ease: 'power2.out'
            });
        }

        loadSelectedReview();

        // Page transition animations
        gsap.from('body', {
            duration: 0.6,
            opacity: 0,
            delay: 0.1
        });

        // Button animations
        document.querySelectorAll('.follow-btn, .btn-helpful, .btn-comment, .btn-share').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, { duration: 0.2, scale: 1.05 });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { duration: 0.2, scale: 1 });
            });
        });

        document.querySelector('.follow-btn').addEventListener('click', function() {
            const name = document.getElementById('reviewer-name').textContent;
            const followed = JSON.parse(localStorage.getItem('rateMe_followed') || '[]');
            if (!followed.includes(name)) followed.push(name);
            localStorage.setItem('rateMe_followed', JSON.stringify(followed));
            this.textContent = 'Following';
            showNotification(`You are now following ${name}.`);
        });

        document.querySelector('.btn-helpful').addEventListener('click', function() {
            const current = Number((this.textContent.match(/\d+/) || ['0'])[0]) + 1;
            this.textContent = `Helpful (${current})`;
            showNotification('Saved as helpful.');
        });

        document.querySelector('.btn-comment').addEventListener('click', function() {
            const comment = prompt('Write a short comment:');
            if (!comment) return;
            const comments = JSON.parse(localStorage.getItem('rateMe_comments') || '[]');
            comments.push({
                review: document.title.replace(' - RateMe', ''),
                comment,
                date: new Date().toISOString()
            });
            localStorage.setItem('rateMe_comments', JSON.stringify(comments));
            showNotification('Comment saved.');
        });

        document.querySelector('.btn-share').addEventListener('click', async function() {
            const shareText = document.title;
            try {
                if (navigator.share) {
                    await navigator.share({ title: shareText, url: window.location.href });
                } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(window.location.href);
                    showNotification('Review link copied.');
                } else {
                    showNotification(window.location.href, 5000);
                }
            } catch (error) {
                showNotification('Share was cancelled.');
            }
        });

        // Related cards animation
        gsap.from('.related-card', {
            duration: 0.6,
            opacity: 0,
            y: 30,
            stagger: 0.1,
            delay: 0.3
        });