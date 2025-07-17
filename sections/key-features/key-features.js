/**
 * BuilderSolve Key Features Carousel - Clean & Functional
 * Focus on working functionality first
 */

class KeyFeaturesCarousel {
    constructor() {
        // State
        this.currentIndex = 0;
        this.totalSlides = 12;
        this.isAutoPlaying = true;
        this.isTransitioning = false;
        this.contentLoaded = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        
        // DOM elements
        this.track = null;
        this.cards = [];
        this.prevBtn = null;
        this.nextBtn = null;
        this.viewport = null;
        this.learnMoreButtons = [];
        
        // Timers
        this.autoplayTimer = null;
        this.transitionTimer = null;
        this.retryTimer = null;
        
        // Settings
        this.autoplayDelay = 3000; // 3 seconds
        this.transitionDuration = 500;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize carousel with content detection
     */
    init() {
        console.log('🚀 Initializing Key Features Carousel...');
        
        // Wait for DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Setup carousel after DOM is ready
     */
    setup() {
        try {
            // Check if content exists first
            if (this.checkContentExists()) {
                console.log('✅ Key features content found, initializing...');
                this.initializeCarousel();
            } else {
                console.log('⏳ Key features content not found, waiting...');
                this.waitForContent();
            }
        } catch (error) {
            console.error('❌ Failed to setup carousel:', error);
            this.retrySetup();
        }
    }
    
    /**
     * Check if the carousel content exists
     */
    checkContentExists() {
        const section = document.getElementById('key-features-section');
        if (!section) {
            console.log('🔍 Key features section not found');
            return false;
        }
        
        const track = section.querySelector('#features-track');
        const cards = section.querySelectorAll('.feature-card');
        const prevBtn = section.querySelector('#prev-btn');
        const nextBtn = section.querySelector('#next-btn');
        
        const hasContent = !!(track && cards.length > 0 && prevBtn && nextBtn);
        
        console.log('🔍 Content check:', {
            section: !!section,
            track: !!track,
            cards: cards.length,
            prevBtn: !!prevBtn,
            nextBtn: !!nextBtn,
            hasContent
        });
        
        return hasContent;
    }
    
    /**
     * Wait for content to be loaded
     */
    waitForContent() {
        const section = document.getElementById('key-features-section');
        if (!section) {
            console.error('❌ Key features section not found');
            this.retrySetup();
            return;
        }
        
        // Set up mutation observer to watch for content
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    if (this.checkContentExists()) {
                        console.log('✅ Key features content detected!');
                        observer.disconnect();
                        this.initializeCarousel();
                    }
                }
            });
        });
        
        observer.observe(section, {
            childList: true,
            subtree: true
        });
        
        // Timeout fallback
        setTimeout(() => {
            observer.disconnect();
            if (!this.contentLoaded) {
                console.warn('⏰ Timeout waiting for content, retrying...');
                this.retrySetup();
            }
        }, 3000);
    }
    
    /**
     * Retry setup with exponential backoff
     */
    retrySetup() {
        if (this.retryCount >= this.maxRetries) {
            console.error(`❌ Max retries (${this.maxRetries}) reached for key features carousel`);
            return;
        }
        
        this.retryCount++;
        const delay = Math.min(1000 * this.retryCount, 5000); // Max 5 second delay
        
        console.log(`🔄 Retrying key features setup (attempt ${this.retryCount}/${this.maxRetries}) in ${delay}ms`);
        
        this.retryTimer = setTimeout(() => {
            this.setup();
        }, delay);
    }
    
    /**
     * Initialize the carousel with all functionality
     */
    initializeCarousel() {
        try {
            this.cacheElements();
            this.setupCarousel();
            this.bindEvents();
            this.startAutoplay();
            this.setupIntersectionObserver();
            this.contentLoaded = true;
            
            console.log('✅ Key Features Carousel initialized successfully!');
        } catch (error) {
            console.error('❌ Failed to initialize carousel:', error);
            this.retrySetup();
        }
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        const section = document.getElementById('key-features-section');
        if (!section) {
            throw new Error('Key features section not found');
        }
        
        // Find elements within the section
        this.track = section.querySelector('#features-track');
        this.cards = Array.from(section.querySelectorAll('.feature-card'));
        this.prevBtn = section.querySelector('#prev-btn');
        this.nextBtn = section.querySelector('#next-btn');
        this.viewport = section.querySelector('.features-viewport');
        this.learnMoreButtons = Array.from(section.querySelectorAll('.feature-learn-more'));
        
        // Validate critical elements
        if (!this.track || this.cards.length === 0) {
            throw new Error('Critical carousel elements not found');
        }
        
        // Update total slides based on actual cards
        this.totalSlides = this.cards.length;
        
        console.log(`📦 Cached elements: ${this.cards.length} cards, ${this.learnMoreButtons.length} learn more buttons`);
    }
    
    /**
     * Setup initial carousel state
     */
    setupCarousel() {
        // Position track for multi-card display
        this.updateTrackPosition();
        this.updateCardStates();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Card clicks - MAKE CARDS CLICKABLE
        this.cards.forEach((card, index) => {
            card.addEventListener('click', (e) => {
                // Don't trigger card click if Learn More button was clicked
                if (e.target.classList.contains('feature-learn-more')) {
                    return;
                }
                
                console.log(`🎯 Card ${index + 1} clicked! Moving to center...`);
                if (index !== this.currentIndex) {
                    this.goToSlide(index);
                }
            });
        });
        
        // Learn More button clicks
        this.learnMoreButtons.forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                this.handleLearnMoreClick(index, button);
            });
        });
        
        // Pause on hover
        if (this.viewport) {
            this.viewport.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.viewport.addEventListener('mouseleave', () => this.resumeAutoplay());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoplay();
            }
        });
        
        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.resumeAutoplay();
            }
        });
    }
    
    /**
     * Handle Learn More button clicks
     */
    handleLearnMoreClick(index, button) {
        const card = this.cards[index];
        const featureTitle = card.querySelector('.feature-card-title').textContent;
        
        console.log(`📚 Learn More clicked for: ${featureTitle}`);
        
        // Add visual feedback
        button.style.transform = 'translateY(-1px) scale(0.98)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
        
        // Track the click
        this.trackEvent('learn_more_click', {
            feature_title: featureTitle,
            feature_index: index,
            timestamp: Date.now()
        });
        
        // Here you can add your learn more functionality
        // For example: open modal, navigate to page, etc.
        this.showLearnMoreModal(featureTitle, index);
    }
    
    /**
     * Show Learn More modal (placeholder implementation)
     */
    showLearnMoreModal(featureTitle, index) {
        // This is a placeholder - you can implement your own modal/navigation logic
        alert(`Learn more about: ${featureTitle}\n\nThis would typically open a modal or navigate to a detailed page about this feature.`);
        
        // Example of what you might do:
        // window.location.href = `/features/${featureTitle.toLowerCase().replace(/\s+/g, '-')}`;
        // or
        // this.openFeatureModal(index);
    }
    
    /**
     * Track events
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'features_carousel',
            timestamp: Date.now(),
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'features_carousel',
                event_label: data.feature_title || '',
                value: data.feature_index || 0
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
     * Go to specific slide
     */
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) {
            return;
        }
        
        // Validate index
        if (index < 0) index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
        
        console.log(`🎯 Going to slide ${index + 1}/${this.totalSlides}`);
        
        this.isTransitioning = true;
        this.currentIndex = index;
        
        // Update everything
        this.updateCardStates();
        this.updateTrackPosition();
        
        // Reset transition lock
        this.transitionTimer = setTimeout(() => {
            this.isTransitioning = false;
        }, this.transitionDuration);
    }
    
    /**
     * Go to next slide
     */
    next() {
        this.goToSlide(this.currentIndex + 1);
    }
    
    /**
     * Go to previous slide
     */
    prev() {
        this.goToSlide(this.currentIndex - 1);
    }
    
    /**
     * Update card positions and active states - MULTI-CARD DISPLAY
     */
    updateCardStates() {
        this.cards.forEach((card, index) => {
            // Remove all classes
            card.classList.remove('active', 'adjacent');
            
            // Add appropriate class based on position
            if (index === this.currentIndex) {
                card.classList.add('active');
            } else if (
                index === this.currentIndex - 1 ||
                index === this.currentIndex + 1 ||
                (this.currentIndex === 0 && index === this.totalSlides - 1) ||
                (this.currentIndex === this.totalSlides - 1 && index === 0)
            ) {
                card.classList.add('adjacent');
            }
        });
    }
    
    /**
     * Update track position for multi-card centering
     */
    updateTrackPosition() {
        if (!this.track || !this.viewport) return;
        
        const viewportWidth = this.viewport.offsetWidth;
        
        // Get actual card width (responsive)
        const cardWidth = this.cards[0] ? this.cards[0].offsetWidth : 320;
        const cardMargin = 24; // Match CSS margin (var(--space-3) * 2)
        const totalCardWidth = cardWidth + cardMargin;
        
        // Calculate center position
        const centerOffset = (viewportWidth - cardWidth) / 2;
        const slideOffset = this.currentIndex * totalCardWidth;
        
        // Position track to center the active card
        this.track.style.transform = `translateX(${centerOffset - slideOffset}px)`;
    }
    
    /**
     * Start autoplay
     */
    startAutoplay() {
        if (!this.isAutoPlaying) return;
        
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.autoplayDelay);
        
        console.log('▶️ Autoplay started');
    }
    
    /**
     * Stop autoplay
     */
    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }
    
    /**
     * Pause autoplay
     */
    pauseAutoplay() {
        this.stopAutoplay();
    }
    
    /**
     * Resume autoplay
     */
    resumeAutoplay() {
        if (this.isAutoPlaying) {
            this.startAutoplay();
        }
    }
    
    /**
     * Toggle autoplay
     */
    toggleAutoplay() {
        this.isAutoPlaying = !this.isAutoPlaying;
        
        if (this.isAutoPlaying) {
            this.startAutoplay();
        } else {
            this.stopAutoplay();
        }
        
        console.log(`🔄 Autoplay ${this.isAutoPlaying ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Setup intersection observer for animations
     */
    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '-50px 0px'
        });
        
        // Observe fade elements
        const fadeElements = document.querySelectorAll('[data-fade]');
        fadeElements.forEach(el => observer.observe(el));
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        this.updateTrackPosition();
    }
    
    /**
     * Get current state
     */
    getState() {
        return {
            currentIndex: this.currentIndex,
            totalSlides: this.totalSlides,
            isAutoPlaying: this.isAutoPlaying,
            isTransitioning: this.isTransitioning,
            contentLoaded: this.contentLoaded
        };
    }
    
    /**
     * Get public API for external access
     */
    getAPI() {
        return {
            // Navigation
            goToSlide: (index) => this.goToSlide(index),
            next: () => this.next(),
            prev: () => this.prev(),
            
            // Autoplay control
            play: () => {
                this.isAutoPlaying = true;
                this.startAutoplay();
            },
            pause: () => {
                this.isAutoPlaying = false;
                this.stopAutoplay();
            },
            
            // State
            getState: () => this.getState(),
            
            // Learn More functionality
            triggerLearnMore: (index) => {
                if (this.learnMoreButtons[index]) {
                    this.handleLearnMoreClick(index, this.learnMoreButtons[index]);
                }
            },
            
            // Manual restart
            restart: () => {
                console.log('🔄 Manually restarting key features carousel...');
                this.setup();
            }
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
        
        if (this.retryTimer) {
            clearTimeout(this.retryTimer);
        }
        
        console.log('🧹 Carousel destroyed');
    }
}

// Initialize carousel
let carousel = null;

function initializeCarousel() {
    console.log('🔥 Starting key features carousel initialization...');
    
    // Create carousel instance
    carousel = new KeyFeaturesCarousel();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (carousel) {
            carousel.handleResize();
        }
    });
    
    // Export for debugging and external access
    window.KeyFeaturesCarousel = carousel.getAPI();
    
    console.log('✅ Key features carousel setup complete!');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
} else {
    initializeCarousel();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyFeaturesCarousel;
}