/**
 * Shared utility functions
 */

// Date formatting utilities
export const formatDate = (date, format = 'short') => {
  if (!date) return 'Not set';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return 'Invalid date';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString();
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'time':
      return dateObj.toLocaleTimeString();
    case 'datetime':
      return dateObj.toLocaleString();
    default:
      return dateObj.toLocaleDateString();
  }
};

// String utilities
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Number utilities
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Array utilities
export const sortByProperty = (array, property, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[property];
    const bVal = b[property];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
};

// Validation utilities
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

// Object utilities
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

// Status utilities
export const getStatusColor = (status) => {
  const statusColors = {
    active: '#10b981',
    inactive: '#ef4444',
    pending: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    draft: '#6b7280',
    sent: '#3b82f6',
    completed: '#10b981',
    cancelled: '#ef4444'
  };
  
  return statusColors[status?.toLowerCase()] || '#6b7280';
};

export default {
  formatDate,
  truncateText,
  capitalizeFirst,
  formatCurrency,
  sortByProperty,
  isValidEmail,
  isValidPhone,
  deepClone,
  isEmpty,
  getStatusColor
};