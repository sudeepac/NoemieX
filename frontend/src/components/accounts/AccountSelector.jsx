import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetAccountQuery,
  useGetAccountStatsQuery
} from '../../store/api/api';
import { 
  ChevronDown, 
  Building2, 
  Users, 
  DollarSign, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { 
  SUBSCRIPTION_STATUSES,
  BILLING_STATUSES,
  accountHelpers 
} from '../../types/account.types';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './AccountSelector.module.css';

// AccountSelector component for account context display and basic account info
function AccountSelector({ onAccountChange, selectedView = 'overview' }) {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAccountView, setSelectedAccountView] = useState(selectedView);

  // RTK Query hooks - account admins can only access their own account
  const { 
    data: accountData, 
    isLoading, 
    isError, 
    error 
  } = useGetAccountQuery(currentUser?.accountId, { 
    skip: !currentUser?.accountId || currentUser?.portalType !== 'account' 
  });

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useGetAccountStatsQuery(currentUser?.accountId, {
    skip: !currentUser?.accountId || currentUser?.portalType !== 'account'
  });

  // Handle view change
  const handleViewChange = (view) => {
    setSelectedAccountView(view);
    setIsExpanded(false);
    if (onAccountChange) {
      onAccountChange(view);
    }
  };

  // Account view options for account admins
  const accountViews = [
    {
      id: 'overview',
      label: 'Account Overview',
      description: 'General account information and status',
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 'agencies',
      label: 'Agency Management',
      description: 'Manage partner agencies and relationships',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'billing',
      label: 'Billing & Subscription',
      description: 'View billing information and subscription details',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      id: 'settings',
      label: 'Account Settings',
      description: 'Configure account preferences and features',
      icon: <Calendar className="w-4 h-4" />
    }
  ];

  // Permission check - only account admins can use this component
  if (currentUser?.portalType !== 'account') {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`${styles.accountSelector} ${styles.loading}`}>
        <LoadingSpinner size="sm" />
        <span>Loading account...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`${styles.accountSelector} ${styles.error}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Error loading account</span>
      </div>
    );
  }

  const account = accountData?.data;
  const stats = statsData?.data;
  const currentView = accountViews.find(view => view.id === selectedAccountView);

  if (!account) {
    return (
      <div className={`${styles.accountSelector} ${styles.error}`}>
        <AlertCircle className="w-4 h-4" />
        <span>Account not found</span>
      </div>
    );
  }

  // Get status indicators
  const getStatusIcon = () => {
    if (account.subscription?.status === SUBSCRIPTION_STATUSES.ACTIVE) {
      return <CheckCircle className="w-4 h-4 text-success" />;
    } else if (account.subscription?.status === SUBSCRIPTION_STATUSES.TRIAL) {
      return <Clock className="w-4 h-4 text-warning" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-danger" />;
    }
  };

  const getBillingStatusColor = () => {
    switch (account.billing?.status) {
      case BILLING_STATUSES.CURRENT:
        return 'success';
      case BILLING_STATUSES.OVERDUE:
        return 'danger';
      case BILLING_STATUSES.SUSPENDED:
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className={styles.accountSelector}>
      {/* Account Context Header */}
      <div className={styles.accountContext}>
        <div className={styles.accountInfo}>
          <div className={styles.accountMain}>
            <div className={styles.accountName}>
              <Building2 className="w-5 h-5" />
              <span>{account.name}</span>
              {getStatusIcon()}
            </div>
            <div className={styles.accountMeta}>
              <span className={`${styles.subscriptionBadge} ${styles[account.subscription?.status]}`}>
                {accountHelpers.formatSubscriptionStatus(account.subscription?.status)}
              </span>
              <span className={`${styles.billingBadge} ${styles[getBillingStatusColor()]}`}>
                {accountHelpers.formatBillingStatus(account.billing?.status)}
              </span>
            </div>
          </div>
          
          {/* Quick Stats */}
          {!isLoadingStats && stats && (
            <div className={styles.accountStats}>
              <div className={styles.statItem}>
                <Users className="w-4 h-4" />
                <span>{stats.totalUsers || 0} Users</span>
              </div>
              <div className={styles.statItem}>
                <Building2 className="w-4 h-4" />
                <span>{stats.totalAgencies || 0} Agencies</span>
              </div>
              <div className={styles.statItem}>
                <DollarSign className="w-4 h-4" />
                <span>${accountHelpers.formatCurrency(stats.monthlyRevenue || 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Selector */}
      <div className={styles.viewSelector}>
        <button 
          className={styles.viewSelectorTrigger}
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <div className={styles.currentView}>
            {currentView?.icon}
            <span>{currentView?.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className={styles.viewDropdown}>
            {accountViews.map((view) => (
              <button
                key={view.id}
                className={`${styles.viewOption} ${selectedAccountView === view.id ? styles.active : ''}`}
                onClick={() => handleViewChange(view.id)}
              >
                <div className={styles.viewOptionContent}>
                  <div className={styles.viewOptionHeader}>
                    {view.icon}
                    <span className={styles.viewOptionLabel}>{view.label}</span>
                  </div>
                  <p className={styles.viewOptionDescription}>{view.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Account Alerts */}
      {account.subscription?.status === SUBSCRIPTION_STATUSES.TRIAL && (
        <div className={`${styles.accountAlert} ${styles.trial}`}>
          <Clock className="w-4 h-4" />
          <span>
            Trial expires {accountHelpers.formatDate(account.subscription?.trialEndDate)}
          </span>
        </div>
      )}

      {account.billing?.status === BILLING_STATUSES.OVERDUE && (
        <div className={`${styles.accountAlert} ${styles.overdue}`}>
          <AlertCircle className="w-4 h-4" />
          <span>
            Payment overdue - ${accountHelpers.formatCurrency(account.billing?.outstandingBalance || 0)}
          </span>
        </div>
      )}
    </div>
  );
}

export default AccountSelector;

// AI-NOTE: Created AccountSelector component for account portal context switching. Since account admins are restricted to their own account data only (per business rules), this component provides view switching within their account context rather than account switching. Includes account status, quick stats, view selection, and important alerts for trial/billing status.