/**
 * BuilderSolve Hero Section - SIMPLIFIED VERSION
 * Removed hover interactions, fixed scroll behavior
 * 
 * @version 4.0.0 - FIXED SCROLL & REMOVED HOVER
 */

class BuilderSolveHero {
    constructor(options = {}) {
        // Configuration
        this.config = {
            animationDelay: 100,
            scrollOffset: 100,
            imageLoadTimeout: 5000,
            performanceThreshold: 16.67,
            retryAttempts: 3,
            contentWaitTimeout: 10000,
            ...options
        };

        // State management
        this.state = {
            isInitialized: false,
            isVisible: false,
            animationsTriggered: false,
            imageLoaded: false,
            performanceMetrics: {},
            retryCount: 0,
            contentLoaded: false,
            scrollPosition: 0
        };

        // DOM elements cache
        this.elements = {};
        
        // Animation controllers
        this.intersectionObserver = null;
        this.performanceObserver = null;
        this.contentObserver = null;
        
        // Interactive timers
        this.contentWaitTimeout = null;

        // Bind methods
        this.handleResize = this.throttle(this.handleResize.bind(this), 250);
        this.handleScroll = this.throttle(this.handleScroll.bind(this), 16);
        this.handleCTAClick = this.handleCTAClick.bind(this);
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleImageError = this.handleImageError.bind(this);
        this.handleContentMutation = this.handleContentMutation.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the hero section with content awareness
     */
    async init() {
        try {
            performance.mark('hero-init-start');
            
            await this.waitForDOM();
            
            // First check if content is already loaded
            if (this.checkContentExists()) {
                // ('✅ Hero content already loaded, initializing immediately');
                await this.initializeWithContent();
            } else {
                // ('⏳ Hero content not loaded yet, waiting for content...');
                await this.waitForContent();
            }

        } catch (error) {
            this.handleError('Initialization failed', error);
            await this.retryInitialization();
        }
    }

    /**
     * Check if hero content is already loaded
     */
    checkContentExists() {
        const heroSection = document.getElementById('hero-section');
        if (!heroSection || heroSection.nodeType !== Node.ELEMENT_NODE) {
            // ('🔍 Hero section element not found or invalid');
            return false;
        }

        const headline = heroSection.querySelector('.hero-headline');
        const ctaButton = heroSection.querySelector('.btn-primary-large');
        const imageCard = heroSection.querySelector('.hero-image-card');

        const hasContent = !!(headline && ctaButton && imageCard);
        
        // ('🔍 Content check:', {
            heroSection: !!heroSection,
            headline: !!headline,
            ctaButton: !!ctaButton,
            imageCard: !!imageCard,
            hasContent: hasContent
        });

