import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useGetAgencyQuery,
  useDeleteAgencyMutation, 
  useToggleAgencyStatusMutation,
  useGetAgencyStatsQuery
} from '../../store/api/api';
import { PORTAL_TYPES } from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import styles from './AgencyDetail.module.css';

/**
 * AgencyDetail component for displaying comprehensive agency information
 * Supports different views based on user portal type (superadmin, account, agency)
 */
function AgencyDetail() {
  const navigate = useNavigate();
  const { agencyId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // RTK Query hooks
  const { 
    data: agencyData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetAgencyQuery(agencyId);

  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useGetAgencyStatsQuery(agencyId);

  const [deleteAgency, { isLoading: isDeleting }] = useDeleteAgencyMutation();
  const [toggleAgencyStatus, { isLoading: isToggling }] = useToggleAgencyStatusMutation();

  /**
   * Handle agency deletion
   */
  const handleDeleteAgency = async () => {
    try {
      await deleteAgency(agencyId).unwrap();
      navigate('/agencies');
    } catch (error) {
      console.error('Failed to delete agency:', error);
    }
    setShowDeleteConfirm(false);
  };

  /**
   * Handle status toggle
   */
  const handleToggleStatus = async () => {
    try {
      await toggleAgencyStatus(agencyId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to toggle agency status:', error);
    }
  };

  /**
   * Permission checks
   */
  const canEditAgency = () => {
    if (currentUser?.portalType === PORTAL_TYPES.SUPERADMIN) return true;
    if (currentUser?.portalType === PORTAL_TYPES.ACCOUNT) {
      // Account admins can edit agencies in their account
      return agency?.accountId?._id === currentUser.accountId || agency?.accountId === currentUser.accountId;
    }
    if (currentUser?.portalType === PORTAL_TYPES.AGENCY) {
      // Agency admins can edit their own agency
      return agency?._id === currentUser.agencyId;
    }
    return false;
  };

  const canDeleteAgency = () => {
    // Only superadmin and account admins can delete agencies
    if (currentUser?.portalType === PORTAL_TYPES.SUPERADMIN) return true;
    if (currentUser?.portalType === PORTAL_TYPES.ACCOUNT) {
      return agency?.accountId?._id === currentUser.accountId || agency?.accountId === currentUser.accountId;
    }
    return false;
  };

  const canToggleStatus = () => {
    // Only superadmin and account admins can toggle status
    if (currentUser?.portalType === PORTAL_TYPES.SUPERADMIN) return true;
    if (currentUser?.portalType === PORTAL_TYPES.ACCOUNT) {
      return agency?.accountId?._id === currentUser.accountId || agency?.accountId === currentUser.accountId;
    }
    return false;
  };

  /**
   * Format commission percentage
   */
  const formatCommission = (percentage) => {
    if (percentage === undefined || percentage === null) return 'Not set';
    return `${Number(percentage).toFixed(2)}%`;
  };

  /**
   * Get agency status display
   */
  const getStatusDisplay = (isActive) => {
    return {
      text: isActive ? 'Active' : 'Inactive',
      className: isActive ? 'active' : 'inactive'
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.agencyDetailContainer}>
        <LoadingSpinner message="Loading agency details..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={styles.agencyDetailContainer}>
        <ErrorMessage 
          error={{message: error?.data?.message || 'Failed to load agency details'}} 
          variant="page" 
          type="error"
          title="Error Loading Agency"
        />
        <div className={styles.errorActions}>
          <button onClick={() => refetch()} className={`${styles.btn} ${styles.btnPrimary}`}>
            Try Again
          </button>
          <Link to="/agencies" className={`${styles.btn} ${styles.btnOutline}`}>
            Back to Agencies
          </Link>
        </div>
      </div>
    );
  }

  const agency = agencyData?.data;
  const stats = statsData?.data;

  if (!agency) {
    return (
      <div className={styles.agencyDetailContainer}>
        <ErrorMessage 
          error={{message: "The requested agency could not be found."}} 
          variant="page" 
          type="error"
          title="Agency Not Found"
        />
        <div className={styles.errorActions}>
          <Link to="/agencies" className={`${styles.btn} ${styles.btnPrimary}`}>
            Back to Agencies
          </Link>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(agency.isActive);

  return (
    <div className={styles.agencyDetailContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <Link to="/agencies" className={styles.breadcrumbLink}>Agencies</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{agency.name}</span>
          </div>
          <h1>{agency.name}</h1>
          <div className={styles.agencyMeta}>
            <span className={`${styles.statusBadge} ${styles[statusDisplay.className]}`}>
              {statusDisplay.text}
            </span>
            <span className={styles.commissionBadge}>
              {formatCommission(agency.commissionSplitPercent)} Commission
            </span>
            {agency.accountId && (
              <span className={styles.accountBadge}>
                {typeof agency.accountId === 'object' ? agency.accountId.name : 'Account'}
              </span>
            )}
          </div>
        </div>
        <div className={styles.headerActions}>
          {canEditAgency() && (
            <Link to={`/agencies/${agency._id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
              Edit Agency
            </Link>
          )}
          {canToggleStatus() && (
            <button 
              onClick={handleToggleStatus}
              className={`${styles.btn} ${agency.isActive ? styles.btnWarning : styles.btnSuccess}`}
              disabled={isToggling}
            >
              {isToggling ? 'Updating...' : 
                agency.isActive ? 'Deactivate Agency' : 'Activate Agency'
              }
            </button>
          )}
          {canDeleteAgency() && (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className={`${styles.btn} ${styles.btnDanger}`}
              disabled={isDeleting}
            >
              Delete Agency
            </button>
          )}
        </div>
      </div>

      <div className={styles.agencyDetailContent}>
        {/* Basic Information */}
        <div className={styles.detailSection}>
          <h3>Basic Information</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Agency Name</label>
              <div className={styles.detailValue}>{agency.name}</div>
            </div>
            <div className={styles.detailItem}>
              <label>Status</label>
              <div className={styles.detailValue}>
                <span className={`${styles.statusBadge} ${styles[statusDisplay.className]}`}>
                  {statusDisplay.text}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Agency ID</label>
              <div className={`${styles.detailValue} ${styles.agencyId}`}>
                {agency._id}
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Created</label>
              <div className={styles.detailValue}>
                {new Date(agency.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {agency.updatedAt && agency.updatedAt !== agency.createdAt && (
              <div className={styles.detailItem}>
                <label>Last Updated</label>
                <div className={styles.detailValue}>
                  {new Date(agency.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            )}
            {agency.description && (
              <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                <label>Description</label>
                <div className={`${styles.detailValue} ${styles.description}`}>
                  {agency.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commission Settings */}
        <div className={styles.detailSection}>
          <h3>Commission Settings</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Commission Split Percentage</label>
              <div className={styles.detailValue}>
                <span className={styles.commissionValue}>
                  {formatCommission(agency.commissionSplitPercent)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Agency Share</label>
              <div className={styles.detailValue}>
                <span className={styles.commissionBreakdown}>
                  {formatCommission(agency.commissionSplitPercent)} to Agency
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Account Share</label>
              <div className={styles.detailValue}>
                <span className={styles.commissionBreakdown}>
                  {formatCommission(100 - (agency.commissionSplitPercent || 0))} to Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        {agency.accountId && (
          <div className={styles.detailSection}>
            <h3>Account Information</h3>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <label>Account Name</label>
                <div className={styles.detailValue}>
                  {typeof agency.accountId === 'object' ? (
                    <Link 
                      to={`/accounts/${agency.accountId._id}`} 
                      className={styles.accountLink}
                    >
                      {agency.accountId.name}
                    </Link>
                  ) : (
                    <span>Account ID: {agency.accountId}</span>
                  )}
                </div>
              </div>
              {typeof agency.accountId === 'object' && agency.accountId.contactInfo?.email && (
                <div className={styles.detailItem}>
                  <label>Account Contact</label>
                  <div className={styles.detailValue}>
                    <a href={`mailto:${agency.accountId.contactInfo.email}`} className={styles.emailLink}>
                      {agency.accountId.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
              {typeof agency.accountId === 'object' && agency.accountId.subscription && (
                <div className={styles.detailItem}>
                  <label>Account Plan</label>
                  <div className={styles.detailValue}>
                    <span className={`${styles.planBadge} ${styles[`plan${agency.accountId.subscription.plan ? agency.accountId.subscription.plan.charAt(0).toUpperCase() + agency.accountId.subscription.plan.slice(1) : 'Unknown'}`]}`}>
                      {agency.accountId.subscription.plan ? 
                        agency.accountId.subscription.plan.charAt(0).toUpperCase() + agency.accountId.subscription.plan.slice(1) :
                        'Unknown'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Agency Statistics */}
        {!isLoadingStats && stats && (
          <div className={styles.detailSection}>
            <h3>Agency Statistics</h3>
            <div className={styles.activityStats}>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.totalUsers || 0}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statValue}>{stats.activeUsers || 0}</div>
                <div className={styles.statLabel}>Active Users</div>
              </div>
              {stats.totalCommissions !== undefined && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    ${(stats.totalCommissions || 0).toLocaleString()}
                  </div>
                  <div className={styles.statLabel}>Total Commissions</div>
                </div>
              )}
              {stats.monthlyCommissions !== undefined && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    ${(stats.monthlyCommissions || 0).toLocaleString()}
                  </div>
                  <div className={styles.statLabel}>Monthly Commissions</div>
                </div>
              )}
              {stats.averageCommissionPerUser !== undefined && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    ${(stats.averageCommissionPerUser || 0).toLocaleString()}
                  </div>
                  <div className={styles.statLabel}>Avg Commission/User</div>
                </div>
              )}
              {stats.performanceRating !== undefined && (
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {(stats.performanceRating || 0).toFixed(1)}/5.0
                  </div>
                  <div className={styles.statLabel}>Performance Rating</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {!isLoadingStats && stats && stats.performanceMetrics && (
          <div className={styles.detailSection}>
            <h3>Performance Metrics</h3>
            <div className={styles.detailGrid}>
              {stats.performanceMetrics.conversionRate !== undefined && (
                <div className={styles.detailItem}>
                  <label>Conversion Rate</label>
                  <div className={styles.detailValue}>
                    {(stats.performanceMetrics.conversionRate * 100).toFixed(2)}%
                  </div>
                </div>
              )}
              {stats.performanceMetrics.averageDealSize !== undefined && (
                <div className={styles.detailItem}>
                  <label>Average Deal Size</label>
                  <div className={styles.detailValue}>
                    ${stats.performanceMetrics.averageDealSize.toLocaleString()}
                  </div>
                </div>
              )}
              {stats.performanceMetrics.clientRetentionRate !== undefined && (
                <div className={styles.detailItem}>
                  <label>Client Retention Rate</label>
                  <div className={styles.detailValue}>
                    {(stats.performanceMetrics.clientRetentionRate * 100).toFixed(2)}%
                  </div>
                </div>
              )}
              {stats.performanceMetrics.monthlyGrowthRate !== undefined && (
                <div className={styles.detailItem}>
                  <label>Monthly Growth Rate</label>
                  <div className={styles.detailValue}>
                    {(stats.performanceMetrics.monthlyGrowthRate * 100).toFixed(2)}%
                  </div>
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
            <h3>Delete Agency</h3>
            <p>
              Are you sure you want to delete the agency "{agency.name}"? 
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
                onClick={handleDeleteAgency}
                className={`${styles.btn} ${styles.btnDanger}`}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Agency'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgencyDetail;

// AI-NOTE: Created AgencyDetail component following AccountDetail pattern but adapted for agency-specific information including commission settings, account relationships, user statistics, and performance metrics with role-based permissions for superadmin, account, and agency users.