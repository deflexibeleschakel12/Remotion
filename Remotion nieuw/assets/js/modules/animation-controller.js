/**
 * Animation Controller Module
 * Handles scroll animations, page transitions, loading states, and micro-interactions
 * @version 1.0.0
 */

export default class AnimationController {
    constructor() {
        this.animations = new Map();
        this.observers = new Map();
        this.animationQueue = [];
        this.isReducedMotion = false;
        this.performanceMode = 'auto'; // auto, performance, quality
        
        // Animation presets
        this.presets = {
            fadeIn: {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0px)' },
                duration: 600,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            },
            slideInLeft: {
                from: { opacity: 0, transform: 'translateX(-30px)' },
                to: { opacity: 1, transform: 'translateX(0px)' },
                duration: 500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
            slideInRight: {
                from: { opacity: 0, transform: 'translateX(30px)' },
                to: { opacity: 1, transform: 'translateX(0px)' },
                duration: 500,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            },
            scaleIn: {
                from: { opacity: 0, transform: 'scale(0.8)' },
                to: { opacity: 1, transform: 'scale(1)' },
                duration: 400,
                easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            },
            bounceIn: {
                from: { opacity: 0, transform: 'scale(0.3)' },
                to: { opacity: 1, transform: 'scale(1)' },
                duration: 700,
                easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            },
            pulse: {
                keyframes: [
                    { transform: 'scale(1)', opacity: 1 },
                    { transform: 'scale(1.05)', opacity: 0.8 },
                    { transform: 'scale(1)', opacity: 1 }
                ],
                duration: 1000,
                easing: 'ease-in-out',
                iterations: Infinity
            }
        };
        
        // Loading states
        this.loadingStates = {
            spinner: this.createSpinner.bind(this),
            skeleton: this.createSkeleton.bind(this),
            progress: this.createProgressBar.bind(this),
            dots: this.createLoadingDots.bind(this)
        };
        
        // Performance monitoring
        this.performanceMetrics = {
            animationCount: 0,
            averageFrameTime: 0,
            droppedFrames: 0,
            lastFrameTime: 0
        };
        
        // Bind methods
        this.handleScroll = this.throttle(this.handleScroll.bind(this), 16);
        this.handleResize = this.debounce(this.handleResize.bind(this), 250);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }
    
    /**
     * Initialize the animation controller
     */
    async init() {
        try {
            // Detect reduced motion preference
            this.detectReducedMotion();
            
            // Setup performance monitoring
            this.setupPerformanceMonitoring();
            
            // Setup scroll animations
            this.setupScrollAnimations();
            
            // Setup page transition listeners
            this.setupPageTransitions();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Apply initial animations
            this.applyInitialAnimations();
            
            console.log('🎬 Animation Controller initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Animation Controller:', error);
            return false;
        }
    }
    
    /**
     * Detect reduced motion preference
     */
    detectReducedMotion() {
        if (window.matchMedia) {
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            this.isReducedMotion = reducedMotionQuery.matches;
            
            reducedMotionQuery.addEventListener('change', (e) => {
                this.isReducedMotion = e.matches;
                this.updateAnimationsForMotionPreference();
            });
        }
    }
    
    /**
     * Setup scroll-based animations using IntersectionObserver
     */
    setupScrollAnimations() {
        const observerOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.1
        };
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        this.observers.set('scroll', scrollObserver);
        
