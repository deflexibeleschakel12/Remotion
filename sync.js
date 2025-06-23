// Data Synchronisatie Module - ZONDER EINDELOZE LOOP
const DataSync = (function() {
    'use strict';
    
    // Private variabelen
    let syncInterval = null;
    let isReloading = false; // Voorkom dubbele reloads
    let lastSaveTime = 0;    // Track laatste save tijd
    
    // Force herlaad data uit localStorage
    function forceDataReload() {
        // Voorkom dubbele reloads
        if (isReloading) {
            console.log('⏭️ Skipping reload - already in progress');
            return;
        }
        
        console.log('🔄 Forcing data reload from localStorage...');
        isReloading = true;
        
        try {
            // Gebruik de Storage module om data te laden
            if (typeof Storage !== 'undefined' && Storage.loadAll) {
                Storage.loadAll();
                console.log('✅ Data reloaded via Storage module');
            } else {
                // Fallback: direct laden
                const systemData = localStorage.getItem('integratedLearningSystem');
                if (systemData) {
                    const parsed = JSON.parse(systemData);
                    window.students = parsed.students || [];
                    window.tasks = parsed.tasks || [];
                    window.groups = parsed.groups || [];
                    window.timeline = parsed.timeline || [];
                    console.log('✅ Data reloaded directly');
                }
            }
            
            // Update currentStudent als die bestaat
            if (window.currentStudent && currentStudent.id) {
                const updatedStudent = students.find(s => s.id === currentStudent.id);
                if (updatedStudent) {
                    window.currentStudent = updatedStudent;
                }
            }
            
        } catch (error) {
            console.error('❌ Error reloading data:', error);
        } finally {
            isReloading = false;
        }
    }
    
    // Start auto-sync - MINDER AGRESSIEF
    function startAutoSync(interval = 30000) { // 30 seconden ipv 5
        if (syncInterval) {
            clearInterval(syncInterval);
        }
        
        syncInterval = setInterval(() => {
            const now = Date.now();
            // Alleen syncen als laatste save meer dan 5 seconden geleden was
            if (now - lastSaveTime > 5000) {
                if (typeof window.saveData === 'function') {
                    window.saveData();
                    lastSaveTime = now;
                }
            }
        }, interval);
        
        console.log(`🔄 Auto-sync started (every ${interval/1000} seconds)`);
    }
    
    // Stop auto-sync
    function stopAutoSync() {
        if (syncInterval) {
            clearInterval(syncInterval);
            syncInterval = null;
            console.log('⏹️ Auto-sync stopped');
        }
    }
    
    // Initialize
    function init() {
        console.log('🔧 Initializing DataSync module...');
        
        // NIET de saveData functie patchen - dit veroorzaakt de loop!
        // In plaats daarvan, alleen reload na belangrijke acties
        
        // Auto-reload bij tab visibility
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                console.log('👁️ Tab became visible - reloading data');
                forceDataReload();
            }
        });
        
        // Luister naar specifieke events voor reload
        window.addEventListener('studentTaskCompleted', forceDataReload);
        window.addEventListener('studentTaskCreated', forceDataReload);
        window.addEventListener('dataImported', forceDataReload);
        
        // Start auto-sync met langere interval
        startAutoSync(30000); // 30 seconden
        
        console.log('✅ DataSync module initialized');
    }
    
    // Manual sync functie
    function manualSync() {
        console.log('⚡ Manual sync triggered');
        const now = Date.now();
        
        if (typeof window.saveData === 'function') {
            window.saveData();
            lastSaveTime = now;
        }
        
        // Reload na 100ms
        setTimeout(() => {
            if (!isReloading) {
                forceDataReload();
            }
        }, 100);
    }
    
    // Public API
    return {
        init: init,
        forceReload: forceDataReload,
        startAutoSync: startAutoSync,
        stopAutoSync: stopAutoSync,
        forceSync: manualSync,
        // Nieuwe functie om sync tijdelijk te pauzeren
        pause: function() {
            console.log('⏸️ Pausing auto-sync');
            stopAutoSync();
        },
        resume: function() {
            console.log('▶️ Resuming auto-sync');
            startAutoSync(30000);
        }
    };
})();

// Export voor gebruik in andere modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataSync;
}