/**
 * BuilderSolve Dashboard Showcase Section
 * Handles carousel functionality, auto-play, navigation, and animations
 * 
 * @version 1.0.0
 */

class DashboardShowcase {
    constructor(options = {}) {
        // Configuration
        this.config = {
            autoplayDelay: 4000,
            transitionDuration: 600,
            touchThreshold: 50,
            animationDelay: 100,
            retryAttempts: 3,
            contentWaitTimeout: 5000,
            ...options
        };

        // State management
        this.state = {
            isInitialized: false,
            currentSlide: 0,
            totalSlides: 0,
            isAutoPlaying: true,
            isPaused: false,
            isTransitioning: false,
            touchStartX: 0,
            touchEndX: 0,
            contentLoaded: false,
            retryCount: 0
        };

        // DOM elements cache
        this.elements = {};
        
        // Timers and intervals
        this.autoplayTimer = null;
        this.transitionTimer = null;
        this.contentWaitTimeout = null;
        
        // Observers
        this.intersectionObserver = null;
        this.contentObserver = null;

        // Bind methods
        this.handleNavClick = this.handleNavClick.bind(this);
        this.handleDotClick = this.handleDotClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.autoplayTick = this.autoplayTick.bind(this);
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleImageError = this.handleImageError.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the dashboard showcase
     */
    async init() {
        try {
            performance.mark('dashboard-showcase-init-start');
            
            await this.waitForDOM();
            
            // Check if content is already loaded
            if (this.checkContentExists()) {
                console.log('✅ Dashboard showcase content already loaded');
                await this.initializeWithContent();
            } else {
                console.log('⏳ Dashboard showcase content not loaded yet, waiting...');
                await this.waitForContent();
            }

        } catch (error) {
            this.handleError('Dashboard showcase initialization failed', error);
            await this.retryInitialization();
        }
    }

    /**
     * Check if dashboard showcase content exists
     */
    checkContentExists() {
        const section = document.getElementById('dashboard-showcase-section');
        if (!section) return false;

        const carousel = section.querySelector('.dashboard-carousel');
        const slides = section.querySelectorAll('.carousel-slide');
        const track = section.querySelector('.carousel-track');

        return !!(carousel && slides.length > 0 && track);
    }

    /**
     * Wait for content to be loaded
     */
    waitForContent() {
        return new Promise((resolve, reject) => {
            const section = document.getElementById('dashboard-showcase-section');
            if (!section) {
                reject(new Error('Dashboard showcase section not found'));
                return;
            }

            this.contentWaitTimeout = setTimeout(() => {
                if (this.contentObserver) {
                    this.contentObserver.disconnect();
                }
                reject(new Error('Dashboard showcase content loading timeout'));
            }, this.config.contentWaitTimeout);

            try {
                this.contentObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            if (this.checkContentExists()) {
                                console.log('✅ Dashboard showcase content detected');
                                clearTimeout(this.contentWaitTimeout);
                                this.contentObserver.disconnect();
                                this.initializeWithContent().then(resolve).catch(reject);
                            }
                        }
                    });
                });

                this.contentObserver.observe(section, {
                    childList: true,
                    subtree: true
                });

