/**
 * Supabase Configuration
 * Real database integration for the School Management Platform
 */

// Supabase Configuration
const SUPABASE_URL = 'https://vsynvrkgcycvoaonnwmj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzeW52cmtnY3ljdm9hb25ud21qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2MTUwNDgsImV4cCI6MjA2NDE5MTA0OH0.xaz2weA-4JDnnhuPcemvBzfuSbYBMZfAxgKlRNPbvsk';

// Initialize Supabase client (when Supabase JS library is loaded)
let supabase = null;

/**
 * Initialize Supabase client
 * Call this after loading the Supabase JS library
 */
function initializeSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.warn('⚠️ Supabase library not loaded. Using localStorage for now.');
        return false;
    }
    
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

/**
 * Check if Supabase is available and initialized
 */
function isSupabaseAvailable() {
    return supabase !== null && typeof supabase === 'object';
}

/**
 * Database Schema for School Management System
 * 
 * Tables needed:
 * - schools
 * - classes  
 * - teachers
 * - students
 * - teacher_class_assignments
 * - users (for authentication)
 */

// SQL Schema for reference (to be executed in Supabase dashboard)
const SCHEMA_SQL = `
-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;

-- Schools table
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL,
    school_type VARCHAR(100),
    student_count INTEGER DEFAULT 0,
    admin_name VARCHAR(255),
    admin_email VARCHAR(255),
    admin_phone VARCHAR(50),
    address TEXT,
    notes TEXT,
    credentials JSONB, -- {username, password}
    status VARCHAR(50) DEFAULT 'active',
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_name VARCHAR(255) NOT NULL,
    class_level VARCHAR(100),
    class_year VARCHAR(10),
    student_count INTEGER DEFAULT 0,
    max_students INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(511) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(255),
    phone VARCHAR(50),
    subjects TEXT,
    qualifications TEXT,
    hire_date DATE,
    credentials JSONB, -- {username, password}
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    full_name VARCHAR(511) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    birth_date DATE,
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(50),
    credentials JSONB, -- {username, password}
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher-Class assignments table
CREATE TABLE IF NOT EXISTS public.teacher_class_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'Leerkracht', -- Hoofdleerkracht, Vakleerkracht, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, class_id)
);

-- Student Memories table
CREATE TABLE IF NOT EXISTS public.student_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    memory_date DATE NOT NULL,
    casel_skill VARCHAR(100), -- CASEL vaardigheid: zelfbewustzijn, zelfmanagement, etc.
    file_url TEXT, -- URL to file in Supabase Storage
    file_name VARCHAR(255), -- Original filename
    file_type VARCHAR(100), -- MIME type
    file_size INTEGER, -- File size in bytes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON public.teacher_class_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.teacher_class_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_memories_student_id ON public.student_memories(student_id);
CREATE INDEX IF NOT EXISTS idx_memories_school_id ON public.student_memories(school_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON public.student_memories(memory_date);
`;

/**
 * Supabase API Wrapper Functions
 * These functions will be used to replace localStorage operations
 */

