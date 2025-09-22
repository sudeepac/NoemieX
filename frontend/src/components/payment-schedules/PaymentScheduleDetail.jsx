// AI-NOTE: Payment schedule detail component for viewing individual payment schedule items with actions
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetPaymentScheduleQuery,
  useDeletePaymentScheduleMutation,
  useApprovePaymentScheduleMutation,
  useRetirePaymentScheduleMutation,
  useCompletePaymentScheduleMutation,
  useCancelPaymentScheduleMutation,
  useReplacePaymentScheduleMutation,
  useGenerateRecurringItemsMutation
} from '../../store/api/api';
import {
  selectSelectedPaymentSchedule,
  closeDetail,
  openForm,
} from '../../store/slices/payment-schedules.slice';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PaymentScheduleDetail = ({ paymentScheduleId }) => {
  const dispatch = useDispatch();
  const selectedPaymentSchedule = useSelector(selectSelectedPaymentSchedule);
  const { user } = useSelector((state) => state.auth);

  // API hooks
  const { data: paymentSchedule, isLoading, error } = useGetPaymentScheduleQuery(
    paymentScheduleId || selectedPaymentSchedule?._id,
    { skip: !paymentScheduleId && !selectedPaymentSchedule?._id }
  );
  
  const [approvePaymentSchedule, { isLoading: isApproving }] = useApprovePaymentScheduleMutation();
  const [retirePaymentSchedule, { isLoading: isRetiring }] = useRetirePaymentScheduleMutation();
  const [completePaymentSchedule, { isLoading: isCompleting }] = useCompletePaymentScheduleMutation();
  const [cancelPaymentSchedule, { isLoading: isCancelling }] = useCancelPaymentScheduleMutation();
  const [deletePaymentSchedule, { isLoading: isDeleting }] = useDeletePaymentScheduleMutation();

  const item = paymentSchedule || selectedPaymentSchedule;

  // Handle actions
  const handleEdit = () => {
    dispatch(openForm({ mode: 'edit', paymentSchedule: item }));
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this payment schedule item?')) return;
    
    try {
      await approvePaymentSchedule(item._id).unwrap();
      toast.success('Payment schedule approved successfully');
    } catch (error) {
      console.error('Error approving payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to approve payment schedule');
    }
  };

  const handleRetire = async () => {
    const reason = window.prompt('Please provide a reason for retiring this payment schedule item:');
    if (!reason) return;
    
    try {
      await retirePaymentSchedule({ id: item._id, reason }).unwrap();
      toast.success('Payment schedule retired successfully');
    } catch (error) {
      console.error('Error retiring payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to retire payment schedule');
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Are you sure you want to mark this payment schedule item as completed?')) return;
    
    try {
      await completePaymentSchedule(item._id).unwrap();
      toast.success('Payment schedule completed successfully');
    } catch (error) {
      console.error('Error completing payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to complete payment schedule');
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancelling this payment schedule item:');
    if (!reason) return;
    
    try {
      await cancelPaymentSchedule({ id: item._id, reason }).unwrap();
      toast.success('Payment schedule cancelled successfully');
    } catch (error) {
      console.error('Error cancelling payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to cancel payment schedule');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this payment schedule item? This action cannot be undone.')) return;
    
    try {
      await deletePaymentSchedule(item._id).unwrap();
      toast.success('Payment schedule deleted successfully');
      dispatch(closeDetail());
    } catch (error) {
      console.error('Error deleting payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to delete payment schedule');
    }
  };

  const handleClose = () => {
    dispatch(closeDetail());
  };

  if (isLoading) {
    return (
      <div className="payment-schedule-detail loading">
        <div className="loading-spinner">Loading payment schedule details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-schedule-detail error">
        <div className="error-message">
          <h3>Error Loading Payment Schedule</h3>
          <p>{error?.data?.message || 'Failed to load payment schedule details'}</p>
          <button className="btn btn-primary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="payment-schedule-detail empty">
        <div className="empty-message">
          <h3>No Payment Schedule Selected</h3>
          <p>Please select a payment schedule item to view details.</p>
          <button className="btn btn-primary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const isOverdue = item.isOverdue || (new Date(item.scheduledDueDate) < new Date() && item.status === 'pending');
  const canEdit = ['pending', 'draft'].includes(item.status);
  const canApprove = item.status === 'pending' && user?.role !== 'viewer';
  const canComplete = ['approved', 'in-progress'].includes(item.status);
  const canCancel = ['pending', 'approved', 'in-progress'].includes(item.status);
  const canRetire = !['completed', 'cancelled', 'retired'].includes(item.status);
  const canDelete = item.status === 'draft' && user?.role === 'admin';

  const isActionLoading = isApproving || isRetiring || isCompleting || isCancelling || isDeleting;

  return (
    <div className="payment-schedule-detail">
      <div className="detail-header">
        <div className="header-content">
          <h2>Payment Schedule Details</h2>
          <div className="status-badges">
            <span className={`status-badge status-${item.status}`}>
              {item.status?.replace('-', ' ').toUpperCase()}
            </span>
            {isOverdue && (
              <span className="status-badge status-overdue">OVERDUE</span>
            )}
            {item.priority && (
              <span className={`priority-badge priority-${item.priority}`}>
                {item.priority.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={handleClose}
          disabled={isActionLoading}
        >
          ×
        </button>
      </div>

      <div className="detail-content">
        {/* Basic Information */}
        <div className="detail-section">
          <h3>Basic Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Item Type</label>
              <span>{item.itemType?.replace('-', ' ')}</span>
            </div>
            {item.milestoneType && (
              <div className="detail-item">
                <label>Milestone Type</label>
                <span>{item.milestoneType?.replace('-', ' ')}</span>
              </div>
            )}
            <div className="detail-item">
              <label>Scheduled Amount</label>
              <span className="amount">{formatCurrency(item.scheduledAmount)}</span>
            </div>
            <div className="detail-item">
              <label>Scheduled Due Date</label>
              <span className={isOverdue ? 'overdue' : ''}>
                {formatDate(item.scheduledDueDate)}
              </span>
            </div>
            <div className="detail-item">
              <label>Priority</label>
              <span className={`priority-${item.priority}`}>
                {item.priority?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="detail-section">
          <h3>Description</h3>
          <p className="description">{item.description}</p>
        </div>

        {/* Conditions */}
        {item.conditions && (
          <div className="detail-section">
            <h3>Conditions</h3>
            <p className="conditions">{item.conditions}</p>
          </div>
        )}

        {/* Recurring Settings */}
        {item.isRecurring && item.recurringSettings && (
          <div className="detail-section">
            <h3>Recurring Settings</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Frequency</label>
                <span>{item.recurringSettings.frequency}</span>
              </div>
              <div className="detail-item">
                <label>Interval</label>
                <span>Every {item.recurringSettings.interval} {item.recurringSettings.frequency}</span>
              </div>
              {item.recurringSettings.endDate && (
                <div className="detail-item">
                  <label>End Date</label>
                  <span>{formatDate(item.recurringSettings.endDate)}</span>
                </div>
              )}
              {item.recurringSettings.maxOccurrences && (
                <div className="detail-item">
                  <label>Max Occurrences</label>
                  <span>{item.recurringSettings.maxOccurrences}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Related Information */}
        <div className="detail-section">
          <h3>Related Information</h3>
          <div className="detail-grid">
            {item.offerLetter && (
              <div className="detail-item">
                <label>Offer Letter</label>
                <span>{item.offerLetter.title} - {item.offerLetter.clientName}</span>
              </div>
            )}
            {item.agency && (
              <div className="detail-item">
                <label>Agency</label>
                <span>{item.agency.name}</span>
              </div>
            )}
            {item.parentItem && (
              <div className="detail-item">
                <label>Parent Item</label>
                <span>Recurring from #{item.parentItem._id?.slice(-6)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Retirement Information */}
        {item.status === 'retired' && item.retirementReason && (
          <div className="detail-section">
            <h3>Retirement Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Retirement Reason</label>
                <span>{item.retirementReason}</span>
              </div>
              {item.retiredBy && (
                <div className="detail-item">
                  <label>Retired By</label>
                  <span>{item.retiredBy.name || item.retiredBy.email}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Information */}
        <div className="detail-section">
          <h3>Audit Information</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <label>Created</label>
              <span>{formatDate(item.createdAt)}</span>
            </div>
            <div className="detail-item">
              <label>Last Updated</label>
              <span>{formatDate(item.updatedAt)}</span>
            </div>
            {item.createdBy && (
              <div className="detail-item">
                <label>Created By</label>
                <span>{item.createdBy.name || item.createdBy.email}</span>
              </div>
            )}
            {item.updatedBy && (
              <div className="detail-item">
                <label>Updated By</label>
                <span>{item.updatedBy.name || item.updatedBy.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="detail-actions">
        {canEdit && (
          <button
            className="btn btn-secondary"
            onClick={handleEdit}
            disabled={isActionLoading}
          >
            Edit
          </button>
        )}
        
        {canApprove && (
          <button
            className="btn btn-success"
            onClick={handleApprove}
            disabled={isActionLoading}
          >
            {isApproving ? 'Approving...' : 'Approve'}
          </button>
        )}
        
        {canComplete && (
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={isActionLoading}
          >
            {isCompleting ? 'Completing...' : 'Complete'}
          </button>
        )}
        
        {canCancel && (
          <button
            className="btn btn-warning"
            onClick={handleCancel}
            disabled={isActionLoading}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel'}
          </button>
        )}
        
        {canRetire && (
          <button
            className="btn btn-warning"
            onClick={handleRetire}
            disabled={isActionLoading}
          >
            {isRetiring ? 'Retiring...' : 'Retire'}
          </button>
        )}
        
        {canDelete && (
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={isActionLoading}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentScheduleDetail;