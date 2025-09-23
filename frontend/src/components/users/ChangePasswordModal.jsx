import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useChangeUserPasswordMutation } from '../../store/api/api';
import { validatePasswordChange } from '../../types/user.types';
import ErrorMessage from '../../shared/components/ErrorMessage';
import styles from './ChangePasswordModal.module.css';

// ChangePasswordModal component for password management
function ChangePasswordModal({ userId, userName, onClose }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // RTK Query hook
  const [changePassword, { isLoading }] = useChangeUserPasswordMutation();

  // Check if user is changing their own password
  const isOwnPassword = currentUser?._id === userId;

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validatePasswordChange(formData, isOwnPassword);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        ...(isOwnPassword && { currentPassword: formData.currentPassword }),
        newPassword: formData.newPassword
      };

      await changePassword({ 
        userId, 
        passwordData: submitData 
      }).unwrap();
      
      alert('Password changed successfully');
      onClose();
    } catch (error) {
      console.error('Password change error:', error);
      
      // Handle specific error cases
      if (error.data?.message?.includes('current password')) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        alert(`Error changing password: ${error.data?.message || error.message}`);
      }
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={`${styles.modalContent} ${styles.changePasswordModal}`}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <h3>Change Password</h3>
          <p>
            {isOwnPassword 
              ? 'Change your account password' 
              : `Change password for ${userName}`
            }
          </p>
          <button 
            onClick={handleClose}
            className={styles.modalClose}
            disabled={isLoading}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.passwordForm}>
          {/* Current Password (only for own password) */}
          {isOwnPassword && (
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password *</label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={(e) => handleChange('currentPassword', e.target.value)}
                  className={errors.currentPassword ? styles.error : ''}
                  placeholder="Enter your current password"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className={styles.passwordToggle}
                  disabled={isLoading}
                  aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.current ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.currentPassword && (
                <ErrorMessage error={{message: errors.currentPassword}} variant="inline" type="validation" />
              )}
            </div>
          )}

          {/* New Password */}
          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPasswords.new ? 'text' : 'password'}
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                className={errors.newPassword ? styles.error : ''}
                placeholder="Enter new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('new')}
                className={styles.passwordToggle}
                disabled={isLoading}
                aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
              >
                {showPasswords.new ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.newPassword && (
              <ErrorMessage error={{message: errors.newPassword}} variant="inline" type="validation" />
            )}
            <div className={styles.passwordRequirements}>
              <small>Password must be at least 8 characters long</small>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password *</label>
            <div className={styles.passwordInputWrapper}>
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? styles.error : ''}
                placeholder="Confirm new password"
                disabled={isLoading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('confirm')}
                className={styles.passwordToggle}
                disabled={isLoading}
                aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
              >
                {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <ErrorMessage error={{message: errors.confirmPassword}} variant="inline" type="validation" />
            )}
          </div>

          {/* Security Notice */}
          <div className={styles.securityNotice}>
            <div className={styles.noticeIcon}>🔒</div>
            <div className={styles.noticeContent}>
              <strong>Security Notice:</strong>
              <ul>
                <li>Choose a strong password with a mix of letters, numbers, and symbols</li>
                <li>Don't reuse passwords from other accounts</li>
                {isOwnPassword && <li>You will need to log in again after changing your password</li>}
                {!isOwnPassword && <li>The user will need to use the new password for their next login</li>}
              </ul>
            </div>
          </div>

          {/* Form Actions */}
          <div className={styles.modalActions}>
            <button 
              type="button" 
              onClick={handleClose}
              className={`${styles.btn} ${styles.btnOutline}`}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={isLoading}
            >
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;

// AI-NOTE: Created ChangePasswordModal component with proper validation, security features, password visibility toggles, and different behavior for self vs admin password changes.