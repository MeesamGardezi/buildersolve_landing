/**
 * BuilderSolve Hero Section - FIXED VERSION
 * Fixed scroll disappearing images and hover bugs
 * 
 * @version 3.2.0 - FIXED SCROLL & HOVER ISSUES
 */

class BuilderSolveHero {
    constructor(options = {}) {
        // Configuration
        this.config = {
            animationDelay: 100,
            scrollOffset: 100,
            imageLoadTimeout: 5000,
            performanceThreshold: 16.67,
            retryAttempts: 3,
            imageHoverDelay: 150,
            imageTransitionDuration: 600,
            keyboardNavigationEnabled: true,
            contentWaitTimeout: 10000,
            // NEW: Parallax settings
            parallaxStrength: 0.1,
            maxParallaxOffset: 50,
            ...options
        };

        // State management
        this.state = {
            isInitialized: false,
            isVisible: false,
            animationsTriggered: false,
            imageLoaded: false,
            performanceMetrics: {},
            retryCount: 0,
            currentEnlargedImage: null,
            isKeyboardUser: false,
            contentLoaded: false,
            // NEW: Track base transforms to avoid accumulation
            baseTransforms: new Map(),
            scrollPosition: 0,
            imageDescriptions: [
                {
                    title: "Project Dashboard",
                    text: "Complete oversight of all your construction projects. Track schedules, budgets, and team progress in real-time."
                },
                {
                    title: "Mobile Field Management", 
                    text: "Keep your field teams connected with powerful mobile tools. Update tasks, report issues, and share progress instantly."
                },
                {
                    title: "Advanced Analytics",
                    text: "Make data-driven decisions with comprehensive reporting. Monitor KPIs, identify trends, and optimize performance."
                }
            ]
        };

        // DOM elements cache
        this.elements = {};
        
        // Animation controllers
        this.intersectionObserver = null;
        this.performanceObserver = null;
        this.contentObserver = null;
        
        // Interactive timers
        this.hoverTimeout = null;
        this.keyboardTimeout = null;
        this.contentWaitTimeout = null;

        // Bind methods
        this.handleResize = this.throttle(this.handleResize.bind(this), 250);
        this.handleScroll = this.throttle(this.handleScroll.bind(this), 16);
        this.handleCTAClick = this.handleCTAClick.bind(this);
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleImageError = this.handleImageError.bind(this);
        
        // Interactive methods
        this.handleImageHover = this.handleImageHover.bind(this);
        this.handleImageLeave = this.handleImageLeave.bind(this);
        this.handleImageClick = this.handleImageClick.bind(this);
        this.handleImageKeydown = this.handleImageKeydown.bind(this);
        this.handleImageFocus = this.handleImageFocus.bind(this);
        this.handleImageBlur = this.handleImageBlur.bind(this);

        // Content loading methods
        this.handleContentMutation = this.handleContentMutation.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the hero section with content awareness
     */
    async init() {
        try {
            performance.mark('hero-init-start');
            
            await this.waitForDOM();
            
            // First check if content is already loaded
            if (this.checkContentExists()) {
                console.log('✅ Hero content already loaded, initializing immediately');
                await this.initializeWithContent();
            } else {
                console.log('⏳ Hero content not loaded yet, waiting for content...');
                await this.waitForContent();
            }

        } catch (error) {
            this.handleError('Initialization failed', error);
            await this.retryInitialization();
        }
    }

    /**
     * Check if hero content is already loaded
     */
    checkContentExists() {
        const heroSection = document.getElementById('hero-section');
        if (!heroSection || heroSection.nodeType !== Node.ELEMENT_NODE) {
            console.log('🔍 Hero section element not found or invalid');
            return false;
        }

        const headline = heroSection.querySelector('.hero-headline');
        const ctaButton = heroSection.querySelector('.btn-primary-large');
        const imageCard = heroSection.querySelector('.hero-image-card');

        const hasContent = !!(headline && ctaButton && imageCard);
        
        console.log('🔍 Content check:', {
            heroSection: !!heroSection,
            headline: !!headline,
            ctaButton: !!ctaButton,
            imageCard: !!imageCard,
            hasContent: hasContent
        });

        return hasContent;
    }

    /**
     * Wait for content to be loaded into hero section
     */
    waitForContent() {
        return new Promise((resolve, reject) => {
            const heroSection = document.getElementById('hero-section');
            if (!heroSection || heroSection.nodeType !== Node.ELEMENT_NODE) {
                reject(new Error('Hero section element not found or invalid'));
                return;
            }

            this.contentWaitTimeout = setTimeout(() => {
                if (this.contentObserver) {
                    this.contentObserver.disconnect();
                }
                reject(new Error('Content loading timeout after 10 seconds'));
            }, this.config.contentWaitTimeout);

            try {
                this.contentObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                            if (this.checkContentExists()) {
                                console.log('✅ Hero content detected, initializing...');
                                clearTimeout(this.contentWaitTimeout);
                                this.contentObserver.disconnect();
                                this.initializeWithContent().then(resolve).catch(reject);
                            }
                        }
                    });
                });

                this.contentObserver.observe(heroSection, {
                    childList: true,
                    subtree: true
                });

