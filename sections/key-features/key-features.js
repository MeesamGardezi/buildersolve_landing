/**
 * Mobile-Optimized Scrollable Features Layout - Updated with Feature Detail Navigation
 * Focused on touch interactions and essential functionality
 * @version 2.0.0 - Added feature detail page integration
 */

class MobileScrollableFeatures {
    constructor() {
        this.container = null;
        this.wrapper = null;
        this.items = [];
        this.leftBtn = null;
        this.rightBtn = null;
        
        this.isScrolling = false;
        this.scrollTimer = null;
        this.resizeTimer = null;
        
        // Touch handling
        this.touchStart = 0;
        this.touchEnd = 0;
        this.isDragging = false;
        
        // Feature mapping for navigation
        this.featureMapping = {
            'Estimating': 'estimating',
            'Scheduling': 'scheduling', 
            'Change Orders': 'changeorders',
            'Comparison': 'comparison',
            'Performance': 'performance',
            'Reporting': 'reporting',
            'Integration': 'integration'
        };
        
        this.init();
    }
    
    init() {
        this.setupElements();
        this.createIndicators();
        this.bindEvents();
        this.updateState();
        
        setTimeout(() => this.updateState(), 100);
    }
    
    setupElements() {
        this.container = document.getElementById('features-container');
        this.wrapper = this.container?.closest('.features-wrapper');
        
        if (!this.container) return;
        
        this.items = Array.from(this.container.querySelectorAll('.feature-item'));
        
        // Setup card interactions
        this.items.forEach((item, i) => {
            const btn = item.querySelector('.card-learn-more');
            const card = item.querySelector('.feature-card');
            
            if (btn) {
                btn.addEventListener('click', (e) => this.handleLearnMore(item, i, e));
            }
            
            if (card) {
                card.addEventListener('click', (e) => {
                    if (!e.target.closest('.card-learn-more')) {
                        this.handleCardClick(item, i, e);
                    }
                });
                
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.handleCardClick(item, i, e);
                    }
                });
            }
        });
    }
    
    createIndicators() {
        if (!this.wrapper) return;
        
        this.leftBtn = document.createElement('button');
        this.leftBtn.className = 'scroll-indicator left';
        this.leftBtn.innerHTML = '‹';
        this.leftBtn.setAttribute('aria-label', 'Scroll left');
        this.leftBtn.addEventListener('click', () => this.scrollLeft());
        
        this.rightBtn = document.createElement('button');
        this.rightBtn.className = 'scroll-indicator right';
        this.rightBtn.innerHTML = '›';
        this.rightBtn.setAttribute('aria-label', 'Scroll right');
        this.rightBtn.addEventListener('click', () => this.scrollRight());
        
        this.wrapper.appendChild(this.leftBtn);
        this.wrapper.appendChild(this.rightBtn);
    }
    
    bindEvents() {
        if (!this.container) return;
        
        // Core events
        this.container.addEventListener('scroll', this.handleScroll.bind(this));
        this.container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
        this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Prevent image drag
        this.items.forEach(item => {
            const img = item.querySelector('.card-image');
            if (img) img.addEventListener('dragstart', e => e.preventDefault());
        });
    }
    
    handleScroll() {
        this.isScrolling = true;
        this.updateState();
        
        if (this.scrollTimer) clearTimeout(this.scrollTimer);
        
        this.scrollTimer = setTimeout(() => {
            this.isScrolling = false;
            this.onScrollEnd();
        }, 150);
    }
    
    updateState() {
        if (!this.container || !this.wrapper) return;
        
        const scrollLeft = this.container.scrollLeft;
        const maxScroll = this.container.scrollWidth - this.container.clientWidth;
        
        // Update indicators
        if (this.leftBtn) this.leftBtn.disabled = scrollLeft <= 5;
        if (this.rightBtn) this.rightBtn.disabled = scrollLeft >= maxScroll - 5;
        
        // Update fade effects
        this.wrapper.classList.toggle('hide-left-fade', scrollLeft <= 5);
        this.wrapper.classList.toggle('hide-right-fade', scrollLeft >= maxScroll - 5);
        
        // Dispatch event
        this.container.dispatchEvent(new CustomEvent('scrollUpdate', {
            detail: { scrollLeft, maxScroll, progress: maxScroll > 0 ? scrollLeft / maxScroll : 0 }
        }));
    }
    
    onScrollEnd() {
        // Snap to nearest item on mobile
        if (window.innerWidth < 768) this.snapToNearest();
        
        this.container.dispatchEvent(new CustomEvent('scrollEnd', {
            detail: { currentIndex: this.getCurrentIndex() }
        }));
    }
    
    snapToNearest() {
        if (!this.items.length) return;
        
        const containerRect = this.container.getBoundingClientRect();
        const center = containerRect.left + containerRect.width / 2;
        
        let closest = null;
        let minDistance = Infinity;
        
        this.items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const distance = Math.abs(center - itemCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closest = item;
            }
        });
        
        if (closest) {
            closest.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }
    
    scrollLeft() {
        const amount = this.getScrollAmount();
        this.container.scrollBy({ left: -amount, behavior: 'smooth' });
        this.track('scroll_left');
    }
    
    scrollRight() {
        const amount = this.getScrollAmount();
        this.container.scrollBy({ left: amount, behavior: 'smooth' });
        this.track('scroll_right');
    }
    
    getScrollAmount() {
        const cardWidth = this.items[0]?.offsetWidth || 280;
        const gap = parseFloat(getComputedStyle(this.container).gap) || 16;
        return cardWidth + gap;
    }
    
    getCurrentIndex() {
        if (!this.items.length) return 0;
        
        const containerRect = this.container.getBoundingClientRect();
        const center = containerRect.left + containerRect.width / 2;
        
        for (let i = 0; i < this.items.length; i++) {
            const rect = this.items[i].getBoundingClientRect();
            if (rect.left <= center && rect.right >= center) return i;
        }
        
        return 0;
    }
    
    // Touch handling
    handleTouchStart(e) {
        this.touchStart = e.touches[0].clientX;
        this.isDragging = true;
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        this.touchEnd = e.touches[0].clientX;
        const deltaX = Math.abs(this.touchEnd - this.touchStart);
        const deltaY = Math.abs(e.touches[0].clientY - (e.touches[0].clientY || 0));
        
        if (deltaX > deltaY && deltaX > 10) e.preventDefault();
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const delta = this.touchStart - this.touchEnd;
        
        if (Math.abs(delta) > 50) {
            if (delta > 0) {
                this.scrollRight();
                this.track('swipe_right');
            } else {
                this.scrollLeft();
                this.track('swipe_left');
            }
        }
    }
    
    handleKeyDown(e) {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        
        e.preventDefault();
        
        switch (e.key) {
            case 'ArrowLeft': this.scrollLeft(); this.track('key_left'); break;
            case 'ArrowRight': this.scrollRight(); this.track('key_right'); break;
            case 'Home': this.scrollTo(0); this.track('key_home'); break;
            case 'End': this.scrollTo(this.container.scrollWidth); this.track('key_end'); break;
        }
    }
    
    handleResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.updateState(), 150);
    }
    
    scrollTo(position) {
        this.container.scrollTo({ left: position, behavior: 'smooth' });
    }
    
    scrollToItem(index) {
        if (index >= 0 && index < this.items.length) {
            this.items[index].scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest'
            });
        }
    }
    
    /**
     * Get feature URL parameter from title
     */
    getFeatureUrlParam(title) {
        // Clean up the title and map to URL parameter
        const cleanTitle = title.trim();
        
        // Check direct mapping first
        if (this.featureMapping[cleanTitle]) {
            return this.featureMapping[cleanTitle];
        }
        
        // Fallback: convert to URL-safe format
        return cleanTitle.toLowerCase()
            .replace(/\s+/g, '')  // Remove spaces
            .replace(/[^a-z0-9-]/g, ''); // Remove special characters
    }
    
    /**
     * Navigate to feature detail page
     */
    navigateToFeatureDetail(featureParam, title, index) {
        try {
            // Track the navigation
            this.track('feature_detail_navigation', { 
                feature: featureParam, 
                title: title,
                index: index,
                timestamp: Date.now()
            });
            
            // Construct the URL
            const detailUrl = `feature-detail.html?feature=${encodeURIComponent(featureParam)}`;
            
            // Add smooth transition class for better UX
            document.body.classList.add('page-transitioning');
            
            // Navigate to the detail page
            window.location.href = detailUrl;
            
            console.log(`🔗 Navigating to feature detail: ${detailUrl}`);
            
        } catch (error) {
            console.error('❌ Navigation error:', error);
            
            // Fallback: show alert or dispatch event for modal
            this.container.dispatchEvent(new CustomEvent('featureNavigationError', {
                detail: { 
                    feature: featureParam, 
                    title: title, 
                    error: error.message 
                }
            }));
        }
    }
    
    /**
     * Handle Learn More button clicks - Updated for navigation
     */
    handleLearnMore(item, index, e) {
        e.stopPropagation();
        
        const title = item.querySelector('.card-title')?.textContent || '';
        const img = item.querySelector('.card-image');
        
        // Get the feature URL parameter
        const featureParam = this.getFeatureUrlParam(title);
        
        console.log(`📖 Learn More clicked: "${title}" -> ${featureParam}`);
        
        // Check if we have a valid feature mapping
        if (!featureParam) {
            console.warn(`⚠️ No feature mapping found for: "${title}"`);
            
            // Fallback: dispatch event (for modal or other handling)
            this.container.dispatchEvent(new CustomEvent('featureLearnMore', {
                detail: { title, index, item, imageSrc: img?.src, imageAlt: img?.alt }
            }));
            
            return;
        }
        
        // Navigate to feature detail page
        this.navigateToFeatureDetail(featureParam, title, index);
    }
    
    /**
     * Handle card clicks - Updated for better UX
     */
    handleCardClick(item, index, e) {
        const title = item.querySelector('.card-title')?.textContent || '';
        
        // Check if this is a feature with detail page
        const featureParam = this.getFeatureUrlParam(title);
        
        if (featureParam && this.featureMapping[title]) {
            // Navigate to detail page for features with content
            this.navigateToFeatureDetail(featureParam, title, index);
        } else {
            // Dispatch event for features without detail pages
            this.container.dispatchEvent(new CustomEvent('featureCardClick', {
                detail: { title, index, item }
            }));
            
            this.track('card_click', { feature: title, index });
        }
    }
    
    track(event, data = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'mobile_features',
                event_label: data.feature || '',
                value: data.index || 0
            });
        }
        
        // Custom analytics
        if (window.analytics?.track) {
            window.analytics.track(event, { section: 'mobile_features', ...data });
        }
        
        // Console log for debugging
        console.log('📊 Feature interaction tracked:', { event, ...data });
    }
    
    // Public API - Essential methods only
    getAPI() {
        return {
            scrollLeft: () => this.scrollLeft(),
            scrollRight: () => this.scrollRight(),
            scrollToItem: (i) => this.scrollToItem(i),
            getCurrentIndex: () => this.getCurrentIndex(),
            getTotalItems: () => this.items.length,
            updateState: () => this.updateState(),
            getContainer: () => this.container,
            
            // New methods for feature detail integration
            getFeatureMapping: () => ({ ...this.featureMapping }),
            addFeatureMapping: (title, param) => {
                this.featureMapping[title] = param;
            },
            navigateToFeature: (featureParam) => {
                const detailUrl = `feature-detail.html?feature=${encodeURIComponent(featureParam)}`;
                window.location.href = detailUrl;
            }
        };
    }
    
    destroy() {
        if (this.container) {
            this.container.removeEventListener('scroll', this.handleScroll);
            this.container.removeEventListener('touchstart', this.handleTouchStart);
            this.container.removeEventListener('touchmove', this.handleTouchMove);
            this.container.removeEventListener('touchend', this.handleTouchEnd);
            this.container.removeEventListener('keydown', this.handleKeyDown);
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        if (this.leftBtn?.parentNode) this.leftBtn.parentNode.removeChild(this.leftBtn);
        if (this.rightBtn?.parentNode) this.rightBtn.parentNode.removeChild(this.rightBtn);
        
        if (this.scrollTimer) clearTimeout(this.scrollTimer);
        if (this.resizeTimer) clearTimeout(this.resizeTimer);
        
        console.log('🧹 Mobile Scrollable Features destroyed');
    }
}