                console.log('👀 Watching for dashboard showcase content...');
                
            } catch (error) {
                clearTimeout(this.contentWaitTimeout);
                reject(new Error(`Dashboard showcase content observer setup failed: ${error.message}`));
            }
        });
    }

    /**
     * Initialize with content
     */
    async initializeWithContent() {
        try {
            this.state.contentLoaded = true;
            
            console.log('🔧 Starting dashboard showcase initialization...');
            
            this.cacheElements();
            console.log('✅ Elements cached');
            
            this.calculateSlideCount();
            console.log('✅ Slide count calculated:', this.state.totalSlides);
            
            this.setupObservers();
            console.log('✅ Observers setup');
            
            this.bindEvents();
            console.log('✅ Events bound');
            
            this.setupImageHandling();
            console.log('✅ Image handling setup');
            
            this.setupAccessibility();
            console.log('✅ Accessibility setup');
            
            // Start autoplay after a small delay to ensure everything is ready
            setTimeout(() => {
                this.startAutoplay();
                console.log('✅ Autoplay started after delay');
            }, 100);
            
            this.state.isInitialized = true;
            performance.mark('dashboard-showcase-init-end');
            performance.measure('dashboard-showcase-initialization', 'dashboard-showcase-init-start', 'dashboard-showcase-init-end');
            
            console.log('✅ Dashboard showcase initialized successfully');
            this.trackInitialization();

        } catch (error) {
            throw new Error(`Dashboard showcase content initialization failed: ${error.message}`);
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
     * Cache DOM elements
     */
    cacheElements() {
        // Find elements within the dashboard showcase section
        const section = document.getElementById('dashboard-showcase-section');
        if (!section) {
            throw new Error('Dashboard showcase section not found');
        }

        const selectors = {
            section: '#dashboard-showcase-section',
            carousel: '.dashboard-carousel',
            track: '.carousel-track',
            slides: '.carousel-slide',
            navPrev: '.carousel-nav-prev',
            navNext: '.carousel-nav-next',
            dots: '.carousel-dot',
            dotsContainer: '.carousel-dots',
            images: '.dashboard-image',
            fadeElements: '[data-fade]'
        };

        Object.entries(selectors).forEach(([key, selector]) => {
            try {
                // Search within the section for better targeting
                const elements = section.querySelectorAll(selector);
                if (elements.length === 0 && key !== 'section') {
                    // For section itself, use document-level search
                    if (key === 'section') {
                        this.elements[key] = section;
                    } else {
                        this.elements[key] = key.endsWith('s') ? [] : null;
                        console.warn(`⚠️ Element not found in section: ${selector}`);
                    }
                } else if (elements.length === 1) {
                    this.elements[key] = elements[0];
                } else if (elements.length > 1) {
                    this.elements[key] = Array.from(elements);
                } else {
                    this.elements[key] = key.endsWith('s') ? [] : null;
                }
            } catch (error) {
                console.warn(`❌ Failed to cache element: ${selector}`, error);
                this.elements[key] = key.endsWith('s') ? [] : null;
            }
        });

        // Ensure section is set
        this.elements.section = section;

        // Validate critical elements
        if (!this.elements.section || !this.elements.carousel || !this.elements.track) {
            throw new Error('Critical dashboard showcase elements not found');
        }

        console.log('📦 Dashboard showcase elements cached:', {
            section: !!this.elements.section,
            carousel: !!this.elements.carousel,
            track: !!this.elements.track,
            slides: this.elements.slides ? this.elements.slides.length : 0,
            dots: this.elements.dots ? this.elements.dots.length : 0,
            images: this.elements.images ? this.elements.images.length : 0
        });
    }

    /**
     * Calculate slide count
     */
    calculateSlideCount() {
        this.state.totalSlides = this.elements.slides ? this.elements.slides.length : 0;
        
        if (this.state.totalSlides === 0) {
            throw new Error('No slides found in dashboard showcase');
        }

        console.log(`📊 Dashboard showcase: ${this.state.totalSlides} slides detected`);
    }

    /**
     * Setup intersection observer for animations
     */
    setupObservers() {
        if (!this.elements.section) return;

        try {
            this.intersectionObserver = new IntersectionObserver(
                (entries) => this.handleIntersection(entries),
                {
                    threshold: 0.1,
                    rootMargin: '-50px 0px -50px 0px'
                }
            );
            
            this.intersectionObserver.observe(this.elements.section);
            console.log('✅ Dashboard showcase intersection observer setup');
            
        } catch (error) {
            console.warn('⚠️ Dashboard showcase intersection observer setup failed:', error);
        }
    }

    /**
     * Handle intersection for animations
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                this.triggerFadeAnimations();
            }
        });
    }

    /**
     * Trigger fade animations
     */
    triggerFadeAnimations() {
        if (!this.elements.fadeElements || this.elements.fadeElements.length === 0) {
            console.log('⚠️ No fade elements found for dashboard showcase');
            return;
        }

        this.elements.fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('in-view');
                console.log(`✅ Added in-view to fade element ${index + 1}`);
            }, index * this.config.animationDelay);
        });
    }

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Navigation arrows
        if (this.elements.navPrev) {
            this.elements.navPrev.addEventListener('click', this.handleNavClick);
        }
        if (this.elements.navNext) {
            this.elements.navNext.addEventListener('click', this.handleNavClick);
        }

        // Dot navigation
        if (this.elements.dots && this.elements.dots.length > 0) {
            this.elements.dots.forEach(dot => {
                dot.addEventListener('click', this.handleDotClick);
            });
        }

        // Touch events for mobile
        if (this.elements.carousel) {
            this.elements.carousel.addEventListener('touchstart', this.handleTouchStart, { passive: true });
            this.elements.carousel.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.elements.carousel.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        }

        // Mouse events for pause/resume
        if (this.elements.carousel) {
            this.elements.carousel.addEventListener('mouseenter', this.handleMouseEnter);
            this.elements.carousel.addEventListener('mouseleave', this.handleMouseLeave);
        }

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown);

        // Visibility change for performance
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Image loading events
        if (this.elements.images && this.elements.images.length > 0) {
            this.elements.images.forEach((image, index) => {
                image.addEventListener('load', () => this.handleImageLoad(index));
                image.addEventListener('error', () => this.handleImageError(index));
            });
        }

        console.log('✅ Dashboard showcase events bound');
    }

    /**
     * Setup image handling
     */
    setupImageHandling() {
        if (!this.elements.images || this.elements.images.length === 0) return;

        this.elements.images.forEach(image => {
            image.style.opacity = '0';
            image.style.transition = 'opacity 0.5s ease-out';
        });

        this.state.imagesLoaded = new Array(this.elements.images.length).fill(false);
    }

    /**
     * Setup accessibility
     */
    setupAccessibility() {
        // Add ARIA live region
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'dashboard-showcase-announcements';
        document.body.appendChild(liveRegion);

        // Update slide attributes
        this.updateSlideAccessibility();
    }

    /**
     * Update slide accessibility attributes
     */
    updateSlideAccessibility() {
        if (!this.elements.slides || this.elements.slides.length === 0) return;

        this.elements.slides.forEach((slide, index) => {
            slide.setAttribute('aria-hidden', index !== this.state.currentSlide);
            slide.id = `dashboard-slide-${index}`;
        });

        if (this.elements.dots && this.elements.dots.length > 0) {
            this.elements.dots.forEach((dot, index) => {
                dot.setAttribute('aria-selected', index === this.state.currentSlide);
                dot.setAttribute('aria-controls', `dashboard-slide-${index}`);
            });
        }
    }

    /**
     * Handle navigation arrow clicks
     */
    handleNavClick(event) {
        event.preventDefault();
        
        if (this.state.isTransitioning) return;

        const direction = event.currentTarget.dataset.direction;
        
        if (direction === 'prev') {
            this.goToPrevSlide();
        } else if (direction === 'next') {
            this.goToNextSlide();
        }

        this.trackInteraction('nav_click', { direction });
    }

    /**
     * Handle dot clicks
     */
    handleDotClick(event) {
        event.preventDefault();
        
        if (this.state.isTransitioning) return;

        const slideIndex = parseInt(event.currentTarget.dataset.slide);
        this.goToSlide(slideIndex);

        this.trackInteraction('dot_click', { slide: slideIndex });
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        this.state.touchStartX = event.touches[0].clientX;
        this.pauseAutoplay();
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        if (this.state.isTransitioning) {
            event.preventDefault();
            return;
        }

        const touchX = event.touches[0].clientX;
        const deltaX = touchX - this.state.touchStartX;

        // Prevent vertical scrolling during horizontal swipe
        if (Math.abs(deltaX) > 10) {
            event.preventDefault();
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        this.state.touchEndX = event.changedTouches[0].clientX;
        const deltaX = this.state.touchEndX - this.state.touchStartX;

        if (Math.abs(deltaX) > this.config.touchThreshold) {
            if (deltaX > 0) {
                this.goToPrevSlide();
            } else {
                this.goToNextSlide();
            }
            
            this.trackInteraction('swipe', { direction: deltaX > 0 ? 'right' : 'left' });
        }

        this.resumeAutoplay();
    }

    /**
     * Handle mouse enter (pause autoplay)
     */
    handleMouseEnter() {
        this.pauseAutoplay();
    }

    /**
     * Handle mouse leave (resume autoplay)
     */
    handleMouseLeave() {
        this.resumeAutoplay();
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        if (!this.elements.carousel) return;

        // Only handle if carousel is in focus
        if (!this.elements.carousel.contains(document.activeElement)) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.goToPrevSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.goToNextSlide();
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                this.toggleAutoplay();
                break;
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.pauseAutoplay();
        } else {
            this.resumeAutoplay();
        }
    }

    /**
     * Handle image load
     */
    handleImageLoad(index) {
        if (this.state.imagesLoaded) {
            this.state.imagesLoaded[index] = true;
        }
        
        if (this.elements.images && this.elements.images[index]) {
            this.elements.images[index].style.opacity = '1';
        }
        
        console.log(`✅ Dashboard showcase image ${index + 1} loaded`);
        this.trackInteraction('image_loaded', { index });
    }

    /**
     * Handle image error
     */
    handleImageError(index) {
        console.warn(`⚠️ Dashboard showcase image ${index + 1} failed to load`);
        
        if (this.elements.slides && this.elements.slides[index]) {
            const slide = this.elements.slides[index];
            const imageCard = slide.querySelector('.dashboard-image-card');
            
            if (imageCard) {
                imageCard.style.background = 'linear-gradient(135deg, #F1F5F9, #E2E8F0)';
                imageCard.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #64748B;">
                        <div style="text-align: center;">
                            <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
                            <div style="font-weight: 600;">Dashboard ${index + 1}</div>
                        </div>
                    </div>
                `;
            }
        }
        
        this.trackInteraction('image_error', { index });
    }

    /**
     * Go to specific slide
     */
    goToSlide(slideIndex) {
        console.log(`🎯 goToSlide called with index: ${slideIndex}`, {
            currentSlide: this.state.currentSlide,
            totalSlides: this.state.totalSlides,
            isTransitioning: this.state.isTransitioning
        });

        if (this.state.isTransitioning || slideIndex === this.state.currentSlide) {
            console.log('⏸️ goToSlide blocked:', {
                reason: this.state.isTransitioning ? 'transitioning' : 'same slide'
            });
            return;
        }
        
        if (slideIndex < 0 || slideIndex >= this.state.totalSlides) {
            console.log('❌ goToSlide blocked: invalid index');
            return;
        }

        this.state.isTransitioning = true;
        const previousSlide = this.state.currentSlide;
        this.state.currentSlide = slideIndex;

        console.log(`📱 Moving from slide ${previousSlide} to slide ${slideIndex}`);

        // Update track position
        if (this.elements.track) {
            const translateX = -slideIndex * 100;
            this.elements.track.style.transform = `translateX(${translateX}%)`;
            console.log(`🎬 Track transform: translateX(${translateX}%)`);
        } else {
            console.error('❌ Track element not found!');
        }

        // Update slide states
        this.updateSlideStates();
        this.updateDotStates();
        this.updateSlideAccessibility();

        // Reset transition flag
        this.transitionTimer = setTimeout(() => {
            this.state.isTransitioning = false;
            console.log('✅ Transition complete');
        }, this.config.transitionDuration);

        // Announce slide change
        this.announceSlideChange(slideIndex);

        // Track slide change
        this.trackInteraction('slide_change', { 
            from: previousSlide, 
            to: slideIndex 
        });

        console.log(`📱 Dashboard showcase: Moved to slide ${slideIndex + 1}`);
    }

    /**
     * Go to next slide
     */
    goToNextSlide() {
        const nextSlide = (this.state.currentSlide + 1) % this.state.totalSlides;
        this.goToSlide(nextSlide);
    }

    /**
     * Go to previous slide
     */
    goToPrevSlide() {
        const prevSlide = this.state.currentSlide === 0 ? this.state.totalSlides - 1 : this.state.currentSlide - 1;
        this.goToSlide(prevSlide);
    }

    /**
     * Update slide states
     */
    updateSlideStates() {
        if (!this.elements.slides || this.elements.slides.length === 0) return;

        this.elements.slides.forEach((slide, index) => {
            if (index === this.state.currentSlide) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    /**
     * Update dot states
     */
    updateDotStates() {
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
     * Start autoplay
     */
    startAutoplay() {
        if (!this.state.isAutoPlaying || this.state.totalSlides <= 1) {
            console.log('🚫 Autoplay not started:', {
                isAutoPlaying: this.state.isAutoPlaying,
                totalSlides: this.state.totalSlides
            });
            return;
        }

        // Clear any existing timer
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
        }

        this.autoplayTimer = setInterval(this.autoplayTick, this.config.autoplayDelay);
        console.log(`▶️ Dashboard showcase autoplay started (${this.config.autoplayDelay}ms interval)`);
    }

    /**
     * Stop autoplay
     */
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
        console.log('⏸️ Dashboard showcase autoplay stopped');
    }

    /**
     * Pause autoplay
     */
    pauseAutoplay() {
        this.state.isPaused = true;
        this.stopAutoplay();
    }

    /**
     * Resume autoplay
     */
    resumeAutoplay() {
        if (this.state.isAutoPlaying && this.state.isPaused) {
            this.state.isPaused = false;
            this.startAutoplay();
        }
    }

    /**
     * Toggle autoplay
     */
    toggleAutoplay() {
        this.state.isAutoPlaying = !this.state.isAutoPlaying;
        
        if (this.state.isAutoPlaying) {
            this.startAutoplay();
        } else {
            this.stopAutoplay();
        }
        
        this.trackInteraction('autoplay_toggle', { enabled: this.state.isAutoPlaying });
    }

    /**
     * Autoplay tick
     */
    autoplayTick() {
        console.log('🔄 Autoplay tick:', {
            isPaused: this.state.isPaused,
            isTransitioning: this.state.isTransitioning,
            currentSlide: this.state.currentSlide,
            totalSlides: this.state.totalSlides
        });

        if (!this.state.isPaused && !this.state.isTransitioning) {
            this.goToNextSlide();
        } else {
            console.log('⏸️ Autoplay tick skipped - paused or transitioning');
        }
    }

    /**
     * Announce slide change to screen readers
     */
    announceSlideChange(slideIndex) {
        const liveRegion = document.getElementById('dashboard-showcase-announcements');
        if (liveRegion) {
            liveRegion.textContent = `Dashboard screenshot ${slideIndex + 1} of ${this.state.totalSlides}`;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Track interactions
     */
    trackInteraction(action, data = {}) {
        const eventData = {
            event: action,
            component: 'dashboard_showcase',
            timestamp: Date.now(),
            ...data
        };

        console.log('📊 Dashboard showcase interaction:', eventData);

        // Analytics integration
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'dashboard_showcase',
                event_label: data.direction || data.slide || '',
                value: data.index || this.state.currentSlide
            });
        }

        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }
    }

    /**
     * Track initialization
     */
    trackInitialization() {
        this.trackInteraction('initialized', {
            total_slides: this.state.totalSlides,
            autoplay_enabled: this.state.isAutoPlaying,
            features_enabled: {
                touch_support: true,
                keyboard_navigation: true,
                autoplay: this.state.isAutoPlaying
            }
        });
    }

    /**
     * Handle errors
     */
    handleError(message, error) {
        console.error(`❌ Dashboard showcase error: ${message}`, error);
        
        this.trackInteraction('error', {
            message,
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * Retry initialization
     */
    async retryInitialization() {
        if (this.state.retryCount < this.config.retryAttempts) {
            this.state.retryCount++;
            console.log(`🔄 Retrying dashboard showcase initialization (attempt ${this.state.retryCount})`);
            
            setTimeout(() => {
                this.init();
            }, 1000 * this.state.retryCount);
        } else {
            console.error('❌ Dashboard showcase max retry attempts reached');
        }
    }

    /**
     * Get public API
     */
    getAPI() {
        return {
            // State
            getState: () => ({ ...this.state }),
            getCurrentSlide: () => this.state.currentSlide,
            getTotalSlides: () => this.state.totalSlides,
            
            // Navigation
            goToSlide: this.goToSlide.bind(this),
            goToNextSlide: this.goToNextSlide.bind(this),
            goToPrevSlide: this.goToPrevSlide.bind(this),
            
            // Autoplay
            startAutoplay: this.startAutoplay.bind(this),
            stopAutoplay: this.stopAutoplay.bind(this),
            toggleAutoplay: this.toggleAutoplay.bind(this),
            restartAutoplay: () => {
                console.log('🔄 Manually restarting autoplay...');
                this.stopAutoplay();
                this.state.isAutoPlaying = true;
                this.state.isPaused = false;
                this.startAutoplay();
            },
            
            // Tracking
            trackInteraction: this.trackInteraction.bind(this),
            
            // Content detection
            isContentLoaded: () => this.state.contentLoaded,
            
            // Debugging
            debug: () => ({
                state: this.state,
                elements: this.elements,
                config: this.config,
                timers: {
                    autoplayTimer: !!this.autoplayTimer,
                    transitionTimer: !!this.transitionTimer
                }
            })
        };
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        // Clear timers
        if (this.autoplayTimer) clearInterval(this.autoplayTimer);
        if (this.transitionTimer) clearTimeout(this.transitionTimer);
        if (this.contentWaitTimeout) clearTimeout(this.contentWaitTimeout);

        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);

        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
        
        console.log('🧹 Dashboard showcase cleaned up');
    }
}

// Initialize dashboard showcase
let dashboardShowcaseInstance;

const initializeDashboardShowcase = () => {
    console.log('🚀 Starting Dashboard Showcase initialization...');
    
    dashboardShowcaseInstance = new DashboardShowcase({
        autoplayDelay: 4000,
        transitionDuration: 600,
        touchThreshold: 50,
        contentWaitTimeout: 5000
    });
    
    // Export to global scope
    window.BuilderSolveDashboardShowcase = dashboardShowcaseInstance.getAPI();
    
    // Debug helper - you can call this in console to restart autoplay
    window.debugDashboardShowcase = () => {
        console.log('🔧 Dashboard Showcase Debug Info:');
        console.log(dashboardShowcaseInstance.getAPI().debug());
        
        // Manual restart function
        console.log('💡 To restart autoplay manually, run: window.BuilderSolveDashboardShowcase.restartAutoplay()');
    };
    
    console.log('✅ Dashboard Showcase API exported to window.BuilderSolveDashboardShowcase');
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboardShowcase);
} else {
    initializeDashboardShowcase();
}

// Hot reload support
if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        if (dashboardShowcaseInstance) {
            dashboardShowcaseInstance.destroy();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardShowcase;
} else if (typeof define === 'function' && define.amd) {
    define(() => DashboardShowcase);
}