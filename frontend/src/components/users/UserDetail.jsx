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
import LoadingSpinner from '../common/loading-spinner.component';
import ChangePasswordModal from './ChangePasswordModal';
import './UserDetail.css';

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
      <div className="error-container">
        <h3>Error Loading User</h3>
        <p>{error?.data?.message || 'Failed to load user details'}</p>
        <div className="error-actions">
          <button onClick={refetch} className="btn btn-primary">
            Try Again
          </button>
          <button onClick={() => navigate('/users')} className="btn btn-outline">
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const user = userData?.data;

  if (!user) {
    return (
      <div className="error-container">
        <h3>User Not Found</h3>
        <p>The requested user could not be found.</p>
        <button onClick={() => navigate('/users')} className="btn btn-primary">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="user-detail-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="breadcrumb">
            <Link to="/users" className="breadcrumb-link">Users</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{userHelpers.getFullName(user)}</span>
          </div>
          <h1>{userHelpers.getFullName(user)}</h1>
          <div className="user-meta">
            <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
              {userHelpers.getStatusText(user.isActive)}
            </span>
            <span className={`role-badge role-${user.role}`}>
              {userHelpers.getRoleDisplayText(user.role)}
            </span>
            <span className={`portal-badge portal-${user.portalType}`}>
              {userHelpers.getPortalDisplayText(user.portalType)}
            </span>
          </div>
        </div>
        <div className="header-actions">
          {canEditUser(user) && (
            <Link to={`/users/${user._id}/edit`} className="btn btn-primary">
              Edit User
            </Link>
          )}
          {canChangePassword(user) && (
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-outline"
            >
              Change Password
            </button>
          )}
          {canToggleStatus(user) && (
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`btn ${user.isActive ? 'btn-warning' : 'btn-success'}`}
            >
              {user.isActive ? 'Deactivate' : 'Activate'}
            </button>
          )}
          {canDeleteUser(user) && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn btn-danger"
            >
              Delete User
            </button>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="user-detail-content">
        {/* Basic Information */}
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Full Name</label>
              <div className="detail-value">
                <div className="user-avatar">
                  {userHelpers.getFullName(user).charAt(0).toUpperCase()}
                </div>
                <span>{userHelpers.getFullName(user)}</span>
              </div>
            </div>
            <div className="detail-item">
              <label>Email Address</label>
              <div className="detail-value">
                <a href={`mailto:${user.email}`} className="email-link">
                  {user.email}
                </a>
              </div>
            </div>
            <div className="detail-item">
              <label>User ID</label>
              <div className="detail-value user-id">
                {user._id}
              </div>
            </div>
            <div className="detail-item">
              <label>Account Created</label>
              <div className="detail-value">
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
              <div className="detail-item">
                <label>Last Updated</label>
                <div className="detail-value">
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
        <div className="detail-section">
          <h3>Role and Permissions</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Role</label>
              <div className="detail-value">
                <span className={`role-badge role-${user.role}`}>
                  {userHelpers.getRoleDisplayText(user.role)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Portal Type</label>
              <div className="detail-value">
                <span className={`portal-badge portal-${user.portalType}`}>
                  {userHelpers.getPortalDisplayText(user.portalType)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Status</label>
              <div className="detail-value">
                <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {userHelpers.getStatusText(user.isActive)}
                </span>
              </div>
            </div>
            <div className="detail-item">
              <label>Permissions</label>
              <div className="detail-value">
                <div className="permissions-list">
                  {userHelpers.getUserPermissions(user).map((permission, index) => (
                    <span key={index} className="permission-tag">
                      {permission}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="detail-section">
          <h3>Organization</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Account</label>
              <div className="detail-value">
                {user.accountId ? (
                  <div className="org-info">
                    <span className="org-name">{user.accountId.name}</span>
                    <span className="org-id">ID: {user.accountId._id}</span>
                  </div>
                ) : (
                  <span className="no-data">Not assigned</span>
                )}
              </div>
            </div>
            <div className="detail-item">
              <label>Agency</label>
              <div className="detail-value">
                {user.agencyId ? (
                  <div className="org-info">
                    <span className="org-name">{user.agencyId.name}</span>
                    <span className="org-id">ID: {user.agencyId._id}</span>
                  </div>
                ) : (
                  <span className="no-data">Not assigned</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        {user.profile && Object.values(user.profile).some(value => value) && (
          <div className="detail-section">
            <h3>Profile Information</h3>
            <div className="detail-grid">
              {user.profile.phone && (
                <div className="detail-item">
                  <label>Phone Number</label>
                  <div className="detail-value">
                    <a href={`tel:${user.profile.phone}`} className="phone-link">
                      {user.profile.phone}
                    </a>
                  </div>
                </div>
              )}
              {user.profile.department && (
                <div className="detail-item">
                  <label>Department</label>
                  <div className="detail-value">{user.profile.department}</div>
                </div>
              )}
              {user.profile.position && (
                <div className="detail-item">
                  <label>Position</label>
                  <div className="detail-value">{user.profile.position}</div>
                </div>
              )}
              {user.profile.address && (
                <div className="detail-item full-width">
                  <label>Address</label>
                  <div className="detail-value address">
                    {user.profile.address}
                  </div>
                </div>
              )}
              {user.profile.notes && (
                <div className="detail-item full-width">
                  <label>Notes</label>
                  <div className="detail-value notes">
                    {user.profile.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity Summary */}
        <div className="detail-section">
          <h3>Activity Summary</h3>
          <div className="activity-stats">
            <div className="stat-item">
              <div className="stat-value">
                {user.subordinates?.length || 0}
              </div>
              <div className="stat-label">Subordinates</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {user.lastLoginAt ? 
                  new Date(user.lastLoginAt).toLocaleDateString() : 
                  'Never'
                }
              </div>
              <div className="stat-label">Last Login</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))}
              </div>
              <div className="stat-label">Days Active</div>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete User</h3>
            <p>
              Are you sure you want to delete <strong>{userHelpers.getFullName(user)}</strong>?
              This action cannot be undone and will permanently remove all user data.
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-outline"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteUser}
                className="btn btn-danger"
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