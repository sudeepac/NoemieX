import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  useGetAccountsQuery, 
  useDeleteAccountMutation, 
  useToggleAccountStatusMutation 
} from '../../store/api/accounts.api';
import { 
  accountHelpers,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_STATUSES
} from '../../types/account.types';
import { PORTAL_TYPES } from '../../types/user.types';
import LoadingSpinner from '../common/loading-spinner.component';
import './AccountsList.css';

// AccountsList component with comprehensive filtering and superadmin access
function AccountsList() {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // State for filters and UI
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState([]);

  // RTK Query hooks
  const { 
    data: accountsData, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useGetAccountsQuery(filters);

  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [toggleAccountStatus, { isLoading: isToggling }] = useToggleAccountStatusMutation();

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

  // Handle account deletion
  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone and will affect all associated users and agencies.')) {
      try {
        await deleteAccount(accountId).unwrap();
        alert('Account deleted successfully');
      } catch (error) {
        alert(`Error deleting account: ${error.data?.message || error.message}`);
      }
    }
  };

  // Handle account status toggle
  const handleToggleStatus = async (accountId) => {
    try {
      await toggleAccountStatus(accountId).unwrap();
      alert('Account status updated successfully');
    } catch (error) {
      alert(`Error updating account status: ${error.data?.message || error.message}`);
    }
  };

  // Check if current user can perform actions (only superadmin)
  const canManageAccounts = () => {
    return currentUser?.portalType === PORTAL_TYPES.SUPERADMIN;
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      isActive: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="error-container">
        <h3>Error Loading Accounts</h3>
        <p>{error?.data?.message || 'Failed to load accounts'}</p>
        <button onClick={refetch} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const { accounts = [], pagination = {} } = accountsData?.data || {};

  return (
    <div className="accounts-list-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Accounts Management</h1>
          <p>Manage tenant accounts, subscriptions, and billing</p>
        </div>
        <div className="header-actions">
          {canManageAccounts() && (
            <Link to="/accounts/new" className="btn btn-primary">
              <span className="icon">+</span>
              Add Account
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
              placeholder="Search accounts by name or email..."
              value={filters.search}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline"
          >
            <span className="icon">⚙</span>
            Filters
          </button>
          {(filters.search || filters.isActive !== undefined) && (
            <button onClick={resetFilters} className="btn btn-outline">
              <span className="icon">✕</span>
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Status:</label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Items per page:</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="filter-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        <span>Found {pagination.totalItems || 0} accounts</span>
      </div>

      {/* Accounts Table */}
      <div className="table-container">
        <table className="accounts-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className="sortable">
                Account {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Contact Info</th>
              <th onClick={() => handleSort('subscription.plan')} className="sortable">
                Subscription {filters.sortBy === 'subscription.plan' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Billing</th>
              <th>Users/Agencies</th>
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
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  No accounts found matching your criteria
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account._id}>
                  <td>
                    <div className="account-info">
                      <div className="account-avatar">
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="account-name">
                          {account.name}
                        </div>
                        <div className="account-id">ID: {account._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div>{account.contactInfo?.email}</div>
                      {account.contactInfo?.phone && (
                        <div className="phone">{account.contactInfo.phone}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="subscription-info">
                      <span className={`plan-badge plan-${account.subscription?.plan}`}>
                        {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
                      </span>
                      <div className={`subscription-status ${accountHelpers.getSubscriptionStatusClass(account.subscription?.status)}`}>
                        {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
                      </div>
                      {accountHelpers.isTrialAccount(account) && (
                        <div className="trial-info">
                          {accountHelpers.getTrialDaysRemaining(account)} days left
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="billing-info">
                      <span className={`billing-status ${accountHelpers.getBillingStatusClass(account.billing?.status)}`}>
                        {accountHelpers.getBillingStatusText(account.billing?.status)}
                      </span>
                      <div className="revenue">
                        Revenue: {accountHelpers.formatCurrency(account.billing?.totalRevenue, account.settings?.currency)}
                      </div>
                      {account.billing?.outstandingBalance > 0 && (
                        <div className="outstanding">
                          Outstanding: {accountHelpers.formatCurrency(account.billing?.outstandingBalance, account.settings?.currency)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="counts">
                      <div>Users: {account.usersCount || 0}</div>
                      <div>Agencies: {account.agenciesCount || 0}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${account.isActive ? 'active' : 'inactive'}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <Link 
                        to={`/accounts/${account._id}`} 
                        className="btn btn-sm btn-outline"
                        title="View Details"
                      >
                        View
                      </Link>
                      {canManageAccounts() && (
                        <Link 
                          to={`/accounts/${account._id}/edit`} 
                          className="btn btn-sm btn-primary"
                          title="Edit Account"
                        >
                          Edit
                        </Link>
                      )}
                      {canManageAccounts() && (
                        <button
                          onClick={() => handleToggleStatus(account._id)}
                          disabled={isToggling}
                          className={`btn btn-sm ${account.isActive ? 'btn-warning' : 'btn-success'}`}
                          title={account.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {account.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      {canManageAccounts() && (
                        <button
                          onClick={() => handleDeleteAccount(account._id)}
                          disabled={isDeleting}
                          className="btn btn-sm btn-danger"
                          title="Delete Account"
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
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
            {pagination.totalItems} accounts
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn btn-outline btn-sm"
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > pagination.totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`btn btn-sm ${pageNum === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
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

export default AccountsList;

// AI-NOTE: Created comprehensive AccountsList component following UsersList pattern with account-specific features like subscription plans, billing status, trial management, and superadmin-only access controls. Includes search, filtering, pagination, and proper business rule enforcement.