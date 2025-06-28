/* =================================
   AUTH-UTILS.JS - Authentication Utilities
   Schoolbeheersysteem v1.0.0
   
   Helper functies voor authenticatie,
   guards, decorators en middleware
   ================================= */

/**
 * Authentication Guard - Route protection
 */
export class AuthGuard {
    constructor(authManager) {
        this.authManager = authManager;
    }

    /**
     * Protect route based on authentication status
     */
    requireAuth(redirectTo = '/login') {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = async function(...args) {
                if (!this.authManager?.isAuthenticated()) {
                    console.warn('🚫 Access denied: Authentication required');
                    window.location.href = redirectTo;
                    return;
                }
                
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    }

    /**
     * Protect route based on user role
     */
    requireRole(role, redirectTo = '/unauthorized') {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = async function(...args) {
                const validation = await this.authManager?.validateRole(role, window.location.pathname);
                
                if (!validation?.valid) {
                    console.warn(`🚫 Access denied: Role '${role}' required`);
                    window.location.href = redirectTo;
                    return;
                }
                
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    }

    /**
     * Protect route based on permission
     */
    requirePermission(permission, redirectTo = '/unauthorized') {
        return (target, propertyKey, descriptor) => {
            const originalMethod = descriptor.value;
            
            descriptor.value = async function(...args) {
                const hasPermission = await this.authManager?.checkPermission(permission);
                
                if (!hasPermission) {
                    console.warn(`🚫 Access denied: Permission '${permission}' required`);
                    window.location.href = redirectTo;
                    return;
                }
                
                return originalMethod.apply(this, args);
            };
            
            return descriptor;
        };
    }

    /**
     * Check if user can access current route
     */
    async canActivate(route, roles = [], permissions = []) {
        try {
            // Check authentication
            if (!this.authManager.isAuthenticated()) {
                return { allowed: false, reason: 'not_authenticated' };
            }

            // Check roles if specified
            if (roles.length > 0) {
                const userRole = this.authManager.getUserRole();
                const hasValidRole = roles.some(role => 
                    this.authManager.checkRoleHierarchy(userRole, role)
                );
                
                if (!hasValidRole) {
                    return { allowed: false, reason: 'insufficient_role' };
                }
            }

            // Check permissions if specified
            if (permissions.length > 0) {
                const hasAllPermissions = await Promise.all(
                    permissions.map(permission => 
                        this.authManager.checkPermission(permission)
                    )
                );
                
                if (!hasAllPermissions.every(Boolean)) {
                    return { allowed: false, reason: 'insufficient_permissions' };
                }
            }

            return { allowed: true };

        } catch (error) {
            console.error('❌ Route guard error:', error);
            return { allowed: false, reason: 'guard_error', error };
        }
    }
}

/**
 * JWT Token Helper
 */
export class TokenHelper {
    /**
     * Decode JWT token payload
     */
    static decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT format');
            }

            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('❌ JWT decode error:', error);
            return null;
        }
    }

    /**
     * Check if JWT token is expired
     */
    static isTokenExpired(token) {
        try {
            const payload = this.decodeJWT(token);
            if (!payload || !payload.exp) {
                return true;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            return payload.exp < currentTime;
        } catch (error) {
            console.error('❌ Token expiry check error:', error);
            return true;
        }
    }

    /**
     * Get token expiry time
     */
    static getTokenExpiry(token) {
        try {
            const payload = this.decodeJWT(token);
            return payload?.exp ? new Date(payload.exp * 1000) : null;
        } catch (error) {
            console.error('❌ Token expiry extraction error:', error);
            return null;
        }
    }

    /**
     * Get time until token expires
     */
    static getTimeUntilExpiry(token) {
        try {
            const expiry = this.getTokenExpiry(token);
            if (!expiry) return 0;
            
            return Math.max(0, expiry.getTime() - Date.now());
        } catch (error) {
            console.error('❌ Time until expiry calculation error:', error);
            return 0;
        }
    }
}

/**
 * Session Storage Helper
 */
export class SessionHelper {
    /**
     * Store encrypted session data
     */
    static storeSession(key, data, encrypt = true) {
        try {
            const serialized = JSON.stringify(data);
            const stored = encrypt ? btoa(serialized) : serialized;
            sessionStorage.setItem(`auth_${key}`, stored);
            return true;
        } catch (error) {
            console.error('❌ Session storage error:', error);
            return false;
        }
    }

