// AI-NOTE: Redux slice for billing event histories state management with view navigation and filtering
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyScopeToEndpoint } from '../../utils/apiHelpers';

// Async thunks for API calls
export const fetchBillingEventHistories = createAsyncThunk(
  'billingEventHistories/fetchBillingEventHistories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(applyScopeToEndpoint('/api/billing-event-histories', params), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch billing event histories');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBillingEventHistoryById = createAsyncThunk(
  'billingEventHistories/fetchBillingEventHistoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(applyScopeToEndpoint(`/api/billing-event-histories/${id}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch billing event history');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionTimeline = createAsyncThunk(
  'billingEventHistories/fetchTransactionTimeline',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await fetch(applyScopeToEndpoint(`/api/billing-event-histories/transaction/${transactionId}/timeline`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch transaction timeline');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActivitySummary = createAsyncThunk(
  'billingEventHistories/fetchActivitySummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(applyScopeToEndpoint('/api/billing-event-histories/activity/summary', params), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch activity summary');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'billingEventHistories/fetchUserActivity',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await fetch(applyScopeToEndpoint('/api/billing-event-histories/user/activity', params), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user activity');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const hideBillingEventHistory = createAsyncThunk(
  'billingEventHistories/hideBillingEventHistory',
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(applyScopeToEndpoint(`/api/billing-event-histories/${id}/hide`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to hide billing event history');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // API data
  eventHistories: [],
  currentEventHistory: null,
  transactionTimeline: [],
  activitySummary: null,
  userActivity: [],
  
  // Loading states
  loading: {
    fetch: false,
    fetchById: false,
    fetchTimeline: false,
    fetchActivitySummary: false,
    fetchUserActivity: false,
    hide: false,
  },
  
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
  extraReducers: (builder) => {
    builder
      // fetchBillingEventHistories
      .addCase(fetchBillingEventHistories.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchBillingEventHistories.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.eventHistories = action.payload.data || [];
        state.pagination = {
          ...state.pagination,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchBillingEventHistories.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload || 'Failed to fetch billing event histories';
      })
      
      // fetchBillingEventHistoryById
      .addCase(fetchBillingEventHistoryById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(fetchBillingEventHistoryById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentEventHistory = action.payload;
      })
      .addCase(fetchBillingEventHistoryById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload || 'Failed to fetch billing event history';
      })
      
      // fetchTransactionTimeline
      .addCase(fetchTransactionTimeline.pending, (state) => {
        state.loading.fetchTimeline = true;
        state.error = null;
      })
      .addCase(fetchTransactionTimeline.fulfilled, (state, action) => {
        state.loading.fetchTimeline = false;
        state.transactionTimeline = action.payload;
      })
      .addCase(fetchTransactionTimeline.rejected, (state, action) => {
        state.loading.fetchTimeline = false;
        state.error = action.payload || 'Failed to fetch transaction timeline';
      })
      
      // fetchActivitySummary
      .addCase(fetchActivitySummary.pending, (state) => {
        state.loading.fetchActivitySummary = true;
        state.error = null;
      })
      .addCase(fetchActivitySummary.fulfilled, (state, action) => {
        state.loading.fetchActivitySummary = false;
        state.activitySummary = action.payload;
      })
      .addCase(fetchActivitySummary.rejected, (state, action) => {
        state.loading.fetchActivitySummary = false;
        state.error = action.payload || 'Failed to fetch activity summary';
      })
      
      // fetchUserActivity
      .addCase(fetchUserActivity.pending, (state) => {
        state.loading.fetchUserActivity = true;
        state.error = null;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.loading.fetchUserActivity = false;
        state.userActivity = action.payload;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.loading.fetchUserActivity = false;
        state.error = action.payload || 'Failed to fetch user activity';
      })
      
      // hideBillingEventHistory
      .addCase(hideBillingEventHistory.pending, (state) => {
        state.loading.hide = true;
        state.error = null;
      })
      .addCase(hideBillingEventHistory.fulfilled, (state, action) => {
        state.loading.hide = false;
        // Update the event history in the list to mark it as hidden
        const eventHistoryId = action.meta.arg;
        state.eventHistories = state.eventHistories.map(history =>
          history._id === eventHistoryId
            ? { ...history, isHidden: true }
            : history
        );
      })
      .addCase(hideBillingEventHistory.rejected, (state, action) => {
        state.loading.hide = false;
        state.error = action.payload || 'Failed to hide billing event history';
      });
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

// Export async thunks
export {
  fetchBillingEventHistories,
  fetchBillingEventHistoryById,
  fetchTransactionTimeline,
  fetchActivitySummary,
  fetchUserActivity,
  hideBillingEventHistory,
};

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

// API data selectors
export const selectEventHistories = (state) => state.billingEventHistories.eventHistories;
export const selectCurrentEventHistory = (state) => state.billingEventHistories.currentEventHistory;
export const selectTransactionTimeline = (state) => state.billingEventHistories.transactionTimeline;
export const selectActivitySummary = (state) => state.billingEventHistories.activitySummary;
export const selectUserActivity = (state) => state.billingEventHistories.userActivity;

// Loading state selectors
export const selectFetchLoading = (state) => state.billingEventHistories.loading.fetch;
export const selectFetchByIdLoading = (state) => state.billingEventHistories.loading.fetchById;
export const selectFetchTimelineLoading = (state) => state.billingEventHistories.loading.fetchTimeline;
export const selectFetchActivitySummaryLoading = (state) => state.billingEventHistories.loading.fetchActivitySummary;
export const selectFetchUserActivityLoading = (state) => state.billingEventHistories.loading.fetchUserActivity;
export const selectHideLoading = (state) => state.billingEventHistories.loading.hide;

export default billingEventHistoriesSlice.reducer;