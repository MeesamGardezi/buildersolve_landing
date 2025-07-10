/**
 * BuilderSolve Hero Section
 * Handles animations, interactions, and dynamic effects
 */

class HeroSection {
    constructor() {
        this.heroWrapper = null;
        this.dashboardContainer = null;
        this.floatingCards = [];
        this.scrollIndicator = null;
        this.contactButton = null;
        this.isVisible = false;
        
        this.init();
    }
    
    /**
     * Initialize hero section
     */
    init() {
        // Wait for DOM to ensure hero section is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Setup hero section after DOM is ready
     */
    setup() {
        this.cacheElements();
        
        if (!this.heroWrapper) {
            // Retry after a short delay if hero not found
            setTimeout(() => this.setup(), 100);
            return;
        }
        
        this.bindEvents();
        this.initializeAnimations();
        this.setupIntersectionObserver();
        
        console.log('✅ Hero section initialized successfully');
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.heroWrapper = document.querySelector('.hero-wrapper');
        this.dashboardContainer = document.querySelector('.dashboard-container');
        this.floatingCards = Array.from(document.querySelectorAll('.floating-card'));
        this.scrollIndicator = document.querySelector('.scroll-indicator');
        this.contactButton = document.querySelector('.btn-primary-large');
        this.chartBars = Array.from(document.querySelectorAll('.bar'));
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.heroWrapper) return;
        
        // Scroll indicator click
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToNextSection();
            });
        }
        
        // Dashboard hover effects
        if (this.dashboardContainer) {
            this.dashboardContainer.addEventListener('mouseenter', () => {
                this.handleDashboardHover(true);
            });
            
            this.dashboardContainer.addEventListener('mouseleave', () => {
                this.handleDashboardHover(false);
            });
        }
        
        // Floating cards interactions
        this.floatingCards.forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                this.animateFloatingCard(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.animateFloatingCard(card, false);
            });
        });
        
        // Contact button interactions
        if (this.contactButton) {
            this.contactButton.addEventListener('click', () => {
                this.handleContactClick();
            });
            
            this.contactButton.addEventListener('mouseenter', () => {
                this.pauseButtonAnimation();
            });
            
            this.contactButton.addEventListener('mouseleave', () => {
                this.resumeButtonAnimation();
            });
        }
        
        // Tab interactions
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.handleTabClick(e.target);
            });
        });
        
        // Parallax scroll effect (throttled)
        window.addEventListener('scroll', this.throttle(() => {
            this.handleParallaxScroll();
        }, 16));
    }
    
    /**
     * Initialize animations
     */
    initializeAnimations() {
        // Set up chart bar animation delays
        this.chartBars.forEach((bar, index) => {
            bar.style.setProperty('--delay', `${index * 0.1}s`);
        });
        
        // Initialize floating cards
        this.initializeFloatingCards();
        
        // Add dashboard entrance animation
        if (this.dashboardContainer) {
            this.dashboardContainer.style.opacity = '0';
            this.dashboardContainer.style.transform = 'perspective(1000px) rotateY(-15deg) rotateX(10deg) translateY(50px)';
        }
    }
    
    /**
     * Setup intersection observer for section visibility
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '-50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isVisible) {
                    this.isVisible = true;
                    this.animateOnVisible();
                }
            });
        }, observerOptions);
        
        if (this.heroWrapper) {
            observer.observe(this.heroWrapper);
        }
    }
    
    /**
     * Animate elements when section becomes visible
     */
    animateOnVisible() {
        // Animate chart bars
        this.animateChartBars();
        
        // Animate dashboard entrance
        this.animateDashboard();
        
        // Start floating cards animation
        this.startFloatingCardsAnimation();
        
        // Track hero view
        this.trackHeroView();
    }
    
    /**
     * Animate dashboard entrance
     */
    animateDashboard() {
        if (!this.dashboardContainer) return;
        
        setTimeout(() => {
            this.dashboardContainer.style.transition = 'all 1s ease-out';
            this.dashboardContainer.style.opacity = '1';
            this.dashboardContainer.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(0)';
        }, 300);
    }
    
    /**
     * Animate chart bars
     */
    animateChartBars() {
        this.chartBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.animation = 'barGrow 1s ease-out forwards';
            }, 800 + (index * 100)); // Start after dashboard loads
        });
    }
    
    /**
     * Initialize floating cards
     */
    initializeFloatingCards() {
        this.floatingCards.forEach((card, index) => {
            // Set initial state
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px) scale(0.8)';
            card.style.animationDelay = `${index}s`;
            card.style.transformOrigin = 'center center';
        });
    }
    
    /**
     * Start floating cards animation
     */
    startFloatingCardsAnimation() {
        this.floatingCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0) scale(1)';
                
                // Start floating animation after entrance
                setTimeout(() => {
                    card.style.transition = '';
                    card.style.animation = `float 3s ease-in-out infinite ${index}s`;
                }, 600);
            }, 1000 + (index * 200));
        });
    }
    
    /**
     * Handle dashboard hover effects
     */
    handleDashboardHover(isHovering) {
        if (!this.dashboardContainer) return;
        
        if (isHovering) {
            this.floatingCards.forEach(card => {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = 'var(--shadow-xl)';
            });
        } else {
            this.floatingCards.forEach(card => {
                card.style.transform = 'scale(1)';
                card.style.boxShadow = 'var(--shadow-lg)';
            });
        }
    }
    
    /**
     * Animate individual floating card
     */
    animateFloatingCard(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-15px) scale(1.1)';
            card.style.boxShadow = 'var(--shadow-2xl)';
            card.style.zIndex = '20';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow-lg)';
            card.style.zIndex = '10';
        }
    }
    
    /**
     * Handle tab clicks
     */
    handleTabClick(clickedTab) {
        const tabs = document.querySelectorAll('.tab');
        
        // Remove active class from all tabs
        tabs.forEach(tab => tab.classList.remove('active'));
        
        // Add active class to clicked tab
        clickedTab.classList.add('active');
        
        // Add some animation feedback
        clickedTab.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickedTab.style.transform = 'scale(1)';
        }, 150);
        
        // Track tab interaction
        this.trackInteraction('tab_click', {
            tab: clickedTab.textContent.trim(),
            timestamp: Date.now()
        });
    }
    
    /**
     * Handle contact button click
     */
    handleContactClick() {
        // Add click animation
        if (this.contactButton) {
            this.contactButton.style.transform = 'translateY(-2px) scale(0.95)';
            setTimeout(() => {
                this.contactButton.style.transform = '';
            }, 150);
        }
        
        // Track conversion
        this.trackHeroConversion();
    }
    
    /**
     * Pause button animation on hover
     */
    pauseButtonAnimation() {
        if (this.contactButton) {
            this.contactButton.style.animationPlayState = 'paused';
        }
    }
    
    /**
     * Resume button animation
     */
    resumeButtonAnimation() {
        if (this.contactButton) {
            this.contactButton.style.animationPlayState = 'running';
        }
    }
    
    /**
     * Handle parallax scroll effect
     */
    handleParallaxScroll() {
        if (!this.heroWrapper) return;
        
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        // Move background elements
        const heroBackground = this.heroWrapper.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
        
        // Move floating cards with different rates
        this.floatingCards.forEach((card, index) => {
            const cardRate = scrolled * (-0.15 - (index * 0.05));
            card.style.transform += ` translateY(${cardRate}px)`;
        });
    }
    
    /**
     * Scroll to next section
     */
    scrollToNextSection() {
        const nextSection = document.getElementById('problem-solution-section');
        if (nextSection) {
            const navHeight = 70;
            const targetPosition = nextSection.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            this.trackScrollIndicatorClick();
        }
    }
    
    /**
     * Track hero section view
     */
    trackHeroView() {
        this.trackInteraction('hero_view', {
            timestamp: Date.now(),
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        });
    }
    
    /**
     * Track hero conversion (contact button click)
     */
    trackHeroConversion() {
        this.trackInteraction('hero_conversion', {
            button: 'contact_us',
            location: 'hero_section',
            timestamp: Date.now()
        });
        
        console.log('📞 Contact Us clicked from hero section');
    }
    
    /**
     * Track scroll indicator click
     */
    trackScrollIndicatorClick() {
        this.trackInteraction('scroll_indicator_click', {
            section: 'hero',
            timestamp: Date.now()
        });
    }
    
    /**
     * Track interactions for analytics
     */
    trackInteraction(action, data = {}) {
        const trackingData = {
            action,
            component: 'hero_section',
            ...data
        };
        
        console.log('📊 Hero tracking:', trackingData);
        
        // Send to analytics service
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'hero_section',
                event_label: data.button || data.section || data.tab,
                value: data.timestamp
            });
        }
        
        // Send to custom analytics
        if (window.BuilderSolveAnalytics) {
            window.BuilderSolveAnalytics.track(trackingData);
        }
    }
    
    /**
     * Throttle function execution
     */
    throttle(func, limit) {
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
     * Get hero section metrics
     */
    getMetrics() {
        return {
            isVisible: this.isVisible,
            floatingCardsCount: this.floatingCards.length,
            scrollPosition: window.pageYOffset,
            dashboardLoaded: this.dashboardContainer ? true : false
        };
    }
    
    /**
     * Refresh animations (useful for dynamic content changes)
     */
    refreshAnimations() {
        if (this.isVisible) {
            this.animateChartBars();
            this.startFloatingCardsAnimation();
        }
    }
    
    /**
     * Public API for external access
     */
    getAPI() {
        return {
            scrollToNext: this.scrollToNextSection.bind(this),
            getMetrics: this.getMetrics.bind(this),
            trackConversion: this.trackHeroConversion.bind(this),
            refresh: this.refreshAnimations.bind(this)
        };
    }
}

// Initialize hero section
const heroSectionInstance = new HeroSection();

// Export for external access
if (typeof window !== 'undefined') {
    window.BuilderSolveHero = heroSectionInstance.getAPI();
}

// AMD/CommonJS support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroSection;
} else if (typeof define === 'function' && define.amd) {
    define(function() {
        return HeroSection;
    });
}