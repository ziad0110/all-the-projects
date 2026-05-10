/* ============================================
   سطر (Satr) - Main Application Controller
   ============================================ */

const App = {
    init() {
        DataStore.init();
        I18n.init();

        this.renderPortfolio();
        this.renderTeam();
        this.renderTestimonials();
        this.renderBlogPreview();
        this.renderServices();

        this.initNavigation();
        this.initThemeToggle();
        this.initLangToggle();
        this.initPortfolioFilters();
        this.initTestimonialsSlider();
        this.initContactForm();
        this.initBackToTop();
        this.initSmoothScroll();
        this.initMobileMenu();

        Animations.init();
        Animations.initLazyLoading();

        // Re-render on language change
        window.addEventListener('langChanged', () => {
            this.renderPortfolio();
            this.renderTeam();
            this.renderTestimonials();
            this.renderBlogPreview();
            this.renderServices();
            Animations.initScrollReveal();
        });
    },

    // ============ Navigation ============
    initNavigation() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });

        // Active link tracking
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollY + 200;

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');

                if (scrollPos >= top && scrollPos < top + height) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    },

    // ============ Mobile Menu ============
    initMobileMenu() {
        const burger = document.querySelector('.burger-menu');
        const mobileNav = document.querySelector('.mobile-nav');
        if (!burger || !mobileNav) return;

        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            mobileNav.classList.toggle('active');
            document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
        });

        mobileNav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burger.classList.remove('active');
                mobileNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    },

    // ============ Theme Toggle ============
    initThemeToggle() {
        const btn = document.querySelector('.theme-toggle');
        if (!btn) return;

        const savedTheme = localStorage.getItem('satr_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(btn, savedTheme);

        btn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('satr_theme', next);
            this.updateThemeIcon(btn, next);
        });
    },

    updateThemeIcon(btn, theme) {
        btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    },

    // ============ Language Toggle ============
    initLangToggle() {
        const btn = document.querySelector('.lang-toggle');
        if (!btn) return;

        btn.addEventListener('click', () => {
            I18n.toggleLang();
        });
    },

    // ============ Smooth Scroll ============
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    const offset = 80;
                    const top = target.offsetTop - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    },

    // ============ Back to Top ============
    initBackToTop() {
        const btn = document.querySelector('.back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 500);
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    // ============ Render Services ============
    renderServices() {
        const container = document.querySelector('.services-grid');
        if (!container) return;

        const services = DataStore.getData('services');
        const icons = ['🌐', '📈', '🎨'];

        container.innerHTML = services.map((service, i) => `
      <div class="service-card reveal stagger-${i + 1}">
        <div class="service-icon">${service.icon || icons[i] || '⚡'}</div>
        <h3>${I18n.getLocalized(service, 'title')}</h3>
        <p>${I18n.getLocalized(service, 'description')}</p>
      </div>
    `).join('');
    },

    // ============ Render Portfolio ============
    renderPortfolio(filter = 'all') {
        const container = document.querySelector('.portfolio-grid');
        if (!container) return;

        let items = DataStore.getData('portfolio');
        if (filter !== 'all') {
            items = items.filter(item => item.category === filter);
        }

        const categoryLabels = {
            web: I18n.t('filter_web'),
            marketing: I18n.t('filter_marketing'),
            advertising: I18n.t('filter_advertising')
        };

        container.innerHTML = items.map((item, i) => `
      <div class="portfolio-item reveal stagger-${(i % 3) + 1}" data-category="${item.category}" data-id="${item.id}">
        <div class="portfolio-item-image">
          ${item.image
                ? `<img src="${item.image}" alt="${I18n.getLocalized(item, 'title')}" loading="lazy">`
                : `<div style="width:100%;height:100%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:3rem;opacity:0.3">
                ${item.category === 'web' ? '🌐' : item.category === 'marketing' ? '📈' : '🎨'}
              </div>`
            }
          <div class="portfolio-item-overlay">
            <button class="btn btn-primary" onclick="App.showPortfolioModal('${item.id}')">${I18n.t('portfolio_view')}</button>
          </div>
        </div>
        <div class="portfolio-item-info">
          <h3>${I18n.getLocalized(item, 'title')}</h3>
          <p>${I18n.getLocalized(item, 'description').substring(0, 80)}...</p>
          <span class="portfolio-item-tag">${categoryLabels[item.category] || item.category}</span>
        </div>
      </div>
    `).join('');

        // Re-init scroll reveals for new items
        setTimeout(() => Animations.initScrollReveal(), 100);
    },

    // ============ Portfolio Filters ============
    initPortfolioFilters() {
        const buttons = document.querySelectorAll('.filter-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderPortfolio(btn.dataset.filter);
            });
        });
    },

    // ============ Portfolio Modal ============
    showPortfolioModal(id) {
        const item = DataStore.getItem('portfolio', id);
        if (!item) return;

        const modal = document.getElementById('portfolioModal');
        if (!modal) return;

        const categoryLabels = {
            web: I18n.t('filter_web'),
            marketing: I18n.t('filter_marketing'),
            advertising: I18n.t('filter_advertising')
        };

        modal.querySelector('.modal-title').textContent = I18n.getLocalized(item, 'title');
        modal.querySelector('.modal-body').innerHTML = `
      ${item.image
                ? `<img src="${item.image}" alt="${I18n.getLocalized(item, 'title')}" style="width:100%;border-radius:var(--radius-md);margin-bottom:1.5rem;">`
                : `<div style="width:100%;aspect-ratio:16/9;background:var(--gradient-primary);border-radius:var(--radius-md);margin-bottom:1.5rem;display:flex;align-items:center;justify-content:center;font-size:4rem;opacity:0.3">
            ${item.category === 'web' ? '🌐' : item.category === 'marketing' ? '📈' : '🎨'}
          </div>`
            }
      <span class="portfolio-item-tag" style="margin-bottom:1rem;display:inline-block;">${categoryLabels[item.category] || item.category}</span>
      <p style="color:var(--text-secondary);line-height:1.8;font-size:1.05rem;">${I18n.getLocalized(item, 'description')}</p>
      ${item.link && item.link !== '#' ? `<a href="${item.link}" target="_blank" class="btn btn-primary" style="margin-top:1.5rem;">${I18n.t('portfolio_visit')} →</a>` : ''}
    `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // ============ Render Team ============
    renderTeam() {
        const container = document.querySelector('.team-grid');
        if (!container) return;

        const team = DataStore.getData('team');
        const defaultAvatar = (name) => {
            const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2);
            return `<div style="width:100%;height:100%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:700;color:white;border-radius:50%">${initials}</div>`;
        };

        container.innerHTML = team.map((member, i) => `
      <div class="team-card reveal stagger-${(i % 4) + 1}">
        <div class="team-card-image">
          ${member.image
                ? `<img src="${member.image}" alt="${I18n.getLocalized(member, 'name')}">`
                : defaultAvatar(I18n.getLocalized(member, 'name'))
            }
        </div>
        <h3>${I18n.getLocalized(member, 'name')}</h3>
        <p class="role">${I18n.getLocalized(member, 'role')}</p>
        <p class="bio">${I18n.getLocalized(member, 'bio')}</p>
        <div class="team-social">
          ${member.social?.twitter ? `<a href="${member.social.twitter}" aria-label="Twitter">𝕏</a>` : ''}
          ${member.social?.linkedin ? `<a href="${member.social.linkedin}" aria-label="LinkedIn">in</a>` : ''}
          ${member.social?.github ? `<a href="${member.social.github}" aria-label="GitHub">⌨</a>` : ''}
          ${member.social?.dribbble ? `<a href="${member.social.dribbble}" aria-label="Dribbble">◉</a>` : ''}
          ${member.social?.instagram ? `<a href="${member.social.instagram}" aria-label="Instagram">📷</a>` : ''}
        </div>
      </div>
    `).join('');
    },

    // ============ Render Testimonials ============
    renderTestimonials() {
        const track = document.querySelector('.testimonials-track');
        const dotsContainer = document.querySelector('.testimonials-dots');
        if (!track) return;

        const testimonials = DataStore.getData('testimonials');

        track.innerHTML = testimonials.map(item => `
      <div class="testimonial-slide">
        <div class="testimonial-card">
          <p class="testimonial-text">"${I18n.getLocalized(item, 'text')}"</p>
          <div class="testimonial-author">
            ${item.image
                ? `<img src="${item.image}" alt="${I18n.getLocalized(item, 'name')}">`
                : `<div style="width:50px;height:50px;border-radius:50%;background:var(--gradient-accent);display:flex;align-items:center;justify-content:center;font-weight:700;color:white;border:2px solid var(--color-blue);">${I18n.getLocalized(item, 'name').charAt(0)}</div>`
            }
            <div class="testimonial-author-info">
              <h4>${I18n.getLocalized(item, 'name')}</h4>
              <span>${I18n.getLocalized(item, 'company')}</span>
            </div>
          </div>
          <div style="margin-top:1rem;color:var(--color-warning);">${'★'.repeat(item.rating || 5)}${'☆'.repeat(5 - (item.rating || 5))}</div>
        </div>
      </div>
    `).join('');

        if (dotsContainer) {
            dotsContainer.innerHTML = testimonials.map((_, i) =>
                `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
            ).join('');

            dotsContainer.querySelectorAll('.dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    this.goToTestimonial(parseInt(dot.dataset.index));
                });
            });
        }

        this.currentTestimonial = 0;
    },

    // ============ Testimonials Slider ============
    initTestimonialsSlider() {
        const prevBtn = document.querySelector('.testimonial-prev');
        const nextBtn = document.querySelector('.testimonial-next');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevTestimonial());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextTestimonial());

        // Auto-slide every 5 seconds
        setInterval(() => this.nextTestimonial(), 5000);
    },

    goToTestimonial(index) {
        const track = document.querySelector('.testimonials-track');
        const dots = document.querySelectorAll('.testimonials-dots .dot');
        const testimonials = DataStore.getData('testimonials');
        if (!track || !testimonials.length) return;

        this.currentTestimonial = ((index % testimonials.length) + testimonials.length) % testimonials.length;
        const isRTL = I18n.isRTL();
        const dir = isRTL ? 1 : -1;
        track.style.transform = `translateX(${dir * this.currentTestimonial * 100}%)`;

        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === this.currentTestimonial);
        });
    },

    nextTestimonial() {
        this.goToTestimonial((this.currentTestimonial || 0) + 1);
    },

    prevTestimonial() {
        this.goToTestimonial((this.currentTestimonial || 0) - 1);
    },

    // ============ Render Blog Preview ============
    renderBlogPreview() {
        const container = document.querySelector('.blog-grid');
        if (!container) return;

        const posts = DataStore.getData('blog').slice(0, 3);

        container.innerHTML = posts.map((post, i) => `
      <div class="blog-card reveal stagger-${i + 1}">
        <div class="blog-card-image">
          ${post.image
                ? `<img src="${post.image}" alt="${I18n.getLocalized(post, 'title')}" loading="lazy">`
                : `<div style="width:100%;height:100%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:2.5rem;opacity:0.3">📝</div>`
            }
        </div>
        <div class="blog-card-content">
          <div class="blog-card-meta">
            <span>📅 ${new Date(post.date).toLocaleDateString(I18n.currentLang === 'ar' ? 'ar-SA' : 'en-US')}</span>
            <span>✍️ ${I18n.getLocalized(post, 'author')}</span>
          </div>
          <h3>${I18n.getLocalized(post, 'title')}</h3>
          <p>${I18n.getLocalized(post, 'excerpt')}</p>
          <a href="blog.html?id=${post.id}" class="blog-card-link">${I18n.t('blog_read_more')} →</a>
        </div>
      </div>
    `).join('');
    },

    // ============ Contact Form ============
    initContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = Object.fromEntries(formData);

            // Validate
            if (!data.name || !data.email || !data.message) {
                this.showToast(I18n.currentLang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields', 'error');
                return;
            }

            if (!this.isValidEmail(data.email)) {
                this.showToast(I18n.currentLang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email', 'error');
                return;
            }

            // Simulate sending
            const btn = form.querySelector('button[type="submit"]');
            btn.disabled = true;
            btn.textContent = I18n.currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';

            setTimeout(() => {
                this.showToast(I18n.t('contact_success'), 'success');
                form.reset();
                btn.disabled = false;
                btn.textContent = I18n.t('contact_send');
            }, 1500);
        });
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // ============ Toast Notifications ============
    showToast(message, type = 'info') {
        const container = document.querySelector('.toast-container') || this.createToastContainer();
        const icons = { success: '✓', error: '✕', info: 'ℹ' };

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span style="font-size:1.1rem;">${icons[type] || icons.info}</span><span>${message}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
