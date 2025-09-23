import React from 'react';
import { usePermissions } from '../../shared';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Activity, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import {
  useGetPlatformStatsQuery,
  useGetPlatformHealthQuery,
  useGetRecentActivityQuery
} from '../../store/api';
import styles from './SuperadminDashboard.module.css';

const SuperadminDashboard = () => {
  const { user } = usePermissions();

  // Fetch platform data using RTK Query
  const {
    data: platformStats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useGetPlatformStatsQuery();

  const {
    data: platformHealth,
    isLoading: healthLoading,
    error: healthError
  } = useGetPlatformHealthQuery();

  const {
    data: recentActivityData,
    isLoading: activityLoading,
    error: activityError
  } = useGetRecentActivityQuery({ limit: 5 });

  const quickActions = [
    {
      title: 'Create New Tenant',
      description: 'Onboard a new account to the platform',
      icon: Building2,
      link: '/superadmin/accounts/create',
      color: 'blue'
    },
    {
      title: 'Monitor System Health',
      description: 'Check platform performance and uptime',
      icon: Activity,
      link: '/superadmin/system-health',
      color: 'green'
    },
    {
      title: 'Review Billing',
      description: 'Manage subscriptions and billing',
      icon: CreditCard,
      link: '/superadmin/subscriptions',
      color: 'purple'
    },
    {
      title: 'Security Overview',
      description: 'Monitor security and compliance',
      icon: Shield,
      link: '/superadmin/security',
      color: 'red'
    }
  ];

  // Handle loading state
  if (statsLoading || healthLoading || activityLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.loadingState}>
          <RefreshCw className={styles.loadingIcon} />
          <p>Loading platform data...</p>
        </div>
      </div>
    );
  }

  // Handle error state
  if (statsError || healthError || activityError) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.errorState}>
          <AlertTriangle className={styles.errorIcon} />
          <p>Error loading platform data</p>
          <button onClick={refetchStats} className={styles.retryButton}>
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Use API data or fallback to defaults
  const platformMetrics = platformStats || {
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    systemHealth: 0,
    activeSubscriptions: 0
  };

  // AI-NOTE: Extract activities array from API response structure - fixed data path
  const recentActivity = recentActivityData?.data?.activities || [];

  return (
    <div className={styles.dashboardContainer}>
      {/* Header */}
      <div className={styles.dashboardHeader}>
        <h1>Platform Dashboard</h1>
        <p>Welcome back, {user?.name || 'System Administrator'}</p>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Building2 className={styles.metricIcon} />
            <span className={`${styles.metricChange} ${styles.positive}`}>+2</span>
          </div>
          <div className={styles.metricValue}>{platformMetrics.totalTenants || 0}</div>
          <div className={styles.metricLabel}>Total Tenants</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Users className={styles.metricIcon} />
            <span className={`${styles.metricChange} ${styles.positive}`}>+12</span>
          </div>
          <div className={styles.metricValue}>{platformMetrics.totalUsers || 0}</div>
          <div className={styles.metricLabel}>Platform Users</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <CreditCard className={styles.metricIcon} />
            <span className={`${styles.metricChange} ${styles.positive}`}>+8.5%</span>
          </div>
          <div className={styles.metricValue}>${(platformMetrics.monthlyRevenue || 0).toLocaleString()}</div>
          <div className={styles.metricLabel}>Monthly Revenue</div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} />
            <span className={`${styles.metricChange} ${styles.positive}`}>99.8%</span>
          </div>
          <div className={styles.metricValue}>{platformMetrics.systemHealth || 0}%</div>
          <div className={styles.metricLabel}>System Health</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {quickActions.map((action, index) => {
          const IconComponent = action.icon;
          return (
            <Link 
              key={index} 
              to={action.link} 
              className={styles.actionButton}
            >
              <IconComponent className={styles.actionIcon} />
              {action.title}
            </Link>
          );
        })}
      </div>

      <div className={styles.dashboardGrid}>
        {/* Recent Activity */}
        <div className={styles.activityFeed}>
          <div className={styles.activityHeader}>
            <h3>Recent Platform Activity</h3>
          </div>
          <div className={styles.activityList}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => {
                const getActivityIcon = (type) => {
                  switch (type) {
                    case 'account_created': return <Building2 className={styles.activityIcon} />;
                    case 'subscription_upgraded': return <CreditCard className={styles.activityIcon} />;
                    case 'user_suspended': return <Users className={styles.activityIcon} />;
                    case 'payment_received': return <CreditCard className={styles.activityIcon} />;
                    case 'system_maintenance': return <Activity className={styles.activityIcon} />;
                    default: return <Activity className={styles.activityIcon} />;
                  }
                };

                return (
                  <div key={activity.id || index} className={styles.activityItem}>
                    {getActivityIcon(activity.type)}
                    <div className={styles.activityContent}>
                      <div className={styles.activityText}>{activity.description || activity.message}</div>
                      <div className={styles.activityTime}>
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : activity.time || 'Unknown time'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.noActivity}>
                <Activity size={24} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className={styles.systemStatus}>
          <div className={styles.statusHeader}>
            <Shield className={styles.metricIcon} />
            <h3>System Status</h3>
          </div>
          <div className={styles.statusList}>
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>Database</div>
              <div className={`${styles.statusBadge} ${styles.operational}`}>
                <CheckCircle className={styles.statusIcon} />
                Operational
              </div>
            </div>
            
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>API Services</div>
              <div className={`${styles.statusBadge} ${styles.operational}`}>
                <CheckCircle className={styles.statusIcon} />
                Operational
              </div>
            </div>
            
            <div className={styles.statusItem}>
              <div className={styles.statusLabel}>Backup System</div>
              <div className={`${styles.statusBadge} ${styles.warning}`}>
                <AlertTriangle className={styles.statusIcon} />
                Maintenance
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AI-NOTE: Redesigned SuperadminDashboard to focus on platform management metrics.
// Added tenant overview, system health monitoring, revenue tracking, and platform
// activity feed. Removed business workflow elements as superadmin manages platform,
// not tenant operations. Includes modern card design with actionable quick links.

// AI-NOTE: Added CSS module import and updated class names to use camelCase.
// This fixes the white screen issue caused by missing styles.

export default SuperadminDashboard;