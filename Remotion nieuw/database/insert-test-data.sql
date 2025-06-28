-- Supabase Test Data Insertion Script
-- Run this in the Supabase SQL Editor to populate the database with test data

-- First, make sure the tables exist (run the main schema first)

-- Insert test school
INSERT INTO public.schools (
    id,
    school_name,
    school_type,
    student_count,
    admin_name,
    admin_email,
    admin_phone,
    address,
    notes,
    credentials,
    status,
    created_at
) VALUES (
    'demo-school-123',
    'Demo Basisschool',
    'basisschool',
    46,
    'Demo Schoolbeheerder',
    'admin@demo.school.nl',
    '020-1234567',
    'Schoolstraat 123, 1234 AB Amsterdam',
    'Demo school voor testing',
    '{"username": "demo_admin", "password": "Demo123!"}',
    'active',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    updated_at = NOW();

-- Insert test classes
INSERT INTO public.classes (
    id,
    school_id,
    class_name,
    class_level,
    class_year,
    student_count,
    max_students,
    created_at
) VALUES 
(
    'demo-class-1',
    'demo-school-123',
    'Groep 5A',
    '5',
    '2024',
    24,
    30,
    NOW()
),
(
    'demo-class-2',
    'demo-school-123',
    'Groep 5B',
    '5', 
    '2024',
    22,
    30,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    class_name = EXCLUDED.class_name,
    updated_at = NOW();

-- Insert test teacher
INSERT INTO public.teachers (
    id,
    school_id,
    first_name,
    last_name,
    email,
    phone,
    subjects,
    employment_type,
    start_date,
    created_at
) VALUES (
    'demo-teacher-123',
    'demo-school-123',
    'Demo',
    'Leerkracht',
    'teacher@demo.school.nl',
    '06-12345678',
    ARRAY['Nederlands', 'Rekenen'],
    'full_time',
    '2024-01-01',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- Insert test students
INSERT INTO public.students (
    id,
    school_id,
    class_id,
    first_name,
    last_name,
    birth_date,
    parent_name,
    parent_email,
    parent_phone,
    created_at
) VALUES 
(
    'demo-student-1',
    'demo-school-123',
    'demo-class-1',
    'Emma',
    'Jansen',
    '2014-03-15',
    'Maria Jansen',
    'maria.jansen@email.nl',
    '06-11111111',
    NOW()
),
(
    'demo-student-2',
    'demo-school-123',
    'demo-class-1',
    'Liam',
    'Peters',
    '2014-07-22',
    'Jan Peters',
    'jan.peters@email.nl',
    '06-22222222',
    NOW()
),
(
    'demo-student-3',
    'demo-school-123',
    'demo-class-1',
    'Sophie',
    'van Berg',
    '2014-01-10',
    'Anne van Berg',
    'anne.vberg@email.nl',
    '06-33333333',
    NOW()
),
(
    'demo-student-4',
    'demo-school-123',
    'demo-class-2',
    'Daan',
    'Smit',
    '2014-09-05',
    'Peter Smit',
    'peter.smit@email.nl',
    '06-44444444',
    NOW()
),
(
    'demo-student-5',
    'demo-school-123',
    'demo-class-2',
    'Noa',
    'de Vries',
    '2014-11-30',
    'Lisa de Vries',
    'lisa.devries@email.nl',
    '06-55555555',
    NOW()
),
(
    'demo-student-main',
    'demo-school-123',
    'demo-class-1',
    'Demo',
    'Student',
    '2014-06-15',
    'Demo Ouder',
    'ouder@demo.school.nl',
    '06-99999999',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = NOW();

-- Insert teacher class assignments
INSERT INTO public.teacher_class_assignments (
    id,
    teacher_id,
    class_id,
    role,
    created_at
) VALUES 
(
    'demo-assignment-1',
    'demo-teacher-123',
    'demo-class-1',
    'hoofdleerkracht',
    NOW()
),
(
    'demo-assignment-2',
    'demo-teacher-123',
    'demo-class-2',
    'vakleerkracht',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = NOW();

-- Verify the data was inserted
SELECT 'Schools' as table_name, count(*) as count FROM public.schools WHERE school_name LIKE '%Demo%'
UNION ALL
SELECT 'Classes' as table_name, count(*) as count FROM public.classes WHERE school_id = 'demo-school-123'
UNION ALL  
SELECT 'Teachers' as table_name, count(*) as count FROM public.teachers WHERE school_id = 'demo-school-123'
UNION ALL
SELECT 'Students' as table_name, count(*) as count FROM public.students WHERE school_id = 'demo-school-123'
UNION ALL
SELECT 'Assignments' as table_name, count(*) as count FROM public.teacher_class_assignments WHERE teacher_id = 'demo-teacher-123';
