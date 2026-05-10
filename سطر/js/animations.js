/* ============================================
   سطر (Satr) - Animations Module
   Particles, custom cursor, counters, scroll reveals
   ============================================ */

const Animations = {
    init() {
        this.initParticles();
        this.initScrollReveal();
        this.initCounters();
        this.initTypingEffect();
        this.initLoadingScreen();
    },

    // ============ Loading Screen ============
    initLoadingScreen() {
        const loadingScreen = document.querySelector('.loading-screen');
        if (!loadingScreen) return;

        window.addEventListener('load', () => {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';
                // Trigger hero animations after load
                this.animateHero();
            }, 2200);
        });

        // Fallback - hide after 4 seconds max
        setTimeout(() => {
            if (!loadingScreen.classList.contains('hidden')) {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';
            }
        }, 4000);
    },

    // ============ Hero Animations ============
    animateHero() {
        const heroContent = document.querySelector('.hero-content');
        const heroVisual = document.querySelector('.hero-visual');

        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(30px)';

            setTimeout(() => {
                heroContent.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'translateY(0)';
            }, 300);
        }

        if (heroVisual) {
            heroVisual.style.opacity = '0';
            heroVisual.style.transform = 'translateX(30px)';

            setTimeout(() => {
                heroVisual.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
                heroVisual.style.opacity = '1';
                heroVisual.style.transform = 'translateX(0)';
            }, 600);
        }
    },

    // ============ Particle Background ============
    initParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouseX = 0, mouseY = 0;
        let animationId;

        const resize = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Mouse interaction
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }

                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
                ctx.fill();
            }
        }

        const initParticles = () => {
            const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 100);
            particles = Array.from({ length: count }, () => new Particle());
        };

        const drawLines = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(59, 130, 246, ${0.08 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawLines();
            animationId = requestAnimationFrame(animate);
        };

        resize();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resize();
            initParticles();
        });

        canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });
    },

    // ============ Custom Cursor ============
    initCustomCursor() {
        // Skip on mobile/touch devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
        if (window.innerWidth < 768) return;

        const dot = document.querySelector('.cursor-dot');
        const ring = document.querySelector('.cursor-ring');
        if (!dot || !ring) return;

        let cursorX = 0, cursorY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            cursorX = e.clientX;
            cursorY = e.clientY;
            dot.style.left = cursorX - 4 + 'px';
            dot.style.top = cursorY - 4 + 'px';
        });

        const animateRing = () => {
            ringX += (cursorX - ringX) * 0.15;
            ringY += (cursorY - ringY) * 0.15;
            ring.style.left = ringX - 17.5 + 'px';
            ring.style.top = ringY - 17.5 + 'px';
            requestAnimationFrame(animateRing);
        };
        animateRing();

        // Hover effects
        const hoverElements = document.querySelectorAll('a, button, .portfolio-item, .service-card, .team-card, .blog-card, input, textarea');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => ring.classList.add('hover'));
            el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
        });
    },

    // ============ Scroll Reveal ============
    initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

        if (!revealElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
    },

    // ============ Animated Counters ============
    initCounters() {
        const counters = document.querySelectorAll('.counter-number');
        if (!counters.length) return;

        const animateCounter = (el) => {
            const target = parseInt(el.getAttribute('data-target'));
            const suffix = el.getAttribute('data-suffix') || '';
            const duration = 2000;
            const start = performance.now();

            const update = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                // Easing function
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(eased * target);

                el.textContent = current.toLocaleString() + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target.toLocaleString() + suffix;
                }
            };

            requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    },

    // ============ Typing Effect ============
    initTypingEffect() {
        const el = document.querySelector('.typed-text');
        if (!el) return;

        const lang = document.documentElement.lang || 'ar';
        const words = lang === 'ar'
            ? ['واقع رقمي مبهر', 'تجربة فريدة', 'نجاح مضمون', 'إبداع لا حدود له']
            : ['Stunning Digital Reality', 'Unique Experience', 'Guaranteed Success', 'Unlimited Creativity'];

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 100;

        const type = () => {
            const currentWord = words[wordIndex];

            if (isDeleting) {
                el.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 50;
            } else {
                el.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 100;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        };

        // Start after loading screen
        setTimeout(type, 2500);

        // Re-init on language change
        window.addEventListener('langChanged', (e) => {
            wordIndex = 0;
            charIndex = 0;
            isDeleting = false;
        });
    },

    // ============ Lazy Loading Images ============
    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (!images.length) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    });
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });

        images.forEach(img => imageObserver.observe(img));
    },

    // ============ Parallax Effect ============
    initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (!parallaxElements.length) return;

        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            parallaxElements.forEach(el => {
                const speed = parseFloat(el.dataset.parallax) || 0.5;
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
        });
    }
};
