// AI-NOTE: Payment schedule Redux slice for UI state management (forms, filters, selections)
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // UI State
  activeView: 'list', // 'list', 'detail', 'form'
  formMode: 'create', // 'create', 'edit'
  selectedPaymentSchedule: null,
  
  // Form state
  isFormOpen: false,
  
  // Filters
  filters: {
    search: '',
    itemType: '',
    milestoneType: '',
    status: '',
    priority: '',
    isOverdue: false,
    dateRange: {
      start: '',
      end: ''
    },
    offerLetterId: '',
    agencyId: '',
    accountId: ''
  },
  
  // Pagination
  pagination: {
    page: 1,
    limit: 10,
    sortBy: 'scheduledDueDate',
    sortOrder: 'asc'
  },
  
  // Bulk operations
  selectedItems: [],
  bulkActionMode: false,
  
  // UI flags
  showFilters: false,
  showStats: true,
};

const paymentSchedulesSlice = createSlice({
  name: 'paymentSchedules',
  initialState,
  reducers: {
    // View management
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    
    // Form management
    openForm: (state, action) => {
      state.isFormOpen = true;
      state.formMode = action.payload?.mode || 'create';
      state.activeView = 'form';
      if (action.payload?.paymentSchedule) {
        state.selectedPaymentSchedule = action.payload.paymentSchedule;
      }
    },
    
    closeForm: (state) => {
      state.isFormOpen = false;
      state.selectedPaymentSchedule = null;
      state.activeView = 'list';
    },
    
    setFormMode: (state, action) => {
      state.formMode = action.payload;
    },
    
    // Detail view
    openDetail: (state, action) => {
      state.selectedPaymentSchedule = action.payload;
      state.activeView = 'detail';
    },
    
    closeDetail: (state) => {
      state.selectedPaymentSchedule = null;
      state.activeView = 'list';
    },
    
    // Selection management
    setSelectedPaymentSchedule: (state, action) => {
      state.selectedPaymentSchedule = action.payload;
    },
    
    clearSelection: (state) => {
      state.selectedPaymentSchedule = null;
    },
    
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filters change
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    setSearchTerm: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    
    setDateRange: (state, action) => {
      state.filters.dateRange = action.payload;
      state.pagination.page = 1;
    },
    
    // Pagination
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setSorting: (state, action) => {
      state.pagination.sortBy = action.payload.sortBy;
      state.pagination.sortOrder = action.payload.sortOrder;
      state.pagination.page = 1;
    },
    
    // Bulk operations
    toggleItemSelection: (state, action) => {
      const itemId = action.payload;
      const index = state.selectedItems.indexOf(itemId);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(itemId);
      }
    },
    
    selectAllItems: (state, action) => {
      state.selectedItems = action.payload; // Array of item IDs
    },
    
    clearSelectedItems: (state) => {
      state.selectedItems = [];
    },
    
    setBulkActionMode: (state, action) => {
      state.bulkActionMode = action.payload;
      if (!action.payload) {
        state.selectedItems = [];
      }
    },
    
    // UI toggles
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    setShowFilters: (state, action) => {
      state.showFilters = action.payload;
    },
    
    toggleStats: (state) => {
      state.showStats = !state.showStats;
    },
    
    setShowStats: (state, action) => {
      state.showStats = action.payload;
    },
    
    // Reset state
    resetState: (state) => {
      return initialState;
    },
  },
});

export const {
  setActiveView,
  openForm,
  closeForm,
  setFormMode,
  openDetail,
  closeDetail,
  setSelectedPaymentSchedule,
  clearSelection,
  setFilters,
  clearFilters,
  setSearchTerm,
  setDateRange,
  setPagination,
  setPage,
  setSorting,
  toggleItemSelection,
  selectAllItems,
  clearSelectedItems,
  setBulkActionMode,
  toggleFilters,
  setShowFilters,
  toggleStats,
  setShowStats,
  resetState,
} = paymentSchedulesSlice.actions;

// Selectors
export const selectActiveView = (state) => state.paymentSchedules.activeView;
export const selectFormMode = (state) => state.paymentSchedules.formMode;
export const selectSelectedPaymentSchedule = (state) => state.paymentSchedules.selectedPaymentSchedule;
export const selectIsFormOpen = (state) => state.paymentSchedules.isFormOpen;
export const selectFilters = (state) => state.paymentSchedules.filters;
export const selectPagination = (state) => state.paymentSchedules.pagination;
export const selectSelectedItems = (state) => state.paymentSchedules.selectedItems;
export const selectBulkActionMode = (state) => state.paymentSchedules.bulkActionMode;
export const selectShowFilters = (state) => state.paymentSchedules.showFilters;
export const selectShowStats = (state) => state.paymentSchedules.showStats;

export default paymentSchedulesSlice.reducer;