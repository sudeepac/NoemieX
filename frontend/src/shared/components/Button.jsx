import React from 'react';
import styles from './Button.module.css';

/**
 * Standardized button component
 * Replaces inconsistent button patterns and provides unified styling
 * @param {string} variant - Button style: 'primary', 'secondary', 'danger', 'ghost' (default: 'primary')
 * @param {string} size - Button size: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} loading - Whether button is in loading state
 * @param {boolean} fullWidth - Whether button takes full width
 * @param {string} type - Button type: 'button', 'submit', 'reset' (default: 'button')
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  children,
  className = '',
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    loading && styles.loading,
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <button
      type={type}
      className={buttonClass}
      disabled={disabled || loading}
      onClick={handleClick}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <span className={styles.spinnerInner}></span>
        </span>
      )}
      <span className={loading ? styles.hiddenText : ''}>
        {children}
      </span>
    </button>
  );
};

export default Button;

// AI-NOTE: Created standardized Button component to replace inconsistent button patterns. Includes loading states, variants, sizes, and accessibility features to ensure consistent UI across the application.