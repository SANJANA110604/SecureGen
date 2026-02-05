// ===== ANIMATIONS AND UI EFFECTS MODULE =====
// Advanced animations and visual effects for enhanced user experience

class UIAnimations {
    constructor() {
        this.animations = {
            fadeIn: {
                duration: 300,
                easing: 'ease-out',
                keyframes: [
                    { opacity: 0, transform: 'translateY(20px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ]
            },
            slideIn: {
                duration: 400,
                easing: 'ease-out',
                keyframes: [
                    { opacity: 0, transform: 'translateX(-30px)' },
                    { opacity: 1, transform: 'translateX(0)' }
                ]
            },
            scaleIn: {
                duration: 250,
                easing: 'ease-out',
                keyframes: [
                    { opacity: 0, transform: 'scale(0.8)' },
                    { opacity: 1, transform: 'scale(1)' }
                ]
            },
            bounce: {
                duration: 600,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.1)' },
                    { transform: 'scale(1)' }
                ]
            },
            shake: {
                duration: 500,
                easing: 'ease-in-out',
                keyframes: [
                    { transform: 'translateX(0)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(-10px)' },
                    { transform: 'translateX(10px)' },
                    { transform: 'translateX(0)' }
                ]
            },
            pulse: {
                duration: 1000,
                easing: 'ease-in-out',
                iterations: Infinity,
                keyframes: [
                    { transform: 'scale(1)' },
                    { transform: 'scale(1.05)' },
                    { transform: 'scale(1)' }
                ]
            }
        };

        this.particleSystem = null;
        this.initParticleSystem();
    }

    animate(element, animationName, options = {}) {
        if (!element || !this.animations[animationName]) return;

        const animation = this.animations[animationName];
        const config = {
            duration: options.duration || animation.duration,
            easing: options.easing || animation.easing,
            fill: 'forwards',
            ...options
        };

        const animationInstance = element.animate(animation.keyframes, config);

        if (options.callback) {
            animationInstance.addEventListener('finish', options.callback);
        }

        return animationInstance;
    }

    fadeIn(element, delay = 0) {
        if (delay > 0) {
            setTimeout(() => this.animate(element, 'fadeIn'), delay);
        } else {
            return this.animate(element, 'fadeIn');
        }
    }

    slideIn(element, direction = 'left', delay = 0) {
        const slideAnimation = {
            duration: 400,
            easing: 'ease-out',
            keyframes: direction === 'left' ?
                [
                    { opacity: 0, transform: 'translateX(-30px)' },
                    { opacity: 1, transform: 'translateX(0)' }
                ] :
                [
                    { opacity: 0, transform: 'translateX(30px)' },
                    { opacity: 1, transform: 'translateX(0)' }
                ]
        };

        if (delay > 0) {
            setTimeout(() => {
                element.animate(slideAnimation.keyframes, {
                    duration: slideAnimation.duration,
                    easing: slideAnimation.easing,
                    fill: 'forwards'
                });
            }, delay);
        } else {
            return element.animate(slideAnimation.keyframes, {
                duration: slideAnimation.duration,
                easing: slideAnimation.easing,
                fill: 'forwards'
            });
        }
    }

    scaleIn(element, delay = 0) {
        if (delay > 0) {
            setTimeout(() => this.animate(element, 'scaleIn'), delay);
        } else {
            return this.animate(element, 'scaleIn');
        }
    }

    bounce(element) {
        return this.animate(element, 'bounce');
    }

    shake(element) {
        return this.animate(element, 'shake');
    }

    pulse(element, continuous = false) {
        const config = continuous ? { iterations: Infinity } : {};
        return this.animate(element, 'pulse', config);
    }

    // Staggered animations for multiple elements
    staggerAnimate(elements, animationName, staggerDelay = 100) {
        elements.forEach((element, index) => {
            const delay = index * staggerDelay;
            this.animate(element, animationName, { delay });
        });
    }

    // Password generation animation sequence
    animatePasswordGeneration(container) {
        // Clear existing content with fade out
        const existingItems = container.querySelectorAll('.result-item');
        existingItems.forEach(item => {
            item.animate([
                { opacity: 1, transform: 'scale(1)' },
                { opacity: 0, transform: 'scale(0.95)' }
            ], {
                duration: 200,
                easing: 'ease-out',
                fill: 'forwards'
            }).addEventListener('finish', () => item.remove());
        });

        // Add new items with staggered animation
        setTimeout(() => {
            const newItems = container.querySelectorAll('.result-item');
            this.staggerAnimate(newItems, 'fadeIn', 150);
        }, 250);
    }

    // Strength meter animation
    animateStrengthMeter(meterElement, newWidth, color) {
        const currentWidth = parseFloat(meterElement.style.width) || 0;
        const widthDiff = newWidth - currentWidth;

        meterElement.animate([
            { width: `${currentWidth}%`, backgroundColor: meterElement.style.backgroundColor },
            { width: `${newWidth}%`, backgroundColor: color }
        ], {
            duration: Math.abs(widthDiff) * 10,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    // Toast notification animations
    showToast(message, type = 'success', duration = 3000) {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast show ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            </div>
            <div class="toast-content">
                <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Animate in
        this.fadeIn(toast);

        // Animate out
        setTimeout(() => {
            toast.animate([
                { opacity: 1, transform: 'translateY(0)' },
                { opacity: 0, transform: 'translateY(-20px)' }
            ], {
                duration: 300,
                easing: 'ease-in',
                fill: 'forwards'
            }).addEventListener('finish', () => toast.remove());
        }, duration);
    }

    // Loading animation
    showLoadingSpinner(container, message = 'Generating...') {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.innerHTML = `
            <div class="spinner">
                <div class="bounce1"></div>
                <div class="bounce2"></div>
                <div class="bounce3"></div>
            </div>
            <p>${message}</p>
        `;

        container.appendChild(spinner);
        this.fadeIn(spinner);

        return {
            hide: () => {
                spinner.animate([
                    { opacity: 1 },
                    { opacity: 0 }
                ], {
                    duration: 200,
                    easing: 'ease-out',
                    fill: 'forwards'
                }).addEventListener('finish', () => spinner.remove());
            }
        };
    }

    // Particle system for celebrations
    initParticleSystem() {
        this.particleSystem = {
            particles: [],
            canvas: null,
            ctx: null,
            animationId: null,

            init() {
                this.canvas = document.createElement('canvas');
                this.canvas.className = 'particle-canvas';
                this.canvas.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    pointer-events: none;
                    z-index: 9999;
                `;
                document.body.appendChild(this.canvas);
                this.ctx = this.canvas.getContext('2d');
                this.resize();
                window.addEventListener('resize', () => this.resize());
            },

            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            },

            createParticle(x, y, color) {
                return {
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 10,
                    vy: (Math.random() - 0.5) * 10,
                    life: 100,
                    maxLife: 100,
                    color,
                    size: Math.random() * 4 + 2
                };
            },

            emit(x, y, count = 20, color = '#10b981') {
                for (let i = 0; i < count; i++) {
                    this.particles.push(this.createParticle(x, y, color));
                }
                if (!this.animationId) {
                    this.animate();
                }
            },

            animate() {
                this.animationId = requestAnimationFrame(() => this.animate());

                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const particle = this.particles[i];

                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.vy += 0.1; // gravity
                    particle.life--;

                    const alpha = particle.life / particle.maxLife;
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();

                    if (particle.life <= 0) {
                        this.particles.splice(i, 1);
                    }
                }

                if (this.particles.length === 0) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }
        };

        this.particleSystem.init();
    }

    celebrate(element, particleColor = '#10b981') {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        this.particleSystem.emit(centerX, centerY, 30, particleColor);
        this.bounce(element);
    }

    // Typing animation for password preview
    typeWriter(element, text, speed = 50) {
        element.textContent = '';
        let i = 0;

        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };

        type();
    }

    // Hover effects
    addHoverEffect(element, effect = 'lift') {
        const effects = {
            lift: {
                hover: { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                normal: { transform: 'translateY(0)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }
            },
            glow: {
                hover: { boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' },
                normal: { boxShadow: 'none' }
            },
            scale: {
                hover: { transform: 'scale(1.05)' },
                normal: { transform: 'scale(1)' }
            }
        };

        const effectConfig = effects[effect];
        if (!effectConfig) return;

        element.style.transition = 'all 0.3s ease';

        element.addEventListener('mouseenter', () => {
            Object.assign(element.style, effectConfig.hover);
        });

        element.addEventListener('mouseleave', () => {
            Object.assign(element.style, effectConfig.normal);
        });
    }

    // Progress bar animation
    animateProgressBar(barElement, progress, color = '#10b981', duration = 1000) {
        const currentProgress = parseFloat(barElement.style.width) || 0;

        barElement.animate([
            { width: `${currentProgress}%` },
            { width: `${progress}%` }
        ], {
            duration,
            easing: 'ease-out',
            fill: 'forwards'
        });

        // Animate color change
        barElement.animate([
            { backgroundColor: barElement.style.backgroundColor || '#e5e7eb' },
            { backgroundColor: color }
        ], {
            duration: duration / 2,
            easing: 'ease-out',
            fill: 'forwards'
        });
    }

    // Counter animation
    animateCounter(element, targetValue, duration = 1000, suffix = '') {
        const startValue = parseFloat(element.textContent) || 0;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = Math.floor(startValue + (targetValue - startValue) * this.easeOutCubic(progress));
            element.textContent = currentValue + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Ripple effect for buttons
    addRippleEffect(button) {
        button.addEventListener('click', (e) => {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    }
}

// ===== EXPORT ANIMATIONS INSTANCE =====
const uiAnimations = new UIAnimations();
