// AI-NOTE: Payment schedule Redux slice for UI state management (forms, filters, selections)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyScopeToEndpoint } from '../../utils/api.utils';

// Async thunks for payment schedule items
export const fetchPaymentScheduleItems = createAsyncThunk(
  'paymentSchedules/fetchPaymentScheduleItems',
  async (params, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items', getState());
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch payment schedule items');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentScheduleItemById = createAsyncThunk(
  'paymentSchedules/fetchPaymentScheduleItemById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}`, getState());
      
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/createPaymentScheduleItem',
  async (itemData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items', getState());
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/updatePaymentScheduleItem',
  async ({ id, updates }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}`, getState());
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/deletePaymentScheduleItem',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}`, getState());
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete payment schedule item');
      }
      
      return { id };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const approvePaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/approvePaymentScheduleItem',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}/approve`, getState());
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to approve payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const retirePaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/retirePaymentScheduleItem',
  async ({ id, reason }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}/retire`, getState());
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to retire payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const replacePaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/replacePaymentScheduleItem',
  async ({ id, replacementData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}/replace`, getState());
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(replacementData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to replace payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const completePaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/completePaymentScheduleItem',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}/complete`, getState());
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to complete payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const cancelPaymentScheduleItem = createAsyncThunk(
  'paymentSchedules/cancelPaymentScheduleItem',
  async ({ id, reason }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint(`/payment-schedule-items/${id}/cancel`, getState());
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to cancel payment schedule item');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOverduePaymentScheduleItems = createAsyncThunk(
  'paymentSchedules/fetchOverduePaymentScheduleItems',
  async (params, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items/overdue', getState());
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch overdue payment schedule items');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUpcomingPaymentScheduleItems = createAsyncThunk(
  'paymentSchedules/fetchUpcomingPaymentScheduleItems',
  async (params, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items/upcoming', getState());
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch upcoming payment schedule items');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateBillingTransactions = createAsyncThunk(
  'paymentSchedules/generateBillingTransactions',
  async (transactionData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items/generate-transactions', getState());
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to generate billing transactions');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const generateRecurringPaymentScheduleItems = createAsyncThunk(
  'paymentSchedules/generateRecurringPaymentScheduleItems',
  async (recurringData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items/generate-recurring', getState());
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(recurringData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to generate recurring payment schedule items');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPaymentScheduleItemStats = createAsyncThunk(
  'paymentSchedules/fetchPaymentScheduleItemStats',
  async (params, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = applyScopeToEndpoint('/payment-schedule-items/stats', getState());
      const queryParams = new URLSearchParams(params).toString();
      const url = queryParams ? `${endpoint}?${queryParams}` : endpoint;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch payment schedule item statistics');
      }
      
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  // API Data
  paymentScheduleItems: [],
  currentPaymentScheduleItem: null,
  overdueItems: [],
  upcomingItems: [],
  paymentScheduleItemStats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    sortBy: 'scheduledDueDate',
    sortOrder: 'asc'
  },
  
  // Loading states
  loading: {
    fetch: false,
    fetchById: false,
    create: false,
    update: false,
    delete: false,
    approve: false,
    retire: false,
    replace: false,
    complete: false,
    cancel: false,
    fetchOverdue: false,
    fetchUpcoming: false,
    generateTransactions: false,
    generateRecurring: false,
    fetchStats: false,
  },
  
  // Error state
  error: null,
  
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
  extraReducers: (builder) => {
    builder
      // fetchPaymentScheduleItems
      .addCase(fetchPaymentScheduleItems.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchPaymentScheduleItems.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.paymentScheduleItems = action.payload.data || [];
        state.pagination = {
          ...state.pagination,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchPaymentScheduleItems.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload || 'Failed to fetch payment schedule items';
      })
      
      // fetchPaymentScheduleItemById
      .addCase(fetchPaymentScheduleItemById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(fetchPaymentScheduleItemById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentPaymentScheduleItem = action.payload;
      })
      .addCase(fetchPaymentScheduleItemById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload || 'Failed to fetch payment schedule item';
      })
      
      // createPaymentScheduleItem
      .addCase(createPaymentScheduleItem.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createPaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.create = false;
        state.paymentScheduleItems.unshift(action.payload);
        state.isFormOpen = false;
        state.selectedPaymentSchedule = null;
      })
      .addCase(createPaymentScheduleItem.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload || 'Failed to create payment schedule item';
      })
      
      // updatePaymentScheduleItem
      .addCase(updatePaymentScheduleItem.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updatePaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.paymentScheduleItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.paymentScheduleItems[index] = action.payload;
        }
        if (state.currentPaymentScheduleItem?._id === action.payload._id) {
          state.currentPaymentScheduleItem = action.payload;
        }
        state.isFormOpen = false;
        state.selectedPaymentSchedule = null;
      })
      .addCase(updatePaymentScheduleItem.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload || 'Failed to update payment schedule item';
      })
      
      // deletePaymentScheduleItem
      .addCase(deletePaymentScheduleItem.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deletePaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.paymentScheduleItems = state.paymentScheduleItems.filter(item => item._id !== action.payload.id);
        if (state.currentPaymentScheduleItem?._id === action.payload.id) {
          state.currentPaymentScheduleItem = null;
        }
        state.selectedPaymentSchedule = null;
      })
      .addCase(deletePaymentScheduleItem.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload || 'Failed to delete payment schedule item';
      })
      
      // approvePaymentScheduleItem
      .addCase(approvePaymentScheduleItem.pending, (state) => {
        state.loading.approve = true;
        state.error = null;
      })
      .addCase(approvePaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.approve = false;
        const index = state.paymentScheduleItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.paymentScheduleItems[index] = action.payload;
        }
        if (state.currentPaymentScheduleItem?._id === action.payload._id) {
          state.currentPaymentScheduleItem = action.payload;
        }
      })
      .addCase(approvePaymentScheduleItem.rejected, (state, action) => {
        state.loading.approve = false;
        state.error = action.payload || 'Failed to approve payment schedule item';
      })
      
      // retirePaymentScheduleItem
      .addCase(retirePaymentScheduleItem.pending, (state) => {
        state.loading.retire = true;
        state.error = null;
      })
      .addCase(retirePaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.retire = false;
        const index = state.paymentScheduleItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.paymentScheduleItems[index] = action.payload;
        }
        if (state.currentPaymentScheduleItem?._id === action.payload._id) {
          state.currentPaymentScheduleItem = action.payload;
        }
      })
      .addCase(retirePaymentScheduleItem.rejected, (state, action) => {
        state.loading.retire = false;
        state.error = action.payload || 'Failed to retire payment schedule item';
      })
      
      // replacePaymentScheduleItem
      .addCase(replacePaymentScheduleItem.pending, (state) => {
        state.loading.replace = true;
        state.error = null;
      })
      .addCase(replacePaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.replace = false;
        // Update original item
        const originalIndex = state.paymentScheduleItems.findIndex(item => item._id === action.payload.originalItem._id);
        if (originalIndex !== -1) {
          state.paymentScheduleItems[originalIndex] = action.payload.originalItem;
        }
        // Add new item
        state.paymentScheduleItems.unshift(action.payload.newItem);
      })
      .addCase(replacePaymentScheduleItem.rejected, (state, action) => {
        state.loading.replace = false;
        state.error = action.payload || 'Failed to replace payment schedule item';
      })
      
      // completePaymentScheduleItem
      .addCase(completePaymentScheduleItem.pending, (state) => {
        state.loading.complete = true;
        state.error = null;
      })
      .addCase(completePaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.complete = false;
        const index = state.paymentScheduleItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.paymentScheduleItems[index] = action.payload;
        }
        if (state.currentPaymentScheduleItem?._id === action.payload._id) {
          state.currentPaymentScheduleItem = action.payload;
        }
      })
      .addCase(completePaymentScheduleItem.rejected, (state, action) => {
        state.loading.complete = false;
        state.error = action.payload || 'Failed to complete payment schedule item';
      })
      
      // cancelPaymentScheduleItem
      .addCase(cancelPaymentScheduleItem.pending, (state) => {
        state.loading.cancel = true;
        state.error = null;
      })
      .addCase(cancelPaymentScheduleItem.fulfilled, (state, action) => {
        state.loading.cancel = false;
        const index = state.paymentScheduleItems.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.paymentScheduleItems[index] = action.payload;
        }
        if (state.currentPaymentScheduleItem?._id === action.payload._id) {
          state.currentPaymentScheduleItem = action.payload;
        }
      })
      .addCase(cancelPaymentScheduleItem.rejected, (state, action) => {
        state.loading.cancel = false;
        state.error = action.payload || 'Failed to cancel payment schedule item';
      })
      
      // fetchOverduePaymentScheduleItems
      .addCase(fetchOverduePaymentScheduleItems.pending, (state) => {
        state.loading.fetchOverdue = true;
        state.error = null;
      })
      .addCase(fetchOverduePaymentScheduleItems.fulfilled, (state, action) => {
        state.loading.fetchOverdue = false;
        state.overdueItems = action.payload.overdueItems || [];
      })
      .addCase(fetchOverduePaymentScheduleItems.rejected, (state, action) => {
        state.loading.fetchOverdue = false;
        state.error = action.payload || 'Failed to fetch overdue payment schedule items';
      })
      
      // fetchUpcomingPaymentScheduleItems
      .addCase(fetchUpcomingPaymentScheduleItems.pending, (state) => {
        state.loading.fetchUpcoming = true;
        state.error = null;
      })
      .addCase(fetchUpcomingPaymentScheduleItems.fulfilled, (state, action) => {
        state.loading.fetchUpcoming = false;
        state.upcomingItems = action.payload.upcomingItems || [];
      })
      .addCase(fetchUpcomingPaymentScheduleItems.rejected, (state, action) => {
        state.loading.fetchUpcoming = false;
        state.error = action.payload || 'Failed to fetch upcoming payment schedule items';
      })
      
      // generateBillingTransactions
      .addCase(generateBillingTransactions.pending, (state) => {
        state.loading.generateTransactions = true;
        state.error = null;
      })
      .addCase(generateBillingTransactions.fulfilled, (state, action) => {
        state.loading.generateTransactions = false;
        // Optionally update related items or show success message
      })
      .addCase(generateBillingTransactions.rejected, (state, action) => {
        state.loading.generateTransactions = false;
        state.error = action.payload || 'Failed to generate billing transactions';
      })
      
      // generateRecurringPaymentScheduleItems
      .addCase(generateRecurringPaymentScheduleItems.pending, (state) => {
        state.loading.generateRecurring = true;
        state.error = null;
      })
      .addCase(generateRecurringPaymentScheduleItems.fulfilled, (state, action) => {
        state.loading.generateRecurring = false;
        // Add generated items to the list
        if (action.payload.generatedItems) {
          state.paymentScheduleItems.unshift(...action.payload.generatedItems);
        }
      })
      .addCase(generateRecurringPaymentScheduleItems.rejected, (state, action) => {
        state.loading.generateRecurring = false;
        state.error = action.payload || 'Failed to generate recurring payment schedule items';
      })
      
      // fetchPaymentScheduleItemStats
      .addCase(fetchPaymentScheduleItemStats.pending, (state) => {
        state.loading.fetchStats = true;
        state.error = null;
      })
      .addCase(fetchPaymentScheduleItemStats.fulfilled, (state, action) => {
        state.loading.fetchStats = false;
        state.paymentScheduleItemStats = action.payload;
      })
      .addCase(fetchPaymentScheduleItemStats.rejected, (state, action) => {
        state.loading.fetchStats = false;
        state.error = action.payload || 'Failed to fetch payment schedule item statistics';
      });
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

