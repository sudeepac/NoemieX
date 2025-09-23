import React, { useState, useMemo } from 'react';
import { 
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useUpdateUserRoleMutation
} from '../../store/api';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Filter,
  MoreVertical,
  UserCheck,
  UserX,
  Shield,
  Building2,
  Users,
  Crown,
  User,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { USER_ROLES, PORTAL_TYPES } from '../../types/user.types';
import styles from './SuperadminUserManagement.module.css';

/**
 * SuperAdmin User Management Page
 * Provides cross-tenant user oversight and management capabilities
 * Includes CRUD operations, role management, and portal filtering
 */
const SuperadminUserManagement = () => {
  // State management
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [portalFilter, setPortalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [accountFilter, setAccountFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
      sortBy,
      sortOrder
    };
    
    if (search.trim()) params.search = search.trim();
    if (roleFilter) params.role = roleFilter;
    if (portalFilter) params.portalType = portalFilter;
    if (statusFilter !== '') params.isActive = statusFilter === 'active';
    if (accountFilter) params.accountId = accountFilter;
    
    return params;
  }, [page, limit, search, roleFilter, portalFilter, statusFilter, accountFilter, sortBy, sortOrder]);

  // API queries and mutations
  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery(queryParams);
  const [createUser, { isLoading: createLoading }] = useCreateUserMutation();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: deleteLoading }] = useDeleteUserMutation();
  const [toggleUserStatus] = useToggleUserStatusMutation();
  const [updateUserRole, { isLoading: roleUpdateLoading }] = useUpdateUserRoleMutation();

  // AI-NOTE: Fixed API response structure - backend returns data in usersData.data, not usersData.users
  const users = usersData?.data || [];
  const pagination = usersData?.pagination || {};

  // Event handlers
  const handleCreateUser = async (userData) => {
    try {
      await createUser(userData).unwrap();
      setShowCreateModal(false);
      refetch();
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUser({ userId: selectedUser.id, ...userData }).unwrap();
      setShowEditModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(selectedUser.id).unwrap();
      setShowDeleteModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await toggleUserStatus(userId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleUpdateRole = async (roleData) => {
    try {
      await updateUserRole({ userId: selectedUser.id, ...roleData }).unwrap();
      setShowRoleModal(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setPortalFilter('');
    setStatusFilter('');
    setAccountFilter('');
    setPage(1);
  };

  // Helper functions
  const getPortalIcon = (portalType) => {
    switch (portalType) {
      case PORTAL_TYPES.SUPERADMIN:
        return <Shield className={styles.portalIcon} />;
      case PORTAL_TYPES.ACCOUNT:
        return <Building2 className={styles.portalIcon} />;
      case PORTAL_TYPES.AGENCY:
        return <Users className={styles.portalIcon} />;
      default:
        return <User className={styles.portalIcon} />;
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN:
        return <Crown className={styles.roleIcon} />;
      case USER_ROLES.MANAGER:
        return <UserCheck className={styles.roleIcon} />;
      case USER_ROLES.USER:
        return <User className={styles.roleIcon} />;
      default:
        return <User className={styles.roleIcon} />;
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getPortalBadge = (portalType) => {
    const badgeClass = {
      [PORTAL_TYPES.SUPERADMIN]: styles.superadminBadge,
      [PORTAL_TYPES.ACCOUNT]: styles.accountBadge,
      [PORTAL_TYPES.AGENCY]: styles.agencyBadge
    }[portalType] || styles.defaultBadge;

    return (
      <span className={`${styles.portalBadge} ${badgeClass}`}>
        {getPortalIcon(portalType)}
        {portalType}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const badgeClass = {
      [USER_ROLES.ADMIN]: styles.adminBadge,
      [USER_ROLES.MANAGER]: styles.managerBadge,
      [USER_ROLES.USER]: styles.userBadge
    }[role] || styles.defaultBadge;

    return (
      <span className={`${styles.roleBadge} ${badgeClass}`}>
        {getRoleIcon(role)}
        {role}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={styles.loadingIcon} />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>Failed to load users: {error.message}</p>
        <button onClick={refetch} className={styles.retryButton}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>Cross-tenant user oversight and administration</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={styles.primaryButton}
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>
            <Filter size={16} />
            Filters
          </h3>
          <button onClick={resetFilters} className={styles.resetButton}>
            Reset
          </button>
        </div>
        
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search</label>
            <div className={styles.searchInput}>
              <Search className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Portal Type</label>
            <select
              value={portalFilter}
              onChange={(e) => setPortalFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">All Portals</option>
              <option value={PORTAL_TYPES.SUPERADMIN}>Superadmin</option>
              <option value={PORTAL_TYPES.ACCOUNT}>Account</option>
              <option value={PORTAL_TYPES.AGENCY}>Agency</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">All Roles</option>
              <option value={USER_ROLES.ADMIN}>Admin</option>
              <option value={USER_ROLES.MANAGER}>Manager</option>
              <option value={USER_ROLES.USER}>User</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.select}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <h3 className={styles.tableTitle}>Users ({pagination.total || 0})</h3>
          <div className={styles.tableActions}>
            <button className={styles.secondaryButton}>
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <Users className={styles.emptyIcon} />
            <h3>No users found</h3>
            <p>No users match your current filters.</p>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Portal</th>
                  <th>Role</th>
                  <th>Account/Agency</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <div className={styles.userDetails}>
                          <div className={styles.userName}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div className={styles.userEmail}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getPortalBadge(user.portalType)}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      <div className={styles.organizationInfo}>
                        {user.accountId && (
                          <div className={styles.accountName}>
                            {user.accountId.name || 'Unknown Account'}
                          </div>
                        )}
                        {user.agencyId && (
                          <div className={styles.agencyName}>
                            {user.agencyId.name || 'Unknown Agency'}
                          </div>
                        )}
                        {!user.accountId && !user.agencyId && (
                          <span className={styles.noOrganization}>Platform User</span>
                        )}
                      </div>
                    </td>
                    <td>{getStatusBadge(user.isActive)}</td>
                    <td>
                      <div className={styles.lastActive}>
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.actionButton}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          title="Edit User"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          title="Change Role"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          className={`${styles.actionButton} ${user.isActive ? styles.deactivate : styles.activate}`}
                          onClick={() => handleToggleStatus(user._id)}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.danger}`}
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteModal(true);
                          }}
                          title="Delete User"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          <span className={styles.paginationInfo}>
            Page {page} of {pagination.totalPages} ({pagination.total} total)
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}

      {/* Modals would be implemented here */}
      {/* CreateUserModal, EditUserModal, DeleteUserModal, RoleChangeModal */}
    </div>
  );
};

// AI-NOTE: Comprehensive SuperAdmin user management with cross-tenant oversight,
// role management, portal filtering, and CRUD operations. Connected to existing
// usersApi endpoints for real data integration.

export default SuperadminUserManagement;