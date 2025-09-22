import React from 'react';
import { useGetOfferLetterStatsQuery } from '../../store/offer-letters/offer-letters.api';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  FileText, 
  Users, 
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import styles from './OfferLetterStats.module.css';

/**
 * OfferLetterStats component - displays analytics and performance metrics for offer letters
 * Shows status distribution, intake statistics, monthly trends, and version analytics
 */
const OfferLetterStats = () => {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useGetOfferLetterStatsQuery();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading offer letter statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <AlertCircle className="w-6 h-6" />
          <h3>Error Loading Statistics</h3>
          <p>Unable to load offer letter statistics. Please try again.</p>
          <button onClick={refetch} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <FileText className="w-12 h-12" />
          <h3>No Data Available</h3>
          <p>No offer letter statistics available at this time.</p>
        </div>
      </div>
    );
  }

  // Process status statistics
  const statusData = stats.statusStats.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  // Calculate status percentages
  const totalOffers = stats.totalOfferLetters;
  const statusPercentages = Object.entries(statusData).map(([status, count]) => ({
    status,
    count,
    percentage: totalOffers > 0 ? ((count / totalOffers) * 100).toFixed(1) : 0
  }));

  // Get status icon and color
  const getStatusConfig = (status) => {
    const configs = {
      draft: { icon: FileText, color: 'gray', label: 'Draft' },
      issued: { icon: Clock, color: 'blue', label: 'Issued' },
      accepted: { icon: CheckCircle, color: 'green', label: 'Accepted' },
      rejected: { icon: XCircle, color: 'red', label: 'Rejected' },
      expired: { icon: AlertCircle, color: 'orange', label: 'Expired' },
      replaced: { icon: Award, color: 'purple', label: 'Replaced' },
      cancelled: { icon: XCircle, color: 'gray', label: 'Cancelled' }
    };
    return configs[status] || { icon: FileText, color: 'gray', label: status };
  };

  // Process monthly statistics for trend analysis
  const monthlyTrend = stats.monthlyStats.slice(0, 6).reverse();
  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  // Calculate acceptance rate
  const acceptedCount = statusData.accepted || 0;
  const issuedCount = (statusData.issued || 0) + acceptedCount + (statusData.rejected || 0);
  const acceptanceRate = issuedCount > 0 ? ((acceptedCount / issuedCount) * 100).toFixed(1) : 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <BarChart3 className="w-6 h-6" />
          <h2>Offer Letter Analytics</h2>
        </div>
        <button onClick={refetch} className={styles.refreshButton}>
          <TrendingUp className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <FileText className="w-6 h-6" />
          </div>
          <div className={styles.metricContent}>
            <h3>Total Offer Letters</h3>
            <div className={styles.metricValue}>{totalOffers}</div>
            <div className={styles.metricDescription}>All time</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className={styles.metricContent}>
            <h3>Acceptance Rate</h3>
            <div className={styles.metricValue}>{acceptanceRate}%</div>
            <div className={styles.metricDescription}>
              {acceptedCount} of {issuedCount} issued
            </div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Clock className="w-6 h-6" />
          </div>
          <div className={styles.metricContent}>
            <h3>Active Offers</h3>
            <div className={styles.metricValue}>{statusData.issued || 0}</div>
            <div className={styles.metricDescription}>Pending response</div>
          </div>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricIcon}>
            <Award className="w-6 h-6" />
          </div>
          <div className={styles.metricContent}>
            <h3>Replacements</h3>
            <div className={styles.metricValue}>{statusData.replaced || 0}</div>
            <div className={styles.metricDescription}>Updated offers</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsGrid}>
        {/* Status Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Status Distribution</h3>
            <Users className="w-5 h-5" />
          </div>
          <div className={styles.statusChart}>
            {statusPercentages.map(({ status, count, percentage }) => {
              const config = getStatusConfig(status);
              const IconComponent = config.icon;
              return (
                <div key={status} className={styles.statusItem}>
                  <div className={styles.statusInfo}>
                    <div className={styles.statusLabel}>
                      <IconComponent className={`w-4 h-4 ${styles[`icon${config.color.charAt(0).toUpperCase() + config.color.slice(1)}`]}`} />
                      <span>{config.label}</span>
                    </div>
                    <div className={styles.statusStats}>
                      <span className={styles.statusCount}>{count}</span>
                      <span className={styles.statusPercentage}>({percentage}%)</span>
                    </div>
                  </div>
                  <div className={styles.statusBar}>
                    <div 
                      className={`${styles.statusProgress} ${styles[`progress${config.color.charAt(0).toUpperCase() + config.color.slice(1)}`]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3>Monthly Trend</h3>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className={styles.trendChart}>
            {monthlyTrend.map((item, index) => {
              const maxCount = Math.max(...monthlyTrend.map(m => m.count));
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={index} className={styles.trendBar}>
                  <div className={styles.trendBarContainer}>
                    <div 
                      className={styles.trendBarFill}
                      style={{ height: `${height}%` }}
                    ></div>
                  </div>
                  <div className={styles.trendLabel}>
                    <span className={styles.trendMonth}>
                      {getMonthName(item._id.month)}
                    </span>
                    <span className={styles.trendCount}>{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Intake Statistics */}
      {stats.intakeStats.length > 0 && (
        <div className={styles.intakeSection}>
          <div className={styles.sectionHeader}>
            <Calendar className="w-5 h-5" />
            <h3>Intake Statistics</h3>
          </div>
          <div className={styles.intakeGrid}>
            {stats.intakeStats.slice(0, 8).map((intake, index) => (
              <div key={index} className={styles.intakeCard}>
                <div className={styles.intakeInfo}>
                  <span className={styles.intakeYear}>{intake._id.year}</span>
                  <span className={styles.intakeTerm}>{intake._id.term}</span>
                </div>
                <div className={styles.intakeCount}>{intake.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Replacement Reasons */}
      {stats.replacementStats.length > 0 && (
        <div className={styles.replacementSection}>
          <div className={styles.sectionHeader}>
            <Award className="w-5 h-5" />
            <h3>Replacement Reasons</h3>
          </div>
          <div className={styles.replacementList}>
            {stats.replacementStats.map((replacement, index) => (
              <div key={index} className={styles.replacementItem}>
                <span className={styles.replacementReason}>{replacement._id}</span>
                <span className={styles.replacementCount}>{replacement.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferLetterStats;

// AI-NOTE: Created comprehensive OfferLetterStats component with analytics dashboard showing status distribution, acceptance rates, monthly trends, intake statistics, and replacement reasons with responsive charts and metrics