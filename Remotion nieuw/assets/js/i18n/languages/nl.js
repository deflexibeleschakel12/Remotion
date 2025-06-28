/* =================================
   NEDERLANDSE LANGUAGE PACK
   Schoolbeheersysteem v1.0.0
   Complete vertalingen - Professional tone
   ================================= */

export const nl = {
    // =================================
    // SYSTEM - Algemene systeemteksten
    // =================================
    system: {
        title: "Schoolbeheersysteem",
        subtitle: "Moderne oplossing voor onderwijsbeheer",
        name: "EduConnect",
        version: "Versie {version}",
        build: "Build: {build}",
        loading: "Systeem laden...",
        error: "Er is een fout opgetreden",
        success: "Actie succesvol uitgevoerd",
        welcome: "Welkom bij {systemName}",
        powered_by: "Aangedreven door",
        tech_stack: "Technologie stack"
    },

    // =================================
    // LANGUAGE - Taalinstellingen
    // =================================
    language: {
        current: "Nederlands",
        select: "Taal selecteren",
        dutch: "Nederlands",
        english: "Engels", 
        german: "Duits",
        french: "Frans",
        changed: "Taal gewijzigd naar {language}",
        auto_detect: "Automatisch detecteren"
    },

    // =================================
    // LOADING - Laadstatussen
    // =================================
    loading: {
        system: "Systeem laden...",
        authentication: "Authenticatie controleren...",
        data: "Gegevens laden...",
        please_wait: "Even geduld alstublieft",
        redirecting: "Doorverwijzen...",
        processing: "Verwerken...",
        saving: "Opslaan...",
        deleting: "Verwijderen...",
        uploading: "Uploaden...",
        downloading: "Downloaden..."
    },

    // =================================
    // STATISTICS - Statistieken
    // =================================
    stats: {
        schools: "Scholen",
        school_count: "{count, plural, =0 {Geen scholen} =1 {1 school} other {# scholen}}",
        users: "Gebruikers", 
        user_count: "{count, plural, =0 {Geen gebruikers} =1 {1 gebruiker} other {# gebruikers}}",
        students: "Leerlingen",
        student_count: "{count, plural, =0 {Geen leerlingen} =1 {1 leerling} other {# leerlingen}}",
        teachers: "Leerkrachten",
        teacher_count: "{count, plural, =0 {Geen leerkrachten} =1 {1 leerkracht} other {# leerkrachten}}",
        classes: "Klassen",
        class_count: "{count, plural, =0 {Geen klassen} =1 {1 klas} other {# klassen}}",
        active: "Actief",
        inactive: "Inactief",
        total: "Totaal"
    },

    // =================================
    // PORTAL - Hoofdportaal
    // =================================
    portal: {
        choose_role: "Kies je rol",
        description: "Selecteer hieronder je rol om toegang te krijgen tot het systeem",
        welcome_back: "Welkom terug",
        last_login: "Laatste login: {date}",
        quick_access: "Snelle toegang",
        recent_activity: "Recente activiteit"
    },

    // =================================
    // ROLES - Gebruikersrollen
    // =================================
    roles: {
        admin: {
            title: "Systeembeheerder",
            description: "Volledige systeemcontrole, schoolbeheer en gebruikersadministratie",
            feature1: "Scholen registreren",
            feature2: "Systeembeheer", 
            feature3: "Rapportages",
            permissions: "Volledige systeemtoegang",
            dashboard: "Beheerdersdashboard"
        },
        school: {
            title: "Schoolbeheerder", 
            description: "Klassenbeheer, leerkrachten en leerlingen administreren",
            feature1: "Klassen beheren",
            feature2: "Personeelsbeheer",
            feature3: "PDF exports",
            permissions: "Schoolbeheer en rapportage",
            dashboard: "Schooldashboard"
        },
        teacher: {
            title: "Leerkracht",
            description: "Klasoverzicht, leerlingenadministratie en voortgangsbewaking", 
            feature1: "Klasoverzicht",
            feature2: "Leerlingenbeheer",
            feature3: "Statistieken",
            permissions: "Klasbeheer en evaluatie",
            dashboard: "Leerkrachtendashboard"
        },
        student: {
            title: "Leerling",
            description: "Persoonlijk dashboard en klasinformatie",
            feature1: "Klasinfo",
            feature2: "Rooster", 
            feature3: "Profiel",
            permissions: "Persoonlijke gegevens inzien",
            dashboard: "Leerlingendashboard"
        }
    },

    // =================================
    // ACTIONS - Knoppen en acties
    // =================================
    actions: {
        login: "Inloggen",
        logout: "Uitloggen", 
        save: "Opslaan",
        cancel: "Annuleren",
        delete: "Verwijderen",
        edit: "Bewerken",
        add: "Toevoegen",
        create: "Aanmaken",
        update: "Bijwerken",
        view: "Bekijken",
        download: "Downloaden",
        upload: "Uploaden",
        search: "Zoeken",
        filter: "Filteren",
        export: "Exporteren",
        import: "Importeren",
        reset: "Resetten",
        refresh: "Vernieuwen",
        submit: "Versturen",
        confirm: "Bevestigen",
        back: "Terug",
        next: "Volgende",
        previous: "Vorige",
        close: "Sluiten",
        select: "Selecteren",
        choose: "Kiezen"
    },

    // =================================
    // WORKFLOW - Processstappen
    // =================================
    workflow: {
        title: "Systeemoverzicht",
        description: "Hoe het schoolbeheersysteem werkt",
        step1: {
            title: "Registratie",
            description: "Admin registreert scholen in het systeem"
        },
        step2: {
            title: "School Setup", 
            description: "School beheert klassen en gebruikers"
        },
        step3: {
            title: "Gebruikers",
            description: "Leerkrachten en leerlingen gebruiken het systeem"
        },
        step4: {
            title: "Rapportage",
            description: "Overzichten en PDF exports"
        },
        status: {
            pending: "In behandeling",
            in_progress: "Bezig",
            completed: "Voltooid",
            cancelled: "Geannuleerd"
        }
    },

    // =================================
    // VALIDATION - Formulier validaties
    // =================================
    validation: {
        required: "Dit veld is verplicht",
        email: "Voer een geldig e-mailadres in",
        password: "Wachtwoord moet minimaal 8 tekens bevatten",
        password_match: "Wachtwoorden komen niet overeen",
        phone: "Voer een geldig telefoonnummer in",
        postal_code: "Voer een geldige postcode in",
        brin: "Voer een geldig BRIN-nummer in",
        date: "Voer een geldige datum in",
        number: "Voer een geldig nummer in",
        min_length: "Minimaal {min} tekens vereist",
        max_length: "Maximaal {max} tekens toegestaan",
        min_value: "Waarde moet minimaal {min} zijn",
        max_value: "Waarde mag maximaal {max} zijn",
        unique: "Deze waarde bestaat al",
        format: "Ongeldige opmaak",
        file_size: "Bestand te groot (max {size}MB)",
        file_type: "Ongeldig bestandstype"
    },

    // =================================
    // ADMIN - Beheerder specifiek
    // =================================
    admin: {
        dashboard: "Beheerdersdashboard",
        school_management: "Schoolbeheer",
        user_management: "Gebruikersbeheer", 
        system_settings: "Systeeminstellingen",
        reports: "Rapportages",
        logs: "Systeemlogs",
        backup: "Back-up beheer",
        maintenance: "Onderhoud",
        notifications: "Systeemmeldingen",
        analytics: "Analytics"
    },

    // =================================
    // SCHOOL - Schoolbeheer
    // =================================
    school: {
        dashboard: "Schooldashboard",
        information: "Schoolinformatie",
        classes: "Klassenbeheer",
        teachers: "Leerkrachten",
        students: "Leerlingen",
        timetable: "Roosters",
        calendar: "Schoolkalender",
        events: "Evenementen",
        communications: "Communicatie",
        reports: "Schoolrapportages"
    },

    // =================================
    // TEACHER - Leerkracht interface
    // =================================
    teacher: {
        dashboard: "Leerkrachtendashboard",
        my_classes: "Mijn klassen",
        class_overview: "Klasoverzicht",
        students: "Leerlingen",
        grades: "Cijfers",
        attendance: "Aanwezigheid",
        assignments: "Opdrachten",
        schedule: "Rooster",
        materials: "Materialen",
        messages: "Berichten"
    },

    // =================================
    // STUDENT - Leerling portal
    // =================================
    student: {
        dashboard: "Leerlingendashboard",
        my_class: "Mijn klas",
        classmates: "Klasgenoten",
        schedule: "Rooster",
        grades: "Cijfers",
        assignments: "Opdrachten",
        materials: "Studiemateriaal",
        announcements: "Mededelingen",
        profile: "Profiel",
        calendar: "Kalender"
    },

    // =================================
    // FOOTER - Voettekst
    // =================================
    footer: {
        system: "Systeem",
        version: "Versie 1.0.0",
        build: "Build: 2025.06.26",
        support: "Ondersteuning",
        email: "support@school.nl",
        phone: "+31 (0)20 123 4567",
        powered_by: "Aangedreven door",
        copyright: "© {year} EduConnect. Alle rechten voorbehouden.",
        privacy: "Privacybeleid", 
        terms: "Gebruiksvoorwaarden",
        documentation: "Documentatie"
    },

    // =================================
    // MESSAGES - Systeem berichten
    // =================================
    messages: {
        welcome: "Welkom in het schoolbeheersysteem!",
        login_success: "Succesvol ingelogd",
        logout_success: "Succesvol uitgelogd",
        save_success: "Gegevens succesvol opgeslagen",
        delete_success: "Item succesvol verwijderd",
        error_generic: "Er is een onverwachte fout opgetreden",
        error_network: "Netwerkfout. Controleer je internetverbinding",
        error_permission: "Je hebt geen toestemming voor deze actie",
        confirm_delete: "Weet je zeker dat je dit wilt verwijderen?",
        unsaved_changes: "Je hebt niet-opgeslagen wijzigingen",
        session_expired: "Je sessie is verlopen. Log opnieuw in"
    },

    // =================================
    // FORMS - Formulier labels
    // =================================
    forms: {
        email: "E-mailadres",
        password: "Wachtwoord",
        confirm_password: "Wachtwoord bevestigen",
        first_name: "Voornaam",
        last_name: "Achternaam",
        full_name: "Volledige naam",
        phone: "Telefoonnummer",
        address: "Adres",
        postal_code: "Postcode",
        city: "Plaats",
        country: "Land",
        date_birth: "Geboortedatum",
        gender: "Geslacht",
        brin_number: "BRIN-nummer",
        school_name: "Schoolnaam",
        class_name: "Klasnaam",
        subject: "Onderwerp",
        description: "Beschrijving",
        notes: "Opmerkingen"
    },

    // =================================
    // TIME - Tijd en datums
    // =================================
    time: {
        now: "Nu",
        today: "Vandaag",
        yesterday: "Gisteren",
        tomorrow: "Morgen",
        this_week: "Deze week",
        last_week: "Vorige week",
        next_week: "Volgende week",
        this_month: "Deze maand",
        last_month: "Vorige maand",
        next_month: "Volgende maand",
        days_ago: "{count, plural, =1 {1 dag geleden} other {# dagen geleden}}",
        hours_ago: "{count, plural, =1 {1 uur geleden} other {# uur geleden}}",
        minutes_ago: "{count, plural, =1 {1 minuut geleden} other {# minuten geleden}}"
    }
};