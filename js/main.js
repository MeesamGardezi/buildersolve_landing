/**
 * BuilderSolve Landing Page - Main JavaScript Controller - FIXED VERSION
 * Handles section loading, smooth scrolling, animations, and core functionality
 * @version 2.0.0 - Fixed loading order and section initialization
 */

// ===== GLOBAL STATE ===== //
const BuilderSolve = {
    isLoading: true,
    sectionsLoaded: 0,
    totalSections: 7,
    currentSection: 'hero',
    scrollPosition: 0,
    isScrolling: false,
    
    // DOM Elements
    elements: {
        body: null,
        loadingScreen: null,
        scrollProgress: null,
        backToTop: null,
        contactModal: null,
        modalOverlay: null,
        sections: [],
        navigation: null
    },
    
    // Section configurations - UPDATED
sections: [
    { id: 'hero', file: 'hero', hasAnimation: true, hasJS: true },
    { id: 'key-features', file: 'key-features', hasAnimation: true, hasJS: true },
    { id: 'dashboard-showcase', file: 'dashboard-showcase', hasAnimation: true, hasJS: true },
    { id: 'problem-solution', file: 'problem-solution', hasAnimation: true, hasJS: false },
    { id: 'social-proof', file: 'social-proof', hasAnimation: true, hasJS: false },
    { id: 'final-cta', file: 'final-cta', hasAnimation: true, hasJS: false },
    { id: 'contact-form', file: 'contact-form', hasAnimation: true, hasJS: true }  // ✅ ADDED
],
    
    // Track loaded sections
    loadedSections: new Set(),
    initializedComponents: new Set()
};

// ===== INITIALIZATION ===== //
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 BuilderSolve Landing Page Initializing...');
    initializePage();
});

/**
 * Main initialization function
 */
async function initializePage() {
    try {
        // Cache DOM elements
        cacheElements();
        
        // Load all sections first
        await loadAllSections();
        
        // Load components
        await loadComponents();
        
        // Initialize sections with JavaScript AFTER HTML is loaded
        await initializeSectionComponents();
        
        // Initialize features
        initializeScrollFeatures();
        initializeModalSystem();
        initializeNavigation();
        initializeAnimations();
        
        // Hide loading screen
        hideLoadingScreen();
        
        console.log('✅ BuilderSolve Landing Page Loaded Successfully!');
        
    } catch (error) {
        console.error('❌ Error initializing page:', error);
        hideLoadingScreen(); // Hide loading even on error
    }
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    BuilderSolve.elements = {
        body: document.body,
        loadingScreen: document.getElementById('loading-screen'),
        scrollProgress: document.getElementById('scroll-progress'),
        backToTop: document.getElementById('back-to-top'),
        contactModal: document.getElementById('contact-modal'),
        modalOverlay: document.getElementById('contact-modal'),
        navigation: document.getElementById('navigation'),
        sections: document.querySelectorAll('.section')
    };
}

// ===== SECTION LOADING ===== //

/**
 * Load all sections dynamically
 */
async function loadAllSections() {
    console.log('📥 Loading all sections...');
    
    const loadPromises = BuilderSolve.sections.map(section => loadSection(section));
    await Promise.all(loadPromises);
    
    console.log('✅ All sections loaded');
}

/**
 * Load individual section
 */
async function loadSection(sectionConfig) {
    try {
        const { id, file } = sectionConfig;
        const sectionElement = document.getElementById(`${id}-section`);
        
        if (!sectionElement) {
            console.warn(`⚠️ Section element not found: ${id}-section`);
            return;
        }
        
        // Load HTML content
        const htmlResponse = await fetch(`sections/${file}/${file}.html`);
        if (!htmlResponse.ok) {
            throw new Error(`Failed to load ${file}.html: ${htmlResponse.status}`);
        }
        
        const htmlContent = await htmlResponse.text();
        sectionElement.innerHTML = htmlContent;
        
        // Mark section as loaded
        sectionElement.setAttribute('data-loaded', 'true');
        BuilderSolve.loadedSections.add(id);
        BuilderSolve.sectionsLoaded++;
        
        console.log(`✅ Loaded section: ${id}`);
        
    } catch (error) {
        console.error(`❌ Error loading section ${sectionConfig.id}:`, error);
    }
}

/**
 * Initialize section-specific JavaScript components AFTER HTML is loaded
 */
async function initializeSectionComponents() {
    console.log('🔧 Initializing section components...');
    
    // Wait a moment for DOM to settle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Initialize sections that have JavaScript
    for (const sectionConfig of BuilderSolve.sections) {
        if (sectionConfig.hasJS && BuilderSolve.loadedSections.has(sectionConfig.id)) {
            await initializeSectionJS(sectionConfig);
        }
    }
    
    console.log('✅ Section components initialized');
}

/**
 * Initialize JavaScript for a specific section
 */
async function initializeSectionJS(sectionConfig) {
    const { id } = sectionConfig;
    
    try {
        console.log(`🔧 Initializing ${id} JavaScript...`);
        
        switch (id) {
            case 'hero':
                await initializeHeroSection();
                break;
                
            case 'key-features':
                await initializeFeaturesSection();
                break;
                
            case 'dashboard-showcase':
                await initializeDashboardSection();
                break;
                
            default:
                console.log(`⚠️ No specific initialization for section: ${id}`);
        }
        
        BuilderSolve.initializedComponents.add(id);
        console.log(`✅ ${id} section initialized`);
        
    } catch (error) {
        console.error(`❌ Error initializing ${id} section:`, error);
    }
}

/**
 * Initialize Hero section
 */
async function initializeHeroSection() {
    // Check if elements exist
    const heroSection = document.getElementById('hero-section');
    const ctaButton = document.querySelector('.btn-primary-large');
    
    if (!heroSection) {
        console.warn('⚠️ Hero section not found');
        return;
    }
    
    console.log('🦸 Hero section elements found:', {
        heroSection: !!heroSection,
        ctaButton: !!ctaButton,
        images: document.querySelectorAll('.hero-image').length
    });
    
    // Hero JavaScript will auto-initialize when it loads
    // Just dispatch an event to let it know the DOM is ready
    if (window.BuilderSolveHero) {
        console.log('✅ Hero already initialized');
    } else {
        // Trigger hero initialization
        window.dispatchEvent(new CustomEvent('hero:ready'));
    }
}

/**
 * Initialize Features section
 */
async function initializeFeaturesSection() {
    // Check if the features container exists
    const featuresContainer = document.getElementById('features-container');
    
    if (!featuresContainer) {
        console.warn('⚠️ Features container not found, checking for alternative selectors...');
        
        // Try alternative selectors
        const alternativeContainer = document.querySelector('.features-container') || 
                                   document.querySelector('[class*="features"]');
                                   
        if (alternativeContainer) {
            // Set the correct ID if found with different selector
            alternativeContainer.id = 'features-container';
            console.log('✅ Found features container with alternative selector, added ID');
        } else {
            console.error('❌ No features container found at all');
            return;
        }
    }
    
    const featureItems = document.querySelectorAll('.feature-item');
    console.log('🎯 Features section elements found:', {
        container: !!document.getElementById('features-container'),
        items: featureItems.length,
        learnMoreButtons: document.querySelectorAll('.card-learn-more').length
    });
    
    // The features JavaScript should auto-initialize
    // Force initialization if needed
    if (typeof MobileScrollableFeatures !== 'undefined' && !window.ScrollableFeaturesLayout) {
        try {
            const featuresInstance = new MobileScrollableFeatures();
            window.ScrollableFeaturesLayout = featuresInstance.getAPI();
            console.log('✅ Features manually initialized');
        } catch (error) {
            console.error('❌ Error manually initializing features:', error);
        }
    }
}

/**
 * Initialize Dashboard section
 */
async function initializeDashboardSection() {
    const dashboardSection = document.getElementById('dashboard-showcase-section') || 
                           document.getElementById('video-showcase-section');
    
    if (!dashboardSection) {
        console.warn('⚠️ Dashboard section not found');
        return;
    }
    
    console.log('📊 Dashboard section found');
    
    // Dashboard/Video showcase will auto-initialize
    if (window.videoShowcase) {
        console.log('✅ Video showcase already initialized');
    }
}

/**
 * Load components (navigation, footer, etc.)
 */
