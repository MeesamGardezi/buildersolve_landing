/**
 * BuilderSolve Navigation Component
 * Handles mobile menu, smooth scrolling, active states, and scroll effects
 */

class Navigation {
    constructor() {
        this.navbar = null;
        this.mobileToggle = null;
        this.mobileMenu = null;
        this.navLinks = [];
        this.mobileNavLinks = [];
        this.isMobileMenuOpen = false;
        this.lastScrollY = 0;
        this.scrollThreshold = 50;
        
        this.init();
    }
    
    /**
     * Initialize navigation functionality
     */
    init() {
        // Wait for DOM to ensure navigation is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    /**
     * Setup navigation after DOM is ready
     */
    setup() {
        this.cacheElements();
        
        if (!this.navbar) {
            // Retry after a short delay if navbar not found
            setTimeout(() => this.setup(), 100);
            return;
        }
        
        this.bindEvents();
        this.handleInitialState();
        
        // ('✅ Navigation initialized successfully');
    }
    
    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.navbar = document.querySelector('.navbar');
        this.mobileToggle = document.querySelector('.mobile-menu-toggle');
        this.mobileMenu = document.querySelector('.mobile-menu');
        this.navLinks = Array.from(document.querySelectorAll('.nav-link'));
        this.mobileNavLinks = Array.from(document.querySelectorAll('.mobile-nav-link'));
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        if (!this.navbar) return;
        
        // Mobile menu toggle
        if (this.mobileToggle) {
            this.mobileToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        // Navigation link clicks
        [...this.navLinks, ...this.mobileNavLinks].forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });
        
        // Scroll events
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // 60fps
        
        // Close mobile menu on resize
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 1023 && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        }, 250));
        
        // Close mobile menu on outside click
        document.addEventListener('click', (e) => {
            if (this.isMobileMenuOpen && 
                !this.mobileMenu?.contains(e.target) && 
                !this.mobileToggle?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
        
        // Contact button clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-contact]')) {
                this.handleContactClick(e);
            }
        });
    }
    
    /**
     * Handle initial page state
     */
    handleInitialState() {
        this.updateActiveLinks();
        this.handleScroll();
    }
    
    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    /**
     * Open mobile menu
     */
    openMobileMenu() {
        if (!this.mobileMenu || !this.mobileToggle) return;
        
        this.isMobileMenuOpen = true;
        this.mobileMenu.classList.add('active');
        this.mobileToggle.setAttribute('aria-expanded', 'true');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first link for accessibility
        const firstLink = this.mobileMenu.querySelector('.mobile-nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        this.trackInteraction('mobile_menu_open');
    }
    
    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (!this.mobileMenu || !this.mobileToggle) return;
        
        this.isMobileMenuOpen = false;
        this.mobileMenu.classList.remove('active');
        this.mobileToggle.setAttribute('aria-expanded', 'false');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        this.trackInteraction('mobile_menu_close');
    }
    
    /**
     * Handle navigation link clicks
     */
    handleNavClick(e) {
        const link = e.currentTarget;
        const href = link.getAttribute('href');
        
        // Only handle internal links
        if (!href || !href.startsWith('#')) return;
        
        e.preventDefault();
        
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            // Close mobile menu if open
            if (this.isMobileMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Smooth scroll to target
            this.scrollToTarget(targetElement);
            
            // Track interaction
            this.trackInteraction('nav_click', targetId);
        }
    }
    
    /**
     * Handle contact button clicks
     */
    handleContactClick(e) {
        e.preventDefault();
        
        // Close mobile menu if open
        if (this.isMobileMenuOpen) {
            this.closeMobileMenu();
        }
        
        // Track contact button click
        this.trackInteraction('contact_click', 'navigation');
        
        // The main.js will handle opening the contact modal
        // ('📞 Contact button clicked from navigation');
    }
    
    /**
     * Smooth scroll to target element
     */
    scrollToTarget(targetElement) {
        const navHeight = this.navbar ? this.navbar.offsetHeight : 70;
        const targetPosition = targetElement.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
        });
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        const currentScrollY = window.pageYOffset;
        
        // Update navbar appearance on scroll
        this.updateNavbarOnScroll(currentScrollY);
        
        // Update active navigation links
        this.updateActiveLinks();
        
        this.lastScrollY = currentScrollY;
    }
    
    /**
     * Update navbar appearance based on scroll position
     */
    updateNavbarOnScroll(scrollY) {
        if (!this.navbar) return;
        
        if (scrollY > this.scrollThreshold) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }
    
    /**
     * Update active navigation links based on current section
     */
    updateActiveLinks() {
        const sections = document.querySelectorAll('.section[data-section]');
        const navHeight = this.navbar ? this.navbar.offsetHeight : 70;
        const scrollPos = window.pageYOffset + navHeight + 100;
        
        let activeSection = '';
        
        // Find current section
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos <= sectionBottom) {
                activeSection = section.getAttribute('data-section');
            }
        });
        
        // If no section found and we're at the top, default to hero
        if (!activeSection && window.pageYOffset < 100) {
            activeSection = 'hero';
        }
        
        // Update link states
        [...this.navLinks, ...this.mobileNavLinks].forEach(link => {
            const linkSection = link.getAttribute('data-section');
            
            if (linkSection === activeSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    /**
     * Track interactions for analytics
     */
    trackInteraction(action, section = null) {
        const data = {
            action,
            component: 'navigation',
            timestamp: Date.now()
        };
        
        if (section) {
            data.section = section;
        }
        
        // Send to analytics (placeholder)
        // ('📊 Navigation tracking:', data);
        
        // Example: Send to Google Analytics, Mixpanel, etc.
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: 'navigation',
                event_label: section
            });
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
     * Debounce function execution
     */
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    /**
     * Get current active section
     */
    getCurrentSection() {
        const activeLink = document.querySelector('.nav-link.active');
        return activeLink ? activeLink.getAttribute('data-section') : 'hero';
    }
    
    /**
     * Programmatically navigate to section
     */
    navigateToSection(sectionId) {
        const targetElement = document.getElementById(`${sectionId}-section`);
        if (targetElement) {
            this.scrollToTarget(targetElement);
        }
    }
    
    /**
     * Public API for external access
     */
    getAPI() {
        return {
            navigateToSection: this.navigateToSection.bind(this),
            getCurrentSection: this.getCurrentSection.bind(this),
            closeMobileMenu: this.closeMobileMenu.bind(this)
        };
    }
}

// Initialize navigation
const navigationInstance = new Navigation();

// Export for external access
if (typeof window !== 'undefined') {
    window.BuilderSolveNav = navigationInstance.getAPI();
}

// AMD/CommonJS support
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
} else if (typeof define === 'function' && define.amd) {
    define(function() {
        return Navigation;
    });
}