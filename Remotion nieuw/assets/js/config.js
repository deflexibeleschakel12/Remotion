/* =================================
   CONFIG.JS - Supabase Configuration
   Schoolbeheersysteem v1.0.0
   
   Configuratie voor Supabase database verbinding
   ================================= */

// Supabase Configuration
// BELANGRIJK: Vervang deze waarden met je eigen Supabase project instellingen
export const SUPABASE_CONFIG = {
    // Je Supabase project URL (bijv. https://jouwproject.supabase.co)
    url: 'https://vsynvrkgcycvoaonnwmj.supabase.co',
    
    // Je Supabase public anon key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeW52cmtnY3ljdm9hb25ud21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTUwNDgsImV4cCI6MjA2NDE5MTA0OH0.xaz2weA-4JDnnhuPcemvBzfuSbYBMZfAxgKlRNPbvsk',
    
    // Optionele instellingen
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        },
        global: {
            headers: {
                'X-Client-Info': 'schoolbeheersysteem@1.0.0'
            }
        }
    }
};

// Database Manager Configuration
export const DATABASE_CONFIG = {
    retryAttempts: 3,
    retryDelay: 1000,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    enableRealtime: true,
    enableOfflineMode: true
};

// Feature Flags
export const FEATURES = {
    // Database features
    useSupabaseDatabase: true, // Set to false to use localStorage only
    enableRealtimeSync: true,
    enableOfflineSupport: true,
    enableDataExport: true,
    
    // UI features
    enableDarkMode: true,
    enableAnimations: true,
    enableNotifications: true,
    
    // Advanced features
    enableAuditLog: true,
    enableAdvancedSearch: true,
    enableBulkOperations: true
};

// Environment Detection
export const ENVIRONMENT = {
    isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    enableDebugMode: window.location.search.includes('debug=true')
};

// API Endpoints (for future use)
export const API_ENDPOINTS = {
    schools: '/api/schools',
    classes: '/api/classes',
    teachers: '/api/teachers',
    students: '/api/students',
    auth: '/api/auth',
    reports: '/api/reports'
};

// Error Messages
export const ERROR_MESSAGES = {
    database: {
        connectionFailed: 'Kan geen verbinding maken met de database. Controleer je internetverbinding.',
        queryFailed: 'Database query mislukt. Probeer het opnieuw.',
        insertFailed: 'Kan gegevens niet opslaan. Probeer het opnieuw.',
        updateFailed: 'Kan gegevens niet bijwerken. Probeer het opnieuw.',
        deleteFailed: 'Kan gegevens niet verwijderen. Probeer het opnieuw.'
    },
    auth: {
        loginFailed: 'Inloggen mislukt. Controleer je gegevens.',
        sessionExpired: 'Je sessie is verlopen. Log opnieuw in.',
        accessDenied: 'Je hebt geen toegang tot deze functie.',
        invalidCredentials: 'Ongeldige inloggegevens.'
    },
    validation: {
        requiredField: 'Dit veld is verplicht.',
        invalidEmail: 'Ongeldig e-mailadres.',
        invalidPhone: 'Ongeldig telefoonnummer.',
        tooShort: 'Dit veld is te kort.',
        tooLong: 'Dit veld is te lang.'
    }
};

// Success Messages
export const SUCCESS_MESSAGES = {
    school: {
        created: 'School is succesvol toegevoegd!',
        updated: 'School is succesvol bijgewerkt!',
        deleted: 'School is succesvol verwijderd!'
    },
    class: {
        created: 'Klas is succesvol toegevoegd!',
        updated: 'Klas is succesvol bijgewerkt!',
        deleted: 'Klas is succesvol verwijderd!'
    },
    teacher: {
        created: 'Leerkracht is succesvol toegevoegd!',
        updated: 'Leerkracht is succesvol bijgewerkt!',
        deleted: 'Leerkracht is succesvol verwijderd!'
    },
    student: {
        created: 'Leerling is succesvol toegevoegd!',
        updated: 'Leerling is succesvol bijgewerkt!',
        deleted: 'Leerling is succesvol verwijderd!'
    }
};

// Validation Rules
export const VALIDATION_RULES = {
    school: {
        name: { required: true, minLength: 2, maxLength: 255 },
        adminName: { required: true, minLength: 2, maxLength: 255 },
        adminEmail: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        adminPhone: { pattern: /^[0-9\-\+\s\(\)]+$/ },
        studentCount: { min: 0, max: 10000 }
    },
    class: {
        className: { required: true, minLength: 1, maxLength: 100 },
        classLevel: { required: true, min: 1, max: 12 },
        maxStudents: { min: 1, max: 100 }
    },
    teacher: {
        firstName: { required: true, minLength: 2, maxLength: 100 },
        lastName: { required: true, minLength: 2, maxLength: 100 },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        phone: { pattern: /^[0-9\-\+\s\(\)]+$/ }
    },
    student: {
        firstName: { required: true, minLength: 2, maxLength: 100 },
        lastName: { required: true, minLength: 2, maxLength: 100 },
        birthDate: { required: false },
        parentEmail: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
    }
};

// UI Constants
export const UI_CONSTANTS = {
    animationDuration: 300,
    toastDuration: 5000,
    loadingDelay: 500,
    searchDebounceDelay: 300,
    autoSaveDelay: 2000
};

// School Types
export const SCHOOL_TYPES = [
    { value: 'basisschool', label: 'Basisschool' },
    { value: 'middelbare-school', label: 'Middelbare School' },
    { value: 'vmbo', label: 'VMBO' },
    { value: 'havo', label: 'HAVO' },
    { value: 'vwo', label: 'VWO' },
    { value: 'mbo', label: 'MBO' },
    { value: 'university', label: 'Universiteit' },
    { value: 'other', label: 'Anders' }
];

// User Roles
export const USER_ROLES = [
    { value: 'admin', label: 'Systeembeheerder' },
    { value: 'school_admin', label: 'Schoolbeheerder' },
    { value: 'teacher', label: 'Leerkracht' },
    { value: 'student', label: 'Leerling' }
];

// Export all configurations
export default {
    SUPABASE_CONFIG,
    DATABASE_CONFIG,
    FEATURES,
    ENVIRONMENT,
    API_ENDPOINTS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    VALIDATION_RULES,
    UI_CONSTANTS,
    SCHOOL_TYPES,
    USER_ROLES
};
