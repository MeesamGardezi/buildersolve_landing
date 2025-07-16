/**
 * Simple Dashboard Showcase Carousel - 2 Slides
 * Auto-scrolling every 4 seconds, pause on hover
 */

class SimpleDashboardShowcase {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 2;
        this.autoScrollInterval = 4000; // 4 seconds
        this.isPlaying = true;
        this.isPaused = false;
        this.timer = null;
        
        this.track = null;
        this.dots = null;
        this.carousel = null;
        
        this.init();
    }

    init() {
        // Wait a bit for content to load
        setTimeout(() => {
            this.setupElements();
            if (this.track) {
                this.setupEvents();
                this.startAutoScroll();
                console.log('✅ Simple carousel initialized');
            } else {
                console.log('⚠️ Carousel elements not found');
            }
        }, 500);
    }

    setupElements() {
        this.carousel = document.querySelector('.dashboard-carousel');
        this.track = document.querySelector('.carousel-track');
        this.dots = document.querySelectorAll('.carousel-dot');
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        
        console.log('🔍 Found elements:', {
            carousel: !!this.carousel,
            track: !!this.track,
            dots: this.dots.length,
            buttons: !!(this.prevBtn && this.nextBtn)
        });
    }

    setupEvents() {
        // Hover pause/resume
        if (this.carousel) {
            this.carousel.addEventListener('mouseenter', () => {
                this.isPaused = true;
                this.carousel.classList.add('paused');
                console.log('⏸️ Paused on hover');
            });
            
            this.carousel.addEventListener('mouseleave', () => {
                this.isPaused = false;
                this.carousel.classList.remove('paused');
                console.log('▶️ Resumed on leave');
            });
        }

        // Dot clicks
        this.dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.restartAutoScroll();
            });
        });

        // Button clicks
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
                this.restartAutoScroll();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
                this.restartAutoScroll();
            });
        }
    }

    goToSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;
        
        this.currentSlide = index;
        
        // Move the track
        const translateX = -(index * 50); // 50% for each of 2 slides
        this.track.style.transform = `translateX(${translateX}%)`;
        
        // Update dots
        this.updateDots();
        
        console.log(`📍 Moved to slide ${index + 1}`);
    }

    nextSlide() {
        const next = (this.currentSlide + 1) % this.totalSlides;
        this.goToSlide(next);
    }

    prevSlide() {
        const prev = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
        this.goToSlide(prev);
    }

    updateDots() {
        this.dots.forEach((dot, index) => {
            if (index === this.currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    startAutoScroll() {
        if (this.timer) return; // Already running
        
        this.timer = setInterval(() => {
            if (!this.isPaused && this.isPlaying) {
                this.nextSlide();
                console.log(`🔄 Auto-scrolled to slide ${this.currentSlide + 1}`);
            }
        }, this.autoScrollInterval);
        
        console.log('▶️ Auto-scroll started');
    }

    stopAutoScroll() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
            console.log('⏹️ Auto-scroll stopped');
        }
    }

    restartAutoScroll() {
        this.stopAutoScroll();
        this.startAutoScroll();
    }

    // Public API
    play() {
        this.isPlaying = true;
        this.startAutoScroll();
    }

    pause() {
        this.isPlaying = false;
        this.stopAutoScroll();
    }
}

// Initialize when ready
let showcaseInstance = null;

function initShowcase() {
    // Only initialize if we haven't already and the section exists
    if (!showcaseInstance && document.querySelector('.dashboard-showcase-wrapper')) {
        showcaseInstance = new SimpleDashboardShowcase();
        
        // Global access
        window.DashboardShowcase = {
            play: () => showcaseInstance.play(),
            pause: () => showcaseInstance.pause(),
            next: () => showcaseInstance.nextSlide(),
            prev: () => showcaseInstance.prevSlide()
        };
    }
}

// Try to initialize immediately
initShowcase();

// Also try when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShowcase);
} else {
    // DOM already ready, try again in case we missed it
    setTimeout(initShowcase, 100);
}

// Try again after a delay for dynamic content
setTimeout(initShowcase, 1000);

console.log('🚀 Dashboard showcase script loaded');