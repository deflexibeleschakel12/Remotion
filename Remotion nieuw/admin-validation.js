// Quick test script to verify admin dashboard functionality
console.log('🧪 Starting Admin Dashboard Validation...');

// Test 1: Check if localStorage is working
try {
    const testData = { test: 'value' };
    localStorage.setItem('test_key', JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem('test_key'));
    if (retrieved.test === 'value') {
        console.log('✅ Test 1: localStorage working correctly');
        localStorage.removeItem('test_key');
    } else {
        console.error('❌ Test 1: localStorage not working correctly');
    }
} catch (error) {
    console.error('❌ Test 1: localStorage error:', error);
}

// Test 2: Check current school data
try {
    const schools = JSON.parse(localStorage.getItem('admin_schools') || '[]');
    console.log(`✅ Test 2: Found ${schools.length} schools in localStorage`);
    schools.forEach((school, index) => {
        console.log(`  ${index + 1}. ${school.name} (${school.type})`);
        if (school.credentials) {
            console.log(`     Login: ${school.credentials.username} / ${school.credentials.password}`);
        }
    });
} catch (error) {
    console.error('❌ Test 2: Error reading school data:', error);
}

// Test 3: Check session storage
try {
    const user = sessionStorage.getItem('demo_user');
    if (user) {
        const userData = JSON.parse(user);
        console.log('✅ Test 3: User session found');
        console.log(`  User: ${userData.user_metadata?.full_name || userData.email}`);
        console.log(`  Role: ${userData.user_metadata?.role}`);
    } else {
        console.log('⚠️ Test 3: No user session found');
    }
} catch (error) {
    console.error('❌ Test 3: Session error:', error);
}

// Test 4: Check if DOM elements exist
try {
    const elements = [
        'addSchoolModal',
        'schoolList',
        'addSchoolForm',
        'schoolListSection'
    ];
    
    elements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            console.log(`✅ Test 4: Element '${elementId}' found`);
        } else {
            console.error(`❌ Test 4: Element '${elementId}' not found`);
        }
    });
} catch (error) {
    console.error('❌ Test 4: DOM error:', error);
}

// Test 5: Check if functions are defined
try {
    const functions = [
        'openAddSchoolModal',
        'closeAddSchoolModal',
        'handleAddSchool',
        'viewSchoolDetails',
        'editSchool',
        'loginAsSchool',
        'removeSchool'
    ];
    
    functions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            console.log(`✅ Test 5: Function '${funcName}' is defined`);
        } else {
            console.error(`❌ Test 5: Function '${funcName}' is not defined`);
        }
    });
} catch (error) {
    console.error('❌ Test 5: Function check error:', error);
}

// Test 6: Check if SchoolManager is available
try {
    if (typeof schoolManager !== 'undefined') {
        console.log('✅ Test 6: SchoolManager is available');
        console.log(`  Schools count: ${schoolManager.schools.length}`);
        console.log(`  Methods available: ${Object.getOwnPropertyNames(Object.getPrototypeOf(schoolManager))}`);
    } else {
        console.error('❌ Test 6: SchoolManager is not defined');
    }
} catch (error) {
    console.error('❌ Test 6: SchoolManager error:', error);
}

console.log('🏁 Admin Dashboard Validation Complete');
