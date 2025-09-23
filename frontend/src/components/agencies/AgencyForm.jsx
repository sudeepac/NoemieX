import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useGetAgencyQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useGetAccountsQuery
} from '../../store/api/api';
import {
  clearEditingAgency,
  setError,
  clearError
} from '../../store/slices/agenciesUi.slice';
import { PORTAL_TYPES } from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import styles from './AgencyForm.module.css';

/**
 * Create default form data for agency
 */
const createAgencyFormData = () => ({
  name: '',
  description: '',
  commissionSplitPercent: 50,
  accountId: '',
  isActive: true
});

/**
 * Validate agency form data
 */
const validateAgencyForm = (formData, isEditing = false) => {
  const errors = {};

  // Name validation
  if (!formData.name || formData.name.trim().length === 0) {
    errors.name = 'Agency name is required';
  } else if (formData.name.trim().length < 2) {
    errors.name = 'Agency name must be at least 2 characters';
  } else if (formData.name.trim().length > 100) {
    errors.name = 'Agency name must be less than 100 characters';
  }

  // Description validation (optional but with limits)
  if (formData.description && formData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  // Commission split validation
  if (formData.commissionSplitPercent === undefined || formData.commissionSplitPercent === null || formData.commissionSplitPercent === '') {
    errors.commissionSplitPercent = 'Commission split percentage is required';
  } else {
    const commission = Number(formData.commissionSplitPercent);
    if (isNaN(commission)) {
      errors.commissionSplitPercent = 'Commission split must be a valid number';
    } else if (commission < 0 || commission > 100) {
      errors.commissionSplitPercent = 'Commission split must be between 0 and 100';
    }
  }

  // Account ID validation (required for superadmin, auto-set for account admin)
  if (!formData.accountId) {
    errors.accountId = 'Account is required';
  }

  return errors;
};

/**
 * AgencyForm component for creating and editing agencies
 * Supports both superadmin (all accounts) and account admin (own account only)
 */
function AgencyForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { agencyId } = useParams();
  const isEditing = Boolean(agencyId);
  
  const { user: currentUser } = useSelector((state) => state.auth);
  const { editingAgency, error } = useSelector((state) => state.agencies);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    clearErrors
  } = useForm({
    defaultValues: createAgencyFormData()
  });

  const formData = watch();

  // RTK Query hooks
  const { 
    data: agencyData, 
    isLoading: isLoadingAgency, 
    isError: isAgencyError 
  } = useGetAgencyQuery(agencyId, { skip: !isEditing });

  // Get accounts for superadmin dropdown
  const { 
    data: accountsData, 
    isLoading: isLoadingAccounts 
  } = useGetAccountsQuery(
    { page: 1, limit: 100, isActive: true }, 
    { skip: currentUser?.portalType !== PORTAL_TYPES.SUPERADMIN }
  );

  const [createAgency] = useCreateAgencyMutation();
  const [updateAgency] = useUpdateAgencyMutation();

  // Set account context for account admins
  useEffect(() => {
    if (currentUser?.portalType === PORTAL_TYPES.ACCOUNT && currentUser.accountId) {
      setValue('accountId', currentUser.accountId);
    }
  }, [currentUser, setValue]);

  // Load agency data for editing
  useEffect(() => {
    if (isEditing && agencyData?.data) {
      const agency = agencyData.data;
      reset({
        name: agency.name || '',
        description: agency.description || '',
        commissionSplitPercent: agency.commissionSplitPercent || 50,
        accountId: agency.accountId?._id || agency.accountId || '',
        isActive: agency.isActive !== undefined ? agency.isActive : true
      });
    } else if (isEditing && editingAgency) {
      // Use editing agency from Redux state
      reset({
        name: editingAgency.name || '',
        description: editingAgency.description || '',
        commissionSplitPercent: editingAgency.commissionSplitPercent || 50,
        accountId: editingAgency.accountId?._id || editingAgency.accountId || '',
        isActive: editingAgency.isActive !== undefined ? editingAgency.isActive : true
      });
    }
  }, [isEditing, agencyData, editingAgency, reset]);

  // Clear editing agency on unmount
  useEffect(() => {
    return () => {
      dispatch(clearEditingAgency());
    };
  }, [dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  /**
   * Validate form data using React Hook Form
   */
  const validateForm = (data) => {
    const validationErrors = validateAgencyForm(data, isEditing);
    return validationErrors;
  };

  /**
   * Handle form submission
   */
  const onSubmit = async (data) => {
    // Check permissions
    if (!canSubmitForm()) {
      dispatch(setError('You do not have permission to perform this action'));
      return;
    }
    
    try {
      // Prepare data for submission
      const submitData = {
        ...data,
        commissionSplitPercent: Number(data.commissionSplitPercent)
      };

      if (isEditing) {
        await updateAgency({ id: agencyId, agencyData: submitData }).unwrap();
        dispatch(setError(null)); // Clear any previous errors
      } else {
        await createAgency(submitData).unwrap();
        dispatch(setError(null)); // Clear any previous errors
      }
      
      // Navigate back to agencies list
      navigate('/agencies');
    } catch (error) {
      console.error('Form submission error:', error);
      dispatch(setError(
        error?.data?.message || 
        error?.message || 
        `Error ${isEditing ? 'updating' : 'creating'} agency`
      ));
    }
  };

  /**
   * Check if current user can submit the form
   */
  const canSubmitForm = () => {
    return currentUser?.portalType === PORTAL_TYPES.SUPERADMIN || 
           currentUser?.portalType === PORTAL_TYPES.ACCOUNT;
  };

  /**
   * Check if field should be disabled
   */
  const isFieldDisabled = (field) => {
    if (!currentUser) return true;
    
    // Account admins can't change account assignment
    if (field === 'accountId' && currentUser.portalType === PORTAL_TYPES.ACCOUNT) {
      return true;
    }
    
    return false;
  };

  /**
   * Get available accounts for dropdown
   */
  const getAvailableAccounts = () => {
    if (currentUser?.portalType === PORTAL_TYPES.SUPERADMIN) {
      return accountsData?.data?.accounts || [];
    }
    return [];
  };

  // Loading states
  if (isEditing && isLoadingAgency) {
    return (
      <div className={styles.agencyFormContainer}>
        <LoadingSpinner message="Loading agency..." />
      </div>
    );
  }

  if (isLoadingAccounts && currentUser?.portalType === PORTAL_TYPES.SUPERADMIN) {
    return (
      <div className={styles.agencyFormContainer}>
        <LoadingSpinner message="Loading accounts..." />
      </div>
    );
  }

  // Error states
  if (isEditing && isAgencyError) {
    return (
      <div className={styles.agencyFormContainer}>
        <ErrorMessage 
          error={{message: "Failed to load agency data for editing"}} 
          variant="page" 
          type="error"
          title="Error Loading Agency"
        />
        <button onClick={() => navigate('/agencies')} className={`${styles.btn} ${styles.btnPrimary}`}>
          Back to Agencies
        </button>
      </div>
    );
  }

  if (!canSubmitForm()) {
    return (
      <div className={styles.agencyFormContainer}>
        <ErrorMessage 
          error={{message: `You do not have permission to ${isEditing ? 'edit agencies' : 'create agencies'}`}} 
          variant="page" 
          type="error"
          title="Access Denied"
        />
        <button onClick={() => navigate('/agencies')} className={`${styles.btn} ${styles.btnPrimary}`}>
          Back to Agencies
        </button>
      </div>
    );
  }

  const availableAccounts = getAvailableAccounts();

  return (
    <div className={styles.agencyFormContainer}>
      {/* Header */}
      <div className={styles.formHeader}>
        <div className={styles.headerContent}>
          <h1>{isEditing ? 'Edit Agency' : 'Create New Agency'}</h1>
          <p>
            {isEditing 
              ? 'Update agency information and commission settings' 
              : 'Add a new agency to manage users and commissions'
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={() => navigate('/agencies')} 
            className={`${styles.btn} ${styles.btnSecondary}`}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} type="button">×</button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.agencyForm}>
        <div className={styles.formSections}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3>Basic Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Agency Name *</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', {
                    required: 'Agency name is required',
                    minLength: {
                      value: 2,
                      message: 'Agency name must be at least 2 characters'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Agency name must be less than 100 characters'
                    },
                    validate: value => value.trim().length > 0 || 'Agency name is required'
                  })}
                  className={errors.name ? styles.error : ''}
                  placeholder="Enter agency name"
                  maxLength={100}
                />
                <ErrorMessage error={errors.name} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  {...register('isActive', {
                    setValueAs: value => value === 'true'
                  })}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  {...register('description', {
                    maxLength: {
                      value: 500,
                      message: 'Description must be less than 500 characters'
                    }
                  })}
                  className={errors.description ? styles.error : ''}
                  placeholder="Optional description of the agency"
                  rows={3}
                  maxLength={500}
                />
                <ErrorMessage error={errors.description} variant="inline" type="validation" />
                <small className={styles.fieldHint}>
                  {(formData.description || '').length}/500 characters
                </small>
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className={styles.formSection}>
            <h3>Commission Settings</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="commissionSplitPercent">Commission Split Percentage *</label>
                <div className={styles.inputWithSuffix}>
                  <input
                    type="number"
                    id="commissionSplitPercent"
                    {...register('commissionSplitPercent', {
                      required: 'Commission split percentage is required',
                      min: {
                        value: 0,
                        message: 'Commission split must be between 0 and 100'
                      },
                      max: {
                        value: 100,
                        message: 'Commission split must be between 0 and 100'
                      },
                      setValueAs: value => value === '' ? '' : Number(value)
                    })}
                    className={errors.commissionSplitPercent ? styles.error : ''}
                    placeholder="50"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                  <span className={styles.inputSuffix}>%</span>
                </div>
                <ErrorMessage error={errors.commissionSplitPercent} variant="inline" type="validation" />
                <small className={styles.fieldHint}>
                  Percentage of commission this agency receives (0-100%)
                </small>
              </div>
            </div>
          </div>

          {/* Account Assignment */}
          <div className={styles.formSection}>
            <h3>Account Assignment</h3>
            <div className={styles.formGrid}>
              {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN ? (
                <div className={styles.formGroup}>
                  <label htmlFor="accountId">Account *</label>
                  <select
                    id="accountId"
                    {...register('accountId', {
                      required: 'Account is required'
                    })}
                    className={errors.accountId ? styles.error : ''}
                  >
                    <option value="">Select an account</option>
                    {availableAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage error={errors.accountId} variant="inline" type="validation" />
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Account</label>
                  <div className={styles.readonlyField}>
                    {currentUser?.accountId ? (
                      <span>Current Account (Auto-assigned)</span>
                    ) : (
                      <span className={styles.textMuted}>No account assigned</span>
                    )}
                  </div>
                  <small className={styles.fieldHint}>
                    Agency will be created under your current account
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button 
            type="button"
            onClick={() => navigate('/agencies')} 
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Creating...') 
              : (isEditing ? 'Update Agency' : 'Create Agency')
            }
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgencyForm;

// AI-NOTE: Migrated AgencyForm from useState to React Hook Form for improved performance and validation. Maintains agency-specific fields (name, description, commission split, account assignment) with role-based permissions, proper error handling, and form validation using register() and handleSubmit(). Includes conditional account assignment for different user portal types.