/* =================================
   UI-COMPONENTS.JS - Interactive UI
   Schoolbeheersysteem v1.0.0
   Max 500 regels - ES6 Module
   ================================= */

// =================================
// CORE UI COMPONENTS CLASS
// =================================

export class UIComponents {
    constructor() {
        this.modals = new Map();
        this.dropdowns = new Map();
        this.validators = new Map();
        this.notifications = [];
        this.currentTheme = localStorage.getItem('app-theme') || 'default';
        this.currentLanguage = localStorage.getItem('app-language') || 'nl';
        this.eventListeners = new Map();
        this.focusStack = [];
    }

    // =================================
    // INITIALIZATION
    // =================================

    async init() {
        try {
            await this.initializeComponents();
            this.setupGlobalEventListeners();
            this.restoreUserPreferences();
            this.setupAccessibility();
            console.log('✅ UI Components initialized');
        } catch (error) {
            console.error('❌ UI Components initialization failed:', error);
            throw error;
        }
    }

    async initializeComponents() {
        // Initialize dropdowns
        document.querySelectorAll('[data-dropdown]').forEach(el => {
            this.initDropdown(el);
        });

        // Initialize forms
        document.querySelectorAll('form[data-validate]').forEach(form => {
            this.initValidator(form);
        });

        // Initialize theme system
        this.applyTheme(this.currentTheme);

        // Initialize language system
        await this.applyLanguage(this.currentLanguage);
    }

    // =================================
    // MODAL MANAGER
    // =================================

