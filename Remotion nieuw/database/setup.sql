-- =================================
-- SCHOOL MANAGEMENT SYSTEM DATABASE SCHEMA
-- Supabase SQL Setup - COMPLETE VERSION
-- Copy and paste this entire content into Supabase SQL Editor and run it
-- =================================

-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;
-- =================================
CREATE TABLE IF NOT EXISTS schools (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('basisschool', 'middelbare-school', 'vmbo', 'havo', 'vwo', 'mbo', 'university', 'other')),
    student_count INTEGER DEFAULT 0,
    address TEXT,
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL UNIQUE,
    admin_phone VARCHAR(50),
    notes TEXT,
    credentials JSONB NOT NULL, -- {username: string, password: string}
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('dutch', coalesce(name, '') || ' ' || coalesce(admin_name, '') || ' ' || coalesce(type, ''))
    ) STORED
);

-- Indexes for schools
CREATE INDEX IF NOT EXISTS idx_schools_type ON schools(type);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_admin_email ON schools(admin_email);
CREATE INDEX IF NOT EXISTS idx_schools_created_at ON schools(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schools_search ON schools USING GIN(search_vector);

-- =================================
-- CLASSES TABLE
-- =================================
CREATE TABLE IF NOT EXISTS classes (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    class_level INTEGER NOT NULL CHECK (class_level BETWEEN 1 AND 12),
    max_students INTEGER,
    student_count INTEGER DEFAULT 0,
    classroom VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique class names within a school
    UNIQUE(school_id, class_name)
);

-- Indexes for classes
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(class_level);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);

-- =================================
-- TEACHERS TABLE
-- =================================
CREATE TABLE IF NOT EXISTS teachers (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    subjects TEXT, -- Comma-separated list of subjects
    credentials JSONB NOT NULL, -- {username: string, password: string}
    hire_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique email within a school
    UNIQUE(school_id, email),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('dutch', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(subjects, ''))
    ) STORED
);

-- Indexes for teachers
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_status ON teachers(status);
CREATE INDEX IF NOT EXISTS idx_teachers_name ON teachers(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);
CREATE INDEX IF NOT EXISTS idx_teachers_search ON teachers USING GIN(search_vector);

-- =================================
-- STUDENTS TABLE
-- =================================
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id BIGINT REFERENCES classes(id) ON DELETE SET NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    student_number VARCHAR(50), -- School-specific student ID
    parent_name VARCHAR(255),
    parent_email VARCHAR(255),
    parent_phone VARCHAR(50),
    address TEXT,
    credentials JSONB NOT NULL, -- {username: string, password: string}
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique student number within a school (if provided)
    UNIQUE(school_id, student_number),
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('dutch', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(parent_name, ''))
    ) STORED
);

-- Indexes for students
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_students_number ON students(student_number);
CREATE INDEX IF NOT EXISTS idx_students_search ON students USING GIN(search_vector);

-- =================================
-- TEACHER ASSIGNMENTS TABLE
-- =================================
CREATE TABLE IF NOT EXISTS teacher_assignments (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id BIGINT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    role VARCHAR(100) DEFAULT 'teacher' CHECK (role IN ('hoofdleerkracht', 'vakleerkracht', 'ondersteuning', 'stagiair')),
    subject VARCHAR(100),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate assignments
    UNIQUE(teacher_id, class_id, role)
);

-- Indexes for teacher assignments
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_school ON teacher_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_class ON teacher_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_active ON teacher_assignments(start_date, end_date) WHERE end_date IS NULL;

-- =================================
-- SCHOOL STATISTICS TABLE (for caching)
-- =================================
CREATE TABLE IF NOT EXISTS school_statistics (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    total_students INTEGER DEFAULT 0,
    total_teachers INTEGER DEFAULT 0,
    total_classes INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,
    active_teachers INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(school_id)
);

