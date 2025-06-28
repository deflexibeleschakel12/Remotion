/* =================================
   ENGLISH LANGUAGE PACK - en.js
   School Management System v1.0.0
   Professional Educational Terminology
   Max 300 lines - ES6 Export Format
   ================================= */

export const en = {
    // === SYSTEM CORE ===
    system: {
        title: "School Management System",
        subtitle: "Modern solution for educational administration",
        name: "SchoolHub",
        version: "Version 1.0.0",
        build: "Build: 2025.06.26",
        description: "Comprehensive platform for managing educational institutions"
    },

    // === LANGUAGE & LOCALIZATION ===
    language: {
        current: "English",
        select: "Select Language",
        code: "en",
        name: "English",
        flag: "🇬🇧"
    },

    // === LOADING STATES ===
    loading: {
        system: "Loading system...",
        data: "Loading data...",
        please_wait: "Please wait...",
        authentication: "Authenticating...",
        dashboard: "Loading dashboard...",
        profile: "Loading profile..."
    },

    // === NAVIGATION & ACTIONS ===
    actions: {
        login: "Login",
        logout: "Logout",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        add: "Add",
        create: "Create",
        update: "Update",
        view: "View",
        back: "Back",
        next: "Next",
        previous: "Previous",
        submit: "Submit",
        reset: "Reset",
        search: "Search",
        filter: "Filter",
        export: "Export",
        import: "Import",
        download: "Download",
        upload: "Upload"
    },

    // === STATISTICS & METRICS ===
    stats: {
        schools: "Schools",
        users: "Users",
        students: "Students", 
        teachers: "Teachers",
        classes: "Classes",
        administrators: "Administrators",
        total: "Total",
        active: "Active",
        inactive: "Inactive",
        online: "Online",
        offline: "Offline"
    },

    // === PORTAL & ROLE SELECTION ===
    portal: {
        title: "Access Portal",
        choose_role: "Choose your role",
        description: "Select your role below to access the system",
        welcome: "Welcome to the School Management System",
        select_portal: "Select Portal"
    },

    // === USER ROLES ===
    roles: {
        admin: {
            title: "System Administrator",
            description: "Full system control, school management and user administration",
            feature1: "Register schools",
            feature2: "System management", 
            feature3: "Reports & analytics",
            short: "Admin"
        },
        school: {
            title: "School Administrator",
            description: "Class management, staff and student administration",
            feature1: "Manage classes",
            feature2: "Staff management",
            feature3: "PDF exports",
            short: "School Admin"
        },
        teacher: {
            title: "Teacher",
            description: "Class overview, student administration and progress tracking",
            feature1: "Class overview",
            feature2: "Student management",
            feature3: "Statistics",
            short: "Teacher"
        },
        student: {
            title: "Student",
            description: "Personal dashboard and class information",
            feature1: "Class info",
            feature2: "Schedule",
            feature3: "Profile",
            short: "Student"
        }
    },

    // === WORKFLOW & PROCESSES ===
    workflow: {
        title: "System Overview",
        description: "How the school management system works",
        step1: {
            title: "Registration",
            description: "Admin registers schools in the system"
        },
        step2: {
            title: "School Setup", 
            description: "School manages classes and users"
        },
        step3: {
            title: "Users",
            description: "Teachers and students use the system"
        },
        step4: {
            title: "Reporting",
            description: "Overviews and PDF exports"
        }
    },

    // === FOOTER INFORMATION ===
    footer: {
        system: "System",
        version: "Version 1.0.0",
        build: "Build: 2025.06.26",
        support: "Support",
        email: "support@school.com",
        phone: "+31 (0)20 123 4567",
        powered_by: "Powered by",
        copyright: "© 2025 School Management System",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
    },

    // === AUTHENTICATION ===
    auth: {
        login: "Login",
        logout: "Logout",
        username: "Username",
        password: "Password",
        email: "Email address",
        remember_me: "Remember me",
        forgot_password: "Forgot password?",
        reset_password: "Reset password",
        change_password: "Change password",
        current_password: "Current password",
        new_password: "New password",
        confirm_password: "Confirm password",
        login_failed: "Login failed",
        invalid_credentials: "Invalid credentials",
        account_locked: "Account locked",
        session_expired: "Session expired"
    },

    // === FORM VALIDATION ===
    validation: {
        required: "This field is required",
        email_invalid: "Invalid email address",
        password_too_short: "Password too short",
        passwords_dont_match: "Passwords don't match",
        invalid_format: "Invalid format",
        field_required: "Field is required",
        min_length: "Minimum {count} characters",
        max_length: "Maximum {count} characters",
        invalid_brin: "Invalid BRIN code"
    },

    // === MESSAGES & NOTIFICATIONS ===
    messages: {
        success: "Success",
        error: "Error", 
        warning: "Warning",
        info: "Information",
        saved: "Successfully saved",
        deleted: "Successfully deleted",
        updated: "Successfully updated",
        created: "Successfully created",
        failed: "Operation failed",
        no_data: "No data available",
        loading_error: "Loading error",
        network_error: "Network error",
        permission_denied: "Permission denied",
        data_saved: "Data has been saved",
        confirm_delete: "Are you sure you want to delete this?",
        unsaved_changes: "You have unsaved changes"
    },

    // === SCHOOL MANAGEMENT ===
    school_mgmt: {
        school: "School",
        schools: "Schools", 
        school_name: "School name",
        school_code: "School code",
        brin_code: "BRIN code",
        address: "Address",
        postal_code: "Postal code",
        city: "City",
        phone: "Phone number",
        email: "Email address",
        website: "Website",
        principal: "Principal",
        add_school: "Add school",
        edit_school: "Edit school",
        school_details: "School details",
        school_info: "School information"
    },

    // === CLASS MANAGEMENT ===
    class_mgmt: {
        class: "Class",
        classes: "Classes",
        class_name: "Class name", 
        grade_level: "Grade level",
        academic_year: "Academic year",
        class_size: "Class size",
        room_number: "Room number",
        schedule: "Schedule",
        timetable: "Timetable",
        add_class: "Add class",
        edit_class: "Edit class",
        class_details: "Class details",
        class_list: "Class list"
    },

    // === USER MANAGEMENT ===
    user_mgmt: {
        user: "User",
        users: "Users",
        first_name: "First name",
        last_name: "Last name", 
        full_name: "Full name",
        date_of_birth: "Date of birth",
        student_number: "Student number",
        employee_number: "Employee number",
        role: "Role",
        status: "Status",
        add_user: "Add user",
        edit_user: "Edit user",
        user_details: "User details",
        user_profile: "User profile"
    },

    // === PLURALIZATION (ICU MessageFormat) ===
    plurals: {
        schools: {
            zero: "No schools",
            one: "1 school", 
            other: "{count} schools"
        },
        students: {
            zero: "No students",
            one: "1 student",
            other: "{count} students"
        },
        teachers: {
            zero: "No teachers", 
            one: "1 teacher",
            other: "{count} teachers"
        },
        classes: {
            zero: "No classes",
            one: "1 class",
            other: "{count} classes"
        },
        users: {
            zero: "No users",
            one: "1 user", 
            other: "{count} users"
        }
    },

    // === DATE & TIME ===
    datetime: {
        today: "Today",
        yesterday: "Yesterday",
        tomorrow: "Tomorrow",
        this_week: "This week",
        last_week: "Last week",
        next_week: "Next week",
        this_month: "This month",
        last_month: "Last month",
        next_month: "Next month",
        monday: "Monday",
        tuesday: "Tuesday", 
        wednesday: "Wednesday",
        thursday: "Thursday",
        friday: "Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        january: "January",
        february: "February",
        march: "March",
        april: "April",
        may: "May",
        june: "June",
        july: "July",
        august: "August",
        september: "September",
        october: "October",
        november: "November",
        december: "December"
    },

    // === TECH STACK & CREDITS ===
    tech: {
        powered_by: "Powered by",
        built_with: "Built with",
        database: "Database",
        frontend: "Frontend", 
        backend: "Backend",
        hosting: "Hosting",
        version_control: "Version Control"
    }
};

// Export as default
export default en;