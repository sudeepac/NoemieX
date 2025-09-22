import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetAccountQuery,
  useCreateAccountMutation, 
  useUpdateAccountMutation 
} from '../../store/api/accounts.api';
import { 
  accountHelpers,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_CYCLES,
  BILLING_STATUSES,
  TIMEZONES,
  CURRENCIES,
  DATE_FORMATS,
  createAccountFormData,
  validateAccountForm
} from '../../types/account.types';
import { PORTAL_TYPES } from '../../types/user.types';
import LoadingSpinner from '../common/loading-spinner.component';
import './AccountForm.css';

// AccountForm component for creating and editing accounts
function AccountForm() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const isEditing = Boolean(accountId);
  
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState(createAccountFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFormData({
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
  }, [isEditing, accountData]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const fieldParts = field.split('.');
        let newData = { ...prev };
        let current = newData;
        
        for (let i = 0; i < fieldParts.length - 1; i++) {
          current[fieldParts[i]] = { ...current[fieldParts[i]] };
          current = current[fieldParts[i]];
        }
        
        current[fieldParts[fieldParts.length - 1]] = value;
        return newData;
      }
      return {
        ...prev,
        [field]: value
      };
    });

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateAccountForm(formData, isEditing);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check permissions
    if (!canSubmitForm()) {
      alert('You do not have permission to perform this action');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Convert date strings to Date objects
        subscription: {
          ...formData.subscription,
          startDate: formData.subscription.startDate ? new Date(formData.subscription.startDate) : undefined,
          endDate: formData.subscription.endDate ? new Date(formData.subscription.endDate) : undefined,
          trialEndDate: formData.subscription.trialEndDate ? new Date(formData.subscription.trialEndDate) : undefined
        },
        billing: {
          ...formData.billing,
          nextBillingDate: formData.billing.nextBillingDate ? new Date(formData.billing.nextBillingDate) : undefined
        }
      };

      if (isEditing) {
        await updateAccount({ id: accountId, accountData: submitData }).unwrap();
        alert('Account updated successfully');
      } else {
        await createAccount(submitData).unwrap();
        alert('Account created successfully');
      }
      
      navigate('/accounts');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error ${isEditing ? 'updating' : 'creating'} account: ${error.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
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
    return <LoadingSpinner />;
  }

  if (isEditing && isAccountError) {
    return (
      <div className="error-container">
        <h3>Error Loading Account</h3>
        <p>Failed to load account data for editing</p>
        <button onClick={() => navigate('/accounts')} className="btn btn-primary">
          Back to Accounts
        </button>
      </div>
    );
  }

  if (!canSubmitForm()) {
    return (
      <div className="error-container">
        <h3>Access Denied</h3>
        <p>You do not have permission to {isEditing ? 'edit accounts' : 'create accounts'}</p>
        <button onClick={() => navigate('/accounts')} className="btn btn-primary">
          Back to Accounts
        </button>
      </div>
    );
  }

  return (
    <div className="account-form-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>{isEditing ? 'Edit Account' : 'Create New Account'}</h1>
          <p>{isEditing ? 'Update account information and settings' : 'Add a new tenant account to the system'}</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/accounts')} 
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="name">Account Name *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  disabled={isFieldDisabled('name')}
                  className={errors.name ? 'error' : ''}
                  placeholder="Company or Organization Name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="isActive">Account Status</label>
                <select
                  id="isActive"
                  value={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                  disabled={isFieldDisabled('isActive')}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="contactEmail">Email Address *</label>
                <input
                  type="email"
                  id="contactEmail"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleChange('contactInfo.email', e.target.value)}
                  disabled={isFieldDisabled('contactInfo.email')}
                  className={errors['contactInfo.email'] ? 'error' : ''}
                  placeholder="contact@company.com"
                />
                {errors['contactInfo.email'] && <span className="error-text">{errors['contactInfo.email']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Phone Number</label>
                <input
                  type="tel"
                  id="contactPhone"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleChange('contactInfo.phone', e.target.value)}
                  disabled={isFieldDisabled('contactInfo.phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  value={formData.contactInfo.website}
                  onChange={(e) => handleChange('contactInfo.website', e.target.value)}
                  disabled={isFieldDisabled('contactInfo.website')}
                  placeholder="https://www.company.com"
                />
              </div>

              <div className="form-group full-width">
                <h4>Address</h4>
                <div className="address-grid">
                  <div className="form-group">
                    <label htmlFor="street">Street Address</label>
                    <input
                      type="text"
                      id="street"
                      value={formData.contactInfo.address.street}
                      onChange={(e) => handleChange('contactInfo.address.street', e.target.value)}
                      disabled={isFieldDisabled('contactInfo.address.street')}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.contactInfo.address.city}
                      onChange={(e) => handleChange('contactInfo.address.city', e.target.value)}
                      disabled={isFieldDisabled('contactInfo.address.city')}
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State/Province</label>
                    <input
                      type="text"
                      id="state"
                      value={formData.contactInfo.address.state}
                      onChange={(e) => handleChange('contactInfo.address.state', e.target.value)}
                      disabled={isFieldDisabled('contactInfo.address.state')}
                      placeholder="NY"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      value={formData.contactInfo.address.zipCode}
                      onChange={(e) => handleChange('contactInfo.address.zipCode', e.target.value)}
                      disabled={isFieldDisabled('contactInfo.address.zipCode')}
                      placeholder="10001"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      value={formData.contactInfo.address.country}
                      onChange={(e) => handleChange('contactInfo.address.country', e.target.value)}
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
          <div className="form-section">
            <h3>Subscription</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="plan">Subscription Plan *</label>
                <select
                  id="plan"
                  value={formData.subscription.plan}
                  onChange={(e) => handleChange('subscription.plan', e.target.value)}
                  disabled={isFieldDisabled('subscription.plan')}
                  className={errors['subscription.plan'] ? 'error' : ''}
                >
                  <option value={SUBSCRIPTION_PLANS.FREE}>Free</option>
                  <option value={SUBSCRIPTION_PLANS.BASIC}>Basic</option>
                  <option value={SUBSCRIPTION_PLANS.PROFESSIONAL}>Professional</option>
                  <option value={SUBSCRIPTION_PLANS.ENTERPRISE}>Enterprise</option>
                </select>
                {errors['subscription.plan'] && <span className="error-text">{errors['subscription.plan']}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={formData.subscription.status}
                  onChange={(e) => handleChange('subscription.status', e.target.value)}
                  disabled={isFieldDisabled('subscription.status')}
                >
                  <option value={SUBSCRIPTION_STATUSES.ACTIVE}>Active</option>
                  <option value={SUBSCRIPTION_STATUSES.TRIAL}>Trial</option>
                  <option value={SUBSCRIPTION_STATUSES.EXPIRED}>Expired</option>
                  <option value={SUBSCRIPTION_STATUSES.CANCELLED}>Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="maxUsers">Max Users</label>
                <input
                  type="number"
                  id="maxUsers"
                  value={formData.subscription.maxUsers}
                  onChange={(e) => handleChange('subscription.maxUsers', parseInt(e.target.value) || 0)}
                  disabled={isFieldDisabled('subscription.maxUsers')}
                  min="1"
                  placeholder="5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="maxAgencies">Max Agencies</label>
                <input
                  type="number"
                  id="maxAgencies"
                  value={formData.subscription.maxAgencies}
                  onChange={(e) => handleChange('subscription.maxAgencies', parseInt(e.target.value) || 0)}
                  disabled={isFieldDisabled('subscription.maxAgencies')}
                  min="1"
                  placeholder="1"
                />
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.subscription.startDate}
                  onChange={(e) => handleChange('subscription.startDate', e.target.value)}
                  disabled={isFieldDisabled('subscription.startDate')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.subscription.endDate}
                  onChange={(e) => handleChange('subscription.endDate', e.target.value)}
                  disabled={isFieldDisabled('subscription.endDate')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="trialEndDate">Trial End Date</label>
                <input
                  type="date"
                  id="trialEndDate"
                  value={formData.subscription.trialEndDate}
                  onChange={(e) => handleChange('subscription.trialEndDate', e.target.value)}
                  disabled={isFieldDisabled('subscription.trialEndDate')}
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.subscription.autoRenew}
                    onChange={(e) => handleChange('subscription.autoRenew', e.target.checked)}
                    disabled={isFieldDisabled('subscription.autoRenew')}
                  />
                  Auto Renew
                </label>
              </div>
            </div>
          </div>

          {/* Billing */}
          <div className="form-section">
            <h3>Billing Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="billingCycle">Billing Cycle</label>
                <select
                  id="billingCycle"
                  value={formData.billing.cycle}
                  onChange={(e) => handleChange('billing.cycle', e.target.value)}
                  disabled={isFieldDisabled('billing.cycle')}
                >
                  <option value={BILLING_CYCLES.MONTHLY}>Monthly</option>
                  <option value={BILLING_CYCLES.QUARTERLY}>Quarterly</option>
                  <option value={BILLING_CYCLES.ANNUALLY}>Annually</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="billingStatus">Billing Status</label>
                <select
                  id="billingStatus"
                  value={formData.billing.status}
                  onChange={(e) => handleChange('billing.status', e.target.value)}
                  disabled={isFieldDisabled('billing.status')}
                >
                  <option value={BILLING_STATUSES.CURRENT}>Current</option>
                  <option value={BILLING_STATUSES.OVERDUE}>Overdue</option>
                  <option value={BILLING_STATUSES.PENDING}>Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="nextBillingDate">Next Billing Date</label>
                <input
                  type="date"
                  id="nextBillingDate"
                  value={formData.billing.nextBillingDate}
                  onChange={(e) => handleChange('billing.nextBillingDate', e.target.value)}
                  disabled={isFieldDisabled('billing.nextBillingDate')}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="form-section">
            <h3>Account Settings</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select
                  id="timezone"
                  value={formData.settings.timezone}
                  onChange={(e) => handleChange('settings.timezone', e.target.value)}
                  disabled={isFieldDisabled('settings.timezone')}
                >
                  {Object.entries(TIMEZONES).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  value={formData.settings.currency}
                  onChange={(e) => handleChange('settings.currency', e.target.value)}
                  disabled={isFieldDisabled('settings.currency')}
                >
                  {Object.entries(CURRENCIES).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateFormat">Date Format</label>
                <select
                  id="dateFormat"
                  value={formData.settings.dateFormat}
                  onChange={(e) => handleChange('settings.dateFormat', e.target.value)}
                  disabled={isFieldDisabled('settings.dateFormat')}
                >
                  {Object.entries(DATE_FORMATS).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={formData.settings.language}
                  onChange={(e) => handleChange('settings.language', e.target.value)}
                  disabled={isFieldDisabled('settings.language')}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>

              <div className="form-group full-width">
                <h4>Features</h4>
                <div className="checkbox-grid">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.settings.features.multiAgency}
                      onChange={(e) => handleChange('settings.features.multiAgency', e.target.checked)}
                      disabled={isFieldDisabled('settings.features.multiAgency')}
                    />
                    Multi-Agency Support
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.settings.features.advancedReporting}
                      onChange={(e) => handleChange('settings.features.advancedReporting', e.target.checked)}
                      disabled={isFieldDisabled('settings.features.advancedReporting')}
                    />
                    Advanced Reporting
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.settings.features.apiAccess}
                      onChange={(e) => handleChange('settings.features.apiAccess', e.target.checked)}
                      disabled={isFieldDisabled('settings.features.apiAccess')}
                    />
                    API Access
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.settings.features.customBranding}
                      onChange={(e) => handleChange('settings.features.customBranding', e.target.checked)}
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
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/accounts')} 
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update Account' : 'Create Account')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AccountForm;

// AI-NOTE: Created comprehensive AccountForm component with account-specific fields including subscription plans, billing information, settings, and features. Follows UserForm pattern but adapted for account management with superadmin-only access controls and proper validation.