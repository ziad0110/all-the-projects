/**
 * Animations Module
 * Particle background, page transitions, and shared animation effects
 */

class ParticleBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;

        this.resize();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        const count = Math.min(80, Math.floor(window.innerWidth * window.innerHeight / 15000));
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
                color: this.getRandomColor(),
                pulseSpeed: Math.random() * 0.02 + 0.01,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    getRandomColor() {
        const colors = [
            '0, 212, 255',    // cyan
            '168, 85, 247',   // purple
            '244, 114, 182',  // pink
            '6, 214, 160',    // green
            '67, 97, 238',    // blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update & draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Bounce
            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Pulse opacity
            p.pulsePhase += p.pulseSpeed;
            const pulse = Math.sin(p.pulsePhase) * 0.2 + 0.8;

            // Mouse attraction (subtle)
            const dx = this.mouse.x - p.x;
            const dy = this.mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                p.vx += dx * 0.00005;
                p.vy += dy * 0.00005;
            }

            // Speed limit
            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            if (speed > 1) {
                p.vx *= 0.99;
                p.vy *= 0.99;
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity * pulse})`;
            this.ctx.fill();

            // Draw glow
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius * 3 * pulse, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.1 * pulse})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx2 = p.x - p2.x;
                const dy2 = p.y - p2.y;
                const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
                if (dist2 < 150) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    const alpha = (1 - dist2 / 150) * 0.15;
                    this.ctx.strokeStyle = `rgba(${p.color}, ${alpha})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// ============================================================
// Animation Utilities
// ============================================================
const AnimUtils = {
    // Smooth number counter animation
    animateCounter(element, from, to, duration = 1000, suffix = '') {
        const start = performance.now();
        const update = (time) => {
            const elapsed = time - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = from + (to - from) * eased;
            element.textContent = (Number.isInteger(to) ? Math.round(current) : current.toFixed(2)) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    },

    // Create confetti burst at position
    createConfetti(container, x, y, count = 30) {
        const colors = ['#00d4ff', '#a855f7', '#f472b6', '#06d6a0', '#ffa502', '#e9c46a'];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.transform = `rotate(${Math.random() * 360}deg)`;

            const angle = (Math.random() * Math.PI * 2);
            const velocity = Math.random() * 150 + 50;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity;

            particle.style.setProperty('--dx', dx + 'px');
            particle.style.setProperty('--dy', dy + 'px');
            particle.style.animation = `confetti ${Math.random() * 1 + 0.5}s ease-out forwards`;
            particle.style.left = `calc(${x}px + var(--dx, 0px))`;

            container.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }
    },

    // Smooth scroll-like value interpolation
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    // Delay promise
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Animate element appearance
    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        element.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    },

    // Flash effect on element
    flash(element, color = 'var(--accent-cyan)', duration = 300) {
        const original = element.style.boxShadow;
        element.style.boxShadow = `0 0 20px ${color}, inset 0 0 10px ${color}`;
        element.style.transition = `box-shadow ${duration}ms ease`;
        setTimeout(() => {
            element.style.boxShadow = original;
        }, duration);
    },

    // Type text animation
    async typeText(element, text, speed = 50) {
        element.textContent = '';
        for (let i = 0; i < text.length; i++) {
            element.textContent += text[i];
            await this.delay(speed);
        }
    }
};

window.ParticleBackground = ParticleBackground;
window.AnimUtils = AnimUtils;
