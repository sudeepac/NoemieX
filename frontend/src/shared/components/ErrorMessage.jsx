import React from 'react';
import styles from './ErrorMessage.module.css';

/**
 * Standardized error message component
 * Replaces inconsistent error display patterns like 'error-message', 'form-error', etc.
 * @param {Object|string} error - Error object with message property or string
 * @param {string} variant - Style variant: 'inline', 'block', 'toast' (default: 'inline')
 * @param {string} type - Error type: 'validation', 'network', 'general' (default: 'general')
 * @param {boolean} dismissible - Whether error can be dismissed (default: false)
 * @param {function} onDismiss - Callback when error is dismissed
 */
const ErrorMessage = ({ 
  error, 
  variant = 'inline',
  type = 'general',
  dismissible = false,
  onDismiss 
}) => {
  // Don't render if no error
  if (!error) return null;

  // Extract message from error object or use string directly
  const message = typeof error === 'object' ? error.message : error;
  
  // Don't render if no message
  if (!message) return null;

  const containerClass = `${styles.container} ${styles[variant]} ${styles[type]}`;

  return (
    <div className={containerClass} role="alert" aria-live="polite">
      <div className={styles.content}>
        <span className={styles.icon}>
          {type === 'validation' && '⚠️'}
          {type === 'network' && '🌐'}
          {type === 'general' && '❌'}
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      {dismissible && (
        <button 
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss error"
          type="button"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

// AI-NOTE: Created standardized ErrorMessage component to replace inconsistent error patterns like 'error-message', 'form-error', 'error-container'. Supports different variants and types for various use cases.