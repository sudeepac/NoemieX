import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useGetAccountQuery,
  useDeleteAccountMutation, 
  useToggleAccountStatusMutation,
  useGetAccountStatsQuery
} from '../../store/api/api';
import { 
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_STATUSES,
  accountHelpers 
} from '../../types/account.types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import styles from './AccountDetail.module.css';

// AccountDetail component for displaying comprehensive account information
function AccountDetail() {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // RTK Query hooks
  const { 
    data: accountData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAccountQuery(accountId);

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useGetAccountStatsQuery(accountId);

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [toggleAccountStatus, { isLoading: isToggling }] = useToggleAccountStatusMutation();

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(accountId).unwrap();
      navigate('/accounts');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
    setShowDeleteConfirm(false);
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      await toggleAccountStatus(accountId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to toggle account status:', error);
    }
  };

  // Permission checks
  const canEditAccount = () => {
    return currentUser?.role === 'superadmin';
  };

  const canDeleteAccount = () => {
    return currentUser?.role === 'superadmin';
  };

  const canToggleStatus = () => {
    return currentUser?.role === 'superadmin';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.accountDetailContainer}>
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={styles.accountDetailContainer}>
        <ErrorMessage 
          error={{message: error?.data?.message || 'Failed to load account details'}} 
          variant="page" 
          type="error"
          title="Error Loading Account"
        />
        <div className={styles.errorActions}>
          <button onClick={() => refetch()} className={`${styles.btn} ${styles.btnPrimary}`}>
            Try Again
          </button>
          <Link to="/accounts" className={`${styles.btn} ${styles.btnOutline}`}>
            Back to Accounts
          </Link>
        </div>
      </div>
    );
  }

  const account = accountData?.data;
  const stats = statsData?.data;

  if (!account) {
    return (
      <div className={styles.accountDetailContainer}>
        <ErrorMessage 
          error={{message: "The requested account could not be found."}} 
          variant="page" 
          type="error"
          title="Account Not Found"
        />
        <div className={styles.errorActions}>
          <Link to="/accounts" className={`${styles.btn} ${styles.btnPrimary}`}>
            Back to Accounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accountDetailContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <Link to="/accounts" className={styles.breadcrumbLink}>Accounts</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{account.name}</span>
          </div>
          <h1>{account.name}</h1>
          <div className={styles.accountMeta}>
            <span className={`${styles.statusBadge} ${account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? styles.active : styles.inactive}`}>
              {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
            </span>
            <span className={`${styles.planBadge} ${styles[`plan${account.subscription?.plan}`]}`}>
              {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
            </span>
            <span className={`${styles.billingBadge} ${styles[accountHelpers.getBillingStatusClass(account.billing?.status)]}`}>
              {accountHelpers.getBillingStatusText(account.billing?.status)}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {canEditAccount() && (
            <Link to={`/accounts/${account._id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
              Edit Account
            </Link>
          )}
          {canToggleStatus() && (
            <button 
              onClick={handleToggleStatus}
              className={`${styles.btn} ${account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? styles.btnWarning : styles.btnSuccess}`}
              disabled={isToggling}
            >
              {isToggling ? 'Updating...' : 
                account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? 'Suspend Account' : 'Activate Account'
              }
            </button>
          )}
          {canDeleteAccount() && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={isDeleting}
            >
              Delete Account
            </button>
          )}
        </div>
      </div>

      <div className={styles.accountDetailContent}>
        {/* Basic Information */}
        <div className={styles.detailSection}>
          <h3>Basic Information</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Account Name</label>
              <div className={styles.detailValue}>{account.name}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Contact Email</label>
              <div className={styles.detailValue}>
                <a href={`mailto:${account.contactInfo?.email}`} className={styles.emailLink}>
                  {account.contactInfo?.email}
                </a>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Contact Phone</label>
              <div className={styles.detailValue}>
                {account.contactInfo?.phone ? (
                  <a href={`tel:${account.contactInfo.phone}`} className={styles.phoneLink}>
                    {account.contactInfo.phone}
                  </a>
                ) : (
                  <span className={styles.noData}>Not provided</span>
                )}
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Account ID</label>
              <div className={`${styles.detailValue} ${styles.accountId}`}>
                {account._id}
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Created</label>
              <div className={styles.detailValue}>
                {new Date(account.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {account.updatedAt && account.updatedAt !== account.createdAt && (
              <div className={styles.detailItem}>
                <label>Last Updated</label>
                <div className={styles.detailValue}>
                  {new Date(account.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Address */}
        {account.contactInfo?.address && Object.values(account.contactInfo.address).some(value => value) && (
          <div className={styles.detailSection}>
            <h3>Contact Address</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>Street Address</label>
                <div className={styles.detailValue}>{account.contactInfo.address.street || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>City</label>
                <div className={styles.detailValue}>{account.contactInfo.address.city || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>State</label>
                <div className={styles.detailValue}>{account.contactInfo.address.state || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>ZIP Code</label>
                <div className={styles.detailValue}>{account.contactInfo.address.zipCode || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>Country</label>
                <div className={styles.detailValue}>{account.contactInfo.address.country || 'Not provided'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className={styles.detailSection}>
          <h3>Subscription Details</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Plan</label>
              <div className={styles.detailValue}>
                <span className={`${styles.planBadge} ${styles[`plan${account.subscription?.plan}`]}`}>
                  {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Status</label>
              <div className={styles.detailValue}>
                <span className={`${styles.statusBadge} ${styles[accountHelpers.getSubscriptionStatusClass(account.subscription?.status)]}`}>
                  {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Billing Cycle</label>
              <div className={styles.detailValue}>
                {account.subscription?.billingCycle ? 
                  account.subscription.billingCycle.charAt(0).toUpperCase() + account.subscription.billingCycle.slice(1) :
                  'Not set'
                }
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Max Users</label>
              <div className={styles.detailValue}>{account.subscription?.maxUsers || 'Unlimited'}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Max Agencies</label>
              <div className={styles.detailValue}>{account.subscription?.maxAgencies || 'Unlimited'}</div>
            </div>
            {accountHelpers.isTrialAccount(account) && (
              <div className={styles.detailItem}>
                <label>Trial Ends</label>
                <div className={styles.detailValue}>
                  {account.subscription?.trialEndDate ? (
                    <span className={accountHelpers.isTrialExpired(account) ? styles.trialExpired : styles.trialActive}>
                      {new Date(account.subscription.trialEndDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {!accountHelpers.isTrialExpired(account) && (
                        <span className={styles.trialDays}> ({accountHelpers.getTrialDaysRemaining(account)} days left)</span>
                      )}
                    </span>
                  ) : (
                    'Not set'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Information */}
        <div className={styles.detailSection}>
          <h3>Billing Information</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Billing Status</label>
              <div className={styles.detailValue}>
                <span className={`${styles.billingBadge} ${styles[accountHelpers.getBillingStatusClass(account.billing?.status)]}`}>
                  {accountHelpers.getBillingStatusText(account.billing?.status)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Company Name</label>
              <div className={styles.detailValue}>{account.billing?.companyName || 'Not provided'}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Tax ID</label>
              <div className={styles.detailValue}>{account.billing?.taxId || 'Not provided'}</div>
            </div>
            {account.billing?.nextBillingDate && (
              <div className={styles.detailItem}>
                <label>Next Billing Date</label>
                <div className={styles.detailValue}>
                  {new Date(account.billing.nextBillingDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
            {account.billing?.amount && (
              <div className={styles.detailItem}>
                <label>Billing Amount</label>
                <div className={styles.detailValue}>
                  {accountHelpers.formatCurrency(account.billing.amount, account.settings?.currency)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Address */}
        {account.billing?.address && Object.values(account.billing.address).some(value => value) && (
          <div className={styles.detailSection}>
            <h3>Billing Address</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>Street Address</label>
                <div className={styles.detailValue}>{account.billing.address.street || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>City</label>
                <div className={styles.detailValue}>{account.billing.address.city || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>State</label>
                <div className={styles.detailValue}>{account.billing.address.state || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>ZIP Code</label>
                <div className={styles.detailValue}>{account.billing.address.zipCode || 'Not provided'}</div>
              </div>
              <div className={styles.detailItem}>
                <label>Country</label>
                <div className={styles.detailValue}>{account.billing.address.country || 'Not provided'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className={styles.detailSection}>
          <h3>Account Settings</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Timezone</label>
              <div className={styles.detailValue}>{account.settings?.timezone || 'UTC'}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Currency</label>
              <div className={styles.detailValue}>{account.settings?.currency || 'USD'}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Date Format</label>
              <div className={styles.detailValue}>{account.settings?.dateFormat || 'MM/DD/YYYY'}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Language</label>
              <div className={styles.detailValue}>{account.settings?.language || 'English'}</div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        {!isLoadingStats && stats && (
          <div className={styles.detailSection}>
            <h3>Account Statistics</h3>
            <div className={styles.activityStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.totalUsers || 0}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.activeUsers || 0}</div>
                <div className={styles.statLabel}>Active Users</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.totalAgencies || 0}</div>
                <div className={styles.statLabel}>Total Agencies</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.activeAgencies || 0}</div>
                <div className={styles.statLabel}>Active Agencies</div>
              </div>
              {stats.monthlyRevenue && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {accountHelpers.formatCurrency(stats.monthlyRevenue, account.settings?.currency)}
                  </div>
                  <div className={styles.statLabel}>Monthly Revenue</div>
                </div>
              )}
              {stats.totalRevenue && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {accountHelpers.formatCurrency(stats.totalRevenue, account.settings?.currency)}
                  </div>
                  <div className={styles.statLabel}>Total Revenue</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete the account "{account.name}"? 
              This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className={`${styles.btn} ${styles.btnOutline}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className={`${styles.btn} ${styles.btnDanger}`}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AccountDetail;

// AI-NOTE: Created comprehensive AccountDetail component following UserDetail pattern but adapted for account-specific information including subscription plans, billing status, contact info, settings, and statistics with superadmin-only permissions.