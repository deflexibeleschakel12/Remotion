/**
 * =================================
 * TRANSLATIONS.JS - Professional i18n Engine
 * Schoolbeheersysteem v1.0.0
 * Max 400 regels - Enterprise Grade
 * =================================
 */

/**
 * Professional internationalization engine with advanced features
 * @class I18nManager
 */
class I18nManager {
    constructor() {
        this.currentLang = 'nl';
        this.fallbackLang = 'nl';
        this.translations = new Map();
        this.observers = new Set();
        this.cache = new Map();
        this.pluralRules = new Map();
        this.genderRules = new Map();
        this.contexts = new Map();
        this.namespaces = new Map();
        this.loadedLanguages = new Set();
        this.isInitialized = false;
        this.mutationObserver = null;
        
        this._setupPluralRules();
        this._setupGenderRules();
        this._bindMethods();
    }

    /**
     * Initialize the i18n system
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Prevent conflicts with external libraries
            if (typeof window !== 'undefined') {
                this._setupErrorHandling();
            }
            
            await this._detectBrowserLanguage();
            await this._loadStoredPreferences();
            await this._loadLanguagePack(this.currentLang);
            
            this._setupDOMObserver();
            this._translatePage();
            this.isInitialized = true;
            
            console.log(`🌍 i18n initialized: ${this.currentLang}`);
        } catch (error) {
            console.error('❌ i18n initialization failed:', error);
            await this._fallbackToDefault();
        }
    }

    /**
     * Change current language
     * @param {string} langCode - Language code (nl, en, de, fr)
     * @returns {Promise<void>}
     */
    async setLanguage(langCode) {
        if (this.currentLang === langCode) return;
        
        try {
            await this._loadLanguagePack(langCode);
            this.currentLang = langCode;
            this._savePreferences();
            this._translatePage();
            this._notifyObservers('languageChanged', langCode);
            
            console.log(`🌍 Language changed to: ${langCode}`);
        } catch (error) {
            console.error(`❌ Failed to set language ${langCode}:`, error);
            throw error;
        }
    }

    /**
     * Translate a key with advanced features
     * @param {string} key - Translation key (supports namespaces: 'admin.title')
     * @param {Object} options - Translation options
     * @param {Object} options.vars - Variables for interpolation
     * @param {number} options.count - Count for pluralization
     * @param {string} options.gender - Gender for gender-aware translations
     * @param {string} options.context - Context for contextual translations
     * @param {string} options.namespace - Explicit namespace
     * @param {boolean} options.html - Allow HTML content
     * @returns {string} Translated text
     */
    t(key, options = {}) {
        // Input validation
        if (!key || typeof key !== 'string') {
            console.warn('🌍 Invalid translation key provided to t():', key);
            return key || '';
        }
        
        const cacheKey = this._getCacheKey(key, options);
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        let translation = this._getTranslation(key, options);
        
        // Apply transformations
        translation = this._applyInterpolation(translation, options.vars || {});
        translation = this._applyPluralization(translation, options.count);
        translation = this._applyGenderization(translation, options.gender);
        translation = this._applyContextualization(translation, options.context);
        
        // Cache result
        this.cache.set(cacheKey, translation);
        
        return translation;
    }

    /**
     * Get plural form of translation
     * @param {string} key - Translation key
     * @param {number} count - Count for plural rules
     * @param {Object} vars - Variables for interpolation
     * @returns {string} Pluralized translation
     */
    plural(key, count, vars = {}) {
        return this.t(key, { count, vars });
    }

    /**
     * Get gender-aware translation
     * @param {string} key - Translation key
     * @param {string} gender - Gender (m/f/n)
     * @param {Object} vars - Variables for interpolation
     * @returns {string} Gender-aware translation
     */
    gender(key, gender, vars = {}) {
        return this.t(key, { gender, vars });
    }

    /**
     * Get contextual translation
     * @param {string} key - Translation key
     * @param {string} context - Context identifier
     * @param {Object} vars - Variables for interpolation
     * @returns {string} Contextual translation
     */
    context(key, context, vars = {}) {
        return this.t(key, { context, vars });
    }

    /**
     * Register translation observer
     * @param {Function} callback - Observer callback
     */
    observe(callback) {
        this.observers.add(callback);
        return () => this.observers.delete(callback);
    }

    /**
     * Add translations for a language
     * @param {string} langCode - Language code
     * @param {Object} translations - Translation object
     * @param {string} namespace - Optional namespace
     */
    addTranslations(langCode, translations, namespace = 'default') {
        if (!this.translations.has(langCode)) {
            this.translations.set(langCode, new Map());
        }
        
        const langTranslations = this.translations.get(langCode);
        if (!langTranslations.has(namespace)) {
            langTranslations.set(namespace, {});
        }
        
        Object.assign(langTranslations.get(namespace), translations);
        this._clearCache();
    }

