/**
 * Image-Based 5-Card Features Layout
 * Enhanced with image overlays and clean design
 */

class FeaturesLayout {
    constructor() {
        this.container = null;
        this.featureItems = [];
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
        
        // Get all feature items (containers) and cards (image elements)
        this.featureItems = Array.from(this.container.querySelectorAll('.feature-item'));
        this.cards = Array.from(this.container.querySelectorAll('.feature-card'));
        
        // Setup learn more buttons
        this.featureItems.forEach((item, index) => {
            const learnBtn = item.querySelector('.card-learn-more');
            const card = item.querySelector('.feature-card');
            
            if (learnBtn) {
                learnBtn.addEventListener('click', (e) => {
                    this.handleLearnMore(item, index, e);
                });
            }
            
            // Optional: Make entire card clickable (excluding button)
            if (card) {
                card.addEventListener('click', (e) => {
                    // Don't trigger if button was clicked
                    if (e.target.classList.contains('card-learn-more')) return;
                    this.handleCardClick(item, index, e);
                });
            }
        });
        
        console.log(`Features layout initialized with ${this.featureItems.length} feature items`);
    }
    
    bindEvents() {
        // Track scroll events for mobile indicators
        if (this.container) {
            this.container.addEventListener('scroll', this.handleScroll.bind(this));
        }
        
        // Handle window resize for scroll indicators
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Optional: Handle keyboard navigation
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
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
    
    handleKeyDown(e) {
        // Add keyboard navigation for accessibility
        if (window.innerWidth > 767) return; // Only on mobile
        
        const isArrowKey = ['ArrowLeft', 'ArrowRight'].includes(e.key);
        if (!isArrowKey) return;
        
        e.preventDefault();
        
        const currentScroll = this.container.scrollLeft;
        const itemWidth = this.featureItems[0]?.offsetWidth || 240;
        const gap = 16; // 1rem gap
        
        if (e.key === 'ArrowRight') {
            this.container.scrollTo({
                left: currentScroll + itemWidth + gap,
                behavior: 'smooth'
            });
        } else if (e.key === 'ArrowLeft') {
            this.container.scrollTo({
                left: currentScroll - itemWidth - gap,
                behavior: 'smooth'
            });
        }
    }
    
    handleLearnMore(item, index, e) {
        e.stopPropagation();
        
        const title = item.querySelector('.card-title')?.textContent || 'Feature';
        const image = item.querySelector('.card-image');
        const imageAlt = image?.alt || '';
        const imageSrc = image?.src || '';
        
        // Dispatch custom event for integration
        if (this.container) {
            this.container.dispatchEvent(new CustomEvent('featureLearnMore', {
                detail: { 
                    title, 
                    imageAlt,
                    imageSrc,
                    index, 
                    item,
                    card: item.querySelector('.feature-card')
                }
            }));
        }
        
        // Track event
        this.trackEvent('learn_more_click', { 
            feature: title, 
            index: index + 1,
            image_alt: imageAlt
        });
        
        // Default action - can be overridden by parent
        console.log(`Learn more clicked: ${title}`);
        
        // Example: You could open a modal, navigate to a page, etc.
        // this.openFeatureModal(title, imageSrc, imageAlt);
    }
    
    handleCardClick(item, index, e) {
        // Optional: Handle clicking on the card itself (not the button)
        const title = item.querySelector('.card-title')?.textContent || 'Feature';
        
        this.trackEvent('card_click', { 
            feature: title, 
            index: index + 1 
        });
        
        console.log(`Card clicked: ${title}`);
        
        // Could trigger the same action as learn more, or something different
        // this.handleLearnMore(item, index, e);
    }
    
    trackEvent(event, data = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'features_section',
                event_label: data.feature || '',
                value: data.index || 0,
                custom_parameters: {
                    feature_type: 'image_card',
                    image_alt: data.image_alt || ''
                }
            });
        }
        
        // Custom analytics
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track(event, {
                section: 'features',
                card_type: 'image_based',
                ...data
            });
        }
        
        console.log(`[Features] ${event}:`, data);
    }
    
    // Public API - Updated for new structure
    getAPI() {
        return {
            scrollToItem: (index) => {
                if (index >= 0 && index < this.featureItems.length && window.innerWidth <= 767) {
                    const item = this.featureItems[index];
                    if (item && this.container) {
                        item.scrollIntoView({ 
                            behavior: 'smooth', 
                            inline: 'start',
                            block: 'nearest'
                        });
                    }
                }
            },
            scrollToCard: (index) => {
                // Alias for backward compatibility
                return this.getAPI().scrollToItem(index);
            },
            getFeatureItems: () => this.featureItems,
            getCards: () => this.cards,
            getTotalItems: () => this.featureItems.length,
            getTotalCards: () => this.cards.length,
            getCurrentVisibleIndex: () => {
                if (window.innerWidth > 767) return 0; // All visible on desktop
                
                const scrollLeft = this.container.scrollLeft;
                const itemWidth = this.featureItems[0]?.offsetWidth || 240;
                const gap = 16;
                
                return Math.round(scrollLeft / (itemWidth + gap));
            },
            trackCustomEvent: (event, data) => this.trackEvent(event, data),
            // New methods for image-based cards
            getFeatureData: (index) => {
                const item = this.featureItems[index];
                if (!item) return null;
                
                const title = item.querySelector('.card-title')?.textContent || '';
                const image = item.querySelector('.card-image');
                
                return {
                    title,
                    imageSrc: image?.src || '',
                    imageAlt: image?.alt || '',
                    index
                };
            },
            getAllFeaturesData: () => {
                return this.featureItems.map((_, index) => this.getAPI().getFeatureData(index));
            }
        };
    }
    
    // Enhanced modal helper (optional implementation)
    openFeatureModal(title, imageSrc, imageAlt) {
        // Example modal implementation
        const modal = document.createElement('div');
        modal.className = 'feature-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="this.closest('.feature-modal').remove()">&times;</button>
                    <img src="${imageSrc}" alt="${imageAlt}" class="modal-image">
                    <h3 class="modal-title">${title}</h3>
                    <p class="modal-description">Learn more about ${title.toLowerCase()} and how it can benefit your workflow.</p>
                    <button class="modal-cta" onclick="alert('Contact us for more info')">Get Started</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Track modal open
        this.trackEvent('modal_opened', { feature: title });
    }
    
    // Cleanup
    destroy() {
        if (this.container) {
            this.container.removeEventListener('scroll', this.handleScroll);
            this.container.removeEventListener('keydown', this.handleKeyDown);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        // Clean up event listeners on feature items
        this.featureItems.forEach(item => {
            const learnBtn = item.querySelector('.card-learn-more');
            const card = item.querySelector('.feature-card');
            
            if (learnBtn) {
                learnBtn.removeEventListener('click', this.handleLearnMore);
            }
            if (card) {
                card.removeEventListener('click', this.handleCardClick);
            }
        });
        
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
        
        // Example: Listen for custom events
        document.getElementById('features-container').addEventListener('featureLearnMore', (e) => {
            console.log('Feature learn more event:', e.detail);
            
            // Example: You could handle this event to open a modal, navigate, etc.
            // featuresLayout.openFeatureModal(e.detail.title, e.detail.imageSrc, e.detail.imageAlt);
        });
        
        console.log('✅ Image-based features layout ready');
        console.log('Available API methods:', Object.keys(window.FeaturesLayout));
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