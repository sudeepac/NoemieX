// AI-NOTE: Payment schedules list component with filtering, pagination, and bulk operations
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ErrorMessage from '../../shared/components/ErrorMessage';
import {
  useGetPaymentSchedulesQuery,
  useGetPaymentScheduleStatsQuery,
  useDeletePaymentScheduleMutation,
  useApprovePaymentScheduleMutation,
  useGenerateBillingTransactionsMutation,
} from '../../store/api/api';
import {
  selectFilters,
  selectPagination,
  selectSelectedItems,
  selectBulkActionMode,
  selectShowFilters,
  selectShowStats,
  setFilters,
  clearFilters,
  setPagination,
  setPage,
  setSorting,
  toggleItemSelection,
  selectAllItems,
  clearSelectedItems,
  setBulkActionMode,
  toggleFilters,
  toggleStats,
  openForm,
  openDetail,
} from '../../store/slices/paymentSchedulesUi.slice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { toast } from 'react-toastify';

const PaymentSchedulesList = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const selectedItems = useSelector(selectSelectedItems);
  const bulkActionMode = useSelector(selectBulkActionMode);
  const showFilters = useSelector(selectShowFilters);
  const showStats = useSelector(selectShowStats);
  const { user } = useSelector((state) => state.auth);

  // API hooks
  const { 
    data: paymentSchedulesData, 
    isLoading, 
    error,
    refetch 
  } = useGetPaymentSchedulesQuery({
    ...filters,
    ...pagination,
    accountId: user?.accountId
  });
  
  const { data: statsData } = useGetPaymentScheduleStatsQuery({
    accountId: user?.accountId,
    agencyId: filters.agencyId,
    offerLetterId: filters.offerLetterId
  }, { skip: !showStats });
  
  const [deletePaymentSchedule] = useDeletePaymentScheduleMutation();
  const [approvePaymentSchedule] = useApprovePaymentScheduleMutation();
  const [generateBillingTransactions] = useGenerateBillingTransactionsMutation();

  const [localFilters, setLocalFilters] = useState(filters);

  // Update local filters when Redux filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const paymentSchedules = paymentSchedulesData?.paymentScheduleItems || [];
  const totalCount = paymentSchedulesData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pagination.limit);
  const stats = statsData || {};

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value }
    }));
  };

  const applyFilters = () => {
    dispatch(setFilters(localFilters));
  };

  const handleClearFilters = () => {
    setLocalFilters({
      search: '',
      itemType: '',
      milestoneType: '',
      status: '',
      priority: '',
      isOverdue: false,
      dateRange: { start: '', end: '' },
      offerLetterId: '',
      agencyId: '',
      accountId: user?.accountId || ''
    });
    dispatch(clearFilters());
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit) => {
    dispatch(setPagination({ limit: parseInt(newLimit), page: 1 }));
  };

  // Handle sorting
  const handleSort = (field) => {
    const newOrder = pagination.sortBy === field && pagination.sortOrder === 'asc' ? 'desc' : 'asc';
    dispatch(setSorting({ sortBy: field, sortOrder: newOrder }));
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    dispatch(toggleItemSelection(itemId));
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paymentSchedules.length) {
      dispatch(clearSelectedItems());
    } else {
      dispatch(selectAllItems(paymentSchedules.map(item => item._id)));
    }
  };

  // Handle actions
  const handleCreate = () => {
    dispatch(openForm({ mode: 'create' }));
  };

  const handleView = (paymentSchedule) => {
    dispatch(openDetail(paymentSchedule));
  };

  const handleEdit = (paymentSchedule) => {
    dispatch(openForm({ mode: 'edit', paymentSchedule }));
  };

  const handleDelete = async (paymentSchedule) => {
    if (!window.confirm(`Are you sure you want to delete payment schedule "${paymentSchedule.description}"?`)) {
      return;
    }

    try {
      await deletePaymentSchedule(paymentSchedule._id).unwrap();
      toast.success('Payment schedule deleted successfully');
    } catch (error) {
      console.error('Error deleting payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to delete payment schedule');
    }
  };

  // Handle bulk actions
  const handleBulkApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve ${selectedItems.length} payment schedule items?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedItems.map(itemId => approvePaymentSchedule(itemId).unwrap())
      );
      toast.success(`${selectedItems.length} payment schedules approved successfully`);
      dispatch(clearSelectedItems());
    } catch (error) {
      console.error('Error approving payment schedules:', error);
      toast.error('Failed to approve some payment schedules');
    }
  };

  const handleBulkGenerateTransactions = async () => {
    if (!window.confirm(`Are you sure you want to generate billing transactions for ${selectedItems.length} payment schedule items?`)) {
      return;
    }

    try {
      await generateBillingTransactions({ itemIds: selectedItems }).unwrap();
      toast.success('Billing transactions generated successfully');
      dispatch(clearSelectedItems());
    } catch (error) {
      console.error('Error generating billing transactions:', error);
      toast.error(error?.data?.message || 'Failed to generate billing transactions');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} payment schedule items? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        selectedItems.map(itemId => deletePaymentSchedule(itemId).unwrap())
      );
      toast.success(`${selectedItems.length} payment schedules deleted successfully`);
      dispatch(clearSelectedItems());
    } catch (error) {
      console.error('Error deleting payment schedules:', error);
      toast.error('Failed to delete some payment schedules');
    }
  };

  const getSortIcon = (field) => {
    if (pagination.sortBy !== field) return '↕️';
    return pagination.sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'gray',
      'pending': 'orange',
      'approved': 'blue',
      'in-progress': 'purple',
      'completed': 'green',
      'cancelled': 'red',
      'retired': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'green',
      'medium': 'orange',
      'high': 'red',
      'urgent': 'purple'
    };
    return colors[priority] || 'gray';
  };

  if (error) {
    return (
      <div className="payment-schedules-list error">
        <ErrorMessage 
          error={{message: error?.data?.message || 'Failed to load payment schedules'}} 
          variant="page" 
          type="error"
          title="Error Loading Payment Schedules"
        />
        <button className="btn btn-primary" onClick={refetch}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="payment-schedules-list">
      {/* Header */}
      <div className="list-header">
        <div className="header-content">
          <h2>Payment Schedules</h2>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => dispatch(toggleStats())}
            >
              {showStats ? 'Hide Stats' : 'Show Stats'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => dispatch(toggleFilters())}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => dispatch(setBulkActionMode(!bulkActionMode))}
            >
              {bulkActionMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
            </button>
            <button className="btn btn-primary" onClick={handleCreate}>
              Create Payment Schedule
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="stats-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Items</h4>
              <span className="stat-value">{stats.totalItems || 0}</span>
            </div>
            <div className="stat-card">
              <h4>Total Amount</h4>
              <span className="stat-value">{formatCurrency(stats.totalAmount || 0)}</span>
            </div>
            <div className="stat-card">
              <h4>Pending</h4>
              <span className="stat-value">{stats.pendingItems || 0}</span>
            </div>
            <div className="stat-card">
              <h4>Overdue</h4>
              <span className="stat-value overdue">{stats.overdueItems || 0}</span>
            </div>
            <div className="stat-card">
              <h4>Completed</h4>
              <span className="stat-value completed">{stats.completedItems || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search descriptions..."
              />
            </div>
            
            <div className="filter-group">
              <label>Item Type</label>
              <select
                value={localFilters.itemType}
                onChange={(e) => handleFilterChange('itemType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="milestone">Milestone</option>
                <option value="recurring">Recurring</option>
                <option value="one-time">One-time</option>
                <option value="retainer">Retainer</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Status</label>
              <select
                value={localFilters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="retired">Retired</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Priority</label>
              <select
                value={localFilters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Due Date From</label>
              <input
                type="date"
                value={localFilters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Due Date To</label>
              <input
                type="date"
                value={localFilters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
              />
            </div>
            
            <div className="filter-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localFilters.isOverdue}
                  onChange={(e) => handleFilterChange('isOverdue', e.target.checked)}
                />
                Show Overdue Only
              </label>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="btn btn-primary" onClick={applyFilters}>
              Apply Filters
            </button>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {bulkActionMode && selectedItems.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">{selectedItems.length} items selected</span>
          <div className="bulk-buttons">
            <button className="btn btn-success" onClick={handleBulkApprove}>
              Approve Selected
            </button>
            <button className="btn btn-primary" onClick={handleBulkGenerateTransactions}>
              Generate Transactions
            </button>
            <button className="btn btn-danger" onClick={handleBulkDelete}>
              Delete Selected
            </button>
            <button className="btn btn-secondary" onClick={() => dispatch(clearSelectedItems())}>
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        {isLoading ? (
          <div className="loading-spinner">Loading payment schedules...</div>
        ) : paymentSchedules.length === 0 ? (
          <div className="empty-state">
            <h3>No Payment Schedules Found</h3>
            <p>No payment schedules match your current filters.</p>
            <button className="btn btn-primary" onClick={handleCreate}>
              Create First Payment Schedule
            </button>
          </div>
        ) : (
          <table className="payment-schedules-table">
            <thead>
              <tr>
                {bulkActionMode && (
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === paymentSchedules.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                <th onClick={() => handleSort('description')} className="sortable">
                  Description {getSortIcon('description')}
                </th>
                <th onClick={() => handleSort('itemType')} className="sortable">
                  Type {getSortIcon('itemType')}
                </th>
                <th onClick={() => handleSort('scheduledAmount')} className="sortable">
                  Amount {getSortIcon('scheduledAmount')}
                </th>
                <th onClick={() => handleSort('scheduledDueDate')} className="sortable">
                  Due Date {getSortIcon('scheduledDueDate')}
                </th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Status {getSortIcon('status')}
                </th>
                <th onClick={() => handleSort('priority')} className="sortable">
                  Priority {getSortIcon('priority')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paymentSchedules.map((item) => {
                const isOverdue = item.isOverdue || (new Date(item.scheduledDueDate) < new Date() && item.status === 'pending');
                return (
                  <tr key={item._id} className={isOverdue ? 'overdue' : ''}>
                    {bulkActionMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item._id)}
                          onChange={() => handleItemSelect(item._id)}
                        />
                      </td>
                    )}
                    <td className="description" onClick={() => handleView(item)}>
                      {item.description}
                    </td>
                    <td>
                      <span className="item-type">
                        {item.itemType?.replace('-', ' ')}
                      </span>
                      {item.milestoneType && (
                        <span className="milestone-type">
                          ({item.milestoneType?.replace('-', ' ')})
                        </span>
                      )}
                    </td>
                    <td className="amount">
                      {formatCurrency(item.scheduledAmount)}
                    </td>
                    <td className={isOverdue ? 'overdue' : ''}>
                      {formatDate(item.scheduledDueDate)}
                    </td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(item.status) }}
                      >
                        {item.status?.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="priority-badge" 
                        style={{ backgroundColor: getPriorityColor(item.priority) }}
                      >
                        {item.priority?.toUpperCase()}
                      </span>
                    </td>
                    <td className="actions">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleView(item)}
                        title="View Details"
                      >
                        👁️
                      </button>
                      {['draft', 'pending'].includes(item.status) && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                      )}
                      {item.status === 'draft' && user?.role === 'admin' && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, totalCount)} of {totalCount} items
          </div>
          
          <div className="pagination-controls">
            <select 
              value={pagination.limit} 
              onChange={(e) => handleLimitChange(e.target.value)}
              className="limit-select"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
            
            <div className="page-controls">
              <button 
                className="btn btn-sm" 
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
              >
                First
              </button>
              <button 
                className="btn btn-sm" 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.page} of {totalPages}
              </span>
              
              <button 
                className="btn btn-sm" 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === totalPages}
              >
                Next
              </button>
              <button 
                className="btn btn-sm" 
                onClick={() => handlePageChange(totalPages)}
                disabled={pagination.page === totalPages}
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentSchedulesList;