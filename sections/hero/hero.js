/**
 * BuilderSolve Hero Section
 * @version 6.3.0 - Fixed Contact Button Scroll
 */

class BuilderSolveHero {
    constructor() {
        this.config = {
            scrollThrottle: 16,
            imageTimeout: 2000,
            parallaxSpeed: 0.05
        };

        this.state = {
            isInitialized: false,
            scrollPosition: 0,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight
        };

        this.elements = {};
        
        this.handleScroll = this.throttle(this.handleScroll.bind(this), this.config.scrollThrottle);
        this.handleCTAClick = this.handleCTAClick.bind(this);
        this.handleResize = this.throttle(this.handleResize.bind(this), 250);

        this.init();
    }

    init() {
        try {
            console.log('🚀 BuilderSolve Hero initializing...');
            
            this.cacheElements();
            this.bindEvents();
            this.setupImageHandling();
            this.setupAccessibility();
            
            this.state.isInitialized = true;
            console.log('✅ BuilderSolve Hero initialized successfully');
            
            this.trackEvent('hero_initialized', {
                timestamp: Date.now(),
                hasImages: this.elements.heroImages ? this.elements.heroImages.length : 0
            });

        } catch (error) {
            console.error('❌ Hero initialization error:', error);
        }
    }

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

    bindEvents() {
        // CTA button - smooth scroll to contact
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('click', this.handleCTAClick);
            console.log('✅ CTA button events bound');
        }

        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.addEventListener('click', this.handleScrollIndicatorClick.bind(this));
        }

        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize);

        console.log('✅ All events bound');
    }

    setupImageHandling() {
        if (!this.elements.heroImages || this.elements.heroImages.length === 0) {
            return;
        }

        this.elements.heroImages.forEach((image, index) => {
            image.addEventListener('load', () => this.handleImageLoad(index));
            image.addEventListener('error', () => this.handleImageError(index));
            
            if (image.complete && image.naturalHeight !== 0) {
                this.handleImageLoad(index);
            }
        });

        console.log(`✅ Image handling setup for ${this.elements.heroImages.length} images`);
    }

    handleCTAClick(event) {
        event.preventDefault();
        
        const button = event.target.closest('.btn-primary-large');
        if (button) {
            // Visual feedback
            button.style.transform = 'translateY(-1px) scale(0.98)';
            button.style.transition = 'transform 0.1s ease';
            
            setTimeout(() => {
                button.style.transform = '';
            }, 100);

            // Smooth scroll to contact section
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const navHeight = 60;
                const targetPosition = contactSection.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

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

            console.log('📞 Contact Us clicked - scrolling to contact section');
        }
    }

    handleScroll() {
        if (!this.elements.heroSection) return;

        const scrolled = window.pageYOffset;
        const heroHeight = this.elements.heroSection.offsetHeight;
        this.state.scrollPosition = scrolled;

        if (scrolled <= heroHeight && this.elements.imagesContainer) {
            const parallaxOffset = scrolled * this.config.parallaxSpeed;
            this.elements.imagesContainer.style.transform = `translateY(${parallaxOffset}px)`;
        }

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

    handleResize() {
        this.state.viewportWidth = window.innerWidth;
        this.state.viewportHeight = window.innerHeight;
        this.updateResponsiveState();
    }

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

    setupAccessibility() {
        if (this.elements.imagesContainer) {
            this.elements.imagesContainer.setAttribute('aria-label', 
                'BuilderSolve construction management platform showcase images');
        }

        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleCTAClick(e);
                }
            });
        }
    }

    updateResponsiveState() {
        const breakpoints = {
            mobile: window.innerWidth <= 767,
            tablet: window.innerWidth <= 1023,
            desktop: window.innerWidth > 1023
        };

        this.state.breakpoint = Object.keys(breakpoints).find(key => breakpoints[key]) || 'desktop';
        
        console.log('📱 Responsive state updated:', this.state.breakpoint);
    }

    getDeviceType() {
        const width = window.innerWidth;
        if (width <= 479) return 'mobile-small';
        if (width <= 767) return 'mobile';
        if (width <= 1023) return 'tablet';
        if (width <= 1439) return 'desktop';
        return 'desktop-large';
    }

    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'hero_section',
            timestamp: Date.now(),
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'hero_section',
                event_label: data.button_text || data.image_name || '',
                value: data.timestamp
            });
        }

        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }

        if (window.posthog) {
            window.posthog.capture(eventName, eventData);
        }
    }

    trackConversion(eventName, data = {}) {
        this.trackEvent(eventName, { ...data, conversion: true });
        
        if (window.fbq) {
            window.fbq('track', 'Lead');
        }

        if (window.gtag) {
            window.gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
            });
        }
    }

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
        window.BuilderSolveHero = heroInstance.getAPI();
        
        console.log('🎯 BuilderSolve Hero API exported to window.BuilderSolveHero');
        
        window.dispatchEvent(new CustomEvent('buildersolve:hero:ready', {
            detail: { api: window.BuilderSolveHero }
        }));
        
    } catch (error) {
        console.error('❌ Failed to initialize BuilderSolve Hero:', error);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHero);
} else {
    initializeHero();
}

window.addEventListener('beforeunload', () => {
    if (heroInstance) {
        heroInstance.destroy();
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuilderSolveHero;
} else if (typeof define === 'function' && define.amd) {
    define(() => BuilderSolveHero);
}