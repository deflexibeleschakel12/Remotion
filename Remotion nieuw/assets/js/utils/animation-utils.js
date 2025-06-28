/**
 * Animation Utility Functions
 * Helper functions for common animation tasks
 * @version 1.0.0
 */

/**
 * Create a loading state for buttons
 * @param {HTMLButtonElement} button - Button element
 * @param {string} originalText - Original button text
 * @returns {Function} Function to restore button state
 */
export function createButtonLoading(button, originalText = null) {
    const text = originalText || button.textContent;
    const wasDisabled = button.disabled;
    
    button.innerHTML = '<div class="btn-spinner"></div>';
    button.disabled = true;
    
    return () => {
        button.textContent = text;
        button.disabled = wasDisabled;
    };
}

/**
 * Animate number counting
 * @param {HTMLElement} element - Element to animate
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Animation duration in ms
 * @param {Object} options - Additional options
 */
export function animateCounter(element, start, end, duration, options = {}) {
    const startTime = performance.now();
    const easing = options.easing || ((t) => 1 - Math.pow(1 - t, 3)); // easeOutCubic
    const formatter = options.formatter || ((n) => n.toLocaleString('nl-NL'));
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easedProgress = easing(progress);
        const current = Math.floor(start + (end - start) * easedProgress);
        
        element.textContent = formatter(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else if (options.onComplete) {
            options.onComplete();
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Create a staggered animation for multiple elements
 * @param {NodeList|Array} elements - Elements to animate
 * @param {string} animation - Animation type
 * @param {number} staggerDelay - Delay between animations
 * @param {Object} options - Animation options
 */
export function staggerElements(elements, animation = 'fadeIn', staggerDelay = 100, options = {}) {
    if (!window.animationController) {
        console.warn('Animation Controller not available');
        return;
    }
    
    const promises = [];
    
    elements.forEach((element, index) => {
        const delay = index * staggerDelay;
        element.dataset.animate = animation;
        element.dataset.delay = delay.toString();
        
        const promise = new Promise(resolve => {
            setTimeout(() => {
                window.animationController.animateElement(element, animation, options).then(resolve);
            }, delay);
        });
        
        promises.push(promise);
    });
    
    return Promise.all(promises);
}

/**
 * Pulse animation for elements
 * @param {HTMLElement} element - Element to pulse
 * @param {number} duration - Pulse duration
 * @param {number} iterations - Number of pulses
 */
export function pulseElement(element, duration = 1000, iterations = 3) {
    if (!window.animationController) {
        element.style.animation = `pulse ${duration}ms ease-in-out ${iterations}`;
        return;
    }
    
    const pulsePreset = {
        keyframes: [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.05)', opacity: 0.8 },
            { transform: 'scale(1)', opacity: 1 }
        ],
        duration,
        iterations,
        easing: 'ease-in-out'
    };
    
    return window.animationController.performAnimation(element, pulsePreset);
}

/**
 * Shake animation for error states
 * @param {HTMLElement} element - Element to shake
 */
export function shakeElement(element) {
    const shakeKeyframes = [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-5px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0)' }
    ];
    
    if (element.animate) {
        return element.animate(shakeKeyframes, {
            duration: 500,
            easing: 'ease-out'
        });
    } else {
        // Fallback for older browsers
        element.style.animation = 'shake 0.5s ease-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} target - Target element or selector
 * @param {Object} options - Scroll options
 */
export function smoothScrollTo(target, options = {}) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;
    
    const offset = options.offset || 0;
    const duration = options.duration || 800;
    const easing = options.easing || ((t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    
    const startPosition = window.pageYOffset;
    const targetPosition = element.getBoundingClientRect().top + startPosition - offset;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();
    
    function scrollStep(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        window.scrollTo(0, startPosition + distance * easedProgress);
        
        if (progress < 1) {
            requestAnimationFrame(scrollStep);
        } else if (options.onComplete) {
            options.onComplete();
        }
    }
    
    requestAnimationFrame(scrollStep);
}

/**
 * Create ripple effect on click
 * @param {Event} event - Click event
 * @param {HTMLElement} element - Element to add ripple to
 */
export function createRippleEffect(event, element = null) {
    const target = element || event.currentTarget;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        pointer-events: none;
    `;
    
    // Add ripple styles if not exists
    if (!document.querySelector('#ripple-styles')) {
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .ripple-container {
                position: relative;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Make target relative if not already positioned
    if (getComputedStyle(target).position === 'static') {
        target.style.position = 'relative';
    }
    target.style.overflow = 'hidden';
    
    target.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Add loading skeleton to container
 * @param {HTMLElement} container - Container element
 * @param {Object} options - Skeleton options
 */
export function addLoadingSkeleton(container, options = {}) {
    if (!window.animationController) {
        console.warn('Animation Controller not available');
        return null;
    }
    
    return window.animationController.createSkeleton(container, {
        lines: options.lines || 3,
        lastLineShort: options.lastLineShort !== false,
        ...options
    });
}

/**
 * Show toast notification with animation
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Display duration
 */
export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not exists
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: var(--bg-glass);
                backdrop-filter: blur(15px);
                border: 1px solid var(--border-glass);
                border-radius: 8px;
                padding: 1rem 1.5rem;
                color: white;
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            }
            .toast.show { transform: translateX(0); }
            .toast-success { border-left: 4px solid #10B981; }
            .toast-error { border-left: 4px solid #EF4444; }
            .toast-warning { border-left: 4px solid #F59E0B; }
            .toast-info { border-left: 4px solid #3B82F6; }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
    
    return toast;
}

// Export all utilities
export default {
    createButtonLoading,
    animateCounter,
    staggerElements,
    pulseElement,
    shakeElement,
    smoothScrollTo,
    createRippleEffect,
    addLoadingSkeleton,
    showToast
};
