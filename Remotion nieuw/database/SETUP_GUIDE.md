# 🗄️ Supabase Database Setup Guide
**Schoolbeheersysteem - Complete Database Integratie**

## 📋 Overzicht

Dit document beschrijft hoe je het schoolbeheersysteem omzet van localStorage naar een volledig functionele Supabase database. Na deze setup synchroniseren alle gegevens tussen verschillende computers en browsers.

## 🚀 Stap 1: Supabase Project Aanmaken

### 1.1 Account Aanmaken
1. Ga naar [supabase.com](https://supabase.com)
2. Klik op "Start your project"
3. Maak een account aan (gratis tier is voldoende voor de meeste schoolgebruik)

### 1.2 Nieuw Project Aanmaken
1. Klik op "New Project"
2. Kies een organisatie of maak een nieuwe aan
3. Vul in:
   - **Project name**: `schoolbeheersysteem` (of je eigen naam)
   - **Database password**: Kies een sterk wachtwoord en bewaar dit veilig
   - **Region**: Kies het dichtstbijzijnde (bijv. Europe West voor Nederland)
4. Klik op "Create new project"
5. Wacht tot het project klaar is (kan 1-2 minuten duren)

## 🔧 Stap 2: Database Schema Instellen

### 2.1 SQL Editor Openen
1. Ga naar je Supabase project dashboard
2. Klik op "SQL Editor" in het linker menu
3. Klik op "New query"

### 2.2 Schema Uitvoeren
1. Kopieer de volledige inhoud van `database/setup.sql`
2. Plak het in de SQL editor
3. Klik op "Run" (of Ctrl+Enter)
4. Controleer dat alle tabellen succesvol zijn aangemaakt

### 2.3 Verificatie
Na het uitvoeren van het script zie je deze tabellen in de "Table Editor":
- `schools` - Hoofdschoolgegevens
- `classes` - Klassen per school
- `teachers` - Leerkrachten
- `students` - Leerlingen
- `teacher_assignments` - Leerkracht-klas toewijzingen
- `school_statistics` - Statistieken cache
- `audit_log` - Audit trail

## 🔑 Stap 3: API Credentials Verkrijgen

### 3.1 Project Settings
1. Ga naar "Settings" > "API" in het linker menu
2. Zoek de sectie "Project API keys"
3. Kopieer de volgende waarden:
   - **Project URL**: `https://jouwproject.supabase.co`
   - **Anon (public) key**: `eyJhbGc...` (lange string)

### 3.2 Credentials Bewaren
**BELANGRIJK**: Bewaar deze waarden veilig. Je hebt ze nodig voor de configuratie.

## ⚙️ Stap 4: Frontend Configuratie

### 4.1 Config.js Bijwerken
1. Open `assets/js/config.js`
2. Vervang de placeholder waarden:

```javascript
export const SUPABASE_CONFIG = {
    // Vervang met je eigen Project URL
    url: 'https://jouw-project-id.supabase.co',
    
    // Vervang met je eigen Anon Key
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    
    // Opties blijven hetzelfde
    options: { /* ... */ }
};
```

### 4.2 Feature Flags Controleren
```javascript
export const FEATURES = {
    useSupabaseDatabase: true, // ✅ Zet op true voor database gebruik
    enableRealtimeSync: true,   // ✅ Real-time synchronisatie
    enableOfflineSupport: true, // ✅ Offline fallback
    // ... andere features
};
```

## 🔄 Stap 5: Code Updaten

### 5.1 Admin Dashboard Update
1. Open `admin/index.html`
2. Zoek de script sectie onderaan
3. Vervang de oude SchoolManager implementatie:

```html
<!-- Voeg toe aan de head sectie -->
<script type="module">
    import SchoolManagerDB from '/assets/js/modules/school-manager-db.js';
    import { SUPABASE_CONFIG, DATABASE_CONFIG } from '/assets/js/config.js';

    // Initialiseer de nieuwe database-enabled manager
    const schoolManager = new SchoolManagerDB({
        ...SUPABASE_CONFIG,
        ...DATABASE_CONFIG
    });

    // Maak globaal beschikbaar voor bestaande functies
    window.schoolManager = schoolManager;
</script>
```

### 5.2 School Dashboard Update
Het schooldashboard kan later ook worden geüpdatet om de DatabaseManager te gebruiken voor klassen, leraren en leerlingen.

## 🧪 Stap 6: Testen

### 6.1 Database Connectie Testen
1. Open de browser developer console (F12)
2. Refresh de admin pagina
3. Controleer op deze berichten:
   ```
   🗄️ Initializing DatabaseManager...
   🔗 Supabase client initialized
   🚀 Initializing SchoolManagerDB...
   ✅ SchoolManagerDB initialization complete
   ```

### 6.2 Functionaliteit Testen
1. **School toevoegen**: Voeg een nieuwe school toe en controleer of deze verschijnt
2. **Multi-device test**: Open de pagina op een andere computer/browser - de school moet zichtbaar zijn
3. **Real-time test**: Voeg een school toe op device 1, controleer of deze automatisch verschijnt op device 2
4. **Offline test**: Zet internet uit, voeg een school toe, zet internet aan - moet synchroniseren

## 🛡️ Stap 7: Beveiliging (Productie)

### 7.1 Row Level Security Verificeren
1. Ga naar "Authentication" > "Policies" in Supabase
2. Controleer dat alle tabellen RLS policies hebben
3. Test dat gebruikers alleen hun eigen school data kunnen zien

### 7.2 Environment Variables (Optioneel)
Voor productie servers kun je environment variables gebruiken:
```bash
SUPABASE_URL=https://jouw-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔄 Stap 8: Data Migratie (Optioneel)

Als je al scholen hebt in localStorage:

### 8.1 Export Bestaande Data
```javascript
// Run in browser console
const existingSchools = JSON.parse(localStorage.getItem('admin_schools') || '[]');
console.log('Existing schools:', existingSchools);
```

### 8.2 Import naar Database
De nieuwe SchoolManagerDB zal automatisch fallback naar localStorage als de database niet beschikbaar is, dus je bestaande data blijft beschikbaar tijdens de transitie.

## 🎯 Resultaat

Na deze setup heb je:

✅ **Multi-device synchronisatie** - Data is zichtbaar op alle computers  
✅ **Real-time updates** - Wijzigingen verschijnen direct overal  
✅ **Offline support** - Werkt ook zonder internet (synct later)  
✅ **Data beveiliging** - Elke school ziet alleen eigen data  
✅ **Backup en recovery** - Data wordt veilig opgeslagen in de cloud  
✅ **Schaalbaarheid** - Kan groeien met je organisatie  

## 🆘 Troubleshooting

### Database Connectie Problemen
```
❌ DatabaseManager initialization failed
```
**Oplossing**: Controleer of je Supabase URL en API key correct zijn ingevuld.

### RLS Policy Errors
```
❌ Error: new row violates row-level security policy
```
**Oplossing**: Controleer of je ingelogd bent en de juiste rol hebt.

### Data Niet Zichtbaar
**Oplossing**: 
1. Check browser console voor errors
2. Verify Supabase project is actief
3. Controleer internet verbinding

## 📞 Support

Voor vragen over deze setup:
1. Check de browser console voor error berichten
2. Controleer de Supabase project logs
3. Verify dat alle SQL scripts succesvol zijn uitgevoerd

---

**🎉 Gefeliciteerd!** Je schoolbeheersysteem draait nu op een professionele database en kan worden gebruikt door meerdere gebruikers tegelijkertijd op verschillende apparaten.
