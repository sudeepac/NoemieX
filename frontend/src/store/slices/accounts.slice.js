import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { applyScopeToEndpoint } from '../../shared/utils/apiHelpers';

// Async thunks for account operations
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.search && { search: params.search }),
        ...(params.isActive !== undefined && { isActive: params.isActive }),
        ...(params.sortBy && { sortBy: params.sortBy }),
        ...(params.sortOrder && { sortOrder: params.sortOrder })
      });

      const endpoint = applyScopeToEndpoint(`/api/accounts?${queryParams}`);
      const response = await axios.get(endpoint);
      
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch accounts'
      );
    }
  }
);

export const fetchAccountById = createAsyncThunk(
  'accounts/fetchAccountById',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/accounts/${accountId}`);
      return response.data.data.account;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch account'
      );
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/accounts', accountData);
      return response.data.data.account;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create account'
      );
    }
  }
);

export const updateAccount = createAsyncThunk(
  'accounts/updateAccount',
  async ({ accountId, ...updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/accounts/${accountId}`, updateData);
      return response.data.data.account;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update account'
      );
    }
  }
);

export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (accountId, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/accounts/${accountId}`);
      return accountId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete account'
      );
    }
  }
);

export const toggleAccountStatus = createAsyncThunk(
  'accounts/toggleAccountStatus',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/accounts/${accountId}/toggle-status`);
      return response.data.data.account;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle account status'
      );
    }
  }
);

export const updateAccountBilling = createAsyncThunk(
  'accounts/updateAccountBilling',
  async ({ accountId, ...billingData }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`/api/accounts/${accountId}/billing`, billingData);
      return response.data.data.account;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update account billing'
      );
    }
  }
);

