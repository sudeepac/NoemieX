import React, { useState, useEffect } from 'react';
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
} from '../../store/slices/agencies.slice';
import { PORTAL_TYPES } from '../../types/user.types';
import LoadingSpinner from '../common/loading-spinner.component';
import './AgencyForm.css';

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
  
  // Form state
  const [formData, setFormData] = useState(createAgencyFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFormData(prev => ({
        ...prev,
        accountId: currentUser.accountId
      }));
    }
  }, [currentUser]);

  // Load agency data for editing
  useEffect(() => {
    if (isEditing && agencyData?.data) {
      const agency = agencyData.data;
      setFormData({
        name: agency.name || '',
        description: agency.description || '',
        commissionSplitPercent: agency.commissionSplitPercent || 50,
        accountId: agency.accountId?._id || agency.accountId || '',
        isActive: agency.isActive !== undefined ? agency.isActive : true
      });
    } else if (isEditing && editingAgency) {
      // Use editing agency from Redux state
      setFormData({
        name: editingAgency.name || '',
        description: editingAgency.description || '',
        commissionSplitPercent: editingAgency.commissionSplitPercent || 50,
        accountId: editingAgency.accountId?._id || editingAgency.accountId || '',
        isActive: editingAgency.isActive !== undefined ? editingAgency.isActive : true
      });
    }
  }, [isEditing, agencyData, editingAgency]);

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
   * Handle form field changes
   */
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

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateAgencyForm(formData, isEditing);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check permissions
    if (!canSubmitForm()) {
      dispatch(setError('You do not have permission to perform this action'));
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        commissionSplitPercent: Number(formData.commissionSplitPercent)
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
    } finally {
      setIsSubmitting(false);
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
      <div className="agency-form-container">
        <LoadingSpinner message="Loading agency..." />
      </div>
    );
  }

  if (isLoadingAccounts && currentUser?.portalType === PORTAL_TYPES.SUPERADMIN) {
    return (
      <div className="agency-form-container">
        <LoadingSpinner message="Loading accounts..." />
      </div>
    );
  }

  // Error states
  if (isEditing && isAgencyError) {
    return (
      <div className="agency-form-container">
        <div className="error-container">
          <h3>Error Loading Agency</h3>
          <p>Failed to load agency data for editing</p>
          <button onClick={() => navigate('/agencies')} className="btn btn-primary">
            Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  if (!canSubmitForm()) {
    return (
      <div className="agency-form-container">
        <div className="error-container">
          <h3>Access Denied</h3>
          <p>You do not have permission to {isEditing ? 'edit agencies' : 'create agencies'}</p>
          <button onClick={() => navigate('/agencies')} className="btn btn-primary">
            Back to Agencies
          </button>
        </div>
      </div>
    );
  }

  const availableAccounts = getAvailableAccounts();

  return (
    <div className="agency-form-container">
      {/* Header */}
      <div className="form-header">
        <div className="header-content">
          <h1>{isEditing ? 'Edit Agency' : 'Create New Agency'}</h1>
          <p>
            {isEditing 
              ? 'Update agency information and commission settings' 
              : 'Add a new agency to manage users and commissions'
            }
          </p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/agencies')} 
            className="btn btn-secondary"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} type="button">×</button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="agency-form">
        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Agency Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter agency name"
                  maxLength={100}
                  required
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  value={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>

              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className={errors.description ? 'error' : ''}
                  placeholder="Optional description of the agency"
                  rows={3}
                  maxLength={500}
                />
                {errors.description && <span className="error-text">{errors.description}</span>}
                <small className="field-hint">
                  {formData.description.length}/500 characters
                </small>
              </div>
            </div>
          </div>

          {/* Commission Settings */}
          <div className="form-section">
            <h3>Commission Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="commissionSplitPercent">Commission Split Percentage *</label>
                <div className="input-with-suffix">
                  <input
                    type="number"
                    id="commissionSplitPercent"
                    value={formData.commissionSplitPercent}
                    onChange={(e) => handleChange('commissionSplitPercent', e.target.value)}
                    className={errors.commissionSplitPercent ? 'error' : ''}
                    placeholder="50"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                  <span className="input-suffix">%</span>
                </div>
                {errors.commissionSplitPercent && (
                  <span className="error-text">{errors.commissionSplitPercent}</span>
                )}
                <small className="field-hint">
                  Percentage of commission this agency receives (0-100%)
                </small>
              </div>
            </div>
          </div>

          {/* Account Assignment */}
          <div className="form-section">
            <h3>Account Assignment</h3>
            <div className="form-grid">
              {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN ? (
                <div className="form-group">
                  <label htmlFor="accountId">Account *</label>
                  <select
                    id="accountId"
                    value={formData.accountId}
                    onChange={(e) => handleChange('accountId', e.target.value)}
                    className={errors.accountId ? 'error' : ''}
                    required
                  >
                    <option value="">Select an account</option>
                    {availableAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                  {errors.accountId && <span className="error-text">{errors.accountId}</span>}
                </div>
              ) : (
                <div className="form-group">
                  <label>Account</label>
                  <div className="readonly-field">
                    {currentUser?.accountId ? (
                      <span>Current Account (Auto-assigned)</span>
                    ) : (
                      <span className="text-muted">No account assigned</span>
                    )}
                  </div>
                  <small className="field-hint">
                    Agency will be created under your current account
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button"
            onClick={() => navigate('/agencies')} 
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
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

// AI-NOTE: Created AgencyForm component following AccountForm patterns with agency-specific fields (name, description, commission split, account assignment). Includes validation, role-based permissions, and proper error handling for both create and edit modes.