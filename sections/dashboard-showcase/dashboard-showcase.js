/**
 * Professional Dashboard Showcase Carousel
 * High-quality, smooth carousel with mobile-first responsive design
 * 
 * @version 3.0.0 - PROFESSIONAL EDITION
 */

class ProfessionalDashboardCarousel {
    constructor(options = {}) {
        // Configuration
        this.config = {
            autoPlay: false,
            autoPlayInterval: 7000,
            animationDuration: 800,
            swipeThreshold: 80,
            enableKeyboard: true,
            enableTouch: true,
            enableIndicators: true,
            cardWidth: 420,
            cardGap: 32,
            trackInteractions: true,
            responsiveBreakpoint: 768,
            ...options
        };

        // State management
        this.state = {
            isInitialized: false,
            currentSlide: 0,
            totalSlides: 0,
            isAnimating: false,
            isVisible: false,
            isMobile: false,
            autoPlayTimer: null,
            touchStartX: 0,
            touchStartY: 0,
            touchEndX: 0,
            touchEndY: 0,
            isDragging: false,
            dragStartX: 0,
            dragCurrentX: 0,
            containerWidth: 0,
            maxTranslate: 0
        };

        // DOM elements
        this.elements = {};
        
        // Observers
        this.intersectionObserver = null;
        this.resizeObserver = null;
        
        // Bind methods
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleIndicatorClick = this.handleIndicatorClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleResize = this.debounce(this.handleResize.bind(this), 250);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the carousel
     */
    async init() {
        try {
            await this.waitForContent();
            this.cacheElements();
            this.checkMobileState();
            this.calculateDimensions();
            this.setupObservers();
            this.bindEvents();
            this.setupAccessibility();
            this.updateActiveStates();
            this.initializePosition();
            
            this.state.isInitialized = true;
            console.log('✅ Professional Dashboard Carousel initialized');
            this.trackEvent('carousel_initialized');
            
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }

    /**
     * Wait for content to load
     */
    waitForContent() {
        return new Promise((resolve) => {
            const checkContent = () => {
                const section = document.querySelector('.dashboard-showcase-section');
                if (section && section.querySelector('.screenshot-card')) {
                    resolve();
                } else {
                    setTimeout(checkContent, 100);
                }
            };
            checkContent();
        });
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            section: document.querySelector('.dashboard-showcase-section'),
            container: document.querySelector('.carousel-container'),
            track: document.querySelector('.carousel-track'),
            cards: document.querySelectorAll('.screenshot-card'),
            prevButton: document.querySelector('.carousel-control--prev'),
            nextButton: document.querySelector('.carousel-control--next'),
            indicators: document.querySelectorAll('.indicator'),
            expandButtons: document.querySelectorAll('.expand-btn'),
            ctaButton: document.querySelector('.section-cta .btn-primary-large')
        };

        // Validate critical elements
        const required = ['section', 'container', 'track', 'cards'];
        for (const element of required) {
            if (!this.elements[element] || (element === 'cards' && this.elements[element].length === 0)) {
                throw new Error(`Required element missing: ${element}`);
            }
        }

        this.state.totalSlides = this.elements.cards.length;
        console.log(`📦 Cached ${this.state.totalSlides} cards`);
    }

    /**
     * Check if we're in mobile mode
     */
    checkMobileState() {
        this.state.isMobile = window.innerWidth < this.config.responsiveBreakpoint;
        
        if (this.state.isMobile) {
            this.elements.section.classList.add('mobile-mode');
        } else {
            this.elements.section.classList.remove('mobile-mode');
        }
    }

    /**
     * Calculate carousel dimensions
     */
    calculateDimensions() {
        if (this.state.isMobile) {
            // In mobile mode, cards are stacked vertically
            this.state.containerWidth = 0;
            this.state.maxTranslate = 0;
            return;
        }

        const containerRect = this.elements.container.getBoundingClientRect();
        this.state.containerWidth = containerRect.width - 32; // Account for padding
        
        const cardWidth = this.config.cardWidth;
        const cardGap = this.config.cardGap;
        const totalWidth = (cardWidth + cardGap) * this.state.totalSlides - cardGap;
        
        this.state.maxTranslate = Math.max(0, totalWidth - this.state.containerWidth);
        
        console.log(`📏 Dimensions: container=${this.state.containerWidth}px, maxTranslate=${this.state.maxTranslate}px`);
    }

    /**
     * Setup observers
     */
    setupObservers() {
        // Intersection observer for auto-play
        this.intersectionObserver = new IntersectionObserver(
            (entries) => this.handleIntersection(entries),
            { threshold: 0.3 }
        );

        if (this.elements.section) {
            this.intersectionObserver.observe(this.elements.section);
        }

        // Resize observer
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(() => this.handleResize());
            this.resizeObserver.observe(this.elements.container);
        }

        console.log('✅ Observers setup complete');
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        if (this.elements.prevButton) {
            this.elements.prevButton.addEventListener('click', this.handlePrevClick);
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.addEventListener('click', this.handleNextClick);
        }

        // Indicators
        this.elements.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => this.handleIndicatorClick(index));
        });

        // Expand buttons
        this.elements.expandButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => this.handleExpandClick(e, index));
        });

        // CTA button
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('click', this.handleCTAClick.bind(this));
        }

        // Touch events for mobile/desktop
        if (this.config.enableTouch) {
            this.elements.track.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            this.elements.track.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            this.elements.track.addEventListener('touchend', this.handleTouchEnd, { passive: true });
            
            // Mouse events for desktop dragging
            this.elements.track.addEventListener('mousedown', this.handleMouseDown);
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        }

        // Keyboard navigation
        if (this.config.enableKeyboard) {
            document.addEventListener('keydown', this.handleKeyDown);
        }

        // Window events
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        console.log('✅ Event listeners bound');
    }

    /**
     * Setup accessibility
     */
    setupAccessibility() {
        // Add ARIA attributes
        this.elements.container.setAttribute('role', 'region');
        this.elements.container.setAttribute('aria-label', 'Dashboard screenshots carousel');
        
        this.elements.cards.forEach((card, index) => {
            card.setAttribute('role', 'group');
            card.setAttribute('aria-roledescription', 'slide');
            card.setAttribute('aria-label', `Screenshot ${index + 1} of ${this.state.totalSlides}`);
        });

        // Live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
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
        this.elements.container.appendChild(liveRegion);
        this.elements.liveRegion = liveRegion;

        console.log('✅ Accessibility features setup');
    }

    /**
     * Initialize carousel position
     */
    initializePosition() {
        if (this.state.isMobile) return;
        
        this.updateTrackPosition(false);
        this.updateActiveStates();
    }

    /**
     * Handle intersection observer
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !this.state.isVisible) {
                this.state.isVisible = true;
                this.startAutoPlay();
                this.trackEvent('carousel_viewed');
            } else if (!entry.isIntersecting && this.state.isVisible) {
                this.state.isVisible = false;
                this.stopAutoPlay();
            }
        });
    }

    /**
     * Handle previous button click
     */
    handlePrevClick() {
        this.goToPrevSlide();
        this.trackEvent('prev_clicked');
    }

    /**
     * Handle next button click
     */
    handleNextClick() {
        this.goToNextSlide();
        this.trackEvent('next_clicked');
    }

    /**
     * Handle indicator click
     */
    handleIndicatorClick(index) {
        this.goToSlide(index);
        this.trackEvent('indicator_clicked', { slide_index: index });
    }

    /**
     * Go to previous slide
     */
    goToPrevSlide() {
        if (this.state.isMobile || this.state.isAnimating) return;
        
        const prevIndex = this.state.currentSlide - 1;
        const targetIndex = prevIndex < 0 ? this.state.totalSlides - 1 : prevIndex;
        this.goToSlide(targetIndex);
    }

    /**
     * Go to next slide
     */
    goToNextSlide() {
        if (this.state.isMobile || this.state.isAnimating) return;
        
        const nextIndex = this.state.currentSlide + 1;
        const targetIndex = nextIndex >= this.state.totalSlides ? 0 : nextIndex;
        this.goToSlide(targetIndex);
    }

    /**
     * Go to specific slide
     */
    goToSlide(index, animate = true) {
        if (this.state.isMobile || index < 0 || index >= this.state.totalSlides || this.state.isAnimating) {
            return;
        }

        this.state.isAnimating = true;
        this.state.currentSlide = index;
        this.stopAutoPlay();

        this.updateTrackPosition(animate);
        this.updateActiveStates();
        this.announceSlideChange(index);

        // Reset animation flag
        setTimeout(() => {
            this.state.isAnimating = false;
            if (this.config.autoPlay && this.state.isVisible) {
                this.startAutoPlay();
            }
        }, animate ? this.config.animationDuration : 0);

        this.trackEvent('slide_changed', { slide_index: index });
    }

    /**
     * Update track position
     */
    updateTrackPosition(animate = true) {
        if (this.state.isMobile) return;

        const cardWidth = this.config.cardWidth;
        const cardGap = this.config.cardGap;
        const translateX = -(this.state.currentSlide * (cardWidth + cardGap));
        
        // Clamp to valid range
        const clampedTranslateX = Math.max(-this.state.maxTranslate, Math.min(0, translateX));
        
        const track = this.elements.track;
        if (animate) {
            track.style.transition = `transform ${this.config.animationDuration}ms cubic-bezier(0.25, 1, 0.5, 1)`;
        } else {
            track.style.transition = 'none';
        }
        
        track.style.transform = `translateX(${clampedTranslateX}px)`;
    }

    /**
     * Update active states
     */
    updateActiveStates() {
        // Update cards
        this.elements.cards.forEach((card, index) => {
            if (index === this.state.currentSlide) {
                card.classList.add('active');
                card.setAttribute('aria-current', 'true');
            } else {
                card.classList.remove('active');
                card.setAttribute('aria-current', 'false');
            }
        });

        // Update indicators
        this.elements.indicators.forEach((indicator, index) => {
            if (index === this.state.currentSlide) {
                indicator.classList.add('active');
                indicator.setAttribute('aria-current', 'true');
            } else {
                indicator.classList.remove('active');
                indicator.setAttribute('aria-current', 'false');
            }
        });

        // Update navigation buttons
        if (this.elements.prevButton) {
            this.elements.prevButton.disabled = false;
        }
        
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = false;
        }
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        if (!this.state.isVisible || this.state.isMobile) return;

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                this.goToPrevSlide();
                break;
            case 'ArrowRight':
                event.preventDefault();
                this.goToNextSlide();
                break;
            case 'Home':
                event.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                event.preventDefault();
                this.goToSlide(this.state.totalSlides - 1);
                break;
        }
    }

    /**
     * Handle touch start
     */
    handleTouchStart(event) {
        if (this.state.isMobile) return;
        
        this.state.isDragging = true;
        this.state.touchStartX = event.touches[0].clientX;
        this.state.touchStartY = event.touches[0].clientY;
        this.state.dragStartX = event.touches[0].clientX;
        this.stopAutoPlay();
        
        this.elements.track.style.transition = 'none';
    }

    /**
     * Handle touch move
     */
    handleTouchMove(event) {
        if (this.state.isMobile || !this.state.isDragging) return;

        const currentX = event.touches[0].clientX;
        const currentY = event.touches[0].clientY;
        const deltaX = currentX - this.state.dragStartX;
        const deltaY = Math.abs(currentY - this.state.touchStartY);
        
        // If vertical movement is greater, don't prevent scroll
        if (deltaY > Math.abs(deltaX)) {
            this.state.isDragging = false;
            return;
        }
        
        event.preventDefault();
        this.state.dragCurrentX = currentX;
        
        // Calculate current position
        const cardWidth = this.config.cardWidth;
        const cardGap = this.config.cardGap;
        const currentTranslateX = -(this.state.currentSlide * (cardWidth + cardGap));
        const newTranslateX = currentTranslateX + deltaX;
        
        // Apply transform with bounds
        const clampedTranslateX = Math.max(-this.state.maxTranslate, Math.min(0, newTranslateX));
        this.elements.track.style.transform = `translateX(${clampedTranslateX}px)`;
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(event) {
        if (this.state.isMobile || !this.state.isDragging) return;

        this.state.isDragging = false;
        this.state.touchEndX = event.changedTouches[0].clientX;
        
        const swipeDistance = this.state.touchEndX - this.state.touchStartX;
        
        if (Math.abs(swipeDistance) > this.config.swipeThreshold) {
            if (swipeDistance > 0) {
                this.goToPrevSlide();
            } else {
                this.goToNextSlide();
            }
        } else {
            // Snap back to current slide
            this.goToSlide(this.state.currentSlide);
        }
        
        this.trackEvent('swipe_gesture', { 
            distance: swipeDistance,
            direction: swipeDistance > 0 ? 'right' : 'left'
        });
    }

    /**
     * Handle mouse down (desktop dragging)
     */
    handleMouseDown(event) {
        if (this.state.isMobile) return;
        
        event.preventDefault();
        this.state.isDragging = true;
        this.state.dragStartX = event.clientX;
        this.elements.container.style.cursor = 'grabbing';
        this.stopAutoPlay();
        
        this.elements.track.style.transition = 'none';
    }

    /**
     * Handle mouse move (desktop dragging)
     */
    handleMouseMove(event) {
        if (this.state.isMobile || !this.state.isDragging) return;

        event.preventDefault();
        this.state.dragCurrentX = event.clientX;
        const deltaX = this.state.dragCurrentX - this.state.dragStartX;
        
        const cardWidth = this.config.cardWidth;
        const cardGap = this.config.cardGap;
        const currentTranslateX = -(this.state.currentSlide * (cardWidth + cardGap));
        const newTranslateX = currentTranslateX + deltaX;
        
        const clampedTranslateX = Math.max(-this.state.maxTranslate, Math.min(0, newTranslateX));
        this.elements.track.style.transform = `translateX(${clampedTranslateX}px)`;
    }

    /**
     * Handle mouse up (desktop dragging)
     */
    handleMouseUp(event) {
        if (this.state.isMobile || !this.state.isDragging) return;

        this.state.isDragging = false;
        this.elements.container.style.cursor = 'grab';
        
        const deltaX = event.clientX - this.state.dragStartX;
        
        if (Math.abs(deltaX) > this.config.swipeThreshold) {
            if (deltaX > 0) {
                this.goToPrevSlide();
            } else {
                this.goToNextSlide();
            }
        } else {
            this.goToSlide(this.state.currentSlide);
        }
    }

    /**
     * Handle expand button click
     */
    handleExpandClick(event, slideIndex) {
        event.preventDefault();
        event.stopPropagation();
        
        const cardTitles = [
            'Production Summary',
            'Estimate Detail',
            'Calendar View',
            'Team Management',
            'Financial Reports',
            'Project Analytics'
        ];
        
        this.openImageModal(cardTitles[slideIndex] || 'Dashboard Screenshot', slideIndex);
        this.trackEvent('image_expanded', { slide_index: slideIndex });
    }

    /**
     * Open image modal
     */
    openImageModal(title, slideIndex) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <button class="modal-close" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
                <div class="modal-body">
                    <h3 class="modal-title">${title}</h3>
                    <p class="modal-subtitle">Full resolution screenshot would be displayed here</p>
                    <div class="modal-placeholder">
                        <div class="placeholder-icon">${this.getCardIcon(slideIndex)}</div>
                        <div class="placeholder-text">${title}</div>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .image-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            .image-modal.active {
                opacity: 1;
            }
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
            }
            .modal-content {
                position: relative;
                background: white;
                border-radius: 1rem;
                max-width: 90vw;
                max-height: 90vh;
                padding: 2rem;
                transform: scale(0.9);
                transition: transform 0.3s ease;
            }
            .image-modal.active .modal-content {
                transform: scale(1);
            }
            .modal-close {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
                border-radius: 0.5rem;
                color: #6b7280;
            }
            .modal-close:hover {
                background: #f3f4f6;
            }
            .modal-title {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 0.5rem;
                color: #111827;
            }
            .modal-subtitle {
                color: #6b7280;
                margin-bottom: 2rem;
            }
            .modal-placeholder {
                background: #f9fafb;
                border-radius: 0.5rem;
                padding: 4rem;
                text-align: center;
                min-height: 400px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            .placeholder-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
                opacity: 0.6;
            }
            .placeholder-text {
                font-size: 1.25rem;
                font-weight: 600;
                color: #374151;
            }
        `;
        document.head.appendChild(style);

        // Add to page
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Show modal
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });

        // Close handlers
        const closeModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => {
                document.body.removeChild(modal);
                document.head.removeChild(style);
            }, 300);
        };

        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        }, { once: true });
    }

    /**
     * Get card icon by index
     */
    getCardIcon(index) {
        const icons = ['📊', '💰', '📅', '👥', '📈', '📊'];
        return icons[index] || '📱';
    }

    /**
     * Handle CTA button click
     */
    handleCTAClick() {
        this.trackEvent('cta_clicked');
    }

    /**
     * Handle resize
     */
    handleResize() {
        const wasMobile = this.state.isMobile;
        this.checkMobileState();
        
        if (wasMobile !== this.state.isMobile) {
            // Mode changed, reinitialize
            this.calculateDimensions();
            this.initializePosition();
        } else if (!this.state.isMobile) {
            // Still desktop, just recalculate
            this.calculateDimensions();
            this.updateTrackPosition(false);
        }
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.stopAutoPlay();
        } else if (this.state.isVisible && this.config.autoPlay) {
            this.startAutoPlay();
        }
    }

    /**
     * Start auto play
     */
    startAutoPlay() {
        if (!this.config.autoPlay || this.state.isMobile) return;

        this.stopAutoPlay();
        this.state.autoPlayTimer = setInterval(() => {
            if (!this.state.isAnimating && this.state.isVisible) {
                this.goToNextSlide();
            }
        }, this.config.autoPlayInterval);
    }

    /**
     * Stop auto play
     */
    stopAutoPlay() {
        if (this.state.autoPlayTimer) {
            clearInterval(this.state.autoPlayTimer);
            this.state.autoPlayTimer = null;
        }
    }

    /**
     * Announce slide change to screen readers
     */
    announceSlideChange(index) {
        if (this.elements.liveRegion) {
            const cardTitle = this.elements.cards[index].querySelector('.card-title')?.textContent || 'Dashboard';
            this.elements.liveRegion.textContent = `Slide ${index + 1} of ${this.state.totalSlides}: ${cardTitle}`;
        }
    }

    /**
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        if (!this.config.trackInteractions) return;

        const eventData = {
            event: eventName,
            component: 'professional_dashboard_carousel',
            timestamp: Date.now(),
            current_slide: this.state.currentSlide,
            total_slides: this.state.totalSlides,
            is_mobile: this.state.isMobile,
            ...data
        };

        console.log('📊 Professional Carousel Event:', eventData);

        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'dashboard_carousel',
                event_label: `slide_${this.state.currentSlide}`,
                value: this.state.currentSlide
            });
        }

        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }
    }

    /**
     * Handle errors gracefully
     */
    handleError(message, error) {
        console.error(`❌ Professional Carousel Error: ${message}`, error);
        
        this.trackEvent('error_occurred', {
            message,
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * Debounce function
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
     * Public API
     */
    getAPI() {
        return {
            // Navigation
            goToSlide: (index) => this.goToSlide(index),
            goToNext: () => this.goToNextSlide(),
            goToPrev: () => this.goToPrevSlide(),
            
            // State
            getCurrentSlide: () => this.state.currentSlide,
            getTotalSlides: () => this.state.totalSlides,
            isMobile: () => this.state.isMobile,
            getState: () => ({ ...this.state }),
            
            // Controls
            startAutoPlay: () => {
                this.config.autoPlay = true;
                this.startAutoPlay();
            },
            stopAutoPlay: () => {
                this.config.autoPlay = false;
                this.stopAutoPlay();
            },
            
            // Events
            trackEvent: (name, data) => this.trackEvent(name, data)
        };
    }

    /**
     * Cleanup
     */
    destroy() {
        this.stopAutoPlay();
        
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('🧹 Professional Carousel cleaned up');
    }
}

// Initialize
let carouselInstance;

const initializeProfessionalCarousel = () => {
    carouselInstance = new ProfessionalDashboardCarousel({
        autoPlay: false,
        enableKeyboard: true,
        enableTouch: true,
        trackInteractions: true,
        swipeThreshold: 80,
        animationDuration: 800
    });
    
    // Export to global scope
    window.BuilderSolveDashboard = carouselInstance.getAPI();
    window.ProfessionalCarousel = carouselInstance;
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeProfessionalCarousel);
} else {
    initializeProfessionalCarousel();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalDashboardCarousel;
} else if (typeof define === 'function' && define.amd) {
    define(() => ProfessionalDashboardCarousel);
}