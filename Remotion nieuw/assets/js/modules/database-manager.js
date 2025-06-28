/* =================================
   DATABASE-MANAGER.JS - Supabase Database Manager
   Schoolbeheersysteem v1.0.0
   
   Bevat: CRUD operaties voor scholen, klassen, 
   leraren, leerlingen, real-time synchronisatie
   ================================= */

import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';

class DatabaseManager {
    constructor(options = {}) {
        this.config = {
            supabaseUrl: options.supabaseUrl || 'YOUR_SUPABASE_URL',
            supabaseKey: options.supabaseKey || 'YOUR_SUPABASE_ANON_KEY',
            retryAttempts: options.retryAttempts || 3,
            retryDelay: options.retryDelay || 1000,
            cacheTTL: options.cacheTTL || 5 * 60 * 1000, // 5 minutes
            enableRealtime: options.enableRealtime !== false
        };

        this.supabase = null;
        this.cache = new Map();
        this.subscribers = new Map();
        this.retryQueues = new Map();
        this.isOnline = navigator.onLine;
        
        // Bind methods
        this.handleConnectionChange = this.handleConnectionChange.bind(this);
        this.handleRealtimeUpdate = this.handleRealtimeUpdate.bind(this);
        
        // Initialize
        this.init();
    }

    /* =================================
       INITIALIZATION
       ================================= */

    async init() {
        try {
            console.log('🗄️ Initializing DatabaseManager...');
            
            await this.initializeSupabase();
            this.setupConnectionMonitoring();
            
            if (this.config.enableRealtime) {
                await this.setupRealtimeSubscriptions();
            }
            
            console.log('✅ DatabaseManager initialized successfully');
        } catch (error) {
            console.error('❌ DatabaseManager initialization failed:', error);
            throw error;
        }
    }

    async initializeSupabase() {
        if (!this.config.supabaseUrl || !this.config.supabaseKey) {
            throw new Error('Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY');
        }

        this.supabase = createClient(this.config.supabaseUrl, this.config.supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });

        // Test connection
        const { error } = await this.supabase.from('schools').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist (acceptable for first setup)
            console.warn('⚠️ Database connection test failed:', error.message);
        }

        console.log('🔗 Supabase client initialized');
    }

    setupConnectionMonitoring() {
        window.addEventListener('online', this.handleConnectionChange);
        window.addEventListener('offline', this.handleConnectionChange);
    }

    handleConnectionChange() {
        const wasOnline = this.isOnline;
        this.isOnline = navigator.onLine;
        
        if (!wasOnline && this.isOnline) {
            console.log('🌐 Connection restored - syncing offline changes');
            this.syncOfflineChanges();
        } else if (wasOnline && !this.isOnline) {
            console.log('📵 Connection lost - enabling offline mode');
        }
    }

    /* =================================
       SCHOOL MANAGEMENT
       ================================= */

    async getSchools() {
        try {
            const cacheKey = 'schools';
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await this.supabase
                .from('schools')
                .select(`
                    *,
                    school_stats:school_statistics(*),
                    classes:classes(count),
                    teachers:teachers(count),
                    students:students(count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Enrich data with calculated fields
            const enrichedData = data.map(school => ({
                ...school,
                studentCount: school.students?.[0]?.count || 0,
                teacherCount: school.teachers?.[0]?.count || 0,
                classCount: school.classes?.[0]?.count || 0,
                lastLogin: school.last_login,
                createdAt: school.created_at
            }));

            this.setCache(cacheKey, enrichedData);
            return enrichedData;
        } catch (error) {
            console.error('❌ Error fetching schools:', error);
            // Return cached data if available
            const cached = this.getFromCache('schools', true);
            if (cached) {
                console.log('📱 Returning cached schools data');
                return cached;
            }
            throw error;
        }
    }

    async createSchool(schoolData) {
        try {
            console.log('➕ Creating school:', schoolData.name);

            // Generate credentials
            const credentials = this.generateCredentials(schoolData.name);
            
            const schoolRecord = {
                name: schoolData.name,
                type: schoolData.type,
                student_count: parseInt(schoolData.studentCount) || 0,
                address: schoolData.address || '',
                admin_name: schoolData.adminName,
                admin_email: schoolData.adminEmail,
                admin_phone: schoolData.adminPhone || '',
                notes: schoolData.notes || '',
                credentials: credentials,
                status: 'active',
                created_at: new Date().toISOString(),
                last_login: null
            };

            const { data, error } = await this.supabase
                .from('schools')
                .insert([schoolRecord])
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            this.clearCache('schools');

            console.log('✅ School created successfully:', data.name);
            return {
                ...data,
                id: data.id.toString(),
                studentCount: data.student_count,
                adminName: data.admin_name,
                adminEmail: data.admin_email,
                adminPhone: data.admin_phone,
                createdAt: data.created_at,
                lastLogin: data.last_login
            };
        } catch (error) {
            console.error('❌ Error creating school:', error);
            
            // Queue for offline sync if connection issue
            if (!this.isOnline || error.message.includes('fetch')) {
                console.log('📱 Queueing school creation for offline sync');
                this.queueOfflineAction('createSchool', schoolData);
                return this.createOfflineSchool(schoolData);
            }
            
            throw error;
        }
    }

    async updateSchool(schoolId, schoolData) {
        try {
            console.log('💾 Updating school:', schoolId);

            const updateData = {
                name: schoolData.name,
                type: schoolData.type,
                student_count: parseInt(schoolData.studentCount) || 0,
                address: schoolData.address || '',
                admin_name: schoolData.adminName,
                admin_email: schoolData.adminEmail,
                admin_phone: schoolData.adminPhone || '',
                notes: schoolData.notes || '',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('schools')
                .update(updateData)
                .eq('id', schoolId)
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            this.clearCache('schools');

            console.log('✅ School updated successfully:', data.name);
            return {
                ...data,
                id: data.id.toString(),
                studentCount: data.student_count,
                adminName: data.admin_name,
                adminEmail: data.admin_email,
                adminPhone: data.admin_phone,
                createdAt: data.created_at,
                lastLogin: data.last_login
            };
        } catch (error) {
            console.error('❌ Error updating school:', error);
            throw error;
        }
    }

    async deleteSchool(schoolId) {
        try {
            console.log('🗑️ Deleting school:', schoolId);

            // First delete related records (cascade delete)
            await this.supabase.from('students').delete().eq('school_id', schoolId);
            await this.supabase.from('teachers').delete().eq('school_id', schoolId);
            await this.supabase.from('classes').delete().eq('school_id', schoolId);
            
            const { error } = await this.supabase
                .from('schools')
                .delete()
                .eq('id', schoolId);

            if (error) throw error;

            // Clear cache
            this.clearCache('schools');

            console.log('✅ School deleted successfully');
        } catch (error) {
            console.error('❌ Error deleting school:', error);
            throw error;
        }
    }

    async updateSchoolLastLogin(schoolId) {
        try {
            const { error } = await this.supabase
                .from('schools')
                .update({ last_login: new Date().toISOString() })
                .eq('id', schoolId);

            if (error) throw error;

            // Clear cache
            this.clearCache('schools');
        } catch (error) {
            console.error('❌ Error updating school last login:', error);
        }
    }

    /* =================================
       CLASS MANAGEMENT
       ================================= */

    async getClasses(schoolId) {
        try {
            const cacheKey = `classes_${schoolId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await this.supabase
                .from('classes')
                .select(`
                    *,
                    students:students(count),
                    teacher_assignments:teacher_assignments(
                        teacher:teachers(*)
                    )
                `)
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const enrichedData = data.map(cls => ({
                ...cls,
                id: cls.id.toString(),
                className: cls.class_name,
                classLevel: cls.class_level,
                maxStudents: cls.max_students,
                studentCount: cls.students?.[0]?.count || 0,
                teachers: cls.teacher_assignments?.map(ta => ta.teacher) || [],
                createdAt: cls.created_at
            }));

            this.setCache(cacheKey, enrichedData);
            return enrichedData;
        } catch (error) {
            console.error('❌ Error fetching classes:', error);
            throw error;
        }
    }

    async createClass(schoolId, classData) {
        try {
            console.log('➕ Creating class:', classData.className);

            const classRecord = {
                school_id: schoolId,
                class_name: classData.className,
                class_level: classData.classLevel,
                max_students: parseInt(classData.maxStudents) || null,
                classroom: classData.classroom || '',
                notes: classData.classNotes || '',
                student_count: 0,
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('classes')
                .insert([classRecord])
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            this.clearCache(`classes_${schoolId}`);

            return {
                ...data,
                id: data.id.toString(),
                className: data.class_name,
                classLevel: data.class_level,
                maxStudents: data.max_students,
                studentCount: data.student_count,
                createdAt: data.created_at
            };
        } catch (error) {
            console.error('❌ Error creating class:', error);
            throw error;
        }
    }

    /* =================================
       TEACHER MANAGEMENT
       ================================= */

    async getTeachers(schoolId) {
        try {
            const cacheKey = `teachers_${schoolId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await this.supabase
                .from('teachers')
                .select(`
                    *,
                    teacher_assignments:teacher_assignments(
                        class:classes(*)
                    )
                `)
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const enrichedData = data.map(teacher => ({
                ...teacher,
                id: teacher.id.toString(),
                fullName: `${teacher.first_name} ${teacher.last_name}`,
                teacherFirstName: teacher.first_name,
                teacherLastName: teacher.last_name,
                teacherEmail: teacher.email,
                teacherPhone: teacher.phone,
                teacherSubjects: teacher.subjects,
                classes: teacher.teacher_assignments?.map(ta => ta.class) || [],
                createdAt: teacher.created_at
            }));

            this.setCache(cacheKey, enrichedData);
            return enrichedData;
        } catch (error) {
            console.error('❌ Error fetching teachers:', error);
            throw error;
        }
    }

    async createTeacher(schoolId, teacherData) {
        try {
            console.log('➕ Creating teacher:', `${teacherData.teacherFirstName} ${teacherData.teacherLastName}`);

            // Generate credentials
            const credentials = this.generateTeacherCredentials(teacherData.teacherFirstName, teacherData.teacherLastName);

            const teacherRecord = {
                school_id: schoolId,
                first_name: teacherData.teacherFirstName,
                last_name: teacherData.teacherLastName,
                email: teacherData.teacherEmail,
                phone: teacherData.teacherPhone || '',
                subjects: teacherData.teacherSubjects || '',
                credentials: credentials,
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('teachers')
                .insert([teacherRecord])
                .select()
                .single();

            if (error) throw error;

            // Clear cache
            this.clearCache(`teachers_${schoolId}`);

            return {
                ...data,
                id: data.id.toString(),
                fullName: `${data.first_name} ${data.last_name}`,
                teacherFirstName: data.first_name,
                teacherLastName: data.last_name,
                teacherEmail: data.email,
                teacherPhone: data.phone,
                teacherSubjects: data.subjects,
                createdAt: data.created_at
            };
        } catch (error) {
            console.error('❌ Error creating teacher:', error);
            throw error;
        }
    }

    /* =================================
       STUDENT MANAGEMENT
       ================================= */

    async getStudents(schoolId) {
        try {
            const cacheKey = `students_${schoolId}`;
            const cached = this.getFromCache(cacheKey);
            if (cached) return cached;

            const { data, error } = await this.supabase
                .from('students')
                .select(`
                    *,
                    class:classes(*)
                `)
                .eq('school_id', schoolId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const enrichedData = data.map(student => ({
                ...student,
                id: student.id.toString(),
                fullName: `${student.first_name} ${student.last_name}`,
                studentFirstName: student.first_name,
                studentLastName: student.last_name,
                studentBirthDate: student.birth_date,
                studentClass: student.class_id,
                parentName: student.parent_name,
                parentEmail: student.parent_email,
                parentPhone: student.parent_phone,
                className: student.class?.class_name || 'Geen klas',
                createdAt: student.created_at
            }));

            this.setCache(cacheKey, enrichedData);
            return enrichedData;
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            throw error;
        }
    }

    async createStudent(schoolId, studentData) {
        try {
            console.log('➕ Creating student:', `${studentData.studentFirstName} ${studentData.studentLastName}`);

            // Generate credentials
            const credentials = this.generateStudentCredentials(studentData.studentFirstName, studentData.studentLastName);

            const studentRecord = {
                school_id: schoolId,
                class_id: studentData.studentClass || null,
                first_name: studentData.studentFirstName,
                last_name: studentData.studentLastName,
                birth_date: studentData.studentBirthDate || null,
                parent_name: studentData.parentName || '',
                parent_email: studentData.parentEmail || '',
                parent_phone: studentData.parentPhone || '',
                credentials: credentials,
                created_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('students')
                .insert([studentRecord])
                .select()
                .single();

            if (error) throw error;

            // Update class student count
            if (studentData.studentClass) {
                await this.updateClassStudentCount(studentData.studentClass);
            }

            // Clear cache
            this.clearCache(`students_${schoolId}`);
            this.clearCache(`classes_${schoolId}`);

            return {
                ...data,
                id: data.id.toString(),
                fullName: `${data.first_name} ${data.last_name}`,
                studentFirstName: data.first_name,
                studentLastName: data.last_name,
                studentBirthDate: data.birth_date,
                studentClass: data.class_id,
                parentName: data.parent_name,
                parentEmail: data.parent_email,
                parentPhone: data.parent_phone,
                createdAt: data.created_at
            };
        } catch (error) {
            console.error('❌ Error creating student:', error);
            throw error;
        }
    }

    async updateClassStudentCount(classId) {
        try {
            const { count, error } = await this.supabase
                .from('students')
                .select('*', { count: 'exact', head: true })
                .eq('class_id', classId);

            if (error) throw error;

            await this.supabase
                .from('classes')
                .update({ student_count: count })
                .eq('id', classId);
        } catch (error) {
            console.error('❌ Error updating class student count:', error);
        }
    }

    /* =================================
       UTILITY FUNCTIONS
       ================================= */

    generateCredentials(schoolName) {
        const cleanName = schoolName.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 8);
        
        const username = `${cleanName}_admin`;
        const password = this.generateSecurePassword();
        
        return { username, password };
    }

    generateTeacherCredentials(firstName, lastName) {
        const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '').charAt(0);
        const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 8);
        const randomNum = Math.floor(Math.random() * 99) + 1;
        
        const username = `${cleanFirstName}.${cleanLastName}${randomNum}`;
        const password = this.generateSecurePassword(10);
        
        return { username, password };
    }

    generateStudentCredentials(firstName, lastName) {
        const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, '').substring(0, 8);
        const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, '').charAt(0);
        const randomNum = Math.floor(Math.random() * 999) + 1;
        
        const username = `${cleanFirstName}.${cleanLastName}${randomNum}`;
        const password = this.generateStudentPassword();
        
        return { username, password };
    }

    generateSecurePassword(length = 12) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
        let password = '';
        
        // Ensure at least one of each type
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        password += '!@#$%'[Math.floor(Math.random() * 5)];
        
        // Fill the rest
        for (let i = 4; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    generateStudentPassword(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        
        // Simpler password for students
        password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
        password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
        password += '0123456789'[Math.floor(Math.random() * 10)];
        
        for (let i = 3; i < length; i++) {
            password += chars[Math.floor(Math.random() * chars.length)];
        }
        
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /* =================================
       CACHE MANAGEMENT
       ================================= */

    setCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    getFromCache(key, ignoreExpiry = false) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        if (!ignoreExpiry && Date.now() - cached.timestamp > this.config.cacheTTL) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    clearCache(key = null) {
        if (key) {
            this.cache.delete(key);
        } else {
            this.cache.clear();
        }
    }

    /* =================================
       OFFLINE SUPPORT
       ================================= */

    queueOfflineAction(action, data) {
        if (!this.retryQueues.has(action)) {
            this.retryQueues.set(action, []);
        }
        this.retryQueues.get(action).push({
            data,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
        });
    }

    createOfflineSchool(schoolData) {
        // Create temporary offline school record
        const credentials = this.generateCredentials(schoolData.name);
        return {
            id: `offline_${Date.now()}`,
            ...schoolData,
            credentials,
            status: 'offline_pending',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isOffline: true
        };
    }

    async syncOfflineChanges() {
        for (const [action, queue] of this.retryQueues.entries()) {
            for (const item of queue) {
                try {
                    switch (action) {
                        case 'createSchool':
                            await this.createSchool(item.data);
                            break;
                        // Add other actions as needed
                    }
                    
                    // Remove from queue on success
                    const index = queue.indexOf(item);
                    if (index > -1) queue.splice(index, 1);
                } catch (error) {
                    console.error(`❌ Failed to sync offline ${action}:`, error);
                }
            }
        }
    }

    /* =================================
       REALTIME SUBSCRIPTIONS
       ================================= */

    async setupRealtimeSubscriptions() {
        try {
            // Subscribe to schools table
            this.supabase
                .channel('schools-changes')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'schools' },
                    this.handleRealtimeUpdate
                )
                .subscribe();

            console.log('🔄 Realtime subscriptions active');
        } catch (error) {
            console.error('❌ Error setting up realtime subscriptions:', error);
        }
    }

    handleRealtimeUpdate(payload) {
        console.log('🔄 Realtime update received:', payload);
        
        // Clear relevant cache
        this.clearCache('schools');
        
        // Emit event for UI updates
        this.emit('dataUpdated', {
            table: payload.table,
            eventType: payload.eventType,
            record: payload.new || payload.old
        });
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
       CLEANUP
       ================================= */

    destroy() {
        // Remove event listeners
        window.removeEventListener('online', this.handleConnectionChange);
        window.removeEventListener('offline', this.handleConnectionChange);
        
        // Clear cache and subscribers
        this.cache.clear();
        this.subscribers.clear();
        this.retryQueues.clear();
        
        // Close Supabase connection
        if (this.supabase) {
            this.supabase.removeAllChannels();
        }
        
        console.log('🧹 DatabaseManager cleaned up');
    }
}

export default DatabaseManager;
