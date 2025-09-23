import { createSlice } from '@reduxjs/toolkit';

// AI-NOTE: Payment schedules UI state slice - handles local component state only (filters, pagination, selection)
const initialState = {
  filters: {
    search: '',
    status: '',
    type: '',
    accountId: '',
    agencyId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
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
};

const paymentSchedulesUiSlice = createSlice({
  name: 'paymentSchedulesUi',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1; // Reset to first page when filtering
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
      state.pagination.page = 1; // Reset to first page when sorting
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
      state.selectedItems = action.payload; // Array of all item IDs
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
  openForm,
  closeForm,
  openDetail,
  closeDetail,
} = paymentSchedulesUiSlice.actions;

// Selectors
export const selectFilters = (state) => state.paymentSchedulesUi.filters;
export const selectPagination = (state) => state.paymentSchedulesUi.pagination;
export const selectSorting = (state) => state.paymentSchedulesUi.sorting;
export const selectSelectedItems = (state) => state.paymentSchedulesUi.selectedItems;
export const selectBulkActionMode = (state) => state.paymentSchedulesUi.bulkActionMode;
export const selectShowFilters = (state) => state.paymentSchedulesUi.showFilters;
export const selectShowStats = (state) => state.paymentSchedulesUi.showStats;
export const selectFormOpen = (state) => state.paymentSchedulesUi.formOpen;
export const selectDetailOpen = (state) => state.paymentSchedulesUi.detailOpen;
export const selectSelectedItemId = (state) => state.paymentSchedulesUi.selectedItemId;

export default paymentSchedulesUiSlice.reducer;