import { createSlice } from '@reduxjs/toolkit';

// AI-NOTE: Billing event histories UI state slice - handles local component state only (filters, pagination, selection)
const initialState = {
  filters: {
    search: '',
    eventType: '',
    accountId: '',
    agencyId: '',
    transactionId: '',
    startDate: '',
    endDate: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  sorting: {
    field: 'createdAt',
    order: 'desc',
  },
  selectedItems: [],
  bulkActionMode: false,
  showFilters: false,
  showStats: false,
  formOpen: false,
  detailOpen: false,
  selectedItemId: null,
  currentView: 'list', // list, detail
};

const billingEventHistoriesUiSlice = createSlice({
  name: 'billingEventHistoriesUi',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    // Pagination actions
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    // Sorting actions
    setSorting: (state, action) => {
      state.sorting = action.payload;
      state.pagination.page = 1;
    },
    
    // Selection actions
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
      state.selectedItems = action.payload;
    },
    clearSelectedItems: (state) => {
      state.selectedItems = [];
      state.bulkActionMode = false;
    },
    
    // Bulk action mode
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
    toggleStats: (state) => {
      state.showStats = !state.showStats;
    },
    
    // View management
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    
    // Form and detail modals
    openForm: (state, action) => {
      state.formOpen = true;
      state.selectedItemId = action.payload || null;
    },
    closeForm: (state) => {
      state.formOpen = false;
      state.selectedItemId = null;
    },
    openDetail: (state, action) => {
      state.detailOpen = true;
      state.selectedItemId = action.payload;
    },
    closeDetail: (state) => {
      state.detailOpen = false;
      state.selectedItemId = null;
    },
  },
});

export const {
  setFilters,
  clearFilters,
  setPagination,
  setPage,
  setSorting,
  toggleItemSelection,
  selectAllItems,
  clearSelectedItems,
  setBulkActionMode,
  toggleFilters,
  toggleStats,
  setCurrentView,
  openForm,
  closeForm,
  openDetail,
  closeDetail,
} = billingEventHistoriesUiSlice.actions;

// Selectors
export const selectFilters = (state) => state.billingEventHistoriesUi.filters;
export const selectPagination = (state) => state.billingEventHistoriesUi.pagination;
export const selectSorting = (state) => state.billingEventHistoriesUi.sorting;
export const selectSelectedItems = (state) => state.billingEventHistoriesUi.selectedItems;
export const selectBulkActionMode = (state) => state.billingEventHistoriesUi.bulkActionMode;
export const selectShowFilters = (state) => state.billingEventHistoriesUi.showFilters;
export const selectShowStats = (state) => state.billingEventHistoriesUi.showStats;
export const selectCurrentView = (state) => state.billingEventHistoriesUi.currentView;
export const selectFormOpen = (state) => state.billingEventHistoriesUi.formOpen;
export const selectDetailOpen = (state) => state.billingEventHistoriesUi.detailOpen;
export const selectSelectedItemId = (state) => state.billingEventHistoriesUi.selectedItemId;

export default billingEventHistoriesUiSlice.reducer;