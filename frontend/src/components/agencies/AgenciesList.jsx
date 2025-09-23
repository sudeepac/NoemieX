import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  useGetAgenciesQuery,
  useDeleteAgencyMutation,
  useToggleAgencyStatusMutation
} from '../../store/api/api';
import {
  setFilters,
  resetFilters,
  toggleFilters,
  setSelectedAgencies,
  toggleAgencySelection,
  clearSelection,
  setEditingAgency,
  showDeleteConfirmation,
  hideDeleteConfirmation,
  showStatusConfirmation,
  hideStatusConfirmation,
  setError,
  clearError
} from '../../store/slices/agenciesUi.slice';
import { PORTAL_TYPES } from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
import styles from './AgenciesList.module.css';

/**
 * AgenciesList component with comprehensive filtering and role-based access
 * Supports superadmin (all agencies) and account admin (account agencies only)
 */
function AgenciesList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const {
    filters,
    selectedAgencies,
    showFilters,
    showDeleteModal,
    showStatusModal,
    agencyToDelete,
    agencyToToggle,
    error
  } = useSelector((state) => state.agencies);

  // Apply account context for account admins
  const queryFilters = {
    ...filters,
    ...(currentUser?.portalType === PORTAL_TYPES.ACCOUNT && {
      accountId: currentUser.accountId
    })
  };

  // RTK Query hooks
  const { 
    data: agenciesData, 
    isLoading, 
    isError, 
    error: queryError, 
    refetch 
  } = useGetAgenciesQuery(queryFilters);

  const [deleteAgency, { isLoading: isDeleting }] = useDeleteAgencyMutation();
  const [toggleAgencyStatus, { isLoading: isToggling }] = useToggleAgencyStatusMutation();

  // Handle query errors
  useEffect(() => {
    if (isError && queryError) {
      dispatch(setError(queryError?.data?.message || 'Failed to load agencies'));
    }
  }, [isError, queryError, dispatch]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  /**
   * Handle filter changes with debouncing for search
   */
  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  /**
   * Handle search input with debouncing
   */
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    // Debounce search to avoid excessive API calls
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      handleFilterChange({ search: searchValue, page: 1 });
    }, 300);
  };

  /**
   * Handle pagination
   */
  const handlePageChange = (newPage) => {
    handleFilterChange({ page: newPage });
  };

  /**
   * Handle sorting
   */
  const handleSort = (sortBy) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    handleFilterChange({ sortBy, sortOrder: newSortOrder });
  };

  /**
   * Handle agency selection
   */
  const handleAgencySelection = (agencyId) => {
    dispatch(toggleAgencySelection(agencyId));
  };

  /**
   * Handle select all agencies
   */
  const handleSelectAll = () => {
    if (selectedAgencies.length === agenciesData?.data?.agencies?.length) {
      dispatch(clearSelection());
    } else {
      const allIds = agenciesData?.data?.agencies?.map(agency => agency._id) || [];
      dispatch(setSelectedAgencies(allIds));
    }
  };

  /**
   * Handle agency deletion
   */
  const handleDeleteAgency = async () => {
    try {
      if (Array.isArray(agencyToDelete)) {
        // Bulk delete
        await Promise.all(agencyToDelete.map(id => deleteAgency(id).unwrap()));
        dispatch(clearSelection());
      } else {
        // Single delete
        await deleteAgency(agencyToDelete).unwrap();
      }
      dispatch(hideDeleteConfirmation());
      refetch();
    } catch (error) {
      dispatch(setError(error?.data?.message || 'Failed to delete agency'));
      dispatch(hideDeleteConfirmation());
    }
  };

  /**
   * Handle agency status toggle
   */
  const handleToggleStatus = async () => {
    try {
      if (Array.isArray(agencyToToggle)) {
        // Bulk status toggle
        await Promise.all(agencyToToggle.map(id => toggleAgencyStatus(id).unwrap()));
        dispatch(clearSelection());
      } else {
        // Single status toggle
        await toggleAgencyStatus(agencyToToggle).unwrap();
      }
      dispatch(hideStatusConfirmation());
      refetch();
    } catch (error) {
      dispatch(setError(error?.data?.message || 'Failed to update agency status'));
      dispatch(hideStatusConfirmation());
    }
  };

  /**
   * Handle edit agency
   */
  const handleEditAgency = (agency) => {
    dispatch(setEditingAgency(agency));
    navigate(`/agencies/edit/${agency._id}`);
  };

  /**
   * Handle view agency details
   */
  const handleViewAgency = (agencyId) => {
    navigate(`/agencies/${agencyId}`);
  };

  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  /**
   * Format commission split percentage
   */
  const formatCommission = (percentage) => {
    return `${percentage}%`;
  };

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-badge active' : 'status-badge inactive';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.agenciesListContainer}>
        <LoadingSpinner message="Loading agencies..." />
      </div>
    );
  }

  const agencies = agenciesData?.data?.agencies || [];
  const pagination = agenciesData?.data?.pagination || {};
  const hasAgencies = agencies.length > 0;
  const isAllSelected = selectedAgencies.length === agencies.length && agencies.length > 0;
  const hasSelection = selectedAgencies.length > 0;

  return (
    <div className={styles.agenciesListContainer}>
      {/* Header */}
      <div className={styles.listHeader}>
        <div className={styles.headerContent}>
          <h2>Agencies</h2>
          <p className={styles.headerSubtitle}>
            {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN 
              ? 'Manage all agencies across accounts'
              : 'Manage your account agencies'
            }
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => dispatch(toggleFilters())}
          >
            Filters {showFilters ? '▼' : '▶'}
          </button>
          <Link to="/agencies/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + Add Agency
          </Link>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Search</label>
              <input
                type="text"
                placeholder="Search agencies..."
                defaultValue={filters.search}
                onChange={handleSearchChange}
                className={styles.filterInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select
                value={filters.isActive || ''}
                onChange={(e) => handleFilterChange({ 
                  isActive: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className={styles.filterSelect}
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="commissionSplitPercent">Commission</option>
                <option value="usersCount">Users Count</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Order</label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
                className={styles.filterSelect}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
          
          <div className={styles.filtersActions}>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {hasSelection && (
        <div className={styles.bulkActions}>
          <span>{selectedAgencies.length} selected</span>
          <div className={styles.bulkButtons}>
            <button 
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => dispatch(showStatusConfirmation(selectedAgencies))}
              disabled={isToggling}
            >
              Toggle Status
            </button>
            <button 
              className={`${styles.btn} ${styles.btnDanger}`}
              onClick={() => dispatch(showDeleteConfirmation(selectedAgencies))}
              disabled={isDeleting}
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Agencies Table */}
      {hasAgencies ? (
        <div className={styles.tableContainer}>
          <table className={styles.agenciesTable}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('name')}
                >
                  Name {filters.sortBy === 'name' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('commissionSplitPercent')}
                >
                  Commission {filters.sortBy === 'commissionSplitPercent' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('usersCount')}
                >
                  Users {filters.sortBy === 'usersCount' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Status</th>
                {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN && <th>Account</th>}
                <th 
                  className={styles.sortable}
                  onClick={() => handleSort('createdAt')}
                >
                  Created {filters.sortBy === 'createdAt' && (filters.sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <tr key={agency._id} className={styles.agencyRow}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedAgencies.includes(agency._id)}
                      onChange={() => handleAgencySelection(agency._id)}
                    />
                  </td>
                  <td>
                    <div className={styles.agencyName}>
                      <strong>{agency.name}</strong>
                      {agency.description && (
                        <div className={styles.agencyDescription}>{agency.description}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={styles.commissionBadge}>
                      {formatCommission(agency.commissionSplitPercent)}
                    </span>
                  </td>
                  <td>
                    <span className={styles.usersCount}>{agency.usersCount || 0}</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(agency.isActive)}>
                      {agency.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {currentUser?.portalType === PORTAL_TYPES.SUPERADMIN && (
                    <td>
                      <span className={styles.accountName}>
                        {agency.accountId?.name || 'N/A'}
                      </span>
                    </td>
                  )}
                  <td>
                    <span className={styles.createdDate}>
                      {new Date(agency.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button 
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnSecondary}`}
                        onClick={() => handleViewAgency(agency._id)}
                        title="View Details"
                      >
                        View
                      </button>
                      <button 
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnPrimary}`}
                        onClick={() => handleEditAgency(agency)}
                        title="Edit Agency"
                      >
                        Edit
                      </button>
                      <button 
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnWarning}`}
                        onClick={() => dispatch(showStatusConfirmation(agency._id))}
                        disabled={isToggling}
                        title={agency.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {agency.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className={`${styles.btn} ${styles.btnSm} ${styles.btnDanger}`}
                        onClick={() => dispatch(showDeleteConfirmation(agency._id))}
                        disabled={isDeleting}
                        title="Delete Agency"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3>No agencies found</h3>
          <p>Get started by creating your first agency.</p>
          <Link to="/agencies/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            Create Agency
          </Link>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
          >
            Previous
          </button>
          
          <span className={styles.paginationInfo}>
            Page {pagination.currentPage} of {pagination.totalPages}
            ({pagination.totalAgencies} total)
          </span>
          
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete {Array.isArray(agencyToDelete) 
                ? `${agencyToDelete.length} agencies` 
                : 'this agency'
              }? This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => dispatch(hideDeleteConfirmation())}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDeleteAgency}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {showStatusModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Status Change</h3>
            <p>
              Are you sure you want to toggle the status of {Array.isArray(agencyToToggle) 
                ? `${agencyToToggle.length} agencies` 
                : 'this agency'
              }?
            </p>
            <div className={styles.modalActions}>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={() => dispatch(hideStatusConfirmation())}
                disabled={isToggling}
              >
                Cancel
              </button>
              <button 
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleToggleStatus}
                disabled={isToggling}
              >
                {isToggling ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgenciesList;

// AI-NOTE: Created AgenciesList component following AccountsList and UsersList patterns. Includes comprehensive filtering, pagination, bulk operations, role-based access control, and modal confirmations for safe operations.