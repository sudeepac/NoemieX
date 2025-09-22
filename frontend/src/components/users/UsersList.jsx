import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useGetUsersQuery, 
  useDeleteUserMutation, 
  useToggleUserStatusMutation 
} from '../../store/api/users.api';
import { 
  createUserFilters, 
  USER_ROLES, 
  PORTAL_TYPES, 
  userHelpers 
} from '../../types/user.types';
import LoadingSpinner from '../common/loading-spinner.component';
import './UsersList.css';

// UsersList component with comprehensive filtering and role-based access
function UsersList() {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State for filters and UI
  const [filters, setFilters] = useState(createUserFilters());
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // RTK Query hooks
  const { 
    data: usersData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetUsersQuery(filters);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle sorting
  const handleSort = (sortBy) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId).unwrap();
        alert('User deleted successfully');
      } catch (error) {
        alert(`Error deleting user: ${error.data?.message || error.message}`);
      }
    }
  };

  // Handle user status toggle
  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId).unwrap();
      alert('User status updated successfully');
    } catch (error) {
      alert(`Error updating user status: ${error.data?.message || error.message}`);
    }
  };

  // Check if current user can perform actions
  const canCreateUsers = () => {
    if (!currentUser) return false;
    return currentUser.portalType === PORTAL_TYPES.SUPERADMIN || 
           [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(currentUser.role);
  };

  const canEditUser = (user) => {
    if (!currentUser || !user) return false;
    
    // Users can edit themselves
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

  // Reset filters
  const resetFilters = () => {
    setFilters(createUserFilters());
  };

  // Get available role options based on current user
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    const roles = Object.values(USER_ROLES);
    
    if (currentUser.portalType === PORTAL_TYPES.SUPERADMIN) {
      return roles;
    }
    
    // Users can only filter by roles they can manage
    const currentUserLevel = userHelpers.ROLE_HIERARCHY[currentUser.role] || 0;
    return roles.filter(role => {
      const roleLevel = userHelpers.ROLE_HIERARCHY[role] || 0;
      return roleLevel < currentUserLevel;
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="error-container">
        <h3>Error Loading Users</h3>
        <p>{error?.data?.message || 'Failed to load users'}</p>
        <button onClick={refetch} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const { users = [], pagination = {} } = usersData?.data || {};

  return (
    <div className="users-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Users Management</h1>
          <p>Manage users, roles, and permissions</p>
        </div>
        <div className="header-actions">
          {canCreateUsers() && (
            <Link to="/users/new" className="btn btn-primary">
              <span className="icon">+</span>
              Add User
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={filters.search}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
          >
            Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => handleFilterChange('role', e.target.value)}
                >
                  <option value="">All Roles</option>
                  {getAvailableRoles().map(role => (
                    <option key={role} value={role}>
                      {userHelpers.getRoleDisplayText(role)}
                    </option>
                  ))}
                </select>
              </div>

              {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN && (
                <div className="filter-group">
                  <label>Portal Type</label>
                  <select
                    value={filters.portalType}
                    onChange={(e) => handleFilterChange('portalType', e.target.value)}
                  >
                    <option value="">All Portals</option>
                    {Object.values(PORTAL_TYPES).map(portal => (
                      <option key={portal} value={portal}>
                        {userHelpers.getPortalDisplayText(portal)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onChange={(e) => handleFilterChange('isActive', 
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Items per page</label>
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              <div className="filter-actions">
                <button onClick={resetFilters} className="btn btn-outline">
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('firstName')} className="sortable">
                Name {filters.sortBy === 'firstName' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {filters.sortBy === 'email' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Role {filters.sortBy === 'role' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN && (
                <th>Portal</th>
              )}
              <th>Account</th>
              {(currentUser?.portalType === PORTAL_TYPES.SUPERADMIN || 
                currentUser?.portalType === PORTAL_TYPES.ACCOUNT) && (
                <th>Agency</th>
              )}
              <th onClick={() => handleSort('isActive')} className="sortable">
                Status {filters.sortBy === 'isActive' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('createdAt')} className="sortable">
                Created {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {userHelpers.getFullName(user).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">
                          {userHelpers.getFullName(user)}
                        </div>
                        <div className="user-id">ID: {user._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {userHelpers.getRoleDisplayText(user.role)}
                    </span>
                  </td>
                  {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN && (
                    <td>
                      <span className={`portal-badge portal-${user.portalType}`}>
                        {userHelpers.getPortalDisplayText(user.portalType)}
                      </span>
                    </td>
                  )}
                  <td>{user.accountId?.name || 'N/A'}</td>
                  {(currentUser?.portalType === PORTAL_TYPES.SUPERADMIN || 
                    currentUser?.portalType === PORTAL_TYPES.ACCOUNT) && (
                    <td>{user.agencyId?.name || 'N/A'}</td>
                  )}
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {userHelpers.getStatusText(user.isActive)}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/users/${user._id}`} 
                        className="btn btn-sm btn-outline"
                        title="View Details"
                      >
                        View
                      </Link>
                      {canEditUser(user) && (
                        <Link 
                          to={`/users/${user._id}/edit`} 
                          className="btn btn-sm btn-primary"
                          title="Edit User"
                        >
                          Edit
                        </Link>
                      )}
                      {canEditUser(user) && (
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          disabled={isToggling}
                          className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {canDeleteUser(user) && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={isDeleting}
                          className="btn btn-sm btn-danger"
                          title="Delete User"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} users
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.currentPage - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`btn btn-sm ${pageNum === pagination.currentPage ? 'btn-primary' : 'btn-outline'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn btn-outline btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersList;

// AI-NOTE: Created comprehensive UsersList component with filtering, pagination, search, and role-based access control. Implements business rules for user management permissions and portal-specific visibility.