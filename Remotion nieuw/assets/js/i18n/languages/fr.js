/* =================================
   FR.JS - Franse Language Pack
   Schoolbeheersysteem v1.0.0
   Formele Franse onderwijsterminologie
   ================================= */

/**
 * Franse vertalingen voor het Schoolbeheersysteem
 * - Formele toon (Vous-form)
 * - Franse onderwijsterminologie
 * - ICU MessageFormat pluralization
 * - Educational context voor Frankrijk
 * - Exacte namespace structuur
 */

const fr = {
    // === CORE SYSTEM ===
    system: {
        title: "Système de Gestion Scolaire",
        subtitle: "Solution moderne pour la gestion éducative",
        version: "Version 1.0.0",
        build: "Build : 2025.06.26",
        loading: "Chargement du système...",
        copyright: "© 2025 Système de Gestion Scolaire. Tous droits réservés."
    },

    // === LANGUAGE & LOCALIZATION ===
    language: {
        current: "Français",
        select: "Sélectionner la langue",
        french: "Français",
        dutch: "Néerlandais", 
        english: "Anglais",
        german: "Allemand",
        changed: "Langue changée en français",
        unsupported: "Langue non supportée"
    },

    // === LOADING STATES ===
    loading: {
        system: "Chargement du système...",
        data: "Chargement des données...",
        saving: "Enregistrement...",
        processing: "Traitement...",
        authenticating: "Authentification...",
        please_wait: "Veuillez patienter..."
    },

    // === USER ROLES ===
    roles: {
        admin: {
            title: "Administrateur Système",
            description: "Contrôle total du système, gestion des établissements et administration des utilisateurs",
            feature1: "Enregistrer les établissements",
            feature2: "Gestion système",
            feature3: "Rapports"
        },
        school: {
            title: "Administrateur Scolaire",
            description: "Gestion des classes, administration des enseignants et des élèves",
            feature1: "Gérer les classes",
            feature2: "Gestion du personnel",
            feature3: "Exports PDF"
        },
        teacher: {
            title: "Enseignant",
            description: "Vue d'ensemble des classes, administration des élèves et suivi des progrès",
            feature1: "Vue d'ensemble des classes",
            feature2: "Gestion des élèves",
            feature3: "Statistiques"
        },
        student: {
            title: "Élève",
            description: "Tableau de bord personnel et informations de classe",
            feature1: "Informations de classe",
            feature2: "Emploi du temps",
            feature3: "Profil"
        }
    },

    // === PORTAL NAVIGATION ===
    portal: {
        choose_role: "Choisissez votre rôle",
        description: "Sélectionnez votre rôle ci-dessous pour accéder au système",
        welcome: "Bienvenue dans le Système de Gestion Scolaire",
        select_portal: "Sélectionner le portail"
    },

    // === WORKFLOW SYSTEM ===
    workflow: {
        title: "Aperçu du système",
        description: "Comment fonctionne le système de gestion scolaire",
        step1: {
            title: "Inscription",
            description: "L'administrateur enregistre les établissements dans le système"
        },
        step2: {
            title: "Configuration Établissement",
            description: "L'établissement gère les classes et les utilisateurs"
        },
        step3: {
            title: "Utilisateurs",
            description: "Les enseignants et élèves utilisent le système"
        },
        step4: {
            title: "Rapports",
            description: "Aperçus et exports PDF"
        }
    },

    // === STATISTICS ===
    stats: {
        schools: "Établissements",
        users: "Utilisateurs",
        teachers: "Enseignants",
        students: "Élèves",
        classes: "Classes",
        total: "Total",
        active: "Actifs",
        new_this_month: "Nouveaux ce mois"
    },

    // === ACTIONS ===
    actions: {
        login: "Se connecter",
        logout: "Se déconnecter",
        save: "Enregistrer",
        cancel: "Annuler",
        delete: "Supprimer",
        edit: "Modifier",
        add: "Ajouter",
        view: "Voir",
        create: "Créer",
        update: "Mettre à jour",
        search: "Rechercher",
        filter: "Filtrer",
        export: "Exporter",
        print: "Imprimer",
        upload: "Télécharger",
        download: "Télécharger",
        submit: "Soumettre",
        reset: "Réinitialiser",
        back: "Retour",
        next: "Suivant",
        previous: "Précédent",
        continue: "Continuer",
        close: "Fermer",
        confirm: "Confirmer",
        approve: "Approuver",
        reject: "Rejeter"
    },

    // === FORM ELEMENTS ===
    forms: {
        required: "Requis",
        optional: "Optionnel",
        email: "Adresse e-mail",
        password: "Mot de passe",
        confirm_password: "Confirmer le mot de passe",
        name: "Nom",
        first_name: "Prénom",
        last_name: "Nom de famille",
        phone: "Numéro de téléphone",
        address: "Adresse",
        city: "Ville",
        postal_code: "Code postal",
        country: "Pays",
        select_option: "Sélectionner une option",
        select_date: "Sélectionner une date",
        select_time: "Sélectionner une heure",
        upload_file: "Télécharger un fichier",
        choose_file: "Choisir un fichier",
        no_file_chosen: "Aucun fichier choisi"
    },

    // === VALIDATION MESSAGES ===
    validation: {
        required_field: "Ce champ est requis",
        invalid_email: "Adresse e-mail invalide",
        password_too_short: "Le mot de passe doit contenir au moins 8 caractères",
        passwords_dont_match: "Les mots de passe ne correspondent pas",
        invalid_phone: "Numéro de téléphone invalide",
        invalid_postal_code: "Code postal invalide",
        file_too_large: "Le fichier est trop volumineux",
        invalid_file_type: "Type de fichier invalide",
        max_length_exceeded: "Longueur maximale dépassée",
        min_length_required: "Longueur minimale requise",
        invalid_number: "Nombre invalide",
        invalid_date: "Date invalide"
    },

    // === SCHOOL MANAGEMENT ===
    school_mgmt: {
        title: "Gestion des Établissements",
        add_school: "Ajouter un Établissement",
        edit_school: "Modifier l'Établissement",
        school_name: "Nom de l'Établissement",
        school_code: "Code Établissement",
        school_type: "Type d'Établissement",
        principal: "Directeur",
        vice_principal: "Directeur Adjoint",
        contact_person: "Personne de Contact",
        website: "Site Web",
        established_year: "Année de Création",
        student_capacity: "Capacité d'Élèves",
        school_details: "Détails de l'Établissement",
        school_settings: "Paramètres de l'Établissement"
    },

    // === CLASS MANAGEMENT ===
    class_mgmt: {
        title: "Gestion des Classes",
        add_class: "Ajouter une Classe",
        edit_class: "Modifier la Classe",
        class_name: "Nom de la Classe",
        class_code: "Code Classe",
        grade_level: "Niveau Scolaire",
        class_teacher: "Professeur Principal",
        room_number: "Numéro de Salle",
        capacity: "Capacité",
        current_enrollment: "Inscription Actuelle",
        academic_year: "Année Scolaire",
        subject: "Matière",
        schedule: "Emploi du Temps"
    },

    // === USER MANAGEMENT ===
    user_mgmt: {
        title: "Gestion des Utilisateurs",
        add_user: "Ajouter un Utilisateur",
        edit_user: "Modifier l'Utilisateur",
        user_details: "Détails de l'Utilisateur",
        user_role: "Rôle de l'Utilisateur",
        user_status: "Statut de l'Utilisateur",
        last_login: "Dernière Connexion",
        account_created: "Compte Créé",
        permissions: "Autorisations",
        reset_password: "Réinitialiser le Mot de Passe",
        deactivate_account: "Désactiver le Compte",
        activate_account: "Activer le Compte"
    },

    // === TEACHER MANAGEMENT ===
    teacher_mgmt: {
        title: "Gestion des Enseignants",
        add_teacher: "Ajouter un Enseignant",
        edit_teacher: "Modifier l'Enseignant",
        teacher_id: "ID Enseignant",
        employee_id: "ID Employé",
        department: "Département",
        subjects_taught: "Matières Enseignées",
        qualification: "Qualification",
        experience_years: "Années d'Expérience",
        joining_date: "Date d'Embauche",
        salary: "Salaire",
        teacher_profile: "Profil Enseignant"
    },

    // === STUDENT MANAGEMENT ===
    student_mgmt: {
        title: "Gestion des Élèves",
        add_student: "Ajouter un Élève",
        edit_student: "Modifier l'Élève",
        student_id: "ID Élève",
        admission_number: "Numéro d'Admission",
        admission_date: "Date d'Admission",
        current_class: "Classe Actuelle",
        parent_guardian: "Parent/Tuteur",
        emergency_contact: "Contact d'Urgence",
        medical_info: "Informations Médicales",
        student_profile: "Profil Élève",
        academic_record: "Dossier Scolaire"
    },

    // === DASHBOARD ===
    dashboard: {
        title: "Tableau de Bord",
        welcome_back: "Bon retour",
        overview: "Aperçu",
        recent_activity: "Activité Récente",
        quick_actions: "Actions Rapides",
        notifications: "Notifications",
        announcements: "Annonces",
        calendar: "Calendrier",
        tasks: "Tâches",
        messages: "Messages",
        reports: "Rapports",
        settings: "Paramètres"
    },

    // === NAVIGATION ===
    navigation: {
        home: "Accueil",
        dashboard: "Tableau de Bord",
        schools: "Établissements",
        classes: "Classes",
        teachers: "Enseignants",
        students: "Élèves",
        users: "Utilisateurs",
        reports: "Rapports",
        settings: "Paramètres",
        help: "Aide",
        logout: "Déconnexion",
        profile: "Profil",
        notifications: "Notifications"
    },

    // === ERROR MESSAGES ===
    errors: {
        general: "Une erreur est survenue",
        network: "Erreur de réseau",
        server: "Erreur serveur",
        not_found: "Non trouvé",
        unauthorized: "Non autorisé",
        forbidden: "Interdit",
        session_expired: "Session expirée",
        invalid_credentials: "Identifiants invalides",
        access_denied: "Accès refusé",
        file_upload_failed: "Échec du téléchargement de fichier",
        data_save_failed: "Échec de l'enregistrement des données",
        connection_lost: "Connexion perdue"
    },

    // === SUCCESS MESSAGES ===
    success: {
        saved: "Enregistré avec succès",
        updated: "Mis à jour avec succès",
        deleted: "Supprimé avec succès",
        created: "Créé avec succès",
        uploaded: "Téléchargé avec succès",
        sent: "Envoyé avec succès",
        processed: "Traité avec succès",
        login_success: "Connexion réussie",
        logout_success: "Déconnexion réussie",
        password_changed: "Mot de passe modifié avec succès"
    },

    // === CONFIRMATION MESSAGES ===
    confirm: {
        delete: "Êtes-vous sûr de vouloir supprimer cet élément ?",
        delete_multiple: "Êtes-vous sûr de vouloir supprimer ces éléments ?",
        logout: "Êtes-vous sûr de vouloir vous déconnecter ?",
        save_changes: "Voulez-vous enregistrer les modifications ?",
        discard_changes: "Voulez-vous ignorer les modifications ?",
        reset_form: "Voulez-vous réinitialiser le formulaire ?",
        reset_password: "Êtes-vous sûr de vouloir réinitialiser le mot de passe ?",
        deactivate_account: "Êtes-vous sûr de vouloir désactiver ce compte ?"
    },

    // === FOOTER ===
    footer: {
        system: "Système",
        version: "Version 1.0.0",
        build: "Build : 2025.06.26",
        support: "Support",
        email: "support@ecole.fr",
        phone: "+33 (0)1 23 45 67 89",
        powered_by: "Propulsé par",
        privacy_policy: "Politique de Confidentialité",
        terms_of_service: "Conditions d'Utilisation",
        contact_us: "Nous Contacter"
    },

    // === PLURALIZATION RULES (ICU MessageFormat) ===
    plurals: {
        schools: {
            "=0": "Aucun établissement",
            "=1": "1 établissement", 
            "other": "{count} établissements"
        },
        teachers: {
            "=0": "Aucun enseignant",
            "=1": "1 enseignant",
            "other": "{count} enseignants"
        },
        students: {
            "=0": "Aucun élève",
            "=1": "1 élève",
            "other": "{count} élèves"
        },
        classes: {
            "=0": "Aucune classe",
            "=1": "1 classe",
            "other": "{count} classes"
        },
        users: {
            "=0": "Aucun utilisateur",
            "=1": "1 utilisateur",
            "other": "{count} utilisateurs"
        },
        items_selected: {
            "=0": "Aucun élément sélectionné",
            "=1": "1 élément sélectionné",
            "other": "{count} éléments sélectionnés"
        },
        results_found: {
            "=0": "Aucun résultat trouvé",
            "=1": "1 résultat trouvé",
            "other": "{count} résultats trouvés"
        }
    },

    // === DATE & TIME ===
    datetime: {
        today: "Aujourd'hui",
        yesterday: "Hier",
        tomorrow: "Demain",
        this_week: "Cette semaine",
        last_week: "La semaine dernière",
        next_week: "La semaine prochaine",
        this_month: "Ce mois",
        last_month: "Le mois dernier",
        next_month: "Le mois prochain",
        january: "Janvier",
        february: "Février",
        march: "Mars",
        april: "Avril",
        may: "Mai",
        june: "Juin",
        july: "Juillet",
        august: "Août",
        september: "Septembre",
        october: "Octobre",
        november: "Novembre",
        december: "Décembre",
        monday: "Lundi",
        tuesday: "Mardi",
        wednesday: "Mercredi",
        thursday: "Jeudi",
        friday: "Vendredi",
        saturday: "Samedi",
        sunday: "Dimanche"
    },

    // === SCHOOL SPECIFIC TERMS ===
    education: {
        academic_year: "Année Scolaire",
        semester: "Semestre",
        term: "Trimestre",
        grade: "Note",
        subject: "Matière",
        curriculum: "Programme",
        timetable: "Emploi du Temps",
        homework: "Devoirs",
        assignment: "Devoir",
        exam: "Examen",
        test: "Test",
        quiz: "Quiz",
        attendance: "Présence",
        absent: "Absent",
        present: "Présent",
        late: "En retard",
        excused: "Excusé",
        unexcused: "Non excusé"
    }
};

// Export pour ES6 modules
export { fr };
export default fr;