import React from 'react';
import './loading-spinner.styles.css';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="loading-spinner__container">
        <div className={`loading-spinner__spinner loading-spinner__spinner--${size}`}>
          <div className="loading-spinner__circle"></div>
          <div className="loading-spinner__circle"></div>
          <div className="loading-spinner__circle"></div>
          <div className="loading-spinner__circle"></div>
        </div>
        {message && (
          <p className="loading-spinner__message">{message}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;