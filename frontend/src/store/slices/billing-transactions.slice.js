import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyScopeToEndpoint } from '../../utils/api.utils';

// AI-NOTE: Billing transactions slice for local state management including view states, filters, and UI state
// Manages form states, modal visibility, and transaction-specific UI interactions

// Async thunks for billing transactions API calls
export const fetchBillingTransactions = createAsyncThunk(
  'billingTransactions/fetchBillingTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('GET', '/api/billing-transactions', null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing transactions');
    }
  }
);

export const fetchBillingTransactionById = createAsyncThunk(
  'billingTransactions/fetchBillingTransactionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('GET', `/api/billing-transactions/${id}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing transaction');
    }
  }
);

export const createBillingTransaction = createAsyncThunk(
  'billingTransactions/createBillingTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('POST', '/api/billing-transactions', transactionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create billing transaction');
    }
  }
);

export const updateBillingTransaction = createAsyncThunk(
  'billingTransactions/updateBillingTransaction',
  async ({ id, transactionData }, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PUT', `/api/billing-transactions/${id}`, transactionData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update billing transaction');
    }
  }
);

export const updateBillingTransactionStatus = createAsyncThunk(
  'billingTransactions/updateBillingTransactionStatus',
  async ({ id, status, statusReason }, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PATCH', `/api/billing-transactions/${id}/status`, 
        { status, statusReason }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update transaction status');
    }
  }
);

export const claimBillingTransaction = createAsyncThunk(
  'billingTransactions/claimBillingTransaction',
  async (id, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PATCH', `/api/billing-transactions/${id}/claim`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to claim billing transaction');
    }
  }
);

export const disputeBillingTransaction = createAsyncThunk(
  'billingTransactions/disputeBillingTransaction',
  async ({ id, disputeReason, disputeDate }, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PATCH', `/api/billing-transactions/${id}/dispute`, 
        { disputeReason, disputeDate }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to dispute billing transaction');
    }
  }
);

export const resolveDisputeBillingTransaction = createAsyncThunk(
  'billingTransactions/resolveDisputeBillingTransaction',
  async ({ id, resolutionReason, resolutionNotes }, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PATCH', `/api/billing-transactions/${id}/resolve-dispute`, 
        { resolutionReason, resolutionNotes }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve dispute');
    }
  }
);

export const fetchDisputedTransactions = createAsyncThunk(
  'billingTransactions/fetchDisputedTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('GET', '/api/billing-transactions/disputed', null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch disputed transactions');
    }
  }
);

export const approveBillingTransaction = createAsyncThunk(
  'billingTransactions/approveBillingTransaction',
  async ({ id, approvalNotes }, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PATCH', `/api/billing-transactions/${id}/approve`, 
        { approvalNotes }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve billing transaction');
    }
  }
);

export const reconcileBillingTransaction = createAsyncThunk(
  'billingTransactions/reconcileBillingTransaction',
  async ({ id, bankStatementRef }, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('PATCH', `/api/billing-transactions/${id}/reconcile`, 
        { bankStatementRef }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reconcile billing transaction');
    }
  }
);

export const fetchOverdueTransactions = createAsyncThunk(
  'billingTransactions/fetchOverdueTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('GET', '/api/billing-transactions/overdue', null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue transactions');
    }
  }
);

export const fetchRevenueSummary = createAsyncThunk(
  'billingTransactions/fetchRevenueSummary',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('GET', '/api/billing-transactions/revenue-summary', null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch revenue summary');
    }
  }
);

export const fetchBillingTransactionStats = createAsyncThunk(
  'billingTransactions/fetchBillingTransactionStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await applyScopeToEndpoint('GET', '/api/billing-transactions/stats', null, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transaction statistics');
    }
  }
);

