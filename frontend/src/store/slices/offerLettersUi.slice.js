import { createSlice } from '@reduxjs/toolkit';

// AI-NOTE: UI slice for component local state - READ /store/README.md for when to use UI slices
// Handles: filters, pagination, selection, modal states | Use for state that persists across navigation
const initialState = {
  filters: {
    search: '',
    status: '',
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

const offerLettersUiSlice = createSlice({
  name: 'offerLettersUi',
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
} = offerLettersUiSlice.actions;

// Selectors
export const selectFilters = (state) => state.offerLettersUi.filters;
export const selectPagination = (state) => state.offerLettersUi.pagination;
export const selectSorting = (state) => state.offerLettersUi.sorting;
export const selectSelectedItems = (state) => state.offerLettersUi.selectedItems;
export const selectBulkActionMode = (state) => state.offerLettersUi.bulkActionMode;
export const selectShowFilters = (state) => state.offerLettersUi.showFilters;
export const selectShowStats = (state) => state.offerLettersUi.showStats;
export const selectFormOpen = (state) => state.offerLettersUi.formOpen;
export const selectDetailOpen = (state) => state.offerLettersUi.detailOpen;
export const selectSelectedItemId = (state) => state.offerLettersUi.selectedItemId;

export default offerLettersUiSlice.reducer;