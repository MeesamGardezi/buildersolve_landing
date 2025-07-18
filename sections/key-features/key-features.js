/**
 * Enhanced Solid Card Deck with Swipe Support
 * Features: Solid cards, small corner visibility, smooth swipe animations
 */

class EnhancedCardDeck {
    constructor() {
        // State
        this.currentIndex = 0;
        this.isTransitioning = false;
        this.isAutoPlaying = true;
        this.visibleCards = 5; // Show more cards with small corners
        
        // DOM elements
        this.container = null;
        this.allCards = [];
        this.prevBtn = null;
        this.nextBtn = null;
        this.progressCurrent = null;
        
        // Touch/Swipe state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.isSwiping = false;
        this.swipeThreshold = 100; // Minimum distance for swipe
        this.swipeVelocityThreshold = 0.5; // Minimum velocity
        
        // Timers
        this.autoplayTimer = null;
        
        // Settings
        this.autoplayDelay = 5000; // Increased for better UX
        this.transitionDuration = 600;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the card deck
     */
    init() {
        console.log('🃏 Initializing Enhanced Card Deck...');
        
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
                this.setupSwipeHandlers();
                this.updateProgress();
                this.startAutoplay();
                this.setupIntersectionObserver();
                
                console.log(`✅ Enhanced Card Deck initialized with ${this.allCards.length} cards!`);
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
        
        if (!this.prevBtn) {
            console.log('⚠️ Previous button not found');
        } else {
            console.log('✅ Previous button found');
        }
        
        if (!this.nextBtn) {
            console.log('⚠️ Next button not found');
        } else {
            console.log('✅ Next button found');
        }
        
        // Find progress indicator
        this.progressCurrent = document.querySelector('.progress-current');
        this.progressTotal = document.querySelector('.progress-total');
        
        console.log(`📦 Found ${this.allCards.length} cards and navigation elements`);
        return true;
    }
    
    /**
     * Arrange cards in the stack with small corner visibility
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
     * Position a card in the stack with corner visibility effect
     */
    positionCard(card, stackPosition) {
        if (stackPosition === -1) {
            // Hide card
            card.style.display = 'none';
            return;
        }
        
        // Show card
        card.style.display = 'block';
        
        // Enhanced positioning for corner visibility
        const yOffset = stackPosition * 12; // Increased offset to show more corner
        const xOffset = stackPosition * 8; // Slight horizontal offset for corner effect
        const scale = 1 - (stackPosition * 0.02); // Less scaling to keep cards more visible
        const rotation = stackPosition * 1.5; // Slight rotation for organic feel
        const opacity = stackPosition === 0 ? 1 : Math.max(0.4, 0.9 - (stackPosition * 0.1));
        const zIndex = this.visibleCards - stackPosition + 100; // Higher z-index for proper stacking
        
        // Apply transforms with corner visibility
        card.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0) scale(${scale}) rotate(${rotation}deg)`;
        card.style.opacity = opacity;
        card.style.zIndex = zIndex;
        card.style.transition = `all ${this.transitionDuration}ms cubic-bezier(0.4, 0.0, 0.2, 1)`;
        
        // Add/remove active class
        if (stackPosition === 0) {
            card.classList.add('active');
            card.style.pointerEvents = 'auto';
        } else {
            card.classList.remove('active');
            card.style.pointerEvents = 'none'; // Prevent interaction with background cards
        }
    }
    
    /**
     * Setup swipe event handlers
     */
    setupSwipeHandlers() {
        if (!this.container) return;
        
        // Touch events
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.container.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Mouse events for desktop testing
        this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.container.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.container.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.container.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        console.log('👆 Swipe handlers setup complete');
    }
    
    /**
     * Handle touch/mouse start
     */
    handleTouchStart(e) {
        this.pauseAutoplay();
        
        const touch = e.touches ? e.touches[0] : e;
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.touchCurrentX = touch.clientX;
        this.touchCurrentY = touch.clientY;
        this.isSwiping = false;
        this.startTime = Date.now();
        
        // Prevent default to avoid scrolling issues
        if (e.touches) {
            e.preventDefault();
        }
    }
    
    /**
     * Handle mouse down (for desktop)
     */
    handleMouseDown(e) {
        e.preventDefault();
        this.handleTouchStart(e);
        this.isMouseDown = true;
    }
    
    /**
     * Handle touch/mouse move
     */
    handleTouchMove(e) {
        if (!this.touchStartX || this.isTransitioning) return;
        
        const touch = e.touches ? e.touches[0] : e;
        if (!this.isMouseDown && !e.touches) return;
        
        this.touchCurrentX = touch.clientX;
        this.touchCurrentY = touch.clientY;
        
        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaY = this.touchCurrentY - this.touchStartY;
        
        // Check if this is a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            this.isSwiping = true;
            
            // Prevent vertical scrolling during horizontal swipe
            if (e.touches) {
                e.preventDefault();
            }
            
            // Apply swipe animation to active card
            const activeCard = this.allCards[this.currentIndex];
            if (activeCard && Math.abs(deltaX) > 20) {
                const swipeClass = deltaX > 0 ? 'swiping-right' : 'swiping-left';
                activeCard.className = activeCard.className.replace(/swiping-(left|right)/g, '');
                activeCard.classList.add(swipeClass);
            }
        }
    }
    
    /**
     * Handle mouse move (for desktop)
     */
    handleMouseMove(e) {
        if (this.isMouseDown) {
            this.handleTouchMove(e);
        }
    }
    
    /**
     * Handle touch/mouse end
     */
    handleTouchEnd(e) {
        if (!this.touchStartX) return;
        
        const deltaX = this.touchCurrentX - this.touchStartX;
        const deltaTime = Date.now() - this.startTime;
        const velocity = Math.abs(deltaX) / deltaTime;
        
        // Remove swiping classes
        const activeCard = this.allCards[this.currentIndex];
        if (activeCard) {
            activeCard.classList.remove('swiping-left', 'swiping-right');
        }
        
        // Determine if swipe should trigger navigation
        const shouldSwipe = this.isSwiping && (
            Math.abs(deltaX) > this.swipeThreshold || 
            velocity > this.swipeVelocityThreshold
        );
        
        if (shouldSwipe) {
            if (deltaX > 0) {
                console.log('👈 Swipe right detected');
                this.prevCard('swipe');
            } else {
                console.log('👉 Swipe left detected');
                this.nextCard('swipe');
            }
        }
        
        // Reset state
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchCurrentX = 0;
        this.touchCurrentY = 0;
        this.isSwiping = false;
        this.isMouseDown = false;
        
        // Resume autoplay after a delay
        setTimeout(() => {
            this.resumeAutoplay();
        }, 2000);
    }
    
    /**
     * Handle mouse up (for desktop)
     */
    handleMouseUp(e) {
        if (this.isMouseDown) {
            this.handleTouchEnd(e);
        }
    }
    
    /**
     * Move to next card with optional animation type
     */
    nextCard(animationType = 'button') {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        console.log(`🃏 Next card (${animationType})...`);
        
        const currentCard = this.allCards[this.currentIndex];
        
        // Apply exit animation for swipe
        if (animationType === 'swipe' && currentCard) {
            currentCard.classList.add('swipe-out-left');
        }
        
        // Move to next index
        this.currentIndex = (this.currentIndex + 1) % this.allCards.length;
        
        // Rearrange all cards
        setTimeout(() => {
            this.allCards.forEach((card, index) => {
                const stackPosition = this.getStackPosition(index);
                this.positionCard(card, stackPosition);
                
                // Add enter animation for new active card
                if (stackPosition === 0 && animationType === 'swipe') {
                    card.classList.add('swipe-in');
                    setTimeout(() => card.classList.remove('swipe-in'), 400);
                }
            });
            
            // Clean up exit animation
            if (currentCard) {
                setTimeout(() => {
                    currentCard.classList.remove('swipe-out-left');
                }, 300);
            }
        }, animationType === 'swipe' ? 100 : 0);
        
        this.updateProgress();
        
        // Reset transition lock
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.transitionDuration);
        
        this.trackEvent('next_card', { method: animationType });
    }
    
    /**
     * Move to previous card with optional animation type
     */
    prevCard(animationType = 'button') {
        if (this.isTransitioning) {
            console.log('⏸️ Previous card blocked - transition in progress');
            return;
        }
        
        this.isTransitioning = true;
        console.log(`🃏 Previous card (${animationType})... Current: ${this.currentIndex}`);
        
        const currentCard = this.allCards[this.currentIndex];
        
        // Apply exit animation for swipe
        if (animationType === 'swipe' && currentCard) {
            currentCard.classList.add('swipe-out-right');
        }
        
        // Move to previous index
        const newIndex = this.currentIndex === 0 ? this.allCards.length - 1 : this.currentIndex - 1;
        console.log(`📍 Moving from ${this.currentIndex} to ${newIndex}`);
        this.currentIndex = newIndex;
        
        // Rearrange all cards
        setTimeout(() => {
            this.allCards.forEach((card, index) => {
                const stackPosition = this.getStackPosition(index);
                this.positionCard(card, stackPosition);
                
                // Add enter animation for new active card
                if (stackPosition === 0 && animationType === 'swipe') {
                    card.classList.add('swipe-in');
                    setTimeout(() => card.classList.remove('swipe-in'), 400);
                }
            });
            
            // Clean up exit animation
            if (currentCard) {
                setTimeout(() => {
                    currentCard.classList.remove('swipe-out-right');
                }, 300);
            }
        }, animationType === 'swipe' ? 100 : 0);
        
        this.updateProgress();
        
        // Reset transition lock
        setTimeout(() => {
            this.isTransitioning = false;
            console.log('✅ Previous card transition complete');
        }, this.transitionDuration);
        
        this.trackEvent('prev_card', { method: animationType });
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
        this.showFeatureModal(title, card);
    }
    
    /**
     * Show feature modal (placeholder)
     */
    showFeatureModal(title, card) {
        const description = card.querySelector('.card-description')?.textContent || '';
        alert(`Learn more about: ${title}\n\n${description}\n\nThis would open a detailed modal or page.`);
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prevCard('button');
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.nextCard('button');
            });
        }
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.container || !this.isInViewport(this.container)) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.prevCard('keyboard');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextCard('keyboard');
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleAutoplay();
                    break;
                case 'Escape':
                    this.pauseAutoplay();
                    break;
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
        
        // Pause on focus loss
        window.addEventListener('blur', () => this.pauseAutoplay());
        window.addEventListener('focus', () => this.resumeAutoplay());
        
        console.log('✅ Events bound successfully');
    }
    
    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
    
    /**
     * Start autoplay
     */
    startAutoplay() {
        if (!this.isAutoPlaying) return;
        
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            if (!this.isTransitioning && !this.isSwiping) {
                this.nextCard('auto');
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
        if (this.isAutoPlaying && !this.isSwiping) {
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
            component: 'enhanced_card_deck',
            timestamp: Date.now(),
            current_index: this.currentIndex,
            total_cards: this.allCards.length,
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'enhanced_card_deck_features',
                event_label: data.feature || data.method || '',
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
            next: (type = 'api') => this.nextCard(type),
            prev: (type = 'api') => this.prevCard(type),
            goTo: (index) => {
                if (index >= 0 && index < this.allCards.length && index !== this.currentIndex) {
                    this.currentIndex = index;
                    this.arrangeCards();
                    this.updateProgress();
                    this.trackEvent('goto_card', { target_index: index });
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
            getCurrentCard: () => this.allCards[this.currentIndex],
            isPlaying: () => this.isAutoPlaying,
            isSwiping: () => this.isSwiping,
            setSwipeThreshold: (threshold) => {
                this.swipeThreshold = Math.max(50, Math.min(200, threshold));
            }
        };
    }
    
    /**
     * Cleanup
     */
    destroy() {
        this.stopAutoplay();
        
        // Remove event listeners
        if (this.container) {
            this.container.removeEventListener('touchstart', this.handleTouchStart);
            this.container.removeEventListener('touchmove', this.handleTouchMove);
            this.container.removeEventListener('touchend', this.handleTouchEnd);
            this.container.removeEventListener('mousedown', this.handleMouseDown);
            this.container.removeEventListener('mousemove', this.handleMouseMove);
            this.container.removeEventListener('mouseup', this.handleMouseUp);
            this.container.removeEventListener('mouseleave', this.handleMouseUp);
        }
        
        console.log('🧹 Enhanced card deck destroyed');
    }
}

// Initialize
let enhancedCardDeck = null;

function initializeEnhancedCardDeck() {
    console.log('🚀 Starting Enhanced Card Deck...');
    
    enhancedCardDeck = new EnhancedCardDeck();
    
    // Export for debugging and external control
    window.EnhancedCardDeck = enhancedCardDeck.getAPI();
    
    console.log('✅ Enhanced Card Deck ready!');
    console.log('💡 Try swiping left/right or using arrow keys!');
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedCardDeck);
} else {
    initializeEnhancedCardDeck();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedCardDeck;
}