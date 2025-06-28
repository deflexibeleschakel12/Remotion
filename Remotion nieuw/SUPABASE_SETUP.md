# Supabase Database Setup Instructies

## 📋 Stap-voor-stap Database Setup

### 1. Supabase Project Setup ✅
- Project URL: `https://vsynvrkgcycvoaonnwmj.supabase.co`
- Anon Key: Geconfigureerd in `supabase-config.js`

### 2. Database Schema Aanmaken

Ga naar je Supabase dashboard → SQL Editor en voer de volgende queries uit:

#### A. Basis Tabellen

```sql
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
```

#### B. Indexes voor Performance

```sql
-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_teachers_school_id ON public.teachers(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_school_id ON public.teacher_class_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher_id ON public.teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignments_class_id ON public.teacher_class_assignments(class_id);
```

#### C. Row Level Security Policies

```sql
-- RLS Policies for Schools table
CREATE POLICY "Enable read access for all users" ON public.schools
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.schools
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable update for authenticated users only" ON public.schools
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable delete for authenticated users only" ON public.schools
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- RLS Policies for Classes table
CREATE POLICY "Enable read access for all users" ON public.classes
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.classes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable update for authenticated users only" ON public.classes
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable delete for authenticated users only" ON public.classes
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- RLS Policies for Teachers table
CREATE POLICY "Enable read access for all users" ON public.teachers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.teachers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable update for authenticated users only" ON public.teachers
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable delete for authenticated users only" ON public.teachers
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- RLS Policies for Students table
CREATE POLICY "Enable read access for all users" ON public.students
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.students
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable update for authenticated users only" ON public.students
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable delete for authenticated users only" ON public.students
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- RLS Policies for Teacher Class Assignments table
CREATE POLICY "Enable read access for all users" ON public.teacher_class_assignments
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.teacher_class_assignments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable update for authenticated users only" ON public.teacher_class_assignments
    FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Enable delete for authenticated users only" ON public.teacher_class_assignments
    FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
```

### 3. Supabase JavaScript Library Toevoegen

Voeg de Supabase JavaScript library toe aan je HTML bestanden:

```html
<!-- Add before closing </body> tag -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/assets/js/modules/supabase-config.js"></script>
```

### 4. Database Integratie Activeren

In je JavaScript bestanden, vervang localStorage calls met Supabase calls:

```javascript
// Voorbeeld: Schools laden
// VOOR (localStorage):
const schools = JSON.parse(localStorage.getItem('schools') || '[]');

// NA (Supabase):
const schools = await SupabaseAPI.getSchools() || [];

// Voorbeeld: School toevoegen
// VOOR (localStorage):
schools.push(newSchool);
localStorage.setItem('schools', JSON.stringify(schools));

// NA (Supabase):
const savedSchool = await SupabaseAPI.createSchool(newSchool);
```

### 5. Migration van Bestaande Data

Om je huidige localStorage data naar Supabase te migreren:

```javascript
// Voer uit in browser console wanneer Supabase is geconfigureerd
await SupabaseConfig.MigrationHelper.migrateLocalStorageToSupabase();
```

### 6. Testing

1. **Controleer Tabellen**: In Supabase dashboard → Table Editor
2. **Test Queries**: In SQL Editor probeer enkele SELECT queries
3. **Test API**: Gebruik browser console om API functies te testen:

```javascript
// Test Supabase connectie
console.log('Supabase connected:', SupabaseConfig.isSupabaseAvailable());

// Test school creation
const testSchool = await SupabaseConfig.SupabaseAPI.createSchool({
    school_name: 'Test School',
    school_type: 'Basisschool',
    admin_name: 'Test Admin',
    admin_email: 'test@school.nl'
});
console.log('Test school created:', testSchool);
```

## 🔄 Volgende Stappen

### A. Vervang localStorage in Bestaande Code
- Admin dashboard: school CRUD operations
- School dashboard: class, teacher, student operations
- Teacher dashboard: class/student loading
- Student dashboard: class/teacher/classmate loading

### B. Verbeterde Authentication
- Gebruik Supabase Auth voor echte gebruikersregistratie
- Password hashing en veilige opslag
- Email verificatie voor nieuwe accounts

### C. Real-time Features
- Live updates wanneer data verandert
- Real-time notifications
- Collaborative editing

### D. Advanced Features
- File uploads voor profielfoto's
- Email templates voor credential distribution
- Audit logging voor admin acties
- Data export/import functionaliteit

## ⚠️ Belangrijke Opmerkingen

1. **RLS (Row Level Security)**: Momenteel toegankelijk voor alle gebruikers voor demo doeleinden
2. **Credentials Storage**: JSONB veld voor username/password - in productie gebruik Supabase Auth
3. **Data Validation**: Voeg server-side validatie toe via Supabase Edge Functions
4. **Backup**: Reguliere database backups via Supabase dashboard

## 🚀 Deployment

Voor productie deployment:
1. Update RLS policies voor echte security
2. Gebruik environment variables voor API keys
3. Setup monitoring en alerting
4. Configure database backups
5. Setup CI/CD pipeline

---

**Status**: Database schema klaar, integratie in progress! 🎯
