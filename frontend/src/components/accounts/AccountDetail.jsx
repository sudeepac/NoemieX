import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useGetAccountQuery,
  useDeleteAccountMutation, 
  useToggleAccountStatusMutation,
  useGetAccountStatsQuery
} from '../../store/api';
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
  const { id: accountId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // AI-NOTE: Added validation for accountId to prevent ObjectId cast errors
  // Skip API calls if accountId is undefined or invalid
  const isValidAccountId = accountId && accountId !== 'undefined' && accountId.length === 24;

  // RTK Query hooks
  const { 
    data: accountData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAccountQuery(accountId, { skip: !isValidAccountId });

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useGetAccountStatsQuery(accountId, { skip: !isValidAccountId });

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

  // AI-NOTE: Added validation check for invalid accountId before loading/error states
  // Handle invalid accountId parameter
  if (!isValidAccountId) {
    return (
      <div className={styles.accountDetailContainer}>
        <ErrorMessage 
          error={{message: 'Invalid account ID provided'}} 
          variant="page" 
          type="error"
          title="Invalid Account"
        />
        <div className={styles.errorActions}>
          <button onClick={() => navigate('/superadmin/accounts')} className={`${styles.btn} ${styles.btnPrimary}`}>
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

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

  const account = accountData?.data?.account;
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
      {/* Simple Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <Link to="/superadmin/accounts" className={styles.breadcrumbLink}>Accounts</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{account.name}</span>
          </div>
          <h1 className={styles.accountTitle}>{account.name}</h1>
          <div className={styles.accountMeta}>
            <span className={`${styles.statusBadge} ${styles[accountHelpers.getSubscriptionStatusClass(account.subscription?.status)]}`}>
              <span className={styles.badgeIcon}>●</span>
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
            <Link to={`/superadmin/accounts/${account._id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
              <span className={styles.btnIcon}>✏️</span>
              Edit Account
            </Link>
          )}
          {canToggleStatus() && (
            <button 
              onClick={handleToggleStatus}
              className={`${styles.btn} ${account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? styles.btnWarning : styles.btnSuccess}`}
              disabled={isToggling}
            >
              <span className={styles.btnIcon}>
                {account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? '⏸️' : '▶️'}
              </span>
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
              <span className={styles.btnIcon}>🗑️</span>
              Delete Account
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Content Layout */}
      <div className={styles.contentLayout}>
        {/* Left Column - Main Information */}
        <div className={styles.leftColumn}>
          {/* Account Overview Card */}
          <div className={styles.overviewCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>📋 Account Overview</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.overviewGrid}>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewIcon}>👤</div>
                  <div className={styles.overviewDetails}>
                    <div className={styles.overviewLabel}>Account Name</div>
                    <div className={styles.overviewValue}>{account.name}</div>
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewIcon}>📧</div>
                  <div className={styles.overviewDetails}>
                    <div className={styles.overviewLabel}>Contact Email</div>
                    <div className={styles.overviewValue}>
                      {account.contactInfo?.email ? (
                        <a href={`mailto:${account.contactInfo.email}`} className={styles.emailLink}>
                          {account.contactInfo.email}
                        </a>
                      ) : (
                        <span className={styles.noData}>Not provided</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewIcon}>📞</div>
                  <div className={styles.overviewDetails}>
                    <div className={styles.overviewLabel}>Contact Phone</div>
                    <div className={styles.overviewValue}>
                      {account.contactInfo?.phone ? (
                        <a href={`tel:${account.contactInfo.phone}`} className={styles.phoneLink}>
                          {account.contactInfo.phone}
                        </a>
                      ) : (
                        <span className={styles.noData}>Not provided</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewIcon}>🆔</div>
                  <div className={styles.overviewDetails}>
                    <div className={styles.overviewLabel}>Account ID</div>
                    <div className={`${styles.overviewValue} ${styles.accountId}`}>
                      {account._id}
                    </div>
                  </div>
                </div>
                <div className={styles.overviewItem}>
                  <div className={styles.overviewIcon}>📅</div>
                  <div className={styles.overviewDetails}>
                    <div className={styles.overviewLabel}>Created</div>
                    <div className={styles.overviewValue}>
                      {new Date(account.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                {account.updatedAt && account.updatedAt !== account.createdAt && (
                  <div className={styles.overviewItem}>
                    <div className={styles.overviewIcon}>🔄</div>
                    <div className={styles.overviewDetails}>
                      <div className={styles.overviewLabel}>Last Updated</div>
                      <div className={styles.overviewValue}>
                        {new Date(account.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Address Card */}
          {account.contactInfo?.address && Object.values(account.contactInfo.address).some(value => value) && (
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📍 Contact Address</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.addressDisplay}>
                  <div className={styles.addressLine}>
                    {account.contactInfo.address.street || 'Street not provided'}
                  </div>
                  <div className={styles.addressLine}>
                    {[account.contactInfo.address.city, account.contactInfo.address.state, account.contactInfo.address.zipCode]
                      .filter(Boolean).join(', ') || 'City, State, ZIP not provided'}
                  </div>
                  <div className={styles.addressLine}>
                    {account.contactInfo.address.country || 'Country not provided'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription Details Card */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>💳 Subscription Details</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.subscriptionGrid}>
                <div className={styles.subscriptionHighlight}>
                  <div className={styles.planDisplay}>
                    <span className={`${styles.planBadge} ${styles[`plan${account.subscription?.plan}`]}`}>
                      {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
                    </span>
                    <span className={`${styles.statusBadge} ${styles[accountHelpers.getSubscriptionStatusClass(account.subscription?.status)]}`}>
                      <span className={styles.badgeIcon}>●</span>
                      {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
                    </span>
                  </div>
                </div>
                
                <div className={styles.subscriptionDetails}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>🔄 Billing Cycle:</span>
                    <span className={styles.detailValue}>
                      {account.subscription?.billingCycle ? 
                        account.subscription.billingCycle.charAt(0).toUpperCase() + account.subscription.billingCycle.slice(1) :
                        'Not set'
                      }
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>👥 Max Users:</span>
                    <span className={styles.detailValue}>{account.subscription?.maxUsers || 'Unlimited'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>🏢 Max Agencies:</span>
                    <span className={styles.detailValue}>{account.subscription?.maxAgencies || 'Unlimited'}</span>
                  </div>
                  {accountHelpers.isTrialAccount(account) && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>⏰ Trial Ends:</span>
                      <span className={styles.detailValue}>
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
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Billing Information Card */}
          <div className={styles.detailCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>💰 Billing Information</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.billingHeader}>
                <span className={`${styles.billingBadge} ${styles[accountHelpers.getBillingStatusClass(account.billing?.status)]}`}>
                  {accountHelpers.getBillingStatusText(account.billing?.status)}
                </span>
                {account.billing?.amount && (
                  <div className={styles.billingAmount}>
                    {accountHelpers.formatCurrency(account.billing.amount, account.settings?.currency)}
                    <span className={styles.billingCycle}>/{account.subscription?.billingCycle || 'month'}</span>
                  </div>
                )}
              </div>
              
              <div className={styles.billingDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>🏢 Company:</span>
                  <span className={styles.detailValue}>{account.billing?.companyName || 'Not provided'}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>🆔 Tax ID:</span>
                  <span className={styles.detailValue}>{account.billing?.taxId || 'Not provided'}</span>
                </div>
                {account.billing?.nextBillingDate && (
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>📅 Next Billing:</span>
                    <span className={styles.detailValue}>
                      {new Date(account.billing.nextBillingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address Card */}
          {account.billing?.address && Object.values(account.billing.address).some(value => value) && (
            <div className={styles.detailCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🏠 Billing Address</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.addressDisplay}>
                  <div className={styles.addressLine}>
                    {account.billing.address.street || 'Street not provided'}
                  </div>
                  <div className={styles.addressLine}>
                    {[account.billing.address.city, account.billing.address.state, account.billing.address.zipCode]
                      .filter(Boolean).join(', ') || 'City, State, ZIP not provided'}
                  </div>
                  <div className={styles.addressLine}>
                    {account.billing.address.country || 'Country not provided'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Column - Statistics and Settings */}
        <div className={styles.rightColumn}>

          {/* Account Settings Card */}
          <div className={styles.settingsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>⚙️ Account Settings</h3>
            </div>
            <div className={styles.cardContent}>
              <div className={styles.settingsGrid}>
                <div className={styles.settingItem}>
                  <div className={styles.settingIcon}>🌍</div>
                  <div className={styles.settingDetails}>
                    <div className={styles.settingLabel}>Timezone</div>
                    <div className={styles.settingValue}>{account.settings?.timezone || 'UTC'}</div>
                  </div>
                </div>
                <div className={styles.settingItem}>
                  <div className={styles.settingIcon}>💱</div>
                  <div className={styles.settingDetails}>
                    <div className={styles.settingLabel}>Currency</div>
                    <div className={styles.settingValue}>{account.settings?.currency || 'USD'}</div>
                  </div>
                </div>
                <div className={styles.settingItem}>
                  <div className={styles.settingIcon}>📅</div>
                  <div className={styles.settingDetails}>
                    <div className={styles.settingLabel}>Date Format</div>
                    <div className={styles.settingValue}>{account.settings?.dateFormat || 'MM/DD/YYYY'}</div>
                  </div>
                </div>
                <div className={styles.settingItem}>
                  <div className={styles.settingIcon}>🗣️</div>
                  <div className={styles.settingDetails}>
                    <div className={styles.settingLabel}>Language</div>
                    <div className={styles.settingValue}>{account.settings?.language || 'English'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics Card */}
          {!isLoadingStats && stats && (
            <div className={styles.statsCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>📊 Account Statistics</h3>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{stats.totalUsers || 0}</div>
                      <div className={styles.statLabel}>Total Users</div>
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{stats.activeUsers || 0}</div>
                      <div className={styles.statLabel}>Active Users</div>
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>🏢</div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{stats.totalAgencies || 0}</div>
                      <div className={styles.statLabel}>Total Agencies</div>
                    </div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statIcon}>🟢</div>
                    <div className={styles.statContent}>
                      <div className={styles.statValue}>{stats.activeAgencies || 0}</div>
                      <div className={styles.statLabel}>Active Agencies</div>
                    </div>
                  </div>
                  {stats.monthlyRevenue && (
                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>💰</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>
                          {accountHelpers.formatCurrency(stats.monthlyRevenue, account.settings?.currency)}
                        </div>
                        <div className={styles.statLabel}>Monthly Revenue</div>
                      </div>
                    </div>
                  )}
                  {stats.totalRevenue && (
                    <div className={styles.statItem}>
                      <div className={styles.statIcon}>💎</div>
                      <div className={styles.statContent}>
                        <div className={styles.statValue}>
                          {accountHelpers.formatCurrency(stats.totalRevenue, account.settings?.currency)}
                        </div>
                        <div className={styles.statLabel}>Total Revenue</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
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

// AI-NOTE: Redesigned AccountDetail component with modern card-based layout, enhanced visual hierarchy, improved data presentation with icons and better spacing, and responsive two-column design for better user experience.