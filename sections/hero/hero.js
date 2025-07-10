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
        this.statsAnimated = false;
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
        this.statsNumbers = Array.from(document.querySelectorAll('.stat-number'));
        this.chartBars = Array.from(document.querySelectorAll('.bar'));
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.heroWrapper) return;
        
        // Scroll indicator click
        if (this.scrollIndicator) {
            this.scrollIndicator.addEventListener('click', () => {
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
        
        // Contact button tracking
        const heroContactBtn = this.heroWrapper.querySelector('[data-contact]');
        if (heroContactBtn) {
            heroContactBtn.addEventListener('click', () => {
                this.trackHeroConversion();
            });
        }
        
        // Parallax scroll effect
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
        
        // Initialize floating cards positions
        this.initializeFloatingCards();
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
        // Animate stats numbers
        this.animateStatsNumbers();
        
        // Animate chart bars
        this.animateChartBars();
        
        // Start floating cards animation
        this.startFloatingCardsAnimation();
        
        // Track hero view
        this.trackHeroView();
    }
    
    /**
     * Animate statistics numbers with counting effect
     */
    animateStatsNumbers() {
        if (this.statsAnimated) return;
        this.statsAnimated = true;
        
        const statsData = [
            { element: this.statsNumbers[0], target: 2.2, suffix: 'M+', duration: 2000 },
            { element: this.statsNumbers[1], target: 30, suffix: '%', duration: 1500 },
            { element: this.statsNumbers[2], target: 95, suffix: '%', duration: 1800 }
        ];
        
        statsData.forEach(({ element, target, suffix, duration }) => {
            if (!element) return;
            
            this.animateNumber(element, 0, target, duration, suffix);
        });
    }
    
    /**
     * Animate number counting effect
     */
    animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        const isDecimal = end % 1 !== 0;
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOut;
            
            if (isDecimal) {
                element.textContent = `$${current.toFixed(1)}${suffix}`;
            } else {
                element.textContent = `${Math.floor(current)}${suffix}`;
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
    
    /**
     * Animate chart bars
     */
    animateChartBars() {
        this.chartBars.forEach((bar, index) => {
            setTimeout(() => {
                bar.style.animation = 'barGrow 1s ease-out forwards';
            }, index * 100);
        });
    }
    
    /**
     * Initialize floating cards
     */
    initializeFloatingCards() {
        this.floatingCards.forEach((card, index) => {
            // Set initial animation delay
            card.style.animationDelay = `${index}s`;
            
            // Add hover transform origin
            card.style.transformOrigin = 'center center';
        });
    }
    
    /**
     * Start floating cards animation
     */
    startFloatingCardsAnimation() {
        this.floatingCards.forEach((card, index) => {
            // Stagger the start of animations
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 500 + (index * 200));
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
            card.style.transform = 'translateY(-15px) scale(1.08)';
            card.style.boxShadow = 'var(--shadow-2xl)';
            card.style.zIndex = '20';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = 'var(--shadow-lg)';
            card.style.zIndex = '10';
        }
    }
    
    /**
     * Handle parallax scroll effect
     */
    handleParallaxScroll() {
        if (!this.heroWrapper) return;
        
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Move background elements
        const heroBackground = this.heroWrapper.querySelector('.hero-background');
        if (heroBackground) {
            heroBackground.style.transform = `translateY(${rate}px)`;
        }
        
        // Move floating cards with different rates
        this.floatingCards.forEach((card, index) => {
            const cardRate = scrolled * (-0.2 - (index * 0.1));
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
            button: 'get_demo',
            location: 'hero_section',
            timestamp: Date.now()
        });
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
                event_label: data.button || data.section,
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
            statsAnimated: this.statsAnimated,
            floatingCardsCount: this.floatingCards.length,
            scrollPosition: window.pageYOffset
        };
    }
    
    /**
     * Public API for external access
     */
    getAPI() {
        return {
            scrollToNext: this.scrollToNextSection.bind(this),
            getMetrics: this.getMetrics.bind(this),
            trackConversion: this.trackHeroConversion.bind(this)
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