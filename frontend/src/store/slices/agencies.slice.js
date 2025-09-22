import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyScopeToEndpoint } from '../../utils/apiHelpers';

// Async thunks for agencies API calls

// Fetch agencies with filtering and pagination
export const fetchAgencies = createAsyncThunk(
  'agencies/fetchAgencies',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add all filter parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
      
      const url = applyScopeToEndpoint(`/api/agencies?${queryParams.toString()}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch agencies');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Fetch single agency by ID
export const fetchAgencyById = createAsyncThunk(
  'agencies/fetchAgencyById',
  async (agencyId, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint(`/api/agencies/${agencyId}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch agency');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Create new agency
export const createAgency = createAsyncThunk(
  'agencies/createAgency',
  async (agencyData, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint('/api/agencies');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(agencyData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create agency');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Update agency
export const updateAgency = createAsyncThunk(
  'agencies/updateAgency',
  async ({ agencyId, agencyData }, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint(`/api/agencies/${agencyId}`);
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(agencyData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update agency');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Delete agency
export const deleteAgency = createAsyncThunk(
  'agencies/deleteAgency',
  async (agencyId, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint(`/api/agencies/${agencyId}`);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete agency');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Toggle agency status
export const toggleAgencyStatus = createAsyncThunk(
  'agencies/toggleAgencyStatus',
  async (agencyId, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint(`/api/agencies/${agencyId}/toggle-status`);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to toggle agency status');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Update agency performance
export const updateAgencyPerformance = createAsyncThunk(
  'agencies/updateAgencyPerformance',
  async ({ agencyId, performanceData }, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint(`/api/agencies/${agencyId}/performance`);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(performanceData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update agency performance');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Get agency statistics
export const fetchAgencyStats = createAsyncThunk(
  'agencies/fetchAgencyStats',
  async (agencyId, { rejectWithValue }) => {
    try {
      const url = applyScopeToEndpoint(`/api/agencies/${agencyId}/stats`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch agency statistics');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error occurred');
    }
  }
);

// Initial state for agencies UI management
const initialState = {
  // API data
  agencies: [],
  currentAgency: null,
  agencyStats: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Loading states
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
    toggleStatus: false,
    updatePerformance: false,
    fetchStats: false
  },
  
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch agencies
      .addCase(fetchAgencies.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchAgencies.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.agencies = action.payload.data.agencies;
        state.pagination = action.payload.data.pagination;
        state.error = null;
      })
      .addCase(fetchAgencies.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload;
      })
      
      // Fetch agency by ID
      .addCase(fetchAgencyById.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchAgencyById.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.currentAgency = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAgencyById.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload;
      })
      
      // Create agency
      .addCase(createAgency.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createAgency.fulfilled, (state, action) => {
        state.loading.create = false;
        state.agencies.unshift(action.payload.data);
        state.formMode = 'create';
        state.editingAgency = null;
        state.error = null;
      })
      .addCase(createAgency.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      })
      
      // Update agency
      .addCase(updateAgency.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateAgency.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.agencies.findIndex(agency => agency._id === action.payload.data._id);
        if (index !== -1) {
          state.agencies[index] = action.payload.data;
        }
        if (state.currentAgency && state.currentAgency._id === action.payload.data._id) {
          state.currentAgency = action.payload.data;
        }
        state.formMode = 'create';
        state.editingAgency = null;
        state.error = null;
      })
      .addCase(updateAgency.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      })
      
      // Delete agency
      .addCase(deleteAgency.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteAgency.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.agencies = state.agencies.filter(agency => agency._id !== action.meta.arg);
        state.selectedAgencies = state.selectedAgencies.filter(id => id !== action.meta.arg);
        state.showDeleteModal = false;
        state.agencyToDelete = null;
        state.error = null;
      })
      .addCase(deleteAgency.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload;
      })
      
      // Toggle agency status
      .addCase(toggleAgencyStatus.pending, (state) => {
        state.loading.toggleStatus = true;
        state.error = null;
      })
      .addCase(toggleAgencyStatus.fulfilled, (state, action) => {
        state.loading.toggleStatus = false;
        const index = state.agencies.findIndex(agency => agency._id === action.payload.data._id);
        if (index !== -1) {
          state.agencies[index] = action.payload.data;
        }
        if (state.currentAgency && state.currentAgency._id === action.payload.data._id) {
          state.currentAgency = action.payload.data;
        }
        state.showStatusModal = false;
        state.agencyToToggle = null;
        state.error = null;
      })
      .addCase(toggleAgencyStatus.rejected, (state, action) => {
        state.loading.toggleStatus = false;
        state.error = action.payload;
      })
      
      // Update agency performance
      .addCase(updateAgencyPerformance.pending, (state) => {
        state.loading.updatePerformance = true;
        state.error = null;
      })
      .addCase(updateAgencyPerformance.fulfilled, (state, action) => {
        state.loading.updatePerformance = false;
        const index = state.agencies.findIndex(agency => agency._id === action.payload.data._id);
        if (index !== -1) {
          state.agencies[index] = action.payload.data;
        }
        if (state.currentAgency && state.currentAgency._id === action.payload.data._id) {
          state.currentAgency = action.payload.data;
        }
        state.error = null;
      })
      .addCase(updateAgencyPerformance.rejected, (state, action) => {
        state.loading.updatePerformance = false;
        state.error = action.payload;
      })
      
      // Fetch agency stats
      .addCase(fetchAgencyStats.pending, (state) => {
        state.loading.fetchStats = true;
        state.error = null;
      })
      .addCase(fetchAgencyStats.fulfilled, (state, action) => {
        state.loading.fetchStats = false;
        state.agencyStats = action.payload.data.stats;
        state.error = null;
      })
      .addCase(fetchAgencyStats.rejected, (state, action) => {
        state.loading.fetchStats = false;
        state.error = action.payload;
      });
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