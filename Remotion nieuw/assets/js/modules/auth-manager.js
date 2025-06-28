/* =================================
   AUTH-MANAGER.JS - Authentication Manager
   Schoolbeheersysteem v1.0.0
   
   Bevat: Login/logout, session management, 
   role validation, security, Supabase integratie
   ================================= */

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

class AuthManager {
    constructor(options = {}) {
        this.config = {
            supabaseUrl: options.supabaseUrl || process.env.SUPABASE_URL,
            supabaseKey: options.supabaseKey || process.env.SUPABASE_ANON_KEY,
            sessionTimeout: options.sessionTimeout || 8 * 60 * 60 * 1000, // 8 hours
            refreshThreshold: options.refreshThreshold || 5 * 60 * 1000, // 5 minutes
            maxLoginAttempts: options.maxLoginAttempts || 5,
            lockoutDuration: options.lockoutDuration || 15 * 60 * 1000, // 15 minutes
            csrfEnabled: options.csrfEnabled !== false,
            mfaEnabled: options.mfaEnabled || false,
            passwordPolicy: {
                minLength: 8,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                ...options.passwordPolicy
            }
        };

        this.supabase = null;
        this.currentUser = null;
        this.currentSession = null;
        this.refreshTimer = null;
        this.sessionCheckTimer = null;
        this.loginAttempts = new Map();
        this.csrfToken = null;
        this.eventListeners = new Map();
        
        // Bind methods
        this.handleAuthStateChange = this.handleAuthStateChange.bind(this);
        this.refreshSession = this.refreshSession.bind(this);
        this.checkAndRefreshSession = this.checkAndRefreshSession.bind(this);
        this.checkSessionTimeout = this.checkSessionTimeout.bind(this);
    }

    /* =================================
       INITIALIZATION
       ================================= */

    async init() {
        try {
            console.log('🔐 Initializing Auth Manager...');
            
            // Initialize Supabase client
            await this.initializeSupabase();
            
            // Generate CSRF token
            if (this.config.csrfEnabled) {
                this.generateCSRFToken();
            }
            
            // Setup session management
            this.setupSessionManagement();
            
            // Setup security headers
            this.setupSecurityHeaders();
            
            // Setup auth state listener
            this.setupAuthStateListener();
            
            // Check for existing session
            await this.checkExistingSession();
            
            // Setup periodic session checks
            this.startSessionMonitoring();
            
            console.log('✅ Auth Manager initialized successfully');
            this.emit('auth:initialized');
            
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Auth Manager:', error);
            this.emit('auth:error', { type: 'initialization', error });
            throw error;
        }
    }

    async initializeSupabase() {
        if (!this.config.supabaseUrl || !this.config.supabaseKey) {
            console.warn('⚠️ Supabase credentials not configured. Using demo mode.');
            // For demo purposes, create a mock client
            this.supabase = {
                auth: {
                    signInWithPassword: async () => ({ error: new Error('Demo mode - please configure Supabase') }),
                    signOut: async () => ({ error: null }),
                    getSession: async () => ({ data: { session: null }, error: null }),
                    refreshSession: async () => ({ error: new Error('Demo mode') }),
                    resetPasswordForEmail: async () => ({ error: null }),
                    updateUser: async () => ({ error: null }),
                    onAuthStateChange: () => {},
                    mfa: {
                        enroll: async () => ({ error: new Error('Demo mode') }),
                        verify: async () => ({ error: new Error('Demo mode') }),
                        unenroll: async () => ({ error: new Error('Demo mode') })
                    }
                }
            };
            return;
        }

        this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true,
                flowType: 'pkce'
            },
            global: {
                headers: {
                    'X-Client-Info': 'schoolbeheersysteem@1.0.0'
                }
            }
        });

        console.log('🔗 Supabase client initialized');
    }

    generateCSRFToken() {
        this.csrfToken = this.generateSecureToken(32);
        
        // Store in meta tag for form submissions
        let metaTag = document.querySelector('meta[name="csrf-token"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.setAttribute('name', 'csrf-token');
            document.head.appendChild(metaTag);
        }
        metaTag.setAttribute('content', this.csrfToken);
        
        console.log('🛡️ CSRF token generated');
    }

    setupSecurityHeaders() {
        // Only setup security headers if we're not in file:// protocol
        if (window.location.protocol === 'file:') {
            console.log('🛡️ Skipping security headers (file:// protocol)');
            return;
        }
        
        // Add security headers for XSS protection
        const securityHeaders = [
            { name: 'X-Content-Type-Options', content: 'nosniff' },
            { name: 'X-Frame-Options', content: 'DENY' },
            { name: 'X-XSS-Protection', content: '1; mode=block' },
            { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
        ];

        securityHeaders.forEach(header => {
            try {
                let metaTag = document.querySelector(`meta[http-equiv="${header.name}"]`);
                if (!metaTag) {
                    metaTag = document.createElement('meta');
                    metaTag.setAttribute('http-equiv', header.name);
                    metaTag.setAttribute('content', header.content);
                    document.head.appendChild(metaTag);
                }
            } catch (error) {
                console.warn(`⚠️ Could not set security header ${header.name}:`, error.message);
            }
        });

        console.log('🛡️ Security headers configured');
    }

    /* =================================
       AUTHENTICATION METHODS
       ================================= */

    async login(credentials) {
        try {
            console.log('🔐 Starting login process...');
            
            // Validate credentials
            this.validateCredentials(credentials);
            
            // Check for rate limiting
            this.checkRateLimit(credentials.email);
            
            // Validate CSRF token if enabled
            if (this.config.csrfEnabled && credentials.csrfToken !== this.csrfToken) {
                throw new Error('Invalid CSRF token');
            }
            
            // Sanitize input
            const sanitizedCredentials = this.sanitizeLoginInput(credentials);
            
            // Perform authentication
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: sanitizedCredentials.email,
                password: sanitizedCredentials.password
            });

            if (error) {
                this.handleLoginFailure(credentials.email, error);
                throw error;
            }

            // Clear login attempts on success
            this.loginAttempts.delete(credentials.email);
            
            // Process successful login
            await this.handleLoginSuccess(data);
            
            console.log('✅ Login successful');
            this.emit('auth:login', { user: this.currentUser, session: this.currentSession });
            
            return {
                success: true,
                user: this.currentUser,
                session: this.currentSession,
                requiresMFA: this.currentUser?.app_metadata?.mfa_enabled && !data.session?.amr?.includes('mfa')
            };

        } catch (error) {
            console.error('❌ Login failed:', error);
            this.emit('auth:loginError', { error });
            throw this.createAuthError(error);
        }
    }

    async loginWithMFA(token, sessionId) {
        try {
            console.log('🔐 Verifying MFA token...');
            
            if (!token || !sessionId) {
                throw new Error('MFA token and session ID are required');
            }

            const { data, error } = await this.supabase.auth.verifyOtp({
                token_hash: sessionId,
                type: 'mfa',
                token: token
            });

            if (error) {
                throw error;
            }

            await this.handleLoginSuccess(data);
            
            console.log('✅ MFA verification successful');
            this.emit('auth:mfaSuccess', { user: this.currentUser });
            
            return {
                success: true,
                user: this.currentUser,
                session: this.currentSession
            };

        } catch (error) {
            console.error('❌ MFA verification failed:', error);
            this.emit('auth:mfaError', { error });
            throw this.createAuthError(error);
        }
    }

    async logout() {
        try {
            console.log('🔐 Starting logout process...');
            
            // Clear timers
            this.clearTimers();
            
            // Sign out from Supabase
            const { error } = await this.supabase.auth.signOut();
            
            if (error) {
                console.warn('⚠️ Logout warning:', error);
            }
            
            // Clear local state
            this.clearAuthState();
            
            // Clear sensitive data from storage
            this.clearSensitiveStorage();
            
            console.log('✅ Logout successful');
            this.emit('auth:logout');
            
            return { success: true };

        } catch (error) {
            console.error('❌ Logout error:', error);
            this.emit('auth:logoutError', { error });
            
            // Force clear state even on error
            this.clearAuthState();
            
            throw this.createAuthError(error);
        }
    }

    /* =================================
       SESSION MANAGEMENT
       ================================= */

    setupSessionManagement() {
        // Setup automatic token refresh
        this.refreshTimer = setInterval(() => {
            this.checkAndRefreshSession();
        }, this.config.refreshThreshold);
        
        // Setup session timeout monitoring
        this.sessionCheckTimer = setInterval(() => {
            this.checkSessionTimeout();
        }, 60000); // Check every minute
        
        console.log('⏰ Session management configured');
    }

    async checkExistingSession() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.warn('⚠️ Session check error:', error);
                return null;
            }
            
            if (session) {
                console.log('🔄 Existing session found');
                await this.handleSessionRestoration(session);
                return session;
            }
            
            console.log('ℹ️ No existing session found');
            return null;
            
        } catch (error) {
            console.error('❌ Session check failed:', error);
            return null;
        }
    }

    async refreshSession() {
        try {
            if (!this.currentSession) {
                return null;
            }
            
            console.log('🔄 Refreshing session...');
            
            const { data, error } = await this.supabase.auth.refreshSession();
            
            if (error) {
                console.error('❌ Session refresh failed:', error);
                await this.handleSessionExpired();
                throw error;
            }
            
            if (data.session) {
                this.currentSession = data.session;
                this.currentUser = data.user;
                
                console.log('✅ Session refreshed successfully');
                this.emit('auth:sessionRefreshed', { session: this.currentSession });
                
                return data.session;
            }
            
            return null;
            
        } catch (error) {
            console.error('❌ Session refresh error:', error);
            this.emit('auth:sessionError', { error });
            throw error;
        }
    }

    async checkAndRefreshSession() {
        if (!this.currentSession) {
            return;
        }
        
        const expiresAt = new Date(this.currentSession.expires_at * 1000);
        const now = new Date();
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        
        // Refresh if session expires within threshold
        if (timeUntilExpiry <= this.config.refreshThreshold) {
            try {
                await this.refreshSession();
            } catch (error) {
                console.error('❌ Auto-refresh failed:', error);
                await this.handleSessionExpired();
            }
        }
    }

    checkSessionTimeout() {
        if (!this.currentSession) {
            return;
        }
        
        const lastActivity = this.getLastActivity();
        const now = Date.now();
        
        if (now - lastActivity > this.config.sessionTimeout) {
            console.log('⏰ Session timeout detected');
            this.handleSessionTimeout();
        }
    }

    /* =================================
       ROLE & PERMISSION VALIDATION
       ================================= */

    async validateRole(requiredRole, currentPath = null) {
        try {
            if (!this.isAuthenticated()) {
                return { valid: false, reason: 'not_authenticated' };
            }
            
            const userRole = this.getUserRole();
            
            if (!userRole) {
                return { valid: false, reason: 'no_role' };
            }
            
            // Check if user has required role
            const hasRole = this.checkRoleHierarchy(userRole, requiredRole);
            
            if (!hasRole) {
                console.warn(`⚠️ Access denied: User role '${userRole}' insufficient for '${requiredRole}'`);
                this.emit('auth:accessDenied', { userRole, requiredRole, path: currentPath });
                return { valid: false, reason: 'insufficient_role' };
            }
            
            // Additional path-based validation
            if (currentPath && !this.validatePathAccess(userRole, currentPath)) {
                return { valid: false, reason: 'path_restricted' };
            }
            
            return { valid: true, role: userRole };
            
        } catch (error) {
            console.error('❌ Role validation error:', error);
            return { valid: false, reason: 'validation_error', error };
        }
    }

    checkRoleHierarchy(userRole, requiredRole) {
        const roleHierarchy = {
            'admin': ['admin', 'school', 'teacher', 'student'],
            'school': ['school', 'teacher', 'student'],
            'teacher': ['teacher', 'student'],
            'student': ['student']
        };
        
        return roleHierarchy[userRole]?.includes(requiredRole) || false;
    }

    validatePathAccess(userRole, path) {
        const pathRestrictions = {
            'admin': ['/admin'],
            'school': ['/school'],
            'teacher': ['/teacher'],
            'student': ['/student']
        };
        
        const allowedPaths = pathRestrictions[userRole] || [];
        return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
    }

    async checkPermission(permission) {
        try {
            if (!this.isAuthenticated()) {
                return false;
            }
            
            const userPermissions = this.getUserPermissions();
            return userPermissions.includes(permission);
            
        } catch (error) {
            console.error('❌ Permission check error:', error);
            return false;
        }
    }

    /* =================================
       PASSWORD MANAGEMENT
       ================================= */

    async requestPasswordReset(email) {
        try {
            console.log('📧 Requesting password reset...');
            
            // Validate email
            if (!this.isValidEmail(email)) {
                throw new Error('Invalid email address');
            }
            
            // Sanitize email
            const sanitizedEmail = this.sanitizeInput(email);
            
            const { error } = await this.supabase.auth.resetPasswordForEmail(sanitizedEmail, {
                redirectTo: `${window.location.origin}/auth/reset-password`
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Password reset email sent');
            this.emit('auth:passwordResetRequested', { email: sanitizedEmail });
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Password reset request failed:', error);
            this.emit('auth:passwordResetError', { error });
            throw this.createAuthError(error);
        }
    }

    async resetPassword(newPassword, accessToken, refreshToken) {
        try {
            console.log('🔒 Resetting password...');
            
            // Validate password
            this.validatePassword(newPassword);
            
            // Set session with tokens
            const { error: sessionError } = await this.supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
            });
            
            if (sessionError) {
                throw sessionError;
            }
            
            // Update password
            const { error } = await this.supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ Password reset successful');
            this.emit('auth:passwordReset');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ Password reset failed:', error);
            this.emit('auth:passwordResetError', { error });
            throw this.createAuthError(error);
        }
    }

    validatePassword(password) {
        const policy = this.config.passwordPolicy;
        const errors = [];
        
        if (password.length < policy.minLength) {
            errors.push(`Password must be at least ${policy.minLength} characters long`);
        }
        
        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        
        if (policy.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        
        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        
        if (errors.length > 0) {
            throw new Error(`Password validation failed: ${errors.join(', ')}`);
        }
        
        return true;
    }

    /* =================================
       MULTI-FACTOR AUTHENTICATION
       ================================= */

    async enableMFA() {
        try {
            if (!this.isAuthenticated()) {
                throw new Error('User must be authenticated to enable MFA');
            }
            
            console.log('🔐 Enabling MFA...');
            
            const { data, error } = await this.supabase.auth.mfa.enroll({
                factorType: 'totp',
                friendlyName: 'Schoolbeheersysteem TOTP'
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ MFA enrollment initiated');
            this.emit('auth:mfaEnrollmentStarted', { data });
            
            return {
                success: true,
                qrCode: data.totp.qr_code,
                secret: data.totp.secret,
                uri: data.totp.uri
            };
            
        } catch (error) {
            console.error('❌ MFA enable failed:', error);
            this.emit('auth:mfaError', { error });
            throw this.createAuthError(error);
        }
    }

    async verifyMFASetup(factorId, code) {
        try {
            console.log('🔐 Verifying MFA setup...');
            
            const { data, error } = await this.supabase.auth.mfa.verify({
                factorId: factorId,
                challengeId: factorId, // Using factorId as challengeId for TOTP
                code: code
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ MFA setup verified');
            this.emit('auth:mfaSetupComplete');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ MFA verification failed:', error);
            this.emit('auth:mfaError', { error });
            throw this.createAuthError(error);
        }
    }

    async disableMFA(factorId) {
        try {
            console.log('🔐 Disabling MFA...');
            
            const { error } = await this.supabase.auth.mfa.unenroll({
                factorId: factorId
            });
            
            if (error) {
                throw error;
            }
            
            console.log('✅ MFA disabled');
            this.emit('auth:mfaDisabled');
            
            return { success: true };
            
        } catch (error) {
            console.error('❌ MFA disable failed:', error);
            this.emit('auth:mfaError', { error });
            throw this.createAuthError(error);
        }
    }

    /* =================================
       UTILITY METHODS
       ================================= */

    isAuthenticated() {
        return !!(this.currentUser && this.currentSession);
    }

    getUser() {
        return this.currentUser;
    }

    getSession() {
        return this.currentSession;
    }

    getUserRole() {
        return this.currentUser?.user_metadata?.role || this.currentUser?.app_metadata?.role;
    }

    getUserPermissions() {
        return this.currentUser?.app_metadata?.permissions || [];
    }

    getAccessToken() {
        return this.currentSession?.access_token;
    }

    getCSRFToken() {
        return this.csrfToken;
    }

    /* =================================
       SECURITY HELPERS
       ================================= */

    validateCredentials(credentials) {
        if (!credentials.email || !credentials.password) {
            throw new Error('Email and password are required');
        }
        
        if (!this.isValidEmail(credentials.email)) {
            throw new Error('Invalid email format');
        }
        
        if (credentials.password.length < 6) {
            throw new Error('Password too short');
        }
    }

    sanitizeLoginInput(credentials) {
        return {
            email: this.sanitizeInput(credentials.email).toLowerCase(),
            password: credentials.password // Don't sanitize password
        };
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove basic XSS characters
            .slice(0, 255); // Limit length
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    checkRateLimit(email) {
        const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
        const now = Date.now();
        
        // Reset attempts if lockout period has passed
        if (now - attempts.lastAttempt > this.config.lockoutDuration) {
            attempts.count = 0;
        }
        
        if (attempts.count >= this.config.maxLoginAttempts) {
            const timeLeft = this.config.lockoutDuration - (now - attempts.lastAttempt);
            throw new Error(`Too many login attempts. Try again in ${Math.ceil(timeLeft / 60000)} minutes.`);
        }
    }

    /* =================================
       EVENT HANDLERS
       ================================= */

    setupAuthStateListener() {
        this.supabase.auth.onAuthStateChange(this.handleAuthStateChange);
        console.log('👂 Auth state listener configured');
    }

    async handleAuthStateChange(event, session) {
        console.log('🔄 Auth state changed:', event);
        
        switch (event) {
            case 'SIGNED_IN':
                if (session) {
                    this.currentSession = session;
                    this.currentUser = session.user;
                    this.updateLastActivity();
                    this.emit('auth:signedIn', { user: this.currentUser, session });
                }
                break;
                
            case 'SIGNED_OUT':
                this.clearAuthState();
                this.emit('auth:signedOut');
                break;
                
            case 'TOKEN_REFRESHED':
                if (session) {
                    this.currentSession = session;
                    this.currentUser = session.user;
                    this.emit('auth:tokenRefreshed', { session });
                }
                break;
                
            case 'USER_UPDATED':
                if (session) {
                    this.currentUser = session.user;
                    this.emit('auth:userUpdated', { user: this.currentUser });
                }
                break;
        }
    }

    async handleLoginSuccess(data) {
        this.currentSession = data.session;
        this.currentUser = data.user;
        this.updateLastActivity();
        
        // Store session info securely
        this.storeSessionInfo();
        
        // Setup session monitoring
        this.startSessionMonitoring();
    }

    handleLoginFailure(email, error) {
        const attempts = this.loginAttempts.get(email) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = Date.now();
        this.loginAttempts.set(email, attempts);
        
        console.warn(`⚠️ Login attempt ${attempts.count} failed for ${email}`);
    }

    async handleSessionExpired() {
        console.log('⏰ Session expired');
        this.clearAuthState();
        this.emit('auth:sessionExpired');
    }

    async handleSessionTimeout() {
        console.log('⏰ Session timeout');
        await this.logout();
        this.emit('auth:sessionTimeout');
    }

    async handleSessionRestoration(session) {
        this.currentSession = session;
        this.currentUser = session.user;
        this.updateLastActivity();
        
        console.log('🔄 Session restored for user:', this.currentUser.email);
        this.emit('auth:sessionRestored', { user: this.currentUser, session });
    }

    /* =================================
       STORAGE & CLEANUP
       ================================= */

    storeSessionInfo() {
        if (this.currentSession) {
            // Store minimal session info in sessionStorage
            sessionStorage.setItem('auth_session_info', JSON.stringify({
                expires_at: this.currentSession.expires_at,
                user_id: this.currentUser.id,
                role: this.getUserRole()
            }));
        }
    }

    updateLastActivity() {
        localStorage.setItem('auth_last_activity', Date.now().toString());
    }

    getLastActivity() {
        const lastActivity = localStorage.getItem('auth_last_activity');
        return lastActivity ? parseInt(lastActivity) : Date.now();
    }

    clearAuthState() {
        this.currentUser = null;
        this.currentSession = null;
        this.clearTimers();
    }

    clearSensitiveStorage() {
        // Clear sensitive data from storage
        sessionStorage.removeItem('auth_session_info');
        localStorage.removeItem('auth_last_activity');
        
        // Clear any cached auth tokens
        const authKeys = ['supabase.auth.token', 'auth_token', 'refresh_token'];
        authKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
    }

    clearTimers() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
        
        if (this.sessionCheckTimer) {
            clearInterval(this.sessionCheckTimer);
            this.sessionCheckTimer = null;
        }
    }

    startSessionMonitoring() {
        this.setupSessionManagement();
    }

    /* =================================
       ERROR HANDLING
       ================================= */

    createAuthError(error) {
        const authError = new Error(error.message || 'Authentication error');
        authError.code = error.code || 'AUTH_ERROR';
        authError.status = error.status || 500;
        authError.originalError = error;
        return authError;
    }

    /* =================================
       EVENT SYSTEM
       ================================= */

    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Event callback error for ${event}:`, error);
                }
            });
        }
    }

    /* =================================
       CLEANUP
       ================================= */

    destroy() {
        console.log('🧹 Destroying Auth Manager...');
        
        // Clear timers
        this.clearTimers();
        
        // Clear state
        this.clearAuthState();
        
        // Clear event listeners
        this.eventListeners.clear();
        
        // Clear login attempts
        this.loginAttempts.clear();
        
        console.log('✅ Auth Manager destroyed');
    }
}

export default AuthManager;
