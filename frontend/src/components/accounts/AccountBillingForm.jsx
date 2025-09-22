import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAccountQuery, useUpdateAccountMutation } from '../../store/api/api';
import { BILLING_CYCLES, BILLING_STATUSES, CURRENCIES } from '../../types/account.types';
import { useAuth } from '../../hooks/useAuth';
import './AccountBillingForm.css';

/**
 * AccountBillingForm component for updating account billing information
 * Restricted to superadmin users only
 */
const AccountBillingForm = ({ onCancel, onSuccess }) => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const { user } = useAuth();
  
  // RTK Query hooks
  const { data: accountData, isLoading, error } = useGetAccountQuery(accountId, {
    skip: !accountId
  });
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation();

  // Form state
  const [formData, setFormData] = useState({
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
      currency: CURRENCIES.USD
    }
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check permissions - only superadmin can access billing forms
  const canAccessBilling = () => {
    return user?.portalType === 'superadmin';
  };

  // Populate form with existing account data
  useEffect(() => {
    if (accountData?.account) {
      const account = accountData.account;
      setFormData({
        billing: {
          cycle: account.billing?.cycle || BILLING_CYCLES.MONTHLY,
          status: account.billing?.status || BILLING_STATUSES.CURRENT,
          nextBillingDate: account.billing?.nextBillingDate ? 
            new Date(account.billing.nextBillingDate).toISOString().split('T')[0] : '',
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
          currency: account.settings?.currency || CURRENCIES.USD
        }
      });
    }
  }, [accountData]);

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

  // Validate billing form
  const validateForm = () => {
    const validationErrors = {};

    // Validate billing cycle
    if (!formData.billing.cycle) {
      validationErrors.billingCycle = 'Billing cycle is required';
    }

    // Validate billing status
    if (!formData.billing.status) {
      validationErrors.billingStatus = 'Billing status is required';
    }

    // Validate payment method
    if (formData.billing.paymentMethod.type === 'credit_card') {
      if (!formData.billing.paymentMethod.cardholderName.trim()) {
        validationErrors.cardholderName = 'Cardholder name is required';
      }
      if (!formData.billing.paymentMethod.lastFour || formData.billing.paymentMethod.lastFour.length !== 4) {
        validationErrors.lastFour = 'Last four digits must be 4 characters';
      }
      if (!formData.billing.paymentMethod.expiryMonth || 
          parseInt(formData.billing.paymentMethod.expiryMonth) < 1 || 
          parseInt(formData.billing.paymentMethod.expiryMonth) > 12) {
        validationErrors.expiryMonth = 'Valid expiry month is required (1-12)';
      }
      if (!formData.billing.paymentMethod.expiryYear || 
          parseInt(formData.billing.paymentMethod.expiryYear) < new Date().getFullYear()) {
        validationErrors.expiryYear = 'Valid expiry year is required';
      }
    }

    // Validate billing address
    if (!formData.billing.billingAddress.street.trim()) {
      validationErrors.street = 'Street address is required';
    }
    if (!formData.billing.billingAddress.city.trim()) {
      validationErrors.city = 'City is required';
    }
    if (!formData.billing.billingAddress.state.trim()) {
      validationErrors.state = 'State is required';
    }
    if (!formData.billing.billingAddress.zipCode.trim()) {
      validationErrors.zipCode = 'ZIP code is required';
    }
    if (!formData.billing.billingAddress.country.trim()) {
      validationErrors.country = 'Country is required';
    }

    return validationErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check permissions
    if (!canAccessBilling()) {
      alert('You do not have permission to update billing information');
      return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        billing: {
          ...formData.billing,
          nextBillingDate: formData.billing.nextBillingDate ? 
            new Date(formData.billing.nextBillingDate) : undefined
        },
        settings: {
          currency: formData.settings.currency
        }
      };

      await updateAccount({ id: accountId, accountData: submitData }).unwrap();
      
      if (onSuccess) {
        onSuccess();
      } else {
        alert('Billing information updated successfully');
        navigate(`/accounts/${accountId}`);
      }
    } catch (error) {
      console.error('Billing form submission error:', error);
      alert(`Error updating billing information: ${error.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/accounts/${accountId}`);
    }
  };

  // Check permissions
  if (!canAccessBilling()) {
    return (
      <div className="billing-form-container">
        <div className="error-message">
          <h3>Access Denied</h3>
          <p>You do not have permission to access billing information.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="billing-form-container">
        <div className="loading-message">Loading account data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="billing-form-container">
        <div className="error-message">
          <h3>Error Loading Account</h3>
          <p>{error.data?.message || error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-form-container">
      <div className="billing-form-header">
        <h2>Update Billing Information</h2>
        <p>Manage billing details for {accountData?.account?.name}</p>
      </div>

      <form onSubmit={handleSubmit} className="billing-form">
        {/* Billing Cycle & Status */}
        <div className="form-section">
          <h3>Billing Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="billingCycle">Billing Cycle *</label>
              <select
                id="billingCycle"
                value={formData.billing.cycle}
                onChange={(e) => handleChange('billing.cycle', e.target.value)}
                className={errors.billingCycle ? 'error' : ''}
              >
                <option value={BILLING_CYCLES.MONTHLY}>Monthly</option>
                <option value={BILLING_CYCLES.QUARTERLY}>Quarterly</option>
                <option value={BILLING_CYCLES.ANNUALLY}>Annually</option>
              </select>
              {errors.billingCycle && <span className="error-text">{errors.billingCycle}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="billingStatus">Billing Status *</label>
              <select
                id="billingStatus"
                value={formData.billing.status}
                onChange={(e) => handleChange('billing.status', e.target.value)}
                className={errors.billingStatus ? 'error' : ''}
              >
                <option value={BILLING_STATUSES.CURRENT}>Current</option>
                <option value={BILLING_STATUSES.OVERDUE}>Overdue</option>
                <option value={BILLING_STATUSES.PENDING}>Pending</option>
              </select>
              {errors.billingStatus && <span className="error-text">{errors.billingStatus}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="nextBillingDate">Next Billing Date</label>
              <input
                type="date"
                id="nextBillingDate"
                value={formData.billing.nextBillingDate}
                onChange={(e) => handleChange('billing.nextBillingDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="currency">Currency *</label>
              <select
                id="currency"
                value={formData.settings.currency}
                onChange={(e) => handleChange('settings.currency', e.target.value)}
              >
                <option value={CURRENCIES.USD}>USD - US Dollar</option>
                <option value={CURRENCIES.EUR}>EUR - Euro</option>
                <option value={CURRENCIES.GBP}>GBP - British Pound</option>
                <option value={CURRENCIES.CAD}>CAD - Canadian Dollar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="form-section">
          <h3>Payment Method</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="paymentType">Payment Type *</label>
              <select
                id="paymentType"
                value={formData.billing.paymentMethod.type}
                onChange={(e) => handleChange('billing.paymentMethod.type', e.target.value)}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {formData.billing.paymentMethod.type === 'credit_card' && (
              <>
                <div className="form-group">
                  <label htmlFor="cardholderName">Cardholder Name *</label>
                  <input
                    type="text"
                    id="cardholderName"
                    value={formData.billing.paymentMethod.cardholderName}
                    onChange={(e) => handleChange('billing.paymentMethod.cardholderName', e.target.value)}
                    className={errors.cardholderName ? 'error' : ''}
                    placeholder="Full name on card"
                  />
                  {errors.cardholderName && <span className="error-text">{errors.cardholderName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="lastFour">Last Four Digits *</label>
                  <input
                    type="text"
                    id="lastFour"
                    value={formData.billing.paymentMethod.lastFour}
                    onChange={(e) => handleChange('billing.paymentMethod.lastFour', e.target.value)}
                    className={errors.lastFour ? 'error' : ''}
                    placeholder="1234"
                    maxLength="4"
                  />
                  {errors.lastFour && <span className="error-text">{errors.lastFour}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="expiryMonth">Expiry Month *</label>
                  <select
                    id="expiryMonth"
                    value={formData.billing.paymentMethod.expiryMonth}
                    onChange={(e) => handleChange('billing.paymentMethod.expiryMonth', e.target.value)}
                    className={errors.expiryMonth ? 'error' : ''}
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  {errors.expiryMonth && <span className="error-text">{errors.expiryMonth}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="expiryYear">Expiry Year *</label>
                  <select
                    id="expiryYear"
                    value={formData.billing.paymentMethod.expiryYear}
                    onChange={(e) => handleChange('billing.paymentMethod.expiryYear', e.target.value)}
                    className={errors.expiryYear ? 'error' : ''}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.expiryYear && <span className="error-text">{errors.expiryYear}</span>}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div className="form-section">
          <h3>Billing Address</h3>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                value={formData.billing.billingAddress.street}
                onChange={(e) => handleChange('billing.billingAddress.street', e.target.value)}
                className={errors.street ? 'error' : ''}
                placeholder="123 Main Street"
              />
              {errors.street && <span className="error-text">{errors.street}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                value={formData.billing.billingAddress.city}
                onChange={(e) => handleChange('billing.billingAddress.city', e.target.value)}
                className={errors.city ? 'error' : ''}
                placeholder="New York"
              />
              {errors.city && <span className="error-text">{errors.city}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">State/Province *</label>
              <input
                type="text"
                id="state"
                value={formData.billing.billingAddress.state}
                onChange={(e) => handleChange('billing.billingAddress.state', e.target.value)}
                className={errors.state ? 'error' : ''}
                placeholder="NY"
              />
              {errors.state && <span className="error-text">{errors.state}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="zipCode">ZIP/Postal Code *</label>
              <input
                type="text"
                id="zipCode"
                value={formData.billing.billingAddress.zipCode}
                onChange={(e) => handleChange('billing.billingAddress.zipCode', e.target.value)}
                className={errors.zipCode ? 'error' : ''}
                placeholder="10001"
              />
              {errors.zipCode && <span className="error-text">{errors.zipCode}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                value={formData.billing.billingAddress.country}
                onChange={(e) => handleChange('billing.billingAddress.country', e.target.value)}
                className={errors.country ? 'error' : ''}
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="IT">Italy</option>
                <option value="ES">Spain</option>
              </select>
              {errors.country && <span className="error-text">{errors.country}</span>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
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
            {isSubmitting ? 'Updating...' : 'Update Billing Information'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountBillingForm;

// AI-NOTE: Created AccountBillingForm component for superadmin-only billing management. Includes billing cycle, payment method, billing address, validation, and secure form handling following AccountForm patterns.