/* =================================
   GERMAN LANGUAGE PACK - de.js
   Schulverwaltungssystem v1.0.0
   Professionelle Bildungsterminologie
   Max 300 Zeilen - ES6 Export Format
   ================================= */

export const de = {
    // === SYSTEM KERN ===
    system: {
        title: "Schulverwaltungssystem",
        subtitle: "Moderne Lösung für die Bildungsverwaltung",
        name: "SchulHub",
        version: "Version 1.0.0",
        build: "Build: 2025.06.26",
        description: "Umfassende Plattform zur Verwaltung von Bildungseinrichtungen"
    },

    // === SPRACHE & LOKALISIERUNG ===
    language: {
        current: "Deutsch",
        select: "Sprache auswählen",
        code: "de",
        name: "Deutsch",
        flag: "🇩🇪"
    },

    // === LADEZUSTÄNDE ===
    loading: {
        system: "System wird geladen...",
        data: "Daten werden geladen...",
        please_wait: "Bitte warten...",
        authentication: "Authentifizierung läuft...",
        dashboard: "Dashboard wird geladen...",
        profile: "Profil wird geladen..."
    },

    // === NAVIGATION & AKTIONEN ===
    actions: {
        login: "Anmelden",
        logout: "Abmelden",
        save: "Speichern",
        cancel: "Abbrechen",
        delete: "Löschen",
        edit: "Bearbeiten",
        add: "Hinzufügen",
        create: "Erstellen",
        update: "Aktualisieren",
        view: "Anzeigen",
        back: "Zurück",
        next: "Weiter",
        previous: "Zurück",
        submit: "Senden",
        reset: "Zurücksetzen",
        search: "Suchen",
        filter: "Filtern",
        export: "Exportieren",
        import: "Importieren",
        download: "Herunterladen",
        upload: "Hochladen"
    },

    // === STATISTIKEN & KENNZAHLEN ===
    stats: {
        schools: "Schulen",
        users: "Benutzer",
        students: "Schüler",
        teachers: "Lehrkräfte",
        classes: "Klassen",
        administrators: "Administratoren",
        total: "Gesamt",
        active: "Aktiv",
        inactive: "Inaktiv",
        online: "Online",
        offline: "Offline"
    },

    // === PORTAL & ROLLENAUSWAHL ===
    portal: {
        title: "Zugangsportal",
        choose_role: "Wählen Sie Ihre Rolle",
        description: "Wählen Sie unten Ihre Rolle aus, um auf das System zuzugreifen",
        welcome: "Willkommen im Schulverwaltungssystem",
        select_portal: "Portal auswählen"
    },

    // === BENUTZERROLLEN ===
    roles: {
        admin: {
            title: "Systemadministrator",
            description: "Vollständige Systemkontrolle, Schulverwaltung und Benutzerverwaltung",
            feature1: "Schulen registrieren",
            feature2: "Systemverwaltung",
            feature3: "Berichte & Analysen",
            short: "Admin"
        },
        school: {
            title: "Schuladministrator",
            description: "Klassenverwaltung, Personal- und Schülerverwaltung",
            feature1: "Klassen verwalten",
            feature2: "Personalverwaltung",
            feature3: "PDF-Exporte",
            short: "Schuladmin"
        },
        teacher: {
            title: "Lehrkraft",
            description: "Klassenübersicht, Schülerverwaltung und Fortschrittsverfolgung",
            feature1: "Klassenübersicht",
            feature2: "Schülerverwaltung",
            feature3: "Statistiken",
            short: "Lehrkraft"
        },
        student: {
            title: "Schüler",
            description: "Persönliches Dashboard und Klasseninformationen",
            feature1: "Klasseninfo",
            feature2: "Stundenplan",
            feature3: "Profil",
            short: "Schüler"
        }
    },

    // === ARBEITSABLAUF & PROZESSE ===
    workflow: {
        title: "Systemübersicht",
        description: "Wie das Schulverwaltungssystem funktioniert",
        step1: {
            title: "Registrierung",
            description: "Administrator registriert Schulen im System"
        },
        step2: {
            title: "Schuleinrichtung",
            description: "Schule verwaltet Klassen und Benutzer"
        },
        step3: {
            title: "Benutzer",
            description: "Lehrkräfte und Schüler nutzen das System"
        },
        step4: {
            title: "Berichterstattung",
            description: "Übersichten und PDF-Exporte"
        }
    },

    // === FOOTER INFORMATIONEN ===
    footer: {
        system: "System",
        version: "Version 1.0.0",
        build: "Build: 2025.06.26",
        support: "Support",
        email: "support@schule.de",
        phone: "+49 (0)30 123 4567",
        powered_by: "Betrieben von",
        copyright: "© 2025 Schulverwaltungssystem",
        privacy: "Datenschutzerklärung",
        terms: "Nutzungsbedingungen"
    },

    // === AUTHENTIFIZIERUNG ===
    auth: {
        login: "Anmelden",
        logout: "Abmelden",
        username: "Benutzername",
        password: "Passwort",
        email: "E-Mail-Adresse",
        remember_me: "Angemeldet bleiben",
        forgot_password: "Passwort vergessen?",
        reset_password: "Passwort zurücksetzen",
        change_password: "Passwort ändern",
        current_password: "Aktuelles Passwort",
        new_password: "Neues Passwort",
        confirm_password: "Passwort bestätigen",
        login_failed: "Anmeldung fehlgeschlagen",
        invalid_credentials: "Ungültige Anmeldedaten",
        account_locked: "Konto gesperrt",
        session_expired: "Sitzung abgelaufen"
    },

    // === FORMULARVALIDIERUNG ===
    validation: {
        required: "Dieses Feld ist erforderlich",
        email_invalid: "Ungültige E-Mail-Adresse",
        password_too_short: "Passwort zu kurz",
        passwords_dont_match: "Passwörter stimmen nicht überein",
        invalid_format: "Ungültiges Format",
        field_required: "Feld ist erforderlich",
        min_length: "Mindestens {count} Zeichen",
        max_length: "Maximal {count} Zeichen",
        invalid_brin: "Ungültiger BRIN-Code"
    },

    // === NACHRICHTEN & BENACHRICHTIGUNGEN ===
    messages: {
        success: "Erfolgreich",
        error: "Fehler",
        warning: "Warnung",
        info: "Information",
        saved: "Erfolgreich gespeichert",
        deleted: "Erfolgreich gelöscht",
        updated: "Erfolgreich aktualisiert",
        created: "Erfolgreich erstellt",
        failed: "Vorgang fehlgeschlagen",
        no_data: "Keine Daten verfügbar",
        loading_error: "Ladefehler",
        network_error: "Netzwerkfehler",
        permission_denied: "Zugriff verweigert",
        data_saved: "Daten wurden gespeichert",
        confirm_delete: "Sind Sie sicher, dass Sie dies löschen möchten?",
        unsaved_changes: "Sie haben ungespeicherte Änderungen"
    },

    // === SCHULVERWALTUNG ===
    school_mgmt: {
        school: "Schule",
        schools: "Schulen",
        school_name: "Schulname",
        school_code: "Schulcode",
        brin_code: "BRIN-Code",
        address: "Adresse",
        postal_code: "Postleitzahl",
        city: "Stadt",
        phone: "Telefonnummer",
        email: "E-Mail-Adresse",
        website: "Webseite",
        principal: "Schulleiter",
        add_school: "Schule hinzufügen",
        edit_school: "Schule bearbeiten",
        school_details: "Schuldetails",
        school_info: "Schulinformationen"
    },

    // === KLASSENVERWALTUNG ===
    class_mgmt: {
        class: "Klasse",
        classes: "Klassen",
        class_name: "Klassenname",
        grade_level: "Klassenstufe",
        academic_year: "Schuljahr",
        class_size: "Klassengröße",
        room_number: "Raumnummer",
        schedule: "Zeitplan",
        timetable: "Stundenplan",
        add_class: "Klasse hinzufügen",
        edit_class: "Klasse bearbeiten",
        class_details: "Klassendetails",
        class_list: "Klassenliste"
    },

    // === BENUTZERVERWALTUNG ===
    user_mgmt: {
        user: "Benutzer",
        users: "Benutzer",
        first_name: "Vorname",
        last_name: "Nachname",
        full_name: "Vollständiger Name",
        date_of_birth: "Geburtsdatum",
        student_number: "Schülernummer",
        employee_number: "Personalnummer",
        role: "Rolle",
        status: "Status",
        add_user: "Benutzer hinzufügen",
        edit_user: "Benutzer bearbeiten",
        user_details: "Benutzerdetails",
        user_profile: "Benutzerprofil"
    },

    // === PLURALISIERUNG (ICU MessageFormat) ===
    plurals: {
        schools: {
            zero: "Keine Schulen",
            one: "1 Schule",
            other: "{count} Schulen"
        },
        students: {
            zero: "Keine Schüler",
            one: "1 Schüler",
            other: "{count} Schüler"
        },
        teachers: {
            zero: "Keine Lehrkräfte",
            one: "1 Lehrkraft",
            other: "{count} Lehrkräfte"
        },
        classes: {
            zero: "Keine Klassen",
            one: "1 Klasse",
            other: "{count} Klassen"
        },
        users: {
            zero: "Keine Benutzer",
            one: "1 Benutzer",
            other: "{count} Benutzer"
        }
    },

    // === DATUM & ZEIT ===
    datetime: {
        today: "Heute",
        yesterday: "Gestern",
        tomorrow: "Morgen",
        this_week: "Diese Woche",
        last_week: "Letzte Woche",
        next_week: "Nächste Woche",
        this_month: "Dieser Monat",
        last_month: "Letzter Monat",
        next_month: "Nächster Monat",
        monday: "Montag",
        tuesday: "Dienstag",
        wednesday: "Mittwoch",
        thursday: "Donnerstag",
        friday: "Freitag",
        saturday: "Samstag",
        sunday: "Sonntag",
        january: "Januar",
        february: "Februar",
        march: "März",
        april: "April",
        may: "Mai",
        june: "Juni",
        july: "Juli",
        august: "August",
        september: "September",
        october: "Oktober",
        november: "November",
        december: "Dezember"
    },

    // === TECH STACK & CREDITS ===
    tech: {
        powered_by: "Betrieben von",
        built_with: "Erstellt mit",
        database: "Datenbank",
        frontend: "Frontend",
        backend: "Backend",
        hosting: "Hosting",
        version_control: "Versionsverwaltung"
    }
};

// Export als Standard
export default de;