async function loadComponents() {
    console.log('🔧 Loading components...');
    
    const components = [
        { id: 'navigation', folder: 'navigation', file: 'nav' },
        { id: 'footer', folder: 'footer', file: 'footer' }
    ];
    
    for (const component of components) {
        try {
            const element = document.getElementById(component.id);
            if (!element) continue;
            
            const response = await fetch(`components/${component.folder}/${component.file}.html`);
            if (response.ok) {
                const content = await response.text();
                element.innerHTML = content;
                console.log(`✅ Loaded component: ${component.id}`);
            } else {
                console.warn(`⚠️ Component not found: ${component.id} (${response.status})`);
            }
        } catch (error) {
            console.error(`❌ Error loading component ${component.id}:`, error);
        }
    }
}

// ===== SCROLL FEATURES ===== //

/**
 * Initialize scroll-related features
 */
function initializeScrollFeatures() {
    // Scroll progress indicator
    initializeScrollProgress();
    
    // Back to top button
    initializeBackToTop();
    
    // Smooth scrolling for anchor links
    initializeSmoothScrolling();
    
    // Section visibility detection
    initializeIntersectionObserver();
    
    // Throttled scroll event
    window.addEventListener('scroll', throttle(handleScroll, 16));
}

/**
 * Handle scroll events (throttled)
 */
function handleScroll() {
    BuilderSolve.scrollPosition = window.pageYOffset;
    updateScrollProgress();
    updateBackToTopVisibility();
}

/**
 * Update scroll progress indicator
 */
function updateScrollProgress() {
    const { scrollProgress } = BuilderSolve.elements;
    if (!scrollProgress) return;
    
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (BuilderSolve.scrollPosition / scrollHeight) * 100;
    
    scrollProgress.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
}

/**
 * Initialize scroll progress indicator
 */
function initializeScrollProgress() {
    updateScrollProgress();
}

/**
 * Initialize back to top button
 */
function initializeBackToTop() {
    const { backToTop } = BuilderSolve.elements;
    if (!backToTop) return;
    
    backToTop.addEventListener('click', () => {
        smoothScrollTo(0);
    });
    
    updateBackToTopVisibility();
}

/**
 * Update back to top button visibility
 */
function updateBackToTopVisibility() {
    const { backToTop } = BuilderSolve.elements;
    if (!backToTop) return;
    
    if (BuilderSolve.scrollPosition > 400) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

/**
 * Smooth scroll to position
 */
function smoothScrollTo(target) {
    if (BuilderSolve.isScrolling) return;
    
    BuilderSolve.isScrolling = true;
    
    window.scrollTo({
        top: target,
        behavior: 'smooth'
    });
    
    // Reset scrolling flag after animation
    setTimeout(() => {
        BuilderSolve.isScrolling = false;
    }, 1000);
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initializeSmoothScrolling() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const targetPosition = targetElement.offsetTop - 80; // Account for fixed nav
            smoothScrollTo(targetPosition);
        }
    });
}

/**
 * Initialize intersection observer for section animations
 */
function initializeIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '-50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                
                // Update current section
                const sectionId = entry.target.getAttribute('data-section');
                if (sectionId) {
                    BuilderSolve.currentSection = sectionId;
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections
    BuilderSolve.elements.sections.forEach(section => {
        observer.observe(section);
    });
}

// ===== MODAL SYSTEM ===== //

/**
 * Initialize modal system
 */