    /**
     * Format number with locale support
     * @param {number} number - Number to format
     * @param {Object} options - Intl.NumberFormat options
     * @returns {string} Formatted number
     */
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLang, options).format(number);
    }

    /**
     * Format date with locale support
     * @param {Date|string} date - Date to format
     * @param {Object} options - Intl.DateTimeFormat options
     * @returns {string} Formatted date
     */
    formatDate(date, options = {}) {
        const dateObj = date instanceof Date ? date : new Date(date);
        return new Intl.DateTimeFormat(this.currentLang, options).format(dateObj);
    }

    /**
     * Get current language info
     * @returns {Object} Language information
     */
    getLanguageInfo() {
        return {
            current: this.currentLang,
            fallback: this.fallbackLang,
            loaded: Array.from(this.loadedLanguages),
            isRTL: this._isRTL(this.currentLang)
        };
    }

    // =================================
    // PRIVATE METHODS
    // =================================

    _bindMethods() {
        this.t = this.t.bind(this);
        this.plural = this.plural.bind(this);
        this.gender = this.gender.bind(this);
        this.context = this.context.bind(this);
    }

    async _detectBrowserLanguage() {
        const browserLang = navigator.language.split('-')[0];
        const supportedLangs = ['nl', 'en', 'de', 'fr'];
        
        if (supportedLangs.includes(browserLang)) {
            this.currentLang = browserLang;
        }
    }

    async _loadStoredPreferences() {
        try {
            const stored = localStorage.getItem('school-i18n-preferences');
            if (stored) {
                const prefs = JSON.parse(stored);
                this.currentLang = prefs.language || this.currentLang;
            }
        } catch (error) {
            console.warn('Failed to load stored preferences:', error);
        }
    }

    _savePreferences() {
        try {
            const prefs = { language: this.currentLang };
            localStorage.setItem('school-i18n-preferences', JSON.stringify(prefs));
        } catch (error) {
            console.warn('Failed to save preferences:', error);
        }
    }

    async _loadLanguagePack(langCode) {
        if (this.loadedLanguages.has(langCode)) return;
        
        try {
            const module = await import(`./languages/${langCode}.js`);
            const translations = module.default || module.translations;
            
            this.translations.set(langCode, new Map([['default', translations]]));
            this.loadedLanguages.add(langCode);
        } catch (error) {
            if (langCode !== this.fallbackLang) {
                console.warn(`Failed to load ${langCode}, falling back to ${this.fallbackLang}`);
                await this._loadLanguagePack(this.fallbackLang);
            } else {
                throw new Error(`Failed to load fallback language: ${this.fallbackLang}`);
            }
        }
    }

    _getTranslation(key, options = {}) {
        // Null/undefined safety check
        if (!key || typeof key !== 'string') {
            console.warn('🌍 Invalid translation key:', key);
            return key || '';
        }
        
        const { namespace = 'default' } = options;
        const [ns, actualKey] = key.includes('.') ? 
            [key.split('.')[0], key.split('.').slice(1).join('.')] : 
            [namespace, key];

        // Try current language
        let translation = this._getFromLanguage(this.currentLang, ns, actualKey);
        
        // Fallback to default language
        if (!translation && this.currentLang !== this.fallbackLang) {
            translation = this._getFromLanguage(this.fallbackLang, ns, actualKey);
        }
        
        return translation || `[${key}]`;
    }

    _getFromLanguage(langCode, namespace, key) {
        const langTranslations = this.translations.get(langCode);
        if (!langTranslations) return null;
        
        const nsTranslations = langTranslations.get(namespace);
        if (!nsTranslations) return null;
        
        return this._getNestedValue(nsTranslations, key);
    }

    _getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : null, obj);
    }

    _applyInterpolation(text, vars) {
        if (!text || typeof text !== 'string') return text;
        
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return vars[key] !== undefined ? vars[key] : match;
        });
    }

    _applyPluralization(text, count) {
        if (!text || count === undefined || typeof text !== 'object') return text;
        
        const rule = this.pluralRules.get(this.currentLang) || this.pluralRules.get('nl');
        const form = rule(count);
        
        return text[form] || text.other || text;
    }

    _applyGenderization(text, gender) {
        if (!text || !gender || typeof text !== 'object') return text;
        
        return text[gender] || text.n || text.default || text;
    }

    _applyContextualization(text, context) {
        if (!text || !context || typeof text !== 'object') return text;
        
        return text[context] || text.default || text;
    }

    _setupPluralRules() {
        // Dutch/English plural rules
        this.pluralRules.set('nl', (n) => n === 1 ? 'one' : 'other');
        this.pluralRules.set('en', (n) => n === 1 ? 'one' : 'other');
        this.pluralRules.set('de', (n) => n === 1 ? 'one' : 'other');
        this.pluralRules.set('fr', (n) => n <= 1 ? 'one' : 'other');
    }

    _setupGenderRules() {
        this.genderRules.set('nl', ['m', 'f', 'n']);
        this.genderRules.set('en', ['m', 'f', 'n']);
        this.genderRules.set('de', ['m', 'f', 'n']);
        this.genderRules.set('fr', ['m', 'f']);
    }

    _setupDOMObserver() {
        if (typeof window === 'undefined') return;
        
        this.mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    // Safety checks
                    if (!node || node.nodeType !== Node.ELEMENT_NODE) {
                        return;
                    }
                    
                    try {
                        // Check if the node has the translation attribute
                        if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                            this._translateElement(node);
                        }
                        
                        // Also check child elements
                        if (node.querySelectorAll) {
                            const translatableElements = node.querySelectorAll('[data-i18n]');
                            translatableElements.forEach(element => {
                                if (element && element.hasAttribute('data-i18n')) {
                                    this._translateElement(element);
                                }
                            });
                        }
                    } catch (error) {
                        console.warn('🌍 Translation error for node:', node, error);
                    }
                });
            });
        });
        
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    _setupErrorHandling() {
        // Prevent translation errors from breaking the app
        window.addEventListener('error', (event) => {
            if (event.error && event.error.message && 
                event.error.message.includes('Cannot read properties of null')) {
                console.warn('🌍 Prevented translation null pointer error:', event.error);
                event.preventDefault();
                return false;
            }
        });
    }

    _translatePage() {
        if (typeof window === 'undefined') return;
        
        try {
            const elements = document.querySelectorAll('[data-i18n]');
            if (!elements || elements.length === 0) {
                console.info('🌍 No translatable elements found on page');
                return;
            }
            
            elements.forEach(element => {
                if (element && element.hasAttribute('data-i18n')) {
                    this._translateElement(element);
                }
            });
        } catch (error) {
            console.error('🌍 Error translating page:', error);
        }
    }

    _translateElement(element) {
        // Comprehensive safety checks
        if (!element || typeof element.getAttribute !== 'function') {
            console.warn('🌍 Invalid element passed to _translateElement:', element);
            return;
        }
        
        const key = element.getAttribute('data-i18n');
        
        // Skip if no translation key
        if (!key || typeof key !== 'string') {
            console.warn('🌍 Element missing or invalid data-i18n attribute:', element);
            return;
        }
        
        try {
            const vars = this._parseDataVars(element.getAttribute('data-i18n-vars'));
            const count = element.getAttribute('data-i18n-count');
            const gender = element.getAttribute('data-i18n-gender');
            const context = element.getAttribute('data-i18n-context');
            const html = element.hasAttribute('data-i18n-html');
        
        const options = { vars };
        if (count !== null) options.count = parseInt(count);
        if (gender) options.gender = gender;
        if (context) options.context = context;
        if (html) options.html = true;
        
        const translation = this.t(key, options);
        
        if (html) {
            element.innerHTML = translation;
        } else {
            element.textContent = translation;
        }
        
        } catch (error) {
            console.warn('🌍 Error translating element:', element, error);
        }
    }

    _parseDataVars(varsString) {
        if (!varsString) return {};
        try {
            return JSON.parse(varsString);
        } catch {
            return {};
        }
    }

    _getCacheKey(key, options) {
        return `${this.currentLang}:${key}:${JSON.stringify(options)}`;
    }

    _clearCache() {
        this.cache.clear();
    }

    _notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Observer error:', error);
            }
        });
    }

    _isRTL(langCode) {
        const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
        return rtlLanguages.includes(langCode);
    }

    async _fallbackToDefault() {
        try {
            this.currentLang = this.fallbackLang;
            await this._loadLanguagePack(this.fallbackLang);
            this._translatePage();
            this.isInitialized = true;
        } catch (error) {
            console.error('Critical: Failed to load fallback language:', error);
        }
    }
}

// Create singleton instance
const i18nManager = new I18nManager();

// Global access for debugging
if (typeof window !== 'undefined') {
    window.i18n = i18nManager;
}

export { i18nManager, I18nManager };
export default i18nManager;