-- =================================
-- AUDIT LOG TABLE
-- =================================
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    school_id BIGINT REFERENCES schools(id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id VARCHAR(255), -- Can be admin, teacher, or system
    user_role VARCHAR(50),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_school ON audit_log(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp DESC);

-- =================================
-- FUNCTIONS AND TRIGGERS
-- =================================

-- Function to update student count in classes
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE classes 
        SET student_count = student_count + 1,
            updated_at = NOW()
        WHERE id = NEW.class_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE classes 
        SET student_count = student_count - 1,
            updated_at = NOW()
        WHERE id = OLD.class_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle class change
        IF OLD.class_id IS DISTINCT FROM NEW.class_id THEN
            IF OLD.class_id IS NOT NULL THEN
                UPDATE classes 
                SET student_count = student_count - 1,
                    updated_at = NOW()
                WHERE id = OLD.class_id;
            END IF;
            IF NEW.class_id IS NOT NULL THEN
                UPDATE classes 
                SET student_count = student_count + 1,
                    updated_at = NOW()
                WHERE id = NEW.class_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for student count updates
DROP TRIGGER IF EXISTS trigger_update_class_student_count ON students;
CREATE TRIGGER trigger_update_class_student_count
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW EXECUTE FUNCTION update_class_student_count();

-- Function to update school statistics
CREATE OR REPLACE FUNCTION update_school_statistics(school_id_param BIGINT)
RETURNS VOID AS $$
DECLARE
    stats_record RECORD;
BEGIN
    SELECT 
        COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_students,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'active') as active_teachers,
        COUNT(DISTINCT t.id) as total_teachers,
        COUNT(DISTINCT c.id) as total_classes
    INTO stats_record
    FROM schools sch
    LEFT JOIN students s ON s.school_id = sch.id
    LEFT JOIN teachers t ON t.school_id = sch.id
    LEFT JOIN classes c ON c.school_id = sch.id
    WHERE sch.id = school_id_param;
    
    INSERT INTO school_statistics (
        school_id, 
        total_students, 
        total_teachers, 
        total_classes, 
        active_students, 
        active_teachers,
        updated_at
    ) VALUES (
        school_id_param,
        stats_record.total_students,
        stats_record.total_teachers,
        stats_record.total_classes,
        stats_record.active_students,
        stats_record.active_teachers,
        NOW()
    )
    ON CONFLICT (school_id) DO UPDATE SET
        total_students = EXCLUDED.total_students,
        total_teachers = EXCLUDED.total_teachers,
        total_classes = EXCLUDED.total_classes,
        active_students = EXCLUDED.active_students,
        active_teachers = EXCLUDED.active_teachers,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
DROP TRIGGER IF EXISTS trigger_schools_updated_at ON schools;
CREATE TRIGGER trigger_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_classes_updated_at ON classes;
CREATE TRIGGER trigger_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_teachers_updated_at ON teachers;
CREATE TRIGGER trigger_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_students_updated_at ON students;
CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================

-- Enable RLS on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools (admin can see all)
CREATE POLICY "Admin can do everything with schools" ON schools
    FOR ALL TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- School admins can only see their own school
CREATE POLICY "School admin can see own school" ON schools
    FOR SELECT TO authenticated
    USING (auth.jwt() ->> 'school_id' = id::text);

-- Similar policies for other tables...
CREATE POLICY "Users can access data from their school" ON classes
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'school_id' = school_id::text
    );

CREATE POLICY "Users can access data from their school" ON teachers
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'school_id' = school_id::text
    );

CREATE POLICY "Users can access data from their school" ON students
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'school_id' = school_id::text
    );

CREATE POLICY "Users can access data from their school" ON teacher_assignments
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'school_id' = school_id::text
    );

CREATE POLICY "Users can access data from their school" ON school_statistics
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'school_id' = school_id::text
    );

-- =================================
-- DEMO DATA INSERTION
-- =================================

