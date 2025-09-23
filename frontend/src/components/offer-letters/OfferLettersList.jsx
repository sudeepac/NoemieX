import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetOfferLettersQuery,
  useDeleteOfferLetterMutation,
  useUpdateOfferLetterStatusMutation
} from '../../store/api/api';
import {
  selectFilters,
  selectPagination,
  setFilters,
  setPagination,
  setPage,
  openForm,
  openDetail,
} from '../../store/slices/offerLettersUi.slice';
// AI-NOTE: Fixed import error - selectAuth selector doesn't exist in auth.slice, use direct state.auth access instead
import styles from './OfferLettersList.module.css';

/**
 * OfferLettersList component - displays paginated list of offer letters with filtering and search
 * Supports different portal views (superadmin, account, agency) with appropriate permissions
 */
const OfferLettersList = ({ portal = 'account' }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const { user } = useSelector((state) => state.auth);
  
  // Local state for search input
  const [searchInput, setSearchInput] = useState(filters.search);
  
  // Build query parameters based on filters and pagination
  const queryParams = {
    ...filters,
    page: pagination.page,
    limit: pagination.limit,
    sortBy: pagination.sortBy,
    sortOrder: pagination.sortOrder,
  };
  
  // Fetch offer letters data
  const {
    data: offerLettersData,
    isLoading,
    error,
    refetch,
  } = useGetOfferLettersQuery(queryParams);
  
  // Mutations
  const [deleteOfferLetter] = useDeleteOfferLetterMutation();
  const [updateStatus] = useUpdateOfferLetterStatusMutation();
  
  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ search: searchInput }));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchInput, dispatch]);
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value }));
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };
  
  // Handle sorting
  const handleSort = (sortBy) => {
    const newSortOrder = 
      pagination.sortBy === sortBy && pagination.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(setPagination({ sortBy, sortOrder: newSortOrder }));
  };
  
  // Handle offer letter actions
  const handleCreate = () => {
    dispatch(openForm({ mode: 'create' }));
  };
  
  const handleEdit = (offerLetter) => {
    dispatch(openForm({ mode: 'edit', offerLetter }));
  };
  
  const handleView = (offerLetter) => {
    dispatch(openDetail(offerLetter));
  };
  
  const handleReplace = (offerLetter) => {
    dispatch(openForm({ mode: 'replace', offerLetter }));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer letter?')) {
      try {
        await deleteOfferLetter(id).unwrap();
      } catch (error) {
        console.error('Failed to delete offer letter:', error);
      }
    }
  };
  
  const handleStatusChange = async (id, status) => {
    try {
      await updateStatus({ id, status }).unwrap();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      draft: styles.statusDraft,
      issued: styles.statusIssued,
      accepted: styles.statusAccepted,
      rejected: styles.statusRejected,
      expired: styles.statusExpired,
      replaced: styles.statusReplaced,
      cancelled: styles.statusCancelled,
    };
    return `${styles.statusBadge} ${statusClasses[status] || ''}`;
  };
  
  // Check permissions based on portal and role
  const canCreate = portal === 'superadmin' || (portal === 'account' && ['admin', 'manager'].includes(user?.role));
  const canEdit = (offerLetter) => {
    if (portal === 'superadmin') return true;
    if (portal === 'account') return ['admin', 'manager'].includes(user?.role);
    if (portal === 'agency') return user?.agencyId === offerLetter.agencyId?._id && ['admin', 'manager'].includes(user?.role);
    return false;
  };
  const canDelete = canEdit;
  
  if (isLoading) {
    return <div className={styles.loading}>Loading offer letters...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>Error loading offer letters: {error.message}</div>;
  }
  
  const { offerLetters = [], totalCount = 0, totalPages = 0 } = offerLettersData || {};
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Offer Letters</h2>
        {canCreate && (
          <button className={styles.createButton} onClick={handleCreate}>
            Create Offer Letter
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search offer letters..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="replaced">Replaced</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className={styles.filterInput}
            placeholder="From Date"
          />
        </div>
        
        <div className={styles.filterGroup}>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className={styles.filterInput}
            placeholder="To Date"
          />
        </div>
      </div>
      
      {/* Results count */}
      <div className={styles.resultsInfo}>
        Showing {offerLetters.length} of {totalCount} offer letters
      </div>
      
      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('issueDate')} className={styles.sortable}>
                Issue Date
                {pagination.sortBy === 'issueDate' && (
                  <span className={styles.sortIcon}>
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Student</th>
              <th>Course</th>
              <th>Institution</th>
              <th onClick={() => handleSort('status')} className={styles.sortable}>
                Status
                {pagination.sortBy === 'status' && (
                  <span className={styles.sortIcon}>
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Expiry Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {offerLetters.map((offerLetter) => (
              <tr key={offerLetter._id} className={styles.tableRow}>
                <td>{formatDate(offerLetter.issueDate)}</td>
                <td>
                  {offerLetter.studentId?.firstName} {offerLetter.studentId?.lastName}
                </td>
                <td>{offerLetter.courseDetails?.name}</td>
                <td>{offerLetter.institutionDetails?.name}</td>
                <td>
                  <span className={getStatusBadgeClass(offerLetter.status)}>
                    {offerLetter.status}
                  </span>
                </td>
                <td>{formatDate(offerLetter.expiryDate)}</td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleView(offerLetter)}
                      className={styles.viewButton}
                      title="View Details"
                    >
                      View
                    </button>
                    {canEdit(offerLetter) && (
                      <>
                        <button
                          onClick={() => handleEdit(offerLetter)}
                          className={styles.editButton}
                          title="Edit"
                        >
                          Edit
                        </button>
                        {offerLetter.status === 'issued' && (
                          <button
                            onClick={() => handleReplace(offerLetter)}
                            className={styles.replaceButton}
                            title="Replace"
                          >
                            Replace
                          </button>
                        )}
                      </>
                    )}
                    {canDelete(offerLetter) && offerLetter.status === 'draft' && (
                      <button
                        onClick={() => handleDelete(offerLetter._id)}
                        className={styles.deleteButton}
                        title="Delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={styles.paginationButton}
          >
            Previous
          </button>
          
          <span className={styles.paginationInfo}>
            Page {pagination.page} of {totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === totalPages}
            className={styles.paginationButton}
          >
            Next
          </button>
        </div>
      )}
      
      {/* Empty state */}
      {offerLetters.length === 0 && (
        <div className={styles.emptyState}>
          <p>No offer letters found.</p>
          {canCreate && (
            <button className={styles.createButton} onClick={handleCreate}>
              Create your first offer letter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OfferLettersList;

// AI-NOTE: Created OfferLettersList component with filtering, pagination, search, and portal-based permissions following project patterns