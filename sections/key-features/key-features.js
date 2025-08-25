/**
 * Simple 5-Card Features Layout
 * Clean and lightweight - no complex carousel logic needed
 */

class FeaturesLayout {
    constructor() {
        this.container = null;
        this.cards = [];
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.bindEvents();
        this.setupScrollIndicators();
    }
    
    setupElements() {
        this.container = document.getElementById('features-container');
        
        if (!this.container) {
            console.log('Features container not found');
            return;
        }
        
        this.cards = Array.from(this.container.querySelectorAll('.feature-card'));
        
        // Setup learn more buttons
        this.cards.forEach((card, index) => {
            const learnBtn = card.querySelector('.card-learn-more');
            if (learnBtn) {
                learnBtn.addEventListener('click', (e) => {
                    this.handleLearnMore(card, index, e);
                });
            }
        });
        
        console.log(`Features layout initialized with ${this.cards.length} cards`);
    }
    
    bindEvents() {
        // Track scroll events for mobile indicators
        if (this.container) {
            this.container.addEventListener('scroll', this.handleScroll.bind(this));
        }
        
        // Handle window resize for scroll indicators
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    setupScrollIndicators() {
        // Only relevant for mobile
        if (window.innerWidth > 767) return;
        
        this.updateScrollIndicators();
    }
    
    handleScroll() {
        if (window.innerWidth > 767) return;
        
        this.updateScrollIndicators();
    }
    
    updateScrollIndicators() {
        if (!this.container || window.innerWidth > 767) return;
        
        const scrollLeft = this.container.scrollLeft;
        const scrollWidth = this.container.scrollWidth;
        const clientWidth = this.container.clientWidth;
        
        // Check if scrolled to end
        const isScrolledToEnd = scrollLeft + clientWidth >= scrollWidth - 10;
        
        this.container.classList.toggle('scrolled-to-end', isScrolledToEnd);
    }
    
    handleResize() {
        // Update scroll indicators on resize
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.setupScrollIndicators();
        }, 150);
    }
    
    handleLearnMore(card, index, e) {
        e.stopPropagation();
        
        const title = card.querySelector('.card-title')?.textContent || 'Feature';
        const description = card.querySelector('.card-description')?.textContent || '';
        
        // Dispatch custom event for integration
        if (this.container) {
            this.container.dispatchEvent(new CustomEvent('featureLearnMore', {
                detail: { 
                    title, 
                    description, 
                    index, 
                    card 
                }
            }));
        }
        
        // Track event
        this.trackEvent('learn_more_click', { 
            feature: title, 
            index: index + 1 
        });
        
        // Default action - can be overridden by parent
        console.log(`Learn more clicked: ${title}`);
        
        // Example: You could open a modal, navigate to a page, etc.
        // this.openFeatureModal(title, description);
    }
    
    trackEvent(event, data = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'features_section',
                event_label: data.feature || '',
                value: data.index || 0
            });
        }
        
        // Custom analytics
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track(event, {
                section: 'features',
                ...data
            });
        }
        
        console.log(`[Features] ${event}:`, data);
    }
    
    // Public API - much simpler now
    getAPI() {
        return {
            scrollToCard: (index) => {
                if (index >= 0 && index < this.cards.length && window.innerWidth <= 767) {
                    const card = this.cards[index];
                    if (card && this.container) {
                        card.scrollIntoView({ 
                            behavior: 'smooth', 
                            inline: 'start',
                            block: 'nearest'
                        });
                    }
                }
            },
            getCards: () => this.cards,
            getTotalCards: () => this.cards.length,
            trackCustomEvent: (event, data) => this.trackEvent(event, data)
        };
    }
    
    // Cleanup
    destroy() {
        if (this.container) {
            this.container.removeEventListener('scroll', this.handleScroll);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        console.log('Features layout destroyed');
    }
}

// Initialize
let featuresLayout = null;

function initFeaturesLayout() {
    if (document.getElementById('features-container')) {
        featuresLayout = new FeaturesLayout();
        
        // Export API for external control
        window.FeaturesLayout = featuresLayout.getAPI();
        
        console.log('✅ Features layout ready');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeaturesLayout);
} else {
    initFeaturesLayout();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeaturesLayout;
}