export const fetchAccountStats = createAsyncThunk(
  'accounts/fetchAccountStats',
  async (accountId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/accounts/${accountId}/stats`);
      return { accountId, stats: response.data.data.stats };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch account statistics'
      );
    }
  }
);

// Initial state for accounts UI management
const initialState = {
  // Data state
  accounts: [],
  currentAccount: null,
  accountStats: {},
  
  // List view state
  filters: {
    page: 1,
    limit: 10,
    search: '',
    isActive: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10,
    totalPages: 0,
    totalItems: 0
  },
  selectedAccounts: [],
  showFilters: false,
  
  // Form state
  formMode: 'create', // 'create' | 'edit'
  editingAccount: null,
  
  // UI state
  activeView: 'list', // 'list' | 'detail' | 'form' | 'stats'
  sidebarCollapsed: false,
  
  // Modal states
  showDeleteModal: false,
  showStatusModal: false,
  showBillingModal: false,
  accountToDelete: null,
  accountToToggle: null,
  accountToUpdateBilling: null,
  
  // Loading states
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statusLoading: false,
  billingLoading: false,
  statsLoading: false,
  
  // Error handling
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  statusError: null,
  billingError: null,
  statsError: null,
  lastAction: null
};

/**
 * Accounts slice for managing UI state and interactions
 * Handles filters, selections, modals, form states, and async operations
 */
const accountsSlice = createSlice({
  name: 'accounts',
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
    
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 10,
        search: '',
        isActive: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },
    
    toggleFilters: (state) => {
      state.showFilters = !state.showFilters;
    },
    
    // Selection management
    selectAccount: (state, action) => {
      const accountId = action.payload;
      if (state.selectedAccounts.includes(accountId)) {
        state.selectedAccounts = state.selectedAccounts.filter(id => id !== accountId);
      } else {
        state.selectedAccounts.push(accountId);
      }
    },
    
    selectAllAccounts: (state) => {
      state.selectedAccounts = state.accounts.map(account => account._id);
    },
    
    clearSelection: (state) => {
      state.selectedAccounts = [];
    },
    
    // View management
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    
    // Form management
    setFormMode: (state, action) => {
      state.formMode = action.payload;
    },
    
    setEditingAccount: (state, action) => {
      state.editingAccount = action.payload;
      state.formMode = action.payload ? 'edit' : 'create';
    },
    
    clearEditingAccount: (state) => {
      state.editingAccount = null;
      state.formMode = 'create';
    },
    
    // Modal management
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.accountToDelete = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.accountToDelete = null;
    },
    
    showStatusModal: (state, action) => {
      state.showStatusModal = true;
      state.accountToToggle = action.payload;
    },
    
    hideStatusModal: (state) => {
      state.showStatusModal = false;
      state.accountToToggle = null;
    },
    
    showBillingModal: (state, action) => {
      state.showBillingModal = true;
      state.accountToUpdateBilling = action.payload;
    },
    
    hideBillingModal: (state) => {
      state.showBillingModal = false;
      state.accountToUpdateBilling = null;
    },
    
    // Error management
    clearError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.statusError = null;
      state.billingError = null;
      state.statsError = null;
    },
    
    clearAllErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.statusError = null;
      state.billingError = null;
      state.statsError = null;
    },
    
    // Set current account
    setCurrentAccount: (state, action) => {
      state.currentAccount = action.payload;
    },
    
    clearCurrentAccount: (state) => {
      state.currentAccount = null;
    }
  },
  
  extraReducers: (builder) => {
    // Fetch accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = 'fetchAccounts';
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.accounts = action.payload.accounts || action.payload;
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Fetch account by ID
    builder
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.lastAction = 'fetchAccountById';
      })
      .addCase(fetchAccountById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAccount = action.payload;
        state.error = null;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    
    // Create account
    builder
      .addCase(createAccount.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.lastAction = 'createAccount';
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.createLoading = false;
        state.accounts.unshift(action.payload);
        state.createError = null;
        state.formMode = 'create';
        state.editingAccount = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
    
    // Update account
    builder
      .addCase(updateAccount.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.lastAction = 'updateAccount';
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.accounts.findIndex(account => account._id === action.payload._id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.currentAccount && state.currentAccount._id === action.payload._id) {
          state.currentAccount = action.payload;
        }
        state.updateError = null;
        state.formMode = 'create';
        state.editingAccount = null;
      })
      .addCase(updateAccount.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
    
    // Delete account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.lastAction = 'deleteAccount';
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.accounts = state.accounts.filter(account => account._id !== action.payload);
        state.selectedAccounts = state.selectedAccounts.filter(id => id !== action.payload);
        state.deleteError = null;
        state.showDeleteModal = false;
        state.accountToDelete = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });
    
    // Toggle account status
    builder
      .addCase(toggleAccountStatus.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
        state.lastAction = 'toggleAccountStatus';
      })
      .addCase(toggleAccountStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        const index = state.accounts.findIndex(account => account._id === action.payload._id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.currentAccount && state.currentAccount._id === action.payload._id) {
          state.currentAccount = action.payload;
        }
        state.statusError = null;
        state.showStatusModal = false;
        state.accountToToggle = null;
      })
      .addCase(toggleAccountStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.payload;
      });
    
    // Update account billing
    builder
      .addCase(updateAccountBilling.pending, (state) => {
        state.billingLoading = true;
        state.billingError = null;
        state.lastAction = 'updateAccountBilling';
      })
      .addCase(updateAccountBilling.fulfilled, (state, action) => {
        state.billingLoading = false;
        const index = state.accounts.findIndex(account => account._id === action.payload._id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
        if (state.currentAccount && state.currentAccount._id === action.payload._id) {
          state.currentAccount = action.payload;
        }
        state.billingError = null;
        state.showBillingModal = false;
        state.accountToUpdateBilling = null;
      })
      .addCase(updateAccountBilling.rejected, (state, action) => {
        state.billingLoading = false;
        state.billingError = action.payload;
      });
    
    // Fetch account stats
    builder
      .addCase(fetchAccountStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
        state.lastAction = 'fetchAccountStats';
      })
      .addCase(fetchAccountStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.accountStats[action.payload.accountId] = action.payload.stats;
        state.statsError = null;
      })
      .addCase(fetchAccountStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      });
  }
});

// Export actions
export const {
  setFilters,
  clearFilters,
  toggleFilters,
  selectAccount,
  selectAllAccounts,
  clearSelection,
  setActiveView,
  toggleSidebar,
  setFormMode,
  setEditingAccount,
  clearEditingAccount,
  showDeleteModal,
  hideDeleteModal,
  showStatusModal,
  hideStatusModal,
  showBillingModal,
  hideBillingModal,
  clearError,
  clearAllErrors,
  setCurrentAccount,
  clearCurrentAccount
} = accountsSlice.actions;

// Selectors
export const selectAccounts = (state) => state.accounts.accounts;
export const selectCurrentAccount = (state) => state.accounts.currentAccount;
export const selectAccountStats = (state) => state.accounts.accountStats;
export const selectAccountsFilters = (state) => state.accounts.filters;
export const selectAccountsPagination = (state) => state.accounts.pagination;
export const selectSelectedAccounts = (state) => state.accounts.selectedAccounts;
export const selectAccountsLoading = (state) => state.accounts.loading;
export const selectAccountsError = (state) => state.accounts.error;
export const selectFormMode = (state) => state.accounts.formMode;
export const selectEditingAccount = (state) => state.accounts.editingAccount;
export const selectActiveView = (state) => state.accounts.activeView;

// Export reducer
export default accountsSlice.reducer;