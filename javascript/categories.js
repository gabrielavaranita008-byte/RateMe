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

        gsap.registerPlugin(ScrollTrigger);

        const categoryDetails = {
            Dining: ['Best restaurants', 'Cafe reviews', 'Service ratings'],
            Shopping: ['Top products', 'Store experience', 'Value for money'],
            Travel: ['Hotels', 'Destinations', 'Adventure tips'],
            Technology: ['Apps', 'Gadgets', 'Software tools'],
            Entertainment: ['Movies', 'Shows', 'Games'],
            Fitness: ['Gyms', 'Programs', 'Wellness services']
        };

        function toggleCategoryCard(card) {
            const categoryName = card.querySelector('.category-name').textContent.trim();
            const details = categoryDetails[categoryName] || ['Top reviews', 'New activity', 'Community picks'];

            document.querySelectorAll('.category-card.is-expanded').forEach(openCard => {
                if (openCard !== card) {
                    const openDetails = openCard.querySelector('.category-expanded-details');
                    gsap.to(openDetails, {
                        duration: 0.25,
                        height: 0,
                        opacity: 0,
                        ease: 'power2.in',
                        onComplete: () => openCard.classList.remove('is-expanded')
                    });
                }
            });

            if (!card.querySelector('.category-expanded-details')) {
                card.querySelector('.category-card-content').insertAdjacentHTML('beforeend', `
                    <div class="category-expanded-details">
                        <h4>What you can explore</h4>
                        <div class="category-detail-grid">
                            ${details.map(item => `
                                <div class="category-detail-item">
                                    <strong>${item}</strong>
                                    <span>Open reviews, ratings, and saved activity for this area.</span>
                                </div>
                            `).join('')}
                        </div>
                       <a href="categorie-detail.html"><button class="open-category-btn" type="button">Open ${categoryName}</button></a>
                    </div>
                `);
            }

            const panel = card.querySelector('.category-expanded-details');
            if (card.classList.contains('is-expanded')) {
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
                { height: 0, opacity: 0, y: -10 },
                { duration: 0.45, height, opacity: 1, y: 0, ease: 'power3.out', onComplete: () => gsap.set(panel, { height: 'auto' }) }
            );
            gsap.from(panel.querySelectorAll('.category-detail-item'), {
                duration: 0.35,
                opacity: 0,
                y: 14,
                stagger: 0.07,
                ease: 'power2.out'
            });
        }

        // Animate category cards
        document.querySelectorAll('.category-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    once: true,
                },
                duration: 0.7,
                opacity: 0,
                y: 50,
                rotation: 5,
                delay: index * 0.1,
                ease: 'back.out',
            });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.4,
                    y: -15,
                    boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5)',
                    ease: 'power2.out',
                });

                gsap.to(card.querySelector('.category-icon'), {
                    duration: 0.4,
                    scale: 1.2,
                    rotation: 10,
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.4,
                    y: 0,
                    boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
                });

                gsap.to(card.querySelector('.category-icon'), {
                    duration: 0.4,
                    scale: 1,
                    rotation: 0,
                });
            });

            card.addEventListener('click', () => {
                createRipple({ clientX: card.offsetWidth / 2, clientY: card.offsetHeight / 2 }, card);
                toggleCategoryCard(card);
            });
        });

        document.addEventListener('click', (event) => {
            const button = event.target.closest('.open-category-btn');
            if (!button) return;
            event.stopPropagation();
            const card = button.closest('.category-card');
            const categoryName = card.querySelector('.category-name').textContent.trim();
            localStorage.setItem('rateMe_selectedCategory', categoryName);
            gsap.to('body', {
                duration: 0.35,
                opacity: 0,
                onComplete: () => {
                    window.location.href = `category-detail.html?category=${encodeURIComponent(categoryName)}`;
                }
            });
        });

        // Animate stat cards
        document.querySelectorAll('.stat-card').forEach((card, index) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    once: true,
                },
                duration: 0.6,
                opacity: 0,
                scale: 0.8,
                delay: index * 0.1,
                ease: 'back.out',
            });

            card.addEventListener('mouseenter', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: -8,
                    boxShadow: '0 20px 50px rgba(99, 102, 241, 0.2)',
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    duration: 0.3,
                    y: 0,
                    boxShadow: 'none',
                });
            });
        });

        // Load UserManager
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
                    showNotification('❌ Please fill all fields');
                    return;
                }
                
                this.currentUser = { name, email, password, joinedDate: new Date().toISOString() };
                localStorage.setItem('rateMe_user', JSON.stringify(this.currentUser));
                
                this.updateLoginUI();
                showNotification(`Welcome ${name}! You are now logged in!`);
                
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
                    if (navBtn) navBtn.textContent = 'sLogin';
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

        const categoryData = {
            Dining: {
                icon: '🍽',
                title: 'Dining',
                desc: 'Restaurants, cafes, service quality, food photos, and real customer experiences',
                stats: ['2,450 Reviews', '4.7 Average Rating', '8,420 Reviewers'],
                products: ['Urban Bistro', 'Coffee Corner', 'Fine Dining Club', 'Street Food Market', 'Vegan Kitchen', 'Dessert Lab']
            },
            Shopping: {
                icon: '🛍',
                title: 'Shopping',
                desc: 'Products, stores, brands, delivery, and honest buying experiences',
                stats: ['3,120 Reviews', '4.8 Average Rating', '12,345 Reviewers'],
                products: ['Premium Wireless Headphones', 'Smart Watch Pro', 'Portable Camera', 'Designer Backpack', 'Fashion Sunglasses', 'Running Shoes']
            },
            Travel: {
                icon: '✈',
                title: 'Travel',
                desc: 'Hotels, destinations, transport, tours, and unforgettable adventures',
                stats: ['1,890 Reviews', '4.9 Average Rating', '6,780 Reviewers'],
                products: ['Beach Resort', 'City Hotel', 'Mountain Cabin', 'Guided Tour', 'Flight Experience', 'Travel Backpack']
            },
            Technology: {
                icon: '💻',
                title: 'Technology',
                desc: 'Apps, devices, software, gadgets, and tools people actually use',
                stats: ['4,567 Reviews', '4.6 Average Rating', '15,230 Reviewers'],
                products: ['Productivity App', 'Smart Speaker', 'Gaming Laptop', 'Design Software', 'Wireless Router', 'AI Notes Tool']
            },
            Entertainment: {
                icon: '🎬',
                title: 'Entertainment',
                desc: 'Movies, shows, games, concerts, and places to spend free time',
                stats: ['2,780 Reviews', '4.5 Average Rating', '9,820 Reviewers'],
                products: ['Streaming Series', 'Indie Game', 'Cinema Night', 'Live Concert', 'Board Game', 'Podcast Show']
            },
            Fitness: {
                icon: '🏋',
                title: 'Fitness',
                desc: 'Gyms, trainers, wellness programs, equipment, and healthy routines',
                stats: ['1,645 Reviews', '4.7 Average Rating', '5,410 Reviewers'],
                products: ['Local Gym', 'Yoga Studio', 'Fitness App', 'Running Program', 'Wellness Coach', 'Home Equipment']
            }
        };

        function loadCategoryFromSelection() {
            const params = new URLSearchParams(window.location.search);
            const rawSelectedName = params.get('category') || localStorage.getItem('rateMe_selectedCategory') || 'Shopping';
            const selectedName = Object.keys(categoryData).find(name => name.toLowerCase() === rawSelectedName.toLowerCase()) || 'Shopping';
            const data = categoryData[selectedName] || categoryData.Shopping;

            document.title = `${data.title} - RateMe`;
            document.getElementById('category-icon').textContent = data.icon;
            document.getElementById('category-title').textContent = data.title;
            document.getElementById('category-desc').textContent = data.desc;
            document.querySelector('.category-stats').innerHTML = data.stats.map(stat => `<span>${stat}</span>`).join('');

            document.querySelectorAll('.product-card').forEach((card, index) => {
                const name = data.products[index] || data.products[0];
                card.querySelector('h3').textContent = name;
                card.querySelector('.product-desc').textContent = `Community picks and detailed ratings for ${name.toLowerCase()} in ${data.title}.`;
            });

            gsap.from('.category-hero, .category-tabs, .tab-content', {
                duration: 0.55,
                opacity: 0,
                y: 22,
                stagger: 0.08,
                ease: 'power2.out'
            });
        }

        loadCategoryFromSelection();

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

        // Tabs functionality
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                const pane = document.getElementById(tabId);
                if (pane) {
                    pane.classList.add('active');
                    
                    gsap.from(pane, {
                        duration: 0.4,
                        opacity: 0,
                        y: 20
                    });
                }
            });
        });

        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            window.location.href = 'categories.html';
        });

        // Page animation
        gsap.from('body', {
            duration: 0.6,
            opacity: 0,
            delay: 0.1
        });

        // Button animations
        document.querySelectorAll('.btn-review, .btn-read, .btn-helpful, .btn-reply').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, { duration: 0.2, scale: 1.05 });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { duration: 0.2, scale: 1 });
            });
        });

        document.querySelectorAll('.btn-review').forEach(button => {
            button.addEventListener('click', () => {
                const card = button.closest('.product-card');
                const productName = card.querySelector('h3').textContent.trim();
                const categoryName = document.getElementById('category-title').textContent.trim();
                localStorage.setItem('rateMe_selectedProduct', productName);
                localStorage.setItem('rateMe_reviewSearch', categoryName);
                window.location.href = `reviews.html?search=${encodeURIComponent(categoryName)}`;
            });
        });

        document.querySelectorAll('.btn-read').forEach(button => {
            button.addEventListener('click', () => {
                const guide = button.closest('.guide-card');
                const title = guide.querySelector('h3').textContent.trim();
                const existing = guide.querySelector('.guide-expanded');
                if (existing) {
                    gsap.to(existing, {
                        duration: 0.25,
                        height: 0,
                        opacity: 0,
                        onComplete: () => existing.remove()
                    });
                    return;
                }
                guide.insertAdjacentHTML('beforeend', `
                    <div class="guide-expanded" style="overflow:hidden; margin-top:15px; color:var(--text-light); line-height:1.6;">
                        This guide helps you compare options, check reviews, look at rating history, and avoid weak choices before buying.
                    </div>
                `);
                const panel = guide.querySelector('.guide-expanded');
                gsap.from(panel, { duration: 0.35, height: 0, opacity: 0, y: -8, ease: 'power2.out' });
                showNotification(`Opened guide: ${title}`);
            });
        });

        document.querySelectorAll('.btn-helpful').forEach(button => {
            button.addEventListener('click', () => {
                const current = Number((button.textContent.match(/\d+/) || ['0'])[0]) + 1;
                button.textContent = `Helpful (${current})`;
                showNotification('Marked as helpful.');
            });
        });

        document.querySelectorAll('.btn-reply').forEach(button => {
            button.addEventListener('click', () => {
                const reply = prompt('Write a reply:');
                if (!reply) return;
                const replies = JSON.parse(localStorage.getItem('rateMe_replies') || '[]');
                replies.push({ reply, category: document.getElementById('category-title').textContent, date: new Date().toISOString() });
                localStorage.setItem('rateMe_replies', JSON.stringify(replies));
                showNotification('Reply saved.');
            });
        });

        const categoryReviewForm = document.getElementById('category-review-form');
        if (categoryReviewForm) {
            categoryReviewForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const user = userManager.getCurrentUser();
                if (!user) {
                    showNotification('Please login before publishing a review.');
                    openModal('login-modal');
                    return;
                }

                const categoryName = document.getElementById('category-title').textContent.trim();
                const subject = document.getElementById('category-review-title').value.trim();
                const rating = Number(document.getElementById('category-review-rating').value);
                const review = document.getElementById('category-review-text').value.trim();
                if (!subject || !rating || !review) {
                    showNotification('Please complete the review form.');
                    return;
                }

                const reviews = JSON.parse(localStorage.getItem('rateMe_reviews') || '[]');
                reviews.push({
                    subject,
                    category: categoryName,
                    rating,
                    review,
                    userName: user.name,
                    userEmail: user.email,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('rateMe_reviews', JSON.stringify(reviews));
                categoryReviewForm.reset();
                showNotification('Review published and saved to your profile.');

                gsap.fromTo(categoryReviewForm, { scale: 0.98 }, { duration: 0.35, scale: 1, ease: 'back.out' });
            });
        }

        // Products grid animation
        gsap.from('.product-card', {
            duration: 0.6,
            opacity: 0,
            y: 30,
            stagger: 0.1,
            delay: 0.3
        });