/**
 * Input sanitization and validation utility functions
 * These functions help prevent XSS and SQL injection attacks
 */

/**
 * Sanitizes text input to prevent XSS attacks
 * @param {string} input - The user input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (!input) return '';
  
  // Convert input to string if it's not already
  const str = String(input);
  
  // Replace HTML special characters with their HTML entities
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Sanitizes object fields recursively
 * @param {Object} obj - Object containing user input
 * @returns {Object} - Object with sanitized values
 */
export const sanitizeObject = (obj) => {
  // Handle null values
  if (obj === null) return null;
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => {
      if (typeof item === 'object' && item !== null) {
        return sanitizeObject(item);
      } else if (typeof item === 'string') {
        return sanitizeInput(item);
      } else {
        return item;
      }
    });
  }
  
  // Handle regular objects
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password (minimum requirements)
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length (default: 6)
 * @returns {boolean} - Whether password meets requirements
 */
export const isValidPassword = (password, minLength = 6) => {
  return password && password.length >= minLength;
};

/**
 * Validates a name (letters, spaces, hyphens, and apostrophes only)
 * @param {string} name - Name to validate
 * @returns {boolean} - Whether name is valid
 */
export const isValidName = (name) => {
  const nameRegex = /^[A-Za-z\s'-]+$/;
  return nameRegex.test(name);
};

/**
 * Validates a zipcode/postal code
 * @param {string} zipCode - Zipcode to validate
 * @returns {boolean} - Whether zipcode is valid
 */
export const isValidZipCode = (zipCode) => {
  // This supports common formats for US and international postal codes
  const zipRegex = /^[A-Za-z0-9\s-]{3,10}$/;
  return zipRegex.test(zipCode);
};

/**
 * Validates a phone number (basic format check)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone number is valid
 */
export const isValidPhoneNumber = (phone) => {
  // Basic international phone number validation
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a URL
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};