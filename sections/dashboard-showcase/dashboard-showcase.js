/**
 * BuilderSolve Video Showcase System - YouTube Integration
 * @version 4.0.0 - Complete rewrite with modern JavaScript and robust error handling
 */

class VideoShowcase {
    constructor(options = {}) {
        // Configuration
        this.config = {
            videoTransitionDelay: 300,
            loadingTimeout: 15000,
            retryAttempts: 3,
            retryDelay: 2000,
            autoplayVideos: false,
            debug: false,
            playerVars: {
                autoplay: 0,
                controls: 1,
                disablekb: 0,
                enablejsapi: 1,
                fs: 1,
                hl: 'en',
                iv_load_policy: 3,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0,
                origin: window.location.origin,
                cc_load_policy: 0
            },
            ...options
        };

        // Video configuration with real demo videos (replace with your actual video IDs)
        this.videoConfig = {
            videos: [
                {
                    id: 'estimate',
                    title: 'Estimate',
                    videoTitle: 'Smart Estimation Tools',
                    description: 'See how BuilderSolve\'s intelligent estimation system helps you create accurate project quotes with automated calculations and material tracking.',
                    youtubeId: 'QcWEWJXDFFE'
                },
                {
                    id: 'schedule',
                    title: 'Schedule',
                    videoTitle: 'Project Scheduling',
                    description: 'Discover our advanced scheduling features that help you coordinate teams, manage timelines, and keep projects on track with real-time updates.',
                    youtubeId: 'rLnr7VHSxM4'
                }
            ]
        };

        // State management
        this.state = {
            isInitialized: false,
            currentVideoIndex: 0,
            isVideoLoading: false,
            retryCount: 0,
            hasError: false,
            playerReady: false,
            apiLoading: false,
            apiReady: false
        };

        // DOM elements cache
        this.elements = {};
        
        // YouTube player instance
        this.player = null;
        
        // Timers and observers
        this.loadingTimeout = null;
        this.retryTimeout = null;
        this.intersectionObserver = null;
        
        // Bind methods to maintain context
        this.handleTabClick = this.handleTabClick.bind(this);
        this.handleTabKeydown = this.handleTabKeydown.bind(this);
        this.handleRetryClick = this.handleRetryClick.bind(this);
        this.onPlayerReady = this.onPlayerReady.bind(this);
        this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
        this.onPlayerError = this.onPlayerError.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }

    /**
     * Initialize the video showcase
     */
    async init() {
        this.log('🚀 VideoShowcase initialization started');
        
        try {
            // Wait for DOM to be ready
            await this.waitForDOMReady();
            
            // Cache and validate DOM elements
            if (!await this.cacheElements()) {
                throw new Error('Required elements not found or could not be created');
            }
            
            // Setup user interface
            this.setupUI();
            this.bindEvents();
            this.setupIntersectionObserver();
            
            // Load YouTube API and create player
            await this.loadYouTubeAPI();
            
            // Mark as initialized
            this.state.isInitialized = true;
            this.log('✅ VideoShowcase initialized successfully');
            
            // Announce to screen readers
            this.announceToScreenReader('Video showcase loaded and ready');
            
        } catch (error) {
            this.logError('❌ VideoShowcase initialization failed:', error);
            this.showError('Failed to initialize video player. Please refresh the page.');
        }
    }

