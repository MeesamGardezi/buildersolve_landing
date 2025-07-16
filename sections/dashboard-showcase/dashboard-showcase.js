/**
 * BuilderSolve Dashboard Showcase - FIXED VERSION
 * Working auto-play, functional dots, proper carousel movement
 * 
 * @version 5.0.0 - FULLY FUNCTIONAL
 */

class DashboardShowcase {
    constructor(options = {}) {
        // Configuration
        this.config = {
            autoPlayInterval: 5000,
            transitionDuration: 800,
            progressUpdateInterval: 50,
            touchThreshold: 50,
            keyboardEnabled: true,
            pauseOnHover: true,
            pauseOnFocus: true,
            preloadImages: true,
            analyticsEnabled: true,
            accessibilityEnabled: true,
            retryAttempts: 3,
            initTimeout: 10000,
            ...options
        };

        // State management
        this.state = {
            currentSlide: 0,
            totalSlides: 2,
            isPlaying: false,
            isPaused: false,
            isTransitioning: false,
            isInitialized: false,
            progressValue: 0,
            startTime: 0,
            touchStartX: 0,
            touchStartY: 0,
            hasUserInteracted: false,
            isInView: false,
            imagesLoaded: 0,
            retryCount: 0
        };

        // DOM elements cache
        this.elements = {};
        
        // Timers and controllers
        this.autoPlayTimer = null;
        this.progressTimer = null;
        this.intersectionObserver = null;
        this.resizeObserver = null;
        this.initTimeout = null;
        
        // Bind methods
        this.handleResize = this.throttle(this.handleResize.bind(this), 250);
        this.handleKeydown = this.handleKeydown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleDotClick = this.handleDotClick.bind(this);
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleImageError = this.handleImageError.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the carousel
     */
    async init() {
        try {
            performance.mark('showcase-init-start');
            
            await this.waitForDOM();
            await this.waitForContent();
            
            this.cacheElements();
            this.setupEventListeners();
            this.setupIntersectionObserver();
            this.setupResizeObserver();
            this.setupAccessibility();
            this.preloadImages();
            this.updateUI();
            
            this.state.isInitialized = true;
            
            performance.mark('showcase-init-end');
            performance.measure('showcase-initialization', 'showcase-init-start', 'showcase-init-end');
            
            this.trackEvent('showcase_initialized', {
                load_time: performance.getEntriesByName('showcase-initialization')[0]?.duration || 0,
                total_slides: this.state.totalSlides
            });
            
            console.log('✅ Dashboard Showcase initialized successfully');
            
            // Start auto-play after initialization
            this.startAutoPlay();
            
        } catch (error) {
            this.handleError('Initialization failed', error);
            this.retryInitialization();
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
     * Wait for content to be loaded
     */
    waitForContent() {
        return new Promise((resolve, reject) => {
            const checkContent = () => {
                const showcaseSection = document.querySelector('.dashboard-showcase-wrapper');
                if (showcaseSection && showcaseSection.querySelector('.premium-carousel-container')) {
                    resolve();
                } else if (this.state.retryCount < this.config.retryAttempts) {
                    setTimeout(checkContent, 100);
                } else {
                    reject(new Error('Content not found after retries'));
                }
            };
            checkContent();
        });
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        const selectors = {
            container: '.premium-carousel-container',
            track: '.carousel-track',
            slides: '.carousel-slide',
            dots: '.carousel-dot',
            progressFill: '.progress-fill',
            contentItems: '.content-item',
            screenshots: '.dashboard-screenshot',
            showcaseWrapper: '.dashboard-showcase-wrapper'
        };

        Object.entries(selectors).forEach(([key, selector]) => {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                this.elements[key] = key.endsWith('s') ? [] : null;
                if (key === 'container' || key === 'track') {
                    console.warn(`⚠️ Critical element not found: ${selector}`);
                }
            } else if (elements.length === 1) {
                this.elements[key] = elements[0];
            } else {
                this.elements[key] = Array.from(elements);
            }
        });

        // Validate critical elements
        if (!this.elements.container || !this.elements.track) {
            throw new Error('Critical carousel elements not found');
        }

        console.log('📦 Cached showcase elements:', {
            container: !!this.elements.container,
            track: !!this.elements.track,
            slides: this.elements.slides ? this.elements.slides.length : 0,
            dots: this.elements.dots ? this.elements.dots.length : 0,
            screenshots: this.elements.screenshots ? this.elements.screenshots.length : 0
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Dots navigation - FIXED: Proper event binding
        if (this.elements.dots && this.elements.dots.length > 0) {
            this.elements.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.handleDotClick(index));
                dot.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleDotClick(index);
                    }
                });
            });
            console.log(`✅ Dot navigation setup for ${this.elements.dots.length} dots`);
        }

        // Container events
        if (this.elements.container) {
            if (this.config.pauseOnHover) {
                this.elements.container.addEventListener('mouseenter', this.handleMouseEnter);
                this.elements.container.addEventListener('mouseleave', this.handleMouseLeave);
            }
            
            if (this.config.pauseOnFocus) {
                this.elements.container.addEventListener('focusin', this.handleFocus);
                this.elements.container.addEventListener('focusout', this.handleBlur);
            }

            // Touch events for mobile
            this.elements.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.elements.container.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.elements.container.addEventListener('touchend', this.handleTouchEnd, { passive: false });
        }

        // Image loading events
        if (this.elements.screenshots && this.elements.screenshots.length > 0) {
            this.elements.screenshots.forEach((img, index) => {
                img.addEventListener('load', () => this.handleImageLoad(index));
                img.addEventListener('error', () => this.handleImageError(index));
            });
        }

        // Global events
        if (this.config.keyboardEnabled) {
            document.addEventListener('keydown', this.handleKeydown);
        }
        
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        console.log('✅ Event listeners setup complete');
    }

    /**
     * Setup intersection observer for performance
     */
    setupIntersectionObserver() {
        if (!this.elements.showcaseWrapper) return;

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.state.isInView = entry.isIntersecting;
                
                if (entry.isIntersecting) {
                    console.log('📺 Showcase in view - starting auto-play');
                    this.startAutoPlay();
                    this.trackEvent('showcase_in_view');
                } else {
                    console.log('📺 Showcase out of view - pausing auto-play');
                    this.pauseAutoPlay();
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px 0px'
        });

        this.intersectionObserver.observe(this.elements.showcaseWrapper);
    }

    /**
     * Setup resize observer for responsive handling
     */
    setupResizeObserver() {
        if (!this.elements.container || !ResizeObserver) return;

        this.resizeObserver = new ResizeObserver(
            this.throttle((entries) => {
                this.handleResize();
            }, 250)
        );

        this.resizeObserver.observe(this.elements.container);
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        if (!this.config.accessibilityEnabled) return;

        // Add ARIA attributes
        if (this.elements.track) {
            this.elements.track.setAttribute('aria-live', 'polite');
            this.elements.track.setAttribute('aria-atomic', 'false');
        }

        // Setup dots accessibility
        if (this.elements.dots && this.elements.dots.length > 0) {
            this.elements.dots.forEach((dot, index) => {
                dot.setAttribute('role', 'button');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.setAttribute('tabindex', '0');
            });
        }

        // Update slide accessibility
        this.updateSlideAccessibility();

        console.log('✅ Accessibility features enabled');
    }

    /**
     * Update slide accessibility attributes
     */
    updateSlideAccessibility() {
        if (!this.elements.slides || this.elements.slides.length === 0) return;

        this.elements.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index === this.state.currentSlide ? 'false' : 'true');
        });

        // Update dots
        if (this.elements.dots && this.elements.dots.length > 0) {
            this.elements.dots.forEach((dot, index) => {
                dot.setAttribute('aria-selected', index === this.state.currentSlide ? 'true' : 'false');
            });
        }
    }

    /**
     * Preload images for smooth transitions
     */
    preloadImages() {
        if (!this.config.preloadImages || !this.elements.screenshots) return;

        this.elements.screenshots.forEach((img, index) => {
            if (img.complete) {
                this.handleImageLoad(index);
            }
        });
    }

    /**
     * Handle dot click - FIXED: Proper slide navigation
     */
    handleDotClick(index) {
        if (index === this.state.currentSlide || this.state.isTransitioning) {
            return;
        }

        console.log(`🎯 Dot ${index + 1} clicked`);
        this.goToSlide(index, true);
    }

    /**
     * Navigate to specific slide - FIXED: Proper implementation
     */
    goToSlide(index, userTriggered = false) {
        if (index < 0 || index >= this.state.totalSlides || 
            index === this.state.currentSlide || 
            this.state.isTransitioning) {
            return;
        }

        this.state.isTransitioning = true;
        this.state.currentSlide = index;

        if (userTriggered) {
            this.state.hasUserInteracted = true;
            this.restartAutoPlay();
        }

        // Update all UI elements
        this.updateUI();

        // Track interaction
        this.trackEvent('slide_changed', {
            slide_index: index,
            user_triggered: userTriggered,
            timestamp: Date.now()
        });

        // Reset transition flag
        setTimeout(() => {
            this.state.isTransitioning = false;
        }, this.config.transitionDuration);

        console.log(`📍 Moved to slide ${index + 1}`);
    }

    /**
     * Navigate to next slide
     */
    nextSlide() {
        const nextIndex = (this.state.currentSlide + 1) % this.state.totalSlides;
        this.goToSlide(nextIndex);
    }

    /**
     * Navigate to previous slide
     */
    prevSlide() {
        const prevIndex = this.state.currentSlide === 0 ? 
            this.state.totalSlides - 1 : 
            this.state.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    /**
     * Update all UI elements - FIXED: Proper carousel movement
     */
    updateUI() {
        this.updateTrackPosition();
        this.updateDots();
        this.updateContent();
        this.updateProgressBar();
        this.updateSlideAccessibility();
    }

    /**
     * Update track position - FIXED: Correct translateX calculation
     */
    updateTrackPosition() {
        if (!this.elements.track) return;

        // FIXED: Correct calculation for 2-slide carousel
        const translateX = -(this.state.currentSlide * 50); // 50% for each slide in 200% wide track
        this.elements.track.style.transform = `translateX(${translateX}%)`;
        
        // Update slide active states
        if (this.elements.slides && this.elements.slides.length > 0) {
            this.elements.slides.forEach((slide, index) => {
                if (index === this.state.currentSlide) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });
        }
    }

    /**
     * Update dots navigation - FIXED: Proper active state management
     */
    updateDots() {
        if (!this.elements.dots || this.elements.dots.length === 0) return;

        this.elements.dots.forEach((dot, index) => {
            if (index === this.state.currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    /**
     * Update content based on current slide
     */
    updateContent() {
        if (!this.elements.contentItems || this.elements.contentItems.length === 0) return;

        this.elements.contentItems.forEach((item, index) => {
            if (index === this.state.currentSlide) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Update progress bar - FIXED: Proper progress calculation
     */
    updateProgressBar() {
        if (!this.elements.progressFill) return;

        const progress = ((this.state.currentSlide + 1) / this.state.totalSlides) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.state.progressValue = progress;
    }

    /**
     * Start auto-play functionality - FIXED: Proper implementation
     */
    startAutoPlay() {
        if (this.state.isPlaying || this.autoPlayTimer) return;

        this.state.isPlaying = true;
        this.state.startTime = Date.now();
        this.startProgressTimer();
        
        this.autoPlayTimer = setInterval(() => {
            if (this.state.isPlaying && !this.state.isPaused && this.state.isInView) {
                this.nextSlide();
            }
        }, this.config.autoPlayInterval);

        console.log('▶️ Auto-play started');
    }

    /**
     * Stop auto-play
     */
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        
        this.stopProgressTimer();
        this.state.isPlaying = false;
        
        console.log('⏹️ Auto-play stopped');
    }

    /**
     * Pause auto-play
     */
    pauseAutoPlay() {
        this.state.isPaused = true;
        this.stopProgressTimer();
        
        console.log('⏸️ Auto-play paused');
    }

    /**
     * Resume auto-play
     */
    resumeAutoPlay() {
        if (!this.state.isPlaying) return;
        
        this.state.isPaused = false;
        this.state.startTime = Date.now();
        this.startProgressTimer();
        
        console.log('▶️ Auto-play resumed');
    }

    /**
     * Restart auto-play (for user interactions)
     */
    restartAutoPlay() {
        this.stopAutoPlay();
        this.state.isPlaying = true;
        this.startAutoPlay();
    }

    /**
     * Start progress timer for smooth progress bar - FIXED: Proper timing
     */
    startProgressTimer() {
        if (this.progressTimer) return;

        this.progressTimer = setInterval(() => {
            if (!this.state.isPaused && this.state.isInView) {
                const elapsed = Date.now() - this.state.startTime;
                const slideProgress = (elapsed / this.config.autoPlayInterval) * 100;
                const baseProgress = (this.state.currentSlide / this.state.totalSlides) * 100;
                const totalProgress = baseProgress + (slideProgress / this.state.totalSlides);
                
                if (this.elements.progressFill) {
                    this.elements.progressFill.style.width = `${Math.min(totalProgress, 100)}%`;
                }
            }
        }, this.config.progressUpdateInterval);
    }

    /**
     * Stop progress timer
     */
    stopProgressTimer() {
        if (this.progressTimer) {
            clearInterval(this.progressTimer);
            this.progressTimer = null;
        }
    }

    /**
     * Handle mouse enter (pause on hover)
     */
    handleMouseEnter() {
        this.pauseAutoPlay();
        this.trackEvent('showcase_hover_start');
    }

    /**
     * Handle mouse leave (resume auto-play)
     */
    handleMouseLeave() {
        this.resumeAutoPlay();
        this.trackEvent('showcase_hover_end');
    }

    /**
     * Handle focus events
     */
    handleFocus() {
        this.pauseAutoPlay();
        this.trackEvent('showcase_focus');
    }

    /**
     * Handle blur events
     */
    handleBlur() {
        this.resumeAutoPlay();
        this.trackEvent('showcase_blur');
    }

    /**
     * Handle keyboard navigation
     */
    handleKeydown(event) {
        if (!this.elements.container || !this.elements.container.contains(event.target)) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.prevSlide();
                this.trackEvent('keyboard_navigation', { key: 'left' });
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.nextSlide();
                this.trackEvent('keyboard_navigation', { key: 'right' });
                break;
            case 'Home':
                event.preventDefault();
                this.goToSlide(0, true);
                this.trackEvent('keyboard_navigation', { key: 'home' });
                break;
            case 'End':
                event.preventDefault();
                this.goToSlide(this.state.totalSlides - 1, true);
                this.trackEvent('keyboard_navigation', { key: 'end' });
                break;
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        this.state.touchStartX = event.touches[0].clientX;
        this.state.touchStartY = event.touches[0].clientY;
        this.pauseAutoPlay();
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        if (!this.state.touchStartX) return;

        const touchCurrentX = event.touches[0].clientX;
        const touchCurrentY = event.touches[0].clientY;
        
        const deltaX = this.state.touchStartX - touchCurrentX;
        const deltaY = this.state.touchStartY - touchCurrentY;
        
        // Prevent default if horizontal swipe is detected
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            event.preventDefault();
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        if (!this.state.touchStartX) return;

        const touchEndX = event.changedTouches[0].clientX;
        const deltaX = this.state.touchStartX - touchEndX;

        if (Math.abs(deltaX) > this.config.touchThreshold) {
            if (deltaX > 0) {
                this.nextSlide();
                this.trackEvent('touch_navigation', { direction: 'left' });
            } else {
                this.prevSlide();
                this.trackEvent('touch_navigation', { direction: 'right' });
            }
        }

        this.state.touchStartX = 0;
        this.state.touchStartY = 0;
        this.resumeAutoPlay();
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update responsive state
        this.updateResponsiveState();
        
        // Recalculate positions if needed
        this.updateTrackPosition();
        
        this.trackEvent('showcase_resize', {
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight
        });
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAutoPlay();
        } else {
            this.resumeAutoPlay();
        }
    }

    /**
     * Handle image load
     */
    handleImageLoad(index) {
        this.state.imagesLoaded++;
        console.log(`✅ Showcase image ${index + 1} loaded`);
        
        this.trackEvent('showcase_image_loaded', {
            image_index: index,
            total_loaded: this.state.imagesLoaded
        });
    }

    /**
     * Handle image error
     */
    handleImageError(index) {
        console.warn(`⚠️ Showcase image ${index + 1} failed to load`);
        
        this.trackEvent('showcase_image_error', {
            image_index: index
        });
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
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        if (!this.config.analyticsEnabled) return;

        const eventData = {
            event: eventName,
            component: 'dashboard_showcase',
            timestamp: Date.now(),
            current_slide: this.state.currentSlide,
            total_slides: this.state.totalSlides,
            user_interacted: this.state.hasUserInteracted,
            is_playing: this.state.isPlaying,
            is_paused: this.state.isPaused,
            ...data
        };

        console.log('📊 Showcase event:', eventData);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'showcase',
                event_label: `slide_${this.state.currentSlide}`,
                value: this.state.currentSlide
            });
        }

        // Custom analytics
        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }
    }

    /**
     * Handle errors gracefully
     */
    handleError(message, error) {
        console.error(`❌ Showcase Error: ${message}`, error);
        
        this.trackEvent('showcase_error', {
            message,
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * Retry initialization on failure
     */
    retryInitialization() {
        if (this.state.retryCount < this.config.retryAttempts) {
            this.state.retryCount++;
            console.log(`🔄 Retrying showcase initialization (attempt ${this.state.retryCount})`);
            
            setTimeout(() => {
                this.init();
            }, 1000 * this.state.retryCount);
        } else {
            console.error('❌ Max retry attempts reached for showcase initialization');
        }
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
     * Public API
     */
    getAPI() {
        return {
            // Navigation
            goToSlide: (index) => this.goToSlide(index, true),
            nextSlide: () => this.nextSlide(),
            prevSlide: () => this.prevSlide(),
            
            // Control
            play: () => this.startAutoPlay(),
            pause: () => this.pauseAutoPlay(),
            stop: () => this.stopAutoPlay(),
            
            // State
            getCurrentSlide: () => this.state.currentSlide,
            getTotalSlides: () => this.state.totalSlides,
            getState: () => ({ ...this.state }),
            
            // Events
            trackEvent: (name, data) => this.trackEvent(name, data),
            
            // Debug
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
        // Stop timers
        this.stopAutoPlay();
        if (this.initTimeout) clearTimeout(this.initTimeout);

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        console.log('🧹 Dashboard showcase cleaned up');
    }
}

// Initialize showcase when ready
let showcaseInstance = null;

const initializeShowcase = () => {
    if (!showcaseInstance && document.querySelector('.dashboard-showcase-wrapper')) {
        showcaseInstance = new DashboardShowcase({
            autoPlayInterval: 5000,
            transitionDuration: 800,
            touchThreshold: 50,
            analyticsEnabled: true,
            accessibilityEnabled: true
        });
        
        // Export to global scope
        window.DashboardShowcase = showcaseInstance.getAPI();
        
        console.log('🚀 Dashboard Showcase initialized');
    }
};

// Auto-initialize with multiple attempts
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShowcase);
} else {
    initializeShowcase();
}

// Also try after delays for dynamic content
setTimeout(initializeShowcase, 500);
setTimeout(initializeShowcase, 1000);
setTimeout(initializeShowcase, 2000);

console.log('🚀 Dashboard showcase script loaded');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardShowcase;
} else if (typeof define === 'function' && define.amd) {
    define(() => DashboardShowcase);
}

// Hot reload support
if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        if (showcaseInstance) {
            showcaseInstance.destroy();
        }
    });
}