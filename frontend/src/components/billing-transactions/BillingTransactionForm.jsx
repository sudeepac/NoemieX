import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useCreateBillingTransactionMutation,
  useUpdateBillingTransactionMutation,
} from '../../store/billing-transactions/billing-transactions.api';
import {
  selectEditingTransaction,
  selectCurrentView,
  goBackToTransactionsList,
} from '../../store/billing-transactions/billing-transactions.slice';
import styles from './BillingTransactionForm.module.css';

/**
 * BillingTransactionForm component - handles creating and editing billing transactions
 * Supports different modes: create, edit with appropriate validation
 * AI-NOTE: Form follows established pattern from OfferLetterForm with billing-specific fields
 */
const BillingTransactionForm = () => {
  const dispatch = useDispatch();
  const editingTransaction = useSelector(selectEditingTransaction);
  const currentView = useSelector(selectCurrentView);
  const { user } = useSelector((state) => state.auth);
  
  // Mutations
  const [createBillingTransaction, { isLoading: isCreating }] = useCreateBillingTransactionMutation();
  const [updateBillingTransaction, { isLoading: isUpdating }] = useUpdateBillingTransactionMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    accountId: '',
    agencyId: '',
    paymentScheduleItemId: '',
    debtorType: 'student',
    signedAmount: '',
    currency: 'USD',
    transactionType: 'tuition_fee',
    description: '',
    dueDate: '',
    status: 'pending',
    priority: 'medium',
    category: 'tuition',
    subcategory: '',
    paymentMethod: '',
    reference: '',
    externalTransactionId: '',
    metadata: {
      source: 'manual',
      tags: [],
      customFields: {}
    },
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [newTag, setNewTag] = useState('');
  
  // Initialize form data when editing
  useEffect(() => {
    if (currentView === 'edit' && editingTransaction) {
      setFormData({
        accountId: editingTransaction.accountId?._id || '',
        agencyId: editingTransaction.agencyId?._id || '',
        paymentScheduleItemId: editingTransaction.paymentScheduleItemId?._id || '',
        debtorType: editingTransaction.debtorType || 'student',
        signedAmount: editingTransaction.signedAmount || '',
        currency: editingTransaction.currency || 'USD',
        transactionType: editingTransaction.transactionType || 'tuition_fee',
        description: editingTransaction.description || '',
        dueDate: editingTransaction.dueDate ?
          new Date(editingTransaction.dueDate).toISOString().split('T')[0] : '',
        status: editingTransaction.status || 'pending',
        priority: editingTransaction.priority || 'medium',
        category: editingTransaction.category || 'tuition',
        subcategory: editingTransaction.subcategory || '',
        paymentMethod: editingTransaction.paymentMethod || '',
        reference: editingTransaction.reference || '',
        externalTransactionId: editingTransaction.externalTransactionId || '',
        metadata: {
          source: editingTransaction.metadata?.source || 'manual',
          tags: editingTransaction.metadata?.tags || [],
          customFields: editingTransaction.metadata?.customFields || {}
        },
        notes: editingTransaction.notes || ''
      });
    }
  }, [currentView, editingTransaction]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Add tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.metadata.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          tags: [...prev.metadata.tags, newTag.trim()]
        }
      }));
      setNewTag('');
    }
  };
  
  // Remove tag
  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags: prev.metadata.tags.filter((_, i) => i !== index)
      }
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.accountId) newErrors.accountId = 'Account is required';
    if (!formData.agencyId) newErrors.agencyId = 'Agency is required';
    if (!formData.signedAmount) newErrors.signedAmount = 'Amount is required';
    if (!formData.transactionType) newErrors.transactionType = 'Transaction type is required';
    if (!formData.description) newErrors.description = 'Description is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    
    // Validate amount is a number
    if (formData.signedAmount && isNaN(parseFloat(formData.signedAmount))) {
      newErrors.signedAmount = 'Amount must be a valid number';
    }
    
    // Validate due date is in the future for new transactions
    if (currentView === 'create' && formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        signedAmount: parseFloat(formData.signedAmount),
      };
      
      if (currentView === 'create') {
        await createBillingTransaction(submitData).unwrap();
      } else if (currentView === 'edit') {
        await updateBillingTransaction({ id: editingTransaction._id, ...submitData }).unwrap();
      }
      
      dispatch(goBackToTransactionsList());
    } catch (error) {
      console.error('Failed to save billing transaction:', error);
      setErrors({ submit: error.data?.message || 'Failed to save billing transaction' });
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    dispatch(goBackToTransactionsList());
  };
  
  const isLoading = isCreating || isUpdating;
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>
            {currentView === 'create' && 'Create Billing Transaction'}
        {currentView === 'edit' && 'Edit Billing Transaction'}
          </h3>
          <button onClick={handleCancel} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h4>Basic Information</h4>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="accountId">Account *</label>
                <select
                  id="accountId"
                  name="accountId"
                  value={formData.accountId}
                  onChange={handleInputChange}
                  className={errors.accountId ? styles.error : ''}
                  required
                >
                  <option value="">Select Account</option>
                  {/* TODO: Populate with actual accounts */}
                </select>
                {errors.accountId && <span className={styles.errorText}>{errors.accountId}</span>}
              </div>
              
              <div className={styles.field}>
                <label htmlFor="agencyId">Agency *</label>
                <select
                  id="agencyId"
                  name="agencyId"
                  value={formData.agencyId}
                  onChange={handleInputChange}
                  className={errors.agencyId ? styles.error : ''}
                  required
                >
                  <option value="">Select Agency</option>
                  {/* TODO: Populate with actual agencies */}
                </select>
                {errors.agencyId && <span className={styles.errorText}>{errors.agencyId}</span>}
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="paymentScheduleItemId">Payment Schedule Item</label>
                <select
                  id="paymentScheduleItemId"
                  name="paymentScheduleItemId"
                  value={formData.paymentScheduleItemId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Schedule Item</option>
                  {/* TODO: Populate with actual payment schedule items */}
                </select>
              </div>
              
              <div className={styles.field}>
                <label htmlFor="debtorType">Debtor Type</label>
                <select
                  id="debtorType"
                  name="debtorType"
                  value={formData.debtorType}
                  onChange={handleInputChange}
                >
                  <option value="student">Student</option>
                  <option value="agency">Agency</option>
                  <option value="institution">Institution</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Transaction Details */}
          <div className={styles.section}>
            <h4>Transaction Details</h4>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="signedAmount">Amount *</label>
                <input
                  type="number"
                  id="signedAmount"
                  name="signedAmount"
                  value={formData.signedAmount}
                  onChange={handleInputChange}
                  className={errors.signedAmount ? styles.error : ''}
                  step="0.01"
                  min="0"
                  required
                />
                {errors.signedAmount && <span className={styles.errorText}>{errors.signedAmount}</span>}
              </div>
              
              <div className={styles.field}>
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="transactionType">Transaction Type *</label>
                <select
                  id="transactionType"
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleInputChange}
                  className={errors.transactionType ? styles.error : ''}
                  required
                >
                  <option value="tuition_fee">Tuition Fee</option>
                  <option value="commission">Commission</option>
                  <option value="bonus">Bonus</option>
                  <option value="refund">Refund</option>
                  <option value="penalty">Penalty</option>
                  <option value="adjustment">Adjustment</option>
                </select>
                {errors.transactionType && <span className={styles.errorText}>{errors.transactionType}</span>}
              </div>
              
              <div className={styles.field}>
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="tuition">Tuition</option>
                  <option value="commission">Commission</option>
                  <option value="bonus">Bonus</option>
                  <option value="fee">Fee</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={errors.dueDate ? styles.error : ''}
                  required
                />
                {errors.dueDate && <span className={styles.errorText}>{errors.dueDate}</span>}
              </div>
              
              <div className={styles.field}>
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
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
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className={styles.field}>
                <label htmlFor="paymentMethod">Payment Method</label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="">Select Payment Method</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                </select>
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? styles.error : ''}
                rows="3"
                required
              />
              {errors.description && <span className={styles.errorText}>{errors.description}</span>}
            </div>
          </div>
          
          {/* Additional Information */}
          <div className={styles.section}>
            <h4>Additional Information</h4>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="reference">Reference</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  placeholder="Internal reference number"
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="externalTransactionId">External Transaction ID</label>
                <input
                  type="text"
                  id="externalTransactionId"
                  name="externalTransactionId"
                  value={formData.externalTransactionId}
                  onChange={handleInputChange}
                  placeholder="External system transaction ID"
                />
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="subcategory">Subcategory</label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                placeholder="Optional subcategory"
              />
            </div>
            
            {/* Tags */}
            <div className={styles.field}>
              <label>Tags</label>
              <div className={styles.tagsContainer}>
                <div className={styles.tags}>
                  {formData.metadata.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(index)}
                        className={styles.tagRemove}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className={styles.tagInput}>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add tag"
                  />
                  <button type="button" onClick={handleAddTag} className={styles.addButton}>
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Additional notes or comments"
              />
            </div>
          </div>
          
          {/* Form Actions */}
          <div className={styles.actions}>
            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (currentView === 'create' ? 'Create Transaction' : 'Update Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BillingTransactionForm;
// AI-NOTE: Created comprehensive billing transaction form with validation, following established patterns from OfferLetterForm