// AI-NOTE: Payment schedule form component for creating and editing payment schedule items
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetPaymentScheduleQuery,
  useCreatePaymentScheduleMutation,
  useUpdatePaymentScheduleMutation,
  useReplacePaymentScheduleMutation,
  useGetOfferLettersQuery,
  useGetAgenciesQuery
} from '../../store/api/api';
import {
  selectFormMode,
  selectSelectedPaymentSchedule,
  closeForm,
} from '../../store/slices/payment-schedules.slice';
import { toast } from 'react-toastify';

const PaymentScheduleForm = () => {
  const dispatch = useDispatch();
  const formMode = useSelector(selectFormMode);
  const selectedPaymentSchedule = useSelector(selectSelectedPaymentSchedule);
  const { user } = useSelector((state) => state.auth);

  // API hooks
  const [createPaymentSchedule, { isLoading: isCreating }] = useCreatePaymentScheduleMutation();
  const [updatePaymentSchedule, { isLoading: isUpdating }] = useUpdatePaymentScheduleMutation();
  const { data: offerLettersData } = useGetOfferLettersQuery({ limit: 100 });
  const { data: agenciesData } = useGetAgenciesQuery({ limit: 100 });

  // Form state
  const [formData, setFormData] = useState({
    accountId: user?.accountId || '',
    agencyId: '',
    offerLetterId: '',
    itemType: 'milestone',
    milestoneType: '',
    scheduledAmount: '',
    scheduledDueDate: '',
    description: '',
    priority: 'medium',
    conditions: '',
    isRecurring: false,
    recurringSettings: {
      frequency: 'monthly',
      interval: 1,
      endDate: '',
      maxOccurrences: ''
    },
    metadata: {}
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when editing
  useEffect(() => {
    if (formMode === 'edit' && selectedPaymentSchedule) {
      setFormData({
        accountId: selectedPaymentSchedule.accountId || user?.accountId || '',
        agencyId: selectedPaymentSchedule.agencyId || '',
        offerLetterId: selectedPaymentSchedule.offerLetterId || '',
        itemType: selectedPaymentSchedule.itemType || 'milestone',
        milestoneType: selectedPaymentSchedule.milestoneType || '',
        scheduledAmount: selectedPaymentSchedule.scheduledAmount || '',
        scheduledDueDate: selectedPaymentSchedule.scheduledDueDate ? 
          new Date(selectedPaymentSchedule.scheduledDueDate).toISOString().split('T')[0] : '',
        description: selectedPaymentSchedule.description || '',
        priority: selectedPaymentSchedule.priority || 'medium',
        conditions: selectedPaymentSchedule.conditions || '',
        isRecurring: selectedPaymentSchedule.isRecurring || false,
        recurringSettings: selectedPaymentSchedule.recurringSettings || {
          frequency: 'monthly',
          interval: 1,
          endDate: '',
          maxOccurrences: ''
        },
        metadata: selectedPaymentSchedule.metadata || {}
      });
    }
  }, [formMode, selectedPaymentSchedule, user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('recurringSettings.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        recurringSettings: {
          ...prev.recurringSettings,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.agencyId) newErrors.agencyId = 'Agency is required';
    if (!formData.offerLetterId) newErrors.offerLetterId = 'Offer Letter is required';
    if (!formData.itemType) newErrors.itemType = 'Item Type is required';
    if (formData.itemType === 'milestone' && !formData.milestoneType) {
      newErrors.milestoneType = 'Milestone Type is required for milestone items';
    }
    if (!formData.scheduledAmount || formData.scheduledAmount <= 0) {
      newErrors.scheduledAmount = 'Valid scheduled amount is required';
    }
    if (!formData.scheduledDueDate) newErrors.scheduledDueDate = 'Scheduled due date is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';

    if (formData.isRecurring) {
      if (!formData.recurringSettings.frequency) {
        newErrors['recurringSettings.frequency'] = 'Frequency is required for recurring items';
      }
      if (!formData.recurringSettings.interval || formData.recurringSettings.interval < 1) {
        newErrors['recurringSettings.interval'] = 'Valid interval is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      const submitData = {
        ...formData,
        scheduledAmount: parseFloat(formData.scheduledAmount),
        recurringSettings: formData.isRecurring ? {
          ...formData.recurringSettings,
          interval: parseInt(formData.recurringSettings.interval),
          maxOccurrences: formData.recurringSettings.maxOccurrences ? 
            parseInt(formData.recurringSettings.maxOccurrences) : undefined
        } : undefined
      };

      if (formMode === 'edit') {
        await updatePaymentSchedule({
          id: selectedPaymentSchedule._id,
          ...submitData
        }).unwrap();
        toast.success('Payment schedule updated successfully');
      } else {
        await createPaymentSchedule(submitData).unwrap();
        toast.success('Payment schedule created successfully');
      }
      
      dispatch(closeForm());
    } catch (error) {
      console.error('Error saving payment schedule:', error);
      toast.error(error?.data?.message || 'Failed to save payment schedule');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    dispatch(closeForm());
  };

  const isLoading = isCreating || isUpdating;
  const offerLetters = offerLettersData?.offerLetters || [];
  const agencies = agenciesData?.agencies || [];

  return (
    <div className="payment-schedule-form">
      <div className="form-header">
        <h2>{formMode === 'edit' ? 'Edit Payment Schedule' : 'Create Payment Schedule'}</h2>
        <button 
          type="button" 
          className="btn-close" 
          onClick={handleCancel}
          disabled={isLoading}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-grid">
          {/* Agency Selection */}
          <div className="form-group">
            <label htmlFor="agencyId">Agency *</label>
            <select
              id="agencyId"
              name="agencyId"
              value={formData.agencyId}
              onChange={handleChange}
              className={errors.agencyId ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="">Select Agency</option>
              {agencies.map(agency => (
                <option key={agency._id} value={agency._id}>
                  {agency.name}
                </option>
              ))}
            </select>
            {errors.agencyId && <span className="error-text">{errors.agencyId}</span>}
          </div>

          {/* Offer Letter Selection */}
          <div className="form-group">
            <label htmlFor="offerLetterId">Offer Letter *</label>
            <select
              id="offerLetterId"
              name="offerLetterId"
              value={formData.offerLetterId}
              onChange={handleChange}
              className={errors.offerLetterId ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="">Select Offer Letter</option>
              {offerLetters
                .filter(ol => !formData.agencyId || ol.agencyId === formData.agencyId)
                .map(offerLetter => (
                <option key={offerLetter._id} value={offerLetter._id}>
                  {offerLetter.title} - {offerLetter.clientName}
                </option>
              ))}
            </select>
            {errors.offerLetterId && <span className="error-text">{errors.offerLetterId}</span>}
          </div>

          {/* Item Type */}
          <div className="form-group">
            <label htmlFor="itemType">Item Type *</label>
            <select
              id="itemType"
              name="itemType"
              value={formData.itemType}
              onChange={handleChange}
              className={errors.itemType ? 'error' : ''}
              disabled={isLoading}
            >
              <option value="milestone">Milestone</option>
              <option value="recurring">Recurring</option>
              <option value="one-time">One-time</option>
              <option value="retainer">Retainer</option>
            </select>
            {errors.itemType && <span className="error-text">{errors.itemType}</span>}
          </div>

          {/* Milestone Type (conditional) */}
          {formData.itemType === 'milestone' && (
            <div className="form-group">
              <label htmlFor="milestoneType">Milestone Type *</label>
              <select
                id="milestoneType"
                name="milestoneType"
                value={formData.milestoneType}
                onChange={handleChange}
                className={errors.milestoneType ? 'error' : ''}
                disabled={isLoading}
              >
                <option value="">Select Milestone Type</option>
                <option value="project-start">Project Start</option>
                <option value="design-approval">Design Approval</option>
                <option value="development-complete">Development Complete</option>
                <option value="testing-complete">Testing Complete</option>
                <option value="project-delivery">Project Delivery</option>
                <option value="custom">Custom</option>
              </select>
              {errors.milestoneType && <span className="error-text">{errors.milestoneType}</span>}
            </div>
          )}

          {/* Scheduled Amount */}
          <div className="form-group">
            <label htmlFor="scheduledAmount">Scheduled Amount *</label>
            <input
              type="number"
              id="scheduledAmount"
              name="scheduledAmount"
              value={formData.scheduledAmount}
              onChange={handleChange}
              className={errors.scheduledAmount ? 'error' : ''}
              disabled={isLoading}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            {errors.scheduledAmount && <span className="error-text">{errors.scheduledAmount}</span>}
          </div>

          {/* Scheduled Due Date */}
          <div className="form-group">
            <label htmlFor="scheduledDueDate">Scheduled Due Date *</label>
            <input
              type="date"
              id="scheduledDueDate"
              name="scheduledDueDate"
              value={formData.scheduledDueDate}
              onChange={handleChange}
              className={errors.scheduledDueDate ? 'error' : ''}
              disabled={isLoading}
            />
            {errors.scheduledDueDate && <span className="error-text">{errors.scheduledDueDate}</span>}
          </div>

          {/* Priority */}
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              disabled={isLoading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? 'error' : ''}
            disabled={isLoading}
            rows={3}
            placeholder="Describe the payment schedule item..."
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        {/* Conditions */}
        <div className="form-group">
          <label htmlFor="conditions">Conditions</label>
          <textarea
            id="conditions"
            name="conditions"
            value={formData.conditions}
            onChange={handleChange}
            disabled={isLoading}
            rows={2}
            placeholder="Any conditions or requirements..."
          />
        </div>

        {/* Recurring Settings */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              disabled={isLoading}
            />
            Is Recurring
          </label>
        </div>

        {formData.isRecurring && (
          <div className="recurring-settings">
            <h4>Recurring Settings</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="recurringSettings.frequency">Frequency *</label>
                <select
                  id="recurringSettings.frequency"
                  name="recurringSettings.frequency"
                  value={formData.recurringSettings.frequency}
                  onChange={handleChange}
                  className={errors['recurringSettings.frequency'] ? 'error' : ''}
                  disabled={isLoading}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors['recurringSettings.frequency'] && 
                  <span className="error-text">{errors['recurringSettings.frequency']}</span>
                }
              </div>

              <div className="form-group">
                <label htmlFor="recurringSettings.interval">Interval *</label>
                <input
                  type="number"
                  id="recurringSettings.interval"
                  name="recurringSettings.interval"
                  value={formData.recurringSettings.interval}
                  onChange={handleChange}
                  className={errors['recurringSettings.interval'] ? 'error' : ''}
                  disabled={isLoading}
                  min="1"
                  placeholder="1"
                />
                {errors['recurringSettings.interval'] && 
                  <span className="error-text">{errors['recurringSettings.interval']}</span>
                }
              </div>

              <div className="form-group">
                <label htmlFor="recurringSettings.endDate">End Date</label>
                <input
                  type="date"
                  id="recurringSettings.endDate"
                  name="recurringSettings.endDate"
                  value={formData.recurringSettings.endDate}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="recurringSettings.maxOccurrences">Max Occurrences</label>
                <input
                  type="number"
                  id="recurringSettings.maxOccurrences"
                  name="recurringSettings.maxOccurrences"
                  value={formData.recurringSettings.maxOccurrences}
                  onChange={handleChange}
                  disabled={isLoading}
                  min="1"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (formMode === 'edit' ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentScheduleForm;