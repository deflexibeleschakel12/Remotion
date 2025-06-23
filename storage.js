// Storage Module - Correct werkend met integratedLearningSystem
const Storage = (function() {
    'use strict';
    
    const STORAGE_KEYS = {
        INTEGRATED_SYSTEM: 'integratedLearningSystem',
        TIMELINE: 'timeline',
        TASK_COMPLETIONS: 'taskCompletions',
        CLOUD_SYNC: 'cloudSyncEnabled',
        LAST_SYNC: 'lastSyncTime'
    };
    
    // Generic save function
    function save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
            return false;
        }
    }
    
    // Generic load function
    function load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error loading ${key}:`, error);
            return defaultValue;
        }
    }
    
    // Save all app data
    function saveAllData() {
        console.log('💾 Saving all data...');
        
        const systemData = load(STORAGE_KEYS.INTEGRATED_SYSTEM, {});
        
        // Update with current window variables
        systemData.students = window.students || systemData.students || [];
        systemData.tasks = window.tasks || systemData.tasks || [];
        systemData.subjects = window.subjects || systemData.subjects || [];
        systemData.logbookEntries = window.logbookEntries || systemData.logbookEntries || [];
        systemData.feedbackEntries = window.feedbackEntries || systemData.feedbackEntries || [];
        systemData.personalGoals = window.personalGoals || systemData.personalGoals || [];
        systemData.milestones = window.milestones || systemData.milestones || [];
        systemData.customTokens = window.customTokens || systemData.customTokens || [];
        systemData.timeline = window.timeline || systemData.timeline || [];
        systemData.groups = window.groups || systemData.groups || [];
        systemData.reflectionCards = window.reflectionCards || systemData.reflectionCards || {};
        systemData.lastSaved = new Date().toISOString();
        
        const success = save(STORAGE_KEYS.INTEGRATED_SYSTEM, systemData);
        
        if (success) {
            console.log('✅ All data saved successfully');
        } else {
            console.error('⚠️ Data save failed');
        }
        
        return success;
    }
    
    // Load all app data
    function loadAllData() {
        console.log('📂 Loading all data...');
        
        const systemData = load(STORAGE_KEYS.INTEGRATED_SYSTEM, {});
        
        if (systemData && Object.keys(systemData).length > 0) {
            // Load all data from integrated system
            window.students = systemData.students || [];
            window.tasks = systemData.tasks || [];
            window.subjects = systemData.subjects || [];
            window.logbookEntries = systemData.logbookEntries || [];
            window.feedbackEntries = systemData.feedbackEntries || [];
            window.personalGoals = systemData.personalGoals || [];
            window.milestones = systemData.milestones || [];
            window.customTokens = systemData.customTokens || [];
            window.timeline = systemData.timeline || [];
            window.groups = systemData.groups || [];
            window.reflectionCards = systemData.reflectionCards || {};
            
            console.log('✅ Data loaded:', {
                students: window.students.length,
                tasks: window.tasks.length,
                timeline: window.timeline.length
            });
        } else {
            console.log('⚠️ No integrated system data found, initializing empty...');
            // Initialize empty arrays
            window.students = [];
            window.tasks = [];
            window.subjects = [];
            window.logbookEntries = [];
            window.feedbackEntries = [];
            window.personalGoals = [];
            window.milestones = [];
            window.customTokens = [];
            window.timeline = [];
            window.groups = [];
            window.reflectionCards = {};
        }
        
        // Also load separate timeline if it exists
        const separateTimeline = load(STORAGE_KEYS.TIMELINE, []);
        if (separateTimeline.length > 0 && window.timeline.length === 0) {
            window.timeline = separateTimeline;
        }
    }
    
    // Get specific data
    function getStudents() {
        const systemData = load(STORAGE_KEYS.INTEGRATED_SYSTEM, {});
        return systemData.students || [];
    }
    
    function getTasks() {
        const systemData = load(STORAGE_KEYS.INTEGRATED_SYSTEM, {});
        return systemData.tasks || [];
    }
    
    // Clear all data
    function clearAllData() {
        if (confirm('⚠️ Weet je zeker dat je ALLE data wilt verwijderen?')) {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('🗑️ All data cleared');
            return true;
        }
        return false;
    }
    
    // Export data
    function exportData() {
        const systemData = load(STORAGE_KEYS.INTEGRATED_SYSTEM, {});
        return {
            ...systemData,
            exportDate: new Date().toISOString(),
            version: '2.0'
        };
    }
    
    // Import data
    function importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            // Save as integrated system
            save(STORAGE_KEYS.INTEGRATED_SYSTEM, data);
            
            // Reload to apply
            loadAllData();
            
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }
    
    // Public API
    return {
        save: save,
        load: load,
        saveAll: saveAllData,
        loadAll: loadAllData,
        getStudents: getStudents,
        getTasks: getTasks,
        clear: clearAllData,
        export: exportData,
        import: importData,
        KEYS: STORAGE_KEYS
    };
})();