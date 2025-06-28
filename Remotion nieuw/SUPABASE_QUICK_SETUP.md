# 🚀 Supabase Quick Setup voor Student Portfolio

## 📋 Stap 1: Database Setup

Ga naar je Supabase dashboard en open de **SQL Editor**. Voer het volgende SQL commando uit:

```sql
-- Create student_memories table
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

-- Enable RLS but allow all operations for demo
ALTER TABLE public.student_memories ENABLE ROW LEVEL SECURITY;

-- Create a permissive policy for demo purposes
CREATE POLICY "Allow all operations on student_memories" ON public.student_memories 
    FOR ALL USING (true);

-- Create useful indexes
CREATE INDEX IF NOT EXISTS idx_memories_student_id ON public.student_memories(student_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON public.student_memories(created_at DESC);
```

## 📂 Stap 2: Storage Setup (BELANGRIJK!)

⚠️ **Deze stap is essentieel voor file uploads!**

Ga naar **Storage** in je Supabase dashboard:

1. Klik op **"Create Bucket"**
2. Naam: `student-files` (exact deze naam!)
3. Zet **"Public bucket"** aan ✅
4. Klik **"Create bucket"**

### ❌ Troubleshooting: Bucket Aanmaken Mislukt

Als je in de console ziet:
```
⚠️ student-files bucket missing. Attempting to create...
❌ Could not create bucket automatically: new row violates row-level security policy
```

Dan moet je de bucket **handmatig** aanmaken:

1. **Ga naar je Supabase dashboard**
2. **Klik op "Storage" in het linker menu**
3. **Klik op "Create Bucket"**
4. **Vul in:**
   - Name: `student-files`
   - Public bucket: ✅ **AAN**
   - File size limit: 50MB (optioneel)
5. **Klik "Create bucket"**

### ✅ Verificatie Storage

Na het aanmaken zie je:
- ✅ Een bucket genaamd "student-files" in je Storage dashboard
- ✅ Console toont: `✅ Storage bucket ready`

### 🔐 Storage RLS Policies

Je hebt **2 opties** om de storage RLS issues op te lossen:

#### Optie 1: Eenvoudig (Voor Demo/Development) ⚡

Ga naar **SQL Editor** en voer uit:

```sql
-- Schakel RLS uit voor storage (eenvoudigste oplossing)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
```

#### Optie 2: Met Policies (Veiliger voor productie) 🛡️

Ga naar **SQL Editor** en voer uit:

```sql
-- Storage policies voor student-files bucket
CREATE POLICY "Allow file uploads to student-files bucket" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'student-files');

CREATE POLICY "Allow file downloads from student-files bucket" ON storage.objects 
    FOR SELECT USING (bucket_id = 'student-files');

CREATE POLICY "Allow file updates in student-files bucket" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'student-files');

CREATE POLICY "Allow file deletes from student-files bucket" ON storage.objects 
    FOR DELETE USING (bucket_id = 'student-files');

-- Bucket access policies
CREATE POLICY "Allow bucket access for student-files" ON storage.buckets 
    FOR SELECT USING (id = 'student-files');
```

💡 **Aanbeveling**: Voor een snelle demo/test setup kies **Optie 1**. Voor productie gebruik **Optie 2**.

## 🔧 Stap 3: API Keys

Zorg ervoor dat je de juiste keys hebt ingesteld in `assets/js/modules/supabase-config.js`:

```javascript
const SUPABASE_URL = 'jouw-supabase-url-hier';
const SUPABASE_ANON_KEY = 'jouw-anon-key-hier';
```

## ✅ Verificatie

Na het uitvoeren van bovenstaande stappen zou je app moeten werken met:

- ✅ Demo memories die automatisch worden aangemaakt in Supabase
- ✅ Nieuwe memories opslaan in Supabase database  
- ✅ File uploads naar Supabase Storage
- ✅ Automatische fallback naar localStorage als backup

## 🔒 Productie Security (Optioneel)

Voor productie gebruik kun je de permissive policy vervangen door:

```sql
-- Verwijder de permissive policy
DROP POLICY "Allow all operations on student_memories" ON public.student_memories;

-- Voeg beveiligde policies toe (voorbeeld)
CREATE POLICY "Students can view own memories" ON public.student_memories 
    FOR SELECT USING (student_id = auth.jwt() ->> 'student_id');

CREATE POLICY "Students can insert own memories" ON public.student_memories 
    FOR INSERT WITH CHECK (student_id = auth.jwt() ->> 'student_id');

CREATE POLICY "Students can update own memories" ON public.student_memories 
    FOR UPDATE USING (student_id = auth.jwt() ->> 'student_id');

CREATE POLICY "Students can delete own memories" ON public.student_memories 
    FOR DELETE USING (student_id = auth.jwt() ->> 'student_id');
```

---

## 🔧 Troubleshooting

### ❌ Probleem: "Could not create bucket automatically"

**Oplossing**: Dit is normaal! De app kan geen buckets aanmaken door RLS. Maak de bucket handmatig aan:

1. **Supabase Dashboard** → **Storage** → **Create Bucket**
2. **Name**: `student-files`
3. **Public bucket**: ✅ **AAN**
4. **SQL Editor** → Run: `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`

### ❌ Probleem: "Failed to insert memory"

**Oorzaken**:
- Database tabel niet aangemaakt → Run de SQL uit Stap 1
- RLS policies blokkeren → Run het permissive policy script uit Stap 1

### ❌ Probleem: File uploads falen

**Oorzaken**:
- Storage bucket `student-files` ontbreekt → Maak handmatig aan (zie Stap 2)
- Storage RLS blokkeert → Run: `ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`

### ✅ Console Berichten

**Goed:**
- `✅ Database tables ready`
- `✅ Storage bucket ready` 
- `✅ File uploaded to Supabase Storage`

**Actie vereist:**
- `⚠️ student-files bucket missing` → Bucket handmatig aanmaken
- `❌ Could not create bucket automatically` → Normaal, handmatig aanmaken
- `⚠️ File upload failed or bucket not available` → Storage setup controleren

### 🎯 Complete werkende setup:

1. ✅ Database tabel `student_memories` met permissive policy
2. ✅ Storage bucket `student-files` (public, handmatig aangemaakt)  
3. ✅ Storage RLS uitgeschakeld met SQL
4. ✅ Juiste API keys in `supabase-config.js`

## 🎯 Test je Setup

1. Start de development server: `python -m http.server 8000`
2. Log in als student
3. Probeer een herinnering toe te voegen met een bijlage
4. Check de console voor success berichten
5. Verificeer in Supabase dashboard dat data is opgeslagen

**Happy coding! 🎉**
