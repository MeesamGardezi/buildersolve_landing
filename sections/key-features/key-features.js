/**
 * Mobile-Optimized Scrollable Features Layout - FIXED VERSION
 * Updated with correct feature detail navigation paths
 * @version 2.1.0 - Fixed navigation paths and feature mapping
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
        
        // Feature mapping for navigation - CORRECTED PATHS
        this.featureMapping = {
            'Estimating': 'estimate',  // This matches estimate.json
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
        console.log('🚀 Initializing Mobile Scrollable Features...');
        this.setupElements();
        this.createIndicators();
        this.bindEvents();
        this.updateState();
        
        setTimeout(() => this.updateState(), 100);
        console.log('✅ Features initialized with mapping:', this.featureMapping);
    }
    
    setupElements() {
        this.container = document.getElementById('features-container');
        this.wrapper = this.container?.closest('.features-wrapper');
        
        if (!this.container) {
            console.error('❌ Features container not found');
            return;
        }
        
        this.items = Array.from(this.container.querySelectorAll('.feature-item'));
        console.log(`📦 Found ${this.items.length} feature items`);
        
        // Setup card interactions
        this.items.forEach((item, i) => {
            const btn = item.querySelector('.card-learn-more');
            const card = item.querySelector('.feature-card');
            const title = item.querySelector('.card-title')?.textContent?.trim() || '';
            
            console.log(`🔗 Setting up feature ${i + 1}: "${title}"`);
            
            if (btn) {
                btn.addEventListener('click', (e) => this.handleLearnMore(item, i, e));
                console.log(`  ✅ Learn More button bound for: ${title}`);
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
     * Get feature URL parameter from title - FIXED VERSION
     */
    getFeatureUrlParam(title) {
        const cleanTitle = title.trim();
        
        console.log(`🔍 Looking up feature mapping for: "${cleanTitle}"`);
        
        // Check direct mapping first
        if (this.featureMapping[cleanTitle]) {
            const param = this.featureMapping[cleanTitle];
            console.log(`✅ Found mapping: "${cleanTitle}" -> "${param}"`);
            return param;
        }
        
        console.log(`⚠️ No direct mapping found for: "${cleanTitle}"`);
        console.log('Available mappings:', Object.keys(this.featureMapping));
        
        // Fallback: convert to URL-safe format
        const fallback = cleanTitle.toLowerCase()
            .replace(/\s+/g, '')  // Remove spaces
            .replace(/[^a-z0-9-]/g, ''); // Remove special characters
            
        console.log(`🔄 Using fallback mapping: "${cleanTitle}" -> "${fallback}"`);
        return fallback;
    }
    
    /**
     * Navigate to feature detail page - FIXED PATHS
     */
    navigateToFeatureDetail(featureParam, title, index) {
        try {
            console.log(`🚀 Starting navigation for feature: "${title}"`);
            console.log(`📍 Feature parameter: "${featureParam}"`);
            console.log(`📍 Index: ${index}`);
            
            // Track the navigation
            this.track('feature_detail_navigation', { 
                feature: featureParam, 
                title: title,
                index: index,
                timestamp: Date.now()
            });
            
            // FIXED: Correct path to feature detail page
            const detailUrl = `feature-detail/feature-detail.html?feature=${encodeURIComponent(featureParam)}`;
            
            console.log(`🔗 Constructed URL: ${detailUrl}`);
            
            // Add smooth transition class for better UX
            document.body.classList.add('page-transitioning');
            
            // Navigate to the detail page
            console.log(`📍 Navigating to: ${detailUrl}`);
            window.location.href = detailUrl;
            
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
            
            // User-friendly error message
            alert(`Sorry, we're having trouble loading details for ${title}. Please try again later.`);
        }
    }
    
    /**
     * Handle Learn More button clicks - ENHANCED DEBUGGING
     */
    handleLearnMore(item, index, e) {
        e.stopPropagation();
        
        const title = item.querySelector('.card-title')?.textContent?.trim() || '';
        const img = item.querySelector('.card-image');
        
        console.log(`📖 Learn More clicked!`);
        console.log(`  Title: "${title}"`);
        console.log(`  Index: ${index}`);
        console.log(`  Available mappings:`, this.featureMapping);
        
        // Get the feature URL parameter
        const featureParam = this.getFeatureUrlParam(title);
        
        console.log(`  Resolved parameter: "${featureParam}"`);
        
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
        console.log(`🚀 Proceeding with navigation...`);
        this.navigateToFeatureDetail(featureParam, title, index);
    }
    
    /**
     * Handle card clicks - Updated for better UX
     */
    handleCardClick(item, index, e) {
        const title = item.querySelector('.card-title')?.textContent?.trim() || '';
        
        console.log(`🖱️ Card clicked: "${title}" (index: ${index})`);
        
        // Check if this is a feature with detail page
        const featureParam = this.getFeatureUrlParam(title);
        
        if (featureParam && this.featureMapping[title]) {
            // Navigate to detail page for features with content
            console.log(`🔗 Card click -> navigating to detail page`);
            this.navigateToFeatureDetail(featureParam, title, index);
        } else {
            // Dispatch event for features without detail pages
            console.log(`📡 Card click -> dispatching event`);
            this.container.dispatchEvent(new CustomEvent('featureCardClick', {
                detail: { title, index, item }
            }));
            
            this.track('card_click', { feature: title, index });
        }
    }
    
    track(event, data = {}) {
        // Enhanced logging for debugging
        console.log('📊 Tracking event:', {
            event,
            section: 'mobile_features',
            ...data
        });
        
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
            
            // Enhanced debugging methods
            getAllFeaturesData: () => {
                return this.items.map((item, index) => ({
                    index,
                    title: item.querySelector('.card-title')?.textContent?.trim() || '',
                    hasLearnMore: !!item.querySelector('.card-learn-more'),
                    hasImage: !!item.querySelector('.card-image'),
                    urlParam: this.getFeatureUrlParam(item.querySelector('.card-title')?.textContent?.trim() || '')
                }));
            },
            
            // Feature detail integration methods
            getFeatureMapping: () => ({ ...this.featureMapping }),
            addFeatureMapping: (title, param) => {
                console.log(`🔧 Adding feature mapping: "${title}" -> "${param}"`);
                this.featureMapping[title] = param;
            },
            navigateToFeature: (featureParam) => {
                const detailUrl = `feature-detail/feature-detail.html?feature=${encodeURIComponent(featureParam)}`;
                console.log(`🚀 Direct navigation to: ${detailUrl}`);
                window.location.href = detailUrl;
            },
            
            // Debugging methods
            testFeatureNavigation: (title) => {
                console.log(`🧪 Testing navigation for: "${title}"`);
                const param = this.getFeatureUrlParam(title);
                console.log(`  Parameter: "${param}"`);
                const url = `feature-detail/feature-detail.html?feature=${encodeURIComponent(param)}`;
                console.log(`  URL: ${url}`);
                return { title, param, url };
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

// Enhanced initialization with better error handling
let featuresLayout = null;

function initMobileFeatures() {
    console.log('🔄 Initializing Mobile Features...');
    
    const container = document.getElementById('features-container');
    if (!container) {
        console.error('❌ Features container not found. Make sure element with id="features-container" exists.');
        return;
    }
    
    try {
        featuresLayout = new MobileScrollableFeatures();
        window.ScrollableFeaturesLayout = featuresLayout.getAPI();
        
        // Enhanced event listeners for fallback behavior
        container.addEventListener('featureLearnMore', (e) => {
            const { title, index } = e.detail;
            console.log(`⚠️ Fallback learn more triggered for: ${title} (${index + 1})`);
            alert(`More information about ${title} is coming soon! We're working on detailed feature pages.`);
        });
        
        container.addEventListener('featureCardClick', (e) => {
            const { title, index } = e.detail;
            console.log(`🔄 Card click fallback for: ${title} (${index + 1})`);
        });
        
        container.addEventListener('featureNavigationError', (e) => {
            const { feature, title, error } = e.detail;
            console.error(`❌ Navigation error for ${title}:`, error);
            alert(`Sorry, we're having trouble loading details for ${title}. Please try again later.`);
        });
        
        console.log('✅ Mobile Features Layout initialized successfully');
        console.log('🔧 Available API methods:', Object.keys(window.ScrollableFeaturesLayout));
        
        // Debug: Log all features found
        const featuresData = window.ScrollableFeaturesLayout.getAllFeaturesData();
        console.log('📋 Features detected:', featuresData);
        
    } catch (error) {
        console.error('❌ Failed to initialize Mobile Features Layout:', error);
    }
}

// Auto-initialize with enhanced timing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileFeatures);
} else {
    // DOM already loaded, but give it a moment to ensure all content is rendered
    setTimeout(initMobileFeatures, 100);
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileScrollableFeatures;
}