const initialState = {
  // API data
  transactions: [],
  currentTransaction: null,
  disputedTransactions: [],
  overdueTransactions: [],
  revenueSummary: null,
  transactionStats: null,

  // Loading states
  loading: {
    fetch: false,
    fetchById: false,
    create: false,
    update: false,
    updateStatus: false,
    claim: false,
    dispute: false,
    resolveDispute: false,
    fetchDisputed: false,
    approve: false,
    reconcile: false,
    fetchOverdue: false,
    fetchRevenue: false,
    fetchStats: false,
  },

  // Error state
  error: null,

  // View management
  currentView: 'list', // 'list', 'detail', 'create', 'edit'
  selectedTransactionId: null,
  editingTransaction: null,
  
  // Modal and UI states
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDetailModalOpen: false,
  isStatusUpdateModalOpen: false,
  isDisputeModalOpen: false,
  isApprovalModalOpen: false,
  isReconcileModalOpen: false,
  
  // Filter and search states
  filters: {
    search: '',
    status: '',
    transactionType: '',
    debtorType: '',
    paymentMethod: '',
    isOverdue: false,
    agencyId: '',
    paymentScheduleItemId: '',
    startDate: '',
    endDate: '',
  },
  
  // Pagination and sorting
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  sorting: {
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  
  // Bulk operations
  selectedTransactions: [],
  bulkActionType: null, // 'claim', 'approve', 'status-update', etc.
  
  // Form states
  formData: {
    accountId: '',
    agencyId: '',
    paymentScheduleItemId: '',
    debtorType: 'student',
    debtorId: '',
    signedAmount: {
      value: 0,
      currency: 'USD',
    },
    originalAmount: {
      value: 0,
      currency: 'USD',
    },
    exchangeRate: {
      rate: 1,
      fromCurrency: 'USD',
      toCurrency: 'USD',
      rateDate: new Date().toISOString().split('T')[0],
    },
    transactionType: 'invoice',
    dueDate: '',
    paymentMethod: '',
    references: {
      invoiceRef: '',
      creditNoteRef: '',
      receiptRef: '',
      externalRef: '',
    },
    bonusRuleId: '',
    fees: {
      processingFee: {
        value: 0,
        currency: 'USD',
      },
      lateFee: {
        value: 0,
        currency: 'USD',
      },
      conversionFee: {
        value: 0,
        currency: 'USD',
      },
    },
    notes: '',
    metadata: {
      source: 'manual',
      tags: [],
      internalNotes: '',
    },
  },
  
  // Status update form
  statusUpdateForm: {
    status: '',
    paidDate: '',
    paymentMethod: '',
    reason: '',
  },
  
  // Dispute form
  disputeForm: {
    disputeReason: '',
    disputeDate: new Date().toISOString().split('T')[0],
  },
  
  // Approval form
  approvalForm: {
    level: 'manager',
    comments: '',
  },
  
  // Reconciliation form
  reconcileForm: {
    bankStatementRef: '',
  },
};

const billingTransactionsSlice = createSlice({
  name: 'billingTransactions',
  initialState,
  reducers: {
    // View management
    setCurrentView: (state, action) => {
      state.currentView = action.payload;
    },
    
    setSelectedTransactionId: (state, action) => {
      state.selectedTransactionId = action.payload;
    },
    
    setEditingTransaction: (state, action) => {
      state.editingTransaction = action.payload;
      if (action.payload) {
        // Pre-populate form data when editing
        state.formData = {
          ...state.formData,
          ...action.payload,
        };
      }
    },
    
    // Modal management
    openCreateModal: (state) => {
      state.isCreateModalOpen = true;
      state.currentView = 'create';
    },
    
    closeCreateModal: (state) => {
      state.isCreateModalOpen = false;
      state.currentView = 'list';
      state.formData = initialState.formData;
    },
    
    openEditModal: (state, action) => {
      state.isEditModalOpen = true;
      state.currentView = 'edit';
      state.editingTransaction = action.payload;
      if (action.payload) {
        state.formData = {
          ...state.formData,
          ...action.payload,
        };
      }
    },
    
    closeEditModal: (state) => {
      state.isEditModalOpen = false;
      state.currentView = 'list';
      state.editingTransaction = null;
      state.formData = initialState.formData;
    },
    
    openDetailModal: (state, action) => {
      state.isDetailModalOpen = true;
      state.selectedTransactionId = action.payload;
    },
    
    closeDetailModal: (state) => {
      state.isDetailModalOpen = false;
      state.selectedTransactionId = null;
    },
    
    openStatusUpdateModal: (state, action) => {
      state.isStatusUpdateModalOpen = true;
      state.selectedTransactionId = action.payload;
    },
    
    closeStatusUpdateModal: (state) => {
      state.isStatusUpdateModalOpen = false;
      state.selectedTransactionId = null;
      state.statusUpdateForm = initialState.statusUpdateForm;
    },
    
    openDisputeModal: (state, action) => {
      state.isDisputeModalOpen = true;
      state.selectedTransactionId = action.payload;
    },
    
    closeDisputeModal: (state) => {
      state.isDisputeModalOpen = false;
      state.selectedTransactionId = null;
      state.disputeForm = initialState.disputeForm;
    },
    
    openApprovalModal: (state, action) => {
      state.isApprovalModalOpen = true;
      state.selectedTransactionId = action.payload;
    },
    
    closeApprovalModal: (state) => {
      state.isApprovalModalOpen = false;
      state.selectedTransactionId = null;
      state.approvalForm = initialState.approvalForm;
    },
    
    openReconcileModal: (state, action) => {
      state.isReconcileModalOpen = true;
      state.selectedTransactionId = action.payload;
    },
    
    closeReconcileModal: (state) => {
      state.isReconcileModalOpen = false;
      state.selectedTransactionId = null;
      state.reconcileForm = initialState.reconcileForm;
    },
    
    // Filter management
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset pagination when filters change
      state.pagination.page = 1;
    },
    
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.page = 1;
    },
    
    // Pagination and sorting
    updatePagination: (state, action) => {
      state.pagination = {
        ...state.pagination,
        ...action.payload,
      };
    },
    
    updateSorting: (state, action) => {
      state.sorting = {
        ...state.sorting,
        ...action.payload,
      };
      // Reset pagination when sorting changes
      state.pagination.page = 1;
    },
    
    // Bulk operations
    toggleTransactionSelection: (state, action) => {
      const transactionId = action.payload;
      const index = state.selectedTransactions.indexOf(transactionId);
      if (index > -1) {
        state.selectedTransactions.splice(index, 1);
      } else {
        state.selectedTransactions.push(transactionId);
      }
    },
    
    selectAllTransactions: (state, action) => {
      state.selectedTransactions = action.payload;
    },
    
    clearTransactionSelection: (state) => {
      state.selectedTransactions = [];
    },
    
    setBulkActionType: (state, action) => {
      state.bulkActionType = action.payload;
    },
    
    // Form data management
    updateFormData: (state, action) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
    
    resetFormData: (state) => {
      state.formData = initialState.formData;
    },
    
    updateStatusUpdateForm: (state, action) => {
      state.statusUpdateForm = {
        ...state.statusUpdateForm,
        ...action.payload,
      };
    },
    
    updateDisputeForm: (state, action) => {
      state.disputeForm = {
        ...state.disputeForm,
        ...action.payload,
      };
    },
    
    updateApprovalForm: (state, action) => {
      state.approvalForm = {
        ...state.approvalForm,
        ...action.payload,
      };
    },
    
    updateReconcileForm: (state, action) => {
      state.reconcileForm = {
        ...state.reconcileForm,
        ...action.payload,
      };
    },
    
    // Navigation helpers
    goToCreateTransaction: (state) => {
      state.currentView = 'create';
      state.isCreateModalOpen = true;
      state.formData = initialState.formData;
    },
    
    goToEditTransaction: (state, action) => {
      state.currentView = 'edit';
      state.isEditModalOpen = true;
      state.editingTransaction = action.payload;
      if (action.payload) {
        state.formData = {
          ...state.formData,
          ...action.payload,
        };
      }
    },
    
    goToTransactionDetail: (state, action) => {
      state.currentView = 'detail';
      state.selectedTransactionId = action.payload;
    },
    
    goBackToTransactionsList: (state) => {
      state.currentView = 'list';
      state.selectedTransactionId = null;
      state.editingTransaction = null;
      state.formData = initialState.formData;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchBillingTransactions
      .addCase(fetchBillingTransactions.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchBillingTransactions.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.transactions = action.payload.data || [];
        state.pagination = {
          ...state.pagination,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchBillingTransactions.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload || 'Failed to fetch billing transactions';
      })
      
      // fetchBillingTransactionById
      .addCase(fetchBillingTransactionById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(fetchBillingTransactionById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentTransaction = action.payload;
      })
      .addCase(fetchBillingTransactionById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload || 'Failed to fetch billing transaction';
      })
      
      // createBillingTransaction
      .addCase(createBillingTransaction.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createBillingTransaction.fulfilled, (state, action) => {
        state.loading.create = false;
        state.transactions.unshift(action.payload);
        state.isCreateModalOpen = false;
        state.formData = initialState.formData;
      })
      .addCase(createBillingTransaction.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload || 'Failed to create billing transaction';
      })
      
      // updateBillingTransaction
      .addCase(updateBillingTransaction.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateBillingTransaction.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
        state.isEditModalOpen = false;
        state.editingTransaction = null;
      })
      .addCase(updateBillingTransaction.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload || 'Failed to update billing transaction';
      })
      
      // updateBillingTransactionStatus
      .addCase(updateBillingTransactionStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error = null;
      })
      .addCase(updateBillingTransactionStatus.fulfilled, (state, action) => {
        state.loading.updateStatus = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
        state.isStatusUpdateModalOpen = false;
      })
      .addCase(updateBillingTransactionStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        state.error = action.payload || 'Failed to update transaction status';
      })
      
      // claimBillingTransaction
      .addCase(claimBillingTransaction.pending, (state) => {
        state.loading.claim = true;
        state.error = null;
      })
      .addCase(claimBillingTransaction.fulfilled, (state, action) => {
        state.loading.claim = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
      })
      .addCase(claimBillingTransaction.rejected, (state, action) => {
        state.loading.claim = false;
        state.error = action.payload || 'Failed to claim billing transaction';
      })
      
      // disputeBillingTransaction
      .addCase(disputeBillingTransaction.pending, (state) => {
        state.loading.dispute = true;
        state.error = null;
      })
      .addCase(disputeBillingTransaction.fulfilled, (state, action) => {
        state.loading.dispute = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
        state.isDisputeModalOpen = false;
      })
      .addCase(disputeBillingTransaction.rejected, (state, action) => {
        state.loading.dispute = false;
        state.error = action.payload || 'Failed to dispute billing transaction';
      })
      
      // resolveDisputeBillingTransaction
      .addCase(resolveDisputeBillingTransaction.pending, (state) => {
        state.loading.resolveDispute = true;
        state.error = null;
      })
      .addCase(resolveDisputeBillingTransaction.fulfilled, (state, action) => {
        state.loading.resolveDispute = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
      })
      .addCase(resolveDisputeBillingTransaction.rejected, (state, action) => {
        state.loading.resolveDispute = false;
        state.error = action.payload || 'Failed to resolve dispute';
      })
      
      // fetchDisputedTransactions
      .addCase(fetchDisputedTransactions.pending, (state) => {
        state.loading.fetchDisputed = true;
        state.error = null;
      })
      .addCase(fetchDisputedTransactions.fulfilled, (state, action) => {
        state.loading.fetchDisputed = false;
        state.disputedTransactions = action.payload.data || [];
      })
      .addCase(fetchDisputedTransactions.rejected, (state, action) => {
        state.loading.fetchDisputed = false;
        state.error = action.payload || 'Failed to fetch disputed transactions';
      })
      
      // approveBillingTransaction
      .addCase(approveBillingTransaction.pending, (state) => {
        state.loading.approve = true;
        state.error = null;
      })
      .addCase(approveBillingTransaction.fulfilled, (state, action) => {
        state.loading.approve = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
        state.isApprovalModalOpen = false;
      })
      .addCase(approveBillingTransaction.rejected, (state, action) => {
        state.loading.approve = false;
        state.error = action.payload || 'Failed to approve billing transaction';
      })
      
      // reconcileBillingTransaction
      .addCase(reconcileBillingTransaction.pending, (state) => {
        state.loading.reconcile = true;
        state.error = null;
      })
      .addCase(reconcileBillingTransaction.fulfilled, (state, action) => {
        state.loading.reconcile = false;
        const index = state.transactions.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        if (state.currentTransaction?._id === action.payload._id) {
          state.currentTransaction = action.payload;
        }
        state.isReconcileModalOpen = false;
      })
      .addCase(reconcileBillingTransaction.rejected, (state, action) => {
        state.loading.reconcile = false;
        state.error = action.payload || 'Failed to reconcile billing transaction';
      })
      
      // fetchOverdueTransactions
      .addCase(fetchOverdueTransactions.pending, (state) => {
        state.loading.fetchOverdue = true;
        state.error = null;
      })
      .addCase(fetchOverdueTransactions.fulfilled, (state, action) => {
        state.loading.fetchOverdue = false;
        state.overdueTransactions = action.payload.data || [];
      })
      .addCase(fetchOverdueTransactions.rejected, (state, action) => {
        state.loading.fetchOverdue = false;
        state.error = action.payload || 'Failed to fetch overdue transactions';
      })
      
      // fetchRevenueSummary
      .addCase(fetchRevenueSummary.pending, (state) => {
        state.loading.fetchRevenue = true;
        state.error = null;
      })
      .addCase(fetchRevenueSummary.fulfilled, (state, action) => {
        state.loading.fetchRevenue = false;
        state.revenueSummary = action.payload;
      })
      .addCase(fetchRevenueSummary.rejected, (state, action) => {
        state.loading.fetchRevenue = false;
        state.error = action.payload || 'Failed to fetch revenue summary';
      })
      
      // fetchBillingTransactionStats
      .addCase(fetchBillingTransactionStats.pending, (state) => {
        state.loading.fetchStats = true;
        state.error = null;
      })
      .addCase(fetchBillingTransactionStats.fulfilled, (state, action) => {
        state.loading.fetchStats = false;
        state.transactionStats = action.payload;
      })
      .addCase(fetchBillingTransactionStats.rejected, (state, action) => {
        state.loading.fetchStats = false;
        state.error = action.payload || 'Failed to fetch transaction statistics';
      });
  },
});

