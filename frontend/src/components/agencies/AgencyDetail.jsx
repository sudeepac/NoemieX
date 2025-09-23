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
import LoadingSpinner from '../common/loading-spinner.component';
import ErrorMessage from '../../shared/components/ErrorMessage';
import './AgencyDetail.css';

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
      <div className="agency-detail-container">
        <LoadingSpinner message="Loading agency details..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="agency-detail-container">
        <ErrorMessage 
          error={{message: error?.data?.message || 'Failed to load agency details'}} 
          variant="page" 
          type="error"
          title="Error Loading Agency"
        />
        <div className="error-actions">
          <button onClick={() => refetch()} className="btn btn-primary">
            Try Again
          </button>
          <Link to="/agencies" className="btn btn-outline">
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
      <div className="agency-detail-container">
        <ErrorMessage 
          error={{message: "The requested agency could not be found."}} 
          variant="page" 
          type="error"
          title="Agency Not Found"
        />
        <div className="error-actions">
          <Link to="/agencies" className="btn btn-primary">
            Back to Agencies
          </Link>
        </div>
      </div>
    );
  }

  const statusDisplay = getStatusDisplay(agency.isActive);

  return (
    <div className="agency-detail-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <Link to="/agencies" className="breadcrumb-link">Agencies</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{agency.name}</span>
          </div>
          <h1>{agency.name}</h1>
          <div className="agency-meta">
            <span className={`status-badge ${statusDisplay.className}`}>
              {statusDisplay.text}
            </span>
            <span className="commission-badge">
              {formatCommission(agency.commissionSplitPercent)} Commission
            </span>
            {agency.accountId && (
              <span className="account-badge">
                {typeof agency.accountId === 'object' ? agency.accountId.name : 'Account'}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          {canEditAgency() && (
            <Link to={`/agencies/${agency._id}/edit`} className="btn btn-primary">
              Edit Agency
            </Link>
          )}
          {canToggleStatus() && (
            <button 
              onClick={handleToggleStatus}
              className={`btn ${agency.isActive ? 'btn-warning' : 'btn-success'}`}
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
              className="btn btn-danger"
              disabled={isDeleting}
            >
              Delete Agency
            </button>
          )}
        </div>
      </div>

      <div className="agency-detail-content">
        {/* Basic Information */}
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Agency Name</label>
              <div className="detail-value">{agency.name}</div>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <div className="detail-value">
                <span className={`status-badge ${statusDisplay.className}`}>
                  {statusDisplay.text}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Agency ID</label>
              <div className="detail-value agency-id">
                {agency._id}
              </div>
            </div>
            <div className="detail-item">
              <label>Created</label>
              <div className="detail-value">
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
              <div className="detail-item">
                <label>Last Updated</label>
                <div className="detail-value">
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
              <div className="detail-item full-width">
                <label>Description</label>
                <div className="detail-value description">
                  {agency.description}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Commission Settings */}
        <div className="detail-section">
          <h3>Commission Settings</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Commission Split Percentage</label>
              <div className="detail-value">
                <span className="commission-value">
                  {formatCommission(agency.commissionSplitPercent)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Agency Share</label>
              <div className="detail-value">
                <span className="commission-breakdown">
                  {formatCommission(agency.commissionSplitPercent)} to Agency
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Account Share</label>
              <div className="detail-value">
                <span className="commission-breakdown">
                  {formatCommission(100 - (agency.commissionSplitPercent || 0))} to Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        {agency.accountId && (
          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Account Name</label>
                <div className="detail-value">
                  {typeof agency.accountId === 'object' ? (
                    <Link 
                      to={`/accounts/${agency.accountId._id}`} 
                      className="account-link"
                    >
                      {agency.accountId.name}
                    </Link>
                  ) : (
                    <span>Account ID: {agency.accountId}</span>
                  )}
                </div>
              </div>
              {typeof agency.accountId === 'object' && agency.accountId.contactInfo?.email && (
                <div className="detail-item">
                  <label>Account Contact</label>
                  <div className="detail-value">
                    <a href={`mailto:${agency.accountId.contactInfo.email}`} className="email-link">
                      {agency.accountId.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
              {typeof agency.accountId === 'object' && agency.accountId.subscription && (
                <div className="detail-item">
                  <label>Account Plan</label>
                  <div className="detail-value">
                    <span className={`plan-badge plan-${agency.accountId.subscription.plan}`}>
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
          <div className="detail-section">
            <h3>Agency Statistics</h3>
            <div className="activity-stats">
              <div className="stat-item">
                <div className="stat-value">{stats.totalUsers || 0}</div>
                <div className="stat-label">Total Users</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.activeUsers || 0}</div>
                <div className="stat-label">Active Users</div>
              </div>
              {stats.totalCommissions !== undefined && (
                <div className="stat-item">
                  <div className="stat-value">
                    ${(stats.totalCommissions || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Total Commissions</div>
                </div>
              )}
              {stats.monthlyCommissions !== undefined && (
                <div className="stat-item">
                  <div className="stat-value">
                    ${(stats.monthlyCommissions || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Monthly Commissions</div>
                </div>
              )}
              {stats.averageCommissionPerUser !== undefined && (
                <div className="stat-item">
                  <div className="stat-value">
                    ${(stats.averageCommissionPerUser || 0).toLocaleString()}
                  </div>
                  <div className="stat-label">Avg Commission/User</div>
                </div>
              )}
              {stats.performanceRating !== undefined && (
                <div className="stat-item">
                  <div className="stat-value">
                    {(stats.performanceRating || 0).toFixed(1)}/5.0
                  </div>
                  <div className="stat-label">Performance Rating</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {!isLoadingStats && stats && stats.performanceMetrics && (
          <div className="detail-section">
            <h3>Performance Metrics</h3>
            <div className="detail-grid">
              {stats.performanceMetrics.conversionRate !== undefined && (
                <div className="detail-item">
                  <label>Conversion Rate</label>
                  <div className="detail-value">
                    {(stats.performanceMetrics.conversionRate * 100).toFixed(2)}%
                  </div>
                </div>
              )}
              {stats.performanceMetrics.averageDealSize !== undefined && (
                <div className="detail-item">
                  <label>Average Deal Size</label>
                  <div className="detail-value">
                    ${stats.performanceMetrics.averageDealSize.toLocaleString()}
                  </div>
                </div>
              )}
              {stats.performanceMetrics.clientRetentionRate !== undefined && (
                <div className="detail-item">
                  <label>Client Retention Rate</label>
                  <div className="detail-value">
                    {(stats.performanceMetrics.clientRetentionRate * 100).toFixed(2)}%
                  </div>
                </div>
              )}
              {stats.performanceMetrics.monthlyGrowthRate !== undefined && (
                <div className="detail-item">
                  <label>Monthly Growth Rate</label>
                  <div className="detail-value">
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
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Agency</h3>
            <p>
              Are you sure you want to delete the agency "{agency.name}"? 
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
                onClick={handleDeleteAgency}
                className="btn btn-danger"
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