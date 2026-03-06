/**
 * Validation utility for admin forms
 */

export const validators = {
  required: (value, fieldName) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return "Please enter a valid URL (including https://)";
    }
  },

  minLength: (min) => (value, fieldName) => {
    if (!value || value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value, fieldName) => {
    if (value && value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    // Allow various phone formats: +233550624203, 233550624203, 0550624203
    const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(value.replace(/\s/g, ""))) {
      return "Please enter a valid phone number";
    }
    return null;
  },

  number: (value, fieldName) => {
    if (!value) return null;
    if (isNaN(Number(value))) {
      return `${fieldName} must be a number`;
    }
    return null;
  },

  positiveNumber: (value, fieldName) => {
    if (!value) return null;
    const num = Number(value);
    if (isNaN(num) || num < 0) {
      return `${fieldName} must be a positive number`;
    }
    return null;
  }
};

/**
 * Validates an object of fields against a schema
 * @param {Object} values - Object containing field values
 * @param {Object} schema - Object where keys are field names and values are arrays of validator functions
 * @returns {Object} - Object where keys are field names and values are error messages (null if valid)
 */
export function validate(values, schema) {
  const errors = {};

  for (const [field, fieldValidators] of Object.entries(schema)) {
    const value = values[field];
    for (const validator of fieldValidators) {
      const error = validator(value, formatFieldName(field));
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}

/**
 * Validates a single field
 * @param {any} value - Field value
 * @param {Array} validators - Array of validator functions
 * @param {string} fieldName - Display name for the field
 * @returns {string|null} - Error message or null if valid
 */
export function validateField(value, validators, fieldName = "Field") {
  for (const validator of validators) {
    const error = validator(value, fieldName);
    if (error) return error;
  }
  return null;
}

/**
 * Checks if there are any validation errors
 * @param {Object} errors - Object of validation errors
 * @returns {boolean} - True if there are no errors
 */
export function isValid(errors) {
  return Object.values(errors).every((error) => !error);
}

/**
 * Formats a camelCase field name to a readable label
 * e.g., "yearsExperience" -> "Years experience"
 */
function formatFieldName(field) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Common validation schemas for forms
 */
export const schemas = {
  profile: {
    name: [validators.required, validators.maxLength(100)],
    role: [validators.required, validators.maxLength(100)],
    location: [validators.maxLength(100)],
    yearsExperience: [validators.maxLength(20)],
    availability: [validators.maxLength(100)],
    whatsapp: [validators.phone],
    email: [validators.email]
  },

  social: {
    githubUrl: [validators.url],
    linkedinUrl: [validators.url],
    xUrl: [validators.url],
    resumeUrl: [validators.url]
  },

  project: {
    title: [validators.required, validators.maxLength(100)],
    slug: [validators.required, validators.maxLength(100)],
    category: [validators.maxLength(50)],
    summary: [validators.required, validators.maxLength(300)],
    problem: [validators.maxLength(1000)],
    solution: [validators.maxLength(1000)],
    result: [validators.maxLength(1000)],
    image: [validators.url],
    liveUrl: [validators.url],
    repoUrl: [validators.url]
  },

  testimonial: {
    name: [validators.required, validators.maxLength(100)],
    company: [validators.maxLength(100)],
    quote: [validators.required, validators.maxLength(500)]
  },

  service: {
    title: [validators.required, validators.maxLength(100)],
    copy: [validators.required, validators.maxLength(500)],
    image: [validators.url]
  }
};