// Export async thunks
export {
  fetchBillingTransactions,
  fetchBillingTransactionById,
  createBillingTransaction,
  updateBillingTransaction,
  updateBillingTransactionStatus,
  claimBillingTransaction,
  disputeBillingTransaction,
  resolveDisputeBillingTransaction,
  fetchDisputedTransactions,
  approveBillingTransaction,
  reconcileBillingTransaction,
  fetchOverdueTransactions,
  fetchRevenueSummary,
  fetchBillingTransactionStats,
};

export const {
  // View management
  setCurrentView,
  setSelectedTransactionId,
  setEditingTransaction,
  
  // Modal management
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openDetailModal,
  closeDetailModal,
  openStatusUpdateModal,
  closeStatusUpdateModal,
  openDisputeModal,
  closeDisputeModal,
  openApprovalModal,
  closeApprovalModal,
  openReconcileModal,
  closeReconcileModal,
  
  // Filter management
  updateFilters,
  clearFilters,
  
  // Pagination and sorting
  updatePagination,
  updateSorting,
  
  // Bulk operations
  toggleTransactionSelection,
  selectAllTransactions,
  clearTransactionSelection,
  setBulkActionType,
  
  // Form data management
  updateFormData,
  resetFormData,
  updateStatusUpdateForm,
  updateDisputeForm,
  updateApprovalForm,
  updateReconcileForm,
  
  // Navigation helpers
  goToCreateTransaction,
  goToEditTransaction,
  goToTransactionDetail,
  goBackToTransactionsList,
} = billingTransactionsSlice.actions;

