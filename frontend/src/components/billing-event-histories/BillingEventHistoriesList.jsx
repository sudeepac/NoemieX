// AI-NOTE: Billing event histories list component with filtering, pagination, and responsive design
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  EyeOff, 
  FileText, 
  Plus, 
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Loader2,
  ChevronUp,
  ChevronDown,
  Edit,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  useListBillingEventHistoriesQuery,
  useGetBillingEventHistoryActivitySummaryQuery,
  useUpdateBillingEventHistoryVisibilityMutation
} from '../../store/api/api';
import {
  selectFilters,
  selectPagination,
  selectSorting,
  selectSelectedEventHistories,
  selectSelectAll,
  updateFilters,
  clearFilters,
  updatePagination,
  updateSorting,
  toggleEventHistorySelection,
  selectAllEventHistories,
  clearEventHistorySelection,
  goToEventHistoryDetail,
  openNoteModal,
  openDocumentUploadModal
} from '../../store/slices/billing-event-histories.slice';
import styles from './BillingEventHistoriesList.module.css';

const BillingEventHistoriesList = ({ portal = 'account' }) => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const sorting = useSelector(selectSorting);
  const selectedEventHistories = useSelector(selectSelectedEventHistories);
  const selectAll = useSelector(selectSelectAll);

  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // API queries
  const {
    data: eventHistoriesData,
    isLoading,
    error,
    refetch
  } = useListBillingEventHistoriesQuery({
    ...filters,
    ...pagination,
    ...sorting
  });

  const {
    data: activitySummary,
    isLoading: isLoadingSummary
  } = useGetBillingEventHistoryActivitySummaryQuery(filters);

  const [updateVisibility] = useUpdateBillingEventHistoryVisibilityMutation();

  // Handler functions
  const handleViewDetails = (eventHistory) => {
    // TODO: Implement view details functionality
    console.log('View details for:', eventHistory);
  };

  const handleEditEventHistory = (eventHistory) => {
    // TODO: Implement edit functionality
    console.log('Edit event history:', eventHistory);
  };

  // Event type configurations
  const eventTypeConfig = {
    transaction_created: { icon: Plus, color: 'blue', label: 'Created' },
    transaction_updated: { icon: RefreshCw, color: 'orange', label: 'Updated' },
    transaction_claimed: { icon: FileText, color: 'purple', label: 'Claimed' },
    transaction_paid: { icon: CheckCircle, color: 'green', label: 'Paid' },
    transaction_partially_paid: { icon: Clock, color: 'yellow', label: 'Partially Paid' },
    transaction_disputed: { icon: AlertCircle, color: 'red', label: 'Disputed' },
    transaction_cancelled: { icon: XCircle, color: 'gray', label: 'Cancelled' },
    transaction_refunded: { icon: RefreshCw, color: 'orange', label: 'Refunded' },
    payment_received: { icon: CheckCircle, color: 'green', label: 'Payment Received' },
    payment_partial: { icon: Clock, color: 'yellow', label: 'Partial Payment' },
    payment_failed: { icon: XCircle, color: 'red', label: 'Payment Failed' },
    overdue: { icon: AlertCircle, color: 'red', label: 'Overdue' },
    approved: { icon: CheckCircle, color: 'green', label: 'Approved' },
    rejected: { icon: XCircle, color: 'red', label: 'Rejected' },
    reconciled: { icon: CheckCircle, color: 'blue', label: 'Reconciled' },
    dispute_resolved: { icon: CheckCircle, color: 'green', label: 'Dispute Resolved' },
    status_changed: { icon: RefreshCw, color: 'blue', label: 'Status Changed' },
    attachment_uploaded: { icon: FileText, color: 'purple', label: 'Attachment Uploaded' },
    note_added: { icon: FileText, color: 'gray', label: 'Note Added' }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    dispatch(updateFilters(localFilters));
    setShowFilters(false);
  };

  const resetFilters = () => {
    const clearedFilters = {
      accountId: '',
      agencyId: '',
      billingTransactionId: '',
      eventType: '',
      startDate: '',
      endDate: '',
      triggeredBy: '',
      search: '',
      isVisible: true,
    };
    setLocalFilters(clearedFilters);
    dispatch(clearFilters());
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(updatePagination({ page: newPage }));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(updatePagination({ page: 1, limit: newLimit }));
  };

  // Handle sorting
  const handleSort = (field) => {
    const newOrder = sorting.sortBy === field && sorting.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(updateSorting({ sortBy: field, sortOrder: newOrder }));
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectAll) {
      dispatch(clearEventHistorySelection());
    } else {
      const eventHistoryIds = eventHistoriesData?.data?.map(eh => eh._id) || [];
      dispatch(selectAllEventHistories(eventHistoryIds));
    }
  };

  const handleSelectEventHistory = (eventHistoryId) => {
    dispatch(toggleEventHistorySelection(eventHistoryId));
  };

  // Handle actions
  const handleViewEventHistory = (eventHistoryId) => {
    dispatch(goToEventHistoryDetail(eventHistoryId));
  };

  const handleToggleVisibility = async (eventHistoryId, currentVisibility) => {
    try {
      await updateVisibility({
        billingEventHistoryId: eventHistoryId,
        isVisible: !currentVisibility
      }).unwrap();
    } catch (error) {
      console.error('Failed to update visibility:', error);
    }
  };

  const handleAddNote = (billingTransactionId) => {
    dispatch(openNoteModal(billingTransactionId));
  };

  const handleUploadDocument = (billingTransactionId) => {
    dispatch(openDocumentUploadModal(billingTransactionId));
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format amount
  const formatAmount = (amount) => {
    if (!amount || !amount.value) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: amount.currency || 'USD'
    }).format(amount.value);
  };

  const eventHistories = eventHistoriesData?.data || [];
  const totalPages = Math.ceil((eventHistoriesData?.total || 0) / pagination.limit);

  return (
    <div className={styles.billingEventHistoriesList}>
      {/* Header */}
      <div className={styles.listHeader}>
        <div className={styles.headerContent}>
          <h2>Billing Event History</h2>
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <Search className="w-5 h-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <button
              className={`${styles.btn} ${styles.btnOutline} ${showFilters ? styles.active : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={refetch}>
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`}>
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Activity Summary */}
      {!isLoadingSummary && activitySummary && (
        <div className={styles.activitySummary}>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryValue}>{activitySummary.totalEvents || 0}</div>
              <div className={styles.summaryLabel}>Total Events</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryValue}>{activitySummary.todayEvents || 0}</div>
              <div className={styles.summaryLabel}>Today's Events</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryValue}>${activitySummary.totalAmount?.toFixed(2) || '0.00'}</div>
              <div className={styles.summaryLabel}>Total Amount</div>
            </div>
            <div className={styles.summaryCard}>
              <div className={styles.summaryValue}>{activitySummary.hiddenEvents || 0}</div>
              <div className={styles.summaryLabel}>Hidden Events</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label>Account ID</label>
              <input
                type="text"
                value={localFilters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                placeholder="Enter account ID"
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Agency ID</label>
              <input
                type="text"
                value={localFilters.agencyId}
                onChange={(e) => handleFilterChange('agencyId', e.target.value)}
                placeholder="Enter agency ID"
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Event Type</label>
              <select
                value={localFilters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
                <option value="fee">Fee</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Start Date</label>
              <input
                type="date"
                value={localFilters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={localFilters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Triggered By</label>
              <input
                type="text"
                value={localFilters.triggeredBy}
                onChange={(e) => handleFilterChange('triggeredBy', e.target.value)}
                placeholder="User name or ID"
              />
            </div>
          </div>
          <div className={styles.filterActions}>
            <button
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={resetFilters}
            >
              Clear All
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedEventHistories.length > 0 && (
        <div className={styles.bulkActions}>
          <span className={styles.bulkInfo}>
            {selectedEventHistories.length} event{selectedEventHistories.length !== 1 ? 's' : ''} selected
          </span>
          <div className={styles.bulkButtons}>
            <button className={`${styles.btn} ${styles.btnSecondary}`}>
              <Eye className="w-4 h-4" />
              Show Selected
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`}>
              <EyeOff className="w-4 h-4" />
              Hide Selected
            </button>
            <button className={`${styles.btn} ${styles.btnSecondary}`}>
              <Download className="w-4 h-4" />
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Loading billing event histories...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <AlertCircle className="w-8 h-8" />
            <h3>Error Loading Data</h3>
            <p>Failed to load billing event histories. Please try again.</p>
          </div>
        ) : !eventHistoriesData?.data?.length ? (
          <div className={styles.emptyState}>
            <FileText className="w-8 h-8" />
            <h3>No Event Histories Found</h3>
            <p>No billing event histories match your current filters.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>
                  <div
                    className={styles.sortableHeader}
                    onClick={() => handleSort('eventType')}
                  >
                    Event Type
                    {sorting.sortBy === 'eventType' && (
                      sorting.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th>
                  <div
                    className={styles.sortableHeader}
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                    {sorting.sortBy === 'amount' && (
                      sorting.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th>
                  <div
                    className={styles.sortableHeader}
                    onClick={() => handleSort('createdAt')}
                  >
                    Date
                    {sorting.sortBy === 'createdAt' && (
                      sorting.sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th>Account</th>
                <th>Performed By</th>
                <th>Status</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {eventHistoriesData.data.map((eventHistory) => (
                <tr key={eventHistory._id}>
                  <td>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={selectedEventHistories.includes(eventHistory._id)}
                      onChange={() => dispatch(toggleEventHistorySelection(eventHistory._id))}
                    />
                  </td>
                  <td>
                    <span className={`${styles.eventType} ${styles[eventHistory.eventType?.toLowerCase()]}`}>
                      {eventHistory.eventType?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={styles.amount}>
                      ${eventHistory.eventData?.amount?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td>{new Date(eventHistory.createdAt).toLocaleDateString()}</td>
                  <td>{eventHistory.accountId || 'N/A'}</td>
                  <td>
                    {eventHistory.performedBy?.name || 'System'}
                    {eventHistory.performedBy?.role && (
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {eventHistory.performedBy.role}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[eventHistory.status?.toLowerCase()]}`}>
                      {eventHistory.status}
                    </span>
                  </td>
                  <td>
                    {eventHistory.visibility === 'visible' ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-red-600" />
                    )}
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.btnIcon}
                        onClick={() => handleViewDetails(eventHistory)}
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className={styles.btnIcon}
                        onClick={() => handleEditEventHistory(eventHistory)}
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className={styles.btnIcon}
                        onClick={() => handleToggleVisibility(eventHistory)}
                        title={eventHistory.visibility === 'visible' ? 'Hide' : 'Show'}
                      >
                        {eventHistory.visibility === 'visible' ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {eventHistoriesData?.data?.length > 0 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, eventHistoriesData.total)} of{' '}
            {eventHistoriesData.total} results
          </div>
          <div className={styles.paginationControls}>
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, pagination.page - 2) + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  className={`${styles.pageButton} ${pageNum === pagination.page ? styles.active : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              className={styles.pageButton}
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <select
              className={styles.limitSelect}
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingEventHistoriesList;