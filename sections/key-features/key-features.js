/**
 * BuilderSolve Key Features Carousel
 * Modern carousel with 16:9 cards and smooth animations
 */

class KeyFeaturesCarousel {
    constructor(options = {}) {
        // Configuration
        this.config = {
            autoplayDelay: 5000,
            transitionDuration: 500,
            touchThreshold: 50,
            ...options
        };

        // State
        this.state = {
            currentIndex: 0,
            totalSlides: 0,
            isAutoPlaying: true,
            isTransitioning: false,
            touchStartX: 0,
            touchEndX: 0
        };

        // DOM elements
        this.elements = {};
        
        // Timers
        this.autoplayTimer = null;
        this.transitionTimer = null;

        // Initialize
        this.init();
    }

    /**
     * Initialize carousel
     */
    async init() {
        try {
            await this.waitForDOM();
            this.cacheElements();
            this.setupCarousel();
            this.bindEvents();
            this.startAutoplay();
            console.log('✅ Key Features Carousel initialized');
        } catch (error) {
            console.error('❌ Carousel initialization failed:', error);
            // Retry after a delay
            setTimeout(() => this.init(), 1000);
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        const section = document.getElementById('key-features-section');
        if (!section) {
            throw new Error('Key features section not found');
        }

        this.elements = {
            section,
            track: section.querySelector('.features-track'),
            cards: section.querySelectorAll('.feature-card'),
            prevBtn: section.querySelector('.features-nav-prev'),
            nextBtn: section.querySelector('.features-nav-next'),
            dots: section.querySelectorAll('.feature-dot'),
            viewport: section.querySelector('.features-viewport')
        };

        // Validate critical elements
        if (!this.elements.track || !this.elements.cards.length) {
            throw new Error('Critical carousel elements not found');
        }

        this.state.totalSlides = this.elements.cards.length;
    }

    /**
     * Setup carousel initial state
     */
    setupCarousel() {
        // Set initial card states
        this.updateCardStates();
        this.updateTrackPosition();
        this.updateDots();
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Navigation buttons
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.next());
        }

        // Dot navigation
        this.elements.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => this.goToSlide(index));
        });

        // Touch events
        if (this.elements.viewport) {
            this.elements.viewport.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
            this.elements.viewport.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
            this.elements.viewport.addEventListener('touchend', this.handleTouchEnd.bind(this));
        }

        // Pause on hover
        this.elements.section.addEventListener('mouseenter', () => this.pauseAutoplay());
        this.elements.section.addEventListener('mouseleave', () => this.resumeAutoplay());

        // Card clicks
        this.elements.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                if (index !== this.state.currentIndex) {
                    this.goToSlide(index);
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // Window resize
        window.addEventListener('resize', this.debounce(() => {
            this.updateTrackPosition();
        }, 250));
    }

    /**
     * Go to specific slide
     */
    goToSlide(index) {
        if (this.state.isTransitioning || index === this.state.currentIndex) {
            return;
        }

        // Validate index
        if (index < 0) {
            index = this.state.totalSlides - 1;
        } else if (index >= this.state.totalSlides) {
            index = 0;
        }

        this.state.isTransitioning = true;
        this.state.currentIndex = index;

        // Update UI
        this.updateCardStates();
        this.updateTrackPosition();
        this.updateDots();

        // Reset transition flag
        this.transitionTimer = setTimeout(() => {
            this.state.isTransitioning = false;
        }, this.config.transitionDuration);
    }

    /**
     * Navigate to previous slide
     */
    prev() {
        this.goToSlide(this.state.currentIndex - 1);
    }

    /**
     * Navigate to next slide
     */
    next() {
        this.goToSlide(this.state.currentIndex + 1);
    }

    /**
     * Update card active states
     */
    updateCardStates() {
        this.elements.cards.forEach((card, index) => {
            card.classList.remove('active', 'adjacent');
            
            if (index === this.state.currentIndex) {
                card.classList.add('active');
            } else if (
                index === this.state.currentIndex - 1 ||
                index === this.state.currentIndex + 1 ||
                (this.state.currentIndex === 0 && index === this.state.totalSlides - 1) ||
                (this.state.currentIndex === this.state.totalSlides - 1 && index === 0)
            ) {
                card.classList.add('adjacent');
            }
        });
    }

    /**
     * Update track position
     */
    updateTrackPosition() {
        const cardWidth = this.elements.cards[0].offsetWidth;
        const gap = 24; // Gap between cards
        const totalWidth = cardWidth + gap;
        const offset = -(this.state.currentIndex * totalWidth);
        
        this.elements.track.style.transform = `translateX(${offset}px)`;
    }

    /**
     * Update dot indicators
     */
    updateDots() {
        this.elements.dots.forEach((dot, index) => {
            if (index === this.state.currentIndex) {
                dot.classList.add('active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.classList.remove('active');
                dot.setAttribute('aria-selected', 'false');
            }
        });
    }

    /**
     * Touch event handlers
     */
    handleTouchStart(e) {
        this.state.touchStartX = e.touches[0].clientX;
    }

    handleTouchMove(e) {
        if (!this.state.touchStartX) return;
        
        const currentX = e.touches[0].clientX;
        const diff = this.state.touchStartX - currentX;

        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.state.touchStartX) return;

        const endX = e.changedTouches[0].clientX;
        const diff = this.state.touchStartX - endX;

        if (Math.abs(diff) > this.config.touchThreshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }

        this.state.touchStartX = 0;
    }

    /**
     * Keyboard navigation
     */
    handleKeyboard(e) {
        if (!this.elements.section.contains(document.activeElement)) return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.next();
                break;
        }
    }

    /**
     * Autoplay functionality
     */
    startAutoplay() {
        if (!this.state.isAutoPlaying || this.state.totalSlides <= 1) return;

        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.config.autoplayDelay);
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    pauseAutoplay() {
        this.stopAutoplay();
    }

    resumeAutoplay() {
        if (this.state.isAutoPlaying) {
            this.startAutoplay();
        }
    }

    /**
     * Utility: Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Destroy carousel
     */
    destroy() {
        this.stopAutoplay();
        if (this.transitionTimer) {
            clearTimeout(this.transitionTimer);
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyboard);
        
        console.log('🧹 Key Features Carousel destroyed');
    }
}

// Initialize carousel when DOM is ready
let keyFeaturesCarousel;

function initKeyFeatures() {
    // Check if section exists
    const section = document.getElementById('key-features-section');
    if (!section) {
        console.log('⏳ Key features section not found, retrying...');
        setTimeout(initKeyFeatures, 500);
        return;
    }

    // Initialize carousel
    keyFeaturesCarousel = new KeyFeaturesCarousel({
        autoplayDelay: 5000,
        transitionDuration: 500
    });

    // Add fade-in animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    // Observe fade elements
    const fadeElements = section.querySelectorAll('[data-fade]');
    fadeElements.forEach(el => observer.observe(el));

    // Export API
    window.BuilderSolveKeyFeatures = {
        prev: () => keyFeaturesCarousel?.prev(),
        next: () => keyFeaturesCarousel?.next(),
        goToSlide: (index) => keyFeaturesCarousel?.goToSlide(index),
        destroy: () => keyFeaturesCarousel?.destroy()
    };
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKeyFeatures);
} else {
    initKeyFeatures();
}

// Handle dynamic content loading
if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const section = document.getElementById('key-features-section');
                if (section && !keyFeaturesCarousel) {
                    initKeyFeatures();
                    observer.disconnect();
                }
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}