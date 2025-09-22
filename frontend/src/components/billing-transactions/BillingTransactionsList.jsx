import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetBillingTransactionsQuery,
  useDeleteBillingTransactionMutation,
  useUpdateBillingTransactionStatusMutation
} from '../../store/api/api';
import {
  selectFilters,
  selectPagination,
  updateFilters,
  updatePagination,
  goToCreateTransaction,
  goToEditTransaction,
  goToTransactionDetail,
} from '../../store/slices/billing-transactions.slice';
import styles from './BillingTransactionsList.module.css';

/**
 * BillingTransactionsList component - displays paginated list of billing transactions with filtering and search
 * Supports different portal views (superadmin, account, agency) with appropriate permissions
 * AI-NOTE: Follows OfferLettersList pattern with billing-specific fields and business logic
 */
const BillingTransactionsList = ({ portal = 'superadmin' }) => {
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
  
  // Fetch billing transactions data
  const {
    data: billingTransactionsData,
    isLoading,
    error,
    refetch,
  } = useGetBillingTransactionsQuery(queryParams);
  
  // Mutations
  const [deleteBillingTransaction] = useDeleteBillingTransactionMutation();
  const [updateStatus] = useUpdateBillingTransactionStatusMutation();
  
  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(updateFilters({ search: searchInput }));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchInput, dispatch]);
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    dispatch(updateFilters({ [filterName]: value }));
  };
  
  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(updatePagination({ page: newPage }));
  };
  
  // Handle sorting
  const handleSort = (sortBy) => {
    const newSortOrder = 
      pagination.sortBy === sortBy && pagination.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(updatePagination({ sortBy, sortOrder: newSortOrder }));
  };
  
  // Handle billing transaction actions
  const handleCreate = () => {
    dispatch(goToCreateTransaction());
  };
  
  const handleEdit = (billingTransaction) => {
    dispatch(goToEditTransaction(billingTransaction));
  };
  
  const handleView = (billingTransaction) => {
    dispatch(goToTransactionDetail(billingTransaction));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this billing transaction?')) {
      try {
        await deleteBillingTransaction(id).unwrap();
      } catch (error) {
        console.error('Failed to delete billing transaction:', error);
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
  
  // Format currency for display
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      pending: styles.statusPending,
      processing: styles.statusProcessing,
      paid: styles.statusPaid,
      partially_paid: styles.statusPartiallyPaid,
      overdue: styles.statusOverdue,
      disputed: styles.statusDisputed,
      cancelled: styles.statusCancelled,
      refunded: styles.statusRefunded,
    };
    return `${styles.statusBadge} ${statusClasses[status] || ''}`;
  };
  
  // Get priority badge class
  const getPriorityBadgeClass = (priority) => {
    const priorityClasses = {
      low: styles.priorityLow,
      medium: styles.priorityMedium,
      high: styles.priorityHigh,
      urgent: styles.priorityUrgent,
    };
    return `${styles.priorityBadge} ${priorityClasses[priority] || ''}`;
  };
  
  // Check if transaction is overdue
  const isOverdue = (dueDate, status) => {
    if (!dueDate || ['paid', 'cancelled', 'refunded'].includes(status)) return false;
    return new Date(dueDate) < new Date();
  };
  
  // Check permissions based on portal and role
  const canCreate = portal === 'superadmin' || (portal === 'account' && ['admin', 'manager'].includes(user?.role));
  const canEdit = (billingTransaction) => {
    if (portal === 'superadmin') return true;
    if (portal === 'account') return ['admin', 'manager'].includes(user?.role);
    if (portal === 'agency') return user?.agencyId === billingTransaction.agencyId?._id && ['admin', 'manager'].includes(user?.role);
    return false;
  };
  const canDelete = (billingTransaction) => {
    return canEdit(billingTransaction) && ['pending', 'cancelled'].includes(billingTransaction.status);
  };
  
  if (isLoading) {
    return <div className={styles.loading}>Loading billing transactions...</div>;
  }
  
  if (error) {
    return <div className={styles.error}>Error loading billing transactions: {error.message}</div>;
  }
  
  const { billingTransactions = [], totalCount = 0, totalPages = 0 } = billingTransactionsData || {};
  
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2>Billing Transactions</h2>
        {canCreate && (
          <button className={styles.createButton} onClick={handleCreate}>
            Create Billing Transaction
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search transactions..."
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
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="overdue">Overdue</option>
            <option value="disputed">Disputed</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Types</option>
            <option value="tuition">Tuition</option>
            <option value="application_fee">Application Fee</option>
            <option value="accommodation">Accommodation</option>
            <option value="insurance">Insurance</option>
            <option value="visa_fee">Visa Fee</option>
            <option value="commission">Commission</option>
            <option value="bonus">Bonus</option>
            <option value="refund">Refund</option>
            <option value="penalty">Penalty</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className={styles.filterGroup}>
          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
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
        Showing {billingTransactions.length} of {totalCount} billing transactions
      </div>
      
      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort('transactionDate')} className={styles.sortable}>
                Date
                {pagination.sortBy === 'transactionDate' && (
                  <span className={styles.sortIcon}>
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Reference</th>
              <th>Type</th>
              <th>Description</th>
              <th onClick={() => handleSort('amount')} className={styles.sortable}>
                Amount
                {pagination.sortBy === 'amount' && (
                  <span className={styles.sortIcon}>
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort('status')} className={styles.sortable}>
                Status
                {pagination.sortBy === 'status' && (
                  <span className={styles.sortIcon}>
                    {pagination.sortOrder === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billingTransactions.map((transaction) => (
              <tr key={transaction._id} className={styles.tableRow}>
                <td>{formatDate(transaction.transactionDate)}</td>
                <td className={styles.reference}>{transaction.referenceNumber}</td>
                <td className={styles.capitalize}>{transaction.type?.replace('_', ' ')}</td>
                <td className={styles.description}>{transaction.description}</td>
                <td className={styles.amount}>
                  {formatCurrency(transaction.amount, transaction.currency)}
                </td>
                <td>
                  <span className={getStatusBadgeClass(transaction.status)}>
                    {transaction.status?.replace('_', ' ')}
                  </span>
                  {isOverdue(transaction.dueDate, transaction.status) && (
                    <span className={styles.overdueBadge}>OVERDUE</span>
                  )}
                </td>
                <td>
                  <span className={getPriorityBadgeClass(transaction.priority)}>
                    {transaction.priority}
                  </span>
                </td>
                <td>
                  {transaction.dueDate ? (
                    <span className={isOverdue(transaction.dueDate, transaction.status) ? styles.overdue : ''}>
                      {formatDate(transaction.dueDate)}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleView(transaction)}
                      className={styles.viewButton}
                      title="View Details"
                    >
                      View
                    </button>
                    {canEdit(transaction) && (
                      <button
                        onClick={() => handleEdit(transaction)}
                        className={styles.editButton}
                        title="Edit"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete(transaction) && (
                      <button
                        onClick={() => handleDelete(transaction._id)}
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
      {billingTransactions.length === 0 && (
        <div className={styles.emptyState}>
          <p>No billing transactions found.</p>
          {canCreate && (
            <button className={styles.createButton} onClick={handleCreate}>
              Create your first billing transaction
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingTransactionsList;

// AI-NOTE: Created BillingTransactionsList component with filtering, pagination, search, and portal-based permissions following OfferLettersList pattern with billing-specific enhancements