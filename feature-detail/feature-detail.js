/**
 * BuilderSolve Feature Detail Page - FIXED VERSION
 * Handles dynamic loading of feature content from JSON files
 * @version 1.1.0 - Fixed paths and enhanced debugging
 */

class FeatureDetailPage {
    constructor() {
        // Configuration - FIXED PATHS
        this.config = {
            jsonBasePath: 'jsons/',  // Changed from 'data/features/' to match actual location
            imageBasePath: '../assets/images/features/',  // Relative path from feature-detail folder
            fallbackImage: '../assets/images/placeholder-feature.png',
            animationDelay: 100,
            loadingTimeout: 10000
        };

        // State management
        this.state = {
            isLoading: true,
            currentFeature: null,
            featureData: null,
            hasError: false,
            sectionsLoaded: 0
        };

        // DOM elements cache
        this.elements = {};
        
        // Intersection observer for animations
        this.intersectionObserver = null;
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the feature detail page
     */
    async init() {
        try {
            console.log('🚀 Feature Detail Page initializing...');
            
            // Get feature from URL
            this.state.currentFeature = this.getFeatureFromURL();
            console.log(`📖 Requested feature: "${this.state.currentFeature}"`);
            
            if (!this.state.currentFeature) {
                console.error('❌ No feature specified in URL');
                this.showError('No feature specified in URL');
                return;
            }

            // Cache DOM elements
            this.cacheElements();
            
            // Setup components
            await this.loadComponents();
            
            // Load feature data
            await this.loadFeatureData();
            
            // Setup interactions
            this.bindEvents();
            this.setupAnimations();
            
            // Hide loading screen
            this.hideLoading();
            
            console.log('✅ Feature Detail Page initialized successfully');
            
        } catch (error) {
            console.error('❌ Feature Detail Page initialization failed:', error);
            this.showError('Failed to load feature details: ' + error.message);
        }
    }

    /**
     * Get feature name from URL parameters
     */
    getFeatureFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const feature = urlParams.get('feature');
        
        if (feature) {
            // Sanitize and validate feature name
            const sanitized = feature.toLowerCase().replace(/[^a-z0-9-]/g, '');
            console.log(`📖 Loading feature: "${feature}" -> sanitized: "${sanitized}"`);
            return sanitized;
        }
        
        console.log('⚠️ No feature parameter found in URL');
        return null;
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        console.log('📦 Caching DOM elements...');
        
        this.elements = {
            body: document.body,
            loadingScreen: document.getElementById('loading-screen'),
            mainContent: document.getElementById('main-content'),
            errorState: document.getElementById('error-state'),
            
            // Navigation elements
            navigation: document.getElementById('navigation'),
            footer: document.getElementById('footer'),
            backButton: document.getElementById('back-button'),
            
            // Feature content elements
            featureTitle: document.getElementById('feature-title'),
            featureDescription: document.getElementById('feature-description'),
            featureSections: document.getElementById('feature-sections'),
            
            // Contact modal
            contactModal: document.getElementById('contact-modal'),
            contactButtons: document.querySelectorAll('[data-contact]')
        };

        console.log('📦 Elements cached:', {
            mainElements: !!(this.elements.featureTitle && this.elements.featureSections),
            navigation: !!this.elements.navigation,
            backButton: !!this.elements.backButton,
            loadingScreen: !!this.elements.loadingScreen,
            errorState: !!this.elements.errorState
        });
    }

    /**
     * Load navigation and footer components
     */
    async loadComponents() {
        console.log('🔧 Loading components...');
        
        const components = [
            { 
                element: this.elements.navigation, 
                path: '../components/navigation/nav.html'  // Relative path from feature-detail folder
            },
            { 
                element: this.elements.footer, 
                path: '../components/footer/footer.html'   // Relative path from feature-detail folder
            }
        ];

        for (const component of components) {
            if (component.element) {
                try {
                    console.log(`📥 Loading component: ${component.path}`);
                    const response = await fetch(component.path);
                    if (response.ok) {
                        const html = await response.text();
                        component.element.innerHTML = html;
                        console.log(`✅ Component loaded: ${component.path}`);
                    } else {
                        console.warn(`⚠️ Component not found: ${component.path} (${response.status})`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to load component: ${component.path}`, error);
                }
            }
        }
    }

    /**
     * Load feature data from JSON
     */
    async loadFeatureData() {
        if (!this.state.currentFeature) {
            throw new Error('No feature specified');
        }

        try {
            const jsonPath = `${this.config.jsonBasePath}${this.state.currentFeature}.json`;
            console.log(`📥 Fetching feature data from: ${jsonPath}`);
            
            const response = await fetch(jsonPath);
            
            if (!response.ok) {
                const errorMsg = `Feature data not found: ${response.status} - ${response.statusText}`;
                console.error(`❌ ${errorMsg}`);
                console.log(`📍 Attempted path: ${jsonPath}`);
                console.log(`📍 Current location: ${window.location.href}`);
                
                // List available features for debugging
                try {
                    console.log('🔍 Checking for available JSON files...');
                    const testFiles = ['estimate', 'estimating', 'scheduling', 'changeorders'];
                    for (const testFile of testFiles) {
                        const testPath = `${this.config.jsonBasePath}${testFile}.json`;
                        const testResponse = await fetch(testPath);
                        console.log(`  ${testFile}.json: ${testResponse.ok ? '✅ Found' : '❌ Not found'} (${testResponse.status})`);
                    }
                } catch (testError) {
                    console.log('🔍 Could not test for available files:', testError.message);
                }
                
                throw new Error(errorMsg);
            }
            
            const responseText = await response.text();
            console.log(`📄 Raw JSON response (first 200 chars): ${responseText.substring(0, 200)}`);
            
            this.state.featureData = JSON.parse(responseText);
            
            // Validate data structure
            if (!this.validateFeatureData(this.state.featureData)) {
                throw new Error('Invalid feature data structure');
            }
            
            // Render the feature content
            this.renderFeatureContent();
            
            console.log('✅ Feature data loaded successfully:', this.state.featureData.title);
            
        } catch (error) {
            console.error('❌ Failed to load feature data:', error);
            throw error;
        }
    }

    /**
     * Validate feature data structure
     */
    validateFeatureData(data) {
        console.log('🔍 Validating feature data structure...');
        
        if (!data || typeof data !== 'object') {
            console.error('❌ Data is not an object:', typeof data);
            return false;
        }
        
        if (!data.title || !data.description) {
            console.error('❌ Missing title or description:', { title: !!data.title, description: !!data.description });
            return false;
        }
        
        if (!Array.isArray(data.sections)) {
            console.error('❌ Sections is not an array:', typeof data.sections);
            return false;
        }
        
        // Validate each section
        for (let i = 0; i < data.sections.length; i++) {
            const section = data.sections[i];
            if (!section.header || !section.text) {
                console.error(`❌ Section ${i} missing header or text:`, { 
                    header: !!section.header, 
                    text: !!section.text 
                });
                return false;
            }
            if (!section.image) {
                console.error(`❌ Section ${i} missing image:`, section);
                return false;
            }
        }
        
        console.log(`✅ Data structure valid. Found ${data.sections.length} sections.`);
        return true;
    }

    /**
     * Render feature content to the page
     */
    renderFeatureContent() {
        const { featureData } = this.state;
        
        console.log('🎨 Rendering feature content...');
        
        // Update page title
        document.title = `${featureData.title} - BuilderSolve Feature Details`;
        
        // Update header content
        if (this.elements.featureTitle) {
            this.elements.featureTitle.textContent = featureData.title;
            console.log(`📝 Set title: "${featureData.title}"`);
        }
        
        if (this.elements.featureDescription) {
            this.elements.featureDescription.textContent = featureData.description;
            console.log(`📝 Set description (${featureData.description.length} chars)`);
        }
        
        // Render sections
        this.renderSections(featureData.sections);
        
        // Update meta tags for SEO
        this.updateMetaTags(featureData);
        
        console.log('✅ Feature content rendered successfully');
    }

    /**
     * Render feature sections with alternating layout
     */
    renderSections(sections) {
        if (!this.elements.featureSections) {
            console.error('❌ Feature sections container not found');
            return;
        }
        
        console.log(`🔧 Rendering ${sections.length} sections...`);
        
        // Clear existing content
        this.elements.featureSections.innerHTML = '';
        
        sections.forEach((section, index) => {
            console.log(`📝 Rendering section ${index + 1}: "${section.header}"`);
            const sectionElement = this.createSectionElement(section, index);
            this.elements.featureSections.appendChild(sectionElement);
        });
        
        this.state.sectionsLoaded = sections.length;
        console.log(`✅ Rendered ${sections.length} sections`);
    }

    /**
     * Create individual section element
     */
    createSectionElement(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'feature-section';
        sectionDiv.setAttribute('data-section-index', index);
        
        // Determine image position (alternating)
        const imagePosition = index % 2 === 0 ? 'left' : 'right';
        
        // Get full image path
        const imagePath = this.getImagePath(section.image);
        console.log(`🖼️ Section ${index + 1} image path: ${imagePath}`);
        
        // Build section HTML
        sectionDiv.innerHTML = `
            <header class="section-header">
                <h2 class="section-title">${this.escapeHtml(section.header)}</h2>
            </header>
            <div class="section-content image-${imagePosition}">
                <div class="section-image-container">
                    <img 
                        src="${imagePath}" 
                        alt="${this.escapeHtml(section.imageAlt || section.header + ' illustration')}"
                        class="section-image"
                        loading="lazy"
                        onerror="this.src='${this.config.fallbackImage}'; console.log('❌ Image failed to load: ${imagePath}');"
                        onload="console.log('✅ Image loaded: ${imagePath}');"
                    />
                </div>
                <div class="section-text-container">
                    <div class="section-text">
                        ${this.formatText(section.text)}
                    </div>
                </div>
            </div>
        `;
        
        return sectionDiv;
    }

    /**
     * Get full image path - ENHANCED VERSION
     */
    getImagePath(imagePath) {
        // If already a full URL, return as-is
        if (imagePath.startsWith('http') || imagePath.startsWith('//')) {
            console.log(`🌐 Using full URL: ${imagePath}`);
            return imagePath;
        }
        
        // If starts with /, treat as absolute path from domain root
        if (imagePath.startsWith('/')) {
            console.log(`📁 Using absolute path: ${imagePath}`);
            return imagePath;
        }
        
        // Build path relative to feature folder
        const fullPath = `${this.config.imageBasePath}${this.state.currentFeature}/${imagePath}`;
        console.log(`📂 Building relative path: ${this.config.imageBasePath} + ${this.state.currentFeature} + ${imagePath} = ${fullPath}`);
        return fullPath;
    }

    /**
     * Format text content (support for basic HTML)
     */
    formatText(text) {
        if (!text) return '';
        
        // Split by paragraphs and wrap in <p> tags
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        return paragraphs.map(p => `<p>${this.escapeHtml(p.trim())}</p>`).join('');
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Update meta tags for SEO
     */
    updateMetaTags(featureData) {
        console.log('🏷️ Updating meta tags...');
        
        // Update description meta tag
        let descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) {
            descMeta.setAttribute('content', 
                `Learn about ${featureData.title} - ${featureData.description}`
            );
        }
        
        // Update Open Graph tags
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', `${featureData.title} - BuilderSolve`);
        }
        
        let ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.setAttribute('content', featureData.description);
        }
        
        console.log('✅ Meta tags updated');
    }

    /**
     * Setup event listeners
     */
    bindEvents() {
        console.log('🔗 Binding events...');
        
        // Back button
        if (this.elements.backButton) {
            this.elements.backButton.addEventListener('click', this.handleBackClick.bind(this));
            console.log('✅ Back button event bound');
        }
        
        // Contact buttons
        this.elements.contactButtons.forEach(button => {
            button.addEventListener('click', this.handleContactClick.bind(this));
        });
        console.log(`✅ ${this.elements.contactButtons.length} contact button events bound`);
        
        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Browser back/forward
        window.addEventListener('popstate', this.handlePopState.bind(this));
        
        console.log('✅ Event listeners bound');
    }

    /**
     * Setup scroll animations
     */
    setupAnimations() {
        console.log('🎭 Setting up animations...');
        
        // Create intersection observer for section animations
        this.intersectionObserver = new IntersectionObserver(
            this.handleIntersection.bind(this),
            {
                threshold: 0.1,
                rootMargin: '50px 0px'
            }
        );
        
        // Observe all sections
        const sections = document.querySelectorAll('.feature-section');
        sections.forEach(section => {
            this.intersectionObserver.observe(section);
        });
        
        console.log(`✅ Animation observer setup for ${sections.length} sections`);
    }

    /**
     * Handle intersection observer entries
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const index = parseInt(entry.target.getAttribute('data-section-index') || '0');
                const delay = index * this.config.animationDelay;
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    console.log(`🎭 Section ${index + 1} animated into view`);
                }, delay);
                
                // Stop observing this element
                this.intersectionObserver.unobserve(entry.target);
            }
        });
    }

    /**
     * Handle back button click
     */
    handleBackClick(event) {
        event.preventDefault();
        
        console.log('🔙 Back button clicked');
        
        // Track interaction
        this.trackEvent('back_button_click', {
            feature: this.state.currentFeature,
            timestamp: Date.now()
        });
        
        // Navigate back to features section
        const featuresURL = '../index.html#key-features-section';  // Relative path from feature-detail folder
        
        if (document.referrer && document.referrer.includes(window.location.hostname)) {
            // If came from same site, go back
            console.log('🔙 Using browser back');
            window.history.back();
        } else {
            // Otherwise, go to features section
            console.log(`🔙 Navigating to: ${featuresURL}`);
            window.location.href = featuresURL;
        }
    }

    /**
     * Handle contact button clicks
     */
    handleContactClick(event) {
        event.preventDefault();
        
        console.log('📞 Contact button clicked');
        
        // Track conversion
        this.trackEvent('contact_click', {
            source: 'feature_detail',
            feature: this.state.currentFeature,
            timestamp: Date.now()
        });
        
        // Dispatch custom event for main.js to handle
        document.dispatchEvent(new CustomEvent('openContactModal', {
            detail: {
                source: 'feature_detail',
                feature: this.state.currentFeature
            }
        }));
    }

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                if (this.state.hasError) {
                    this.hideError();
                }
                break;
                
            case 'b':
            case 'B':
                if (event.altKey || event.ctrlKey) {
                    event.preventDefault();
                    this.handleBackClick(event);
                }
                break;
        }
    }

    /**
     * Handle browser back/forward
     */
    handlePopState(event) {
        // Reload page if feature parameter changes
        const newFeature = this.getFeatureFromURL();
        if (newFeature !== this.state.currentFeature) {
            console.log(`🔄 Feature changed from ${this.state.currentFeature} to ${newFeature}, reloading...`);
            window.location.reload();
        }
    }

    /**
     * Show error state
     */
    showError(message = 'An error occurred') {
        console.error('🚨 Showing error:', message);
        
        this.state.hasError = true;
        this.hideLoading();
        
        if (this.elements.mainContent) {
            this.elements.mainContent.style.display = 'none';
        }
        
        if (this.elements.errorState) {
            this.elements.errorState.classList.remove('hidden');
            
            // Update error message if custom
            const errorMessage = this.elements.errorState.querySelector('.error-message');
            if (errorMessage && message !== 'An error occurred') {
                errorMessage.textContent = message;
            }
        }
        
        // Update page title
        document.title = 'Feature Not Found - BuilderSolve';
        
        // Track error
        this.trackEvent('feature_error', {
            feature: this.state.currentFeature,
            error: message,
            timestamp: Date.now()
        });
    }

    /**
     * Hide error state
     */
    hideError() {
        this.state.hasError = false;
        
        if (this.elements.errorState) {
            this.elements.errorState.classList.add('hidden');
        }
        
        if (this.elements.mainContent) {
            this.elements.mainContent.style.display = 'block';
        }
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        this.state.isLoading = false;
        
        if (this.elements.loadingScreen) {
            this.elements.loadingScreen.classList.add('hidden');
            
            // Remove from DOM after animation
            setTimeout(() => {
                if (this.elements.loadingScreen && this.elements.loadingScreen.parentNode) {
                    this.elements.loadingScreen.parentNode.removeChild(this.elements.loadingScreen);
                }
            }, 500);
        }
        
        if (this.elements.body) {
            this.elements.body.classList.remove('loading');
        }
        
        console.log('✅ Loading screen hidden');
    }

    /**
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            page: 'feature_detail',
            timestamp: Date.now(),
            ...data
        };
        
        console.log('📊 Event tracked:', eventData);
        
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'feature_detail',
                event_label: data.feature || '',
                value: data.timestamp || Date.now()
            });
        }
        
        // Custom analytics
        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(eventData);
        }
    }

    /**
     * Public API methods
     */
    getAPI() {
        return {
            getCurrentFeature: () => this.state.currentFeature,
            getFeatureData: () => this.state.featureData,
            isLoading: () => this.state.isLoading,
            hasError: () => this.state.hasError,
            reload: () => window.location.reload(),
            trackEvent: (name, data) => this.trackEvent(name, data),
            
            // Debugging methods
            debugInfo: () => ({
                config: this.config,
                state: this.state,
                elements: Object.keys(this.elements).reduce((acc, key) => {
                    acc[key] = !!this.elements[key];
                    return acc;
                }, {}),
                currentURL: window.location.href,
                referrer: document.referrer
            }),
            
            testImagePath: (imageName) => {
                return this.getImagePath(imageName);
            },
            
            testJSONPath: (featureName) => {
                return `${this.config.jsonBasePath}${featureName}.json`;
            }
        };
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        // Remove event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('popstate', this.handlePopState);
        
        // Disconnect intersection observer
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        console.log('🧹 Feature Detail Page cleaned up');
    }
}

// Initialize when DOM is ready
let featureDetailInstance;

const initializeFeatureDetail = () => {
    try {
        console.log('🔄 Initializing Feature Detail Page...');
        
        featureDetailInstance = new FeatureDetailPage();
        
        // Export API to global scope
        window.FeatureDetail = featureDetailInstance.getAPI();
        
        console.log('🎯 Feature Detail API exported to window.FeatureDetail');
        console.log('🔧 Available debug methods:', ['debugInfo', 'testImagePath', 'testJSONPath']);
        
        // Add global debugging function
        window.debugFeatureDetail = () => {
            console.log('🐛 Feature Detail Debug Info:');
            console.log(window.FeatureDetail.debugInfo());
        };
        
    } catch (error) {
        console.error('❌ Failed to initialize Feature Detail Page:', error);
    }
};

// Initialize based on document state
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeatureDetail);
} else {
    initializeFeatureDetail();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (featureDetailInstance) {
        featureDetailInstance.destroy();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureDetailPage;
} else if (typeof define === 'function' && define.amd) {
    define(() => FeatureDetailPage);
}