// AI-NOTE: Redux slice for billing event histories state management with view navigation and filtering
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // View management
  currentView: 'list', // 'list', 'detail'
  selectedEventHistoryId: null,
  
  // Modal states
  isDetailModalOpen: false,
  isNoteModalOpen: false,
  isDocumentUploadModalOpen: false,
  
  // Filter and search state
  filters: {
    accountId: '',
    agencyId: '',
    billingTransactionId: '',
    eventType: '',
    startDate: '',
    endDate: '',
    triggeredBy: '',
    search: '',
    isVisible: true,
  },
  
  // Pagination and sorting
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  
  sorting: {
    sortBy: 'eventDate',
    sortOrder: 'desc',
  },
  
  // Selection state for bulk operations
  selectedEventHistories: [],
  selectAll: false,
  bulkActionType: null, // 'hide', 'show', 'export'
  
  // Form data for modals
  noteFormData: {
    billingTransactionId: '',
    note: '',
    eventData: {},
  },
  
  documentUploadData: {
    billingTransactionId: '',
    file: null,
    documentType: 'other',
    description: '',
  },
  
  // UI state
  loading: false,
  error: null,
};

const billingEventHistoriesSlice = createSlice({
  name: 'billingEventHistories',
  initialState,
  reducers: {
    // View management
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    
    setSelectedEventHistoryId: (state, action) => {
      state.selectedEventHistoryId = action.payload;
    },
    
    // Modal management
    openDetailModal: (state, action) => {
      state.isDetailModalOpen = true;
      state.selectedEventHistoryId = action.payload;
    },
    
    closeDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.selectedEventHistoryId = null;
    },
    
    openNoteModal: (state, action) => {
      state.isNoteModalOpen = true;
      state.noteFormData.billingTransactionId = action.payload;
    },
    
    closeNoteModal: (state) => {
      state.isNoteModalOpen = false;
      state.noteFormData = initialState.noteFormData;
    },
    
    openDocumentUploadModal: (state, action) => {
      state.isDocumentUploadModalOpen = true;
      state.documentUploadData.billingTransactionId = action.payload;
    },
    
    closeDocumentUploadModal: (state) => {
      state.isDocumentUploadModalOpen = false;
      state.documentUploadData = initialState.documentUploadData;
    },
    
    // Filter management
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    // Pagination and sorting
    updatePagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    updateSorting: (state, action) => {
      state.sorting = { ...state.sorting, ...action.payload };
      state.pagination.page = 1; // Reset to first page when sorting changes
    },
    
    // Selection management for bulk operations
    toggleEventHistorySelection: (state, action) => {
      const eventHistoryId = action.payload;
      const index = state.selectedEventHistories.indexOf(eventHistoryId);
      
      if (index > -1) {
        state.selectedEventHistories.splice(index, 1);
      } else {
        state.selectedEventHistories.push(eventHistoryId);
      }
      
      // Update selectAll state
      state.selectAll = false;
    },
    
    selectAllEventHistories: (state, action) => {
      const eventHistoryIds = action.payload;
      state.selectedEventHistories = eventHistoryIds;
      state.selectAll = true;
    },
    
    clearEventHistorySelection: (state) => {
      state.selectedEventHistories = [];
      state.selectAll = false;
      state.bulkActionType = null;
    },
    
    setBulkActionType: (state, action) => {
      state.bulkActionType = action.payload;
    },
    
    // Form data management
    updateNoteFormData: (state, action) => {
      state.noteFormData = { ...state.noteFormData, ...action.payload };
    },
    
    resetNoteFormData: (state) => {
      state.noteFormData = initialState.noteFormData;
    },
    
    updateDocumentUploadData: (state, action) => {
      state.documentUploadData = { ...state.documentUploadData, ...action.payload };
    },
    
    resetDocumentUploadData: (state) => {
      state.documentUploadData = initialState.documentUploadData;
    },
    
    // Navigation helpers
    goToEventHistoryDetail: (state, action) => {
      state.currentView = 'detail';
      state.selectedEventHistoryId = action.payload;
    },
    
    goBackToEventHistoriesList: (state) => {
      state.currentView = 'list';
      state.selectedEventHistoryId = null;
    },
    
    // UI state management
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  // View management
  setCurrentView,
  setSelectedEventHistoryId,
  
  // Modal management
  openDetailModal,
  closeDetailModal,
  openNoteModal,
  closeNoteModal,
  openDocumentUploadModal,
  closeDocumentUploadModal,
  
  // Filter management
  updateFilters,
  clearFilters,
  
  // Pagination and sorting
  updatePagination,
  updateSorting,
  
  // Selection management
  toggleEventHistorySelection,
  selectAllEventHistories,
  clearEventHistorySelection,
  setBulkActionType,
  
  // Form data management
  updateNoteFormData,
  resetNoteFormData,
  updateDocumentUploadData,
  resetDocumentUploadData,
  
  // Navigation helpers
  goToEventHistoryDetail,
  goBackToEventHistoriesList,
  
  // UI state management
  setLoading,
  setError,
  clearError,
} = billingEventHistoriesSlice.actions;

// Selectors
export const selectCurrentView = (state) => state.billingEventHistories.currentView;
export const selectSelectedEventHistoryId = (state) => state.billingEventHistories.selectedEventHistoryId;
export const selectIsDetailModalOpen = (state) => state.billingEventHistories.isDetailModalOpen;
export const selectIsNoteModalOpen = (state) => state.billingEventHistories.isNoteModalOpen;
export const selectIsDocumentUploadModalOpen = (state) => state.billingEventHistories.isDocumentUploadModalOpen;
export const selectFilters = (state) => state.billingEventHistories.filters;
export const selectPagination = (state) => state.billingEventHistories.pagination;
export const selectSorting = (state) => state.billingEventHistories.sorting;
export const selectSelectedEventHistories = (state) => state.billingEventHistories.selectedEventHistories;
export const selectSelectAll = (state) => state.billingEventHistories.selectAll;
export const selectBulkActionType = (state) => state.billingEventHistories.bulkActionType;
export const selectNoteFormData = (state) => state.billingEventHistories.noteFormData;
export const selectDocumentUploadData = (state) => state.billingEventHistories.documentUploadData;
export const selectLoading = (state) => state.billingEventHistories.loading;
export const selectError = (state) => state.billingEventHistories.error;

export default billingEventHistoriesSlice.reducer;