const SupabaseAPI = {
    // School operations
    async getSchools() {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('schools')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error fetching schools:', error);
            return null;
        }
    },

    async createSchool(schoolData) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('schools')
                .insert([schoolData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating school:', error);
            return null;
        }
    },

    async updateSchool(schoolId, updates) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('schools')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', schoolId)
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updating school:', error);
            return null;
        }
    },

    async deleteSchool(schoolId) {
        if (!isSupabaseAvailable()) return false;
        
        try {
            const { error } = await supabase
                .from('schools')
                .delete()
                .eq('id', schoolId);
            
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('❌ Error deleting school:', error);
            return false;
        }
    },

    // Class operations
    async getClasses(schoolId) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('classes')
                .select('*')
                .eq('school_id', schoolId)
                .order('class_name');
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error fetching classes:', error);
            return null;
        }
    },

    async createClass(classData) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('classes')
                .insert([classData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating class:', error);
            return null;
        }
    },

    // Teacher operations
    async getTeachers(schoolId) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('teachers')
                .select('*')
                .eq('school_id', schoolId)
                .order('last_name');
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error fetching teachers:', error);
            return null;
        }
    },

    async createTeacher(teacherData) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('teachers')
                .insert([teacherData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating teacher:', error);
            return null;
        }
    },

    // Student operations
    async getStudents(schoolId) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('students')
                .select(`
                    *,
                    classes:class_id (
                        id,
                        class_name
                    )
                `)
                .eq('school_id', schoolId)
                .order('last_name');
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error fetching students:', error);
            return null;
        }
    },

    async createStudent(studentData) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('students')
                .insert([studentData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating student:', error);
            return null;
        }
    },

    // Teacher-Class assignments
    async getTeacherAssignments(schoolId) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('teacher_class_assignments')
                .select(`
                    *,
                    teachers:teacher_id (
                        id,
                        full_name
                    ),
                    classes:class_id (
                        id,
                        class_name
                    )
                `)
                .eq('school_id', schoolId);
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error fetching assignments:', error);
            return null;
        }
    },

    async createAssignment(assignmentData) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data, error } = await supabase
                .from('teacher_class_assignments')
                .insert([assignmentData])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating assignment:', error);
            return null;
        }
    },

    // Student Memory operations
    async getStudentMemories(studentId) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            console.log('🔍 Fetching memories for student:', studentId);
            const { data, error } = await supabase
                .from('student_memories')
                .select('*')
                .eq('student_id', studentId)
                .order('memory_date', { ascending: false });
            
            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    console.log('⚠️ student_memories table does not exist yet. Please create it in Supabase.');
                    return null;
                }
                throw error;
            }
            console.log('✅ Fetched memories from Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ Error fetching student memories:', error);
            return null;
        }
    },

    async createMemory(memoryData) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            console.log('📝 Creating memory in Supabase:', memoryData);
            const { data, error } = await supabase
                .from('student_memories')
                .insert([memoryData])
                .select()
                .single();
            
            if (error) {
                if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                    console.log('⚠️ student_memories table does not exist yet. Please create it in Supabase.');
                    console.log('Check the database setup guide in SUPABASE_SETUP.md');
                    return null;
                }
                if (error.code === '42501' || error.message.includes('row-level security policy')) {
                    console.log('⚠️ Row Level Security (RLS) policy is blocking the insert.');
                    console.log('💡 This should be fixed now with the new setup! If you still see this:');
                    console.log('💡 1. Check SUPABASE_QUICK_SETUP.md for the correct SQL setup');
                    console.log('💡 2. Make sure you ran: CREATE POLICY "Allow all operations on student_memories" ON public.student_memories FOR ALL USING (true);');
                    console.log('💡 3. Or temporarily disable RLS: ALTER TABLE student_memories DISABLE ROW LEVEL SECURITY;');
                    return null;
                }
                console.error('❌ Supabase error creating memory:', error);
                return null;
            }
            console.log('✅ Memory created in Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creating memory:', error);
            return null;
        }
    },

    async updateMemory(memoryId, updates) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            console.log('✏️ Updating memory in Supabase:', memoryId, updates);
            const { data, error } = await supabase
                .from('student_memories')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', memoryId)
                .select()
                .single();
            
            if (error) throw error;
            console.log('✅ Memory updated in Supabase:', data);
            return data;
        } catch (error) {
            console.error('❌ Error updating memory:', error);
            return null;
        }
    },

    async deleteMemory(memoryId) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            console.log('🗑️ Deleting memory from Supabase:', memoryId);
            const { error } = await supabase
                .from('student_memories')
                .delete()
                .eq('id', memoryId);
            
            if (error) throw error;
            console.log('✅ Memory deleted from Supabase');
            return true;
        } catch (error) {
            console.error('❌ Error deleting memory:', error);
            return false;
        }
    },

    // File upload to Supabase Storage
    async uploadFile(file, path) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            console.log('📤 Uploading file to Supabase Storage:', file.name, 'to path:', path);
            const { data, error } = await supabase.storage
                .from('student-files')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false
                });
            
            if (error) {
                if (error.message.includes('Bucket not found') || error.message.includes('does not exist')) {
                    console.log('⚠️ student-files bucket does not exist yet. Please create it in Supabase Storage.');
                    console.log('Check the storage setup guide in SUPABASE_QUICK_SETUP.md');
                    return null;
                }
                if (error.statusCode === '403' || error.message.includes('row-level security policy')) {
                    console.log('⚠️ Storage bucket RLS policy is blocking file uploads.');
                    console.log('💡 Run this SQL in Supabase SQL Editor to fix:');
                    console.log(`
-- Storage RLS fix - choose one option:

-- Option 1: Create permissive policies
CREATE POLICY "Allow uploads to student-files" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'student-files');
CREATE POLICY "Allow downloads from student-files" ON storage.objects 
    FOR SELECT USING (bucket_id = 'student-files');

-- Option 2: Disable RLS for storage (quick demo fix)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
                    `);
                    return null;
                }
                console.error('❌ Supabase storage error:', error);
                return null;
            }
            console.log('✅ File uploaded to Supabase Storage:', data);
            return data;
        } catch (error) {
            console.error('❌ Error uploading file:', error);
            return null;
        }
    },

    async getFileUrl(path) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            const { data } = supabase.storage
                .from('student-files')
                .getPublicUrl(path);
            
            return data.publicUrl;
        } catch (error) {
            console.error('❌ Error getting file URL:', error);
            return null;
        }
    },

    async deleteFile(path) {
        if (!isSupabaseAvailable()) return null;
        
        try {
            console.log('🗑️ Deleting file from Supabase Storage:', path);
            const { error } = await supabase.storage
                .from('student-files')
                .remove([path]);
            
            if (error) throw error;
            console.log('✅ File deleted from Supabase Storage');
            return true;
        } catch (error) {
            console.error('❌ Error deleting file:', error);
            return false;
        }
    },

    // Setup functies voor automatische initialisatie
    async checkAndSetupDatabase() {
        if (!isSupabaseAvailable()) return false;
        
        try {
            console.log('🔧 Checking Supabase database setup...');
            
            // Test of student_memories tabel bestaat
            const { data, error } = await supabase
                .from('student_memories')
                .select('id')
                .limit(1);
            
            if (error && (error.code === 'PGRST116' || error.message.includes('does not exist'))) {
                console.log('⚠️ student_memories table missing. Attempting to create...');
                
                // Probeer de tabel automatisch aan te maken
                const createTableResult = await this.createStudentMemoriesTable();
                if (createTableResult) {
                    console.log('✅ student_memories table created successfully');
                    return true;
                } else {
                    console.log('❌ Failed to create student_memories table automatically');
                    console.log('💡 Please run the SQL setup script manually in Supabase SQL Editor');
                    console.log(`
-- Run this SQL in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.student_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id TEXT NOT NULL,
    school_id TEXT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    memory_date DATE,
    casel_skill VARCHAR(100),
    file_url TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    file_size INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow all operations for now
ALTER TABLE public.student_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on student_memories" ON public.student_memories FOR ALL USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_memories_student_id ON public.student_memories(student_id);
                    `);
                    return false;
                }
            }
            
            console.log('✅ Database tables are ready');
            return true;
        } catch (error) {
            console.error('❌ Error checking database:', error);
            return false;
        }
    },

    async createStudentMemoriesTable() {
        if (!isSupabaseAvailable()) return false;
        
        try {
            console.log('🔧 Creating student_memories table...');
            
            // Dit werkt alleen als de Supabase user admin rechten heeft
            const { error } = await supabase.rpc('exec_sql', {
                sql_query: `
                    CREATE TABLE IF NOT EXISTS public.student_memories (
                        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                        student_id TEXT NOT NULL,
                        school_id TEXT,
                        title VARCHAR(255) NOT NULL,
                        description TEXT,
                        memory_date DATE,
                        casel_skill VARCHAR(100),
                        file_url TEXT,
                        file_name VARCHAR(255),
                        file_type VARCHAR(100),
                        file_size INTEGER,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                    );
                    
                    ALTER TABLE public.student_memories ENABLE ROW LEVEL SECURITY;
                    CREATE POLICY "Allow all operations on student_memories" ON public.student_memories FOR ALL USING (true);
                    CREATE INDEX IF NOT EXISTS idx_memories_student_id ON public.student_memories(student_id);
                `
            });
            
            if (error) {
                console.log('⚠️ Could not create table automatically (requires admin access)');
                return false;
            }
            
            return true;
        } catch (error) {
            console.log('⚠️ Automatic table creation not available');
            return false;
        }
    },

    async checkAndSetupStorage() {
        if (!isSupabaseAvailable()) return false;
        
        try {
            console.log('🔧 Checking Supabase storage setup...');
            
            // Test of student-files bucket bestaat
            const { data: buckets, error } = await supabase.storage.listBuckets();
            
            if (error) {
                console.error('❌ Error listing buckets:', error);
                console.log('💡 This might be due to RLS on storage.buckets table');
                console.log('💡 Try running: ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;');
                
                // Probeer een alternatieve test - probeer een bestand te uploaden
                return await this.testStorageWithUpload();
            }
            
            console.log('📦 Available buckets:', buckets.map(b => b.name));
            
            // Als buckets leeg is, kan dit door RLS zijn - test direct met upload
            if (!buckets || buckets.length === 0) {
                console.log('💡 No buckets visible - this might be due to RLS on storage.buckets');
                console.log('🧪 Testing direct storage access...');
                return await this.testStorageWithUpload();
            }
            
            const studentFilesBucket = buckets.find(bucket => bucket.name === 'student-files');
            
            if (!studentFilesBucket) {
                console.log('⚠️ student-files bucket missing. Attempting to create...');
                
                // Probeer bucket automatisch aan te maken
                const createBucketResult = await this.createStudentFilesBucket();
                if (createBucketResult) {
                    console.log('✅ student-files bucket created successfully');
                    return true;
                } else {
                    console.log('❌ Failed to create student-files bucket automatically');
                    console.log('');
                    console.log('🛠️ MANUAL SETUP REQUIRED:');
                    console.log('================================');
                    console.log('1. Go to your Supabase dashboard');
                    console.log('2. Click "Storage" in the left menu');
                    console.log('3. Click "Create Bucket"');
                    console.log('4. Fill in:');
                    console.log('   - Name: student-files');
                    console.log('   - Public bucket: ✅ ON');
                    console.log('5. Click "Create bucket"');
                    console.log('');
                    console.log('📋 Then fix RLS issues with SQL:');
                    console.log('Go to SQL Editor and run:');
                    console.log('ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;');
                    console.log('ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;');
                    console.log('');
                    console.log('💡 See SUPABASE_QUICK_SETUP.md for detailed instructions');
                    console.log('================================');
                    return false;
                }
            }
            
            console.log('✅ Storage buckets are ready');
            return true;
        } catch (error) {
            console.error('❌ Error checking storage:', error);
            return false;
        }
    },

    async createStudentFilesBucket() {
        if (!isSupabaseAvailable()) return false;
        
        try {
            console.log('🔧 Creating student-files bucket...');
            
            const { data, error } = await supabase.storage.createBucket('student-files', {
                public: true,
                allowedMimeTypes: ['image/*', 'application/pdf'],
                fileSizeLimit: 10485760 // 10MB
            });
            
            if (error) {
                console.log('⚠️ Could not create bucket automatically:', error.message);
                console.log('💡 This is usually caused by RLS (Row Level Security) on storage tables');
                console.log('💡 You need to create the bucket manually in Supabase Dashboard');
                return false;
            }
            
            console.log('✅ Bucket created:', data);
            return true;
        } catch (error) {
            console.log('⚠️ Automatic bucket creation failed:', error);
            return false;
        }
    },

    async testStorageWithUpload() {
        if (!isSupabaseAvailable()) return false;
        
        try {
            console.log('🧪 Testing storage by attempting a test upload...');
            
            // Maak een kleine test blob
            const testBlob = new Blob(['test'], { type: 'text/plain' });
            const testFile = new File([testBlob], 'test.txt', { type: 'text/plain' });
            
            // Probeer upload naar student-files bucket
            const { data, error } = await supabase.storage
                .from('student-files')
                .upload(`test/${Date.now()}_test.txt`, testFile);
            
            if (error) {
                console.log('❌ Storage test upload failed:', error.message);
                if (error.message.includes('Bucket not found')) {
                    console.log('💡 student-files bucket does not exist - create it manually');
                    return false;
                } else if (error.message.includes('row-level security')) {
                    console.log('💡 RLS is blocking storage access - disable RLS or add policies');
                    return false;
                }
                return false;
            }
            
            // Cleanup: verwijder test bestand
            if (data?.path) {
                await supabase.storage.from('student-files').remove([data.path]);
            }
            
            console.log('✅ Storage test successful - student-files bucket is working');
            return true;
            
        } catch (error) {
            console.log('❌ Storage test failed:', error);
            return false;
        }
    }
};

/**
 * Migration functions to move from localStorage to Supabase
 */

const MigrationHelper = {
    async migrateLocalStorageToSupabase() {
        if (!isSupabaseAvailable()) {
            console.warn('⚠️ Supabase not available, skipping migration');
            return false;
        }

        console.log('🔄 Starting migration from localStorage to Supabase...');

        try {
            // Migrate schools
            const schools = JSON.parse(localStorage.getItem('schools') || '[]');
            console.log(`📦 Found ${schools.length} schools to migrate`);

            for (const school of schools) {
                const migratedSchool = await SupabaseAPI.createSchool({
                    school_name: school.schoolName,
                    school_type: school.schoolType,
                    student_count: school.studentCount || 0,
                    admin_name: school.adminName,
                    admin_email: school.adminEmail,
                    admin_phone: school.adminPhone,
                    address: school.address,
                    notes: school.notes,
                    credentials: school.credentials,
                    status: school.status || 'active',
                    last_login: school.lastLogin
                });

                if (migratedSchool) {
                    console.log(`✅ Migrated school: ${school.schoolName}`);
                    
                    // Migrate classes for this school
                    const classes = JSON.parse(localStorage.getItem(`school_classes_${school.id}`) || '[]');
                    for (const cls of classes) {
                        await SupabaseAPI.createClass({
                            school_id: migratedSchool.id,
                            class_name: cls.className,
                            class_level: cls.classLevel,
                            class_year: cls.classYear,
                            student_count: cls.studentCount || 0,
                            max_students: cls.maxStudents || 30
                        });
                    }

                    // Migrate teachers for this school
                    const teachers = JSON.parse(localStorage.getItem(`school_teachers_${school.id}`) || '[]');
                    for (const teacher of teachers) {
                        await SupabaseAPI.createTeacher({
                            school_id: migratedSchool.id,
                            first_name: teacher.teacherFirstName,
                            last_name: teacher.teacherLastName,
                            email: teacher.teacherEmail,
                            phone: teacher.teacherPhone,
                            subjects: teacher.teacherSubjects,
                            qualifications: teacher.teacherQualifications,
                            hire_date: teacher.teacherHireDate,
                            credentials: teacher.credentials,
                            status: teacher.status || 'active'
                        });
                    }

                    // Migrate students for this school
                    const students = JSON.parse(localStorage.getItem(`school_students_${school.id}`) || '[]');
                    for (const student of students) {
                        await SupabaseAPI.createStudent({
                            school_id: migratedSchool.id,
                            class_id: student.studentClass, // This will need mapping
                            first_name: student.studentFirstName,
                            last_name: student.studentLastName,
                            birth_date: student.studentBirthDate,
                            parent_name: student.parentName,
                            parent_email: student.parentEmail,
                            parent_phone: student.parentPhone,
                            credentials: student.credentials,
                            status: student.status || 'active'
                        });
                    }
                }
            }

            console.log('✅ Migration completed successfully!');
            return true;

        } catch (error) {
            console.error('❌ Migration failed:', error);
            return false;
        }
    },

    async clearLocalStorage() {
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith('schools') || 
            key.startsWith('school_classes_') || 
            key.startsWith('school_teachers_') || 
            key.startsWith('school_students_') ||
            key.startsWith('school_assignments_')
        );

        keys.forEach(key => localStorage.removeItem(key));
        console.log(`🧹 Cleared ${keys.length} localStorage keys`);
    }
};

// Export for use in other modules
window.SupabaseConfig = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    initializeSupabase,
    isSupabaseAvailable,
    SupabaseAPI,
    MigrationHelper,
    SCHEMA_SQL
};

// Auto-initialize if Supabase library is already loaded
if (typeof window.supabase !== 'undefined') {
    initializeSupabase();
}

console.log('📦 Supabase configuration loaded - ready for database integration!');
