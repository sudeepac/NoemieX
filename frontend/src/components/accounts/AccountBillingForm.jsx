import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetAccountQuery, useUpdateAccountMutation } from '../../store/api/api';
import ErrorMessage from '../../shared/components/ErrorMessage';
import { BILLING_CYCLES, BILLING_STATUSES, CURRENCIES } from '../../types/account.types';
import { useAuth } from '../../hooks/useAuth';
import styles from './AccountBillingForm.module.css';

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
    defaultValues: {
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
    }
  });

  const formData = watch();

  // Check permissions - only superadmin can access billing forms
  const canAccessBilling = () => {
    return user?.portalType === 'superadmin';
  };

  // Populate form with existing account data
  useEffect(() => {
    if (accountData?.account) {
      const account = accountData.account;
      reset({
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
  }, [accountData, reset]);





  // Handle form submission
  const onSubmit = async (data) => {
    // Check permissions
    if (!canAccessBilling()) {
      alert('You do not have permission to update billing information');
      return;
    }

    try {
      // Prepare data for submission
      const submitData = {
        billing: {
          ...data.billing,
          nextBillingDate: data.billing.nextBillingDate ? 
            new Date(data.billing.nextBillingDate) : undefined
        },
        settings: {
          currency: data.settings.currency
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
      <div className={styles.billingFormContainer}>
        <ErrorMessage 
          error={{message: "You do not have permission to access billing information."}} 
          variant="page" 
          type="error"
          title="Access Denied"
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.billingFormContainer}>
        <div className={styles.loadingMessage}>Loading account data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.billingFormContainer}>
        <ErrorMessage 
          error={{message: error.data?.message || error.message}} 
          variant="page" 
          type="error"
          title="Error Loading Account"
        />
      </div>
    );
  }

  return (
    <div className={styles.billingFormContainer}>
      <div className={styles.billingFormHeader}>
        <h2>Update Billing Information</h2>
        <p>Manage billing details for {accountData?.account?.name}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.billingForm}>
        {/* Billing Cycle & Status */}
        <div className={styles.formSection}>
          <h3>Billing Settings</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="billingCycle">Billing Cycle *</label>
              <select
                id="billingCycle"
                {...register('billing.cycle', { required: 'Billing cycle is required' })}
                className={errors.billing?.cycle ? styles.error : ''}
              >
                <option value={BILLING_CYCLES.MONTHLY}>Monthly</option>
                <option value={BILLING_CYCLES.QUARTERLY}>Quarterly</option>
                <option value={BILLING_CYCLES.ANNUALLY}>Annually</option>
              </select>
              <ErrorMessage error={errors.billing?.cycle} variant="inline" type="validation" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="billingStatus">Billing Status *</label>
              <select
                id="billingStatus"
                {...register('billing.status', { required: 'Billing status is required' })}
                className={errors.billing?.status ? styles.error : ''}
              >
                <option value={BILLING_STATUSES.CURRENT}>Current</option>
                <option value={BILLING_STATUSES.OVERDUE}>Overdue</option>
                <option value={BILLING_STATUSES.PENDING}>Pending</option>
              </select>
              <ErrorMessage error={errors.billing?.status} variant="inline" type="validation" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nextBillingDate">Next Billing Date</label>
              <input
                type="date"
                id="nextBillingDate"
                {...register('billing.nextBillingDate')}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="currency">Currency *</label>
              <select
                id="currency"
                {...register('settings.currency')}
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
        <div className={styles.formSection}>
          <h3>Payment Method</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="paymentType">Payment Type *</label>
              <select
                id="paymentType"
                {...register('billing.paymentMethod.type')}
              >
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="stripe">Stripe</option>
              </select>
            </div>

            {watch('billing.paymentMethod.type') === 'credit_card' && (
              <>
                <div className={styles.formGroup}>
                  <label htmlFor="cardholderName">Cardholder Name *</label>
                  <input
                    type="text"
                    id="cardholderName"
                    {...register('billing.paymentMethod.cardholderName', { required: 'Cardholder name is required' })}
                    className={errors.billing?.paymentMethod?.cardholderName ? styles.error : ''}
                    placeholder="Full name on card"
                  />
                  <ErrorMessage error={errors.billing?.paymentMethod?.cardholderName} variant="inline" type="validation" />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastFour">Last Four Digits *</label>
                  <input
                    type="text"
                    id="lastFour"
                    {...register('billing.paymentMethod.lastFour', { 
                      required: 'Last four digits are required',
                      pattern: {
                        value: /^\d{4}$/,
                        message: 'Must be 4 digits'
                      }
                    })}
                    className={errors.billing?.paymentMethod?.lastFour ? styles.error : ''}
                    placeholder="1234"
                    maxLength="4"
                  />
                  <ErrorMessage error={errors.billing?.paymentMethod?.lastFour} variant="inline" type="validation" />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="expiryMonth">Expiry Month *</label>
                  <select
                    id="expiryMonth"
                    {...register('billing.paymentMethod.expiryMonth', { required: 'Expiry month is required' })}
                    className={errors.billing?.paymentMethod?.expiryMonth ? styles.error : ''}
                  >
                    <option value="">Select Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage error={errors.billing?.paymentMethod?.expiryMonth} variant="inline" type="validation" />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="expiryYear">Expiry Year *</label>
                  <select
                    id="expiryYear"
                    {...register('billing.paymentMethod.expiryYear', { required: 'Expiry year is required' })}
                    className={errors.billing?.paymentMethod?.expiryYear ? styles.error : ''}
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <ErrorMessage error={errors.billing?.paymentMethod?.expiryYear} variant="inline" type="validation" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Billing Address */}
        <div className={styles.formSection}>
          <h3>Billing Address</h3>
          <div className={styles.formGrid}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label htmlFor="street">Street Address *</label>
              <input
                type="text"
                id="street"
                {...register('billing.billingAddress.street', { required: 'Street address is required' })}
                className={errors.billing?.billingAddress?.street ? styles.error : ''}
                placeholder="123 Main Street"
              />
              <ErrorMessage error={errors.billing?.billingAddress?.street} variant="inline" type="validation" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="city">City *</label>
              <input
                type="text"
                id="city"
                {...register('billing.billingAddress.city', { required: 'City is required' })}
                className={errors.billing?.billingAddress?.city ? styles.error : ''}
                placeholder="New York"
              />
              <ErrorMessage error={errors.billing?.billingAddress?.city} variant="inline" type="validation" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="state">State/Province *</label>
              <input
                type="text"
                id="state"
                {...register('billing.billingAddress.state', { required: 'State is required' })}
                className={errors.billing?.billingAddress?.state ? styles.error : ''}
                placeholder="NY"
              />
              <ErrorMessage error={errors.billing?.billingAddress?.state} variant="inline" type="validation" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="zipCode">ZIP/Postal Code *</label>
              <input
                type="text"
                id="zipCode"
                {...register('billing.billingAddress.zipCode', { required: 'ZIP code is required' })}
                className={errors.billing?.billingAddress?.zipCode ? styles.error : ''}
                placeholder="10001"
              />
              <ErrorMessage error={errors.billing?.billingAddress?.zipCode} variant="inline" type="validation" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="country">Country *</label>
              <select
                id="country"
                {...register('billing.billingAddress.country', { required: 'Country is required' })}
                className={errors.billing?.billingAddress?.country ? styles.error : ''}
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
              <ErrorMessage error={errors.billing?.billingAddress?.country} variant="inline" type="validation" />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={isSubmitting || isUpdating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isSubmitting || isUpdating}
          >
            {isSubmitting || isUpdating ? 'Updating...' : 'Update Billing Information'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountBillingForm;

// AI-NOTE: AccountBillingForm component migrated to React Hook Form
// - Superadmin-only access with permission checks for billing management
// - Migrated from useState to React Hook Form for better performance and validation
// - Uses register() for form fields with built-in validation rules
// - Handles nested billing data structure (billing.paymentMethod, billing.billingAddress)
// - Conditional rendering for credit card fields using watch()
// - Maintains RTK Query integration for data fetching and mutations