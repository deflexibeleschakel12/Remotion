/* =================================
   VALIDATORS.JS - Validation Utilities
   Schoolbeheersysteem v1.0.0
   
   Validatie functies voor input fields
   ================================= */

/**
 * BRIN (Basis Registratie Instellingen) nummer validator
 * Nederlandse school identificatie nummers
 */
export function validateBRIN(brinNumber) {
    if (!brinNumber) {
        return {
            isValid: false,
            error: 'BRIN nummer is verplicht'
        };
    }

    // Remove spaces and convert to uppercase
    const cleanBrin = brinNumber.toString().replace(/\s/g, '').toUpperCase();
    
    // BRIN format: 2 digits + 2 letters (e.g., "01AB")
    const brinRegex = /^[0-9]{2}[A-Z]{2}$/;
    
    if (!brinRegex.test(cleanBrin)) {
        return {
            isValid: false,
            error: 'BRIN nummer moet bestaan uit 2 cijfers gevolgd door 2 letters (bijv. 01AB)'
        };
    }

    return {
        isValid: true,
        formatted: cleanBrin
    };
}

/**
 * Dutch postal code validator
 */
export function validatePostalCode(postalCode) {
    if (!postalCode) {
        return {
            isValid: false,
            error: 'Postcode is verplicht'
        };
    }

    // Remove spaces and convert to uppercase
    const cleanCode = postalCode.toString().replace(/\s/g, '').toUpperCase();
    
    // Dutch postal code format: 4 digits + 2 letters (e.g., "1234AB")
    const postalCodeRegex = /^[1-9][0-9]{3}[A-Z]{2}$/;
    
    if (!postalCodeRegex.test(cleanCode)) {
        return {
            isValid: false,
            error: 'Voer een geldige Nederlandse postcode in (bijv. 1234AB)'
        };
    }

    // Format with space: "1234 AB"
    const formatted = cleanCode.slice(0, 4) + ' ' + cleanCode.slice(4);

    return {
        isValid: true,
        formatted: formatted
    };
}

/**
 * Dutch phone number validator
 */
export function validatePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        return {
            isValid: false,
            error: 'Telefoonnummer is verplicht'
        };
    }

    // Remove all non-digit characters
    const cleanNumber = phoneNumber.toString().replace(/\D/g, '');
    
    // Dutch mobile: starts with 06, 10 digits total
    // Dutch landline: starts with 0, followed by area code, 10 digits total
    // International: starts with +31 or 0031
    
    let formatted = '';
    let isValid = false;

    if (cleanNumber.startsWith('0031')) {
        // International format starting with 0031
        const nationalNumber = cleanNumber.slice(4);
        if (nationalNumber.length === 9) {
            formatted = `+31 ${nationalNumber.slice(0, 1)} ${nationalNumber.slice(1, 5)} ${nationalNumber.slice(5)}`;
            isValid = true;
        }
    } else if (cleanNumber.startsWith('31') && cleanNumber.length === 11) {
        // International format starting with 31
        const nationalNumber = cleanNumber.slice(2);
        formatted = `+31 ${nationalNumber.slice(0, 1)} ${nationalNumber.slice(1, 5)} ${nationalNumber.slice(5)}`;
        isValid = true;
    } else if (cleanNumber.startsWith('06') && cleanNumber.length === 10) {
        // Dutch mobile number
        formatted = `${cleanNumber.slice(0, 2)} ${cleanNumber.slice(2, 6)} ${cleanNumber.slice(6)}`;
        isValid = true;
    } else if (cleanNumber.startsWith('0') && cleanNumber.length === 10) {
        // Dutch landline number
        formatted = `${cleanNumber.slice(0, 3)} ${cleanNumber.slice(3, 6)} ${cleanNumber.slice(6)}`;
        isValid = true;
    }

    if (!isValid) {
        return {
            isValid: false,
            error: 'Voer een geldig Nederlands telefoonnummer in'
        };
    }

    return {
        isValid: true,
        formatted: formatted
    };
}

/**
 * Email validator (enhanced)
 */
export function validateEmail(email) {
    if (!email) {
        return {
            isValid: false,
            error: 'E-mailadres is verplicht'
        };
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: 'Voer een geldig e-mailadres in'
        };
    }

    // Check for common typos in domain
    const domain = email.split('@')[1];
    const commonDomains = {
        'gmai.com': 'gmail.com',
        'gmial.com': 'gmail.com',
        'yahooo.com': 'yahoo.com',
        'hotmial.com': 'hotmail.com'
    };

    let suggestion = null;
    if (commonDomains[domain]) {
        suggestion = email.replace(domain, commonDomains[domain]);
    }

    return {
        isValid: true,
        formatted: email.toLowerCase(),
        suggestion: suggestion
    };
}

/**
 * Name validator (Dutch naming conventions)
 */
export function validateName(name, fieldName = 'Naam') {
    if (!name) {
        return {
            isValid: false,
            error: `${fieldName} is verplicht`
        };
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
        return {
            isValid: false,
            error: `${fieldName} moet minimaal 2 karakters bevatten`
        };
    }

    if (trimmedName.length > 50) {
        return {
            isValid: false,
            error: `${fieldName} mag maximaal 50 karakters bevatten`
        };
    }

    // Allow letters, spaces, hyphens, apostrophes (common in Dutch names)
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    
    if (!nameRegex.test(trimmedName)) {
        return {
            isValid: false,
            error: `${fieldName} mag alleen letters, spaties, streepjes en apostroffen bevatten`
        };
    }

    // Capitalize first letter of each word
    const formatted = trimmedName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return {
        isValid: true,
        formatted: formatted
    };
}

/**
 * Password strength validator
 */
