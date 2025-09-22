import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useGetAccountQuery,
  useDeleteAccountMutation, 
  useToggleAccountStatusMutation,
  useGetAccountStatsQuery
} from '../../store/api/accounts.api';
import { 
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_STATUSES,
  accountHelpers 
} from '../../types/account.types';
import LoadingSpinner from '../common/loading-spinner.component';
import './AccountDetail.css';

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
      <div className="account-detail-container">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="account-detail-container">
        <div className="error-container">
          <h3>Error Loading Account</h3>
          <p>{error?.data?.message || 'Failed to load account details'}</p>
          <div className="error-actions">
            <button onClick={() => refetch()} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/accounts" className="btn btn-outline">
              Back to Accounts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const account = accountData?.data;
  const stats = statsData?.data;

  if (!account) {
    return (
      <div className="account-detail-container">
        <div className="error-container">
          <h3>Account Not Found</h3>
          <p>The requested account could not be found.</p>
          <div className="error-actions">
            <Link to="/accounts" className="btn btn-primary">
              Back to Accounts
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-detail-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <Link to="/accounts" className="breadcrumb-link">Accounts</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{account.name}</span>
          </div>
          <h1>{account.name}</h1>
          <div className="account-meta">
            <span className={`status-badge ${account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? 'active' : 'inactive'}`}>
              {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
            </span>
            <span className={`plan-badge plan-${account.subscription?.plan}`}>
              {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
            </span>
            <span className={`billing-badge ${accountHelpers.getBillingStatusClass(account.billing?.status)}`}>
              {accountHelpers.getBillingStatusText(account.billing?.status)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {canEditAccount() && (
            <Link to={`/accounts/${account._id}/edit`} className="btn btn-primary">
              Edit Account
            </Link>
          )}
          {canToggleStatus() && (
            <button 
              onClick={handleToggleStatus}
              className={`btn ${account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE ? 'btn-warning' : 'btn-success'}`}
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
              className="btn btn-danger"
              disabled={isDeleting}
            >
              Delete Account
            </button>
          )}
        </div>
      </div>

      <div className="account-detail-content">
        {/* Basic Information */}
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Account Name</label>
              <div className="detail-value">{account.name}</div>
            </div>
            <div className="detail-item">
              <label>Contact Email</label>
              <div className="detail-value">
                <a href={`mailto:${account.contactInfo?.email}`} className="email-link">
                  {account.contactInfo?.email}
                </a>
              </div>
            </div>
            <div className="detail-item">
              <label>Contact Phone</label>
              <div className="detail-value">
                {account.contactInfo?.phone ? (
                  <a href={`tel:${account.contactInfo.phone}`} className="phone-link">
                    {account.contactInfo.phone}
                  </a>
                ) : (
                  <span className="no-data">Not provided</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <label>Account ID</label>
              <div className="detail-value account-id">
                {account._id}
              </div>
            </div>
            <div className="detail-item">
              <label>Created</label>
              <div className="detail-value">
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
              <div className="detail-item">
                <label>Last Updated</label>
                <div className="detail-value">
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
          <div className="detail-section">
            <h3>Contact Address</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Street Address</label>
                <div className="detail-value">{account.contactInfo.address.street || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>City</label>
                <div className="detail-value">{account.contactInfo.address.city || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>State</label>
                <div className="detail-value">{account.contactInfo.address.state || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>ZIP Code</label>
                <div className="detail-value">{account.contactInfo.address.zipCode || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>Country</label>
                <div className="detail-value">{account.contactInfo.address.country || 'Not provided'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details */}
        <div className="detail-section">
          <h3>Subscription Details</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Plan</label>
              <div className="detail-value">
                <span className={`plan-badge plan-${account.subscription?.plan}`}>
                  {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <div className="detail-value">
                <span className={`status-badge ${accountHelpers.getSubscriptionStatusClass(account.subscription?.status)}`}>
                  {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Billing Cycle</label>
              <div className="detail-value">
                {account.subscription?.billingCycle ? 
                  account.subscription.billingCycle.charAt(0).toUpperCase() + account.subscription.billingCycle.slice(1) :
                  'Not set'
                }
              </div>
            </div>
            <div className="detail-item">
              <label>Max Users</label>
              <div className="detail-value">{account.subscription?.maxUsers || 'Unlimited'}</div>
            </div>
            <div className="detail-item">
              <label>Max Agencies</label>
              <div className="detail-value">{account.subscription?.maxAgencies || 'Unlimited'}</div>
            </div>
            {accountHelpers.isTrialAccount(account) && (
              <div className="detail-item">
                <label>Trial Ends</label>
                <div className="detail-value">
                  {account.subscription?.trialEndDate ? (
                    <span className={accountHelpers.isTrialExpired(account) ? 'trial-expired' : 'trial-active'}>
                      {new Date(account.subscription.trialEndDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {!accountHelpers.isTrialExpired(account) && (
                        <span className="trial-days"> ({accountHelpers.getTrialDaysRemaining(account)} days left)</span>
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
        <div className="detail-section">
          <h3>Billing Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Billing Status</label>
              <div className="detail-value">
                <span className={`billing-badge ${accountHelpers.getBillingStatusClass(account.billing?.status)}`}>
                  {accountHelpers.getBillingStatusText(account.billing?.status)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Company Name</label>
              <div className="detail-value">{account.billing?.companyName || 'Not provided'}</div>
            </div>
            <div className="detail-item">
              <label>Tax ID</label>
              <div className="detail-value">{account.billing?.taxId || 'Not provided'}</div>
            </div>
            {account.billing?.nextBillingDate && (
              <div className="detail-item">
                <label>Next Billing Date</label>
                <div className="detail-value">
                  {new Date(account.billing.nextBillingDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}
            {account.billing?.amount && (
              <div className="detail-item">
                <label>Billing Amount</label>
                <div className="detail-value">
                  {accountHelpers.formatCurrency(account.billing.amount, account.settings?.currency)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Billing Address */}
        {account.billing?.address && Object.values(account.billing.address).some(value => value) && (
          <div className="detail-section">
            <h3>Billing Address</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Street Address</label>
                <div className="detail-value">{account.billing.address.street || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>City</label>
                <div className="detail-value">{account.billing.address.city || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>State</label>
                <div className="detail-value">{account.billing.address.state || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>ZIP Code</label>
                <div className="detail-value">{account.billing.address.zipCode || 'Not provided'}</div>
              </div>
              <div className="detail-item">
                <label>Country</label>
                <div className="detail-value">{account.billing.address.country || 'Not provided'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="detail-section">
          <h3>Account Settings</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Timezone</label>
              <div className="detail-value">{account.settings?.timezone || 'UTC'}</div>
            </div>
            <div className="detail-item">
              <label>Currency</label>
              <div className="detail-value">{account.settings?.currency || 'USD'}</div>
            </div>
            <div className="detail-item">
              <label>Date Format</label>
              <div className="detail-value">{account.settings?.dateFormat || 'MM/DD/YYYY'}</div>
            </div>
            <div className="detail-item">
              <label>Language</label>
              <div className="detail-value">{account.settings?.language || 'English'}</div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        {!isLoadingStats && stats && (
          <div className="detail-section">
            <h3>Account Statistics</h3>
            <div className="activity-stats">
              <div className="stat-item">
                <div className="stat-value">{stats.totalUsers || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.activeUsers || 0}</div>
                <div className="stat-label">Active Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.totalAgencies || 0}</div>
                <div className="stat-label">Total Agencies</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.activeAgencies || 0}</div>
                <div className="stat-label">Active Agencies</div>
              </div>
              {stats.monthlyRevenue && (
                <div className="stat-item">
                  <div className="stat-value">
                    {accountHelpers.formatCurrency(stats.monthlyRevenue, account.settings?.currency)}
                  </div>
                  <div className="stat-label">Monthly Revenue</div>
                </div>
              )}
              {stats.totalRevenue && (
                <div className="stat-item">
                  <div className="stat-value">
                    {accountHelpers.formatCurrency(stats.totalRevenue, account.settings?.currency)}
                  </div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p>
              Are you sure you want to delete the account "{account.name}"? 
              This action cannot be undone and will permanently remove all associated data.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteAccount}
                className="btn btn-danger"
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