// Selectors
export const selectFilters = (state) => state.billingTransactions.filters;
export const selectPagination = (state) => state.billingTransactions.pagination;
export const selectSorting = (state) => state.billingTransactions.sorting;
export const selectCurrentView = (state) => state.billingTransactions.currentView;
export const selectSelectedTransactionId = (state) => state.billingTransactions.selectedTransactionId;
export const selectEditingTransaction = (state) => state.billingTransactions.editingTransaction;
export const selectSelectedTransactions = (state) => state.billingTransactions.selectedTransactions;
export const selectBulkActionType = (state) => state.billingTransactions.bulkActionType;
export const selectError = (state) => state.billingTransactions.error;

// API data selectors
export const selectTransactions = (state) => state.billingTransactions.transactions;
export const selectCurrentTransaction = (state) => state.billingTransactions.currentTransaction;
export const selectDisputedTransactions = (state) => state.billingTransactions.disputedTransactions;
export const selectOverdueTransactions = (state) => state.billingTransactions.overdueTransactions;
export const selectRevenueSummary = (state) => state.billingTransactions.revenueSummary;
export const selectTransactionStats = (state) => state.billingTransactions.transactionStats;

// Loading state selectors
export const selectFetchLoading = (state) => state.billingTransactions.loading.fetch;
export const selectFetchByIdLoading = (state) => state.billingTransactions.loading.fetchById;
export const selectCreateLoading = (state) => state.billingTransactions.loading.create;
export const selectUpdateLoading = (state) => state.billingTransactions.loading.update;
export const selectUpdateStatusLoading = (state) => state.billingTransactions.loading.updateStatus;
export const selectClaimLoading = (state) => state.billingTransactions.loading.claim;
export const selectDisputeLoading = (state) => state.billingTransactions.loading.dispute;
export const selectResolveDisputeLoading = (state) => state.billingTransactions.loading.resolveDispute;
export const selectFetchDisputedLoading = (state) => state.billingTransactions.loading.fetchDisputed;
export const selectApproveLoading = (state) => state.billingTransactions.loading.approve;
export const selectReconcileLoading = (state) => state.billingTransactions.loading.reconcile;
export const selectFetchOverdueLoading = (state) => state.billingTransactions.loading.fetchOverdue;
export const selectFetchRevenueLoading = (state) => state.billingTransactions.loading.fetchRevenue;
export const selectFetchStatsLoading = (state) => state.billingTransactions.loading.fetchStats;

export default billingTransactionsSlice.reducer;