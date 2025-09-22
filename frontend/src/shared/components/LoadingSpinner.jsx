import React from 'react';
import styles from './LoadingSpinner.module.css';

/**
 * Modern loading spinner component with customizable size and message
 */
const LoadingSpinner = ({ 
  size = 'medium', 
  message = 'Loading...', 
  showMessage = true,
  className = '' 
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
        <div className={styles.circle}></div>
      </div>
      {showMessage && (
        <p className={styles.message}>{message}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;