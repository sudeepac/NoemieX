import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useCreateAccountMutation, useUpdateAccountMutation } from '../../store/api';
import { X, Building2, Mail, Phone, Globe, MapPin, CreditCard, Settings } from 'lucide-react';
import styles from './CreateAccountModal.module.css';

/**
 * CreateAccountModal component for creating/editing accounts from SuperAdmin portal
 * Features: comprehensive account creation/edit form with validation, subscription setup, billing info
 */
const CreateAccountModal = ({ isOpen, onClose, onSuccess, editingAccount }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createAccount, { isLoading: isCreating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!editingAccount;

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      contactInfo: {
        email: '',
        phone: '',
        website: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        }
      },
      subscription: {
        plan: 'trial',
        maxUsers: 5,
        maxAgencies: 1
      },
      billing: {
        companyName: '',
        taxId: ''
      },
      settings: {
        timezone: 'UTC',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      },
      isActive: true
    }
  });

  // Populate form when editing
  useEffect(() => {
    if (editingAccount && isOpen) {
      // Reset to step 1 when opening for edit
      setCurrentStep(1);
      
      // Populate form fields
      setValue('name', editingAccount.name || '');
      setValue('contactInfo.email', editingAccount.contactInfo?.email || '');
      setValue('contactInfo.phone', editingAccount.contactInfo?.phone || '');
      setValue('contactInfo.website', editingAccount.contactInfo?.website || '');
      setValue('contactInfo.address.street', editingAccount.contactInfo?.address?.street || '');
      setValue('contactInfo.address.city', editingAccount.contactInfo?.address?.city || '');
      setValue('contactInfo.address.state', editingAccount.contactInfo?.address?.state || '');
      setValue('contactInfo.address.zipCode', editingAccount.contactInfo?.address?.zipCode || '');
      setValue('contactInfo.address.country', editingAccount.contactInfo?.address?.country || 'US');
      setValue('subscription.plan', editingAccount.subscription?.plan || 'trial');
      setValue('subscription.maxUsers', parseInt(editingAccount.subscription?.maxUsers, 10) || 5);
      setValue('subscription.maxAgencies', parseInt(editingAccount.subscription?.maxAgencies, 10) || 1);
      setValue('billing.companyName', editingAccount.billing?.companyName || '');
      setValue('billing.taxId', editingAccount.billing?.taxId || '');
      setValue('settings.timezone', editingAccount.settings?.timezone || 'UTC');
      setValue('settings.currency', editingAccount.settings?.currency || 'USD');
      setValue('settings.dateFormat', editingAccount.settings?.dateFormat || 'MM/DD/YYYY');
      setValue('isActive', editingAccount.isActive !== false);
    } else if (!editingAccount && isOpen) {
      // Reset form for new account creation
      reset();
      setCurrentStep(1);
    }
  }, [editingAccount, isOpen, setValue, reset]);

  // Watch form data with error handling
  let watchedData;
  try {
    watchedData = watch();
  } catch (error) {
    console.error('Error watching form data:', error);
    watchedData = {};
  }

  // Step navigation with validation
  const nextStep = (e) => {
    // Prevent any form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('nextStep called - Current step:', currentStep, 'Moving to:', currentStep + 1);
    
    // Validate current step before proceeding
    if (currentStep === 1) {
      const name = watch('name');
      if (!name || name.trim() === '') {
        toast.error('Please enter an account name before proceeding.');
        return;
      }
    }
    
    if (currentStep === 2) {
      const email = watch('contactInfo.email');
      if (!email || email.trim() === '') {
        toast.error('Please enter an email address before proceeding.');
        return;
      }
    }
    
    const newStep = Math.min(currentStep + 1, 3);
    console.log('Setting currentStep to:', newStep);
    setCurrentStep(newStep);
  };
  
  const prevStep = () => {
    console.log('Navigating to step:', currentStep - 1);
    try {
      setCurrentStep(prev => Math.max(prev - 1, 1));
    } catch (error) {
      console.error('Error navigating to previous step:', error);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let result;
      
      if (isEditMode) {
        // Update existing account
        console.log('Updating account with ID:', editingAccount._id, 'Data:', data);
        result = await updateAccount({ 
          accountId: editingAccount._id, 
          ...data 
        }).unwrap();
        toast.success(`Account "${data.name}" updated successfully!`);
      } else {
        // Create new account
        result = await createAccount(data).unwrap();
        toast.success(`Account "${data.name}" created successfully!`);
      }
      
      // Reset form and close modal
      reset();
      setCurrentStep(1);
      
      // Call success callback to refresh list
      if (onSuccess) {
        onSuccess(result);
      }
      
      // Close modal after a brief delay to show success
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} account:`, error);
      toast.error(`Error ${isEditMode ? 'updating' : 'creating'} account: ${error.data?.message || error.message}`);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      reset();
      setCurrentStep(1);
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Step navigation functions moved above with debugging

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <Building2 className={styles.headerIcon} />
            <div>
              <h2>{isEditMode ? 'Edit Account' : 'Create New Account'}</h2>
              <p>{isEditMode ? 'Update account information and settings' : 'Set up a new client account on the platform'}</p>
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
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.active : ''}`}>
            <span>1</span>
            <label>Basic Info</label>
          </div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.active : ''}`}>
            <span>2</span>
            <label>Contact & Address</label>
          </div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.active : ''}`}>
            <span>3</span>
            <label>Subscription & Settings</label>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          {console.log('=== FORM RENDER ===', { currentStep, isOpen, isEditMode })}
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h3><Building2 size={20} /> Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="name">Account Name *</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Account name is required' })}
                  className={errors.name ? styles.error : ''}
                  placeholder="Company or Organization Name"
                  disabled={isLoading}
                />
                {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="isActive">Account Status</label>
                <select
                  id="isActive"
                  {...register('isActive')}
                  disabled={isLoading}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Address */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h3><Mail size={20} /> Contact & Address Information</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="contactEmail">Email Address *</label>
                  <input
                    type="email"
                    id="contactEmail"
                    {...register('contactInfo.email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    className={errors.contactInfo?.email ? styles.error : ''}
                    placeholder="contact@company.com"
                    disabled={isLoading}
                  />
                  {errors.contactInfo?.email && <span className={styles.errorText}>{errors.contactInfo.email.message}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="contactPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    {...register('contactInfo.phone')}
                    placeholder="+1 (555) 123-4567"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  {...register('contactInfo.website')}
                  placeholder="https://company.com"
                  disabled={isLoading}
                />
              </div>

              <div className={styles.addressSection}>
                <h4><MapPin size={16} /> Address</h4>
                <div className={styles.formGroup}>
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    {...register('contactInfo.address.street')}
                    placeholder="123 Main Street"
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      {...register('contactInfo.address.city')}
                      placeholder="New York"
                      disabled={isLoading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="state">State</label>
                    <input
                      type="text"
                      id="state"
                      {...register('contactInfo.address.state')}
                      placeholder="NY"
                      disabled={isLoading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      {...register('contactInfo.address.zipCode')}
                      placeholder="10001"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Subscription & Settings */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              {console.log('=== STEP 3 RENDERING ===', { currentStep, isStep3: currentStep === 3, watchedData })}
              <h3><Settings size={20} /> Subscription & Settings</h3>
              
              <div className={styles.subscriptionSection}>
                <h4><CreditCard size={16} /> Subscription Plan</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="plan">Plan</label>
                    <select
                      id="plan"
                      {...register('subscription.plan')}
                      disabled={isLoading}
                    >
                      <option value="trial">Trial</option>
                      <option value="basic">Basic</option>
                      <option value="professional">Professional</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="maxUsers">Max Users</label>
                    <input
                      type="number"
                      id="maxUsers"
                      {...register('subscription.maxUsers', { 
                        min: { value: 1, message: 'Must be at least 1' },
                        setValueAs: (value) => value === '' ? '' : parseInt(value, 10) || 1
                      })}
                      min="1"
                      disabled={isLoading}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="maxAgencies">Max Agencies</label>
                    <input
                      type="number"
                      id="maxAgencies"
                      {...register('subscription.maxAgencies', { 
                        min: { value: 1, message: 'Must be at least 1' },
                        setValueAs: (value) => value === '' ? '' : parseInt(value, 10) || 1
                      })}
                      min="1"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.settingsSection}>
                <h4><Settings size={16} /> Account Settings</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="timezone">Timezone</label>
                    <select
                      id="timezone"
                      {...register('settings.timezone')}
                      disabled={isLoading}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      {...register('settings.currency')}
                      disabled={isLoading}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className={styles.modalActions}>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className={styles.btnSecondary}
                disabled={isLoading}
              >
                Previous
              </button>
            )}
            
            <button
              type="button"
              onClick={handleClose}
              className={styles.btnOutline}
              disabled={isLoading}
            >
              Cancel
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  nextStep(e);
                }}
                className={styles.btnPrimary}
                disabled={isLoading}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={isLoading}
              >
                {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Account' : 'Create Account')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

// AI-NOTE: Created comprehensive CreateAccountModal with multi-step form, validation,
// and integration with existing accountsApi. Follows modal patterns from codebase
// and provides full account creation functionality for SuperAdmin portal.
// FIXED: Added error handling for form watch() function and step navigation debugging
// to prevent modal crashes when navigating to step 3. Added valueAsNumber validation
// for numeric fields to ensure proper form state management.
// FIXED: Account edit ObjectId casting error - changed updateAccount call from
// { id: editingAccount._id, accountData: data } to { accountId: editingAccount._id, ...data }
// to match accountsApi.js mutation parameter structure that expects { accountId, ...patch }

export default CreateAccountModal;