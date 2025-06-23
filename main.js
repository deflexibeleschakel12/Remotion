// Main Application Entry Point
(function() {
    'use strict';
    
    console.log('🚀 Starting Leerling Tracker Application...');
    
    // Initialize global variables if not exists
    window.students = window.students || [];
    window.tasks = window.tasks || [];
    window.timeline = window.timeline || [];
    window.currentStudent = null;
    window.currentUser = null;
    window.userRole = null;
    
    // Initialize modules in correct order
    function initializeApp() {
        console.log('📦 Initializing modules...');
        
        // 1. Load data from storage
        if (typeof Storage !== 'undefined') {
            Storage.loadAll();
        }
        
        // 2. Initialize data sync
        if (typeof DataSync !== 'undefined') {
            DataSync.init();
        }
        
        // 3. Initialize other modules as you create them
        // if (typeof Auth !== 'undefined') Auth.init();
        // if (typeof Tasks !== 'undefined') Tasks.init();
        // if (typeof Timeline !== 'undefined') Timeline.init();
        
        console.log('✅ Application initialized successfully');
    }
    
    // Start app when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
    
    // Make certain functions globally available for debugging
    window.App = {
        storage: Storage,
        sync: DataSync,
        debugDataSync: function() {
            console.log('🔍 Current Data State:');
            console.log('In-Memory Students:', window.students);
            console.log('In-Memory Tasks:', window.tasks);
            console.log('LocalStorage Students:', Storage.load(Storage.KEYS.STUDENTS));
            console.log('LocalStorage Tasks:', Storage.load(Storage.KEYS.TASKS));
        }
    };
    
})();