                console.log('👀 Watching for hero content to load...');
                
            } catch (error) {
                clearTimeout(this.contentWaitTimeout);
                reject(new Error(`MutationObserver setup failed: ${error.message}`));
            }
        });
    }

    /**
     * Initialize once content is confirmed to exist
     */
    async initializeWithContent() {
        try {
            this.state.contentLoaded = true;
            
            this.cacheElements();
            this.setupObservers();
            this.bindEvents();
            this.initializeAnimations();
            this.setupImageHandling();
            this.setupInteractiveImages();
            this.setupAccessibility();
            this.trackInitialization();

            // FIXED: Store base transforms to prevent accumulation
            this.storeBaseTransforms();

            this.state.isInitialized = true;
            performance.mark('hero-init-end');
            performance.measure('hero-initialization', 'hero-init-start', 'hero-init-end');
            
            console.log('✅ BuilderSolve Hero with Interactive Images initialized successfully');
            this.logPerformanceMetrics();

        } catch (error) {
            throw new Error(`Content initialization failed: ${error.message}`);
        }
    }

    /**
     * FIXED: Store base transforms to prevent accumulation
     */
    storeBaseTransforms() {
        if (this.elements.imageCards && this.elements.imageCards.length > 0) {
            this.elements.imageCards.forEach((card, index) => {
                const computedStyle = window.getComputedStyle(card);
                const transform = computedStyle.transform;
                this.state.baseTransforms.set(`card-${index}`, transform !== 'none' ? transform : '');
            });
        }

        if (this.elements.imagesContainer) {
            const computedStyle = window.getComputedStyle(this.elements.imagesContainer);
            const transform = computedStyle.transform;
            this.state.baseTransforms.set('container', transform !== 'none' ? transform : '');
        }

        console.log('📦 Base transforms stored:', this.state.baseTransforms);
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                resolve();
            }
        });
    }

    /**
     * Cache all DOM elements for performance with robust null checking
     */
    cacheElements() {
        const selectors = {
            heroSection: '#hero-section',
            heroWrapper: '.hero-wrapper',
            heroContent: '.hero-content',
            heroText: '.hero-text',
            heroVisual: '.hero-visual',
            headline: '.hero-headline',
            subheadline: '.hero-subheadline',
            stats: '.hero-stats',
            ctaButton: '.btn-primary-large',
            ctaSecondary: '.cta-secondary',
            heroImages: '.hero-image',
            imageCards: '.hero-image-card',
            imagesContainer: '.hero-images-container',
            imageDescriptions: '.image-description',
            scrollIndicator: '.scroll-indicator',
            fadeElements: '[data-fade]'
        };

        // Cache elements with robust error handling
        Object.entries(selectors).forEach(([key, selector]) => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length === 0) {
                    this.elements[key] = key.endsWith('s') ? [] : null;
                    console.warn(`⚠️ No elements found for: ${selector}`);
                } else if (elements.length === 1) {
                    this.elements[key] = elements[0];
                } else {
                    this.elements[key] = Array.from(elements);
                }
            } catch (error) {
                console.warn(`❌ Failed to cache element: ${selector}`, error);
                this.elements[key] = key.endsWith('s') ? [] : null;
            }
        });

        // Special handling for heroSection to ensure it's a proper Element
        const heroSectionElement = document.getElementById('hero-section');
        if (heroSectionElement && heroSectionElement.nodeType === Node.ELEMENT_NODE) {
            this.elements.heroSection = heroSectionElement;
        } else {
            this.elements.heroSection = null;
            console.warn('⚠️ Hero section not found or not a valid Element');
        }

        // Validate critical elements
        if (!this.elements.heroSection) {
            throw new Error('Hero section not found or invalid');
        }

        console.log('📦 Cached elements:', {
            heroSection: {
                exists: !!this.elements.heroSection,
                type: this.elements.heroSection ? this.elements.heroSection.constructor.name : 'null',
                nodeType: this.elements.heroSection ? this.elements.heroSection.nodeType : 'N/A'
            },
            ctaButton: !!this.elements.ctaButton,
            imageCards: this.elements.imageCards ? this.elements.imageCards.length : 0,
            heroImages: this.elements.heroImages ? this.elements.heroImages.length : 0,
            fadeElements: this.elements.fadeElements ? this.elements.fadeElements.length : 0
        });

        // Cache individual image cards by type
        if (this.elements.imageCards && this.elements.imageCards.length > 0) {
            this.elements.mainImageCard = this.elements.imageCards.find(card => 
                card.classList.contains('hero-image-main'));
            this.elements.secondaryImageCard = this.elements.imageCards.find(card => 
                card.classList.contains('hero-image-secondary'));
            this.elements.tertiaryImageCard = this.elements.imageCards.find(card => 
                card.classList.contains('hero-image-tertiary'));
        }
    }

    /**
     * Setup intersection and performance observers with null checks
     */
    setupObservers() {
        if (this.elements.heroSection && 
            this.elements.heroSection.nodeType === Node.ELEMENT_NODE &&
            typeof this.elements.heroSection.getBoundingClientRect === 'function') {
            
            try {
                this.intersectionObserver = new IntersectionObserver(
                    (entries) => this.handleIntersection(entries),
                    {
                        threshold: [0.1, 0.25, 0.5],
                        rootMargin: '-50px 0px -50px 0px'
                    }
                );
                
                this.intersectionObserver.observe(this.elements.heroSection);
                console.log('✅ IntersectionObserver setup successful');
                
            } catch (error) {
                console.warn('⚠️ IntersectionObserver setup failed:', error);
                this.intersectionObserver = null;
            }
        } else {
            console.warn('⚠️ Cannot setup intersection observer: hero section invalid or not found');
        }

        // Performance Observer for monitoring
        if ('PerformanceObserver' in window) {
            try {
                this.performanceObserver = new PerformanceObserver((list) => {
                    this.analyzePerformance(list.getEntries());
                });
                
                this.performanceObserver.observe({ 
                    entryTypes: ['measure', 'navigation', 'paint'] 
                });
                console.log('✅ PerformanceObserver setup successful');
            } catch (error) {
                console.warn('⚠️ Performance observer setup failed:', error);
            }
        }
    }

    /**
     * Bind all event listeners with null checks
     */
    bindEvents() {
        // CTA button interactions
        if (this.elements.ctaButton) {
            this.elements.ctaButton.addEventListener('click', this.handleCTAClick);
            this.elements.ctaButton.addEventListener('mouseenter', this.handleCTAHover.bind(this));
            this.elements.ctaButton.addEventListener('mouseleave', this.handleCTALeave.bind(this));
            console.log('✅ CTA button events bound');
        } else {
            console.warn('⚠️ CTA button not found, skipping CTA events');
        }

        // Image loading events
        if (this.elements.heroImages && this.elements.heroImages.length > 0) {
            this.elements.heroImages.forEach((image, index) => {
                image.addEventListener('load', () => this.handleImageLoad(index));
                image.addEventListener('error', () => this.handleImageError(index));
            });
            console.log(`✅ Image events bound for ${this.elements.heroImages.length} images`);
        } else {
            console.warn('⚠️ No hero images found, skipping image events');
        }

        // Scroll indicator
        if (this.elements.scrollIndicator) {
            this.elements.scrollIndicator.addEventListener('click', this.handleScrollIndicatorClick.bind(this));
            console.log('✅ Scroll indicator events bound');
        }

        // Window events
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleScroll, { passive: true });

        // Global keyboard navigation
        document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));

        // Visibility change for performance
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
        
        // Detect keyboard vs mouse users
        document.addEventListener('keydown', () => {
            this.state.isKeyboardUser = true;
        }, { once: true });
        
        document.addEventListener('mousedown', () => {
            this.state.isKeyboardUser = false;
        });

        console.log('✅ Global events bound');
    }

    /**
     * Setup interactive image handling with null checks
     */
    setupInteractiveImages() {
        if (!this.elements.imageCards || this.elements.imageCards.length === 0) {
            console.warn('⚠️ No image cards found for interactive setup');
            return;
        }

        this.elements.imageCards.forEach((card, index) => {
            // Set up data attributes
            card.setAttribute('data-image-index', index);
            card.setAttribute('tabindex', '0');
            
            // FIXED: Clear any existing event listeners to prevent duplicates
            card.removeEventListener('mouseenter', this.handleImageHover);
            card.removeEventListener('mouseleave', this.handleImageLeave);
            card.removeEventListener('click', this.handleImageClick);
            card.removeEventListener('keydown', this.handleImageKeydown);
            card.removeEventListener('focus', this.handleImageFocus);
            card.removeEventListener('blur', this.handleImageBlur);
            
            // Mouse events
            card.addEventListener('mouseenter', (e) => this.handleImageHover(e, index));
            card.addEventListener('mouseleave', (e) => this.handleImageLeave(e, index));
            card.addEventListener('click', (e) => this.handleImageClick(e, index));
            
            // Keyboard events
            card.addEventListener('keydown', (e) => this.handleImageKeydown(e, index));
            card.addEventListener('focus', (e) => this.handleImageFocus(e, index));
            card.addEventListener('blur', (e) => this.handleImageBlur(e, index));
            
            // Update image descriptions
            this.updateImageDescription(index);
        });

        console.log(`✅ Set up interactive behavior for ${this.elements.imageCards.length} image cards`);
    }

    /**
     * Update image description content
     */
    updateImageDescription(index) {
        if (!this.elements.imageCards || !this.elements.imageCards[index]) return;
        
        const card = this.elements.imageCards[index];
        const description = card?.querySelector('.image-description');
        
        if (description && this.state.imageDescriptions[index]) {
            const titleElement = description.querySelector('.image-description-title');
            const textElement = description.querySelector('.image-description-text');
            
            if (titleElement && textElement) {
                titleElement.textContent = this.state.imageDescriptions[index].title;
                textElement.textContent = this.state.imageDescriptions[index].text;
            }
        }
    }

    /**
     * FIXED: Handle image hover with better debouncing
     */
    handleImageHover(event, index) {
        // Clear any existing timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }

        // FIXED: Don't enlarge if already enlarged unless it's the same image
        if (this.state.currentEnlargedImage !== null && this.state.currentEnlargedImage !== index) {
            return; // Don't interfere with already enlarged image
        }

        // Delay the enlargement slightly for smoother UX
        this.hoverTimeout = setTimeout(() => {
            this.enlargeImage(index, 'hover');
        }, this.config.imageHoverDelay);

        this.trackEvent('hero_image_hover_start', {
            image_index: index,
            image_name: this.getImageName(index),
            timestamp: Date.now(),
            interaction_type: 'mouse'
        });
    }

    /**
     * FIXED: Handle image leave with better state management
     */
    handleImageLeave(event, index) {
        // Clear hover timeout if leaving quickly
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }

        // FIXED: Only shrink if this image is currently enlarged and not keyboard focused
        if (this.state.currentEnlargedImage === index && 
            (!this.state.isKeyboardUser || !event.target.matches(':focus'))) {
            this.shrinkImage(index, 'leave');
        }

        this.trackEvent('hero_image_hover_end', {
            image_index: index,
            image_name: this.getImageName(index),
            timestamp: Date.now(),
            interaction_type: 'mouse'
        });
    }

    /**
     * Handle image click
     */
    handleImageClick(event, index) {
        event.preventDefault();
        
        // Toggle enlargement on click
        if (this.state.currentEnlargedImage === index) {
            this.shrinkImage(index, 'click');
        } else {
            this.enlargeImage(index, 'click');
        }

        // Add click animation
        const card = event.target.closest('.hero-image-card');
        if (card) {
            card.style.transform += ' scale(0.95)';
            setTimeout(() => {
                // FIXED: Remove scale effect properly
                this.refreshCardTransform(index);
            }, 150);
        }

        this.trackEvent('hero_image_click', {
            image_index: index,
            image_name: this.getImageName(index),
            timestamp: Date.now(),
            interaction_type: 'mouse'
        });
    }

    /**
     * Handle image keyboard navigation
     */
    handleImageKeydown(event, index) {
        const { key } = event;
        
        switch (key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (this.state.currentEnlargedImage === index) {
                    this.shrinkImage(index, 'keyboard');
                } else {
                    this.enlargeImage(index, 'keyboard');
                }
                
                this.trackEvent('hero_image_keyboard_activate', {
                    image_index: index,
                    key: key,
                    timestamp: Date.now()
                });
                break;
                
            case 'Escape':
                event.preventDefault();
                if (this.state.currentEnlargedImage === index) {
                    this.shrinkImage(index, 'keyboard');
                }
                
                this.trackEvent('hero_image_keyboard_escape', {
                    image_index: index,
                    timestamp: Date.now()
                });
                break;
                
            case 'ArrowLeft':
            case 'ArrowRight':
                event.preventDefault();
                this.navigateImages(key === 'ArrowRight' ? 1 : -1, index);
                break;
        }
    }

    /**
     * Handle image focus
     */
    handleImageFocus(event, index) {
        // Only enlarge on keyboard focus, not mouse focus
        if (this.state.isKeyboardUser) {
            this.enlargeImage(index, 'focus');
        }

        this.trackEvent('hero_image_focus', {
            image_index: index,
            timestamp: Date.now(),
            interaction_type: this.state.isKeyboardUser ? 'keyboard' : 'mouse'
        });
    }

    /**
     * FIXED: Handle image blur with better timing
     */
    handleImageBlur(event, index) {
        // Clear any existing timeout
        if (this.keyboardTimeout) {
            clearTimeout(this.keyboardTimeout);
            this.keyboardTimeout = null;
        }

        this.keyboardTimeout = setTimeout(() => {
            // Check if any image card is still focused
            const focusedImageCard = document.querySelector('.hero-image-card:focus');
            if (!focusedImageCard && this.state.isKeyboardUser && this.state.currentEnlargedImage === index) {
                this.shrinkImage(index, 'blur');
            }
        }, 100);

        this.trackEvent('hero_image_blur', {
            image_index: index,
            timestamp: Date.now()
        });
    }

    /**
     * Navigate between images with keyboard
     */
    navigateImages(direction, currentIndex) {
        if (!this.elements.imageCards) return;
        
        const totalImages = this.elements.imageCards.length;
        let newIndex = currentIndex + direction;
        
        // Wrap around
        if (newIndex < 0) newIndex = totalImages - 1;
        if (newIndex >= totalImages) newIndex = 0;
        
        // Focus the new image
        this.elements.imageCards[newIndex].focus();
        
        this.trackEvent('hero_image_keyboard_navigate', {
            from_index: currentIndex,
            to_index: newIndex,
            direction: direction,
            timestamp: Date.now()
        });
    }

    /**
     * FIXED: Enlarge an image with better transform management
     */
    enlargeImage(index, triggerType = 'hover') {
        if (!this.elements.imageCards || !this.elements.imageCards[index]) return;
        
        // Shrink any currently enlarged image first
        if (this.state.currentEnlargedImage !== null && this.state.currentEnlargedImage !== index) {
            this.shrinkImage(this.state.currentEnlargedImage, 'auto');
        }

        const card = this.elements.imageCards[index];
        const container = this.elements.imagesContainer;
        
        if (!card || !container) return;

        // Add enlarged classes
        card.classList.add('enlarged');
        container.classList.add('has-enlarged');
        
        // Update state
        this.state.currentEnlargedImage = index;
        
        // Update description content if needed
        this.updateImageDescription(index);
        
        // Announce to screen readers
        this.announceImageChange(index, 'enlarged');
        
        this.trackEvent('hero_image_enlarged', {
            image_index: index,
            image_name: this.getImageName(index),
            trigger_type: triggerType,
            timestamp: Date.now()
        });

        console.log(`🔍 Image ${index + 1} (${this.getImageName(index)}) enlarged via ${triggerType}`);
    }

    /**
     * FIXED: Shrink an image with proper state cleanup
     */
    shrinkImage(index, triggerType = 'leave') {
        if (!this.elements.imageCards || !this.elements.imageCards[index]) return;
        
        const card = this.elements.imageCards[index];
        const container = this.elements.imagesContainer;
        
        if (!card || !container) return;

        // Remove enlarged classes
        card.classList.remove('enlarged');
        container.classList.remove('has-enlarged');
        
        // FIXED: Only update state if this image was actually enlarged
        if (this.state.currentEnlargedImage === index) {
            this.state.currentEnlargedImage = null;
        }
        
        // FIXED: Refresh transform to remove any accumulated effects
        this.refreshCardTransform(index);
        
        // Announce to screen readers
        this.announceImageChange(index, 'normal view');
        
        this.trackEvent('hero_image_shrunk', {
            image_index: index,
            image_name: this.getImageName(index),
            trigger_type: triggerType,
            timestamp: Date.now()
        });

        console.log(`📱 Image ${index + 1} (${this.getImageName(index)}) returned to normal via ${triggerType}`);
    }

    /**
     * FIXED: Refresh card transform to remove accumulation
     */
    refreshCardTransform(index) {
        if (!this.elements.imageCards || !this.elements.imageCards[index]) return;
        
        const card = this.elements.imageCards[index];
        const baseTransform = this.state.baseTransforms.get(`card-${index}`) || '';
        
        // Reset to base transform without accumulated effects
        card.style.transform = baseTransform;
    }

    /**
     * Get image name for analytics
     */
    getImageName(index) {
        const names = ['main_dashboard', 'mobile_field', 'analytics'];
        return names[index] || `image_${index}`;
    }

    /**
     * Announce image changes to screen readers
     */
    announceImageChange(index, action) {
        const imageNames = [
            'Project Management Dashboard',
            'Mobile Field Management', 
            'Advanced Analytics'
        ];
        
        const message = `${imageNames[index] || `Image ${index + 1}`} ${action}`;
        
        // Create or update live region
        let liveRegion = document.getElementById('hero-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'hero-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            liveRegion.style.cssText = `
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            `;
            document.body.appendChild(liveRegion);
        }
        
        liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }

    /**
     * Setup image handling with fallbacks
     */
    setupImageHandling() {
        if (!this.elements.heroImages || this.elements.heroImages.length === 0) {
            console.warn('⚠️ No hero images found for handling setup');
            return;
        }

        // Set initial image states
        this.elements.heroImages.forEach(image => {
            image.style.opacity = '0';
            image.style.transition = 'opacity 0.5s ease-out';
        });

        // Track loading state for each image
        this.state.imagesLoaded = new Array(this.elements.heroImages.length).fill(false);

        // Timeout fallback for slow loading
        setTimeout(() => {
            this.elements.heroImages.forEach((image, index) => {
                if (!this.state.imagesLoaded[index]) {
                    this.handleImageTimeout(index);
                }
            });
        }, this.config.imageLoadTimeout);
    }

    /**
     * Setup intersection observer for animations
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !this.state.animationsTriggered) {
                this.state.isVisible = true;
                this.state.animationsTriggered = true;
                this.triggerEntranceAnimations();
                this.trackVisibility();
            }
        });
    }

    /**
     * Initialize entrance animations
     */
    initializeAnimations() {
        if (!this.elements.fadeElements || this.elements.fadeElements.length === 0) {
            console.warn('⚠️ No fade elements found for animation setup');
            return;
        }

        // Set initial states for fade elements
        this.elements.fadeElements.forEach(element => {
            const direction = element.dataset.fade || 'up';
            const delay = parseInt(element.dataset.delay || '0');
            
            // Set initial transform based on direction
            const transforms = {
                up: 'translateY(40px)',
                down: 'translateY(-40px)',
                left: 'translateX(50px)',
                right: 'translateX(-50px)'
            };

            element.style.opacity = '0';
            element.style.transform = transforms[direction] || transforms.up;
            element.style.transition = `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`;
        });

        console.log(`✅ Animation setup complete for ${this.elements.fadeElements.length} elements`);
    }

    /**
     * Trigger entrance animations sequence
     */
    async triggerEntranceAnimations() {
        performance.mark('animations-start');

        try {
            // Animate fade elements
            await this.animateFadeElements();

            performance.mark('animations-end');
            performance.measure('entrance-animations', 'animations-start', 'animations-end');

        } catch (error) {
            this.handleError('Animation sequence failed', error);
        }
    }

    /**
     * Animate fade elements
     */
    animateFadeElements() {
        return new Promise((resolve) => {
            let animatedCount = 0;
            const totalElements = this.elements.fadeElements ? this.elements.fadeElements.length : 0;

            if (totalElements === 0) {
                resolve();
                return;
            }

            this.elements.fadeElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0) translateX(0)';
                    
                    element.addEventListener('transitionend', () => {
                        animatedCount++;
                        if (animatedCount === totalElements) {
                            resolve();
                        }
                    }, { once: true });
                }, index * this.config.animationDelay);
            });
        });
    }

    /**
     * Handle CTA button click with conversion tracking
     */
    handleCTAClick(event) {
        // Add click animation
        const button = event.target.closest('.btn-primary-large');
        if (button) {
            button.style.transform = 'translateY(-2px) scale(0.98)';
            button.style.transition = 'transform 0.1s ease-out';
            
            setTimeout(() => {
                button.style.transform = '';
            }, 150);

            // Track conversion
            this.trackConversion('hero_contact_click', {
                button_text: button.querySelector('.btn-text')?.textContent || 'Contact Us',
                location: 'hero_section',
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                viewport: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            });

            console.log('📞 Contact Us clicked - tracking conversion');
        }
    }

    /**
     * Handle CTA hover effects
     */
    handleCTAHover(event) {
        const button = event.target.closest('.btn-primary-large');
        
        // Track hover for engagement analytics
        this.trackEvent('cta_hover', {
            timestamp: Date.now(),
            hover_duration_start: Date.now()
        });
    }

    /**
     * Handle CTA leave effects
     */
    handleCTALeave(event) {
        // Track hover duration
        this.trackEvent('cta_hover_end', {
            timestamp: Date.now()
        });
    }

    /**
     * Handle image loading success
     */
    handleImageLoad(index) {
        if (this.state.imagesLoaded) {
            this.state.imagesLoaded[index] = true;
        }
        
        if (this.elements.heroImages && this.elements.heroImages[index]) {
            const image = this.elements.heroImages[index];
            image.style.opacity = '1';
        }
        
        console.log(`✅ Hero image ${index + 1} loaded successfully`);
        
        this.trackEvent('hero_image_loaded', {
            image_index: index,
            timestamp: Date.now(),
            load_time: performance.now()
        });

        // Check if all images are loaded
        if (this.state.imagesLoaded && this.state.imagesLoaded.every(loaded => loaded)) {
            this.trackEvent('all_hero_images_loaded', {
                timestamp: Date.now(),
                total_images: this.elements.heroImages ? this.elements.heroImages.length : 0
            });
        }
    }

    /**
     * Handle image loading error
     */
    handleImageError(index) {
        console.warn(`⚠️ Hero image ${index + 1} failed to load, using fallback`);
        
        // Create fallback gradient background
        if (this.elements.imageCards && this.elements.imageCards[index]) {
            const imageCard = this.elements.imageCards[index];
            imageCard.style.background = 
                'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #FED7AA 100%)';
            imageCard.style.display = 'flex';
            imageCard.style.alignItems = 'center';
            imageCard.style.justifyContent = 'center';
            
            // Add fallback content
            const fallbackContent = document.createElement('div');
            fallbackContent.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #64748B;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
                    <div style="font-weight: 600; color: #374151;">${this.state.imageDescriptions[index]?.title || `BuilderSolve ${index + 1}`}</div>
                </div>
            `;
            imageCard.appendChild(fallbackContent);
        }

        this.trackEvent('hero_image_error', {
            image_index: index,
            timestamp: Date.now(),
            error: 'Image failed to load'
        });
    }

    /**
     * Handle image loading timeout
     */
    handleImageTimeout(index) {
        console.warn(`⚠️ Hero image ${index + 1} loading timeout`);
        
        this.trackEvent('hero_image_timeout', {
            image_index: index,
            timestamp: Date.now(),
            timeout_duration: this.config.imageLoadTimeout
        });
    }

    /**
     * Handle scroll indicator click
     */
    handleScrollIndicatorClick(event) {
        event.preventDefault();
        
        if (!this.elements.scrollIndicator) return;
        
        const targetId = this.elements.scrollIndicator.dataset.scrollTo || '#features';
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const navHeight = 72;
            const targetPosition = targetElement.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            this.trackEvent('scroll_indicator_click', {
                target: targetId,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Handle window resize with debouncing
     */
    handleResize() {
        // Update viewport-dependent calculations
        this.updateResponsiveState();
        
        // Reset any enlarged states on mobile for better UX
        if (window.innerWidth <= 768 && this.state.currentEnlargedImage !== null) {
            this.shrinkImage(this.state.currentEnlargedImage, 'resize');
        }
        
        // FIXED: Refresh base transforms after resize
        this.storeBaseTransforms();
    }

    /**
     * FIXED: Handle scroll events with proper transform management
     */
    handleScroll() {
        if (!this.state.isVisible || !this.elements.heroSection) return;

        const scrolled = window.pageYOffset;
        const heroHeight = this.elements.heroSection.offsetHeight;
        this.state.scrollPosition = scrolled;

        // FIXED: Proper parallax effect with proper transform management
        if (this.elements.imagesContainer && scrolled <= heroHeight) {
            const baseTransform = this.state.baseTransforms.get('container') || '';
            const parallaxOffset = Math.min(scrolled * this.config.parallaxStrength, this.config.maxParallaxOffset);
            
            // FIXED: Set transform properly instead of accumulating
            let newTransform = baseTransform;
            if (newTransform && newTransform !== 'none') {
                newTransform += ` translateY(${parallaxOffset}px)`;
            } else {
                newTransform = `translateY(${parallaxOffset}px)`;
            }
            
            this.elements.imagesContainer.style.transform = newTransform;
        } else if (this.elements.imagesContainer && scrolled > heroHeight) {
            // FIXED: Reset to base transform when scrolled past hero
            const baseTransform = this.state.baseTransforms.get('container') || '';
            this.elements.imagesContainer.style.transform = baseTransform;
        }
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA live regions for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'hero-announcements';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);

        // Add instructions for screen readers
        if (this.elements.imagesContainer) {
            this.elements.imagesContainer.setAttribute('aria-label', 
                'Interactive image gallery. Use mouse hover or keyboard navigation to explore BuilderSolve features.');
        }

        // Announce when animations complete
        if (this.state.animationsTriggered) {
            this.announceToScreenReader('Hero section loaded successfully');
        }
    }

    /**
     * Announce to screen readers
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('hero-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    /**
     * Handle global keyboard shortcuts
     */
    handleGlobalKeydown(event) {
        // Contact shortcut
        if (event.key === 'Enter' && event.target === this.elements.ctaButton) {
            this.handleCTAClick(event);
        }
        
        // Global escape to close any enlarged image
        if (event.key === 'Escape' && this.state.currentEnlargedImage !== null) {
            this.shrinkImage(this.state.currentEnlargedImage, 'global_escape');
        }
    }

    /**
     * Handle visibility change for performance
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when tab is hidden
            this.pauseAnimations();
        } else {
            // Resume animations when tab is visible
            this.resumeAnimations();
        }
    }

    /**
     * Pause animations for performance
     */
    pauseAnimations() {
        if (this.elements.imageCards && this.elements.imageCards.length > 0) {
            this.elements.imageCards.forEach(card => {
                card.style.animationPlayState = 'paused';
            });
        }
    }

    /**
     * Resume animations
     */
    resumeAnimations() {
        if (this.elements.imageCards && this.elements.imageCards.length > 0) {
            this.elements.imageCards.forEach(card => {
                card.style.animationPlayState = 'running';
            });
        }
    }

    /**
     * Handle content mutation (for debugging)
     */
    handleContentMutation(mutations) {
        mutations.forEach((mutation) => {
            console.log('Content mutation detected:', mutation);
        });
    }

    /**
     * Track events for analytics
     */
    trackEvent(eventName, data = {}) {
        const eventData = {
            event: eventName,
            component: 'hero_section',
            timestamp: Date.now(),
            ...data
        };

        console.log('📊 Event tracked:', eventData);

        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'hero_section',
                event_label: data.button_text || data.image_name || '',
                value: data.timestamp
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
     * Track conversions specifically
     */
    trackConversion(eventName, data = {}) {
        this.trackEvent(eventName, { ...data, conversion: true });
        
        // Additional conversion tracking
        if (window.fbq) {
            window.fbq('track', 'Lead');
        }

        if (window.gtag) {
            window.gtag('event', 'conversion', {
                send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL'
            });
        }

        // Track phone calls or form submissions
        if (window.CallRail) {
            window.CallRail.track('conversion');
        }
    }

    /**
     * Track visibility for engagement
     */
    trackVisibility() {
        this.trackEvent('hero_section_viewed', {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            user_agent: navigator.userAgent,
            referrer: document.referrer
        });
    }

    /**
     * Track initialization
     */
    trackInitialization() {
        this.trackEvent('hero_section_initialized', {
            load_time: performance.now(),
            features_enabled: {
                intersection_observer: !!this.intersectionObserver,
                performance_observer: !!this.performanceObserver,
                interactive_images: !!(this.elements.imageCards && this.elements.imageCards.length > 0),
                image_count: this.elements.heroImages ? this.elements.heroImages.length : 0,
                keyboard_navigation: this.config.keyboardNavigationEnabled
            }
        });
    }

    /**
     * Analyze performance metrics
     */
    analyzePerformance(entries) {
        entries.forEach(entry => {
            if (entry.entryType === 'measure') {
                this.state.performanceMetrics[entry.name] = entry.duration;
                
                // Log slow operations
                if (entry.duration > this.config.performanceThreshold) {
                    console.warn(`⚠️ Slow operation detected: ${entry.name} took ${entry.duration}ms`);
                }
            }
        });
    }

    /**
     * Log performance metrics
     */
    logPerformanceMetrics() {
        const metrics = this.state.performanceMetrics;
        console.log('📈 Hero Performance Metrics:', metrics);
        
        // Track performance
        this.trackEvent('performance_metrics', metrics);
    }

    /**
     * Handle errors gracefully
     */
    handleError(message, error) {
        console.error(`❌ BuilderSolve Hero Error: ${message}`, error);
        
        // Track errors
        this.trackEvent('error_occurred', {
            message,
            error: error.message,
            stack: error.stack,
            timestamp: Date.now()
        });
    }

    /**
     * Retry initialization on failure
     */
    async retryInitialization() {
        if (this.state.retryCount < this.config.retryAttempts) {
            this.state.retryCount++;
            console.log(`🔄 Retrying initialization (attempt ${this.state.retryCount})`);
            
            setTimeout(() => {
                this.init();
            }, 1000 * this.state.retryCount);
        } else {
            console.error('❌ Max retry attempts reached. Hero initialization failed.');
        }
    }

    /**
     * Update responsive state
     */
    updateResponsiveState() {
        const breakpoints = {
            mobile: window.innerWidth <= 767,
            tablet: window.innerWidth <= 1023,
            desktop: window.innerWidth > 1023
        };

        this.state.breakpoint = Object.keys(breakpoints).find(key => breakpoints[key]) || 'desktop';
    }

    /**
     * Throttle function for performance
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Public API for external access and customization
     */
    getAPI() {
        return {
            // State
            getState: () => ({ ...this.state }),
            getMetrics: () => ({ ...this.state.performanceMetrics }),
            getCurrentEnlargedImage: () => this.state.currentEnlargedImage,
            
            // Actions
            triggerAnimations: () => this.triggerEntranceAnimations(),
            scrollToNext: () => this.handleScrollIndicatorClick({ preventDefault: () => {} }),
            enlargeImage: (index) => this.enlargeImage(index, 'api'),
            shrinkImage: (index) => this.shrinkImage(index, 'api'),
            shrinkAllImages: () => {
                if (this.state.currentEnlargedImage !== null) {
                    this.shrinkImage(this.state.currentEnlargedImage, 'api');
                }
            },
            
            // FIXED: Add refresh function
            refreshImages: () => {
                this.storeBaseTransforms();
                if (this.elements.imageCards) {
                    this.elements.imageCards.forEach((_, index) => {
                        this.refreshCardTransform(index);
                    });
                }
            },
            
            // Customization
            updateImageDescription: (index, title, text) => {
                if (this.state.imageDescriptions[index]) {
                    this.state.imageDescriptions[index] = { title, text };
                    this.updateImageDescription(index);
                }
            },
            updateAllDescriptions: (descriptions) => {
                this.state.imageDescriptions = descriptions;
                if (this.elements.imageCards) {
                    this.elements.imageCards.forEach((_, index) => {
                        this.updateImageDescription(index);
                    });
                }
            },
            
            // Tracking
            trackConversion: (data) => this.trackConversion('external_conversion', data),
            trackEvent: (name, data) => this.trackEvent(name, data),
            
            // Performance
            refreshAnimations: () => {
                if (this.state.isVisible) {
                    this.triggerEntranceAnimations();
                }
            },
            
            // Image handling
            reloadImages: () => {
                if (this.elements.heroImages && this.elements.heroImages.length > 0) {
                    this.elements.heroImages.forEach(image => {
                        image.src = image.src;
                    });
                }
            },
            
            // Content detection
            isContentLoaded: () => this.state.contentLoaded,
            waitForContent: () => this.waitForContent(),
            
            // Debugging
            debug: () => ({
                state: this.state,
                elements: this.elements,
                config: this.config
            })
        };
    }

    /**
     * Cleanup on destroy
     */
    destroy() {
        // Clear timeouts
        if (this.hoverTimeout) clearTimeout(this.hoverTimeout);
        if (this.keyboardTimeout) clearTimeout(this.keyboardTimeout);
        if (this.contentWaitTimeout) clearTimeout(this.contentWaitTimeout);

        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleScroll);

        // Disconnect observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }

        if (this.contentObserver) {
            this.contentObserver.disconnect();
        }
        
        console.log('🧹 BuilderSolve Hero with Interactive Images cleaned up');
    }
}

// Initialize hero section when DOM is ready
let heroInstance;

const initializeHero = () => {
    heroInstance = new BuilderSolveHero({
        animationDelay: 80,
        imageLoadTimeout: 3000,
        imageHoverDelay: 150,
        keyboardNavigationEnabled: true,
        contentWaitTimeout: 10000,
        // NEW: Scroll settings
        parallaxStrength: 0.1,
        maxParallaxOffset: 50
    });
    
    // Export to global scope for external access
    window.BuilderSolveHero = heroInstance.getAPI();
    
    // Add convenient global functions
    window.enlargeHeroImage = (index) => heroInstance.getAPI().enlargeImage(index);
    window.shrinkHeroImages = () => heroInstance.getAPI().shrinkAllImages();
    window.updateHeroImageText = (index, title, text) => heroInstance.getAPI().updateImageDescription(index, title, text);
    window.refreshHeroImages = () => heroInstance.getAPI().refreshImages();
};

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHero);
} else {
    initializeHero();
}

// Hot reload support for development
if (typeof module !== 'undefined' && module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        if (heroInstance) {
            heroInstance.destroy();
        }
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BuilderSolveHero;
} else if (typeof define === 'function' && define.amd) {
    define(() => BuilderSolveHero);
}