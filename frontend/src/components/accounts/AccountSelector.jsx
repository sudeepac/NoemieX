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
import LoadingSpinner from '../common/loading-spinner.component';
import './AccountSelector.css';

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
      <div className="account-selector loading">
        <LoadingSpinner size="sm" />
        <span>Loading account...</span>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="account-selector error">
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
      <div className="account-selector error">
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
    <div className="account-selector">
      {/* Account Context Header */}
      <div className="account-context">
        <div className="account-info">
          <div className="account-main">
            <div className="account-name">
              <Building2 className="w-5 h-5" />
              <span>{account.name}</span>
              {getStatusIcon()}
            </div>
            <div className="account-meta">
              <span className={`subscription-badge ${account.subscription?.status}`}>
                {accountHelpers.formatSubscriptionStatus(account.subscription?.status)}
              </span>
              <span className={`billing-badge ${getBillingStatusColor()}`}>
                {accountHelpers.formatBillingStatus(account.billing?.status)}
              </span>
            </div>
          </div>
          
          {/* Quick Stats */}
          {!isLoadingStats && stats && (
            <div className="account-stats">
              <div className="stat-item">
                <Users className="w-4 h-4" />
                <span>{stats.totalUsers || 0} Users</span>
              </div>
              <div className="stat-item">
                <Building2 className="w-4 h-4" />
                <span>{stats.totalAgencies || 0} Agencies</span>
              </div>
              <div className="stat-item">
                <DollarSign className="w-4 h-4" />
                <span>${accountHelpers.formatCurrency(stats.monthlyRevenue || 0)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Selector */}
      <div className="view-selector">
        <button 
          className="view-selector-trigger"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <div className="current-view">
            {currentView?.icon}
            <span>{currentView?.label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>

        {isExpanded && (
          <div className="view-dropdown">
            {accountViews.map((view) => (
              <button
                key={view.id}
                className={`view-option ${selectedAccountView === view.id ? 'active' : ''}`}
                onClick={() => handleViewChange(view.id)}
              >
                <div className="view-option-content">
                  <div className="view-option-header">
                    {view.icon}
                    <span className="view-option-label">{view.label}</span>
                  </div>
                  <p className="view-option-description">{view.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Account Alerts */}
      {account.subscription?.status === SUBSCRIPTION_STATUSES.TRIAL && (
        <div className="account-alert trial">
          <Clock className="w-4 h-4" />
          <span>
            Trial expires {accountHelpers.formatDate(account.subscription?.trialEndDate)}
          </span>
        </div>
      )}

      {account.billing?.status === BILLING_STATUSES.OVERDUE && (
        <div className="account-alert overdue">
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