    createModal(config) {
        const {
            id,
            title,
            content,
            footer,
            size = 'md',
            closable = true,
            backdrop = true
        } = config;

        if (this.modals.has(id)) {
            console.warn(`Modal ${id} already exists`);
            return this.modals.get(id);
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = `modal-${id}`;
        modal.innerHTML = `
            <div class="modal modal-${size}" role="dialog" aria-labelledby="modal-title-${id}">
                <div class="modal-header">
                    <h2 class="modal-title" id="modal-title-${id}">${title}</h2>
                    ${closable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
                </div>
                <div class="modal-content">${content}</div>
                ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
            </div>
        `;

        document.body.appendChild(modal);

        // Event listeners
        if (closable) {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn?.addEventListener('click', () => this.hideModal(id));
        }

        if (backdrop) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(id);
            });
        }

        // Keyboard handling
        const keyHandler = (e) => {
            if (e.key === 'Escape' && closable) this.hideModal(id);
        };

        this.modals.set(id, { element: modal, keyHandler });
        return modal;
    }

    showModal(id) {
        const modal = this.modals.get(id);
        if (!modal) return false;

        // Store current focus
        this.focusStack.push(document.activeElement);

        modal.element.classList.add('show');
        document.addEventListener('keydown', modal.keyHandler);
        document.body.style.overflow = 'hidden';

        // Focus management
        const firstFocusable = modal.element.querySelector(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();

        return true;
    }

    hideModal(id) {
        const modal = this.modals.get(id);
        if (!modal) return false;

        modal.element.classList.remove('show');
        document.removeEventListener('keydown', modal.keyHandler);
        document.body.style.overflow = '';

        // Restore focus
        const previousFocus = this.focusStack.pop();
        previousFocus?.focus();

        return true;
    }

    destroyModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            this.hideModal(id);
            modal.element.remove();
            this.modals.delete(id);
        }
    }

    // =================================
    // DROPDOWN CONTROLLER
    // =================================

    initDropdown(element) {
        const id = element.dataset.dropdown || this.generateId();
        const toggle = element.querySelector('[data-dropdown-toggle]');
        const menu = element.querySelector('[data-dropdown-menu]');

        if (!toggle || !menu) return;

        const dropdown = {
            element,
            toggle,
            menu,
            isOpen: false,
            closeOnClick: element.dataset.closeOnClick !== 'false'
        };

        // Toggle event
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown(id);
        });

        // Menu item clicks
        if (dropdown.closeOnClick) {
            menu.addEventListener('click', (e) => {
                if (e.target.closest('[data-dropdown-item]')) {
                    this.closeDropdown(id);
                }
            });
        }

        // Outside click
        document.addEventListener('click', (e) => {
            if (!element.contains(e.target)) {
                this.closeDropdown(id);
            }
        });

        this.dropdowns.set(id, dropdown);
        return dropdown;
    }

    toggleDropdown(id) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) return;

        if (dropdown.isOpen) {
            this.closeDropdown(id);
        } else {
            this.openDropdown(id);
        }
    }

    openDropdown(id) {
        // Close other dropdowns
        this.dropdowns.forEach((dd, ddId) => {
            if (ddId !== id) this.closeDropdown(ddId);
        });

        const dropdown = this.dropdowns.get(id);
        if (!dropdown) return;

        dropdown.element.classList.add('open');
        dropdown.isOpen = true;
        dropdown.toggle.setAttribute('aria-expanded', 'true');
    }

    closeDropdown(id) {
        const dropdown = this.dropdowns.get(id);
        if (!dropdown) return;

        dropdown.element.classList.remove('open');
        dropdown.isOpen = false;
        dropdown.toggle.setAttribute('aria-expanded', 'false');
    }

    // =================================
    // FORM VALIDATOR
    // =================================

    initValidator(form) {
        const id = form.id || this.generateId();
        const rules = JSON.parse(form.dataset.validate || '{}');

        const validator = {
            form,
            rules,
            errors: new Map(),
            isValid: false
        };

        // Field event listeners
        form.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('blur', () => this.validateField(id, field));
            field.addEventListener('input', () => this.clearFieldError(id, field));
        });

        // Form submit
        form.addEventListener('submit', (e) => {
            if (!this.validateForm(id)) {
                e.preventDefault();
                this.showFirstError(id);
            }
        });

        this.validators.set(id, validator);
        return validator;
    }

    validateField(formId, field) {
        const validator = this.validators.get(formId);
        if (!validator) return true;

        const rules = validator.rules[field.name] || [];
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        for (const rule of rules) {
            const result = this.applyValidationRule(rule, value, field);
            if (!result.valid) {
                isValid = false;
                errorMessage = result.message;
                break;
            }
        }

        if (isValid) {
            validator.errors.delete(field.name);
            this.removeFieldError(field);
        } else {
            validator.errors.set(field.name, errorMessage);
            this.showFieldError(field, errorMessage);
        }

        validator.isValid = validator.errors.size === 0;
        return isValid;
    }

    applyValidationRule(rule, value, field) {
        switch (rule.type) {
            case 'required':
                return {
                    valid: value !== '',
                    message: rule.message || 'Dit veld is verplicht'
                };
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return {
                    valid: !value || emailRegex.test(value),
                    message: rule.message || 'Voer een geldig e-mailadres in'
                };
            case 'minLength':
                return {
                    valid: value.length >= rule.value,
                    message: rule.message || `Minimaal ${rule.value} karakters`
                };
            case 'pattern':
                const regex = new RegExp(rule.pattern);
                return {
                    valid: !value || regex.test(value),
                    message: rule.message || 'Ongeldige invoer'
                };
            default:
                return { valid: true };
        }
    }

    showFieldError(field, message) {
        field.classList.add('error');
        let errorElement = field.parentNode.querySelector('.form-error');
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'form-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }

    removeFieldError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        const errorElement = field.parentNode.querySelector('.form-error');
        errorElement?.remove();
    }

    clearFieldError(formId, field) {
        if (field.classList.contains('error')) {
            this.removeFieldError(field);
            const validator = this.validators.get(formId);
            if (validator) {
                validator.errors.delete(field.name);
            }
        }
    }

    validateForm(id) {
        const validator = this.validators.get(id);
        if (!validator) return true;

        let isValid = true;
        validator.form.querySelectorAll('input, select, textarea').forEach(field => {
            if (!this.validateField(id, field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    showFirstError(id) {
        const validator = this.validators.get(id);
        if (validator && validator.errors.size > 0) {
            const firstErrorField = validator.form.querySelector('.error');
            firstErrorField?.focus();
        }
    }

    // =================================
    // THEME SWITCHER
    // =================================

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme-loading', 'true');
        
        setTimeout(() => {
            document.documentElement.setAttribute('data-theme', theme);
            this.currentTheme = theme;
            localStorage.setItem('app-theme', theme);
            
            setTimeout(() => {
                document.documentElement.removeAttribute('data-theme-loading');
            }, 50);
        }, 10);

        this.dispatchEvent('themeChanged', { theme });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
    }

    // =================================
    // LANGUAGE SELECTOR
    // =================================

    async setLanguage(language) {
        try {
            // Import i18n manager if available
            if (window.i18nManager) {
                await window.i18nManager.setLanguage(language);
            }

            this.currentLanguage = language;
            localStorage.setItem('app-language', language);
            
            // Update language selector UI
            this.updateLanguageSelector(language);
            
            this.dispatchEvent('languageChanged', { language });
        } catch (error) {
            console.error('Language change failed:', error);
        }
    }

    async applyLanguage(language) {
        this.currentLanguage = language;
        this.updateLanguageSelector(language);
    }

    updateLanguageSelector(language) {
        const selector = document.querySelector('.language-selector');
        if (!selector) return;

        const activeOption = selector.querySelector('.lang-option.active');
        const newOption = selector.querySelector(`[data-lang="${language}"]`);
        
        if (activeOption) activeOption.classList.remove('active');
        if (newOption) newOption.classList.add('active');

        // Update toggle display
        const toggle = selector.querySelector('.lang-toggle');
        const flagIcon = newOption?.querySelector('.flag-icon');
        const text = newOption?.querySelector('span');
        
        if (toggle && flagIcon && text) {
            const toggleFlag = toggle.querySelector('.flag-icon');
            const toggleText = toggle.querySelector('span');
            
            if (toggleFlag) toggleFlag.src = flagIcon.src;
            if (toggleText) toggleText.textContent = text.textContent;
        }
    }

    // =================================
    // NOTIFICATION SYSTEM
    // =================================

    showNotification(config) {
        const {
            message,
            type = 'info',
            duration = 5000,
            closable = true,
            position = 'top-right'
        } = config;

        const id = this.generateId();
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                ${closable ? '<button class="notification-close">&times;</button>' : ''}
            </div>
        `;

        // Add to container
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = `notification-container ${position}`;
            document.body.appendChild(container);
        }

        container.appendChild(notification);
        this.notifications.push({ id, element: notification, timer: null });

        // Close button
        if (closable) {
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn?.addEventListener('click', () => this.hideNotification(id));
        }

        // Auto dismiss
        if (duration > 0) {
            const timer = setTimeout(() => this.hideNotification(id), duration);
            const notificationData = this.notifications.find(n => n.id === id);
            if (notificationData) notificationData.timer = timer;
        }

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        return id;
    }

    hideNotification(id) {
        const index = this.notifications.findIndex(n => n.id === id);
        if (index === -1) return;

        const notification = this.notifications[index];
        if (notification.timer) clearTimeout(notification.timer);

        notification.element.classList.remove('show');
        setTimeout(() => {
            notification.element.remove();
            this.notifications.splice(index, 1);
        }, 300);
    }

    // =================================
    // UTILITY METHODS
    // =================================

    generateId() {
        return `ui-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    setupGlobalEventListeners() {
        // Escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close dropdowns
                this.dropdowns.forEach((_, id) => this.closeDropdown(id));
            }
        });

        // Click outside handler
        document.addEventListener('click', () => {
            // Auto-close dropdowns
            this.dropdowns.forEach((dd, id) => {
                if (dd.isOpen && !dd.element.matches(':hover')) {
                    this.closeDropdown(id);
                }
            });
        });
    }

    setupAccessibility() {
        // Focus trap for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('.modal-overlay.show');
                if (activeModal) {
                    this.trapFocus(e, activeModal);
                }
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    restoreUserPreferences() {
        // Apply saved theme
        if (this.currentTheme !== 'default') {
            this.applyTheme(this.currentTheme);
        }

        // Apply saved language
        if (this.currentLanguage !== 'nl') {
            this.applyLanguage(this.currentLanguage);
        }
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(`ui:${eventName}`, { detail });
        document.dispatchEvent(event);
    }

    // =================================
    // CLEANUP
    // =================================

    destroy() {
        // Clear all modals
        this.modals.forEach((_, id) => this.destroyModal(id));
        
        // Clear notifications
        this.notifications.forEach(n => {
            if (n.timer) clearTimeout(n.timer);
            n.element.remove();
        });

        // Clear event listeners
        this.eventListeners.forEach((listener, element) => {
            element.removeEventListener(listener.event, listener.handler);
        });

        console.log('🧹 UI Components destroyed');
    }
}

// =================================
// DEFAULT EXPORT
// =================================

export default UIComponents;