    /**
     * Retrieve and decrypt session data
     */
    static getSession(key, decrypt = true) {
        try {
            const stored = sessionStorage.getItem(`auth_${key}`);
            if (!stored) return null;
            
            const serialized = decrypt ? atob(stored) : stored;
            return JSON.parse(serialized);
        } catch (error) {
            console.error('❌ Session retrieval error:', error);
            return null;
        }
    }

    /**
     * Clear session data
     */
    static clearSession(key) {
        try {
            sessionStorage.removeItem(`auth_${key}`);
            return true;
        } catch (error) {
            console.error('❌ Session clear error:', error);
            return false;
        }
    }

    /**
     * Clear all auth-related session data
     */
    static clearAllAuthSessions() {
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach(key => {
                if (key.startsWith('auth_')) {
                    sessionStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('❌ Session clear all error:', error);
            return false;
        }
    }
}

/**
 * Security Validator
 */
export class SecurityValidator {
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    static validatePasswordStrength(password, requirements = {}) {
        const defaultRequirements = {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            forbidCommon: true
        };

        const config = { ...defaultRequirements, ...requirements };
        const errors = [];
        const score = { value: 0, max: 5 };

        // Length check
        if (password.length < config.minLength) {
            errors.push(`Password must be at least ${config.minLength} characters long`);
        } else if (password.length >= config.minLength) {
            score.value++;
        }

        if (password.length > config.maxLength) {
            errors.push(`Password must be no more than ${config.maxLength} characters long`);
        }

        // Character requirements
        if (config.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        } else if (/[A-Z]/.test(password)) {
            score.value++;
        }

        if (config.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        } else if (/[a-z]/.test(password)) {
            score.value++;
        }

        if (config.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        } else if (/\d/.test(password)) {
            score.value++;
        }

        if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            score.value++;
        }

        // Common password check
        if (config.forbidCommon && this.isCommonPassword(password)) {
            errors.push('Password is too common, please choose a different one');
        }

        return {
            isValid: errors.length === 0,
            errors,
            score: Math.round((score.value / score.max) * 100),
            strength: this.getPasswordStrengthLabel(score.value / score.max)
        };
    }

    /**
     * Check if password is commonly used
     */
    static isCommonPassword(password) {
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', '1234567890'
        ];
        
        return commonPasswords.includes(password.toLowerCase());
    }

    /**
     * Get password strength label
     */
    static getPasswordStrengthLabel(ratio) {
        if (ratio <= 0.2) return 'Very Weak';
        if (ratio <= 0.4) return 'Weak';
        if (ratio <= 0.6) return 'Fair';
        if (ratio <= 0.8) return 'Good';
        return 'Strong';
    }

    /**
     * Sanitize input to prevent XSS
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }

        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Validate CSRF token
     */
    static validateCSRFToken(token, expectedToken) {
        if (!token || !expectedToken) {
            return false;
        }

        // Constant-time comparison to prevent timing attacks
        if (token.length !== expectedToken.length) {
            return false;
        }

        let result = 0;
        for (let i = 0; i < token.length; i++) {
            result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
        }

        return result === 0;
    }

    /**
     * Generate secure random string
     */
    static generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
}

/**
 * Rate Limiter
 */
export class RateLimiter {
    constructor() {
        this.attempts = new Map();
    }

    /**
     * Check if action is rate limited
     */
    isLimited(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];
        
        // Remove old attempts outside the time window
        const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
        
        // Update the attempts array
        this.attempts.set(key, recentAttempts);
        
        return recentAttempts.length >= maxAttempts;
    }

    /**
     * Record an attempt
     */
    recordAttempt(key) {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];
        attempts.push(now);
        this.attempts.set(key, attempts);
    }

    /**
     * Clear attempts for a key
     */
    clearAttempts(key) {
        this.attempts.delete(key);
    }

    /**
     * Get remaining time until next attempt allowed
     */
    getTimeUntilReset(key, windowMs = 15 * 60 * 1000) {
        const attempts = this.attempts.get(key) || [];
        if (attempts.length === 0) return 0;
        
        const oldestAttempt = Math.min(...attempts);
        const resetTime = oldestAttempt + windowMs;
        
        return Math.max(0, resetTime - Date.now());
    }
}

/**
 * Biometric Authentication Helper
 */
export class BiometricHelper {
    /**
     * Check if WebAuthn is supported
     */
    static isSupported() {
        return !!(navigator.credentials && navigator.credentials.create);
    }

    /**
     * Check if biometric authentication is available
     */
    static async isAvailable() {
        if (!this.isSupported()) {
            return false;
        }

        try {
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            return available;
        } catch (error) {
            console.error('❌ Biometric availability check failed:', error);
            return false;
        }
    }

    /**
     * Register biometric credential
     */
    static async register(userId, userName, userDisplayName, challenge) {
        try {
            if (!this.isSupported()) {
                throw new Error('WebAuthn not supported');
            }

            const publicKeyCredentialCreationOptions = {
                challenge: new TextEncoder().encode(challenge),
                rp: {
                    name: "Schoolbeheersysteem",
                    id: window.location.hostname,
                },
                user: {
                    id: new TextEncoder().encode(userId),
                    name: userName,
                    displayName: userDisplayName,
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" },
                    { alg: -257, type: "public-key" }
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                timeout: 60000,
                attestation: "direct"
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions
            });

            return {
                id: credential.id,
                rawId: Array.from(new Uint8Array(credential.rawId)),
                response: {
                    attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
                    clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
                },
                type: credential.type
            };

        } catch (error) {
            console.error('❌ Biometric registration failed:', error);
            throw error;
        }
    }

    /**
     * Authenticate with biometric credential
     */
    static async authenticate(challenge, allowCredentials = []) {
        try {
            if (!this.isSupported()) {
                throw new Error('WebAuthn not supported');
            }

            const publicKeyCredentialRequestOptions = {
                challenge: new TextEncoder().encode(challenge),
                allowCredentials: allowCredentials.map(cred => ({
                    id: new Uint8Array(cred.id),
                    type: 'public-key'
                })),
                userVerification: "required",
                timeout: 60000
            };

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions
            });

            return {
                id: assertion.id,
                rawId: Array.from(new Uint8Array(assertion.rawId)),
                response: {
                    authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
                    clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
                    signature: Array.from(new Uint8Array(assertion.response.signature)),
                    userHandle: assertion.response.userHandle ? Array.from(new Uint8Array(assertion.response.userHandle)) : null
                },
                type: assertion.type
            };

        } catch (error) {
            console.error('❌ Biometric authentication failed:', error);
            throw error;
        }
    }
}

/**
 * Auth Event Emitter
 */
export class AuthEventEmitter {
    constructor() {
        this.events = new Map();
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    off(event, callback) {
        if (this.events.has(event)) {
            const callbacks = this.events.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Event callback error for ${event}:`, error);
                }
            });
        }
    }

    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

/**
 * Utility functions
 */
export const authUtils = {
    /**
     * Format time duration
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
        return `${seconds}s`;
    },

    /**
     * Get user initials
     */
    getUserInitials(user) {
        if (!user) return '';
        
        const name = user.user_metadata?.full_name || user.email || '';
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    },

    /**
     * Get user display name
     */
    getUserDisplayName(user) {
        if (!user) return '';
        
        return user.user_metadata?.full_name || 
               user.user_metadata?.name || 
               user.email?.split('@')[0] || 
               'Unknown User';
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(user, roles) {
        if (!user || !roles || roles.length === 0) return false;
        
        const userRole = user.user_metadata?.role || user.app_metadata?.role;
        return roles.includes(userRole);
    },

    /**
     * Check if user has all of the specified permissions
     */
    hasAllPermissions(user, permissions) {
        if (!user || !permissions || permissions.length === 0) return true;
        
        const userPermissions = user.app_metadata?.permissions || [];
        return permissions.every(permission => userPermissions.includes(permission));
    },

    /**
     * Generate avatar URL
     */
    getAvatarUrl(user, size = 40) {
        if (!user) return null;
        
        // Use Gravatar as fallback
        const email = user.email || '';
        const hash = btoa(email.toLowerCase().trim());
        return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
    }
};
