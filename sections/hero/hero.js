/**
 * BuilderSolve Hero Section - UPDATED VERSION
 * Production ready for cPanel shared hosting
 * 
 * @version 6.2.0 - BACKGROUND IMAGE REMOVED
 */

class BuilderSolveHero {
    constructor() {
        // Configuration
        this.config = {
            scrollThrottle: 16,
            imageTimeout: 2000,
            parallaxSpeed: 0.05
        };

        // State management
        this.state = {
            isInitialized: false,
            scrollPosition: 0,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };

        // DOM elements cache
        this.elements = {};
        
        // Bind methods
        this.handleScroll = this.throttle(this.handleScroll.bind(this), this.config.scrollThrottle);
        this.handleCTAClick = this.handleCTAClick.bind(this);
        this.handleResize = this.throttle(this.handleResize.bind(this), 250);

        // Initialize
        this.init();
    }

    /**
     * Initialize the hero section
     */
    init() {
        try {
            console.log('🚀 BuilderSolve Hero initializing...');
            
            this.cacheElements();
            this.bindEvents();
            this.setupImageHandling();
            this.setupAccessibility();
            
            this.state.isInitialized = true;
            console.log('✅ BuilderSolve Hero initialized successfully');
            
            // Track initialization
            this.trackEvent('hero_initialized', {
                timestamp: Date.now(),
                hasImages: this.elements.heroImages ? this.elements.heroImages.length : 0
            });

        } catch (error) {
            console.error('❌ Hero initialization error:', error);
        }
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            heroSection: document.getElementById('hero-section'),
            ctaButton: document.querySelector('.btn-primary-large'),
            scrollIndicator: document.querySelector('.scroll-indicator'),
            heroImages: document.querySelectorAll('.hero-image'),
            imageCards: document.querySelectorAll('.hero-image-card'),
            imagesContainer: document.querySelector('.hero-images-container'),
            heroPattern: document.querySelector('.hero-pattern')
        };

        console.log('📦 Elements cached:', {
            heroSection: !!this.elements.heroSection,
            ctaButton: !!this.elements.ctaButton,
            heroImages: this.elements.heroImages ? this.elements.heroImages.length : 0,
            imagesContainer: !!this.elements.imagesContainer
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // CTA button
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('click', this.handleCTAClick);
            console.log('✅ CTA button events bound');
        }

        // Scroll indicator
        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.addEventListener('click', this.handleScrollIndicatorClick.bind(this));
        }

