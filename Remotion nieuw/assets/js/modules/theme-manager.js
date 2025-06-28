/**
 * Theme Manager Module
 * Handles dynamic theme switching, dark/light mode, and accessibility preferences
 * @version 1.0.0
 */

export default class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.darkMode = false;
        this.accessibilityMode = false;
        this.systemPreference = null;
        this.reducedMotion = false;
        
        // Storage keys
        this.storageKeys = {
            theme: 'app-theme',
            darkMode: 'app-dark-mode',
            accessibility: 'app-accessibility'
        };
        
        // Available themes
        this.themes = {
            default: { primary: '#4F46E5', name: 'Portal' },
            admin: { primary: '#F59E0B', name: 'Admin' },
            school: { primary: '#3B82F6', name: 'School' },
            teacher: { primary: '#10B981', name: 'Teacher' },
            student: { primary: '#8B5CF6', name: 'Student' }
        };
        
        // Theme color mappings
        this.colorMappings = {
            light: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                text: '#ffffff',
                glass: 'rgba(255, 255, 255, 0.1)',
                glassHover: 'rgba(255, 255, 255, 0.2)',
                border: 'rgba(255, 255, 255, 0.2)',
                shadow: 'rgba(0, 0, 0, 0.2)'
            },
            dark: {
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                text: '#f8fafc',
                glass: 'rgba(0, 0, 0, 0.3)',
                glassHover: 'rgba(0, 0, 0, 0.4)',
                border: 'rgba(255, 255, 255, 0.1)',
                shadow: 'rgba(0, 0, 0, 0.5)'
            }
        };
        
        // Event listeners
        this.listeners = new Map();
        
        // Bind methods
        this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
        this.handleReducedMotionChange = this.handleReducedMotionChange.bind(this);
    }
    
    /**
     * Initialize the theme manager
     */
    async init() {
        try {
            // Detect system preferences
            this.detectSystemPreferences();
            
            // Load saved preferences
            this.loadPreferences();
            
            // Setup system preference listeners
            this.setupSystemListeners();
            
            // Apply initial theme
            this.applyTheme();
            
            // Setup accessibility features
            this.setupAccessibility();
            
            console.log('🎨 Theme Manager initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Theme Manager:', error);
            return false;
        }
    }
    
    /**
     * Set the current theme
     * @param {string} theme - Theme name (default, admin, school, teacher, student)
     * @param {boolean} darkMode - Enable dark mode
     * @param {boolean} save - Save to localStorage
     */
    setTheme(theme, darkMode = null, save = true) {
        if (!this.themes[theme]) {
            console.warn(`⚠️ Unknown theme: ${theme}`);
            return false;
        }
        
        const previousTheme = this.currentTheme;
        const previousDarkMode = this.darkMode;
        
        this.currentTheme = theme;
        
        if (darkMode !== null) {
            this.darkMode = darkMode;
        }
        
        this.applyTheme();
        
        if (save) {
            this.savePreferences();
        }
        
        // Emit theme change event
        this.emitThemeChange({
            theme,
            darkMode: this.darkMode,
            previousTheme,
            previousDarkMode
        });
        
        // Announce to screen readers
        this.announceThemeChange(theme, this.darkMode);
        
        return true;
    }
    
    /**
     * Toggle dark mode for current theme
     */
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.setTheme(this.currentTheme, this.darkMode, true);
        return this.darkMode;
    }
    
    /**
     * Set accessibility mode
     * @param {boolean} enabled - Enable high contrast and accessibility features
     */
    setAccessibilityMode(enabled) {
        this.accessibilityMode = enabled;
        
        const root = document.documentElement;
        
        if (enabled) {
            root.classList.add('accessibility-mode');
            root.style.setProperty('--transition-fast', 'none');
            root.style.setProperty('--transition-normal', 'none');
            root.style.setProperty('--transition-slow', 'none');
        } else {
            root.classList.remove('accessibility-mode');
            root.style.setProperty('--transition-fast', '0.2s ease');
            root.style.setProperty('--transition-normal', '0.3s ease');
            root.style.setProperty('--transition-slow', '0.5s ease');
        }
        
        this.savePreferences();
        
        // Emit accessibility change event
        document.dispatchEvent(new CustomEvent('theme:accessibility-changed', {
            detail: { enabled }
        }));
        
        return enabled;
    }
    
    /**
     * Detect system color scheme and motion preferences
     */
    detectSystemPreferences() {
        // Detect color scheme preference
        if (window.matchMedia) {
            this.systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            
            // Detect reduced motion preference
            this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
    }
    
    /**
     * Apply the current theme to the document
     */
    applyTheme() {
        const root = document.documentElement;
        const body = document.body;
        
        // Set theme data attribute
        const themeAttribute = this.darkMode ? `${this.currentTheme}-dark` : this.currentTheme;
        root.setAttribute('data-theme', themeAttribute);
        
        // Get theme colors
        const colorScheme = this.darkMode ? 'dark' : 'light';
        const colors = this.colorMappings[colorScheme];
        const themeColor = this.themes[this.currentTheme].primary;
        
        // Apply CSS custom properties
        root.style.setProperty('--theme-primary', themeColor);
        root.style.setProperty('--theme-background', colors.background);
        root.style.setProperty('--theme-text', colors.text);
        root.style.setProperty('--theme-glass', colors.glass);
        root.style.setProperty('--theme-glass-hover', colors.glassHover);
        root.style.setProperty('--theme-border', colors.border);
        root.style.setProperty('--theme-shadow', colors.shadow);
        
        // Update body background
        body.style.background = colors.background;
        
        // Handle reduced motion
        if (this.reducedMotion || this.accessibilityMode) {
            root.classList.add('reduced-motion');
        } else {
            root.classList.remove('reduced-motion');
        }
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(themeColor);
    }
    
    /**
     * Update meta theme-color for mobile browsers
     * @param {string} color - Theme color
     */
    updateMetaThemeColor(color) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = color;
    }
    
    /**
     * Save theme preferences to localStorage
     */
    savePreferences() {
        try {
            localStorage.setItem(this.storageKeys.theme, this.currentTheme);
            localStorage.setItem(this.storageKeys.darkMode, this.darkMode.toString());
            localStorage.setItem(this.storageKeys.accessibility, this.accessibilityMode.toString());
        } catch (error) {
            console.warn('⚠️ Failed to save theme preferences:', error);
        }
    }
    
    /**
     * Load theme preferences from localStorage
     */
    loadPreferences() {
        try {
            const savedTheme = localStorage.getItem(this.storageKeys.theme);
            const savedDarkMode = localStorage.getItem(this.storageKeys.darkMode);
            const savedAccessibility = localStorage.getItem(this.storageKeys.accessibility);
            
            if (savedTheme && this.themes[savedTheme]) {
                this.currentTheme = savedTheme;
            }
            
            if (savedDarkMode !== null) {
                this.darkMode = savedDarkMode === 'true';
            } else {
                // Use system preference if no saved preference
                this.darkMode = this.systemPreference === 'dark';
            }
            
            if (savedAccessibility !== null) {
                this.accessibilityMode = savedAccessibility === 'true';
            }
        } catch (error) {
            console.warn('⚠️ Failed to load theme preferences:', error);
        }
    }
    
    /**
     * Setup system preference listeners
     */
    setupSystemListeners() {
        if (window.matchMedia) {
            // Listen for color scheme changes
            const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            colorSchemeQuery.addEventListener('change', this.handleSystemThemeChange);
            
            // Listen for reduced motion changes
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            reducedMotionQuery.addEventListener('change', this.handleReducedMotionChange);
        }
    }
    
    /**
     * Handle system color scheme changes
     * @param {MediaQueryListEvent} e - Media query event
     */
    handleSystemThemeChange(e) {
        this.systemPreference = e.matches ? 'dark' : 'light';
        
        // Only auto-switch if user hasn't explicitly set dark mode
        const savedDarkMode = localStorage.getItem(this.storageKeys.darkMode);
        if (savedDarkMode === null) {
            this.darkMode = e.matches;
            this.applyTheme();
        }
    }
    
    /**
     * Handle reduced motion preference changes
     * @param {MediaQueryListEvent} e - Media query event
     */
    handleReducedMotionChange(e) {
        this.reducedMotion = e.matches;
        this.applyTheme();
    }
    
    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add focus-visible polyfill behavior
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Apply accessibility mode if enabled
        if (this.accessibilityMode) {
            this.setAccessibilityMode(true);
        }
    }
    
    /**
     * Emit theme change event
     * @param {Object} details - Event details
     */
    emitThemeChange(details) {
        document.dispatchEvent(new CustomEvent('theme:changed', {
            detail: details
        }));
    }
    
    /**
     * Announce theme changes to screen readers
     * @param {string} theme - Theme name
     * @param {boolean} darkMode - Dark mode status
     */
    announceThemeChange(theme, darkMode) {
        const themeName = this.themes[theme].name;
        const modeText = darkMode ? 'donkere modus' : 'lichte modus';
        const message = `Thema gewijzigd naar ${themeName} ${modeText}`;
        
        // Create temporary announcement element
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    /**
     * Get current theme information
     * @returns {Object} Current theme info
     */
    getCurrentTheme() {
        return {
            theme: this.currentTheme,
            darkMode: this.darkMode,
            accessibilityMode: this.accessibilityMode,
            systemPreference: this.systemPreference,
            reducedMotion: this.reducedMotion
        };
    }
    
    /**
     * Get available themes
     * @returns {Object} Available themes
     */
    getAvailableThemes() {
        return { ...this.themes };
    }
    
    /**
     * Preview a theme without saving
     * @param {string} theme - Theme to preview
     * @param {boolean} darkMode - Dark mode for preview
     */
    previewTheme(theme, darkMode = false) {
        if (!this.themes[theme]) return false;
        
        const currentTheme = this.currentTheme;
        const currentDarkMode = this.darkMode;
        
        this.setTheme(theme, darkMode, false);
        
        // Return function to restore original theme
        return () => {
            this.setTheme(currentTheme, currentDarkMode, false);
        };
    }
    
    /**
     * Reset to default theme and preferences
     */
    reset() {
        this.currentTheme = 'default';
        this.darkMode = this.systemPreference === 'dark';
        this.accessibilityMode = false;
        
        // Clear localStorage
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        
        this.applyTheme();
        
        // Emit reset event
        document.dispatchEvent(new CustomEvent('theme:reset'));
    }
    
    /**
     * Destroy the theme manager and cleanup
     */
    destroy() {
        // Remove system listeners
        if (window.matchMedia) {
            const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            colorSchemeQuery.removeEventListener('change', this.handleSystemThemeChange);
            
            const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            reducedMotionQuery.removeEventListener('change', this.handleReducedMotionChange);
        }
        
        // Clear listeners
        this.listeners.clear();
        
        console.log('🎨 Theme Manager destroyed');
    }
}

// Export for ES6 module usage
// Usage: import ThemeManager from './theme-manager.js';
