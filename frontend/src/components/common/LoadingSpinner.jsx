import React from 'react';
import styles from './LoadingSpinner.module.css';

// AI-NOTE: Migrated to CSS Modules for scoped styling and camelCase class names
const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className={styles.loadingSpinner}>
      <div className={styles.container}>
        <div className={`${styles.spinner} ${styles[`spinner${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
          <div className={styles.circle}></div>
        </div>
        {message && (
          <p className={styles.message}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;