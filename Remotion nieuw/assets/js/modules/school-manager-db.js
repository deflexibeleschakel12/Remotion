/* =================================
   SCHOOL-MANAGER-DB.JS - Database-enabled School Manager
   Schoolbeheersysteem v1.0.0
   
   Nieuwe versie die Supabase DatabaseManager gebruikt
   in plaats van localStorage
   ================================= */

import DatabaseManager from './database-manager.js';

class SchoolManagerDB {
    constructor(options = {}) {
        this.databaseManager = null;
        this.schools = [];
        this.isLoading = false;
        this.subscribers = new Map();
        
        // Configuration
        this.config = {
            supabaseUrl: options.supabaseUrl || 'YOUR_SUPABASE_URL',
            supabaseKey: options.supabaseKey || 'YOUR_SUPABASE_ANON_KEY',
            enableOfflineMode: options.enableOfflineMode !== false,
            enableRealtime: options.enableRealtime !== false,
            ...options
        };
        
        this.init();
    }

    /* =================================
       INITIALIZATION
       ================================= */

    async init() {
        try {
            console.log('🚀 Initializing SchoolManagerDB...');
            
            // Show loading state
            this.setLoadingState(true);
            
            // Initialize database manager
            this.databaseManager = new DatabaseManager(this.config);
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load schools from database
            await this.loadSchools();
            
            // Render UI
            this.renderSchoolList();
            this.updateStats();
            
            console.log('✅ SchoolManagerDB initialization complete');
        } catch (error) {
            console.error('❌ SchoolManagerDB initialization failed:', error);
            
            // Fallback to localStorage mode
            if (this.config.enableOfflineMode) {
                console.log('🔄 Falling back to offline mode...');
                await this.initOfflineMode();
            } else {
                this.showError('Database verbinding mislukt. Probeer de pagina te vernieuwen.');
            }
        } finally {
            this.setLoadingState(false);
        }
    }

    async initOfflineMode() {
        console.log('📱 Initializing offline mode...');
        
        // Load from localStorage as fallback
        const stored = localStorage.getItem('admin_schools');
        if (stored) {
            this.schools = JSON.parse(stored);
        } else {
            // Use default demo schools
            this.schools = this.getDefaultDemoSchools();
            this.saveToLocalStorage();
        }
        
        this.renderSchoolList();
        this.updateStats();
        
        // Show offline indicator
        this.showOfflineIndicator();
    }

    setupEventListeners() {
        if (this.databaseManager) {
            // Listen for realtime updates
            this.databaseManager.on('dataUpdated', (data) => {
                console.log('🔄 Database update received:', data);
                if (data.table === 'schools') {
                    this.handleRealtimeUpdate(data);
                }
            });
        }
        
        // Listen for online/offline events
        window.addEventListener('online', () => this.handleConnectionChange('online'));
        window.addEventListener('offline', () => this.handleConnectionChange('offline'));
    }

    /* =================================
       SCHOOL MANAGEMENT
       ================================= */

    async loadSchools() {
        try {
            console.log('📚 Loading schools from database...');
            this.schools = await this.databaseManager.getSchools();
            console.log(`✅ Loaded ${this.schools.length} schools`);
        } catch (error) {
            console.error('❌ Error loading schools:', error);
            
            // Fallback to localStorage
            const stored = localStorage.getItem('admin_schools');
            if (stored) {
                this.schools = JSON.parse(stored);
                console.log('📱 Loaded schools from localStorage backup');
            } else {
                this.schools = this.getDefaultDemoSchools();
                console.log('🎯 Using default demo schools');
            }
        }
    }

    async addSchool(schoolData) {
        try {
            console.log('➕ Adding school:', schoolData.name);
            this.setLoadingState(true);

            let newSchool;
            if (this.databaseManager) {
                // Add to database
                newSchool = await this.databaseManager.createSchool(schoolData);
                
                // Update local array
                this.schools.unshift(newSchool);
            } else {
                // Offline mode - add to localStorage
                newSchool = this.createOfflineSchool(schoolData);
                this.schools.unshift(newSchool);
                this.saveToLocalStorage();
            }

            // Update UI
            this.renderSchoolList();
            this.updateStats();

            console.log('✅ School added successfully:', newSchool.name);
            return newSchool;
        } catch (error) {
            console.error('❌ Error adding school:', error);
            throw error;
        } finally {
            this.setLoadingState(false);
        }
    }

