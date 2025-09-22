import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useCreateOfferLetterMutation,
  useUpdateOfferLetterMutation,
  useReplaceOfferLetterMutation,
} from '../../store/api/api';
import {
  selectSelectedOfferLetter,
  selectFormMode,
  closeForm,
} from '../../store/slices/offer-letters.slice';
// AI-NOTE: Fixed import error - selectAuth selector doesn't exist in auth.slice, use direct state.auth access instead
import styles from './OfferLetterForm.module.css';

/**
 * OfferLetterForm component - handles creating, editing, and replacing offer letters
 * Supports different modes: create, edit, replace with appropriate validation
 */
const OfferLetterForm = () => {
  const dispatch = useDispatch();
  const selectedOfferLetter = useSelector(selectSelectedOfferLetter);
  const formMode = useSelector(selectFormMode);
  const { user } = useSelector((state) => state.auth);
  
  // Mutations
  const [createOfferLetter, { isLoading: isCreating }] = useCreateOfferLetterMutation();
  const [updateOfferLetter, { isLoading: isUpdating }] = useUpdateOfferLetterMutation();
  const [replaceOfferLetter, { isLoading: isReplacing }] = useReplaceOfferLetterMutation();
  
  // Form state
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    institutionDetails: {
      name: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
    },
    courseDetails: {
      name: '',
      duration: '',
      startDate: '',
      endDate: '',
      tuitionFee: '',
      currency: 'USD',
    },
    intake: '',
    expiryDate: '',
    conditions: [],
    commissionDetails: {
      percentage: '',
      amount: '',
      paymentTerms: '',
    },
    replacementReason: '', // Only for replace mode
  });
  
  const [errors, setErrors] = useState({});
  const [newCondition, setNewCondition] = useState('');
  
  // Initialize form data when editing or replacing
  useEffect(() => {
    if ((formMode === 'edit' || formMode === 'replace') && selectedOfferLetter) {
      setFormData({
        studentId: selectedOfferLetter.studentId?._id || '',
        courseId: selectedOfferLetter.courseId?._id || '',
        institutionDetails: {
          name: selectedOfferLetter.institutionDetails?.name || '',
          address: selectedOfferLetter.institutionDetails?.address || '',
          contactEmail: selectedOfferLetter.institutionDetails?.contactEmail || '',
          contactPhone: selectedOfferLetter.institutionDetails?.contactPhone || '',
        },
        courseDetails: {
          name: selectedOfferLetter.courseDetails?.name || '',
          duration: selectedOfferLetter.courseDetails?.duration || '',
          startDate: selectedOfferLetter.courseDetails?.startDate ? 
            new Date(selectedOfferLetter.courseDetails.startDate).toISOString().split('T')[0] : '',
          endDate: selectedOfferLetter.courseDetails?.endDate ? 
            new Date(selectedOfferLetter.courseDetails.endDate).toISOString().split('T')[0] : '',
          tuitionFee: selectedOfferLetter.courseDetails?.tuitionFee || '',
          currency: selectedOfferLetter.courseDetails?.currency || 'USD',
        },
        intake: selectedOfferLetter.intake ? 
          new Date(selectedOfferLetter.intake).toISOString().split('T')[0] : '',
        expiryDate: selectedOfferLetter.expiryDate ? 
          new Date(selectedOfferLetter.expiryDate).toISOString().split('T')[0] : '',
        conditions: selectedOfferLetter.conditions || [],
        commissionDetails: {
          percentage: selectedOfferLetter.commissionDetails?.percentage || '',
          amount: selectedOfferLetter.commissionDetails?.amount || '',
          paymentTerms: selectedOfferLetter.commissionDetails?.paymentTerms || '',
        },
        replacementReason: '',
      });
    }
  }, [formMode, selectedOfferLetter]);
  
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
  
  // Add condition
  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setFormData(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()],
      }));
      setNewCondition('');
    }
  };
  
  // Remove condition
  const handleRemoveCondition = (index) => {
    setFormData(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId) newErrors.studentId = 'Student is required';
    if (!formData.courseId) newErrors.courseId = 'Course is required';
    if (!formData.institutionDetails.name) newErrors['institutionDetails.name'] = 'Institution name is required';
    if (!formData.courseDetails.name) newErrors['courseDetails.name'] = 'Course name is required';
    if (!formData.courseDetails.tuitionFee) newErrors['courseDetails.tuitionFee'] = 'Tuition fee is required';
    if (!formData.intake) newErrors.intake = 'Intake date is required';
    if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required';
    
    // Validate dates
    if (formData.intake && formData.expiryDate) {
      const intakeDate = new Date(formData.intake);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= intakeDate) {
        newErrors.expiryDate = 'Expiry date must be after intake date';
      }
    }
    
    if (formData.courseDetails.startDate && formData.courseDetails.endDate) {
      const startDate = new Date(formData.courseDetails.startDate);
      const endDate = new Date(formData.courseDetails.endDate);
      if (endDate <= startDate) {
        newErrors['courseDetails.endDate'] = 'End date must be after start date';
      }
    }
    
    // Validate replacement reason for replace mode
    if (formMode === 'replace' && !formData.replacementReason.trim()) {
      newErrors.replacementReason = 'Replacement reason is required';
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
        courseDetails: {
          ...formData.courseDetails,
          tuitionFee: parseFloat(formData.courseDetails.tuitionFee),
        },
        commissionDetails: {
          ...formData.commissionDetails,
          percentage: formData.commissionDetails.percentage ? 
            parseFloat(formData.commissionDetails.percentage) : undefined,
          amount: formData.commissionDetails.amount ? 
            parseFloat(formData.commissionDetails.amount) : undefined,
        },
      };
      
      if (formMode === 'create') {
        await createOfferLetter(submitData).unwrap();
      } else if (formMode === 'edit') {
        await updateOfferLetter({ id: selectedOfferLetter._id, ...submitData }).unwrap();
      } else if (formMode === 'replace') {
        await replaceOfferLetter({ 
          id: selectedOfferLetter._id, 
          reason: formData.replacementReason,
          ...submitData 
        }).unwrap();
      }
      
      dispatch(closeForm());
    } catch (error) {
      console.error('Failed to save offer letter:', error);
      setErrors({ submit: error.data?.message || 'Failed to save offer letter' });
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    dispatch(closeForm());
  };
  
  const isLoading = isCreating || isUpdating || isReplacing;
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>
            {formMode === 'create' && 'Create Offer Letter'}
            {formMode === 'edit' && 'Edit Offer Letter'}
            {formMode === 'replace' && 'Replace Offer Letter'}
          </h3>
          <button onClick={handleCancel} className={styles.closeButton}>
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Student and Course Selection */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="studentId">Student *</label>
              <select
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                className={errors.studentId ? styles.errorInput : ''}
                required
              >
                <option value="">Select Student</option>
                {/* TODO: Populate with actual students */}
              </select>
              {errors.studentId && <span className={styles.error}>{errors.studentId}</span>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="courseId">Course *</label>
              <select
                id="courseId"
                name="courseId"
                value={formData.courseId}
                onChange={handleInputChange}
                className={errors.courseId ? styles.errorInput : ''}
                required
              >
                <option value="">Select Course</option>
                {/* TODO: Populate with actual courses */}
              </select>
              {errors.courseId && <span className={styles.error}>{errors.courseId}</span>}
            </div>
          </div>
          
          {/* Institution Details */}
          <div className={styles.section}>
            <h4>Institution Details</h4>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="institutionName">Institution Name *</label>
                <input
                  type="text"
                  id="institutionName"
                  name="institutionDetails.name"
                  value={formData.institutionDetails.name}
                  onChange={handleInputChange}
                  className={errors['institutionDetails.name'] ? styles.errorInput : ''}
                  required
                />
                {errors['institutionDetails.name'] && 
                  <span className={styles.error}>{errors['institutionDetails.name']}</span>
                }
              </div>
              
              <div className={styles.field}>
                <label htmlFor="institutionAddress">Address</label>
                <input
                  type="text"
                  id="institutionAddress"
                  name="institutionDetails.address"
                  value={formData.institutionDetails.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="institutionEmail">Contact Email</label>
                <input
                  type="email"
                  id="institutionEmail"
                  name="institutionDetails.contactEmail"
                  value={formData.institutionDetails.contactEmail}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="institutionPhone">Contact Phone</label>
                <input
                  type="tel"
                  id="institutionPhone"
                  name="institutionDetails.contactPhone"
                  value={formData.institutionDetails.contactPhone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          {/* Course Details */}
          <div className={styles.section}>
            <h4>Course Details</h4>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="courseName">Course Name *</label>
                <input
                  type="text"
                  id="courseName"
                  name="courseDetails.name"
                  value={formData.courseDetails.name}
                  onChange={handleInputChange}
                  className={errors['courseDetails.name'] ? styles.errorInput : ''}
                  required
                />
                {errors['courseDetails.name'] && 
                  <span className={styles.error}>{errors['courseDetails.name']}</span>
                }
              </div>
              
              <div className={styles.field}>
                <label htmlFor="courseDuration">Duration</label>
                <input
                  type="text"
                  id="courseDuration"
                  name="courseDetails.duration"
                  value={formData.courseDetails.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 2 years"
                />
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="courseStartDate">Start Date</label>
                <input
                  type="date"
                  id="courseStartDate"
                  name="courseDetails.startDate"
                  value={formData.courseDetails.startDate}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="courseEndDate">End Date</label>
                <input
                  type="date"
                  id="courseEndDate"
                  name="courseDetails.endDate"
                  value={formData.courseDetails.endDate}
                  onChange={handleInputChange}
                  className={errors['courseDetails.endDate'] ? styles.errorInput : ''}
                />
                {errors['courseDetails.endDate'] && 
                  <span className={styles.error}>{errors['courseDetails.endDate']}</span>
                }
              </div>
            </div>
            
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="tuitionFee">Tuition Fee *</label>
                <input
                  type="number"
                  id="tuitionFee"
                  name="courseDetails.tuitionFee"
                  value={formData.courseDetails.tuitionFee}
                  onChange={handleInputChange}
                  className={errors['courseDetails.tuitionFee'] ? styles.errorInput : ''}
                  min="0"
                  step="0.01"
                  required
                />
                {errors['courseDetails.tuitionFee'] && 
                  <span className={styles.error}>{errors['courseDetails.tuitionFee']}</span>
                }
              </div>
              
              <div className={styles.field}>
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="courseDetails.currency"
                  value={formData.courseDetails.currency}
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
          </div>
          
          {/* Dates */}
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="intake">Intake Date *</label>
              <input
                type="date"
                id="intake"
                name="intake"
                value={formData.intake}
                onChange={handleInputChange}
                className={errors.intake ? styles.errorInput : ''}
                required
              />
              {errors.intake && <span className={styles.error}>{errors.intake}</span>}
            </div>
            
            <div className={styles.field}>
              <label htmlFor="expiryDate">Expiry Date *</label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={errors.expiryDate ? styles.errorInput : ''}
                required
              />
              {errors.expiryDate && <span className={styles.error}>{errors.expiryDate}</span>}
            </div>
          </div>
          
          {/* Conditions */}
          <div className={styles.section}>
            <h4>Conditions</h4>
            <div className={styles.conditionsInput}>
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add a condition..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
              />
              <button type="button" onClick={handleAddCondition} className={styles.addButton}>
                Add
              </button>
            </div>
            
            {formData.conditions.length > 0 && (
              <div className={styles.conditionsList}>
                {formData.conditions.map((condition, index) => (
                  <div key={index} className={styles.conditionItem}>
                    <span>{condition}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(index)}
                      className={styles.removeButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Commission Details */}
          <div className={styles.section}>
            <h4>Commission Details</h4>
            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="commissionPercentage">Commission Percentage</label>
                <input
                  type="number"
                  id="commissionPercentage"
                  name="commissionDetails.percentage"
                  value={formData.commissionDetails.percentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="%"
                />
              </div>
              
              <div className={styles.field}>
                <label htmlFor="commissionAmount">Commission Amount</label>
                <input
                  type="number"
                  id="commissionAmount"
                  name="commissionDetails.amount"
                  value={formData.commissionDetails.amount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className={styles.field}>
              <label htmlFor="paymentTerms">Payment Terms</label>
              <textarea
                id="paymentTerms"
                name="commissionDetails.paymentTerms"
                value={formData.commissionDetails.paymentTerms}
                onChange={handleInputChange}
                rows="3"
                placeholder="Describe payment terms..."
              />
            </div>
          </div>
          
          {/* Replacement Reason (only for replace mode) */}
          {formMode === 'replace' && (
            <div className={styles.section}>
              <h4>Replacement Reason</h4>
              <div className={styles.field}>
                <label htmlFor="replacementReason">Reason for Replacement *</label>
                <textarea
                  id="replacementReason"
                  name="replacementReason"
                  value={formData.replacementReason}
                  onChange={handleInputChange}
                  className={errors.replacementReason ? styles.errorInput : ''}
                  rows="3"
                  placeholder="Explain why this offer letter is being replaced..."
                  required
                />
                {errors.replacementReason && 
                  <span className={styles.error}>{errors.replacementReason}</span>
                }
              </div>
            </div>
          )}
          
          {/* Submit Error */}
          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}
          
          {/* Form Actions */}
          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Saving...' : 
                formMode === 'create' ? 'Create Offer Letter' :
                formMode === 'edit' ? 'Update Offer Letter' :
                'Replace Offer Letter'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OfferLetterForm;

// AI-NOTE: Created comprehensive OfferLetterForm component with validation, multiple modes (create/edit/replace), and proper error handling following project patterns