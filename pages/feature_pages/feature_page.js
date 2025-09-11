/**
 * Feature Page Template System
 * Mobile-optimized, data-driven page generator for all feature pages
 */

class FeaturePageTemplate {
    constructor() {
        this.config = null;
        this.elements = {};
        this.sections = [];
        this.sectionObserver = null;
        this.isInitialized = false;
        
        // State
        this.loadingStates = new Set();
        this.errorStates = new Set();
        this.visibleSections = new Set();
        
        this.setupElements();
    }
    
    setupElements() {
        this.elements = {
            page: document.getElementById('feature-page'),
            pageTitle: document.getElementById('page-title'),
            videoSection: document.getElementById('video-section'),
            videoWrapper: document.getElementById('video-wrapper'),
            videoTitle: document.getElementById('video-title'),
            videoSubtitle: document.getElementById('video-subtitle'),
            contentSections: document.getElementById('content-sections'),
            ctaSection: document.getElementById('cta-section'),
            ctaTitle: document.getElementById('cta-title'),
            ctaDescription: document.getElementById('cta-description'),
            btnPrimary: document.getElementById('btn-primary'),
            btnSecondary: document.getElementById('btn-secondary'),
            sectionTemplate: document.getElementById('section-template')
        };
    }
    
    init(config) {
        if (!config || this.isInitialized) return;
        
        this.config = config;
        this.validateConfig();
        
        this.setLoadingState(true);
        
        try {
            this.setupPage();
            this.setupVideo();
            this.setupSections();
            this.setupCTA();
            this.setupInteractions();
            this.setupObserver();
            
            this.setLoadingState(false);
            this.isInitialized = true;
            
            this.track('page_initialized', {
                feature: config.featureName,
                sections_count: config.sections?.length || 0
            });
            
            console.log(`✅ Feature page initialized: ${config.featureName}`);
            
        } catch (error) {
            this.handleError('initialization_error', error);
        }
    }
    
    validateConfig() {
        const required = ['pageTitle', 'featureName', 'video', 'sections', 'cta'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required config: ${missing.join(', ')}`);
        }
        
        if (!Array.isArray(this.config.sections) || this.config.sections.length === 0) {
            throw new Error('Config must include at least one section');
        }
    }
    
    setupPage() {
        // Set page title
        if (this.elements.pageTitle) {
            this.elements.pageTitle.textContent = this.config.pageTitle;
        }
        document.title = this.config.pageTitle;
        
        // Add feature class to page
        if (this.elements.page) {
            this.elements.page.classList.add(`feature-${this.config.featureName}`);
        }
    }
    
    setupVideo() {
        const video = this.config.video;
        
        // Set video content
        if (this.elements.videoTitle) {
            this.elements.videoTitle.textContent = video.title;
        }
        if (this.elements.videoSubtitle) {
            this.elements.videoSubtitle.textContent = video.subtitle;
        }
        
        // Create video element
        if (this.elements.videoWrapper && video.url) {
            this.createVideoElement(video);
        }
    }
    
    createVideoElement(video) {
        const wrapper = this.elements.videoWrapper;
        wrapper.classList.add('loading');
        
        let videoElement;
        
        switch (video.type) {
            case 'youtube':
                videoElement = this.createYouTubeEmbed(video.url, video.title);
                break;
            case 'vimeo':
                videoElement = this.createVimeoEmbed(video.url, video.title);
                break;
            case 'direct':
                videoElement = this.createDirectVideo(video.url, video.title);
                break;
            default:
                this.showVideoError('Unsupported video type');
                return;
        }
        
        if (videoElement) {
            videoElement.addEventListener('load', () => {
                wrapper.classList.remove('loading');
                this.track('video_loaded', { type: video.type });
            });
            
            videoElement.addEventListener('error', () => {
                this.showVideoError('Failed to load video');
            });
            
            wrapper.appendChild(videoElement);
        }
    }
    
    createYouTubeEmbed(url, title) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = title || 'Feature demonstration video';
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        return iframe;
    }
    
    createVimeoEmbed(url, title) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.title = title || 'Feature demonstration video';
        iframe.frameBorder = '0';
        iframe.allow = 'autoplay; fullscreen; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.loading = 'lazy';
        return iframe;
    }
    
    createDirectVideo(url, title) {
        const video = document.createElement('video');
        video.src = url;
        video.title = title || 'Feature demonstration video';
        video.controls = true;
        video.preload = 'metadata';
        return video;
    }
    
    showVideoError(message) {
        const wrapper = this.elements.videoWrapper;
        wrapper.classList.remove('loading');
        wrapper.innerHTML = `
            <div class="video-error">
                <p>${message}</p>
                <p>Please check your connection and try again.</p>
            </div>
        `;
        this.track('video_error', { message });
    }
    
    setupSections() {
        if (!this.elements.contentSections || !this.config.sections) return;
        
        // Clear existing sections
        this.elements.contentSections.innerHTML = '';
        this.sections = [];
        
        this.config.sections.forEach((sectionData, index) => {
            const section = this.createSection(sectionData, index);
            if (section) {
                this.elements.contentSections.appendChild(section);
                this.sections.push(section);
                
                // Animate in with delay
                setTimeout(() => {
                    section.classList.add('loaded');
                }, index * 100);
            }
        });
    }
    
    createSection(data, index) {
        const template = this.elements.sectionTemplate;
        if (!template) return null;
        
        const clone = template.content.cloneNode(true);
        const section = clone.querySelector('.content-section');
        
        // Set layout
        section.setAttribute('data-layout', data.layout || 'left');
        section.setAttribute('data-section-index', index);
        section.setAttribute('data-section-id', `section-${index + 1}`);
        
        // Set content
        const img = section.querySelector('.section-image img');
        const title = section.querySelector('.section-title');
        const description = section.querySelector('.section-description');
        const features = section.querySelector('.section-features');
        
        if (img) {
            img.src = data.imageSrc;
            img.alt = data.imageAlt;
            img.addEventListener('click', () => this.handleImageClick(data, index));
            img.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleImageClick(data, index);
                }
            });
            img.setAttribute('tabindex', '0');
        }
        
        if (title) title.textContent = data.title;
        if (description) description.textContent = data.description;
        
        if (features && data.features) {
            features.innerHTML = '';
            data.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                features.appendChild(li);
            });
        } else if (features) {
            features.style.display = 'none';
        }
        
        return section;
    }
    
    setupCTA() {
        const cta = this.config.cta;
        
        if (this.elements.ctaTitle) {
            this.elements.ctaTitle.textContent = cta.title;
        }
        if (this.elements.ctaDescription) {
            this.elements.ctaDescription.textContent = cta.description;
        }
        if (this.elements.btnPrimary) {
            this.elements.btnPrimary.textContent = cta.primaryButton;
        }
        if (this.elements.btnSecondary) {
            this.elements.btnSecondary.textContent = cta.secondaryButton;
        }
    }
    
    setupInteractions() {
        // CTA button events
        if (this.elements.btnPrimary) {
            this.elements.btnPrimary.addEventListener('click', () => {
                this.handleCTAClick('primary', this.config.cta.primaryButton);
            });
        }
        
        if (this.elements.btnSecondary) {
            this.elements.btnSecondary.addEventListener('click', () => {
                this.handleCTAClick('secondary', this.config.cta.secondaryButton);
            });
        }
        
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                this.smoothScrollTo(link.getAttribute('href'));
            }
        });
        
        // Window events
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    setupObserver() {
        const options = {
            root: null,
            rootMargin: '-20% 0px -20% 0px',
            threshold: [0.1, 0.5]
        };
        
        this.sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.getAttribute('data-section-id');
                
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    this.visibleSections.add(sectionId);
                    entry.target.classList.add('section-visible');
                    
                    const title = entry.target.querySelector('.section-title')?.textContent || '';
                    this.track('section_view', {
                        section: sectionId,
                        title: title,
                        feature: this.config.featureName
                    });
                } else {
                    this.visibleSections.delete(sectionId);
                    entry.target.classList.remove('section-visible');
                }
            });
        }, options);
        
        // Observe all sections
        const allSections = [
            this.elements.videoSection,
            ...this.sections,
            this.elements.ctaSection
        ].filter(Boolean);
        
        allSections.forEach(section => {
            if (!section.hasAttribute('data-section-id')) {
                section.setAttribute('data-section-id', section.className.split(' ')[0]);
            }
            this.sectionObserver.observe(section);
        });
    }
    
    handleImageClick(data, index) {
        this.track('section_image_click', {
            title: data.title,
            index: index + 1,
            feature: this.config.featureName
        });
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('featureImageClick', {
            detail: { data, index, feature: this.config.featureName }
        }));
    }
    
    handleCTAClick(type, buttonText) {
        this.track('cta_click', {
            type: type,
            button_text: buttonText,
            feature: this.config.featureName
        });
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('featureCTAClick', {
            detail: { type, buttonText, feature: this.config.featureName }
        }));
    }
    
    smoothScrollTo(target) {
        const element = document.querySelector(target);
        if (element) {
            const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 20;
            window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            this.track('smooth_scroll', { target });
        }
    }
    
    handleResize() {
        // Handle responsive changes if needed
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Add any resize logic here
        }, 300);
    }
    
    setLoadingState(isLoading) {
        if (this.elements.page) {
            this.elements.page.classList.toggle('loading', isLoading);
        }
    }
    
    handleError(type, error) {
        console.error(`[FeaturePageTemplate] ${type}:`, error);
        
        this.errorStates.add(type);
        this.setLoadingState(false);
        
        this.track('error', {
            type: type,
            message: error.message,
            feature: this.config?.featureName || 'unknown'
        });
        
        // Show error message to user if critical
        if (type === 'initialization_error') {
            this.showErrorMessage('Failed to load page content. Please refresh and try again.');
        }
    }
    
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        if (this.elements.page) {
            this.elements.page.insertBefore(errorDiv, this.elements.page.firstChild);
        }
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    track(event, data = {}) {
        // Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'feature_page_template',
                event_label: data.feature || '',
                value: data.index || 0,
                custom_parameters: {
                    page_template: 'feature_page',
                    feature_name: data.feature || '',
                    ...data
                }
            });
        }
        
        // Custom analytics
        if (window.analytics?.track) {
            window.analytics.track(event, {
                page_template: 'feature_page',
                ...data
            });
        }
    }
    
    // Public API
    getAPI() {
        return {
            // Data methods
            getConfig: () => this.config,
            getSectionCount: () => this.sections.length,
            getSectionData: (index) => this.config.sections[index] || null,
            getVisibleSections: () => Array.from(this.visibleSections),
            
            // Navigation methods
            scrollToSection: (index) => {
                if (this.sections[index]) {
                    this.smoothScrollTo(`#content-sections .content-section:nth-child(${index + 1})`);
                }
            },
            scrollToVideo: () => this.smoothScrollTo('#video-section'),
            scrollToCTA: () => this.smoothScrollTo('#cta-section'),
            