// Initialize
let featuresLayout = null;

function initMobileFeatures() {
    if (document.getElementById('features-container')) {
        featuresLayout = new MobileScrollableFeatures();
        window.ScrollableFeaturesLayout = featuresLayout.getAPI();
        
        // Event listeners for fallback behavior
        const container = document.getElementById('features-container');
        
        container.addEventListener('featureLearnMore', (e) => {
            // Fallback handling for features without detail pages
            const { title, index } = e.detail;
            console.log(`⚠️ Fallback learn more: ${title} (${index + 1})`);
            
            // Could show a modal, alert, or navigate to a general info page
            alert(`More information about ${title} coming soon!`);
        });
        
        container.addEventListener('featureCardClick', (e) => {
            // Handle card clicks for features without detail pages
            const { title, index } = e.detail;
            console.log(`🔄 Card click fallback: ${title} (${index + 1})`);
        });
        
        container.addEventListener('featureNavigationError', (e) => {
            // Handle navigation errors gracefully
            const { feature, title, error } = e.detail;
            console.error(`❌ Navigation error for ${title}:`, error);
            
            // Show user-friendly error message
            alert(`Sorry, we're having trouble loading details for ${title}. Please try again later.`);
        });
        
        console.log('✅ Mobile Features Layout initialized with feature detail navigation');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileFeatures);
} else {
    initMobileFeatures();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileScrollableFeatures;
}