    /**
     * Wait for DOM to be ready
     */
    waitForDOMReady() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            } else {
                // DOM is already ready
                setTimeout(resolve, 0);
            }
        });
    }

    /**
     * Cache and validate DOM elements
     */
    async cacheElements() {
        this.log('📦 Caching DOM elements...');
        
        // Find main section with fallbacks
        const sectionSelectors = [
            '#video-showcase-section',
            '#dashboard-showcase-section',
            '.video-showcase-wrapper',
            '.dashboard-showcase-wrapper'
        ];
        
        let section = null;
        for (const selector of sectionSelectors) {
            section = document.querySelector(selector);
            if (section) break;
        }
        
        // Create section if none found
        if (!section) {
            this.log('⚠️ No showcase section found, creating fallback...');
            section = await this.createFallbackStructure();
        }
        
        // Cache all elements
        this.elements = {
            section,
            container: section.querySelector('.container'),
            playerDiv: document.getElementById('youtube-player'),
            videoContainer: document.getElementById('video-container'),
            loadingOverlay: document.getElementById('loading-overlay'),
            errorOverlay: document.getElementById('error-overlay'),
            retryButton: document.getElementById('retry-btn'),
            videoTitle: document.getElementById('video-title'),
            videoDescription: document.getElementById('video-description'),
            videoInfo: document.getElementById('video-info'),
            tabs: Array.from(document.querySelectorAll('.video-tab')),
            tabsContainer: document.querySelector('.video-tabs'),
            announcements: document.getElementById('video-announcements'),
            fadeElements: Array.from(document.querySelectorAll('[data-fade]'))
        };

        // Validate critical elements
        const requiredElements = ['section', 'playerDiv', 'videoContainer'];
        for (const key of requiredElements) {
            if (!this.elements[key]) {
                this.logError(`❌ Critical element missing: ${key}`);
                return false;
            }
        }

        this.log('✅ Elements cached successfully:', {
            section: !!this.elements.section,
            playerDiv: !!this.elements.playerDiv,
            tabs: this.elements.tabs.length,
            hasLoadingOverlay: !!this.elements.loadingOverlay,
            hasErrorOverlay: !!this.elements.errorOverlay
        });

        return true;
    }

    /**
     * Create fallback structure if main elements are missing
     */
    async createFallbackStructure() {
        this.log('🔧 Creating fallback HTML structure...');
        
        const section = document.createElement('section');
        section.id = 'video-showcase-section';
        section.className = 'video-showcase-wrapper';
        section.setAttribute('role', 'region');
        section.setAttribute('aria-label', 'BuilderSolve Video Showcase');
        
        section.innerHTML = `
            <div class="video-background" aria-hidden="true">
                <div class="video-gradient"></div>
                <div class="video-pattern"></div>
            </div>
            <div class="container">
                <div class="video-showcase-content">
                    <header class="video-header" data-fade="up">
                        <h2 class="video-title">See BuilderSolve in Action</h2>
                        <p class="video-subtitle">
                            Experience the power of unified construction management through interactive demonstrations
                        </p>
                    </header>
                    <div class="video-player-container" data-fade="up" data-delay="200">
                        <div class="video-tabs-container">
                            <div class="video-tabs" role="tablist" aria-label="Video categories">
                                <button class="video-tab active" data-video-index="0" role="tab" aria-selected="true" id="tab-estimate" type="button">
                                    <span class="tab-icon">📊</span>
                                    <span class="tab-text">Estimate</span>
                                </button>
                                <button class="video-tab" data-video-index="1" role="tab" aria-selected="false" id="tab-schedule" type="button">
                                    <span class="tab-icon">📅</span>
                                    <span class="tab-text">Schedule</span>
                                </button>
                            </div>
                        </div>
                        <div class="video-player-wrapper">
                            <div class="video-player" role="region" aria-label="Video player" id="video-content">
                                <div class="video-container" id="video-container">
                                    <div id="youtube-player" class="youtube-player-div"></div>
                                    <div class="video-loading-overlay" id="loading-overlay" role="status" aria-label="Loading video">
                                        <div class="video-loading-spinner" aria-hidden="true">
                                            <div class="spinner-ring"></div>
                                        </div>
                                        <p class="loading-text">Loading video...</p>
                                    </div>
                                    <div class="video-error-overlay" id="error-overlay" role="alert">
                                        <div class="video-error-content">
                                            <div class="error-icon" aria-hidden="true">⚠️</div>
                                            <h3 class="error-title">Video Unavailable</h3>
                                            <p class="error-message">We're having trouble loading this video. Please try again.</p>
                                            <button class="retry-button" id="retry-btn" type="button">
                                                <span class="retry-icon" aria-hidden="true">🔄</span>
                                                <span>Try Again</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="video-info" id="video-info">
                                    <h3 class="video-current-title" id="video-title">Loading...</h3>
                                    <p class="video-current-description" id="video-description">Please wait while we load the video content...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="video-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div>
        `;
        
        // Insert at the end of body or after a specific element
        const targetElement = document.querySelector('main') || document.body;
        if (targetElement === document.body) {
            document.body.appendChild(section);
        } else {
            targetElement.appendChild(section);
        }
        
        this.log('✅ Fallback structure created successfully');
        return section;
    }

    /**
     * Setup user interface
     */
    setupUI() {
        this.log('🎨 Setting up UI...');
        
        // Update initial video info
        const firstVideo = this.videoConfig.videos[0];
        this.updateVideoInfo(firstVideo);
        
        // Setup fade animations
        this.setupAnimations();
        
        // Show loading initially
        this.showLoading();
        
        // Set initial tab states
        this.updateTabStates();
        
        this.log('✅ UI setup complete');
    }

    /**
     * Setup intersection observer for animations
     */
    setupIntersectionObserver() {
        if (!this.elements.section) return;

        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                        this.triggerFadeAnimations();
                        // Only observe once
                        this.intersectionObserver?.unobserve(entry.target);
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px 0px'
            }
        );

        this.intersectionObserver.observe(this.elements.section);
    }

    /**
     * Setup fade animations
     */
    setupAnimations() {
        // Mark elements for animation
        this.elements.fadeElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(2rem)';
        });
    }

    /**
     * Trigger fade animations
     */
    triggerFadeAnimations() {
        this.elements.fadeElements.forEach((el, i) => {
            const delay = parseInt(el.dataset.delay || 0) || i * 100;
            setTimeout(() => {
                el.style.transition = 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        });
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.log('🔗 Binding events...');
        
        // Tab navigation
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', this.handleTabClick);
            tab.addEventListener('keydown', this.handleTabKeydown);
        });

        // Retry button
        if (this.elements.retryButton) {
            this.elements.retryButton.addEventListener('click', this.handleRetryClick);
        }

        // Visibility change (pause video when tab is hidden)
        document.addEventListener('visibilitychange', this.handleVisibilityChange);

        // Keyboard navigation
        this.elements.section?.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.hasError) {
                this.hideError();
            }
        });

        this.log('✅ Events bound successfully');
    }

    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (!this.player || !this.state.playerReady) return;

        if (document.hidden) {
            // Page is hidden, pause video
            try {
                if (typeof this.player.pauseVideo === 'function') {
                    this.player.pauseVideo();
                }
            } catch (error) {
                this.logError('Error pausing video on visibility change:', error);
            }
        }
    }

    /**
     * Load YouTube API
     */
    async loadYouTubeAPI() {
        return new Promise((resolve, reject) => {
            this.log('📡 Loading YouTube API...');

            // Check if API is already loaded
            if (window.YT && window.YT.Player) {
                this.log('✅ YouTube API already available');
                this.state.apiReady = true;
                this.createPlayer();
                resolve();
                return;
            }

            // Check if API is currently loading
            if (this.state.apiLoading) {
                this.log('⏳ YouTube API already loading...');
                // Wait for it to finish
                const checkApiReady = setInterval(() => {
                    if (this.state.apiReady) {
                        clearInterval(checkApiReady);
                        resolve();
                    }
                }, 100);
                return;
            }

            this.state.apiLoading = true;

            // Setup global callback
            const originalCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                this.log('✅ YouTube API ready');
                this.state.apiReady = true;
                this.state.apiLoading = false;
                
                // Call original callback if it existed
                if (originalCallback && typeof originalCallback === 'function') {
                    try {
                        originalCallback();
                    } catch (error) {
                        this.logError('Error in original YouTube API callback:', error);
                    }
                }
                
                // Create our player
                this.createPlayer();
                resolve();
            };

            // Setup timeout
            const timeout = setTimeout(() => {
                this.state.apiLoading = false;
                reject(new Error('YouTube API load timeout'));
            }, this.config.loadingTimeout);

            // Load script if not already loading
            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                script.async = true;
                
                script.onload = () => {
                    this.log('📦 YouTube API script loaded');
                };
                
                script.onerror = () => {
                    clearTimeout(timeout);
                    this.state.apiLoading = false;
                    reject(new Error('Failed to load YouTube API script'));
                };
                
                // Insert script
                const firstScript = document.getElementsByTagName('script')[0];
                if (firstScript) {
                    firstScript.parentNode.insertBefore(script, firstScript);
                } else {
                    document.head.appendChild(script);
                }
                
                this.log('📤 YouTube API script requested');
            }
        });
    }

    /**
     * Create YouTube player
     */
    createPlayer() {
        if (!window.YT || !window.YT.Player) {
            this.logError('YouTube API not available');
            this.showError('YouTube API not available');
            return;
        }

        if (this.player) {
            this.log('Player already exists, skipping creation');
            return;
        }

        const firstVideo = this.videoConfig.videos[0];
        
        try {
            this.log('🎬 Creating YouTube player...');
            
            // Ensure player div exists and has correct ID
            if (!this.elements.playerDiv) {
                this.logError('Player div not found');
                this.showError('Player container not found');
                return;
            }

            // Clear any existing content
            this.elements.playerDiv.innerHTML = '';
            this.elements.playerDiv.id = 'youtube-player';

            // Create player with error handling
            this.player = new YT.Player('youtube-player', {
                height: '100%',
                width: '100%',
                videoId: firstVideo.youtubeId,
                playerVars: {
                    ...this.config.playerVars,
                    // Ensure we have the latest settings
                    enablejsapi: 1,
                    origin: window.location.origin
                },
                events: {
                    'onReady': this.onPlayerReady,
                    'onStateChange': this.onPlayerStateChange,
                    'onError': this.onPlayerError
                }
            });

            this.log('✅ YouTube player created successfully');
            
        } catch (error) {
            this.logError('❌ Failed to create YouTube player:', error);
            this.showError('Failed to create video player');
        }
    }

    /**
     * Handle player ready event
     */
    onPlayerReady(event) {
        this.log('✅ YouTube player ready');
        
        this.state.playerReady = true;
        this.hideLoading();
        this.hideError();
        this.state.retryCount = 0; // Reset retry count on success
        
        // Update tab states
        this.updateTabStates();
        
        // Announce to screen readers
        this.announceToScreenReader(`Video player ready. Now showing: ${this.videoConfig.videos[0].videoTitle}`);
        
        // Clear any loading timeouts
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
            this.loadingTimeout = null;
        }
    }

    /**
     * Handle player state change
     */
    onPlayerStateChange(event) {
        const states = {
            '-1': 'unstarted',
            '0': 'ended',
            '1': 'playing',
            '2': 'paused',
            '3': 'buffering',
            '5': 'cued'
        };

        const state = states[event.data] || 'unknown';
        this.log(`📹 Player state changed: ${state} (${event.data})`);

        switch (event.data) {
            case YT.PlayerState.PLAYING:
                this.hideLoading();
                this.state.isVideoLoading = false;
                this.state.hasError = false;
                break;
                
            case YT.PlayerState.BUFFERING:
                if (this.state.isVideoLoading) {
                    this.showLoading();
                }
                break;
                
            case YT.PlayerState.CUED:
                this.hideLoading();
                this.state.isVideoLoading = false;
                break;
                
            case YT.PlayerState.ENDED:
                // Optionally auto-switch to next video or show suggestions
                this.announceToScreenReader('Video playback finished');
                break;
        }
    }

    /**
     * Handle player error
     */
    onPlayerError(event) {
        const errors = {
            2: 'Invalid video ID or video not found',
            5: 'HTML5 player error - video cannot be played',
            100: 'Video not found or has been removed',
            101: 'Video cannot be embedded on this domain',
            150: 'Video cannot be embedded on this domain'
        };

        const errorMsg = errors[event.data] || `Unknown player error (${event.data})`;
        this.logError(`❌ YouTube player error: ${errorMsg}`);
        
        this.showError(errorMsg);
        this.state.hasError = true;
        
        // Announce error to screen readers
        this.announceToScreenReader(`Video error: ${errorMsg}`);
    }

    /**
     * Handle tab click
     */
    handleTabClick(event) {
        event.preventDefault();
        
        const index = parseInt(event.currentTarget.dataset.videoIndex);
        if (isNaN(index) || index === this.state.currentVideoIndex) {
            return;
        }
        
        this.switchToVideo(index);
    }

    /**
     * Handle tab keyboard navigation
     */
    handleTabKeydown(event) {
        const tabs = this.elements.tabs;
        const currentIndex = tabs.indexOf(event.target);
        let newIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowLeft':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                break;
                
            case 'ArrowRight':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                break;
                
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
                
            case 'End':
                event.preventDefault();
                newIndex = tabs.length - 1;
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.handleTabClick(event);
                return;
                
            default:
                return;
        }
        
        tabs[newIndex].focus();
    }

    /**
     * Handle retry button click
     */
    handleRetryClick(event) {
        event.preventDefault();
        this.retry();
    }

    /**
     * Switch to a specific video
     */
    switchToVideo(index) {
        if (!this.state.playerReady || !this.player) {
            this.log('⚠️ Cannot switch video: player not ready');
            return;
        }

        const video = this.videoConfig.videos[index];
        if (!video) {
            this.logError(`Video at index ${index} not found`);
            return;
        }

        this.log(`🎯 Switching to video: ${video.title} (${video.youtubeId})`);
        
        // Update state
        this.state.currentVideoIndex = index;
        this.state.isVideoLoading = true;
        this.state.hasError = false;
        
        // Update UI
        this.updateTabStates();
        this.updateVideoInfo(video);
        this.showLoading();
        
        // Load new video with error handling
        try {
            this.player.loadVideoById({
                videoId: video.youtubeId,
                startSeconds: 0
            });
            
            // Set a timeout for loading
            if (this.loadingTimeout) {
                clearTimeout(this.loadingTimeout);
            }
            
            this.loadingTimeout = setTimeout(() => {
                if (this.state.isVideoLoading) {
                    this.showError('Video is taking too long to load. Please try again.');
                }
            }, this.config.loadingTimeout);
            
            // Announce to screen readers
            this.announceToScreenReader(`Loading ${video.videoTitle}`);
            
        } catch (error) {
            this.logError('Failed to load video:', error);
            this.showError('Failed to load video. Please try again.');
        }
    }

    /**
     * Update tab visual states
     */
    updateTabStates() {
        this.elements.tabs.forEach((tab, index) => {
            const isActive = index === this.state.currentVideoIndex;
            
            // Update classes
            tab.classList.toggle('active', isActive);
            
            // Update ARIA attributes
            tab.setAttribute('aria-selected', isActive.toString());
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        });
    }

    /**
     * Update video information display
     */
    updateVideoInfo(video) {
        if (this.elements.videoTitle) {
            this.elements.videoTitle.textContent = video.videoTitle;
        }
        
        if (this.elements.videoDescription) {
            this.elements.videoDescription.textContent = video.description;
        }
        
        // Update page title if desired
        if (document.title.includes('BuilderSolve')) {
            document.title = `${video.videoTitle} - BuilderSolve Video Showcase`;
        }
    }

    /**
     * Show loading overlay
     */
    showLoading() {
        if (!this.elements.loadingOverlay) return;
        
        this.elements.loadingOverlay.classList.remove('hidden');
        this.elements.loadingOverlay.setAttribute('aria-hidden', 'false');
        
        // Update loading text if needed
        const loadingText = this.elements.loadingOverlay.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Loading video...';
        }
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        if (!this.elements.loadingOverlay) return;
        
        this.elements.loadingOverlay.classList.add('hidden');
        this.elements.loadingOverlay.setAttribute('aria-hidden', 'true');
    }

    /**
     * Show error overlay
     */
    showError(message = 'An error occurred') {
        this.hideLoading();
        
        if (!this.elements.errorOverlay) return;
        
        // Update error message
        const errorMessageEl = this.elements.errorOverlay.querySelector('.error-message');
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
        }
        
        // Show overlay
        this.elements.errorOverlay.classList.add('show');
        this.elements.errorOverlay.style.display = 'flex';
        this.elements.errorOverlay.setAttribute('aria-hidden', 'false');
        
        // Focus retry button for accessibility
        setTimeout(() => {
            const retryBtn = this.elements.errorOverlay.querySelector('.retry-button');
            if (retryBtn) {
                retryBtn.focus();
            }
        }, 100);
    }

    /**
     * Hide error overlay
     */
    hideError() {
        if (!this.elements.errorOverlay) return;
        
        this.elements.errorOverlay.classList.remove('show');
        this.elements.errorOverlay.style.display = 'none';
        this.elements.errorOverlay.setAttribute('aria-hidden', 'true');
        this.state.hasError = false;
    }

    /**
     * Retry loading
     */
    retry() {
        if (this.state.retryCount >= this.config.retryAttempts) {
            this.logError('Max retry attempts reached');
            this.showError('Maximum retry attempts reached. Please refresh the page.');
            return;
        }

        this.state.retryCount++;
        this.log(`🔄 Retry attempt ${this.state.retryCount} of ${this.config.retryAttempts}`);
        
        this.hideError();
        this.showLoading();
        this.announceToScreenReader(`Retrying video load, attempt ${this.state.retryCount}`);
        
        // Clean up existing player
        if (this.player) {
            try {
                this.player.destroy();
            } catch (error) {
                this.logError('Error destroying player during retry:', error);
            }
            this.player = null;
            this.state.playerReady = false;
        }

        // Reset player div
        if (this.elements.playerDiv) {
            this.elements.playerDiv.innerHTML = '';
            this.elements.playerDiv.id = 'youtube-player';
        }

        // Retry after delay
        this.retryTimeout = setTimeout(() => {
            this.createPlayer();
        }, this.config.retryDelay);
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        if (!this.elements.announcements) return;
        
        this.elements.announcements.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            if (this.elements.announcements) {
                this.elements.announcements.textContent = '';
            }
        }, 1000);
    }

    /**
     * Logging utility
     */
    log(...args) {
        if (this.config.debug || window.location.hostname === 'localhost') {
            console.log('[VideoShowcase]', ...args);
        }
    }

    /**
     * Error logging utility
     */
    logError(...args) {
        console.error('[VideoShowcase]', ...args);
    }

    /**
     * Get current video info
     */
    getCurrentVideo() {
        return this.videoConfig.videos[this.state.currentVideoIndex];
    }

    /**
     * Check if player is ready
     */
    isPlayerReady() {
        return this.state.playerReady && this.player && typeof this.player.playVideo === 'function';
    }

    /**
     * Public API methods
     */
    play() {
        if (this.isPlayerReady()) {
            try {
                this.player.playVideo();
            } catch (error) {
                this.logError('Error playing video:', error);
            }
        }
    }

    pause() {
        if (this.isPlayerReady()) {
            try {
                this.player.pauseVideo();
            } catch (error) {
                this.logError('Error pausing video:', error);
            }
        }
    }

    /**
     * Cleanup and destroy
     */
    destroy() {
        this.log('🧹 Destroying VideoShowcase...');
        
        // Clean up timers
        if (this.loadingTimeout) clearTimeout(this.loadingTimeout);
        if (this.retryTimeout) clearTimeout(this.retryTimeout);
        
        // Clean up observers
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        // Remove event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Destroy player
        if (this.player) {
            try {
                this.player.destroy();
            } catch (error) {
                this.logError('Error destroying player:', error);
            }
        }
        
        // Clear references
        this.player = null;
        this.elements = {};
        this.state.isInitialized = false;
        
        this.log('✅ VideoShowcase destroyed');
    }
}

