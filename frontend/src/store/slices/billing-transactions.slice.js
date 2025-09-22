import { createSlice } from '@reduxjs/toolkit';

// AI-NOTE: Billing transactions slice for local state management including view states, filters, and UI state
// Manages form states, modal visibility, and transaction-specific UI interactions

const initialState = {
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
});

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

export default billingTransactionsSlice.reducer;