        // Window events
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize);

        console.log('✅ All events bound');
    }

    /**
     * Setup image handling
     */
    setupImageHandling() {
        if (!this.elements.heroImages || this.elements.heroImages.length === 0) {
            return;
        }

        this.elements.heroImages.forEach((image, index) => {
            image.addEventListener('load', () => this.handleImageLoad(index));
            image.addEventListener('error', () => this.handleImageError(index));
            
            // Check if already loaded
            if (image.complete && image.naturalHeight !== 0) {
                this.handleImageLoad(index);
            }
        });

        console.log(`✅ Image handling setup for ${this.elements.heroImages.length} images`);
    }

    /**
     * Handle CTA button click
     */
    handleCTAClick(event) {
        const button = event.target.closest('.btn-primary-large');
        if (button) {
            // Visual feedback
            button.style.transform = 'translateY(-1px) scale(0.98)';
            button.style.transition = 'transform 0.1s ease';
            
            setTimeout(() => {
                button.style.transform = '';
            }, 100);

            // Track conversion
            this.trackConversion('hero_contact_click', {
                timestamp: Date.now(),
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                },
                scrollPosition: this.state.scrollPosition,
                device: this.getDeviceType()
            });

            console.log('📞 Contact Us clicked');
        }
    }

    /**
     * Handle scroll for parallax
     */
    handleScroll() {
        if (!this.elements.heroSection) return;

        const scrolled = window.pageYOffset;
        const heroHeight = this.elements.heroSection.offsetHeight;
        this.state.scrollPosition = scrolled;

        // Parallax for images
        if (scrolled <= heroHeight && this.elements.imagesContainer) {
            const parallaxOffset = scrolled * this.config.parallaxSpeed;
            this.elements.imagesContainer.style.transform = `translateY(${parallaxOffset}px)`;
        }

        // Hide/show scroll indicator
        if (this.elements.scrollIndicator) {
            if (scrolled > 100) {
                this.elements.scrollIndicator.style.opacity = '0';
                this.elements.scrollIndicator.style.pointerEvents = 'none';
            } else {
                this.elements.scrollIndicator.style.opacity = '1';
                this.elements.scrollIndicator.style.pointerEvents = 'auto';
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.state.viewportWidth = window.innerWidth;
        this.state.viewportHeight = window.innerHeight;
        this.updateResponsiveState();
    }

    /**
     * Handle scroll indicator click
     */
    handleScrollIndicatorClick(event) {
        event.preventDefault();
        
        const targetId = this.elements.scrollIndicator.dataset.scrollTo || '#features';
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navHeight = 60;
            const targetPosition = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            this.trackEvent('scroll_indicator_click', {
                target: targetId,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Handle image load
     */
    handleImageLoad(index) {
        console.log(`✅ Hero image ${index + 1} loaded`);
        
        if (this.elements.imageCards && this.elements.imageCards[index]) {
            this.elements.imageCards[index].classList.add('loaded');
        }
        
        this.trackEvent('hero_image_loaded', {
            image_index: index,
            timestamp: Date.now()
        });
    }

    /**
     * Handle image error
     */
    handleImageError(index) {
        console.warn(`⚠️ Hero image ${index + 1} failed to load`);
        
        if (this.elements.imageCards && this.elements.imageCards[index]) {
            const imageCard = this.elements.imageCards[index];
            imageCard.style.background = 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #FED7AA 100%)';
            imageCard.style.display = 'flex';
            imageCard.style.alignItems = 'center';
            imageCard.style.justifyContent = 'center';
            
            const fallbackContent = document.createElement('div');
            fallbackContent.innerHTML = `
                <div style="text-align: center; padding: 1rem; color: #64748B;">
                    <div style="font-size: 1.5rem; margin-bottom: 0.25rem;">🏗️</div>
                    <div style="font-weight: 600;">BuilderSolve</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">View ${index + 1}</div>
                </div>
            `;
            
            const image = imageCard.querySelector('.hero-image');
            if (image) {
                image.style.display = 'none';
                imageCard.appendChild(fallbackContent);
            }
        }

        this.trackEvent('hero_image_error', {
            image_index: index,
            timestamp: Date.now()
        });
    }

    /**
     * Setup accessibility
     */
    setupAccessibility() {
        if (this.elements.imagesContainer) {
            this.elements.imagesContainer.setAttribute('aria-label', 
                'BuilderSolve construction management platform showcase images');
        }

        // Keyboard navigation for CTA
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCTAClick(e);
                }
            });
        }
    }

    /**
     * Update responsive state
     */
    updateResponsiveState() {
        const breakpoints = {
            mobile: window.innerWidth <= 767,
            tablet: window.innerWidth <= 1023,
            desktop: window.innerWidth > 1023
        };

        this.state.breakpoint = Object.keys(breakpoints).find(key => breakpoints[key]) || 'desktop';
        
        console.log('📱 Responsive state updated:', this.state.breakpoint);
    }

    /**
     * Get device type
     */
    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 479) return 'mobile-small';
        if (width <= 767) return 'mobile';
        if (width <= 1023) return 'tablet';
        if (width <= 1439) return 'desktop';
        return 'desktop-large';
    }

    /**
     * Track events
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'hero_section',
            timestamp: Date.now(),
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'hero_section',
                event_label: data.button_text || data.image_name || '',
                value: data.timestamp
            });
        }

        // Custom analytics
        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }

        // PostHog
        if (window.posthog) {
            window.posthog.capture(eventName, eventData);
        }
    }

    /**
     * Track conversions
     */
    trackConversion(eventName, data = {}) {
        this.trackEvent(eventName, { ...data, conversion: true });
        
        // Facebook Pixel
        if (window.fbq) {
            window.fbq('track', 'Lead');
        }

        // Google Ads
        if (window.gtag) {
            window.gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
            });
        }
    }

    /**
     * Throttle utility
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Public API
     */
    getAPI() {
        return {
            getState: () => ({ ...this.state }),
            trackConversion: (data) => this.trackConversion('external_conversion', data),
            trackEvent: (name, data) => this.trackEvent(name, data),
            scrollToNext: () => this.handleScrollIndicatorClick({ preventDefault: () => {} }),
            isReady: () => this.state.isInitialized,
            getDeviceType: () => this.getDeviceType()
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);
        
        if (this.elements.ctaButton) {
            this.elements.ctaButton.removeEventListener('click', this.handleCTAClick);
        }
        
        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.removeEventListener('click', this.handleScrollIndicatorClick);
        }
        
        console.log('🧹 BuilderSolve Hero cleaned up');
    }
}

// Initialize
let heroInstance;

const initializeHero = () => {
    try {
        heroInstance = new BuilderSolveHero();
        
        // Export API
        window.BuilderSolveHero = heroInstance.getAPI();
        
        console.log('🎯 BuilderSolve Hero API exported to window.BuilderSolveHero');
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('buildersolve:hero:ready', {
            detail: { api: window.BuilderSolveHero }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize BuilderSolve Hero:', error);
    }
};

// Initialize based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHero);
} else {
    initializeHero();
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    if (heroInstance) {
        heroInstance.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuilderSolveHero;
} else if (typeof define === 'function' && define.amd) {
    define(() => BuilderSolveHero);
}