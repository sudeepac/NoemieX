import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  useGetAccountQuery, 
  useCreateAccountMutation, 
  useUpdateAccountMutation 
} from '../../store/api/accountsApi';
import { 
  ACCOUNT_STATUSES, 
  SUBSCRIPTION_PLANS, 
  SUBSCRIPTION_STATUSES, 
  BILLING_CYCLES, 
  BILLING_STATUSES, 
  TIMEZONES, 
  CURRENCIES, 
  DATE_FORMATS 
} from '../../constants/accountConstants';
import { selectCurrentUser } from '../../store/slices/authSlice';
import { LoadingSpinner, ErrorMessage, Button } from '../../shared/components';
import styles from './AccountForm.module.css';

// AccountForm component for creating and editing accounts
function AccountForm() {
  const navigate = useNavigate();
  const { id: accountId } = useParams();
  const isEditing = Boolean(accountId);
  
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
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
        plan: SUBSCRIPTION_PLANS.FREE,
        status: SUBSCRIPTION_STATUSES.TRIAL,
        startDate: '',
        endDate: '',
        trialEndDate: '',
        autoRenew: true,
        maxUsers: 5,
        maxAgencies: 1
      },
      billing: {
        cycle: BILLING_CYCLES.MONTHLY,
        status: BILLING_STATUSES.CURRENT,
        nextBillingDate: '',
        paymentMethod: {
          type: 'credit_card',
          lastFour: '',
          expiryMonth: '',
          expiryYear: '',
          cardholderName: ''
        },
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        }
      },
      settings: {
        timezone: TIMEZONES.UTC,
        currency: CURRENCIES.USD,
        dateFormat: DATE_FORMATS.MM_DD_YYYY,
        language: 'en',
        features: {
          multiAgency: true,
          advancedReporting: false,
          apiAccess: false,
          customBranding: false
        }
      },
      isActive: true
    },
    mode: 'onBlur'
  });

  const formData = watch(); // Watch all form values

  // RTK Query hooks
  const { 
    data: accountData, 
    isLoading: isLoadingAccount, 
    isError: isAccountError 
  } = useGetAccountQuery(accountId, { skip: !isEditing });

  const [createAccount] = useCreateAccountMutation();
  const [updateAccount] = useUpdateAccountMutation();

  // Load account data for editing
  useEffect(() => {
    if (isEditing && accountData?.data) {
      const account = accountData.data;
      reset({
        name: account.name || '',
        contactInfo: {
          email: account.contactInfo?.email || '',
          phone: account.contactInfo?.phone || '',
          website: account.contactInfo?.website || '',
          address: {
            street: account.contactInfo?.address?.street || '',
            city: account.contactInfo?.address?.city || '',
            state: account.contactInfo?.address?.state || '',
            zipCode: account.contactInfo?.address?.zipCode || '',
            country: account.contactInfo?.address?.country || 'US'
          }
        },
        subscription: {
          plan: account.subscription?.plan || SUBSCRIPTION_PLANS.FREE,
          status: account.subscription?.status || SUBSCRIPTION_STATUSES.TRIAL,
          startDate: account.subscription?.startDate ? new Date(account.subscription.startDate).toISOString().split('T')[0] : '',
          endDate: account.subscription?.endDate ? new Date(account.subscription.endDate).toISOString().split('T')[0] : '',
          trialEndDate: account.subscription?.trialEndDate ? new Date(account.subscription.trialEndDate).toISOString().split('T')[0] : '',
          autoRenew: account.subscription?.autoRenew !== undefined ? account.subscription.autoRenew : true,
          maxUsers: account.subscription?.maxUsers || 5,
          maxAgencies: account.subscription?.maxAgencies || 1
        },
        billing: {
          cycle: account.billing?.cycle || BILLING_CYCLES.MONTHLY,
          status: account.billing?.status || BILLING_STATUSES.CURRENT,
          nextBillingDate: account.billing?.nextBillingDate ? new Date(account.billing.nextBillingDate).toISOString().split('T')[0] : '',
          paymentMethod: {
            type: account.billing?.paymentMethod?.type || 'credit_card',
            lastFour: account.billing?.paymentMethod?.lastFour || '',
            expiryMonth: account.billing?.paymentMethod?.expiryMonth || '',
            expiryYear: account.billing?.paymentMethod?.expiryYear || '',
            cardholderName: account.billing?.paymentMethod?.cardholderName || ''
          },
          billingAddress: {
            street: account.billing?.billingAddress?.street || '',
            city: account.billing?.billingAddress?.city || '',
            state: account.billing?.billingAddress?.state || '',
            zipCode: account.billing?.billingAddress?.zipCode || '',
            country: account.billing?.billingAddress?.country || 'US'
          }
        },
        settings: {
          timezone: account.settings?.timezone || TIMEZONES.UTC,
          currency: account.settings?.currency || CURRENCIES.USD,
          dateFormat: account.settings?.dateFormat || DATE_FORMATS.MM_DD_YYYY,
          language: account.settings?.language || 'en',
          features: {
            multiAgency: account.settings?.features?.multiAgency !== undefined ? account.settings.features.multiAgency : true,
            advancedReporting: account.settings?.features?.advancedReporting !== undefined ? account.settings.features.advancedReporting : false,
            apiAccess: account.settings?.features?.apiAccess !== undefined ? account.settings.features.apiAccess : false,
            customBranding: account.settings?.features?.customBranding !== undefined ? account.settings.features.customBranding : false
          }
        },
        isActive: account.isActive !== undefined ? account.isActive : true
      });
    }
  }, [isEditing, accountData, reset]);



  // Handle form submission
  const onSubmit = async (data) => {
    // Check permissions
    if (!canSubmitForm()) {
      toast.error('You do not have permission to perform this action');
      return;
    }
    
    try {
      // Prepare data for submission
      const submitData = {
        ...data,
        // Convert date strings to Date objects
        subscription: {
          ...data.subscription,
          startDate: data.subscription.startDate ? new Date(data.subscription.startDate) : undefined,
          endDate: data.subscription.endDate ? new Date(data.subscription.endDate) : undefined,
          trialEndDate: data.subscription.trialEndDate ? new Date(data.subscription.trialEndDate) : undefined
        },
        billing: {
          ...data.billing,
          nextBillingDate: data.billing.nextBillingDate ? new Date(data.billing.nextBillingDate) : undefined
        }
      };

      if (isEditing) {
        await updateAccount({ accountId: accountId, ...submitData }).unwrap();
        toast.success('Account updated successfully');
      } else {
        await createAccount(submitData).unwrap();
        toast.success('Account created successfully');
      }
      
      navigate('/accounts');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Error ${isEditing ? 'updating' : 'creating'} account: ${error.data?.message || error.message}`);
    }
  };

  // Check if current user can submit the form (only superadmin)
  const canSubmitForm = () => {
    return currentUser?.portalType === PORTAL_TYPES.SUPERADMIN;
  };

  // Check if field should be disabled
  const isFieldDisabled = (field) => {
    if (!currentUser || currentUser.portalType !== PORTAL_TYPES.SUPERADMIN) {
      return true;
    }
    
    // Some fields might be disabled during editing for data integrity
    if (isEditing) {
      const restrictedFields = ['subscription.plan']; // Plan changes might require special handling
      return restrictedFields.includes(field);
    }
    
    return false;
  };

  if (isEditing && isLoadingAccount) {
    return (
      <div className={styles.accountFormContainer}>
      <LoadingSpinner message="Loading account data..." />
    </div>
    );
  }

  if (isEditing && isAccountError) {
    return (
      <div className={styles.accountFormContainer}>
      <ErrorMessage 
        message="Failed to load account data for editing"
        variant="block"
        type="network"
      />
      <div className={styles.formActions}>
        <Button 
          variant="secondary" 
          onClick={() => navigate('/accounts')}
        >
          Back to Accounts
        </Button>
      </div>
    </div>
    );
  }

  if (!canSubmitForm()) {
    return (
      <ErrorMessage 
        error={{message: `You do not have permission to ${isEditing ? 'edit accounts' : 'create accounts'}`}} 
        variant="page" 
        type="error"
        title="Access Denied"
      />
      <button onClick={() => navigate('/accounts')} className={styles.btn + ' ' + styles.btnPrimary}>
        Back to Accounts
      </button>
    );
  }

  return (
    <div className={styles.accountFormContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1>{isEditing ? 'Edit Account' : 'Create New Account'}</h1>
          <p>{isEditing ? 'Update account information and settings' : 'Add a new tenant account to the system'}</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={() => navigate('/accounts')} 
            className={styles.btn + ' ' + styles.btnOutline}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.accountForm}>
        <div className={styles.formSections}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3>Basic Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Account Name *</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Account name is required' })}
                  disabled={isFieldDisabled('name')}
                  className={errors.name ? styles.error : ''}
                  placeholder="Company or Organization Name"
                />
                <ErrorMessage error={errors.name} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="isActive">Account Status</label>
                <select
                  id="isActive"
                  {...register('isActive')}
                  disabled={isFieldDisabled('isActive')}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className={styles.formSection}>
            <h3>Contact Information</h3>
            <div className={styles.formGrid}>
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
                  disabled={isFieldDisabled('contactInfo.email')}
                  className={errors.contactInfo?.email ? styles.error : ''}
                  placeholder="contact@company.com"
                />
                <ErrorMessage error={errors.contactInfo?.email} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="contactPhone">Phone Number</label>
                <input
                  type="tel"
                  id="contactPhone"
                  {...register('contactInfo.phone')}
                  disabled={isFieldDisabled('contactInfo.phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  {...register('contactInfo.website', {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Please enter a valid URL starting with http:// or https://'
                    }
                  })}
                  disabled={isFieldDisabled('contactInfo.website')}
                  className={errors.contactInfo?.website ? styles.error : ''}
                  placeholder="https://www.company.com"
                />
                <ErrorMessage error={errors.contactInfo?.website} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <h4>Address</h4>
                <div className={styles.addressGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="street">Street Address</label>
                    <input
                      type="text"
                      id="street"
                      {...register('contactInfo.address.street')}
                      disabled={isFieldDisabled('contactInfo.address.street')}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      {...register('contactInfo.address.city')}
                      disabled={isFieldDisabled('contactInfo.address.city')}
                      placeholder="New York"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      {...register('contactInfo.address.state')}
                      disabled={isFieldDisabled('contactInfo.address.state')}
                      placeholder="NY"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="zipCode">ZIP/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      {...register('contactInfo.address.zipCode')}
                      disabled={isFieldDisabled('contactInfo.address.zipCode')}
                      placeholder="10001"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      {...register('contactInfo.address.country')}
                      disabled={isFieldDisabled('contactInfo.address.country')}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="JP">Japan</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className={styles.formSection}>
            <h3>Subscription</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="plan">Subscription Plan *</label>
                <select
                  id="plan"
                  {...register('subscription.plan', { required: 'Subscription plan is required' })}
                  disabled={isFieldDisabled('subscription.plan')}
                  className={errors.subscription?.plan ? styles.error : ''}
                >
                  <option value={SUBSCRIPTION_PLANS.FREE}>Free</option>
                  <option value={SUBSCRIPTION_PLANS.BASIC}>Basic</option>
                  <option value={SUBSCRIPTION_PLANS.PROFESSIONAL}>Professional</option>
                  <option value={SUBSCRIPTION_PLANS.ENTERPRISE}>Enterprise</option>
                </select>
                <ErrorMessage error={errors.subscription?.plan} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  {...register('subscription.status')}
                  disabled={isFieldDisabled('subscription.status')}
                >
                  <option value={SUBSCRIPTION_STATUSES.ACTIVE}>Active</option>
                  <option value={SUBSCRIPTION_STATUSES.TRIAL}>Trial</option>
                  <option value={SUBSCRIPTION_STATUSES.EXPIRED}>Expired</option>
                  <option value={SUBSCRIPTION_STATUSES.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="maxUsers">Max Users</label>
                <input
                  type="number"
                  id="maxUsers"
                  {...register('subscription.maxUsers', {
                    required: 'Max users is required',
                    min: { value: 1, message: 'Must be at least 1 user' },
                    max: { value: 1000, message: 'Cannot exceed 1000 users' },
                    valueAsNumber: true
                  })}
                  disabled={isFieldDisabled('subscription.maxUsers')}
                  className={errors.subscription?.maxUsers ? styles.error : ''}
                  min="1"
                  placeholder="5"
                />
                <ErrorMessage error={errors.subscription?.maxUsers} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="maxAgencies">Max Agencies</label>
                <input
                  type="number"
                  id="maxAgencies"
                  {...register('subscription.maxAgencies', {
                    required: 'Max agencies is required',
                    min: { value: 1, message: 'Must be at least 1 agency' },
                    max: { value: 100, message: 'Cannot exceed 100 agencies' },
                    valueAsNumber: true
                  })}
                  disabled={isFieldDisabled('subscription.maxAgencies')}
                  className={errors.subscription?.maxAgencies ? styles.error : ''}
                  min="1"
                  placeholder="1"
                />
                <ErrorMessage error={errors.subscription?.maxAgencies} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  {...register('subscription.startDate')}
                  disabled={isFieldDisabled('subscription.startDate')}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  {...register('subscription.endDate')}
                  disabled={isFieldDisabled('subscription.endDate')}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="trialEndDate">Trial End Date</label>
                <input
                  type="date"
                  id="trialEndDate"
                  {...register('subscription.trialEndDate')}
                  disabled={isFieldDisabled('subscription.trialEndDate')}
                />
              </div>

              <div className={styles.formGroup}>
                <label>
                  <input
                    type="checkbox"
                    {...register('subscription.autoRenew')}
                    disabled={isFieldDisabled('subscription.autoRenew')}
                  />
                  Auto Renew
                </label>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className={styles.formSection}>
            <h3>Billing Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="billingCycle">Billing Cycle</label>
                <select
                  id="billingCycle"
                  {...register('billing.cycle')}
                  disabled={isFieldDisabled('billing.cycle')}
                >
                  <option value={BILLING_CYCLES.MONTHLY}>Monthly</option>
                  <option value={BILLING_CYCLES.QUARTERLY}>Quarterly</option>
                  <option value={BILLING_CYCLES.ANNUALLY}>Annually</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="billingStatus">Billing Status</label>
                <select
                  id="billingStatus"
                  {...register('billing.status')}
                  disabled={isFieldDisabled('billing.status')}
                >
                  <option value={BILLING_STATUSES.CURRENT}>Current</option>
                  <option value={BILLING_STATUSES.OVERDUE}>Overdue</option>
                  <option value={BILLING_STATUSES.PENDING}>Pending</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nextBillingDate">Next Billing Date</label>
                <input
                  type="date"
                  id="nextBillingDate"
                  {...register('billing.nextBillingDate')}
                  disabled={isFieldDisabled('billing.nextBillingDate')}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className={styles.formSection}>
            <h3>Account Settings</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  {...register('settings.timezone')}
                  disabled={isFieldDisabled('settings.timezone')}
                >
                  {Object.entries(TIMEZONES).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  {...register('settings.currency')}
                  disabled={isFieldDisabled('settings.currency')}
                >
                  {Object.entries(CURRENCIES).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dateFormat">Date Format</label>
                <select
                  id="dateFormat"
                  {...register('settings.dateFormat')}
                  disabled={isFieldDisabled('settings.dateFormat')}
                >
                  {Object.entries(DATE_FORMATS).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  {...register('settings.language')}
                  disabled={isFieldDisabled('settings.language')}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div className={styles.formGroup + ' ' + styles.fullWidth}>
                <h4>Features</h4>
                <div className={styles.checkboxGrid}>
                  <label>
                    <input
                      type="checkbox"
                      {...register('settings.features.multiAgency')}
                      disabled={isFieldDisabled('settings.features.multiAgency')}
                    />
                    Multi-Agency Support
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('settings.features.advancedReporting')}
                      disabled={isFieldDisabled('settings.features.advancedReporting')}
                    />
                    Advanced Reporting
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('settings.features.apiAccess')}
                      disabled={isFieldDisabled('settings.features.apiAccess')}
                    />
                    API Access
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      {...register('settings.features.customBranding')}
                      disabled={isFieldDisabled('settings.features.customBranding')}
                    />
                    Custom Branding
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <Button 
            type="button" 
            variant="secondary"
            onClick={() => navigate('/accounts')} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isEditing ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AccountForm;

// AI-NOTE: Migrated AccountForm to React Hook Form with comprehensive validation, standardized components (LoadingSpinner, ErrorMessage, Button), and improved form state management. Includes account-specific fields for subscription plans, billing, settings, and features with proper validation rules and error handling. Replaces useState with useForm hook for better performance and validation.
// AI-NOTE: Fixed ObjectId casting error by changing updateAccount call from { id: accountId, accountData: submitData } to { accountId: accountId, ...submitData } to match accountsApi.js mutation parameter structure.