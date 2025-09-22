import React from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  UserCheck,
  Calendar
} from 'lucide-react';
import './AgencyStats.css';

/**
 * AgencyStats Component
 * 
 * Displays comprehensive statistics for an agency including:
 * - Candidate and client counts
 * - Placement and revenue metrics
 * - Performance indicators and trends
 * - Activity and engagement data
 * 
 * @param {Object} props
 * @param {Object} props.agency - Agency object with statistics
 * @param {Object} props.stats - Additional statistics object
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.error - Error state
 */
const AgencyStats = ({ agency, stats, loading, error }) => {
  if (loading) {
    return (
      <div className="agency-stats-container">
        <div className="stats-loading">
          <div className="loading-spinner"></div>
          <p>Loading agency statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agency-stats-container">
        <div className="stats-error">
          <AlertTriangle className="w-6 h-6" />
          <p>Failed to load agency statistics</p>
          <span className="error-message">{error.message}</span>
        </div>
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="agency-stats-container">
        <div className="stats-empty">
          <Building2 className="w-12 h-12" />
          <p>No agency data available</p>
        </div>
      </div>
    );
  }

  // Calculate derived statistics
  const totalCandidates = stats?.totalCandidates || agency.candidateCount || 0;
  const totalClients = stats?.totalClients || agency.clientCount || 0;
  const monthlyPlacements = stats?.monthlyPlacements || agency.monthlyPlacements || 0;
  const monthlyRevenue = stats?.monthlyRevenue || agency.monthlyRevenue || 0;
  
  // Calculate trends (mock data for now - would come from API)
  const candidateTrend = stats?.candidateTrend || '+25';
  const clientTrend = stats?.clientTrend || '+8';
  const placementTrend = stats?.placementTrend || '+12';
  const revenueTrend = stats?.revenueTrend || '+18%';

  // Performance metrics
  const placementRate = stats?.placementRate || agency.placementRate || 0;
  const avgTimeToPlace = stats?.avgTimeToPlace || agency.avgTimeToPlace || 0;
  const clientSatisfaction = stats?.clientSatisfaction || agency.clientSatisfaction || 0;

  const mainStats = [
    {
      title: 'Total Candidates',
      value: totalCandidates.toLocaleString(),
      change: candidateTrend,
      trend: candidateTrend.startsWith('+') ? 'up' : 'down',
      icon: <Users className="w-6 h-6" />,
      color: 'primary',
      description: 'Registered candidates in database'
    },
    {
      title: 'Active Clients',
      value: totalClients.toLocaleString(),
      change: clientTrend,
      trend: clientTrend.startsWith('+') ? 'up' : 'down',
      icon: <Building2 className="w-6 h-6" />,
      color: 'success',
      description: 'Companies actively hiring'
    },
    {
      title: 'Monthly Placements',
      value: monthlyPlacements.toLocaleString(),
      change: placementTrend,
      trend: placementTrend.startsWith('+') ? 'up' : 'down',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'info',
      description: 'Successful placements this month'
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: revenueTrend,
      trend: revenueTrend.startsWith('+') ? 'up' : 'down',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'warning',
      description: 'Revenue generated this month'
    }
  ];

  const performanceStats = [
    {
      label: 'Placement Rate',
      value: `${placementRate}%`,
      status: placementRate >= 80 ? 'good' : placementRate >= 60 ? 'warning' : 'error'
    },
    {
      label: 'Avg. Time to Place',
      value: `${avgTimeToPlace} days`,
      status: avgTimeToPlace <= 30 ? 'good' : avgTimeToPlace <= 45 ? 'warning' : 'error'
    },
    {
      label: 'Client Satisfaction',
      value: `${clientSatisfaction}/5.0`,
      status: clientSatisfaction >= 4.5 ? 'good' : clientSatisfaction >= 3.5 ? 'warning' : 'error'
    },
    {
      label: 'Agency Status',
      value: agency.status === 'active' ? 'Active' : 'Inactive',
      status: agency.status === 'active' ? 'good' : 'error'
    }
  ];

  return (
    <div className="agency-stats-container">
      {/* Main Statistics Grid */}
      <div className="stats-grid">
        {mainStats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-change ${stat.trend}`}>
                {stat.trend === 'up' ? 
                  <TrendingUp className="w-4 h-4" /> : 
                  <TrendingDown className="w-4 h-4" />
                }
                {stat.change}
              </div>
            </div>
            <div className="stat-description">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Performance & Activity Information */}
      <div className="subscription-stats">
        <div className="stats-card">
          <div className="card-header">
            <h3>Performance Metrics</h3>
            <Target className="w-5 h-5" />
          </div>
          <div className="metrics-list">
            {performanceStats.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-info">
                  <span className="metric-label">{metric.label}</span>
                  <span className={`metric-value ${metric.status}`}>
                    {metric.value}
                  </span>
                </div>
                <div className="metric-indicator">
                  <div className={`indicator-dot ${metric.status}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agency Activity Summary */}
        <div className="stats-card">
          <div className="card-header">
            <h3>Agency Activity</h3>
            <Activity className="w-5 h-5" />
          </div>
          <div className="activity-summary">
            <div className="activity-item">
              <div className="activity-icon">
                <Clock className="w-4 h-4" />
              </div>
              <div className="activity-content">
                <span className="activity-label">Last Active</span>
                <span className="activity-value">
                  {agency.lastActiveAt ? 
                    new Date(agency.lastActiveAt).toLocaleDateString() : 
                    'Never'
                  }
                </span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="activity-content">
                <span className="activity-label">Agency Registered</span>
                <span className="activity-value">
                  {new Date(agency.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="activity-content">
                <span className="activity-label">Last Updated</span>
                <span className="activity-value">
                  {new Date(agency.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Warning (if applicable) */}
      {placementRate < 60 && (
        <div className="performance-warning">
          <div className="warning-content">
            <AlertTriangle className="w-5 h-5" />
            <div className="warning-text">
              <h4>Low Placement Rate</h4>
              <p>
                This agency's placement rate is below 60%. Consider reviewing 
                recruitment strategies and candidate matching processes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inactive Agency Warning */}
      {agency.status !== 'active' && (
        <div className="status-warning">
          <div className="warning-content">
            <Building2 className="w-5 h-5" />
            <div className="warning-text">
              <h4>Agency Inactive</h4>
              <p>
                This agency is currently inactive. Contact the agency to 
                reactivate their account and resume operations.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyStats;

// AI-NOTE: Created AgencyStats component with agency-specific metrics including candidates, clients, placements, revenue, performance indicators, and activity tracking with warning alerts for low performance and inactive status