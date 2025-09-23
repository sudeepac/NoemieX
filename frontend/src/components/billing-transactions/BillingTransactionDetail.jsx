import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetBillingTransactionQuery,
  useUpdateBillingTransactionStatusMutation,
  useMarkAsPaidMutation,
  useDisputeBillingTransactionMutation,
  useDeleteBillingTransactionMutation,
} from '../../store/api/api';
import {
  selectEditingTransaction,
  goBackToTransactionsList,
  goToEditTransaction,
} from '../../store/slices/billingTransactionsUi.slice';
import styles from './BillingTransactionDetail.module.css';

/**
 * BillingTransactionDetail component - displays detailed view of a billing transaction
 * Supports status management, payment processing, and various actions based on permissions
 * AI-NOTE: Follows established pattern from OfferLetterDetail with billing-specific functionality
 */
const BillingTransactionDetail = () => {
  const dispatch = useDispatch();
  const editingTransaction = useSelector(selectEditingTransaction);
  const { user, portal } = useSelector((state) => state.auth);
  
  // Local state
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', method: '', reference: '' });
  const [paymentError, setPaymentError] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  
  // Fetch fresh data for the selected billing transaction
  const {
    data: billingTransaction,
    isLoading,
    error,
    refetch,
  } = useGetBillingTransactionQuery(editingTransaction?._id, {
    skip: !editingTransaction?._id,
  });
  
  // Mutations
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateBillingTransactionStatusMutation();
  const [markAsPaid, { isLoading: isMarkingPaid }] = useMarkAsPaidMutation();
  const [disputeTransaction, { isLoading: isDisputing }] = useDisputeBillingTransactionMutation();
  const [deleteTransaction] = useDeleteBillingTransactionMutation();
  
  // Use fresh data if available, fallback to selected
  const currentTransaction = billingTransaction || editingTransaction;
  
  // Handle close
  const handleClose = () => {
    dispatch(goBackToTransactionsList());
  };
  
  // Handle status updates
  const handleStatusUpdate = async (newStatus) => {
    if (!currentTransaction) return;
    
    const confirmMessage = {
      processing: 'Are you sure you want to mark this transaction as processing?',
      paid: 'Are you sure you want to mark this transaction as paid?',
      cancelled: 'Are you sure you want to cancel this transaction?',
      disputed: 'Are you sure you want to dispute this transaction?',
    }[newStatus];
    
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await updateStatus({ id: currentTransaction._id, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  // Handle payment processing
  const handleMarkAsPaid = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || !paymentData.method) {
      setPaymentError('Amount and payment method are required');
      return;
    }
    
    try {
      await markAsPaid({
        id: currentTransaction._id,
        amount: parseFloat(paymentData.amount),
        paymentMethod: paymentData.method,
        reference: paymentData.reference,
      }).unwrap();
      
      setPaymentData({ amount: '', method: '', reference: '' });
      setShowPaymentForm(false);
      setPaymentError('');
      refetch();
    } catch (error) {
      setPaymentError(error.data?.message || 'Failed to process payment');
    }
  };
  
  // Handle dispute
  const handleDispute = async (e) => {
    e.preventDefault();
    
    if (!disputeReason.trim()) {
      return;
    }
    
    try {
      await disputeTransaction({
        id: currentTransaction._id,
        reason: disputeReason.trim(),
      }).unwrap();
      
      setDisputeReason('');
      setShowDisputeForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to dispute transaction:', error);
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    dispatch(goToEditTransaction(currentTransaction));
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this billing transaction? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteTransaction(currentTransaction._id).unwrap();
      dispatch(goBackToTransactionsList());
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount) return 'N/A';
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
  
  // Check permissions
  const canEdit = () => {
    if (!currentTransaction) return false;
    if (portal === 'superadmin') return true;
    if (portal === 'account') return ['admin', 'manager'].includes(user?.role);
    if (portal === 'agency') {
      return user?.agencyId === currentTransaction.agencyId?._id && ['admin', 'manager'].includes(user?.role);
    }
    return false;
  };
  
  const canUpdateStatus = () => {
    return canEdit() && ['pending', 'processing'].includes(currentTransaction?.status);
  };
  
  const canMarkAsPaid = () => {
    return canEdit() && ['pending', 'processing', 'overdue'].includes(currentTransaction?.status);
  };
  
  const canDispute = () => {
    return canEdit() && ['pending', 'processing', 'paid'].includes(currentTransaction?.status);
  };
  
  const canDelete = () => {
    return canEdit() && currentTransaction?.status === 'pending';
  };
  
  // Get available status transitions
  const getAvailableStatusTransitions = () => {
    if (!currentTransaction) return [];
    
    const transitions = {
      pending: ['processing', 'cancelled'],
      processing: ['paid', 'cancelled', 'disputed'],
      paid: ['disputed', 'refunded'],
      partially_paid: ['paid', 'disputed'],
      overdue: ['processing', 'paid', 'cancelled'],
      disputed: ['paid', 'cancelled'],
      cancelled: [],
      refunded: [],
    };
    
    return transitions[currentTransaction.status] || [];
  };
  
  // Calculate days overdue
  const getDaysOverdue = () => {
    if (!currentTransaction?.dueDate || currentTransaction.status === 'paid') return 0;
    const today = new Date();
    const dueDate = new Date(currentTransaction.dueDate);
    const diffTime = today - dueDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading billing transaction details...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>Error loading billing transaction: {error.message}</div>
        </div>
      </div>
    );
  }
  
  if (!currentTransaction) {
    return null;
  }
  
  const daysOverdue = getDaysOverdue();
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3>Billing Transaction Details</h3>
            <div className={styles.badges}>
              <span className={getStatusBadgeClass(currentTransaction.status)}>
                {currentTransaction.status.replace('_', ' ')}
              </span>
              <span className={getPriorityBadgeClass(currentTransaction.priority)}>
                {currentTransaction.priority}
              </span>
              {daysOverdue > 0 && (
                <span className={styles.overdueBadge}>
                  {daysOverdue} days overdue
                </span>
              )}
            </div>
          </div>
          <button onClick={handleClose} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className={styles.content}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h4>Basic Information</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Transaction ID</label>
                <span className={styles.monospace}>{currentTransaction._id}</span>
              </div>
              <div className={styles.field}>
                <label>Reference</label>
                <span>{currentTransaction.reference || 'N/A'}</span>
              </div>
              <div className={styles.field}>
                <label>External Transaction ID</label>
                <span>{currentTransaction.externalTransactionId || 'N/A'}</span>
              </div>
              <div className={styles.field}>
                <label>Created Date</label>
                <span>{formatDate(currentTransaction.createdAt)}</span>
              </div>
            </div>
          </div>
          
          {/* Financial Details */}
          <div className={styles.section}>
            <h4>Financial Details</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Amount</label>
                <span className={styles.amount}>
                  {formatCurrency(currentTransaction.signedAmount, currentTransaction.currency)}
                </span>
              </div>
              <div className={styles.field}>
                <label>Currency</label>
                <span>{currentTransaction.currency}</span>
              </div>
              <div className={styles.field}>
                <label>Transaction Type</label>
                <span className={styles.capitalize}>{currentTransaction.transactionType.replace('_', ' ')}</span>
              </div>
              <div className={styles.field}>
                <label>Category</label>
                <span className={styles.capitalize}>{currentTransaction.category}</span>
              </div>
              <div className={styles.field}>
                <label>Subcategory</label>
                <span>{currentTransaction.subcategory || 'N/A'}</span>
              </div>
              <div className={styles.field}>
                <label>Due Date</label>
                <span className={daysOverdue > 0 ? styles.overdue : ''}>
                  {formatDate(currentTransaction.dueDate)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Account & Agency Information */}
          <div className={styles.section}>
            <h4>Account & Agency Information</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Account</label>
                <span>
                  {currentTransaction.accountId?.name || currentTransaction.accountId || 'N/A'}
                </span>
              </div>
              <div className={styles.field}>
                <label>Agency</label>
                <span>
                  {currentTransaction.agencyId?.name || currentTransaction.agencyId || 'N/A'}
                </span>
              </div>
              <div className={styles.field}>
                <label>Debtor Type</label>
                <span className={styles.capitalize}>{currentTransaction.debtorType}</span>
              </div>
              <div className={styles.field}>
                <label>Payment Schedule Item</label>
                <span>
                  {currentTransaction.paymentScheduleItemId?.description || 
                   currentTransaction.paymentScheduleItemId || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          {currentTransaction.paymentMethod && (
            <div className={styles.section}>
              <h4>Payment Information</h4>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>Payment Method</label>
                  <span className={styles.capitalize}>{currentTransaction.paymentMethod.replace('_', ' ')}</span>
                </div>
                {currentTransaction.paidAmount && (
                  <div className={styles.field}>
                    <label>Paid Amount</label>
                    <span className={styles.amount}>
                      {formatCurrency(currentTransaction.paidAmount, currentTransaction.currency)}
                    </span>
                  </div>
                )}
                {currentTransaction.paidDate && (
                  <div className={styles.field}>
                    <label>Paid Date</label>
                    <span>{formatDate(currentTransaction.paidDate)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Description & Notes */}
          <div className={styles.section}>
            <h4>Description & Notes</h4>
            <div className={styles.field}>
              <label>Description</label>
              <p className={styles.description}>{currentTransaction.description}</p>
            </div>
            {currentTransaction.notes && (
              <div className={styles.field}>
                <label>Notes</label>
                <p className={styles.notes}>{currentTransaction.notes}</p>
              </div>
            )}
          </div>
          
          {/* Metadata */}
          {currentTransaction.metadata && (
            <div className={styles.section}>
              <h4>Metadata</h4>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>Source</label>
                  <span className={styles.capitalize}>{currentTransaction.metadata.source}</span>
                </div>
                {currentTransaction.metadata.tags && currentTransaction.metadata.tags.length > 0 && (
                  <div className={styles.field}>
                    <label>Tags</label>
                    <div className={styles.tags}>
                      {currentTransaction.metadata.tags.map((tag, index) => (
                        <span key={index} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Audit Information */}
          <div className={styles.section}>
            <h4>Audit Information</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Created By</label>
                <span>{currentTransaction.createdBy?.name || currentTransaction.createdBy || 'System'}</span>
              </div>
              <div className={styles.field}>
                <label>Created At</label>
                <span>{formatDate(currentTransaction.createdAt)}</span>
              </div>
              {currentTransaction.updatedBy && (
                <div className={styles.field}>
                  <label>Updated By</label>
                  <span>{currentTransaction.updatedBy?.name || currentTransaction.updatedBy}</span>
                </div>
              )}
              {currentTransaction.updatedAt && (
                <div className={styles.field}>
                  <label>Updated At</label>
                  <span>{formatDate(currentTransaction.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
          <div className={styles.actionGroup}>
            {canEdit() && (
              <button onClick={handleEdit} className={styles.editButton}>
                Edit Transaction
              </button>
            )}
            
            {canMarkAsPaid() && (
              <button 
                onClick={() => setShowPaymentForm(true)} 
                className={styles.payButton}
                disabled={isMarkingPaid}
              >
                Mark as Paid
              </button>
            )}
            
            {canDispute() && (
              <button 
                onClick={() => setShowDisputeForm(true)} 
                className={styles.disputeButton}
                disabled={isDisputing}
              >
                Dispute
              </button>
            )}
          </div>
          
          <div className={styles.actionGroup}>
            {canUpdateStatus() && getAvailableStatusTransitions().length > 0 && (
              <div className={styles.statusActions}>
                <label>Change Status:</label>
                {getAvailableStatusTransitions().map(status => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    className={styles.statusButton}
                    disabled={isUpdatingStatus}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
            
            {canDelete() && (
              <button onClick={handleDelete} className={styles.deleteButton}>
                Delete
              </button>
            )}
          </div>
        </div>
        
        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className={styles.formOverlay}>
            <div className={styles.formModal}>
              <h4>Mark as Paid</h4>
              <form onSubmit={handleMarkAsPaid}>
                <div className={styles.formField}>
                  <label>Amount *</label>
                  <input
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    step="0.01"
                    min="0"
                    max={currentTransaction.signedAmount}
                    required
                  />
                </div>
                <div className={styles.formField}>
                  <label>Payment Method *</label>
                  <select
                    value={paymentData.method}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, method: e.target.value }))}
                    required
                  >
                    <option value="">Select Method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                  </select>
                </div>
                <div className={styles.formField}>
                  <label>Reference</label>
                  <input
                    type="text"
                    value={paymentData.reference}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Payment reference"
                  />
                </div>
                {paymentError && (
                  <div className={styles.formError}>{paymentError}</div>
                )}
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowPaymentForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isMarkingPaid}>
                    {isMarkingPaid ? 'Processing...' : 'Mark as Paid'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Dispute Form Modal */}
        {showDisputeForm && (
          <div className={styles.formOverlay}>
            <div className={styles.formModal}>
              <h4>Dispute Transaction</h4>
              <form onSubmit={handleDispute}>
                <div className={styles.formField}>
                  <label>Dispute Reason *</label>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    rows="4"
                    placeholder="Please provide a reason for disputing this transaction"
                    required
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowDisputeForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isDisputing}>
                    {isDisputing ? 'Submitting...' : 'Submit Dispute'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingTransactionDetail;
// AI-NOTE: Created comprehensive billing transaction detail view with payment processing, dispute handling, and status management