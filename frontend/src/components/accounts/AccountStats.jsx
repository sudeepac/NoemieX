import React from 'react';
import { 
  Users, 
  Building2, 
  CreditCard, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { accountHelpers } from '../../types/account.types';
import ErrorMessage from '../../shared/components/ErrorMessage';
import styles from './AccountStats.module.css';

/**
 * AccountStats Component
 * 
 * Displays comprehensive statistics for an account including:
 * - User and agency counts
 * - Subscription and billing information
 * - Activity metrics and trends
 * - Trial and payment status
 * 
 * @param {Object} props
 * @param {Object} props.account - Account object with statistics
 * @param {Object} props.stats - Additional statistics object
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error state
 */
const AccountStats = ({ account, stats, loading, error }) => {
  if (loading) {
    return (
      <div className={styles.accountStatsContainer}>
        <div className={styles.statsLoading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading account statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.accountStatsContainer}>
        <div className={styles.statsError}>
          <AlertTriangle className="w-6 h-6" />
          <p>Failed to load account statistics</p>
          <ErrorMessage error={error} variant="inline" type="error" />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className={styles.accountStatsContainer}>
        <div className={styles.statsEmpty}>
          <Building2 className="w-12 h-12" />
          <p>No account data available</p>
        </div>
      </div>
    );
  }

  // Calculate derived statistics
  const totalUsers = stats?.totalUsers || account.userCount || 0;
  const totalAgencies = stats?.totalAgencies || account.agencyCount || 0;
  const monthlyRevenue = stats?.monthlyRevenue || account.monthlyRevenue || 0;
  const activeOffers = stats?.activeOffers || account.activeOffers || 0;
  
  // Calculate trends (mock data for now - would come from API)
  const userTrend = stats?.userTrend || '+12';
  const agencyTrend = stats?.agencyTrend || '+3';
  const revenueTrend = stats?.revenueTrend || '+8%';
  const offersTrend = stats?.offersTrend || '+15';

  // Trial and billing calculations
  const isTrialAccount = account.subscriptionStatus === 'trial';
  const trialDaysLeft = isTrialAccount ? accountHelpers.getTrialDaysRemaining(account) : 0;
  const isPaymentOverdue = account.billingStatus === 'overdue';
  const nextBillingDate = account.nextBillingDate;

  const mainStats = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: userTrend,
      trend: userTrend.startsWith('+') ? 'up' : 'down',
      icon: <Users className="w-6 h-6" />,
      color: 'primary',
      description: 'Active users in account'
    },
    {
      title: 'Partner Agencies',
      value: totalAgencies.toLocaleString(),
      change: agencyTrend,
      trend: agencyTrend.startsWith('+') ? 'up' : 'down',
      icon: <Building2 className="w-6 h-6" />,
      color: 'success',
      description: 'Connected recruitment agencies'
    },
    {
      title: 'Monthly Revenue',
      value: accountHelpers.formatCurrency(monthlyRevenue, account.currency),
      change: revenueTrend,
      trend: revenueTrend.startsWith('+') ? 'up' : 'down',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'info',
      description: 'Current month revenue'
    },
    {
      title: 'Active Offers',
      value: activeOffers.toLocaleString(),
      change: offersTrend,
      trend: offersTrend.startsWith('+') ? 'up' : 'down',
      icon: <Activity className="w-6 h-6" />,
      color: 'warning',
      description: 'Pending offer letters'
    }
  ];

  const subscriptionStats = [
    {
      label: 'Subscription Plan',
      value: accountHelpers.getSubscriptionPlanDisplayText(account.subscriptionPlan),
      status: account.subscriptionStatus === 'active' ? 'good' : 'warning'
    },
    {
      label: 'Billing Status',
      value: accountHelpers.getBillingStatusDisplayText(account.billingStatus),
      status: isPaymentOverdue ? 'error' : 'good'
    },
    {
      label: 'Billing Cycle',
      value: accountHelpers.getBillingCycleDisplayText(account.billingCycle),
      status: 'neutral'
    },
    {
      label: isTrialAccount ? 'Trial Days Left' : 'Next Billing',
      value: isTrialAccount ? 
        `${trialDaysLeft} days` : 
        (nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : 'N/A'),
      status: isTrialAccount && trialDaysLeft <= 7 ? 'warning' : 'good'
    }
  ];

  return (
    <div className={styles.accountStatsContainer}>
      {/* Main Statistics Grid */}
      <div className={styles.statsGrid}>
        {mainStats.map((stat, index) => (
          <div key={index} className={`${styles.statCard} ${styles[stat.color]}`}>
            <div className={styles.statIcon}>
              {stat.icon}
            </div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statTitle}>{stat.title}</div>
              <div className={`${styles.statChange} ${styles[stat.trend]}`}>
                {stat.trend === 'up' ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                {stat.change}
              </div>
            </div>
            <div className={styles.statDescription}>{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Subscription & Billing Information */}
      <div className={styles.subscriptionStats}>
        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3>Subscription & Billing</h3>
            <CreditCard className="w-5 h-5" />
          </div>
          <div className={styles.metricsList}>
            {subscriptionStats.map((metric, index) => (
              <div key={index} className={styles.metricItem}>
                <div className={styles.metricInfo}>
                  <span className={styles.metricLabel}>{metric.label}</span>
                  <span className={`${styles.metricValue} ${styles[metric.status]}`}>
                    {metric.value}
                  </span>
                </div>
                <div className={styles.metricIndicator}>
                  <div className={`${styles.indicatorDot} ${styles[metric.status]}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Account Activity Summary */}
        <div className={styles.statsCard}>
          <div className={styles.cardHeader}>
            <h3>Account Activity</h3>
            <Activity className="w-5 h-5" />
          </div>
          <div className={styles.activitySummary}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <Clock className="w-4 h-4" />
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityLabel}>Last Login</span>
                <span className={styles.activityValue}>
                  {account.lastLoginAt ? 
                    new Date(account.lastLoginAt).toLocaleDateString() : 
                    'Never'
                  }
                </span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityLabel}>Account Created</span>
                <span className={styles.activityValue}>
                  {new Date(account.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>
                <Calendar className="w-4 h-4" />
              </div>
              <div className={styles.activityContent}>
                <span className={styles.activityLabel}>Last Updated</span>
                <span className={styles.activityValue}>
                  {new Date(account.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trial Warning (if applicable) */}
      {isTrialAccount && trialDaysLeft <= 7 && (
        <div className={styles.trialWarning}>
          <div className={styles.warningContent}>
            <AlertTriangle className="w-5 h-5" />
            <div className={styles.warningText}>
              <h4>Trial Expiring Soon</h4>
              <p>
                This account's trial period expires in {trialDaysLeft} days. 
                Please upgrade to continue using the platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Overdue Warning */}
      {isPaymentOverdue && (
        <div className={styles.paymentWarning}>
          <div className={styles.warningContent}>
            <CreditCard className="w-5 h-5" />
            <div className={styles.warningText}>
              <h4>Payment Overdue</h4>
              <p>
                This account has overdue payments. Please update billing information 
                to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountStats;

// AI-NOTE: Created comprehensive AccountStats component with main statistics grid, subscription/billing metrics, activity summary, and warning alerts for trial expiration and payment issues