export function validatePassword(password, requirements = {}) {
    const defaultRequirements = {
        minLength: 8,
        maxLength: 128,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
    };

    const config = { ...defaultRequirements, ...requirements };
    const errors = [];
    let score = 0;

    if (!password) {
        return {
            isValid: false,
            error: 'Wachtwoord is verplicht',
            score: 0,
            strength: 'Zeer zwak'
        };
    }

    // Length check
    if (password.length < config.minLength) {
        errors.push(`Wachtwoord moet minimaal ${config.minLength} karakters bevatten`);
    } else {
        score += 1;
    }

    if (password.length > config.maxLength) {
        errors.push(`Wachtwoord mag maximaal ${config.maxLength} karakters bevatten`);
    }

    // Character requirements
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Wachtwoord moet minimaal één hoofdletter bevatten');
    } else if (/[A-Z]/.test(password)) {
        score += 1;
    }

    if (config.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Wachtwoord moet minimaal één kleine letter bevatten');
    } else if (/[a-z]/.test(password)) {
        score += 1;
    }

    if (config.requireNumbers && !/\d/.test(password)) {
        errors.push('Wachtwoord moet minimaal één cijfer bevatten');
    } else if (/\d/.test(password)) {
        score += 1;
    }

    if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Wachtwoord moet minimaal één speciaal teken bevatten');
    } else if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        score += 1;
    }

    // Calculate strength
    const strengthLabels = ['Zeer zwak', 'Zwak', 'Matig', 'Sterk', 'Zeer sterk'];
    const strength = strengthLabels[Math.min(score, 4)];
    const percentage = (score / 5) * 100;

    return {
        isValid: errors.length === 0,
        errors: errors,
        score: percentage,
        strength: strength
    };
}

/**
 * Date validator (Dutch format)
 */
export function validateDate(dateString, format = 'DD-MM-YYYY') {
    if (!dateString) {
        return {
            isValid: false,
            error: 'Datum is verplicht'
        };
    }

    let day, month, year;
    
    if (format === 'DD-MM-YYYY') {
        const parts = dateString.split('-');
        if (parts.length !== 3) {
            return {
                isValid: false,
                error: 'Voer datum in als DD-MM-JJJJ'
            };
        }
        [day, month, year] = parts;
    } else if (format === 'YYYY-MM-DD') {
        const parts = dateString.split('-');
        if (parts.length !== 3) {
            return {
                isValid: false,
                error: 'Voer datum in als JJJJ-MM-DD'
            };
        }
        [year, month, day] = parts;
    }

    // Convert to numbers
    day = parseInt(day, 10);
    month = parseInt(month, 10);
    year = parseInt(year, 10);

    // Basic range checks
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
        return {
            isValid: false,
            error: 'Ongeldige datum'
        };
    }

    if (month < 1 || month > 12) {
        return {
            isValid: false,
            error: 'Maand moet tussen 1 en 12 zijn'
        };
    }

    if (day < 1 || day > 31) {
        return {
            isValid: false,
            error: 'Dag moet tussen 1 en 31 zijn'
        };
    }

    // Create date object and check if it's valid
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return {
            isValid: false,
            error: 'Ongeldige datum'
        };
    }

    return {
        isValid: true,
        date: date,
        formatted: `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`
    };
}

/**
 * Required field validator
 */
export function validateRequired(value, fieldName = 'Dit veld') {
    if (value === null || value === undefined || value === '') {
        return {
            isValid: false,
            error: `${fieldName} is verplicht`
        };
    }

    if (typeof value === 'string' && value.trim() === '') {
        return {
            isValid: false,
            error: `${fieldName} is verplicht`
        };
    }

    return {
        isValid: true
    };
}

/**
 * URL validator
 */
export function validateURL(url) {
    if (!url) {
        return {
            isValid: false,
            error: 'URL is verplicht'
        };
    }

    try {
        const urlObject = new URL(url);
        return {
            isValid: true,
            formatted: urlObject.href
        };
    } catch (error) {
        return {
            isValid: false,
            error: 'Voer een geldige URL in'
        };
    }
}

/**
 * Number validator
 */
export function validateNumber(value, options = {}) {
    const { min, max, allowDecimals = true, fieldName = 'Getal' } = options;

    if (value === null || value === undefined || value === '') {
        return {
            isValid: false,
            error: `${fieldName} is verplicht`
        };
    }

    const num = Number(value);
    
    if (isNaN(num)) {
        return {
            isValid: false,
            error: `${fieldName} moet een geldig getal zijn`
        };
    }

    if (!allowDecimals && !Number.isInteger(num)) {
        return {
            isValid: false,
            error: `${fieldName} moet een heel getal zijn`
        };
    }

    if (min !== undefined && num < min) {
        return {
            isValid: false,
            error: `${fieldName} moet minimaal ${min} zijn`
        };
    }

    if (max !== undefined && num > max) {
        return {
            isValid: false,
            error: `${fieldName} mag maximaal ${max} zijn`
        };
    }

    return {
        isValid: true,
        value: num
    };
}

/**
 * Form validation helper
 */
export function validateForm(formData, validationRules) {
    const errors = {};
    let isValid = true;

    for (const fieldName in validationRules) {
        const rules = validationRules[fieldName];
        const value = formData[fieldName];

        for (const rule of rules) {
            const result = rule.validator(value, rule.options);
            
            if (!result.isValid) {
                errors[fieldName] = result.error || result.errors;
                isValid = false;
                break; // Stop at first error for this field
            }
        }
    }

    return {
        isValid,
        errors
    };
}

// Export default object with all validators
export default {
    validateBRIN,
    validatePostalCode,
    validatePhoneNumber,
    validateEmail,
    validateName,
    validatePassword,
    validateDate,
    validateRequired,
    validateURL,
    validateNumber,
    validateForm
};
