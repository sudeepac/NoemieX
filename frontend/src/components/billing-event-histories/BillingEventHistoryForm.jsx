// AI-NOTE: Billing event history form component for editing visibility, notes, and uploading documents
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Upload, 
  FileText, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';
import {
  useUpdateBillingEventHistoryVisibilityMutation,
  useUploadBillingEventHistoryDocumentMutation,
} from '../../store/api/api';
import styles from './BillingEventHistoryForm.module.css';

const BillingEventHistoryForm = ({ 
  billingEventHistory, 
  onCancel, 
  onSuccess,
  portal = 'superadmin'
}) => {
  const [updateBillingEventHistory, { isLoading: isUpdating }] = useUpdateBillingEventHistoryVisibilityMutation();
  const [uploadBillingEventHistoryDocument] = useUploadBillingEventHistoryDocumentMutation();
  
  const [localFormData, setLocalFormData] = useState({
    visibility: 'visible',
    notes: '',
    documents: []
  });
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (billingEventHistory) {
      const initialData = {
        visibility: billingEventHistory.visibility || 'visible',
        notes: billingEventHistory.notes || '',
        documents: billingEventHistory.documents || []
      };
      setLocalFormData(initialData);
    }
  }, [billingEventHistory]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  // Remove selected file
  const removeSelectedFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload documents
  const handleDocumentUpload = async () => {
    if (selectedFiles.length === 0) return;

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('billingEventHistoryId', billingEventHistory.id);
        formData.append('documentType', 'supporting_document');

        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        const result = await uploadBillingEventHistoryDocument(formData).unwrap();
        
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        return result;
      });

      const uploadedDocs = await Promise.all(uploadPromises);
      
      // Update local form data with new documents
      const updatedDocuments = [...localFormData.documents, ...uploadedDocs];
      handleFieldChange('documents', updatedDocuments);
      
      // Clear selected files
      setSelectedFiles([]);
      setUploadProgress({});
      
    } catch (error) {
      console.error('Document upload failed:', error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Upload any pending documents first
      if (selectedFiles.length > 0) {
        await handleDocumentUpload();
      }

      // Update billing event history
      await updateBillingEventHistory({
        id: billingEventHistory.id,
        visibility: localFormData.visibility,
        notes: localFormData.notes
      }).unwrap();

      onSuccess?.();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedFiles([]);
    setUploadProgress({});
    onCancel?.();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.billingEventHistoryForm}>
      <div className={styles.formHeader}>
        <div className={styles.headerContent}>
          <h2>Edit Billing Event History</h2>
          <p className={styles.formSubtitle}>
            Update visibility settings, add notes, and upload supporting documents
          </p>
        </div>
        <button 
          type="button" 
          className={styles.btnIcon} 
          onClick={handleCancel}
          disabled={isUpdating || isUploading}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.formContent}>
        {/* Event Information */}
        <div className={styles.formSection}>
          <h3>Event Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Event Type</label>
              <span>{billingEventHistory?.eventType || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Amount</label>
              <span className={styles.amount}>
                ${billingEventHistory?.eventData?.amount?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Date</label>
              <span>{new Date(billingEventHistory?.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Performed By</label>
              <span>
                {billingEventHistory?.performedBy?.name || 'System'}
                {billingEventHistory?.performedBy?.role && ` (${billingEventHistory.performedBy.role})`}
              </span>
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className={styles.formSection}>
          <h3>Visibility Settings</h3>
          <div className={styles.formGroup}>
            <label>Event Visibility</label>
            <div className={styles.visibilityOptions}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="visibility"
                  value="visible"
                  checked={localFormData.visibility === 'visible'}
                  onChange={(e) => handleFieldChange('visibility', e.target.value)}
                />
                <Eye className="w-4 h-4" />
                <span>Visible</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="visibility"
                  value="hidden"
                  checked={localFormData.visibility === 'hidden'}
                  onChange={(e) => handleFieldChange('visibility', e.target.value)}
                />
                <EyeOff className="w-4 h-4" />
                <span>Hidden</span>
              </label>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className={styles.formSection}>
          <h3>Notes & Comments</h3>
          <div className={styles.formGroup}>
            <label htmlFor="notes">Internal Notes</label>
            <textarea
              id="notes"
              value={localFormData.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Add internal notes about this billing event..."
              rows={4}
            />
          </div>
        </div>

        {/* Document Upload */}
        <div className={styles.formSection}>
          <h3>Supporting Documents</h3>
          
          {/* Existing Documents */}
          {billingEventHistory?.documents && billingEventHistory.documents.length > 0 && (
            <div className={styles.existingDocuments}>
              <h4>Existing Documents</h4>
              <div className={styles.documentsList}>
                {billingEventHistory.documents.map((doc, index) => (
                  <div key={index} className={styles.documentItem}>
                    <FileText className="w-4 h-4" />
                    <span className={styles.documentName}>{doc.filename}</span>
                    <span className={styles.documentSize}>{formatFileSize(doc.size)}</span>
                    <span className={styles.documentDate}>
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className={styles.formGroup}>
            <label>Upload New Documents</label>
            <div className={styles.fileUploadArea}>
              <input
                type="file"
                id="document-upload"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
              <label htmlFor="document-upload" className={styles.uploadPrompt}>
                <Upload className="w-6 h-6" />
                <p>Click to upload or drag and drop</p>
                <p>PDF, DOC, DOCX, JPG, PNG (max 10MB each)</p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className={styles.selectedFiles}>
                <h4>Selected Files</h4>
                {selectedFiles.map((file, index) => (
                  <div key={index} className={styles.selectedFile}>
                    <FileText className="w-4 h-4" />
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
                    {uploadProgress[index] !== undefined && (
                      <div className={styles.uploadProgress}>
                        <div 
                          className={styles.progressBar}
                          style={{ width: `${uploadProgress[index]}%` }}
                        />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className={styles.btnRemove}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleCancel}
            className={`${styles.btn} ${styles.btnSecondary}`}
            disabled={isUpdating || isUploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isUpdating || isUploading}
          >
            {(isUpdating || isUploading) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isUploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingEventHistoryForm;