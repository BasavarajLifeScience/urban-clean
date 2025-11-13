/**
 * Helper utility functions
 */

/**
 * Generate random OTP
 * @param {Number} length - Length of OTP
 * @returns {String} - Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Generate unique booking number
 * @returns {String} - Booking number format: BK-YYYYMMDD-XXX
 */
const generateBookingNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK-${dateStr}-${random}`;
};

/**
 * Generate unique invoice number
 * @returns {String} - Invoice number format: INV-YYYYMMDD-XXX
 */
const generateInvoiceNumber = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${random}`;
};

/**
 * Calculate pagination values
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @returns {Object} - { skip, limit }
 */
const getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;
  return { skip, limit: limitNum, page: pageNum };
};

/**
 * Format phone number
 * @param {String} phoneNumber - Phone number to format
 * @returns {String} - Formatted phone number
 */
const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Add country code if not present
  if (!cleaned.startsWith('91') && cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - Is valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format
 * @param {String} phoneNumber - Phone number to validate
 * @returns {Boolean} - Is valid phone number
 */
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
  return phoneRegex.test(phoneNumber);
};

/**
 * Sanitize user input
 * @param {String} input - Input to sanitize
 * @returns {String} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Calculate profile completion percentage
 * @param {Object} profile - Profile object
 * @param {String} role - User role
 * @returns {Number} - Completion percentage
 */
const calculateProfileCompletion = (profile, role) => {
  const fields = {
    resident: ['firstName', 'lastName', 'address.flatNumber', 'address.society', 'avatar'],
    sevak: ['firstName', 'lastName', 'skills', 'experience', 'bio', 'documents', 'avatar'],
    vendor: ['firstName', 'lastName', 'businessName', 'businessType', 'servicesOffered', 'avatar'],
  };

  const requiredFields = fields[role] || fields.resident;
  let completed = 0;

  requiredFields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (profile[parent] && profile[parent][child]) completed++;
    } else {
      if (profile[field]) {
        if (Array.isArray(profile[field]) && profile[field].length > 0) {
          completed++;
        } else if (typeof profile[field] === 'object' && Object.keys(profile[field]).length > 0) {
          completed++;
        } else if (profile[field]) {
          completed++;
        }
      }
    }
  });

  return Math.round((completed / requiredFields.length) * 100);
};

/**
 * Generate time slots for a day
 * @param {String} startTime - Start time (HH:MM format)
 * @param {String} endTime - End time (HH:MM format)
 * @param {Number} interval - Interval in minutes
 * @returns {Array} - Array of time slots
 */
const generateTimeSlots = (startTime = '09:00', endTime = '18:00', interval = 60) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const hour = currentHour.toString().padStart(2, '0');
    const min = currentMin.toString().padStart(2, '0');
    const nextHour = Math.floor((currentMin + interval) / 60) + currentHour;
    const nextMin = (currentMin + interval) % 60;

    const nextHourStr = nextHour.toString().padStart(2, '0');
    const nextMinStr = nextMin.toString().padStart(2, '0');

    slots.push(`${hour}:${min} - ${nextHourStr}:${nextMinStr}`);

    currentHour = nextHour;
    currentMin = nextMin;
  }

  return slots;
};

module.exports = {
  generateOTP,
  generateBookingNumber,
  generateInvoiceNumber,
  getPagination,
  formatPhoneNumber,
  isValidEmail,
  isValidPhoneNumber,
  sanitizeInput,
  calculateProfileCompletion,
  generateTimeSlots,
};