function initializeModalSystem() {
    const { modalOverlay } = BuilderSolve.elements;
    if (!modalOverlay) return;
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Close button
    const closeButton = modalOverlay.querySelector('.modal-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }
    
    // Initialize contact modal triggers
    initializeContactTriggers();
}

/**
 * Initialize contact form triggers
 */
function initializeContactTriggers() {
    // Listen for contact button clicks
    document.addEventListener('click', (e) => {
        const contactBtn = e.target.closest('[data-contact]');
        if (contactBtn) {
            e.preventDefault();
            openContactModal();
        }
    });
}

/**
 * Open contact modal
 */
async function openContactModal() {
    const { modalOverlay } = BuilderSolve.elements;
    if (!modalOverlay) return;
    
    try {
        // Load contact form if not already loaded
        const formContainer = document.getElementById('contact-form-container');
        if (formContainer && !formContainer.hasChildNodes()) {
            const response = await fetch('sections/contact-form/contact-form.html');
            if (response.ok) {
                const content = await response.text();
                formContainer.innerHTML = content;
            }
        }
        
        // Show modal
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('❌ Error opening contact modal:', error);
    }
}

/**
 * Close modal
 */
function closeModal() {
    const { modalOverlay } = BuilderSolve.elements;
    if (!modalOverlay) return;
    
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== NAVIGATION ===== //

/**
 * Initialize navigation functionality
 */
function initializeNavigation() {
    // This will be enhanced when nav component is loaded
    updateNavigationState();
}

/**
 * Update navigation active states
 */
function updateNavigationState() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    
    navLinks.forEach(link => {
        const sectionId = link.getAttribute('data-section');
        if (sectionId === BuilderSolve.currentSection) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== ANIMATIONS ===== //

/**
 * Initialize animations and transitions
 */
function initializeAnimations() {
    // Add stagger animations to elements
    addStaggerAnimations();
    
    // Initialize scroll-triggered animations
    initializeScrollAnimations();
}

/**
 * Add stagger animations to grouped elements
 */
function addStaggerAnimations() {
    const animationGroups = document.querySelectorAll('[data-stagger]');
    
    animationGroups.forEach(group => {
        const items = group.children;
        Array.from(items).forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    });
}

/**
 * Initialize scroll-triggered animations
 */
function initializeScrollAnimations() {
    // Fade in animations
    const fadeElements = document.querySelectorAll('[data-fade]');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => fadeObserver.observe(el));
}

// ===== LOADING SCREEN ===== //

/**
 * Hide loading screen with smooth transition
 */
function hideLoadingScreen() {
    const { loadingScreen, body } = BuilderSolve.elements;
    
    if (loadingScreen) {
        // Add slight delay to ensure everything is ready
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            body.classList.remove('loading');
            
            // Remove loading screen from DOM after transition
            setTimeout(() => {
                if (loadingScreen && loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
            
        }, 300);
    }
    
    BuilderSolve.isLoading = false;
}

// ===== UTILITY FUNCTIONS ===== //

/**
 * Throttle function execution
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Debounce function execution
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get scroll percentage
 */
function getScrollPercentage() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return (scrollTop / docHeight) * 100;
}

// ===== PERFORMANCE OPTIMIZATION ===== //

/**
 * Preload critical images
 */
function preloadImages() {
    const criticalImages = [
        'assets/images/dashboard-screenshots/production-summary.png',
        'assets/images/dashboard-screenshots/main-dashboard.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

/**
 * Lazy load non-critical resources
 */
function lazyLoadResources() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// ===== ERROR HANDLING ===== //

/**
 * Global error handler
 */
window.addEventListener('error', (e) => {
    console.error('🚨 Global error:', e.error);
    // Could send to analytics or error tracking service
});

/**
 * Unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 Unhandled promise rejection:', e.reason);
    e.preventDefault();
});

// ===== DEVELOPMENT HELPERS ===== //
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // Development mode helpers
    window.BuilderSolve = BuilderSolve; // Expose for debugging
    console.log('🔧 Development mode active');
    
    // Add debugging helpers
    window.debugLoadedSections = () => {
        console.log('📋 Loaded sections:', Array.from(BuilderSolve.loadedSections));
        console.log('🔧 Initialized components:', Array.from(BuilderSolve.initializedComponents));
        console.log('📊 Section elements:', {
            hero: !!document.getElementById('hero-section'),
            features: !!document.getElementById('features-container'),
            dashboard: !!document.getElementById('dashboard-showcase-section')
        });
    };
}

// ===== ANALYTICS & TRACKING ===== //

/**
 * Track page interactions for analytics
 */
function trackInteraction(action, category = 'engagement') {
    console.log(`📊 Track: ${category} - ${action}`);
    
    // Example: Google Analytics, Mixpanel, etc.
    // gtag('event', action, { event_category: category });
}

/**
 * Track section views
 */
function trackSectionView(sectionId) {
    trackInteraction(`view_${sectionId}`, 'section_views');
}

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuilderSolve;
}