            // State methods
            isInitialized: () => this.isInitialized,
            hasErrors: () => this.errorStates.size > 0,
            getErrors: () => Array.from(this.errorStates),
            
            // Control methods
            reinitialize: (newConfig) => {
                this.isInitialized = false;
                this.init(newConfig);
            },
            
            // Tracking
            track: (event, data) => this.track(event, data)
        };
    }
    
    destroy() {
        if (this.sectionObserver) {
            this.sectionObserver.disconnect();
        }
        
        window.removeEventListener('resize', this.handleResize);
        
        if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
        
        this.isInitialized = false;
        this.sections = [];
        this.visibleSections.clear();
        this.errorStates.clear();
    }
}

// Global instance
let featurePageTemplate = null;

// Initialize function
function initFeaturePageTemplate() {
    if (!featurePageTemplate) {
        featurePageTemplate = new FeaturePageTemplate();
        
        // Export API
        window.FeaturePageTemplate = {
            init: (config) => featurePageTemplate.init(config),
            ...featurePageTemplate.getAPI()
        };
        
        // Setup global event listeners
        document.addEventListener('featureImageClick', (e) => {
            console.log('Feature image clicked:', e.detail);
            // Add custom handling here
        });
        
        document.addEventListener('featureCTAClick', (e) => {
            console.log('Feature CTA clicked:', e.detail);
            // Add custom handling here
        });
    }
    
    return featurePageTemplate;
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFeaturePageTemplate);
} else {
    initFeaturePageTemplate();
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeaturePageTemplate;
}

// Example configurations for different pages:
/*

// SCHEDULING PAGE CONFIG
const schedulingConfig = {
    pageTitle: "Scheduling - Professional Construction Software",
    featureName: "scheduling",
    video: {
        type: "youtube",
        url: "https://www.youtube.com/embed/YOUR_VIDEO_ID",
        title: "Smart Scheduling That Works",
        subtitle: "See how our scheduling tools help you manage projects efficiently and keep teams coordinated."
    },
    sections: [
        {
            title: "Resource Management",
            description: "Optimize crew assignments and equipment allocation...",
            imageSrc: "/assets/images/scheduling/resource-management.png",
            imageAlt: "Resource management interface",
            layout: "left",
            features: ["Crew scheduling", "Equipment tracking", "Availability management"]
        }
        // ... more sections
    ],
    cta: {
        title: "Ready to Streamline Your Scheduling?",
        description: "Start organizing your projects more efficiently today.",
        primaryButton: "Start Free Trial",
        secondaryButton: "Schedule Demo"
    }
};

// CHANGE ORDERS CONFIG
const changeOrdersConfig = {
    pageTitle: "Change Orders - Professional Construction Software", 
    featureName: "change-orders",
    // ... similar structure
};

*/