// Auto-initialization with robust timing
class VideoShowcaseInitializer {
    constructor() {
        this.instance = null;
        this.initPromise = null;
    }

    async init() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._performInit();
        return this.initPromise;
    }

    async _performInit() {
        try {
            console.log('[VideoShowcase] Initializing...');
            
            // Create instance
            this.instance = new VideoShowcase({
                debug: window.location.hostname === 'localhost'
            });
            
            // Initialize
            await this.instance.init();
            
            // Export to global scope
            window.videoShowcase = this.instance;
            window.VideoPlayer = {
                play: () => this.instance.play(),
                pause: () => this.instance.pause(),
                switchTo: (index) => this.instance.switchToVideo(index),
                getCurrentIndex: () => this.instance.state.currentVideoIndex,
                isReady: () => this.instance.isPlayerReady(),
                getInstance: () => this.instance
            };
            
            console.log('[VideoShowcase] ✅ Initialization complete and API exported');
            return this.instance;
            
        } catch (error) {
            console.error('[VideoShowcase] ❌ Initialization failed:', error);
            throw error;
        }
    }

    getInstance() {
        return this.instance;
    }
}

// Initialize when DOM is ready
const initializer = new VideoShowcaseInitializer();

// Multiple initialization strategies for maximum compatibility
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => initializer.init(), 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => initializer.init(), 100);
}

// Backup initialization on window load
window.addEventListener('load', () => {
    if (!initializer.getInstance()) {
        console.log('[VideoShowcase] Backup initialization triggered');
        setTimeout(() => initializer.init(), 200);
    }
});

// Export for manual initialization if needed
window.initVideoShowcase = () => initializer.init();
window.VideoShowcaseClass = VideoShowcase;