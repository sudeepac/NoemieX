import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Zap
} from 'lucide-react';
import {
  useGetPlatformStatsQuery,
  useGetSystemMetricsQuery,
  useGetBillingOverviewQuery,
  useGetSubscriptionAnalyticsQuery,
  useGetRecentActivityQuery,
  useExportPlatformDataMutation
} from '../../store/api/superadminApi';
import styles from '../../styles/pages/PlatformAnalytics.module.css';

/**
 * Platform Analytics Page for SuperAdmin Portal
 * Provides comprehensive analytics, reporting, and insights across the entire platform
 */
const PlatformAnalytics = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [exportLoading, setExportLoading] = useState(false);

  // API queries
  const { 
    data: platformStats, 
    isLoading: statsLoading, 
    refetch: refetchStats 
  } = useGetPlatformStatsQuery();
  
  const { 
    data: systemMetrics, 
    isLoading: metricsLoading 
  } = useGetSystemMetricsQuery(selectedTimeframe);
  
  const { 
    data: billingOverview, 
    isLoading: billingLoading 
  } = useGetBillingOverviewQuery({ period: selectedTimeframe });
  
  const { 
    data: subscriptionAnalytics, 
    isLoading: subscriptionLoading 
  } = useGetSubscriptionAnalyticsQuery();
  
  const { 
    data: recentActivity, 
    isLoading: activityLoading 
  } = useGetRecentActivityQuery({ limit: 50 });
  
  const [exportPlatformData] = useExportPlatformDataMutation();

  // Handle data export
  const handleExportData = async (format = 'csv') => {
    try {
      setExportLoading(true);
      const exportConfig = {
        format,
        timeframe: selectedTimeframe,
        includeMetrics: true,
        includeBilling: true,
        includeActivity: true
      };
      
      await exportPlatformData(exportConfig).unwrap();
      // Note: In a real implementation, this would trigger a download
      alert(`Analytics data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };



  // Timeframe options
  const timeframeOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & Accounts', icon: Users },
    { id: 'revenue', label: 'Revenue & Billing', icon: DollarSign },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'activity', label: 'Activity Log', icon: Activity }
  ];

  // Loading state
  if (statsLoading && metricsLoading && billingLoading) {
    return (
      <div className={styles.analyticsContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}>
            <RefreshCw className={styles.spinIcon} />
            <span>Loading analytics data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analyticsContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Platform Analytics</h1>
          <p className={styles.pageDescription}>
            Comprehensive insights and reporting across the entire platform
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.timeframeSelector}>
            <Calendar className={styles.selectorIcon} />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className={styles.timeframeSelect}
            >
              {timeframeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            className={styles.refreshButton}
            onClick={refetchStats}
            disabled={statsLoading}
          >
            <RefreshCw className={`${styles.buttonIcon} ${statsLoading ? styles.spinning : ''}`} />
            Refresh
          </button>
          
          <button 
            className={styles.exportButton}
            onClick={() => handleExportData('csv')}
            disabled={exportLoading}
          >
            <Download className={styles.buttonIcon} />
            {exportLoading ? 'Exporting...' : 'Export Data'}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map(tab => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <IconComponent className={styles.tabIcon} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'overview' && (
          <OverviewTab 
            platformStats={platformStats}
            systemMetrics={systemMetrics}
            billingOverview={billingOverview}
            timeframe={selectedTimeframe}
            loading={statsLoading || metricsLoading || billingLoading}
          />
        )}
        
        {activeTab === 'users' && (
          <UsersTab 
            platformStats={platformStats}
            systemMetrics={systemMetrics}
            timeframe={selectedTimeframe}
            loading={statsLoading || metricsLoading}
          />
        )}
        
        {activeTab === 'revenue' && (
          <RevenueTab 
            billingOverview={billingOverview}
            subscriptionAnalytics={subscriptionAnalytics}
            timeframe={selectedTimeframe}
            loading={billingLoading || subscriptionLoading}
          />
        )}
        
        {activeTab === 'performance' && (
          <PerformanceTab 
            systemMetrics={systemMetrics}
            timeframe={selectedTimeframe}
            loading={metricsLoading}
          />
        )}
        
        {activeTab === 'activity' && (
          <ActivityTab 
            recentActivity={recentActivity}
            loading={activityLoading}
          />
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ platformStats, systemMetrics, billingOverview, timeframe, loading }) => {
  const stats = platformStats || {};
  const metrics = systemMetrics || {};
  const billing = billingOverview || {};

  if (loading) {
    return (
      <div className={styles.tabLoading}>
        <RefreshCw className={styles.spinIcon} />
        <span>Loading overview data...</span>
      </div>
    );
  }

  return (
    <div className={styles.overviewTab}>
      {/* Key Metrics Grid */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Building2 className={styles.metricIcon} />
            <span className={styles.metricLabel}>Total Accounts</span>
          </div>
          <div className={styles.metricValue}>{stats.totalAccounts || 0}</div>
          <div className={`${styles.metricChange} ${styles.positive}`}>
            <TrendingUp className={styles.changeIcon} />
            +{stats.accountGrowth || 0}% vs last period
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Users className={styles.metricIcon} />
            <span className={styles.metricLabel}>Active Users</span>
          </div>
          <div className={styles.metricValue}>{stats.activeUsers || 0}</div>
          <div className={`${styles.metricChange} ${stats.userGrowth >= 0 ? styles.positive : styles.negative}`}>
            {stats.userGrowth >= 0 ? <TrendingUp className={styles.changeIcon} /> : <TrendingDown className={styles.changeIcon} />}
            {stats.userGrowth >= 0 ? '+' : ''}{stats.userGrowth || 0}% vs last period
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <DollarSign className={styles.metricIcon} />
            <span className={styles.metricLabel}>Monthly Revenue</span>
          </div>
          <div className={styles.metricValue}>${(billing.totalRevenue || 0).toLocaleString()}</div>
          <div className={`${styles.metricChange} ${billing.revenueGrowth >= 0 ? styles.positive : styles.negative}`}>
            {billing.revenueGrowth >= 0 ? <TrendingUp className={styles.changeIcon} /> : <TrendingDown className={styles.changeIcon} />}
            {billing.revenueGrowth >= 0 ? '+' : ''}{billing.revenueGrowth || 0}% vs last period
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <div className={styles.metricHeader}>
            <Server className={styles.metricIcon} />
            <span className={styles.metricLabel}>System Health</span>
          </div>
          <div className={styles.metricValue}>{metrics.healthScore || 0}%</div>
          <div className={`${styles.metricChange} ${metrics.healthScore >= 95 ? styles.positive : styles.warning}`}>
            <CheckCircle className={styles.changeIcon} />
            {metrics.healthScore >= 95 ? 'Excellent' : metrics.healthScore >= 80 ? 'Good' : 'Needs Attention'}
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Platform Growth Trend</h3>
            <span className={styles.chartPeriod}>Last {timeframe}</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <BarChart3 className={styles.chartIcon} />
            <p>Growth trend visualization would be displayed here</p>
            <small>Accounts: {stats.totalAccounts || 0} | Users: {stats.activeUsers || 0}</small>
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Revenue Analytics</h3>
            <span className={styles.chartPeriod}>Last {timeframe}</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <DollarSign className={styles.chartIcon} />
            <p>Revenue breakdown and trends</p>
            <small>Total: ${(billing.totalRevenue || 0).toLocaleString()} | Growth: {billing.revenueGrowth || 0}%</small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Users Tab Component
const UsersTab = ({ platformStats, systemMetrics, timeframe, loading }) => {
  const stats = platformStats || {};
  
  if (loading) {
    return (
      <div className={styles.tabLoading}>
        <RefreshCw className={styles.spinIcon} />
        <span>Loading user analytics...</span>
      </div>
    );
  }

  return (
    <div className={styles.usersTab}>
      <div className={styles.userMetricsGrid}>
        <div className={styles.userMetricCard}>
          <div className={styles.metricHeader}>
            <Users className={styles.metricIcon} />
            <span className={styles.metricLabel}>Total Users</span>
          </div>
          <div className={styles.metricValue}>{stats.totalUsers || 0}</div>
          <div className={styles.metricDetails}>
            <span>Active: {stats.activeUsers || 0}</span>
            <span>Inactive: {(stats.totalUsers || 0) - (stats.activeUsers || 0)}</span>
          </div>
        </div>
        
        <div className={styles.userMetricCard}>
          <div className={styles.metricHeader}>
            <Building2 className={styles.metricIcon} />
            <span className={styles.metricLabel}>Account Distribution</span>
          </div>
          <div className={styles.metricValue}>{stats.totalAccounts || 0}</div>
          <div className={styles.metricDetails}>
            <span>Active: {stats.activeAccounts || 0}</span>
            <span>Trial: {stats.trialAccounts || 0}</span>
          </div>
        </div>
        
        <div className={styles.userMetricCard}>
          <div className={styles.metricHeader}>
            <Activity className={styles.metricIcon} />
            <span className={styles.metricLabel}>User Engagement</span>
          </div>
          <div className={styles.metricValue}>{stats.engagementRate || 0}%</div>
          <div className={styles.metricDetails}>
            <span>Daily Active: {stats.dailyActiveUsers || 0}</span>
            <span>Weekly Active: {stats.weeklyActiveUsers || 0}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.userChartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>User Growth Over Time</h3>
            <span className={styles.chartPeriod}>Last {timeframe}</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <TrendingUp className={styles.chartIcon} />
            <p>User registration and activation trends</p>
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Account Type Distribution</h3>
            <span className={styles.chartPeriod}>Current</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <Building2 className={styles.chartIcon} />
            <p>Breakdown by account types and subscription levels</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Revenue Tab Component
const RevenueTab = ({ billingOverview, subscriptionAnalytics, timeframe, loading }) => {
  const billing = billingOverview || {};
  const subscriptions = subscriptionAnalytics || {};
  
  if (loading) {
    return (
      <div className={styles.tabLoading}>
        <RefreshCw className={styles.spinIcon} />
        <span>Loading revenue analytics...</span>
      </div>
    );
  }

  return (
    <div className={styles.revenueTab}>
      <div className={styles.revenueMetricsGrid}>
        <div className={styles.revenueMetricCard}>
          <div className={styles.metricHeader}>
            <DollarSign className={styles.metricIcon} />
            <span className={styles.metricLabel}>Total Revenue</span>
          </div>
          <div className={styles.metricValue}>${(billing.totalRevenue || 0).toLocaleString()}</div>
          <div className={styles.metricDetails}>
            <span>Monthly: ${(billing.monthlyRevenue || 0).toLocaleString()}</span>
            <span>Annual: ${(billing.annualRevenue || 0).toLocaleString()}</span>
          </div>
        </div>
        
        <div className={styles.revenueMetricCard}>
          <div className={styles.metricHeader}>
            <TrendingUp className={styles.metricIcon} />
            <span className={styles.metricLabel}>Revenue Growth</span>
          </div>
          <div className={styles.metricValue}>{billing.revenueGrowth || 0}%</div>
          <div className={styles.metricDetails}>
            <span>MoM: {billing.monthOverMonth || 0}%</span>
            <span>YoY: {billing.yearOverYear || 0}%</span>
          </div>
        </div>
        
        <div className={styles.revenueMetricCard}>
          <div className={styles.metricHeader}>
            <Users className={styles.metricIcon} />
            <span className={styles.metricLabel}>Active Subscriptions</span>
          </div>
          <div className={styles.metricValue}>{subscriptions.activeSubscriptions || 0}</div>
          <div className={styles.metricDetails}>
            <span>New: {subscriptions.newSubscriptions || 0}</span>
            <span>Churned: {subscriptions.churnedSubscriptions || 0}</span>
          </div>
        </div>
      </div>
      
      <div className={styles.revenueChartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Revenue Trends</h3>
            <span className={styles.chartPeriod}>Last {timeframe}</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <BarChart3 className={styles.chartIcon} />
            <p>Revenue breakdown by time period and subscription type</p>
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Subscription Analytics</h3>
            <span className={styles.chartPeriod}>Current</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <TrendingUp className={styles.chartIcon} />
            <p>Subscription lifecycle and churn analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Performance Tab Component
const PerformanceTab = ({ systemMetrics, timeframe, loading }) => {
  const metrics = systemMetrics || {};
  
  if (loading) {
    return (
      <div className={styles.tabLoading}>
        <RefreshCw className={styles.spinIcon} />
        <span>Loading performance metrics...</span>
      </div>
    );
  }

  return (
    <div className={styles.performanceTab}>
      <div className={styles.performanceMetricsGrid}>
        <div className={styles.performanceMetricCard}>
          <div className={styles.metricHeader}>
            <Server className={styles.metricIcon} />
            <span className={styles.metricLabel}>System Health</span>
          </div>
          <div className={styles.metricValue}>{metrics.healthScore || 0}%</div>
          <div className={styles.healthIndicator}>
            <div className={`${styles.healthBar} ${metrics.healthScore >= 95 ? styles.excellent : metrics.healthScore >= 80 ? styles.good : styles.warning}`}>
              <div className={styles.healthFill} style={{ width: `${metrics.healthScore || 0}%` }}></div>
            </div>
          </div>
        </div>
        
        <div className={styles.performanceMetricCard}>
          <div className={styles.metricHeader}>
            <Zap className={styles.metricIcon} />
            <span className={styles.metricLabel}>Response Time</span>
          </div>
          <div className={styles.metricValue}>{metrics.avgResponseTime || 0}ms</div>
          <div className={styles.metricDetails}>
            <span>P95: {metrics.p95ResponseTime || 0}ms</span>
            <span>P99: {metrics.p99ResponseTime || 0}ms</span>
          </div>
        </div>
        
        <div className={styles.performanceMetricCard}>
          <div className={styles.metricHeader}>
            <Database className={styles.metricIcon} />
            <span className={styles.metricLabel}>Database Performance</span>
          </div>
          <div className={styles.metricValue}>{metrics.dbPerformance || 0}%</div>
          <div className={styles.metricDetails}>
            <span>Queries/sec: {metrics.queriesPerSecond || 0}</span>
            <span>Avg Query Time: {metrics.avgQueryTime || 0}ms</span>
          </div>
        </div>
      </div>
      
      <div className={styles.performanceChartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>System Performance Over Time</h3>
            <span className={styles.chartPeriod}>Last {timeframe}</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <Activity className={styles.chartIcon} />
            <p>CPU, Memory, and Network utilization trends</p>
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Error Rates & Uptime</h3>
            <span className={styles.chartPeriod}>Last {timeframe}</span>
          </div>
          <div className={styles.chartPlaceholder}>
            <AlertTriangle className={styles.chartIcon} />
            <p>System reliability and error tracking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Activity Tab Component
const ActivityTab = ({ recentActivity, loading }) => {
  const activities = recentActivity || [];
  
  if (loading) {
    return (
      <div className={styles.tabLoading}>
        <RefreshCw className={styles.spinIcon} />
        <span>Loading activity data...</span>
      </div>
    );
  }

  return (
    <div className={styles.activityTab}>
      <div className={styles.activityHeader}>
        <h3>Recent Platform Activity</h3>
        <div className={styles.activityFilters}>
          <button className={styles.filterButton}>
            <Filter className={styles.filterIcon} />
            Filter
          </button>
        </div>
      </div>
      
      <div className={styles.activityList}>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {activity.type === 'user_login' && <Users className={styles.activityTypeIcon} />}
                {activity.type === 'account_created' && <Building2 className={styles.activityTypeIcon} />}
                {activity.type === 'payment_processed' && <DollarSign className={styles.activityTypeIcon} />}
                {activity.type === 'system_alert' && <AlertTriangle className={styles.activityTypeIcon} />}
                {!['user_login', 'account_created', 'payment_processed', 'system_alert'].includes(activity.type) && <Activity className={styles.activityTypeIcon} />}
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityTitle}>{activity.title || 'Platform Activity'}</div>
                <div className={styles.activityDescription}>{activity.description || 'Activity description'}</div>
                <div className={styles.activityMeta}>
                  <span className={styles.activityTime}>
                    <Clock className={styles.timeIcon} />
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Unknown time'}
                  </span>
                  {activity.user && (
                    <span className={styles.activityUser}>by {activity.user}</span>
                  )}
                </div>
              </div>
              
              <div className={styles.activityActions}>
                <button className={styles.viewButton}>
                  <Eye className={styles.viewIcon} />
                  View
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyActivity}>
            <Activity className={styles.emptyIcon} />
            <p>No recent activity to display</p>
            <small>Platform activity will appear here as it occurs</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformAnalytics;

// AI-NOTE: Created comprehensive PlatformAnalytics page with multiple tabs for different analytics views.
// Integrates with existing superadminApi endpoints for real-time data. Includes overview, users, revenue,
// performance, and activity analytics with export functionality and responsive design.