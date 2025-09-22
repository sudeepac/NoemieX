import { createSlice } from '@reduxjs/toolkit';

// Initial state for offer letters
const initialState = {
  // UI state
  selectedOfferLetter: null,
  isFormOpen: false,
  isDetailOpen: false,
  formMode: 'create', // 'create', 'edit', 'replace'
  
  // Filters and pagination
  filters: {
    search: '',
    status: '',
    agencyId: '',
    studentId: '',
    courseId: '',
    dateFrom: '',
    dateTo: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    sortBy: 'issueDate',
    sortOrder: 'desc',
  },
  
  // Loading states
  isLoading: false,
  error: null,
};

// Create the offer letters slice
const offerLettersSlice = createSlice({
  name: 'offerLetters',
  initialState,
  reducers: {
    // UI state management
    setSelectedOfferLetter: (state, action) => {
      state.selectedOfferLetter = action.payload;
    },
    
    clearSelectedOfferLetter: (state) => {
      state.selectedOfferLetter = null;
    },
    
    openForm: (state, action) => {
      state.isFormOpen = true;
      state.formMode = action.payload?.mode || 'create';
      if (action.payload?.offerLetter) {
        state.selectedOfferLetter = action.payload.offerLetter;
      }
    },
    
    closeForm: (state) => {
      state.isFormOpen = false;
      state.formMode = 'create';
      state.selectedOfferLetter = null;
    },
    
    openDetail: (state, action) => {
      state.isDetailOpen = true;
      state.selectedOfferLetter = action.payload;
    },
    
    closeDetail: (state) => {
      state.isDetailOpen = false;
      state.selectedOfferLetter = null;
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
    
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1;
    },
    
    setStatus: (state, action) => {
      state.filters.status = action.payload;
      state.pagination.page = 1;
    },
    
    // Pagination management
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when limit changes
    },
    
    setSorting: (state, action) => {
      state.pagination.sortBy = action.payload.sortBy;
      state.pagination.sortOrder = action.payload.sortOrder;
    },
    
    // Loading and error states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset all state
    resetState: () => initialState,
  },
});

// Export actions
export const {
  setSelectedOfferLetter,
  clearSelectedOfferLetter,
  openForm,
  closeForm,
  openDetail,
  closeDetail,
  setFilters,
  clearFilters,
  setSearch,
  setStatus,
  setPagination,
  setPage,
  setLimit,
  setSorting,
  setLoading,
  setError,
  clearError,
  resetState,
} = offerLettersSlice.actions;

// Selectors
export const selectOfferLetters = (state) => state.offerLetters;
export const selectSelectedOfferLetter = (state) => state.offerLetters.selectedOfferLetter;
export const selectIsFormOpen = (state) => state.offerLetters.isFormOpen;
export const selectIsDetailOpen = (state) => state.offerLetters.isDetailOpen;
export const selectFormMode = (state) => state.offerLetters.formMode;
export const selectFilters = (state) => state.offerLetters.filters;
export const selectPagination = (state) => state.offerLetters.pagination;
export const selectIsLoading = (state) => state.offerLetters.isLoading;
export const selectError = (state) => state.offerLetters.error;

// Export reducer
export default offerLettersSlice.reducer;

// AI-NOTE: Created Redux slice for offer letters state management with UI controls, filters, pagination, and loading states following project patterns