// API Data Selectors
export const selectPaymentScheduleItems = (state) => state.paymentSchedules.paymentScheduleItems;
export const selectCurrentPaymentScheduleItem = (state) => state.paymentSchedules.currentPaymentScheduleItem;
export const selectOverdueItems = (state) => state.paymentSchedules.overdueItems;
export const selectUpcomingItems = (state) => state.paymentSchedules.upcomingItems;
export const selectPaymentScheduleItemStats = (state) => state.paymentSchedules.paymentScheduleItemStats;
export const selectPagination = (state) => state.paymentSchedules.pagination;
export const selectError = (state) => state.paymentSchedules.error;

// Loading State Selectors
export const selectIsLoading = (state) => state.paymentSchedules.loading.fetch;
export const selectIsLoadingById = (state) => state.paymentSchedules.loading.fetchById;
export const selectIsCreating = (state) => state.paymentSchedules.loading.create;
export const selectIsUpdating = (state) => state.paymentSchedules.loading.update;
export const selectIsDeleting = (state) => state.paymentSchedules.loading.delete;
export const selectIsApproving = (state) => state.paymentSchedules.loading.approve;
export const selectIsRetiring = (state) => state.paymentSchedules.loading.retire;
export const selectIsReplacing = (state) => state.paymentSchedules.loading.replace;
export const selectIsCompleting = (state) => state.paymentSchedules.loading.complete;
export const selectIsCanceling = (state) => state.paymentSchedules.loading.cancel;
export const selectIsLoadingOverdue = (state) => state.paymentSchedules.loading.fetchOverdue;
export const selectIsLoadingUpcoming = (state) => state.paymentSchedules.loading.fetchUpcoming;
export const selectIsGeneratingTransactions = (state) => state.paymentSchedules.loading.generateTransactions;
export const selectIsGeneratingRecurring = (state) => state.paymentSchedules.loading.generateRecurring;
export const selectIsLoadingStats = (state) => state.paymentSchedules.loading.fetchStats;