        // Find elements with animation attributes
        this.observeElementsForScroll();
    }
    
    /**
     * Observe elements for scroll animations
     */
    observeElementsForScroll() {
        const animatedElements = document.querySelectorAll([
            '[data-animate]',
            '.portal-card',
            '.workflow-step',
            '.stat-item',
            '.footer-section'
        ].join(','));
        
        animatedElements.forEach((element, index) => {
            // Add stagger delay
            if (!element.dataset.delay) {
                element.dataset.delay = (index * 100).toString();
            }
            
            // Set default animation if not specified
            if (!element.dataset.animate) {
                element.dataset.animate = 'fadeIn';
            }
            
            // Prepare element for animation
            this.prepareElementForAnimation(element);
            
            // Observe for intersection
            this.observers.get('scroll').observe(element);
        });
    }
    
    /**
     * Prepare element for animation
     * @param {HTMLElement} element - Element to prepare
     */
    prepareElementForAnimation(element) {
        const animationType = element.dataset.animate || 'fadeIn';
        const preset = this.presets[animationType];
        
        if (preset && preset.from) {
            // Apply initial state
            Object.assign(element.style, {
                opacity: preset.from.opacity || '1',
                transform: preset.from.transform || 'none',
                willChange: 'transform, opacity'
            });
        }
    }
    
    /**
     * Animate an element
     * @param {HTMLElement} element - Element to animate
     * @param {string} animationType - Type of animation
     * @param {Object} options - Animation options
     */
    animateElement(element, animationType = null, options = {}) {
        if (this.isReducedMotion && !options.forceAnimation) {
            // Just show the element without animation
            element.style.opacity = '1';
            element.style.transform = 'none';
            return Promise.resolve();
        }
        
        const type = animationType || element.dataset.animate || 'fadeIn';
        const preset = { ...this.presets[type], ...options };
        const delay = parseInt(element.dataset.delay || '0');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                this.performAnimation(element, preset).then(resolve);
            }, delay);
        });
    }
    
    /**
     * Perform animation using Web Animations API
     * @param {HTMLElement} element - Element to animate
     * @param {Object} preset - Animation preset
     */
    performAnimation(element, preset) {
        return new Promise((resolve) => {
            // Use keyframes if available, otherwise create from/to
            const keyframes = preset.keyframes || [preset.from, preset.to];
            
            const options = {
                duration: preset.duration || 600,
                easing: preset.easing || 'ease',
                fill: 'forwards',
                iterations: preset.iterations || 1
            };
            
            // Start performance measurement
            const animationId = this.generateAnimationId();
            this.startPerformanceMeasurement(animationId);
            
            try {
                const animation = element.animate(keyframes, options);
                this.animations.set(animationId, animation);
                
                animation.addEventListener('finish', () => {
                    this.endPerformanceMeasurement(animationId);
                    element.style.willChange = 'auto';
                    this.animations.delete(animationId);
                    resolve();
                });
                
                animation.addEventListener('cancel', () => {
                    this.endPerformanceMeasurement(animationId);
                    this.animations.delete(animationId);
                    resolve();
                });
                
            } catch (error) {
                console.warn('Animation failed:', error);
                // Fallback to CSS transition
                this.fallbackCSSAnimation(element, preset);
                resolve();
            }
        });
    }
    
    /**
     * Fallback CSS animation for older browsers
     * @param {HTMLElement} element - Element to animate
     * @param {Object} preset - Animation preset
     */
    fallbackCSSAnimation(element, preset) {
        element.style.transition = `all ${preset.duration}ms ${preset.easing}`;
        
        requestAnimationFrame(() => {
            if (preset.to) {
                Object.assign(element.style, preset.to);
            }
        });
    }
    
    /**
     * Create loading spinner
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Spinner options
     */
    createSpinner(container, options = {}) {
        const spinner = document.createElement('div');
        spinner.className = `loading-spinner ${options.className || ''}`;
        spinner.innerHTML = `
            <div class="spinner-ring"></div>
            ${options.text ? `<p class="spinner-text">${options.text}</p>` : ''}
        `;
        
        // Add CSS if not exists
        this.addSpinnerCSS();
        
        if (options.overlay) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.appendChild(spinner);
            container.appendChild(overlay);
            return overlay;
        }
        
        container.appendChild(spinner);
        return spinner;
    }
    
    /**
     * Create skeleton loader
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Skeleton options
     */
    createSkeleton(container, options = {}) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader';
        
        const lines = options.lines || 3;
        for (let i = 0; i < lines; i++) {
            const line = document.createElement('div');
            line.className = 'skeleton-line';
            if (i === lines - 1 && options.lastLineShort) {
                line.style.width = '60%';
            }
            skeleton.appendChild(line);
        }
        
        // Add CSS if not exists
        this.addSkeletonCSS();
        
        container.appendChild(skeleton);
        return skeleton;
    }
    
    /**
     * Create progress bar
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Progress bar options
     */
    createProgressBar(container, options = {}) {
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = `
            <div class="progress-track">
                <div class="progress-fill" style="width: ${options.progress || 0}%"></div>
            </div>
            ${options.showText ? `<span class="progress-text">${options.progress || 0}%</span>` : ''}
        `;
        
        // Add CSS if not exists
        this.addProgressBarCSS();
        
        container.appendChild(progressBar);
        return progressBar;
    }
    
    /**
     * Create loading dots
     * @param {HTMLElement} container - Container element
     * @param {Object} options - Loading dots options
     */
    createLoadingDots(container, options = {}) {
        const dots = document.createElement('div');
        dots.className = 'loading-dots';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-dot';
            dot.style.animationDelay = `${i * 0.2}s`;
            dots.appendChild(dot);
        }
        
        // Add CSS if not exists
        this.addLoadingDotsCSS();
        
        container.appendChild(dots);
        return dots;
    }
    
    /**
     * Page transition animations
     * @param {string} direction - Transition direction (in/out)
     * @param {HTMLElement} element - Element to transition
     */
    pageTransition(direction = 'in', element = document.body) {
        const transitions = {
            in: {
                from: { opacity: 0, transform: 'translateY(20px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
                duration: 500
            },
            out: {
                from: { opacity: 1, transform: 'translateY(0)' },
                to: { opacity: 0, transform: 'translateY(-20px)' },
                duration: 300
            }
        };
        
        return this.performAnimation(element, transitions[direction]);
    }
    
    /**
     * Stagger animations for multiple elements
     * @param {NodeList|Array} elements - Elements to animate
     * @param {Object} options - Animation options
     */
    staggerAnimation(elements, options = {}) {
        const staggerDelay = options.staggerDelay || 100;
        const promises = [];
        
        elements.forEach((element, index) => {
            const delay = index * staggerDelay;
            const promise = new Promise(resolve => {
                setTimeout(() => {
                    this.animateElement(element, options.animation, options).then(resolve);
                }, delay);
            });
            promises.push(promise);
        });
        
        return Promise.all(promises);
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    if (entry.entryType === 'measure') {
                        this.updatePerformanceMetrics(entry);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['measure'] });
        }
        
        // Monitor frame rate
        this.monitorFrameRate();
    }
    
    /**
     * Monitor frame rate for performance optimization
     */
    monitorFrameRate() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const measureFrame = (currentTime) => {
            frameCount++;
            
            if (frameCount % 60 === 0) { // Check every 60 frames
                const deltaTime = currentTime - lastTime;
                const fps = 60000 / deltaTime;
                
                // Adjust performance mode based on FPS
                if (fps < 30 && this.performanceMode !== 'performance') {
                    this.performanceMode = 'performance';
                    this.optimizeForPerformance();
                } else if (fps > 50 && this.performanceMode !== 'quality') {
                    this.performanceMode = 'quality';
                }
                
                lastTime = currentTime;
            }
            
            requestAnimationFrame(measureFrame);
        };
        
        requestAnimationFrame(measureFrame);
    }
    
    /**
     * Optimize animations for performance
     */
    optimizeForPerformance() {
        // Reduce animation durations
        Object.keys(this.presets).forEach(key => {
            this.presets[key].duration *= 0.7;
        });
        
        // Cancel non-essential animations
        this.animations.forEach(animation => {
            if (animation.effect && animation.effect.target) {
                const element = animation.effect.target;
                if (!element.dataset.essential) {
                    animation.cancel();
                }
            }
        });
        
        console.log('🚀 Animation Controller optimized for performance');
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        window.addEventListener('resize', this.handleResize);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Listen for theme changes to update animations
        document.addEventListener('theme:changed', () => {
            this.updateAnimationsForTheme();
        });
    }
    
    /**
     * Apply initial animations on page load
     */
    applyInitialAnimations() {
        // Animate header stats
        const statItems = document.querySelectorAll('.stat-item');
        if (statItems.length > 0) {
            setTimeout(() => {
                this.staggerAnimation(statItems, {
                    animation: 'fadeIn',
                    staggerDelay: 200
                });
            }, 500);
        }
        
        // Animate logo
        const logo = document.querySelector('.logo');
        if (logo) {
            this.animateElement(logo, 'scaleIn');
        }
    }
    
    /**
     * Utility: Throttle function
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
     * Utility: Debounce function
     */
    debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }
    
    /**
     * Generate unique animation ID
     */
    generateAnimationId() {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Start performance measurement
     */
    startPerformanceMeasurement(animationId) {
        if ('performance' in window) {
            performance.mark(`${animationId}_start`);
        }
    }
    
    /**
     * End performance measurement
     */
    endPerformanceMeasurement(animationId) {
        if ('performance' in window) {
            performance.mark(`${animationId}_end`);
            performance.measure(`${animationId}_duration`, `${animationId}_start`, `${animationId}_end`);
        }
    }
    
    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(entry) {
        this.performanceMetrics.animationCount++;
        this.performanceMetrics.averageFrameTime = 
            (this.performanceMetrics.averageFrameTime + entry.duration) / 2;
    }
    
    /**
     * Handle scroll events
     */
    handleScroll() {
        // Custom scroll handling if needed
    }
    
    /**
     * Handle resize events
     */
    handleResize() {
        // Re-observe elements if needed
        this.observeElementsForScroll();
    }
    
    /**
     * Handle visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Pause animations when page is hidden
            this.pauseAllAnimations();
        } else {
            // Resume animations when page is visible
            this.resumeAllAnimations();
        }
    }
    
    /**
     * Update animations for motion preference
     */
    updateAnimationsForMotionPreference() {
        if (this.isReducedMotion) {
            // Disable or simplify animations
            Object.keys(this.presets).forEach(key => {
                this.presets[key].duration = 0;
            });
        }
    }
    
    /**
     * Update animations for theme changes
     */
    updateAnimationsForTheme() {
        // Refresh scroll observer for theme-specific animations
        this.observeElementsForScroll();
    }
    
    /**
     * Pause all running animations
     */
    pauseAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.playState === 'running') {
                animation.pause();
            }
        });
    }
    
    /**
     * Resume all paused animations
     */
    resumeAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.playState === 'paused') {
                animation.play();
            }
        });
    }
    
    /**
     * Add spinner CSS
     */
    addSpinnerCSS() {
        if (document.querySelector('#spinner-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'spinner-styles';
        style.textContent = `
            .loading-spinner { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
            .spinner-ring { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff; border-radius: 50%; animation: spin 1s linear infinite; }
            .spinner-text { font-size: 0.9rem; opacity: 0.8; }
            @keyframes spin { to { transform: rotate(360deg); } }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add skeleton CSS
     */
    addSkeletonCSS() {
        if (document.querySelector('#skeleton-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            .skeleton-loader { padding: 1rem; }
            .skeleton-line { height: 1rem; background: linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%); background-size: 200% 100%; animation: skeleton-pulse 1.5s ease-in-out infinite; margin-bottom: 0.5rem; border-radius: 4px; }
            @keyframes skeleton-pulse { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add progress bar CSS
     */
    addProgressBarCSS() {
        if (document.querySelector('#progress-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'progress-styles';
        style.textContent = `
            .progress-bar { display: flex; align-items: center; gap: 1rem; }
            .progress-track { flex: 1; height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden; }
            .progress-fill { height: 100%; background: linear-gradient(90deg, #4F46E5, #7C3AED); transition: width 0.3s ease; }
            .progress-text { font-size: 0.9rem; min-width: 3rem; text-align: right; }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Add loading dots CSS
     */
    addLoadingDotsCSS() {
        if (document.querySelector('#dots-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'dots-styles';
        style.textContent = `
            .loading-dots { display: flex; gap: 0.5rem; justify-content: center; }
            .loading-dot { width: 8px; height: 8px; background: #fff; border-radius: 50%; animation: dot-bounce 1.4s ease-in-out infinite both; }
            @keyframes dot-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return { ...this.performanceMetrics };
    }
    
    /**
     * Destroy the animation controller
     */
    destroy() {
        // Cancel all running animations
        this.animations.forEach(animation => animation.cancel());
        this.animations.clear();
        
        // Disconnect observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Remove event listeners
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        console.log('🎬 Animation Controller destroyed');
    }
}

// Export for ES6 module usage
// Usage: import AnimationController from './animation-controller.js';
