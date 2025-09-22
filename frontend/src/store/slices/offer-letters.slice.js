import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyScopeToEndpoint } from '../../utils/api.utils';

// Async thunks for offer letters
export const fetchOfferLetters = createAsyncThunk(
  'offerLetters/fetchOfferLetters',
  async (params = {}, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint('/api/offer-letters', params), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch offer letters');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchOfferLetterById = createAsyncThunk(
  'offerLetters/fetchOfferLetterById',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint(`/api/offer-letters/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch offer letter');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const createOfferLetter = createAsyncThunk(
  'offerLetters/createOfferLetter',
  async (offerLetterData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint('/api/offer-letters'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(offerLetterData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to create offer letter');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateOfferLetter = createAsyncThunk(
  'offerLetters/updateOfferLetter',
  async ({ id, ...updateData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint(`/api/offer-letters/${id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update offer letter');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const deleteOfferLetter = createAsyncThunk(
  'offerLetters/deleteOfferLetter',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint(`/api/offer-letters/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to delete offer letter');
      }

      return { id };
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const replaceOfferLetter = createAsyncThunk(
  'offerLetters/replaceOfferLetter',
  async ({ id, reason, ...newOfferLetterData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint(`/api/offer-letters/${id}/replace`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, ...newOfferLetterData }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to replace offer letter');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const updateOfferLetterStatus = createAsyncThunk(
  'offerLetters/updateOfferLetterStatus',
  async ({ id, status }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint(`/api/offer-letters/${id}/status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to update offer letter status');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const addOfferLetterDocument = createAsyncThunk(
  'offerLetters/addOfferLetterDocument',
  async ({ id, name, url }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint(`/api/offer-letters/${id}/documents`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, url }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to add document');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

export const fetchOfferLetterStats = createAsyncThunk(
  'offerLetters/fetchOfferLetterStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(applyScopeToEndpoint('/api/offer-letters/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.message || 'Failed to fetch offer letter statistics');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// Initial state for offer letters
const initialState = {
  // API data
  offerLetters: [],
  currentOfferLetter: null,
  offerLetterStats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    sortBy: 'issueDate',
    sortOrder: 'desc',
  },
  
  // Loading states
  loading: {
    fetch: false,
    fetchById: false,
    create: false,
    update: false,
    delete: false,
    replace: false,
    updateStatus: false,
    addDocument: false,
    fetchStats: false,
  },
  error: null,
  
  // UI state
  selectedOfferLetter: null,
  isFormOpen: false,
  isDetailOpen: false,
  formMode: 'create', // 'create', 'edit', 'replace'
  
  // Filters
  filters: {
    search: '',
    status: '',
    agencyId: '',
    studentId: '',
    courseId: '',
    dateFrom: '',
    dateTo: '',
  },
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
  extraReducers: (builder) => {
    builder
      // fetchOfferLetters
      .addCase(fetchOfferLetters.pending, (state) => {
        state.loading.fetch = true;
        state.error = null;
      })
      .addCase(fetchOfferLetters.fulfilled, (state, action) => {
        state.loading.fetch = false;
        state.offerLetters = action.payload.data || [];
        state.pagination = {
          ...state.pagination,
          total: action.payload.total || 0,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchOfferLetters.rejected, (state, action) => {
        state.loading.fetch = false;
        state.error = action.payload || 'Failed to fetch offer letters';
      })
      
      // fetchOfferLetterById
      .addCase(fetchOfferLetterById.pending, (state) => {
        state.loading.fetchById = true;
        state.error = null;
      })
      .addCase(fetchOfferLetterById.fulfilled, (state, action) => {
        state.loading.fetchById = false;
        state.currentOfferLetter = action.payload;
      })
      .addCase(fetchOfferLetterById.rejected, (state, action) => {
        state.loading.fetchById = false;
        state.error = action.payload || 'Failed to fetch offer letter';
      })
      
      // createOfferLetter
      .addCase(createOfferLetter.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createOfferLetter.fulfilled, (state, action) => {
        state.loading.create = false;
        state.offerLetters.unshift(action.payload);
        state.isFormOpen = false;
        state.selectedOfferLetter = null;
      })
      .addCase(createOfferLetter.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload || 'Failed to create offer letter';
      })
      
      // updateOfferLetter
      .addCase(updateOfferLetter.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateOfferLetter.fulfilled, (state, action) => {
        state.loading.update = false;
        const index = state.offerLetters.findIndex(ol => ol._id === action.payload._id);
        if (index !== -1) {
          state.offerLetters[index] = action.payload;
        }
        if (state.currentOfferLetter?._id === action.payload._id) {
          state.currentOfferLetter = action.payload;
        }
        state.isFormOpen = false;
        state.selectedOfferLetter = null;
      })
      .addCase(updateOfferLetter.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload || 'Failed to update offer letter';
      })
      
      // deleteOfferLetter
      .addCase(deleteOfferLetter.pending, (state) => {
        state.loading.delete = true;
        state.error = null;
      })
      .addCase(deleteOfferLetter.fulfilled, (state, action) => {
        state.loading.delete = false;
        state.offerLetters = state.offerLetters.filter(ol => ol._id !== action.payload.id);
        if (state.currentOfferLetter?._id === action.payload.id) {
          state.currentOfferLetter = null;
        }
        state.selectedOfferLetter = null;
      })
      .addCase(deleteOfferLetter.rejected, (state, action) => {
        state.loading.delete = false;
        state.error = action.payload || 'Failed to delete offer letter';
      })
      
      // replaceOfferLetter
      .addCase(replaceOfferLetter.pending, (state) => {
        state.loading.replace = true;
        state.error = null;
      })
      .addCase(replaceOfferLetter.fulfilled, (state, action) => {
        state.loading.replace = false;
        // Update original offer letter
        const originalIndex = state.offerLetters.findIndex(ol => ol._id === action.payload.originalOfferLetter._id);
        if (originalIndex !== -1) {
          state.offerLetters[originalIndex] = action.payload.originalOfferLetter;
        }
        // Add new offer letter
        state.offerLetters.unshift(action.payload.newOfferLetter);
        state.isFormOpen = false;
        state.selectedOfferLetter = null;
      })
      .addCase(replaceOfferLetter.rejected, (state, action) => {
        state.loading.replace = false;
        state.error = action.payload || 'Failed to replace offer letter';
      })
      
      // updateOfferLetterStatus
      .addCase(updateOfferLetterStatus.pending, (state) => {
        state.loading.updateStatus = true;
        state.error = null;
      })
      .addCase(updateOfferLetterStatus.fulfilled, (state, action) => {
        state.loading.updateStatus = false;
        const index = state.offerLetters.findIndex(ol => ol._id === action.payload._id);
        if (index !== -1) {
          state.offerLetters[index] = action.payload;
        }
        if (state.currentOfferLetter?._id === action.payload._id) {
          state.currentOfferLetter = action.payload;
        }
      })
      .addCase(updateOfferLetterStatus.rejected, (state, action) => {
        state.loading.updateStatus = false;
        state.error = action.payload || 'Failed to update offer letter status';
      })
      
      // addOfferLetterDocument
      .addCase(addOfferLetterDocument.pending, (state) => {
        state.loading.addDocument = true;
        state.error = null;
      })
      .addCase(addOfferLetterDocument.fulfilled, (state, action) => {
        state.loading.addDocument = false;
        const index = state.offerLetters.findIndex(ol => ol._id === action.payload._id);
        if (index !== -1) {
          state.offerLetters[index] = action.payload;
        }
        if (state.currentOfferLetter?._id === action.payload._id) {
          state.currentOfferLetter = action.payload;
        }
      })
      .addCase(addOfferLetterDocument.rejected, (state, action) => {
        state.loading.addDocument = false;
        state.error = action.payload || 'Failed to add document';
      })
      
      // fetchOfferLetterStats
      .addCase(fetchOfferLetterStats.pending, (state) => {
        state.loading.fetchStats = true;
        state.error = null;
      })
      .addCase(fetchOfferLetterStats.fulfilled, (state, action) => {
        state.loading.fetchStats = false;
        state.offerLetterStats = action.payload;
      })
      .addCase(fetchOfferLetterStats.rejected, (state, action) => {
        state.loading.fetchStats = false;
        state.error = action.payload || 'Failed to fetch offer letter statistics';
      });
  },
});

// Export async thunks
export {
  fetchOfferLetters,
  fetchOfferLetterById,
  createOfferLetter,
  updateOfferLetter,
  deleteOfferLetter,
  replaceOfferLetter,
  updateOfferLetterStatus,
  addOfferLetterDocument,
  fetchOfferLetterStats,
};

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
// API Data selectors
export const selectOfferLetters = (state) => state.offerLetters.offerLetters;
export const selectCurrentOfferLetter = (state) => state.offerLetters.currentOfferLetter;
export const selectOfferLetterStats = (state) => state.offerLetters.offerLetterStats;

// Loading state selectors
export const selectFetchLoading = (state) => state.offerLetters.loading.fetch;
export const selectFetchByIdLoading = (state) => state.offerLetters.loading.fetchById;
export const selectCreateLoading = (state) => state.offerLetters.loading.create;
export const selectUpdateLoading = (state) => state.offerLetters.loading.update;
export const selectDeleteLoading = (state) => state.offerLetters.loading.delete;
export const selectReplaceLoading = (state) => state.offerLetters.loading.replace;
export const selectUpdateStatusLoading = (state) => state.offerLetters.loading.updateStatus;
export const selectAddDocumentLoading = (state) => state.offerLetters.loading.addDocument;
export const selectFetchStatsLoading = (state) => state.offerLetters.loading.fetchStats;

// Error selector
export const selectError = (state) => state.offerLetters.error;

// UI State selectors
export const selectSelectedOfferLetter = (state) => state.offerLetters.selectedOfferLetter;
export const selectIsFormOpen = (state) => state.offerLetters.isFormOpen;
export const selectIsDetailOpen = (state) => state.offerLetters.isDetailOpen;
export const selectFormMode = (state) => state.offerLetters.formMode;
export const selectFilters = (state) => state.offerLetters.filters;
export const selectPagination = (state) => state.offerLetters.pagination;

// Legacy selector for backward compatibility
export const selectIsLoading = (state) => state.offerLetters.loading.fetch;

// Export reducer
export default offerLettersSlice.reducer;

// AI-NOTE: Created Redux slice for offer letters state management with UI controls, filters, pagination, and loading states following project patterns