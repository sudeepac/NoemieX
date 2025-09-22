import { createSlice } from '@reduxjs/toolkit';

// Initial state for agencies UI management
const initialState = {
  // List view state
  filters: {
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    accountId: undefined
  },
  selectedAgencies: [],
  showFilters: false,
  
  // Form state
  formMode: 'create', // 'create' | 'edit'
  editingAgency: null,
  
  // UI state
  activeView: 'list', // 'list' | 'detail' | 'form' | 'stats'
  sidebarCollapsed: false,
  
  // Modal states
  showDeleteModal: false,
  showStatusModal: false,
  agencyToDelete: null,
  agencyToToggle: null,
  
  // Error handling
  error: null,
  lastAction: null
};

/**
 * Agencies slice for managing UI state and interactions
 * Handles filters, selections, modals, and form states
 */
const agenciesSlice = createSlice({
  name: 'agencies',
  initialState,
  reducers: {
    // Filter management
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      // Reset page when changing filters (except pagination)
      if (!action.payload.page) {
        state.filters.page = 1;
      }
    },
    
    resetFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        search: '',
        isActive: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        accountId: state.filters.accountId // Preserve account context
      };
    },
    
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    // Selection management
    setSelectedAgencies: (state, action) => {
      state.selectedAgencies = action.payload;
    },
    
    toggleAgencySelection: (state, action) => {
      const agencyId = action.payload;
      const index = state.selectedAgencies.indexOf(agencyId);
      
      if (index > -1) {
        state.selectedAgencies.splice(index, 1);
      } else {
        state.selectedAgencies.push(agencyId);
      }
    },
    
    clearSelection: (state) => {
      state.selectedAgencies = [];
    },
    
    // View management
    setActiveView: (state, action) => {
      state.activeView = action.payload;
      // Clear selections when changing views
      if (action.payload !== 'list') {
        state.selectedAgencies = [];
      }
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // Form management
    setFormMode: (state, action) => {
      state.formMode = action.payload;
      if (action.payload === 'create') {
        state.editingAgency = null;
      }
    },
    
    setEditingAgency: (state, action) => {
      state.editingAgency = action.payload;
      state.formMode = 'edit';
      state.activeView = 'form';
    },
    
    clearEditingAgency: (state) => {
      state.editingAgency = null;
      state.formMode = 'create';
    },
    
    // Modal management
    showDeleteConfirmation: (state, action) => {
      state.showDeleteModal = true;
      state.agencyToDelete = action.payload;
    },
    
    hideDeleteConfirmation: (state) => {
      state.showDeleteModal = false;
      state.agencyToDelete = null;
    },
    
    showStatusConfirmation: (state, action) => {
      state.showStatusModal = true;
      state.agencyToToggle = action.payload;
    },
    
    hideStatusConfirmation: (state) => {
      state.showStatusModal = false;
      state.agencyToToggle = null;
    },
    
    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
      state.lastAction = action.type;
    },
    
    clearError: (state) => {
      state.error = null;
      state.lastAction = null;
    },
    
    // Account context (for account portal)
    setAccountContext: (state, action) => {
      state.filters.accountId = action.payload;
      state.filters.page = 1; // Reset pagination
    },
    
    clearAccountContext: (state) => {
      state.filters.accountId = undefined;
      state.filters.page = 1;
    },
    
    // Bulk operations
    prepareBulkAction: (state, action) => {
      const { actionType, agencies } = action.payload;
      state.lastAction = actionType;
      
      if (actionType === 'delete') {
        state.showDeleteModal = true;
        state.agencyToDelete = agencies;
      } else if (actionType === 'toggle_status') {
        state.showStatusModal = true;
        state.agencyToToggle = agencies;
      }
    },
    
    // Reset all state
    resetState: () => initialState
  }
});

// Export actions
export const {
  setFilters,
  resetFilters,
  toggleFilters,
  setSelectedAgencies,
  toggleAgencySelection,
  clearSelection,
  setActiveView,
  toggleSidebar,
  setFormMode,
  setEditingAgency,
  clearEditingAgency,
  showDeleteConfirmation,
  hideDeleteConfirmation,
  showStatusConfirmation,
  hideStatusConfirmation,
  setError,
  clearError,
  setAccountContext,
  clearAccountContext,
  prepareBulkAction,
  resetState
} = agenciesSlice.actions;

// Export reducer
export default agenciesSlice.reducer;

// AI-NOTE: Created agencies Redux slice for UI state management following auth.slice.js pattern. Handles filters, selections, modals, form states, and account context for multi-tenant support.