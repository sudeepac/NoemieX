import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

/**
 * Reusable ConfirmationModal component for delete, deactivate, and other confirmation actions
 * Features: customizable title, message, action buttons, and success feedback
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
  isLoading = false,
  showSuccess = false,
  successMessage = 'Action completed successfully!'
}) => {
  if (!isOpen) return null;

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Get icon based on type
  const getIcon = () => {
    if (showSuccess) return <CheckCircle className={styles.successIcon} />;
    
    switch (type) {
      case 'danger':
        return <AlertTriangle className={styles.dangerIcon} />;
      case 'warning':
        return <AlertTriangle className={styles.warningIcon} />;
      default:
        return <AlertTriangle className={styles.infoIcon} />;
    }
  };

  // Get modal class based on type
  const getModalClass = () => {
    if (showSuccess) return `${styles.modalContent} ${styles.success}`;
    return `${styles.modalContent} ${styles[type]}`;
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={getModalClass()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerContent}>
            {getIcon()}
            <h3>{showSuccess ? 'Success' : title}</h3>
          </div>
          <button
            onClick={onClose}
            className={styles.closeButton}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>
          <p>{showSuccess ? successMessage : message}</p>
        </div>

        {/* Actions */}
        <div className={styles.modalActions}>
          {!showSuccess ? (
            <>
              <button
                onClick={onClose}
                className={styles.btnSecondary}
                disabled={isLoading}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`${styles.btnPrimary} ${styles[`btn${type.charAt(0).toUpperCase() + type.slice(1)}`]}`}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={styles.btnPrimary}
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// AI-NOTE: Created reusable ConfirmationModal component to replace browser alerts
// with proper UI feedback for delete, deactivate, and other confirmation actions.
// Supports different types (warning, danger, info), loading states, and success messages.

export default ConfirmationModal;