        return hasContent;
    }

    /**
     * Wait for content to be loaded into hero section
     */
    waitForContent() {
        return new Promise((resolve, reject) => {
            const heroSection = document.getElementById('hero-section');
            if (!heroSection || heroSection.nodeType !== Node.ELEMENT_NODE) {
                reject(new Error('Hero section element not found or invalid'));
                return;
            }

            this.contentWaitTimeout = setTimeout(() => {
                if (this.contentObserver) {
                    this.contentObserver.disconnect();
                }
                reject(new Error('Content loading timeout after 10 seconds'));
            }, this.config.contentWaitTimeout);

            try {
                this.contentObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            if (this.checkContentExists()) {
                                // ('✅ Hero content detected, initializing...');
                                clearTimeout(this.contentWaitTimeout);
                                this.contentObserver.disconnect();
                                this.initializeWithContent().then(resolve).catch(reject);
                            }
                        }
                    });
                });

                this.contentObserver.observe(heroSection, {
                    childList: true,
                    subtree: true
                });

                // ('👀 Watching for hero content to load...');
                
            } catch (error) {
                clearTimeout(this.contentWaitTimeout);
                reject(new Error(`MutationObserver setup failed: ${error.message}`));
            }
        });
    }

    /**
     * Initialize once content is confirmed to exist
     */
    async initializeWithContent() {
        try {
            this.state.contentLoaded = true;
            
            this.cacheElements();
            this.setupObservers();
            this.bindEvents();
            this.initializeAnimations();
            this.setupImageHandling();
            this.setupAccessibility();
            this.trackInitialization();

            this.state.isInitialized = true;
            performance.mark('hero-init-end');
            performance.measure('hero-initialization', 'hero-init-start', 'hero-init-end');
            
            // ('✅ BuilderSolve Hero initialized successfully');
            this.logPerformanceMetrics();

        } catch (error) {
            throw new Error(`Content initialization failed: ${error.message}`);
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                resolve();
            }
        });
    }

    /**
     * Cache all DOM elements for performance with robust null checking
     */
    cacheElements() {
        const selectors = {
            heroSection: '#hero-section',
            heroWrapper: '.hero-wrapper',
            heroContent: '.hero-content',
            heroText: '.hero-text',
            heroVisual: '.hero-visual',
            headline: '.hero-headline',
            subheadline: '.hero-subheadline',
            stats: '.hero-stats',
            ctaButton: '.btn-primary-large',
            ctaSecondary: '.cta-secondary',
            heroImages: '.hero-image',
            imageCards: '.hero-image-card',
            imagesContainer: '.hero-images-container',
            scrollIndicator: '.scroll-indicator',
            fadeElements: '[data-fade]'
        };

        // Cache elements with robust error handling
        Object.entries(selectors).forEach(([key, selector]) => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length === 0) {
                    this.elements[key] = key.endsWith('s') ? [] : null;
                    console.warn(`⚠️ No elements found for: ${selector}`);
                } else if (elements.length === 1) {
                    this.elements[key] = elements[0];
                } else {
                    this.elements[key] = Array.from(elements);
                }
            } catch (error) {
                console.warn(`❌ Failed to cache element: ${selector}`, error);
                this.elements[key] = key.endsWith('s') ? [] : null;
            }
        });

        // Special handling for heroSection to ensure it's a proper Element
        const heroSectionElement = document.getElementById('hero-section');
        if (heroSectionElement && heroSectionElement.nodeType === Node.ELEMENT_NODE) {
            this.elements.heroSection = heroSectionElement;
        } else {
            this.elements.heroSection = null;
            console.warn('⚠️ Hero section not found or not a valid Element');
        }

        // Validate critical elements
        if (!this.elements.heroSection) {
            throw new Error('Hero section not found or invalid');
        }

        // ('📦 Cached elements:', {
            heroSection: {
                exists: !!this.elements.heroSection,
                type: this.elements.heroSection ? this.elements.heroSection.constructor.name : 'null',
                nodeType: this.elements.heroSection ? this.elements.heroSection.nodeType : 'N/A'
            },
            ctaButton: !!this.elements.ctaButton,
            imageCards: this.elements.imageCards ? this.elements.imageCards.length : 0,
            heroImages: this.elements.heroImages ? this.elements.heroImages.length : 0,
            fadeElements: this.elements.fadeElements ? this.elements.fadeElements.length : 0
        });
    }

    /**
     * Setup intersection and performance observers with null checks
     */
    setupObservers() {
        if (this.elements.heroSection && 
            this.elements.heroSection.nodeType === Node.ELEMENT_NODE &&
            typeof this.elements.heroSection.getBoundingClientRect === 'function') {
            
            try {
                this.intersectionObserver = new IntersectionObserver(
                    (entries) => this.handleIntersection(entries),
                    {
                        threshold: [0.1, 0.25, 0.5],
                        rootMargin: '-50px 0px -50px 0px'
                    }
                );
                
                this.intersectionObserver.observe(this.elements.heroSection);
                // ('✅ IntersectionObserver setup successful');
                
            } catch (error) {
                console.warn('⚠️ IntersectionObserver setup failed:', error);
                this.intersectionObserver = null;
            }
        } else {
            console.warn('⚠️ Cannot setup intersection observer: hero section invalid or not found');
        }

        // Performance Observer for monitoring
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    this.analyzePerformance(list.getEntries());
                });
                
                this.performanceObserver.observe({ 
                    entryTypes: ['measure', 'navigation', 'paint'] 
                });
                // ('✅ PerformanceObserver setup successful');
            } catch (error) {
                console.warn('⚠️ Performance observer setup failed:', error);
            }
        }
    }

    /**
     * Bind all event listeners with null checks
     */
    bindEvents() {
        // CTA button interactions
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('click', this.handleCTAClick);
            this.elements.ctaButton.addEventListener('mouseenter', this.handleCTAHover.bind(this));
            this.elements.ctaButton.addEventListener('mouseleave', this.handleCTALeave.bind(this));
            // ('✅ CTA button events bound');
        } else {
            console.warn('⚠️ CTA button not found, skipping CTA events');
        }

        // Image loading events
        if (this.elements.heroImages && this.elements.heroImages.length > 0) {
            this.elements.heroImages.forEach((image, index) => {
                image.addEventListener('load', () => this.handleImageLoad(index));
                image.addEventListener('error', () => this.handleImageError(index));
            });
            // (`✅ Image events bound for ${this.elements.heroImages.length} images`);
        } else {
            console.warn('⚠️ No hero images found, skipping image events');
        }

        // Scroll indicator
        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.addEventListener('click', this.handleScrollIndicatorClick.bind(this));
            // ('✅ Scroll indicator events bound');
        }

        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll, { passive: true });

        // Visibility change for performance
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

        // ('✅ Global events bound');
    }

    /**
     * Setup image handling with fallbacks
     */
    setupImageHandling() {
        if (!this.elements.heroImages || this.elements.heroImages.length === 0) {
            console.warn('⚠️ No hero images found for handling setup');
            return;
        }

        // Set initial image states
        this.elements.heroImages.forEach(image => {
            image.style.opacity = '0';
            image.style.transition = 'opacity 0.5s ease-out';
        });

        // Track loading state for each image
        this.state.imagesLoaded = new Array(this.elements.heroImages.length).fill(false);

        // Timeout fallback for slow loading
        setTimeout(() => {
            this.elements.heroImages.forEach((image, index) => {
                if (!this.state.imagesLoaded[index]) {
                    this.handleImageTimeout(index);
                }
            });
        }, this.config.imageLoadTimeout);
    }

    /**
     * Setup intersection observer for animations
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !this.state.animationsTriggered) {
                this.state.isVisible = true;
                this.state.animationsTriggered = true;
                this.triggerEntranceAnimations();
                this.trackVisibility();
            }
        });
    }

    /**
     * Initialize entrance animations
     */
    initializeAnimations() {
        if (!this.elements.fadeElements || this.elements.fadeElements.length === 0) {
            console.warn('⚠️ No fade elements found for animation setup');
            return;
        }

        // Set initial states for fade elements
        this.elements.fadeElements.forEach(element => {
            const direction = element.dataset.fade || 'up';
            const delay = parseInt(element.dataset.delay || '0');
            
            // Set initial transform based on direction
            const transforms = {
                up: 'translateY(40px)',
                down: 'translateY(-40px)',
                left: 'translateX(50px)',
                right: 'translateX(-50px)'
            };

            element.style.opacity = '0';
            element.style.transform = transforms[direction] || transforms.up;
            element.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
        });

        // (`✅ Animation setup complete for ${this.elements.fadeElements.length} elements`);
    }

    /**
     * Trigger entrance animations sequence
     */
    async triggerEntranceAnimations() {
        performance.mark('animations-start');

        try {
            // Animate fade elements
            await this.animateFadeElements();

            performance.mark('animations-end');
            performance.measure('entrance-animations', 'animations-start', 'animations-end');

        } catch (error) {
            this.handleError('Animation sequence failed', error);
        }
    }

    /**
     * Animate fade elements
     */
    animateFadeElements() {
        return new Promise((resolve) => {
            let animatedCount = 0;
            const totalElements = this.elements.fadeElements ? this.elements.fadeElements.length : 0;

            if (totalElements === 0) {
                resolve();
                return;
            }

            this.elements.fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) translateX(0)';
                    
                    element.addEventListener('transitionend', () => {
                        animatedCount++;
                        if (animatedCount === totalElements) {
                            resolve();
                        }
                    }, { once: true });
                }, index * this.config.animationDelay);
            });
        });
    }

    /**
     * Handle CTA button click with conversion tracking
     */
    handleCTAClick(event) {
        // Add click animation
        const button = event.target.closest('.btn-primary-large');
        if (button) {
            button.style.transform = 'translateY(-2px) scale(0.98)';
            button.style.transition = 'transform 0.1s ease-out';
            
            setTimeout(() => {
                button.style.transform = '';
            }, 150);

            // Track conversion
            this.trackConversion('hero_contact_click', {
                button_text: button.querySelector('.btn-text')?.textContent || 'Contact Us',
                location: 'hero_section',
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });

            // ('📞 Contact Us clicked - tracking conversion');
        }
    }

    /**
     * Handle CTA hover effects
     */
    handleCTAHover(event) {
        // Track hover for engagement analytics
        this.trackEvent('cta_hover', {
            timestamp: Date.now(),
            hover_duration_start: Date.now()
        });
    }

    /**
     * Handle CTA leave effects
     */
    handleCTALeave(event) {
        // Track hover duration
        this.trackEvent('cta_hover_end', {
            timestamp: Date.now()
        });
    }

    /**
     * Handle image loading success
     */
    handleImageLoad(index) {
        if (this.state.imagesLoaded) {
            this.state.imagesLoaded[index] = true;
        }
        
        if (this.elements.heroImages && this.elements.heroImages[index]) {
            const image = this.elements.heroImages[index];
            image.style.opacity = '1';
        }
        
        // (`✅ Hero image ${index + 1} loaded successfully`);
        
        this.trackEvent('hero_image_loaded', {
            image_index: index,
            timestamp: Date.now(),
            load_time: performance.now()
        });

        // Check if all images are loaded
        if (this.state.imagesLoaded && this.state.imagesLoaded.every(loaded => loaded)) {
            this.trackEvent('all_hero_images_loaded', {
                timestamp: Date.now(),
                total_images: this.elements.heroImages ? this.elements.heroImages.length : 0
            });
        }
    }

    /**
     * Handle image loading error
     */
    handleImageError(index) {
        console.warn(`⚠️ Hero image ${index + 1} failed to load, using fallback`);
        
        // Create fallback gradient background
        if (this.elements.imageCards && this.elements.imageCards[index]) {
            const imageCard = this.elements.imageCards[index];
            imageCard.style.background = 
                'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #FED7AA 100%)';
            imageCard.style.display = 'flex';
            imageCard.style.alignItems = 'center';
            imageCard.style.justifyContent = 'center';
            
            // Add fallback content
            const fallbackContent = document.createElement('div');
            fallbackContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748B;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
                    <div style="font-weight: 600; color: #374151;">BuilderSolve ${index + 1}</div>
                </div>
            `;
            imageCard.appendChild(fallbackContent);
        }

        this.trackEvent('hero_image_error', {
            image_index: index,
            timestamp: Date.now(),
            error: 'Image failed to load'
        });
    }

    /**
     * Handle image loading timeout
     */
    handleImageTimeout(index) {
        console.warn(`⚠️ Hero image ${index + 1} loading timeout`);
        
        this.trackEvent('hero_image_timeout', {
            image_index: index,
            timestamp: Date.now(),
            timeout_duration: this.config.imageLoadTimeout
        });
    }

    /**
     * Handle scroll indicator click
     */
    handleScrollIndicatorClick(event) {
        event.preventDefault();
        
        if (!this.elements.scrollIndicator) return;
        
        const targetId = this.elements.scrollIndicator.dataset.scrollTo || '#features';
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navHeight = 72;
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
     * Handle window resize with debouncing
     */
    handleResize() {
        // Update viewport-dependent calculations
        this.updateResponsiveState();
    }

    /**
     * FIXED: Handle scroll events - simplified and fixed
     */
    handleScroll() {
        if (!this.state.isVisible || !this.elements.heroSection) return;

        const scrolled = window.pageYOffset;
        const heroHeight = this.elements.heroSection.offsetHeight;
        this.state.scrollPosition = scrolled;

        // FIXED: Simple and reliable scroll behavior
        // Only apply effects within the hero section
        if (scrolled <= heroHeight && this.elements.imagesContainer) {
            // Simple parallax effect - much more reliable
            const parallaxOffset = scrolled * 0.1;
            this.elements.imagesContainer.style.transform = `translateY(${parallaxOffset}px)`;
        } else if (this.elements.imagesContainer && scrolled > heroHeight) {
            // FIXED: Reset to normal position when past hero
            this.elements.imagesContainer.style.transform = 'translateY(0px)';
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'hero-announcements';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);

        // Add instructions for screen readers
        if (this.elements.imagesContainer) {
            this.elements.imagesContainer.setAttribute('aria-label', 
                'BuilderSolve construction management platform showcase images');
        }

        // Announce when animations complete
        if (this.state.animationsTriggered) {
            this.announceToScreenReader('Hero section loaded successfully');
        }
    }

    /**
     * Announce to screen readers
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('hero-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Handle visibility change for performance
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is hidden
            this.pauseAnimations();
        } else {
            // Resume animations when tab is visible
            this.resumeAnimations();
        }
    }

    /**
     * Pause animations for performance
     */
    pauseAnimations() {
        if (this.elements.imageCards && this.elements.imageCards.length > 0) {
            this.elements.imageCards.forEach(card => {
                card.style.animationPlayState = 'paused';
            });
        }
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        if (this.elements.imageCards && this.elements.imageCards.length > 0) {
            this.elements.imageCards.forEach(card => {
                card.style.animationPlayState = 'running';
            });
        }
    }

    /**
     * Handle content mutation (for debugging)
     */
    handleContentMutation(mutations) {
        mutations.forEach((mutation) => {
            // ('Content mutation detected:', mutation);
        });
    }

    /**
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'hero_section',
            timestamp: Date.now(),
            ...data
        };

        // ('📊 Event tracked:', eventData);

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
     * Track conversions specifically
     */
    trackConversion(eventName, data = {}) {
        this.trackEvent(eventName, { ...data, conversion: true });
        
        // Additional conversion tracking
        if (window.fbq) {
            window.fbq('track', 'Lead');
        }

        if (window.gtag) {
            window.gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
            });
        }

        // Track phone calls or form submissions
        if (window.CallRail) {
            window.CallRail.track('conversion');
        }
    }

    /**
     * Track visibility for engagement
     */
    trackVisibility() {
        this.trackEvent('hero_section_viewed', {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            user_agent: navigator.userAgent,
            referrer: document.referrer
        });
    }

    /**
     * Track initialization
     */
    trackInitialization() {
        this.trackEvent('hero_section_initialized', {
            load_time: performance.now(),
            features_enabled: {
                intersection_observer: !!this.intersectionObserver,
                performance_observer: !!this.performanceObserver,
                image_count: this.elements.heroImages ? this.elements.heroImages.length : 0
            }
        });
    }

    /**
     * Analyze performance metrics
     */
    analyzePerformance(entries) {
        entries.forEach(entry => {
            if (entry.entryType === 'measure') {
                this.state.performanceMetrics[entry.name] = entry.duration;
                
                // Log slow operations
                if (entry.duration > this.config.performanceThreshold) {
                    console.warn(`⚠️ Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                }
            }
        });
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        const metrics = this.state.performanceMetrics;
        // ('📈 Hero Performance Metrics:', metrics);
        
        // Track performance
        this.trackEvent('performance_metrics', metrics);
    }

    /**
     * Handle errors gracefully
     */
    handleError(message, error) {
        console.error(`❌ BuilderSolve Hero Error: ${message}`, error);
        
        // Track errors
        this.trackEvent('error_occurred', {
            message,
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
    }

    /**
     * Retry initialization on failure
     */
    async retryInitialization() {
        if (this.state.retryCount < this.config.retryAttempts) {
            this.state.retryCount++;
            // (`🔄 Retrying initialization (attempt ${this.state.retryCount})`);
            
            setTimeout(() => {
                this.init();
            }, 1000 * this.state.retryCount);
        } else {
            console.error('❌ Max retry attempts reached. Hero initialization failed.');
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
    }

    /**
     * Throttle function for performance
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
     * Public API for external access and customization
     */
    getAPI() {
        return {
            // State
            getState: () => ({ ...this.state }),
            getMetrics: () => ({ ...this.state.performanceMetrics }),
            
            // Actions
            triggerAnimations: () => this.triggerEntranceAnimations(),
            scrollToNext: () => this.handleScrollIndicatorClick({ preventDefault: () => {} }),
            
            // Tracking
            trackConversion: (data) => this.trackConversion('external_conversion', data),
            trackEvent: (name, data) => this.trackEvent(name, data),
            
            // Performance
            refreshAnimations: () => {
                if (this.state.isVisible) {
                    this.triggerEntranceAnimations();
                }
            },
            
            // Image handling
            reloadImages: () => {
                if (this.elements.heroImages && this.elements.heroImages.length > 0) {
                    this.elements.heroImages.forEach(image => {
                        image.src = image.src;
                    });
                }
            },
            
            // Content detection
            isContentLoaded: () => this.state.contentLoaded,
            waitForContent: () => this.waitForContent(),
            
            // Debugging
            debug: () => ({
                state: this.state,
                elements: this.elements,
                config: this.config
            })
        };
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        // Clear timeouts
        if (this.contentWaitTimeout) clearTimeout(this.contentWaitTimeout);

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);

        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
        
        // ('🧹 BuilderSolve Hero cleaned up');
    }
}

// Initialize hero section when DOM is ready
let heroInstance;

const initializeHero = () => {
    heroInstance = new BuilderSolveHero({
        animationDelay: 80,
        imageLoadTimeout: 3000,
        contentWaitTimeout: 10000
    });
    
    // Export to global scope for external access
    window.BuilderSolveHero = heroInstance.getAPI();
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHero);
} else {
    initializeHero();
}

// Hot reload support for development
if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        if (heroInstance) {
            heroInstance.destroy();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuilderSolveHero;
} else if (typeof define === 'function' && define.amd) {
    define(() => BuilderSolveHero);
}