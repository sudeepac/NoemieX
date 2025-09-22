import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  useGetOfferLetterQuery,
  useUpdateOfferLetterStatusMutation,
  useAddDocumentMutation,
  useDeleteOfferLetterMutation,
} from '../../store/offer-letters/offer-letters.api';
import {
  selectSelectedOfferLetter,
  closeDetail,
  openForm,
} from '../../store/offer-letters/offer-letters.slice';
// AI-NOTE: Fixed import error - selectAuth selector doesn't exist in auth.slice, use direct state.auth access instead
import styles from './OfferLetterDetail.module.css';

/**
 * OfferLetterDetail component - displays detailed view of an offer letter
 * Supports status management, document handling, and various actions based on permissions
 */
const OfferLetterDetail = () => {
  const dispatch = useDispatch();
  const selectedOfferLetter = useSelector(selectSelectedOfferLetter);
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [documentData, setDocumentData] = useState({ name: '', url: '' });
  const [documentError, setDocumentError] = useState('');
  
  // Fetch fresh data for the selected offer letter
  const {
    data: offerLetter,
    isLoading,
    error,
    refetch,
  } = useGetOfferLetterQuery(selectedOfferLetter?._id, {
    skip: !selectedOfferLetter?._id,
  });
  
  // Mutations
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOfferLetterStatusMutation();
  const [addDocument, { isLoading: isAddingDocument }] = useAddDocumentMutation();
  const [deleteOfferLetter] = useDeleteOfferLetterMutation();
  
  // Use fresh data if available, fallback to selected
  const currentOfferLetter = offerLetter || selectedOfferLetter;
  
  // Handle close
  const handleClose = () => {
    dispatch(closeDetail());
  };
  
  // Handle status updates
  const handleStatusUpdate = async (newStatus) => {
    if (!currentOfferLetter) return;
    
    const confirmMessage = {
      issued: 'Are you sure you want to issue this offer letter?',
      accepted: 'Are you sure you want to mark this offer letter as accepted?',
      rejected: 'Are you sure you want to mark this offer letter as rejected?',
      cancelled: 'Are you sure you want to cancel this offer letter?',
    }[newStatus];
    
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }
    
    try {
      await updateStatus({ id: currentOfferLetter._id, status: newStatus }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };
  
  // Handle document addition
  const handleAddDocument = async (e) => {
    e.preventDefault();
    
    if (!documentData.name.trim() || !documentData.url.trim()) {
      setDocumentError('Both document name and URL are required');
      return;
    }
    
    try {
      await addDocument({
        id: currentOfferLetter._id,
        name: documentData.name.trim(),
        url: documentData.url.trim(),
      }).unwrap();
      
      setDocumentData({ name: '', url: '' });
      setShowDocumentForm(false);
      setDocumentError('');
      refetch();
    } catch (error) {
      setDocumentError(error.data?.message || 'Failed to add document');
    }
  };
  
  // Handle edit
  const handleEdit = () => {
    dispatch(openForm({ mode: 'edit', offerLetter: currentOfferLetter }));
  };
  
  // Handle replace
  const handleReplace = () => {
    dispatch(openForm({ mode: 'replace', offerLetter: currentOfferLetter }));
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this offer letter? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteOfferLetter(currentOfferLetter._id).unwrap();
      dispatch(closeDetail());
    } catch (error) {
      console.error('Failed to delete offer letter:', error);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Format currency
  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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
  
  // Check permissions
  const canEdit = () => {
    if (!currentOfferLetter) return false;
    if (portal === 'superadmin') return true;
    if (portal === 'account') return ['admin', 'manager'].includes(user?.role);
    if (portal === 'agency') {
      return user?.agencyId === currentOfferLetter.agencyId?._id && ['admin', 'manager'].includes(user?.role);
    }
    return false;
  };
  
  const canUpdateStatus = () => {
    return canEdit() && ['draft', 'issued'].includes(currentOfferLetter?.status);
  };
  
  const canAddDocuments = () => {
    return canEdit() && currentOfferLetter?.status !== 'cancelled';
  };
  
  const canDelete = () => {
    return canEdit() && currentOfferLetter?.status === 'draft';
  };
  
  // Get available status transitions
  const getAvailableStatusTransitions = () => {
    if (!currentOfferLetter) return [];
    
    const transitions = {
      draft: ['issued', 'cancelled'],
      issued: ['accepted', 'rejected', 'cancelled'],
      accepted: ['cancelled'],
      rejected: [],
      expired: [],
      replaced: [],
      cancelled: [],
    };
    
    return transitions[currentOfferLetter.status] || [];
  };
  
  if (isLoading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>Loading offer letter details...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>Error loading offer letter: {error.message}</div>
        </div>
      </div>
    );
  }
  
  if (!currentOfferLetter) {
    return null;
  }
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3>Offer Letter Details</h3>
            <span className={getStatusBadgeClass(currentOfferLetter.status)}>
              {currentOfferLetter.status}
            </span>
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
                <label>Issue Date</label>
                <span>{formatDate(currentOfferLetter.issueDate)}</span>
              </div>
              <div className={styles.field}>
                <label>Expiry Date</label>
                <span>{formatDate(currentOfferLetter.expiryDate)}</span>
              </div>
              <div className={styles.field}>
                <label>Intake Date</label>
                <span>{formatDate(currentOfferLetter.intake)}</span>
              </div>
              <div className={styles.field}>
                <label>Version</label>
                <span>{currentOfferLetter.version}</span>
              </div>
            </div>
          </div>
          
          {/* Student Information */}
          {currentOfferLetter.studentId && (
            <div className={styles.section}>
              <h4>Student Information</h4>
              <div className={styles.grid}>
                <div className={styles.field}>
                  <label>Name</label>
                  <span>
                    {currentOfferLetter.studentId.firstName} {currentOfferLetter.studentId.lastName}
                  </span>
                </div>
                <div className={styles.field}>
                  <label>Email</label>
                  <span>{currentOfferLetter.studentId.email}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Institution Details */}
          <div className={styles.section}>
            <h4>Institution Details</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Name</label>
                <span>{currentOfferLetter.institutionDetails.name}</span>
              </div>
              <div className={styles.field}>
                <label>Address</label>
                <span>{currentOfferLetter.institutionDetails.address}</span>
              </div>
              <div className={styles.field}>
                <label>Contact Email</label>
                <span>{currentOfferLetter.institutionDetails.contactEmail}</span>
              </div>
              <div className={styles.field}>
                <label>Contact Phone</label>
                <span>{currentOfferLetter.institutionDetails.contactPhone}</span>
              </div>
            </div>
          </div>
          
          {/* Course Details */}
          <div className={styles.section}>
            <h4>Course Details</h4>
            <div className={styles.grid}>
              <div className={styles.field}>
                <label>Course Name</label>
                <span>{currentOfferLetter.courseDetails.name}</span>
              </div>
              <div className={styles.field}>
                <label>Duration</label>
                <span>{currentOfferLetter.courseDetails.duration}</span>
              </div>
              <div className={styles.field}>
                <label>Start Date</label>
                <span>
                  {currentOfferLetter.courseDetails.startDate && 
                    formatDate(currentOfferLetter.courseDetails.startDate)
                  }
                </span>
              </div>
              <div className={styles.field}>
                <label>End Date</label>
                <span>
                  {currentOfferLetter.courseDetails.endDate && 
                    formatDate(currentOfferLetter.courseDetails.endDate)
                  }
                </span>
              </div>
              <div className={styles.field}>
                <label>Tuition Fee</label>
                <span>
                  {formatCurrency(
                    currentOfferLetter.courseDetails.tuitionFee,
                    currentOfferLetter.courseDetails.currency
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {/* Conditions */}
          {currentOfferLetter.conditions && currentOfferLetter.conditions.length > 0 && (
            <div className={styles.section}>
              <h4>Conditions</h4>
              <ul className={styles.conditionsList}>
                {currentOfferLetter.conditions.map((condition, index) => (
                  <li key={index}>{condition}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Commission Details */}
          {currentOfferLetter.commissionDetails && (
            <div className={styles.section}>
              <h4>Commission Details</h4>
              <div className={styles.grid}>
                {currentOfferLetter.commissionDetails.percentage && (
                  <div className={styles.field}>
                    <label>Commission Percentage</label>
                    <span>{currentOfferLetter.commissionDetails.percentage}%</span>
                  </div>
                )}
                {currentOfferLetter.commissionDetails.amount && (
                  <div className={styles.field}>
                    <label>Commission Amount</label>
                    <span>
                      {formatCurrency(
                        currentOfferLetter.commissionDetails.amount,
                        currentOfferLetter.courseDetails.currency
                      )}
                    </span>
                  </div>
                )}
              </div>
              {currentOfferLetter.commissionDetails.paymentTerms && (
                <div className={styles.field}>
                  <label>Payment Terms</label>
                  <p className={styles.paymentTerms}>
                    {currentOfferLetter.commissionDetails.paymentTerms}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Documents */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h4>Documents</h4>
              {canAddDocuments() && (
                <button
                  onClick={() => setShowDocumentForm(!showDocumentForm)}
                  className={styles.addDocumentButton}
                >
                  Add Document
                </button>
              )}
            </div>
            
            {/* Add Document Form */}
            {showDocumentForm && (
              <form onSubmit={handleAddDocument} className={styles.documentForm}>
                <div className={styles.documentFormFields}>
                  <input
                    type="text"
                    placeholder="Document name"
                    value={documentData.name}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, name: e.target.value }))}
                    className={styles.documentInput}
                  />
                  <input
                    type="url"
                    placeholder="Document URL"
                    value={documentData.url}
                    onChange={(e) => setDocumentData(prev => ({ ...prev, url: e.target.value }))}
                    className={styles.documentInput}
                  />
                  <button type="submit" disabled={isAddingDocument} className={styles.saveDocumentButton}>
                    {isAddingDocument ? 'Adding...' : 'Add'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDocumentForm(false);
                      setDocumentData({ name: '', url: '' });
                      setDocumentError('');
                    }}
                    className={styles.cancelDocumentButton}
                  >
                    Cancel
                  </button>
                </div>
                {documentError && <div className={styles.documentError}>{documentError}</div>}
              </form>
            )}
            
            {/* Documents List */}
            {currentOfferLetter.documents && currentOfferLetter.documents.length > 0 ? (
              <div className={styles.documentsList}>
                {currentOfferLetter.documents.map((doc, index) => (
                  <div key={index} className={styles.documentItem}>
                    <span className={styles.documentName}>{doc.name}</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.documentLink}
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noDocuments}>No documents attached</p>
            )}
          </div>
          
          {/* Lifecycle Information */}
          {currentOfferLetter.lifecycle && (
            <div className={styles.section}>
              <h4>Lifecycle</h4>
              <div className={styles.grid}>
                {currentOfferLetter.lifecycle.issuedAt && (
                  <div className={styles.field}>
                    <label>Issued At</label>
                    <span>{formatDate(currentOfferLetter.lifecycle.issuedAt)}</span>
                  </div>
                )}
                {currentOfferLetter.lifecycle.acceptedAt && (
                  <div className={styles.field}>
                    <label>Accepted At</label>
                    <span>{formatDate(currentOfferLetter.lifecycle.acceptedAt)}</span>
                  </div>
                )}
                {currentOfferLetter.lifecycle.rejectedAt && (
                  <div className={styles.field}>
                    <label>Rejected At</label>
                    <span>{formatDate(currentOfferLetter.lifecycle.rejectedAt)}</span>
                  </div>
                )}
                {currentOfferLetter.lifecycle.cancelledAt && (
                  <div className={styles.field}>
                    <label>Cancelled At</label>
                    <span>{formatDate(currentOfferLetter.lifecycle.cancelledAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className={styles.actions}>
          {/* Status Actions */}
          {canUpdateStatus() && (
            <div className={styles.statusActions}>
              {getAvailableStatusTransitions().map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdatingStatus}
                  className={`${styles.statusButton} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}
                >
                  {status === 'issued' && 'Issue'}
                  {status === 'accepted' && 'Accept'}
                  {status === 'rejected' && 'Reject'}
                  {status === 'cancelled' && 'Cancel'}
                </button>
              ))}
            </div>
          )}
          
          {/* Edit Actions */}
          <div className={styles.editActions}>
            {canEdit() && (
              <>
                <button onClick={handleEdit} className={styles.editButton}>
                  Edit
                </button>
                {currentOfferLetter.status === 'issued' && (
                  <button onClick={handleReplace} className={styles.replaceButton}>
                    Replace
                  </button>
                )}
              </>
            )}
            
            {canDelete() && (
              <button onClick={handleDelete} className={styles.deleteButton}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterDetail;

// AI-NOTE: Created comprehensive OfferLetterDetail component with status management, document handling, and portal-based permissions following project patterns