-- Insert demo schools (only if they don't exist)
INSERT INTO schools (
    name, type, student_count, address, admin_name, admin_email, admin_phone, 
    notes, credentials, status, created_at, last_login
) VALUES 
(
    'Basisschool De Regenboog',
    'basisschool',
    287,
    'Schoolstraat 12, 1234 AB Amsterdam',
    'Mevr. van der Berg',
    'j.vandenberg@regenboog.nl',
    '06-12345678',
    'Actieve school met moderne faciliteiten',
    '{"username": "regenboog_admin", "password": "RB2024_Secure!"}',
    'active',
    '2024-01-15T00:00:00Z',
    '2024-01-20T00:00:00Z'
),
(
    'Middelbare School Het Kompas',
    'middelbare-school',
    542,
    'Leerlinglaan 45, 5678 CD Rotterdam',
    'Dhr. Jansen',
    'p.jansen@kompas.edu.nl',
    '010-1234567',
    'HAVO/VWO met technische profielen',
    '{"username": "kompas_admin", "password": "KMP2024_Safe!"}',
    'active',
    '2024-01-10T00:00:00Z',
    '2024-01-19T00:00:00Z'
)
ON CONFLICT (admin_email) DO NOTHING;

-- Update school statistics for demo schools
SELECT update_school_statistics(id) FROM schools WHERE admin_email IN ('j.vandenberg@regenboog.nl', 'p.jansen@kompas.edu.nl');

-- =================================
-- VIEWS FOR EASIER QUERYING
-- =================================

-- View for school overview with statistics
CREATE OR REPLACE VIEW school_overview AS
SELECT 
    s.*,
    ss.total_students,
    ss.total_teachers,
    ss.total_classes,
    ss.active_students,
    ss.active_teachers,
    ss.updated_at as stats_updated_at
FROM schools s
LEFT JOIN school_statistics ss ON s.id = ss.school_id;

-- View for class overview with teacher and student counts
CREATE OR REPLACE VIEW class_overview AS
SELECT 
    c.*,
    s.name as school_name,
    COUNT(DISTINCT t.id) as teacher_count,
    COUNT(DISTINCT st.id) as actual_student_count
FROM classes c
JOIN schools s ON c.school_id = s.id
LEFT JOIN teacher_assignments ta ON c.id = ta.class_id
LEFT JOIN teachers t ON ta.teacher_id = t.id
LEFT JOIN students st ON c.id = st.class_id
GROUP BY c.id, s.name;

-- Grant permissions for views
GRANT SELECT ON school_overview TO authenticated;
GRANT SELECT ON class_overview TO authenticated;

-- =================================
-- STUDENT MEMORIES TABLE (for portfolio system)
-- =================================
CREATE TABLE IF NOT EXISTS student_memories (
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

-- Enable RLS for student_memories
ALTER TABLE student_memories ENABLE ROW LEVEL SECURITY;

-- Create indexes for student_memories
CREATE INDEX IF NOT EXISTS idx_memories_student_id ON student_memories(student_id);
CREATE INDEX IF NOT EXISTS idx_memories_school_id ON student_memories(school_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON student_memories(memory_date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_casel ON student_memories(casel_skill);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON student_memories(created_at DESC);

-- RLS Policies for student_memories
-- Allow students to manage their own memories (for now, we'll allow all operations without auth check)
-- In production, you might want to add proper authentication checks
CREATE POLICY "Allow all operations on student_memories" ON student_memories
    FOR ALL USING (true);

-- Alternative: If you want to restrict based on student_id (uncomment and modify as needed):
-- CREATE POLICY "Students can manage own memories" ON student_memories
--     FOR ALL USING (student_id = current_setting('app.current_student_id', true));

-- =================================
-- SETUP COMPLETE
-- =================================

-- Summary of created objects
SELECT 'Schema setup complete!' as status,
       'Created tables: schools, classes, teachers, students, teacher_assignments, school_statistics, audit_log, student_memories' as tables,
       'Created functions and triggers for data consistency' as automation,
       'Enabled RLS for data security' as security,
       'Inserted demo data' as demo_data;
