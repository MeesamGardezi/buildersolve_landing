/**
 * Simple Static Card Deck Features
 * Works with pre-built HTML cards - much more reliable!
 */

class SimpleCardDeck {
    constructor() {
        // State
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.isAutoPlaying = true;
        this.visibleCards = 4;
        
        // DOM elements
        this.container = null;
        this.allCards = [];
        this.prevBtn = null;
        this.nextBtn = null;
        this.progressCurrent = null;
        
        // Timers
        this.autoplayTimer = null;
        
        // Settings
        this.autoplayDelay = 4000;
        this.transitionDuration = 500;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the card deck
     */
    init() {
        console.log('🃏 Initializing Simple Card Deck...');
        
        // Wait for content to be loaded
        setTimeout(() => {
            this.setup();
        }, 100);
    }
    
    /**
     * Setup the card deck
     */
    setup() {
        try {
            if (this.findElements()) {
                this.arrangeCards();
                this.bindEvents();
                this.updateProgress();
                this.startAutoplay();
                this.setupIntersectionObserver();
                
                console.log(`✅ Simple Card Deck initialized with ${this.allCards.length} cards!`);
            } else {
                console.log('⏳ Retrying card deck setup...');
                setTimeout(() => this.setup(), 500);
            }
        } catch (error) {
            console.error('❌ Failed to setup card deck:', error);
        }
    }
    
    /**
     * Find all the DOM elements
     */
    findElements() {
        // Find container
        this.container = document.getElementById('deck-container');
        if (!this.container) {
            console.log('🔍 Deck container not found yet...');
            return false;
        }
        
        // Find all cards
        this.allCards = Array.from(this.container.querySelectorAll('.feature-deck-card'));
        if (this.allCards.length === 0) {
            console.log('🔍 No cards found yet...');
            return false;
        }
        
        // Find navigation buttons
        this.prevBtn = document.getElementById('deck-prev-btn');
        this.nextBtn = document.getElementById('deck-next-btn');
        
        // Find progress indicator
        this.progressCurrent = document.querySelector('.progress-current');
        this.progressTotal = document.querySelector('.progress-total');
        
        console.log(`📦 Found ${this.allCards.length} cards and navigation elements`);
        return true;
    }
    
    /**
     * Arrange cards in the stack
     */
    arrangeCards() {
        this.allCards.forEach((card, index) => {
            const stackPosition = this.getStackPosition(index);
            this.positionCard(card, stackPosition);
            
            // Set click handler for top card
            card.addEventListener('click', (e) => {
                if (stackPosition === 0 && !e.target.classList.contains('card-learn-more')) {
                    this.nextCard();
                }
            });
            
            // Handle learn more button
            const learnMoreBtn = card.querySelector('.card-learn-more');
            if (learnMoreBtn) {
                learnMoreBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleLearnMore(card);
                });
            }
        });
        
        // Update progress total
        if (this.progressTotal) {
            this.progressTotal.textContent = this.allCards.length;
        }
    }
    
    /**
     * Get stack position for a card based on current index
     */
    getStackPosition(cardIndex) {
        const position = (cardIndex - this.currentIndex + this.allCards.length) % this.allCards.length;
        return position < this.visibleCards ? position : -1; // -1 means hidden
    }
    
    /**
     * Position a card in the stack
     */
    positionCard(card, stackPosition) {
        if (stackPosition === -1) {
            // Hide card
            card.style.display = 'none';
            return;
        }
        
        // Show card
        card.style.display = 'block';
        
        // Position in stack
        const yOffset = stackPosition * 8;
        const scale = 1 - (stackPosition * 0.04);
        const opacity = stackPosition === 0 ? 1 : Math.max(0.3, 0.8 - (stackPosition * 0.15));
        const zIndex = this.visibleCards - stackPosition;
        
        // Apply transforms
        card.style.transform = `translate3d(0, ${yOffset}px, 0) scale(${scale})`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
        card.style.transition = `all ${this.transitionDuration}ms ease-out`;
        
        // Add/remove active class
        if (stackPosition === 0) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    }
    
    /**
     * Move to next card
     */
    nextCard() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        console.log('🃏 Next card...');
        
        // Move to next index
        this.currentIndex = (this.currentIndex + 1) % this.allCards.length;
        
        // Rearrange all cards
        this.allCards.forEach((card, index) => {
            const stackPosition = this.getStackPosition(index);
            this.positionCard(card, stackPosition);
        });
        
        this.updateProgress();
        
        // Reset transition lock
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.transitionDuration);
        
        this.trackEvent('next_card');
    }
    
    /**
     * Move to previous card
     */
    prevCard() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        console.log('🃏 Previous card...');
        
        // Move to previous index
        this.currentIndex = this.currentIndex === 0 ? this.allCards.length - 1 : this.currentIndex - 1;
        
        // Rearrange all cards
        this.allCards.forEach((card, index) => {
            const stackPosition = this.getStackPosition(index);
            this.positionCard(card, stackPosition);
        });
        
        this.updateProgress();
        
        // Reset transition lock
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.transitionDuration);
        
        this.trackEvent('prev_card');
    }
    
    /**
     * Update progress indicator
     */
    updateProgress() {
        if (this.progressCurrent) {
            this.progressCurrent.textContent = this.currentIndex + 1;
        }
    }
    
    /**
     * Handle learn more clicks
     */
    handleLearnMore(card) {
        const title = card.querySelector('.card-title')?.textContent || 'Feature';
        console.log(`📚 Learn More clicked for: ${title}`);
        
        this.trackEvent('learn_more_click', { feature: title });
        
        // Your learn more implementation
        alert(`Learn more about: ${title}\n\nThis would open a modal or detailed page.`);
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prevCard());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextCard());
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') this.prevCard();
            if (e.key === 'ArrowRight') this.nextCard();
            if (e.key === ' ') {
                e.preventDefault();
                this.toggleAutoplay();
            }
        });
        
        // Pause on hover
        if (this.container) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoplay());
            this.container.addEventListener('mouseleave', () => this.resumeAutoplay());
        }
        
        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else {
                this.resumeAutoplay();
            }
        });
        
        console.log('✅ Events bound successfully');
    }
    
    /**
     * Start autoplay
     */
    startAutoplay() {
        if (!this.isAutoPlaying) return;
        
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            if (!this.isTransitioning) {
                this.nextCard();
            }
        }, this.autoplayDelay);
        
        console.log(`▶️ Autoplay started (${this.autoplayDelay}ms)`);
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
     * Setup intersection observer for fade animations
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
     * Track events
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'simple_card_deck',
            timestamp: Date.now(),
            current_index: this.currentIndex,
            total_cards: this.allCards.length,
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'card_deck_features',
                event_label: data.feature || '',
                value: this.currentIndex
            });
        }

        // Custom analytics
        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }
    }
    
    /**
     * Public API
     */
    getAPI() {
        return {
            next: () => this.nextCard(),
            prev: () => this.prevCard(),
            goTo: (index) => {
                if (index >= 0 && index < this.allCards.length) {
                    this.currentIndex = index;
                    this.arrangeCards();
                    this.updateProgress();
                }
            },
            play: () => {
                this.isAutoPlaying = true;
                this.startAutoplay();
            },
            pause: () => {
                this.isAutoPlaying = false;
                this.stopAutoplay();
            },
            getCurrentIndex: () => this.currentIndex,
            getTotalCards: () => this.allCards.length,
            getCurrentCard: () => this.allCards[this.currentIndex]
        };
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopAutoplay();
        console.log('🧹 Simple card deck destroyed');
    }
}

// Initialize
let simpleCardDeck = null;

function initializeSimpleCardDeck() {
    console.log('🚀 Starting Simple Card Deck...');
    
    simpleCardDeck = new SimpleCardDeck();
    
    // Export for debugging
    window.SimpleCardDeck = simpleCardDeck.getAPI();
    
    console.log('✅ Simple Card Deck ready!');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSimpleCardDeck);
} else {
    initializeSimpleCardDeck();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleCardDeck;
}