// UI State Selectors
export const selectActiveView = (state) => state.paymentSchedules.activeView;
export const selectFormMode = (state) => state.paymentSchedules.formMode;
export const selectSelectedPaymentSchedule = (state) => state.paymentSchedules.selectedPaymentSchedule;
export const selectIsFormOpen = (state) => state.paymentSchedules.isFormOpen;
export const selectFilters = (state) => state.paymentSchedules.filters;
export const selectSelectedItems = (state) => state.paymentSchedules.selectedItems;
export const selectBulkActionMode = (state) => state.paymentSchedules.bulkActionMode;
export const selectShowFilters = (state) => state.paymentSchedules.showFilters;
export const selectShowStats = (state) => state.paymentSchedules.showStats;

// Export async thunks
export {
  fetchPaymentScheduleItems,
  fetchPaymentScheduleItemById,
  createPaymentScheduleItem,
  updatePaymentScheduleItem,
  deletePaymentScheduleItem,
  approvePaymentScheduleItem,
  retirePaymentScheduleItem,
  replacePaymentScheduleItem,
  completePaymentScheduleItem,
  cancelPaymentScheduleItem,
  fetchOverduePaymentScheduleItems,
  fetchUpcomingPaymentScheduleItems,
  generateBillingTransactions,
  generateRecurringPaymentScheduleItems,
  fetchPaymentScheduleItemStats,
};

export default paymentSchedulesSlice.reducer;