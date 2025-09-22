// AI-NOTE: Billing event history detail view component with comprehensive information display
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  useGetBillingEventHistoryByIdQuery,
  useUpdateBillingEventHistoryVisibilityMutation,
  useAddNoteToBillingEventHistoryMutation,
  useUploadBillingEventHistoryDocumentMutation
} from '../../store/api/api';
import {
  selectCurrentView,
  setCurrentView
} from '../../store/slices/billing-event-histories.slice';
import styles from './BillingEventHistoryDetail.module.css';

// Icons
const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DollarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const LoadingIcon = () => (
  <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const BillingEventHistoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const currentView = useSelector(selectCurrentView);
  
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [uploadingDocument, setUploadingDocument] = useState(false);
  
  const {
    data: eventHistory,
    isLoading,
    error,
    refetch
  } = useGetBillingEventHistoryByIdQuery(id, {
    skip: !id
  });
  
  const [updateVisibility] = useUpdateBillingEventHistoryVisibilityMutation();
  const [addNote] = useAddNoteToBillingEventHistoryMutation();
  const [uploadDocument] = useUploadBillingEventHistoryDocumentMutation();

  useEffect(() => {
    if (currentView !== 'detail') {
      dispatch(setCurrentView('detail'));
    }
  }, [currentView, dispatch]);

  const handleBack = () => {
    navigate(-1);
    dispatch(setCurrentView('list'));
  };

  const handleToggleVisibility = async () => {
    try {
      await updateVisibility({
        billingEventHistoryId: eventHistory._id,
        isVisible: !eventHistory.isVisible
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to update visibility:', error);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    
    try {
      await addNote({
        id: eventHistory._id,
        note: noteText.trim()
      }).unwrap();
      setNoteText('');
      setShowNoteForm(false);
      refetch();
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingDocument(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      
      await uploadDocument({
        id: eventHistory._id,
        document: formData
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploadingDocument(false);
    }
  };

  const getEventTypeColor = (eventType) => {
    const colors = {
      'status_change': 'blue',
      'payment_received': 'green',
      'payment_failed': 'red',
      'refund_processed': 'yellow',
      'dispute_opened': 'orange',
      'dispute_resolved': 'purple',
      'note_added': 'gray',
      'document_uploaded': 'gray'
    };
    return colors[eventType] || 'gray';
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  if (isLoading) {
    return (
      <div className={styles.billingEventHistories}>
        <div className={styles.billingEventHistoriesContent}>
          <div className={styles.loadingState}>
            <LoadingIcon />
            <p>Loading event history details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.billingEventHistories}>
        <div className={styles.billingEventHistoriesContent}>
          <div className={styles.errorState}>
            <p>Error loading event history details</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={refetch}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!eventHistory) {
    return (
      <div className={styles.billingEventHistories}>
        <div className={styles.billingEventHistoriesContent}>
          <div className={styles.emptyState}>
            <p>Event history not found</p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleBack}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.billingEventHistories}>
      <div className={styles.billingEventHistoriesContent}>
        <div className={styles.eventDetailContainer}>
          {/* Header */}
          <div className={styles.detailHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <button className={`${styles.btn} ${styles.btnGhost}`} onClick={handleBack}>
                  <ArrowLeftIcon />
                  Back
                </button>
                <div className={styles.headerTitle}>
                  <h1>Event History Details</h1>
                  <div className={styles.headerMeta}>
                    <span className={`event-type-badge ${getEventTypeColor(eventHistory.eventType)}`}>
                      {eventHistory.eventType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`status-badge ${eventHistory.isVisible ? 'visible' : 'hidden'}`}>
                      {eventHistory.isVisible ? (
                        <>
                          <EyeIcon />
                          Visible
                        </>
                      ) : (
                        <>
                          <EyeOffIcon />
                          Hidden
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={handleToggleVisibility}
                >
                  {eventHistory.isVisible ? (
                    <>
                      <EyeOffIcon />
                      Hide
                    </>
                  ) : (
                    <>
                      <EyeIcon />
                      Show
                    </>
                  )}
                </button>
                <button
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={() => setShowNoteForm(!showNoteForm)}
                >
                  <PlusIcon />
                  Add Note
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={styles.detailContent}>
            <div className={styles.detailGrid}>
              {/* Event Information */}
              <div className={styles.detailSection}>
                <h2>Event Information</h2>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <label>Event Date</label>
                    <div className={styles.infoValue}>
                      <CalendarIcon />
                      {formatDate(eventHistory.eventDate)}
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Event Type</label>
                    <div className={styles.infoValue}>
                      <span className={`event-type-badge ${getEventTypeColor(eventHistory.eventType)}`}>
                        {eventHistory.eventType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className={styles.infoItem}>
                    <label>Description</label>
                    <div className={`${styles.infoValue} ${styles.description}`}>
                      {eventHistory.eventSummary || 'No description available'}
                    </div>
                  </div>
                  {eventHistory.eventData?.amount && (
                    <div className={styles.infoItem}>
                      <label>Amount</label>
                      <div className={`${styles.infoValue} ${styles.amount}`}>
                        <DollarIcon />
                        {formatCurrency(eventHistory.eventData.amount)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Data */}
              {eventHistory.eventData && Object.keys(eventHistory.eventData).length > 0 && (
                <div className={styles.detailSection}>
                  <h2>Event Data</h2>
                  <div className={styles.eventData}>
                    {Object.entries(eventHistory.eventData).map(([key, value]) => (
                      <div key={key} className={styles.dataItem}>
                        <label>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                        <div className={styles.dataValue}>
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Information */}
              <div className={styles.detailSection}>
                <h2>User Information</h2>
                <div className={styles.infoGrid}>
                  {eventHistory.triggeredBy && (
                    <div className={styles.infoItem}>
                      <label>Triggered By</label>
                      <div className={styles.infoValue}>
                        <UserIcon />
                        {eventHistory.triggeredBy.name || eventHistory.triggeredBy.email || 'System'}
                      </div>
                    </div>
                  )}
                  {eventHistory.performedBy && (
                    <div className={styles.infoItem}>
                      <label>Performed By</label>
                      <div className={styles.infoValue}>
                        <UserIcon />
                        {eventHistory.performedBy.name || eventHistory.performedBy.email || 'Unknown'}
                        {eventHistory.performedBy.role && (
                          <span className={styles.userRole}>({eventHistory.performedBy.role})</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* System Information */}
              {eventHistory.systemInfo && (
                <div className={styles.detailSection}>
                  <h2>System Information</h2>
                  <div className={styles.infoGrid}>
                    {eventHistory.systemInfo.ipAddress && (
                      <div className={styles.infoItem}>
                        <label>IP Address</label>
                        <div className={styles.infoValue}>{eventHistory.systemInfo.ipAddress}</div>
                      </div>
                    )}
                    {eventHistory.systemInfo.userAgent && (
                      <div className={styles.infoItem}>
                        <label>User Agent</label>
                        <div className={styles.infoValue}>{eventHistory.systemInfo.userAgent}</div>
                      </div>
                    )}
                    {eventHistory.systemInfo.source && (
                      <div className={styles.infoItem}>
                        <label>Source</label>
                        <div className={styles.infoValue}>{eventHistory.systemInfo.source}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Documents Section */}
            {eventHistory.documents && eventHistory.documents.length > 0 && (
              <div className={`${styles.detailSection} ${styles.fullWidth}`}>
                <h2>Documents</h2>
                <div className={styles.documentsGrid}>
                  {eventHistory.documents.map((doc, index) => (
                    <div key={index} className={styles.documentCard}>
                      <div className={styles.documentInfo}>
                        <DocumentIcon />
                        <div className={styles.documentDetails}>
                          <div className={styles.documentName}>{doc.name}</div>
                          <div className={styles.documentMeta}>
                            {doc.type} • Uploaded {formatDate(doc.uploadDate)}
                          </div>
                        </div>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}
                      >
                        <DownloadIcon />
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Note Form */}
            {showNoteForm && (
              <div className={`${styles.detailSection} ${styles.fullWidth}`}>
                <h2>Add Note</h2>
                <form onSubmit={handleAddNote} className={styles.noteForm}>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter your note here..."
                    rows={4}
                    className={styles.noteTextarea}
                    required
                  />
                  <div className={styles.noteActions}>
                    <button
                      type="button"
                      className={`${styles.btn} ${styles.btnOutline}`}
                      onClick={() => {
                        setShowNoteForm(false);
                        setNoteText('');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                      Add Note
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Document Upload */}
            <div className={`${styles.detailSection} ${styles.fullWidth}`}>
              <h2>Upload Document</h2>
              <div className={styles.uploadArea}>
                <input
                  type="file"
                  id="document-upload"
                  onChange={handleDocumentUpload}
                  disabled={uploadingDocument}
                  className={styles.uploadInput}
                />
                <label htmlFor="document-upload" className={styles.uploadLabel}>
                  {uploadingDocument ? (
                    <>
                      <LoadingIcon />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <DocumentIcon />
                      Choose File to Upload
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingEventHistoryDetail;