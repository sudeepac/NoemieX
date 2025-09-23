import React from 'react';
import { X } from 'lucide-react';
import styles from './MultiStageModal.module.css';

/**
 * Reusable multi-stage modal component with step indicator and navigation
 * Provides consistent modal structure for multi-step forms and workflows
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close handler
 * @param {string} title - Modal title
 * @param {string} subtitle - Modal subtitle/description
 * @param {React.ReactNode} icon - Header icon component
 * @param {Array} steps - Array of step objects with { label, content }
 * @param {number} currentStep - Current active step (1-based)
 * @param {function} onStepChange - Step change handler
 * @param {boolean} canNavigateBack - Whether back navigation is allowed
 * @param {boolean} canNavigateForward - Whether forward navigation is allowed
 * @param {function} onNext - Next step handler
 * @param {function} onPrevious - Previous step handler
 * @param {function} onSubmit - Final submit handler
 * @param {boolean} isLoading - Whether form is in loading state
 * @param {string} submitLabel - Label for submit button
 * @param {string} nextLabel - Label for next button
 * @param {string} previousLabel - Label for previous button
 * @param {string} cancelLabel - Label for cancel button
 * @param {boolean} showStepIndicator - Whether to show step indicator
 * @param {string} className - Additional CSS classes
 */
const MultiStageModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  steps = [],
  currentStep = 1,
  onStepChange,
  canNavigateBack = true,
  canNavigateForward = true,
  onNext,
  onPrevious,
  onSubmit,
  isLoading = false,
  submitLabel = 'Submit',
  nextLabel = 'Next',
  previousLabel = 'Previous',
  cancelLabel = 'Cancel',
  showStepIndicator = true,
  className = '',
  children,
  ...props
}) => {
  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Handle close button
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (canNavigateForward && !isLoading && onNext) {
      onNext();
    }
  };

  const handlePrevious = () => {
    if (canNavigateBack && !isLoading && onPrevious) {
      onPrevious();
    }
  };

  // Handle step indicator click
  const handleStepClick = (stepIndex) => {
    if (onStepChange && !isLoading) {
      onStepChange(stepIndex + 1);
    }
  };

  const isLastStep = currentStep === steps.length;
  const isFirstStep = currentStep === 1;

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={`${styles.modalContent} ${className}`} {...props}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            {icon && <div className={styles.headerIcon}>{icon}</div>}
            <div>
              <h2 className={styles.title}>{title}</h2>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            disabled={isLoading}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        {showStepIndicator && steps.length > 1 && (
          <div className={styles.stepIndicator}>
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber <= currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div
                  key={index}
                  className={`${styles.step} ${
                    isActive ? styles.active : ''
                  } ${
                    isCurrent ? styles.current : ''
                  }`}
                  onClick={() => handleStepClick(index)}
                  role="button"
                  tabIndex={0}
                >
                  <span className={styles.stepNumber}>{stepNumber}</span>
                  <label className={styles.stepLabel}>{step.label}</label>
                </div>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className={styles.modalBody}>
          {children || (
            steps[currentStep - 1] && (
              <div className={styles.stepContent}>
                {steps[currentStep - 1].content}
              </div>
            )
          )}
        </div>

        {/* Actions */}
        <div className={styles.modalActions}>
          {!isFirstStep && canNavigateBack && (
            <button
              type="button"
              onClick={handlePrevious}
              className={styles.btnSecondary}
              disabled={isLoading}
            >
              {previousLabel}
            </button>
          )}
          
          <button
            type="button"
            onClick={handleClose}
            className={styles.btnOutline}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>

          {!isLastStep ? (
            <button
              type="button"
              onClick={handleNext}
              className={styles.btnPrimary}
              disabled={isLoading || !canNavigateForward}
            >
              {nextLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              className={styles.btnPrimary}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// AI-NOTE: Created reusable MultiStageModal component for consistent multi-step workflows.
// Provides step indicator, navigation controls, and flexible content rendering.
// Can be used for account creation, settings wizards, and other multi-stage processes.

export default MultiStageModal;