import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetAccountsQuery,
  useDeleteAccountMutation,
  useToggleAccountStatusMutation
} from '../../store/api/accountsApi';
import { 
  accountHelpers,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUSES,
  BILLING_STATUSES
} from '../../types/account.types';
import { PORTAL_TYPES } from '../../types/user.types';
import { Eye, Edit, Power, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import CreateAccountModal from './CreateAccountModal';
import ConfirmationModal from '../common/ConfirmationModal';
import styles from './AccountsList.module.css';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false,
    showSuccess: false
  });
  const [editingAccount, setEditingAccount] = useState(null);

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
  const handleDeleteAccount = (accountId, accountName) => {
    setConfirmationModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Account',
      message: `Are you sure you want to delete "${accountName}"? This action cannot be undone and will permanently remove all associated data.`,
      onConfirm: () => confirmDeleteAccount(accountId),
      isLoading: false,
      showSuccess: false
    });
  };

  const confirmDeleteAccount = async (accountId) => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      await deleteAccount(accountId).unwrap();
      
      // Show success message
      setConfirmationModal(prev => ({
        ...prev,
        isLoading: false,
        showSuccess: true,
        successMessage: 'Account deleted successfully!'
      }));
      
      // Close modal after showing success
      setTimeout(() => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false, showSuccess: false }));
      }, 2000);
    } catch (error) {
      setConfirmationModal(prev => ({ ...prev, isLoading: false }));
      alert(`Error deleting account: ${error.data?.message || error.message}`);
    }
  };

  // Handle account status toggle
  const handleToggleStatus = (accountId, accountName, isActive) => {
    const action = isActive ? 'deactivate' : 'activate';
    const actionTitle = isActive ? 'Deactivate Account' : 'Activate Account';
    
    setConfirmationModal({
      isOpen: true,
      type: isActive ? 'warning' : 'info',
      title: actionTitle,
      message: `Are you sure you want to ${action} "${accountName}"? ${isActive ? 'Users will lose access to this account.' : 'Users will regain access to this account.'}`,
      onConfirm: () => confirmToggleStatus(accountId),
      isLoading: false,
      showSuccess: false
    });
  };

  const confirmToggleStatus = async (accountId) => {
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      await toggleAccountStatus(accountId).unwrap();
      
      // Show success message
      setConfirmationModal(prev => ({
        ...prev,
        isLoading: false,
        showSuccess: true,
        successMessage: 'Account status updated successfully!'
      }));
      
      // Close modal after showing success
      setTimeout(() => {
        setConfirmationModal(prev => ({ ...prev, isOpen: false, showSuccess: false }));
      }, 2000);
    } catch (error) {
      setConfirmationModal(prev => ({ ...prev, isLoading: false }));
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

  // Handle edit account
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowCreateModal(true);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <>
        <ErrorMessage 
          error={{message: error?.data?.message || 'Failed to load accounts'}} 
          variant="page" 
          type="error"
          title="Error Loading Accounts"
        />
        <button onClick={refetch} className={`${styles.btn} ${styles.btnPrimary}`}>
          Try Again
        </button>
      </>
    );
  }

  // AI-NOTE: Fixed data structure - backend paginatedResponse puts accounts directly in data field
  const accounts = accountsData?.data || [];
  const pagination = accountsData?.pagination || {};

  return (
    <div className={styles.accountsListContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
          <div className={styles.headerLeft}>
            <h1>Accounts Management</h1>
            <p>Manage tenant accounts, subscriptions, and billing</p>
          </div>
          <div className={styles.headerActions}>
            {canManageAccounts() && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                <span className={styles.icon}>+</span>
                Add Account
              </button>
            )}
          </div>
        </div>

      {/* Filters */}
      <div className={styles.filtersSection}>
          <div className={styles.filtersHeader}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search accounts by name or email..."
                value={filters.search}
                onChange={handleSearch}
                className={styles.searchInput}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`${styles.btn} ${styles.btnOutline}`}
            >
              <span className={styles.icon}>⚙</span>
              Filters
            </button>
            {(filters.search || filters.isActive !== undefined) && (
              <button onClick={resetFilters} className={`${styles.btn} ${styles.btnOutline}`}>
                <span className={styles.icon}>✕</span>
                Clear
              </button>
            )}
          </div>

        {showFilters && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label>Status:</label>
              <select
                value={filters.isActive === undefined ? '' : filters.isActive}
                onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
                className={styles.filterSelect}
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Items per page:</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className={styles.filterSelect}
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
      <div className={styles.resultsSummary}>
        <span>Found {pagination.totalItems || 0} accounts</span>
      </div>

      {/* Accounts Table */}
      <div className={styles.tableContainer}>
        <table className={styles.accountsTable}>
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} className={styles.sortable}>
                Account {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Contact Info</th>
              <th onClick={() => handleSort('subscription.plan')} className={styles.sortable}>
                Subscription {filters.sortBy === 'subscription.plan' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Billing</th>
              <th>Users/Agencies</th>
              <th onClick={() => handleSort('isActive')} className={styles.sortable}>
                Status {filters.sortBy === 'isActive' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('createdAt')} className={styles.sortable}>
                Created {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.noData}>
                  No accounts found matching your criteria
                </td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account._id}>
                  <td>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountAvatar}>
                        {account.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.accountName}>
                          {account.name}
                        </div>
                        <div className={styles.accountId}>ID: {account._id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div>{account.contactInfo?.email}</div>
                      {account.contactInfo?.phone && (
                        <div className={styles.phone}>{account.contactInfo.phone}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.subscriptionInfo}>
                      <span className={`${styles.planBadge} ${styles[`plan${account.subscription?.plan}`]}`}>
                        {accountHelpers.getPlanDisplayText(account.subscription?.plan)}
                      </span>
                      <div className={`${styles.subscriptionStatus} ${styles[accountHelpers.getSubscriptionStatusClass(account.subscription?.status)]}`}>
                        {accountHelpers.getSubscriptionStatusText(account.subscription?.status)}
                      </div>
                      {accountHelpers.isTrialAccount(account) && (
                        <div className={styles.trialInfo}>
                          {accountHelpers.getTrialDaysRemaining(account)} days left
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.billingInfo}>
                      <span className={`${styles.billingStatus} ${styles[accountHelpers.getBillingStatusClass(account.billing?.status)]}`}>
                        {accountHelpers.getBillingStatusText(account.billing?.status)}
                      </span>
                      <div className={styles.revenue}>
                        Revenue: {accountHelpers.formatCurrency(account.billing?.totalRevenue, account.settings?.currency)}
                      </div>
                      {account.billing?.outstandingBalance > 0 && (
                        <div className={styles.outstanding}>
                          Outstanding: {accountHelpers.formatCurrency(account.billing?.outstandingBalance, account.settings?.currency)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.counts}>
                      <div>Users: {account.usersCount || 0}</div>
                      <div>Agencies: {account.agenciesCount || 0}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${account.isActive ? styles.active : styles.inactive}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(account.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Link 
                        to={`/superadmin/accounts/${account._id}`} 
                        className={`${styles.iconBtn} ${styles.iconBtnOutline}`}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                      {canManageAccounts() && (
                        <button
                          onClick={() => handleEditAccount(account)}
                          className={`${styles.iconBtn} ${styles.iconBtnPrimary}`}
                          title="Edit Account"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {canManageAccounts() && (
                        <button
                          onClick={() => handleToggleStatus(account._id, account.name, account.isActive)}
                          disabled={isToggling}
                          className={`${styles.iconBtn} ${account.isActive ? styles.iconBtnWarning : styles.iconBtnSuccess}`}
                          title={account.isActive ? 'Deactivate Account' : 'Activate Account'}
                        >
                          <Power size={16} />
                        </button>
                      )}
                      {canManageAccounts() && (
                        <button
                          onClick={() => handleDeleteAccount(account._id, account.name)}
                          disabled={isDeleting}
                          className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                          title="Delete Account"
                        >
                          <Trash2 size={16} />
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
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInfo}>
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
            {pagination.totalItems} accounts
          </div>
          <div className={styles.paginationControls}>
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
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
                  className={`${styles.btn} ${styles.btnSm} ${pageNum === pagination.currentPage ? styles.btnPrimary : styles.btnOutline}`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className={`${styles.btn} ${styles.btnOutline} ${styles.btnSm}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {/* Create Account Modal */}
      {showCreateModal && (
        <CreateAccountModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAccount(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingAccount(null);
            refetch(); // Refresh the accounts list
          }}
          editingAccount={editingAccount}
        />
      )}
      
      {/* Confirmation Modal */}
       <ConfirmationModal
         isOpen={confirmationModal.isOpen}
         type={confirmationModal.type}
         title={confirmationModal.title}
         message={confirmationModal.message}
         onConfirm={confirmationModal.onConfirm}
         onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
         isLoading={confirmationModal.isLoading}
         showSuccess={confirmationModal.showSuccess}
         successMessage={confirmationModal.successMessage}
       />
    </div>
  );
}

export default AccountsList;

// AI-NOTE: Created comprehensive AccountsList component following UsersList pattern with account-specific features like subscription plans, billing status, trial management, and superadmin-only access controls. Includes search, filtering, pagination, and proper business rule enforcement.
// AI-NOTE: Fixed pagination NaN values by using correct backend response properties (currentPage, itemsPerPage, totalItems) instead of (page, limit, totalItems)
// AI-NOTE: Replaced text action buttons with icon buttons (Eye, Edit, Power, Trash2) to make table rows slimmer and more modern