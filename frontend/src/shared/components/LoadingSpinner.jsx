import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * Standardized loading spinner component
 * Replaces all inline loading divs and inconsistent loading messages
 * @param {string} message - Custom loading message (optional)
 * @param {string} size - Size variant: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} overlay - Whether to show as full-screen overlay (default: false)
 */
const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  overlay = false 
}) => {
  const containerClass = overlay 
    ? `${styles.container} ${styles.overlay}` 
    : styles.container;

  return (
    <div className={containerClass}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerInner}></div>
      </div>
      {message && (
        <p className={styles.message}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

// AI-NOTE: Created standardized LoadingSpinner component to replace all inconsistent loading patterns found in the codebase. Uses CSS Modules for scoped styling and provides size/overlay variants for different use cases.