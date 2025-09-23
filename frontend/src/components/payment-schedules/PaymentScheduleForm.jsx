// AI-NOTE: Payment schedule form component for creating and editing payment schedule items
// AI-NOTE: Migrated PaymentScheduleForm from useState to React Hook Form for better validation, performance, and maintainability. Uses register(), handleSubmit(), watch() for form state management and conditional validation.
import React, { useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
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
} from '../../store/slices/paymentSchedulesUi.slice';
import { toast } from 'react-toastify';
import ErrorMessage from '../../shared/components/ErrorMessage';
import { FormField, FormSelect, FormCheckbox } from '../common/forms';

const PaymentScheduleForm = React.memo(() => {
  const dispatch = useDispatch();
  const formMode = useSelector(selectFormMode);
  const selectedPaymentSchedule = useSelector(selectSelectedPaymentSchedule);
  const { user } = useSelector((state) => state.auth);

  // API hooks
  const [createPaymentSchedule, { isLoading: isCreating }] = useCreatePaymentScheduleMutation();
  const [updatePaymentSchedule, { isLoading: isUpdating }] = useUpdatePaymentScheduleMutation();
  const { data: offerLettersData } = useGetOfferLettersQuery({ limit: 100 });
  const { data: agenciesData } = useGetAgenciesQuery({ limit: 100 });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    clearErrors
  } = useForm({
    defaultValues: {
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
    },
    mode: 'onChange'
  });

  const formData = watch();

  // Initialize form data when editing
  useEffect(() => {
    if (formMode === 'edit' && selectedPaymentSchedule) {
      const editData = {
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
      };
      reset(editData);
    }
  }, [formMode, selectedPaymentSchedule, user, reset]);

  // Validation rules using React Hook Form
  const validationRules = {
    agencyId: {
      required: 'Agency is required'
    },
    offerLetterId: {
      required: 'Offer Letter is required'
    },
    itemType: {
      required: 'Item Type is required'
    },
    milestoneType: {
      validate: (value) => {
        if (watch('itemType') === 'milestone' && !value) {
          return 'Milestone Type is required for milestone items';
        }
        return true;
      }
    },
    scheduledAmount: {
      required: 'Scheduled Amount is required',
      min: {
        value: 0.01,
        message: 'Amount must be greater than 0'
      }
    },
    scheduledDueDate: {
      required: 'Scheduled Due Date is required'
    },
    description: {
      required: 'Description is required',
      validate: (value) => value?.trim() || 'Description cannot be empty'
    },
    'recurringSettings.frequency': {
      validate: (value) => {
        if (watch('isRecurring') && !value) {
          return 'Frequency is required for recurring items';
        }
        return true;
      }
    },
    'recurringSettings.interval': {
      validate: (value) => {
        if (watch('isRecurring')) {
          if (!value) {
            return 'Interval is required for recurring items';
          }
          if (parseInt(value) < 1) {
            return 'Interval must be at least 1';
          }
        }
        return true;
      }
    }
  };



  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const submitData = {
        ...data,
        scheduledAmount: parseFloat(data.scheduledAmount),
        recurringSettings: data.isRecurring ? {
          ...data.recurringSettings,
          interval: parseInt(data.recurringSettings.interval),
          maxOccurrences: data.recurringSettings.maxOccurrences ? 
            parseInt(data.recurringSettings.maxOccurrences) : undefined
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
  const handleCancel = useCallback(() => {
    dispatch(closeForm());
  }, [dispatch]);

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

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-grid">
          {/* Agency Selection */}
          <FormSelect
            id="agencyId"
            label="Agency"
            register={register}
            validation={validationRules.agencyId}
            error={errors.agencyId}
            disabled={isLoading}
            required
            placeholder="Select Agency"
            options={agencies.map(agency => ({
              value: agency._id,
              label: agency.name
            }))}
          />

          {/* Offer Letter Selection */}
          <FormSelect
            id="offerLetterId"
            label="Offer Letter"
            register={register}
            validation={validationRules.offerLetterId}
            error={errors.offerLetterId}
            disabled={isLoading}
            required
            placeholder="Select Offer Letter"
            options={offerLetters
              .filter(ol => !watch('agencyId') || ol.agencyId === watch('agencyId'))
              .map(offerLetter => ({
                value: offerLetter._id,
                label: `${offerLetter.title} - ${offerLetter.clientName}`
              }))}
          />

          {/* Item Type */}
          <FormSelect
            id="itemType"
            label="Item Type"
            register={register}
            validation={validationRules.itemType}
            error={errors.itemType}
            disabled={isLoading}
            required
            options={[
              { value: 'milestone', label: 'Milestone' },
              { value: 'recurring', label: 'Recurring' },
              { value: 'one-time', label: 'One-time' },
              { value: 'retainer', label: 'Retainer' }
            ]}
          />

          {/* Milestone Type (conditional) */}
          {watch('itemType') === 'milestone' && (
            <FormSelect
              id="milestoneType"
              label="Milestone Type"
              register={register}
              validation={validationRules.milestoneType}
              error={errors.milestoneType}
              disabled={isLoading}
              required
              placeholder="Select Milestone Type"
              options={[
                { value: 'project-start', label: 'Project Start' },
                { value: 'design-approval', label: 'Design Approval' },
                { value: 'development-complete', label: 'Development Complete' },
                { value: 'testing-complete', label: 'Testing Complete' },
                { value: 'project-delivery', label: 'Project Delivery' },
                { value: 'custom', label: 'Custom' }
              ]}
            />
          )}

          {/* Scheduled Amount */}
          <FormField
            id="scheduledAmount"
            label="Scheduled Amount"
            type="number"
            register={register}
            validation={validationRules.scheduledAmount}
            error={errors.scheduledAmount}
            disabled={isLoading}
            required
            min="0"
              step="0.01"
              placeholder="0.00"
            />

          {/* Scheduled Due Date */}
          <FormField
            id="scheduledDueDate"
            label="Scheduled Due Date"
            type="date"
            register={register}
            validation={validationRules.scheduledDueDate}
            error={errors.scheduledDueDate}
            disabled={isLoading}
            required
          />

          {/* Priority */}
          <FormSelect
            id="priority"
            label="Priority"
            register={register}
            disabled={isLoading}
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' }
            ]}
          />
        </div>

        {/* Description */}
        <FormField
          id="description"
          label="Description"
          type="textarea"
          register={register}
          validation={validationRules.description}
          error={errors.description}
          disabled={isLoading}
          required
          rows={3}
          placeholder="Describe the payment schedule item..."
        />

        {/* Conditions */}
        <FormField
          id="conditions"
          label="Conditions"
          type="textarea"
          register={register}
          disabled={isLoading}
          rows={2}
          placeholder="Any conditions or requirements..."
        />

        {/* Recurring Settings */}
        <FormCheckbox
          id="isRecurring"
          label="Is Recurring"
          register={register}
          disabled={isLoading}
        />

        {watch('isRecurring') && (
          <div className="recurring-settings">
            <h4>Recurring Settings</h4>
            <div className="form-grid">
              <FormSelect
                id="recurringSettings.frequency"
                label="Frequency"
                register={register}
                validation={validationRules['recurringSettings.frequency']}
                error={errors.recurringSettings?.frequency}
                disabled={isLoading}
                required
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' },
                  { value: 'quarterly', label: 'Quarterly' },
                  { value: 'yearly', label: 'Yearly' }
                ]}
              />

              <FormField
                id="recurringSettings.interval"
                label="Interval"
                type="number"
                register={register}
                validation={validationRules['recurringSettings.interval']}
                error={errors.recurringSettings?.interval}
                disabled={isLoading}
                required
                min="1"
                placeholder="1"
              />

              <FormField
                id="recurringSettings.endDate"
                label="End Date"
                type="date"
                register={register}
                disabled={isLoading}
              />

              <FormField
                id="recurringSettings.maxOccurrences"
                label="Max Occurrences"
                type="number"
                register={register}
                disabled={isLoading}
                min="1"
                placeholder="Unlimited"
              />
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
});

// AI-NOTE: Component optimized with React.memo and useCallback for better performance
// Prevents unnecessary re-renders when parent components update
export default PaymentScheduleForm;