    async updateSchool(schoolId, schoolData) {
        try {
            console.log('💾 Updating school:', schoolId);
            this.setLoadingState(true);

            let updatedSchool;
            if (this.databaseManager) {
                // Update in database
                updatedSchool = await this.databaseManager.updateSchool(schoolId, schoolData);
                
                // Update local array
                const index = this.schools.findIndex(s => s.id.toString() === schoolId.toString());
                if (index !== -1) {
                    this.schools[index] = updatedSchool;
                }
            } else {
                // Offline mode - update in localStorage
                const index = this.schools.findIndex(s => s.id === schoolId);
                if (index !== -1) {
                    updatedSchool = { ...this.schools[index], ...schoolData };
                    this.schools[index] = updatedSchool;
                    this.saveToLocalStorage();
                }
            }

            // Update UI
            this.renderSchoolList();
            this.updateStats();

            console.log('✅ School updated successfully:', updatedSchool?.name);
            return updatedSchool;
        } catch (error) {
            console.error('❌ Error updating school:', error);
            throw error;
        } finally {
            this.setLoadingState(false);
        }
    }

    async removeSchool(schoolId) {
        try {
            console.log('🗑️ Removing school:', schoolId);
            this.setLoadingState(true);

            if (this.databaseManager) {
                // Remove from database
                await this.databaseManager.deleteSchool(schoolId);
            }
            
            // Remove from local array
            this.schools = this.schools.filter(s => s.id.toString() !== schoolId.toString());
            
            if (!this.databaseManager) {
                // Save to localStorage in offline mode
                this.saveToLocalStorage();
            }

            // Update UI
            this.renderSchoolList();
            this.updateStats();

            console.log('✅ School removed successfully');
        } catch (error) {
            console.error('❌ Error removing school:', error);
            throw error;
        } finally {
            this.setLoadingState(false);
        }
    }

    async updateSchoolLastLogin(schoolId) {
        try {
            if (this.databaseManager) {
                await this.databaseManager.updateSchoolLastLogin(schoolId);
            }
            
            // Update local array
            const school = this.schools.find(s => s.id.toString() === schoolId.toString());
            if (school) {
                school.lastLogin = new Date().toISOString();
                
                if (!this.databaseManager) {
                    this.saveToLocalStorage();
                }
            }
        } catch (error) {
            console.error('❌ Error updating school last login:', error);
        }
    }

    /* =================================
       UI MANAGEMENT
       ================================= */

    renderSchoolList() {
        const container = document.getElementById('schoolList');
        if (!container) return;

        if (this.schools.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏫</div>
                    <h3>Nog geen scholen geregistreerd</h3>
                    <p>Voeg je eerste school toe om te beginnen met het beheren van het schoolsysteem.</p>
                    <button class="btn-primary" onclick="openAddSchoolModal()">
                        ➕ Eerste School Toevoegen
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = this.schools.map(school => this.renderSchoolCard(school)).join('');
        console.log(`✅ Rendered ${this.schools.length} schools in list`);
    }

    renderSchoolCard(school) {
        const lastLoginText = school.lastLogin 
            ? new Date(school.lastLogin).toLocaleDateString('nl-NL')
            : 'Nog niet ingelogd';

        const offlineIndicator = school.isOffline 
            ? '<span class="offline-badge">📱 Offline</span>' 
            : '';

        return `
            <div class="school-item ${school.isOffline ? 'offline' : ''}" data-school-id="${school.id}">
                <div class="school-header">
                    <div class="school-info">
                        <h3>🏫 ${school.name} ${offlineIndicator}</h3>
                        <div class="school-meta">
                            <span class="school-type">${this.formatSchoolType(school.type)}</span>
                            <span class="school-status status-${school.status}">${school.status}</span>
                        </div>
                    </div>
                    <div class="school-stats">
                        <div class="stat-item">
                            <span class="stat-number">${school.studentCount || 0}</span>
                            <span class="stat-label">Leerlingen</span>
                        </div>
                    </div>
                </div>

                <div class="school-details">
                    <div class="detail-row">
                        <span>📍 Adres:</span>
                        <span>${school.address || 'Niet opgegeven'}</span>
                    </div>
                    <div class="detail-row">
                        <span>👤 Beheerder:</span>
                        <span>${school.adminName}</span>
                    </div>
                    <div class="detail-row">
                        <span>📧 Email:</span>
                        <span>${school.adminEmail}</span>
                    </div>
                    <div class="detail-row">
                        <span>📞 Telefoon:</span>
                        <span>${school.adminPhone || 'Niet opgegeven'}</span>
                    </div>
                    <div class="detail-row">
                        <span>🔐 Laatste login:</span>
                        <span>${lastLoginText}</span>
                    </div>
                </div>

                ${school.credentials ? `
                    <div class="school-credentials">
                        <h4>🔑 Inloggegevens Beheerder</h4>
                        <p><strong>Gebruikersnaam:</strong> ${school.credentials.username}</p>
                        <p><strong>Wachtwoord:</strong> ${school.credentials.password}</p>
                        <p style="font-size: 0.75rem; opacity: 0.7; margin-top: 0.5rem;">
                            ⚠️ Deze gegevens zijn alleen zichtbaar voor systeembeheerders
                        </p>
                    </div>
                ` : ''}

                <div class="school-actions">
                    <button class="school-action-btn" onclick="viewSchoolDetails('${school.id}')">
                        👁️ Details
                    </button>
                    <button class="school-action-btn" onclick="editSchool('${school.id}')">
                        ✏️ Bewerken
                    </button>
                    <button class="school-action-btn" onclick="loginAsSchool('${school.id}')">
                        🚪 Inloggen als School
                    </button>
                    <button class="school-action-btn danger" onclick="removeSchool('${school.id}')" 
                            title="School verwijderen">
                        🗑️ Verwijderen
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        try {
            const totalSchools = this.schools.length;
            const totalStudents = this.schools.reduce((sum, school) => 
                sum + (parseInt(school.studentCount) || 0), 0
            );
            
            // Update DOM elements
            const elements = {
                'totalSchools': totalSchools,
                'totalStudents': totalStudents.toLocaleString('nl-NL')
            };
            
            Object.entries(elements).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = value;
                }
            });
            
            // Animate counters
            setTimeout(() => this.animateStats(), 100);
        } catch (error) {
            console.error('❌ Error updating stats:', error);
        }
    }

    animateStats() {
        // Simple counter animation
        const statElements = document.querySelectorAll('.stat-card h3');
        statElements.forEach(element => {
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        });
    }

    /* =================================
       UTILITY FUNCTIONS
       ================================= */

    formatSchoolType(type) {
        const types = {
            'basisschool': 'Basisschool',
            'middelbare-school': 'Middelbare School',
            'vmbo': 'VMBO',
            'havo': 'HAVO',
            'vwo': 'VWO',
            'mbo': 'MBO',
            'university': 'Universiteit',
            'other': 'Anders'
        };
        return types[type] || type;
    }

    createOfflineSchool(schoolData) {
        const credentials = this.generateCredentials(schoolData.name);
        
        return {
            id: `offline_${Date.now()}`,
            ...schoolData,
            credentials,
            status: 'active',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isOffline: true
        };
    }

    generateCredentials(schoolName) {
        const cleanName = schoolName.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 8);
        
        const username = `${cleanName}_admin`;
        const password = this.generateSecurePassword();
        
        return { username, password };
    }

    generateSecurePassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        
        // Ensure at least one of each type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%'[Math.floor(Math.random() * 5)];
        
        // Fill the rest
        for (let i = 4; i < 12; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    getDefaultDemoSchools() {
        return [
            {
                id: 'school_1',
                name: 'Basisschool De Regenboog',
                type: 'basisschool',
                studentCount: 287,
                address: 'Schoolstraat 12, 1234 AB Amsterdam',
                adminName: 'Mevr. van der Berg',
                adminEmail: 'j.vandenberg@regenboog.nl',
                adminPhone: '06-12345678',
                notes: 'Actieve school met moderne faciliteiten',
                credentials: {
                    username: 'regenboog_admin',
                    password: 'RB2024_Secure!'
                },
                status: 'active',
                createdAt: new Date('2024-01-15').toISOString(),
                lastLogin: new Date('2024-01-20').toISOString()
            },
            {
                id: 'school_2',
                name: 'Middelbare School Het Kompas',
                type: 'middelbare-school',
                studentCount: 542,
                address: 'Leerlinglaan 45, 5678 CD Rotterdam',
                adminName: 'Dhr. Jansen',
                adminEmail: 'p.jansen@kompas.edu.nl',
                adminPhone: '010-1234567',
                notes: 'HAVO/VWO met technische profielen',
                credentials: {
                    username: 'kompas_admin',
                    password: 'KMP2024_Safe!'
                },
                status: 'active',
                createdAt: new Date('2024-01-10').toISOString(),
                lastLogin: new Date('2024-01-19').toISOString()
            }
        ];
    }

    /* =================================
       OFFLINE SUPPORT
       ================================= */

    saveToLocalStorage() {
        try {
            localStorage.setItem('admin_schools', JSON.stringify(this.schools));
            console.log('💾 Schools saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving to localStorage:', error);
        }
    }

    showOfflineIndicator() {
        // Add offline indicator to UI
        const indicator = document.createElement('div');
        indicator.className = 'offline-indicator';
        indicator.innerHTML = '📱 Offline modus - wijzigingen worden gesynchroniseerd wanneer de verbinding hersteld is';
        document.body.prepend(indicator);
    }

    hideOfflineIndicator() {
        const indicator = document.querySelector('.offline-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /* =================================
       REALTIME UPDATES
       ================================= */

    handleRealtimeUpdate(data) {
        console.log('🔄 Handling realtime update:', data);
        
        switch (data.eventType) {
            case 'INSERT':
                // Add new school to list
                this.schools.unshift(data.record);
                break;
            case 'UPDATE':
                // Update existing school
                const updateIndex = this.schools.findIndex(s => s.id === data.record.id);
                if (updateIndex !== -1) {
                    this.schools[updateIndex] = data.record;
                }
                break;
            case 'DELETE':
                // Remove school from list
                this.schools = this.schools.filter(s => s.id !== data.record.id);
                break;
        }
        
        // Update UI
        this.renderSchoolList();
        this.updateStats();
        
        // Emit event for other components
        this.emit('schoolsUpdated', { schools: this.schools, change: data });
    }

    handleConnectionChange(status) {
        console.log(`🌐 Connection status changed: ${status}`);
        
        if (status === 'online') {
            this.hideOfflineIndicator();
            // Try to reconnect database
            if (!this.databaseManager) {
                this.init();
            }
        } else {
            this.showOfflineIndicator();
        }
    }

    /* =================================
       STATE MANAGEMENT
       ================================= */

    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        
        // Update UI loading indicators
        const loadingElements = document.querySelectorAll('.loading-indicator');
        loadingElements.forEach(el => {
            el.style.display = isLoading ? 'block' : 'none';
        });
        
        // Disable/enable buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.disabled = isLoading;
        });
    }

    showError(message) {
        console.error('❌ Error:', message);
        
        // Show error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div class="error-content">
                <span class="error-icon">❌</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            </div>
        `;
        document.body.prepend(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /* =================================
       EVENT SYSTEM
       ================================= */

    on(event, callback) {
        if (!this.subscribers.has(event)) {
            this.subscribers.set(event, []);
        }
        this.subscribers.get(event).push(callback);
    }

    off(event, callback) {
        if (this.subscribers.has(event)) {
            const callbacks = this.subscribers.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.subscribers.has(event)) {
            this.subscribers.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Error in event callback for ${event}:`, error);
                }
            });
        }
    }

    /* =================================
       PUBLIC API
       ================================= */

    // Method to check if database is available
    isDatabaseAvailable() {
        return this.databaseManager && !this.isLoading;
    }

    // Method to force sync with database
    async syncWithDatabase() {
        if (this.databaseManager) {
            await this.loadSchools();
            this.renderSchoolList();
            this.updateStats();
        }
    }

    // Method to export data
    exportData() {
        const data = {
            schools: this.schools,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `school-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    /* =================================
       CLEANUP
       ================================= */

    destroy() {
        // Remove event listeners
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
        
        // Clear subscribers
        this.subscribers.clear();
        
        // Cleanup database manager
        if (this.databaseManager) {
            this.databaseManager.destroy();
        }
        
        console.log('🧹 SchoolManagerDB cleaned up');
    }
}

export default SchoolManagerDB;
