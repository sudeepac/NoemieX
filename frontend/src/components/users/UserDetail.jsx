import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  useGetUserQuery,
  useDeleteUserMutation,
  useToggleUserStatusMutation
} from '../../store/api/api';
import { 
  USER_ROLES, 
  PORTAL_TYPES, 
  userHelpers 
} from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
import ChangePasswordModal from './ChangePasswordModal';
import ErrorMessage from '../shared/ErrorMessage';
import styles from './UserDetail.module.css';

// UserDetail component for displaying user information
function UserDetail() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // RTK Query hooks
  const { 
    data: userData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetUserQuery(userId);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      await deleteUser(userId).unwrap();
      alert('User deleted successfully');
      navigate('/users');
    } catch (error) {
      alert(`Error deleting user: ${error.data?.message || error.message}`);
    }
    setShowDeleteConfirm(false);
  };

  // Handle user status toggle
  const handleToggleStatus = async () => {
    try {
      await toggleUserStatus(userId).unwrap();
      alert('User status updated successfully');
      refetch();
    } catch (error) {
      alert(`Error updating user status: ${error.data?.message || error.message}`);
    }
  };

  // Permission checks
  const canEditUser = (user) => {
    if (!currentUser || !user) return false;
    
    // Users can edit themselves (limited)
    if (currentUser._id === user._id) return true;
    
    // Check role hierarchy and portal access
    return userHelpers.canManageUser(currentUser, user);
  };

  const canDeleteUser = (user) => {
    if (!currentUser || !user) return false;
    
    // Can't delete yourself
    if (currentUser._id === user._id) return false;
    
    // Only admins can delete users
    if (currentUser.role !== USER_ROLES.ADMIN) return false;
    
    return userHelpers.canManageUser(currentUser, user);
  };

  const canChangePassword = (user) => {
    if (!currentUser || !user) return false;
    
    // Users can change their own password
    if (currentUser._id === user._id) return true;
    
    // Admins can change passwords for users they manage
    return currentUser.role === USER_ROLES.ADMIN && userHelpers.canManageUser(currentUser, user);
  };

  const canToggleStatus = (user) => {
    if (!currentUser || !user) return false;
    
    // Can't toggle your own status
    if (currentUser._id === user._id) return false;
    
    // Check management permissions
    return userHelpers.canManageUser(currentUser, user);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div>
        <ErrorMessage 
          error={error?.data?.message || 'Failed to load user details'}
          variant="error"
          type="page"
          title="Error Loading User"
        />
        <div className={styles.errorActions}>
          <button onClick={refetch} className={`${styles.btn} ${styles.btnPrimary}`}>
            Try Again
          </button>
          <button onClick={() => navigate('/users')} className={`${styles.btn} ${styles.btnOutline}`}>
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const user = userData?.data;

  if (!user) {
    return (
      <div>
        <ErrorMessage 
          error="The requested user could not be found."
          variant="warning"
          type="page"
          title="User Not Found"
        />
        <button onClick={() => navigate('/users')} className={`${styles.btn} ${styles.btnPrimary}`}>
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className={styles.userDetailContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumb}>
            <Link to="/users" className={styles.breadcrumbLink}>Users</Link>
            <span className={styles.breadcrumbSeparator}>›</span>
            <span className={styles.breadcrumbCurrent}>{userHelpers.getFullName(user)}</span>
          </div>
          <h1>{userHelpers.getFullName(user)}</h1>
          <div className={styles.userMeta}>
            <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
              {userHelpers.getStatusText(user.isActive)}
            </span>
            <span className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
              {userHelpers.getRoleDisplayText(user.role)}
            </span>
            <span className={`${styles.portalBadge} ${styles[`portal${user.portalType.charAt(0).toUpperCase() + user.portalType.slice(1)}`]}`}>
              {userHelpers.getPortalDisplayText(user.portalType)}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          {canEditUser(user) && (
            <Link to={`/users/${user._id}/edit`} className={`${styles.btn} ${styles.btnPrimary}`}>
              Edit User
            </Link>
          )}
          {canChangePassword(user) && (
            <button 
              onClick={() => setShowPasswordModal(true)}
              className={`${styles.btn} ${styles.btnOutline}`}
            >
              Change Password
            </button>
          )}
          {canToggleStatus(user) && (
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`${styles.btn} ${user.isActive ? styles.btnWarning : styles.btnSuccess}`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {canDeleteUser(user) && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`${styles.btn} ${styles.btnDanger}`}
            >
              Delete User
            </button>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className={styles.userDetailContent}>
        {/* Basic Information */}
        <div className={styles.detailSection}>
          <h3>Basic Information</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Full Name</label>
              <div className={styles.detailValue}>
                <div className={styles.userAvatar}>
                  {userHelpers.getFullName(user).charAt(0).toUpperCase()}
                </div>
                <span>{userHelpers.getFullName(user)}</span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Email Address</label>
              <div className={styles.detailValue}>
                <a href={`mailto:${user.email}`} className={styles.emailLink}>
                  {user.email}
                </a>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>User ID</label>
              <div className={`${styles.detailValue} ${styles.userId}`}>
                {user._id}
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Account Created</label>
              <div className={styles.detailValue}>
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
            {user.updatedAt && user.updatedAt !== user.createdAt && (
              <div className={styles.detailItem}>
                <label>Last Updated</label>
                <div className={styles.detailValue}>
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
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

        {/* Role and Permissions */}
        <div className={styles.detailSection}>
          <h3>Role and Permissions</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Role</label>
              <div className={styles.detailValue}>
                <span className={`${styles.roleBadge} ${styles[`role${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`]}`}>
                  {userHelpers.getRoleDisplayText(user.role)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Portal Type</label>
              <div className={styles.detailValue}>
                <span className={`${styles.portalBadge} ${styles[`portal${user.portalType.charAt(0).toUpperCase() + user.portalType.slice(1)}`]}`}>
                  {userHelpers.getPortalDisplayText(user.portalType)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Status</label>
              <div className={styles.detailValue}>
                <span className={`${styles.statusBadge} ${user.isActive ? styles.active : styles.inactive}`}>
                  {userHelpers.getStatusText(user.isActive)}
                </span>
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Permissions</label>
              <div className={styles.detailValue}>
                <div className={styles.permissionsList}>
                  {userHelpers.getUserPermissions(user).map((permission, index) => (
                    <span key={index} className={styles.permissionTag}>
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className={styles.detailSection}>
          <h3>Organization</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>Account</label>
              <div className={styles.detailValue}>
                {user.accountId ? (
                  <div className={styles.orgInfo}>
                    <span className={styles.orgName}>{user.accountId.name}</span>
                    <span className={styles.orgId}>ID: {user.accountId._id}</span>
                  </div>
                ) : (
                  <span className={styles.noData}>Not assigned</span>
                )}
              </div>
            </div>
            <div className={styles.detailItem}>
              <label>Agency</label>
              <div className={styles.detailValue}>
                {user.agencyId ? (
                  <div className={styles.orgInfo}>
                    <span className={styles.orgName}>{user.agencyId.name}</span>
                    <span className={styles.orgId}>ID: {user.agencyId._id}</span>
                  </div>
                ) : (
                  <span className={styles.noData}>Not assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        {user.profile && Object.values(user.profile).some(value => value) && (
          <div className={styles.detailSection}>
            <h3>Profile Information</h3>
            <div className={styles.detailGrid}>
              {user.profile.phone && (
                <div className={styles.detailItem}>
                  <label>Phone Number</label>
                  <div className={styles.detailValue}>
                    <a href={`tel:${user.profile.phone}`} className={styles.phoneLink}>
                      {user.profile.phone}
                    </a>
                  </div>
                </div>
              )}
              {user.profile.department && (
                <div className={styles.detailItem}>
                  <label>Department</label>
                  <div className={styles.detailValue}>{user.profile.department}</div>
                </div>
              )}
              {user.profile.position && (
                <div className={styles.detailItem}>
                  <label>Position</label>
                  <div className={styles.detailValue}>{user.profile.position}</div>
                </div>
              )}
              {user.profile.address && (
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <label>Address</label>
                  <div className={`${styles.detailValue} ${styles.address}`}>
                    {user.profile.address}
                  </div>
                </div>
              )}
              {user.profile.notes && (
                <div className={`${styles.detailItem} ${styles.fullWidth}`}>
                  <label>Notes</label>
                  <div className={`${styles.detailValue} ${styles.notes}`}>
                    {user.profile.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className={styles.detailSection}>
          <h3>Activity Summary</h3>
          <div className={styles.activityStats}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {user.subordinates?.length || 0}
              </div>
              <div className={styles.statLabel}>Subordinates</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {user.lastLoginAt ? 
                  new Date(user.lastLoginAt).toLocaleDateString() : 
                  'Never'
                }
              </div>
              <div className={styles.statLabel}>Last Login</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>
                {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className={styles.statLabel}>Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          userId={user._id}
          userName={userHelpers.getFullName(user)}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Delete User</h3>
            <p>
              Are you sure you want to delete <strong>{userHelpers.getFullName(user)}</strong>?
              This action cannot be undone and will permanently remove all user data.
            </p>
            <div className={styles.modalActions}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className={`${styles.btn} ${styles.btnOutline}`}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className={`${styles.btn} ${styles.btnDanger}`}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDetail;

// AI-NOTE: Created comprehensive UserDetail component with role-based action permissions, detailed user information display, and integrated modals for password changes and deletion confirmation.