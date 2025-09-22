import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { applyScopeToEndpoint } from '../../shared/utils/apiHelpers';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Async thunks for user operations

// Fetch users with filtering and pagination
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add filter params
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.portalType) queryParams.append('portalType', params.portalType);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.agencyId) queryParams.append('agencyId', params.agencyId);
      if (params.accountId) queryParams.append('accountId', params.accountId);
      
      // Add sorting params
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users?${queryParams.toString()}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch single user by ID
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId, { rejectWithValue }) => {
    try {
      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users/${userId}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch user');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create new user
export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update user
export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users/${userId}`);
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete user
export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users/${userId}`);
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      return { userId };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle user status (activate/deactivate)
export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (userId, { rejectWithValue }) => {
    try {
      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users/${userId}/toggle-status`);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle user status');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Change user password
export const changeUserPassword = createAsyncThunk(
  'users/changeUserPassword',
  async ({ userId, passwordData }, { rejectWithValue }) => {
    try {
      const endpoint = applyScopeToEndpoint(`${API_BASE_URL}/users/${userId}/change-password`);
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change password');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  // Data
  users: [],
  selectedUser: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // UI state
  filters: {
    page: 1,
    limit: 10,
    search: '',
    role: '',
    portalType: '',
    isActive: undefined,
    agencyId: '',
    accountId: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  selectedUsers: [],
  formMode: 'create', // 'create' | 'edit' | 'view'
  showUserModal: false,
  showDeleteModal: false,
  showPasswordModal: false,
  
  // Loading states
  loading: false,
  userLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statusLoading: false,
  passwordLoading: false,
  
  // Error states
  error: null,
  userError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  statusError: null,
  passwordError: null
};

// Users slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // Filter actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    
    // Selection actions
    setSelectedUsers: (state, action) => {
      state.selectedUsers = action.payload;
    },
    toggleUserSelection: (state, action) => {
      const userId = action.payload;
      const index = state.selectedUsers.indexOf(userId);
      if (index > -1) {
        state.selectedUsers.splice(index, 1);
      } else {
        state.selectedUsers.push(userId);
      }
    },
    selectAllUsers: (state) => {
      state.selectedUsers = state.users.map(user => user._id);
    },
    clearUserSelection: (state) => {
      state.selectedUsers = [];
    },
    
    // Form actions
    setFormMode: (state, action) => {
      state.formMode = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    
    // Modal actions
    setShowUserModal: (state, action) => {
      state.showUserModal = action.payload;
    },
    setShowDeleteModal: (state, action) => {
      state.showDeleteModal = action.payload;
    },
    setShowPasswordModal: (state, action) => {
      state.showPasswordModal = action.payload;
    },
    
    // Error actions
    clearErrors: (state) => {
      state.error = null;
      state.userError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.statusError = null;
      state.passwordError = null;
    },
    clearError: (state, action) => {
      const errorType = action.payload;
      if (state[errorType] !== undefined) {
        state[errorType] = null;
      }
    }
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data?.users || [];
        state.pagination = action.payload.data?.pagination || initialState.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Fetch user by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.userLoading = true;
        state.userError = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.userLoading = false;
        state.selectedUser = action.payload.data?.user || null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.payload;
      });

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        const newUser = action.payload.data?.user;
        if (newUser) {
          state.users.unshift(newUser);
        }
        state.showUserModal = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });

    // Update user
    builder
      .addCase(updateUser.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedUser = action.payload.data?.user;
        if (updatedUser) {
          const index = state.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
          if (state.selectedUser?._id === updatedUser._id) {
            state.selectedUser = updatedUser;
          }
        }
        state.showUserModal = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { userId } = action.payload;
        state.users = state.users.filter(user => user._id !== userId);
        state.selectedUsers = state.selectedUsers.filter(id => id !== userId);
        if (state.selectedUser?._id === userId) {
          state.selectedUser = null;
        }
        state.showDeleteModal = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      });

    // Toggle user status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.statusLoading = true;
        state.statusError = null;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.statusLoading = false;
        const updatedUser = action.payload.data?.user;
        if (updatedUser) {
          const index = state.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            state.users[index] = updatedUser;
          }
          if (state.selectedUser?._id === updatedUser._id) {
            state.selectedUser = updatedUser;
          }
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.statusLoading = false;
        state.statusError = action.payload;
      });

    // Change user password
    builder
      .addCase(changeUserPassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
      })
      .addCase(changeUserPassword.fulfilled, (state) => {
        state.passwordLoading = false;
        state.showPasswordModal = false;
      })
      .addCase(changeUserPassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload;
      });
  }
});

// Export actions
export const {
  setFilters,
  resetFilters,
  setSelectedUsers,
  toggleUserSelection,
  selectAllUsers,
  clearUserSelection,
  setFormMode,
  setSelectedUser,
  clearSelectedUser,
  setShowUserModal,
  setShowDeleteModal,
  setShowPasswordModal,
  clearErrors,
  clearError
} = usersSlice.actions;

// Selectors
export const selectUsers = (state) => state.users.users;
export const selectSelectedUser = (state) => state.users.selectedUser;
export const selectUsersPagination = (state) => state.users.pagination;
export const selectUsersFilters = (state) => state.users.filters;
export const selectSelectedUsers = (state) => state.users.selectedUsers;
export const selectUsersFormMode = (state) => state.users.formMode;
export const selectShowUserModal = (state) => state.users.showUserModal;
export const selectShowDeleteModal = (state) => state.users.showDeleteModal;
export const selectShowPasswordModal = (state) => state.users.showPasswordModal;

// Loading selectors
export const selectUsersLoading = (state) => state.users.loading;
export const selectUserLoading = (state) => state.users.userLoading;
export const selectCreateUserLoading = (state) => state.users.createLoading;
export const selectUpdateUserLoading = (state) => state.users.updateLoading;
export const selectDeleteUserLoading = (state) => state.users.deleteLoading;
export const selectStatusUserLoading = (state) => state.users.statusLoading;
export const selectPasswordUserLoading = (state) => state.users.passwordLoading;

// Error selectors
export const selectUsersError = (state) => state.users.error;
export const selectUserError = (state) => state.users.userError;
export const selectCreateUserError = (state) => state.users.createError;
export const selectUpdateUserError = (state) => state.users.updateError;
export const selectDeleteUserError = (state) => state.users.deleteError;
export const selectStatusUserError = (state) => state.users.statusError;
export const selectPasswordUserError = (state) => state.users.passwordError;

// Computed selectors
export const selectIsAnyUserSelected = (state) => state.users.selectedUsers.length > 0;
export const selectAreAllUsersSelected = (state) => 
  state.users.users.length > 0 && state.users.selectedUsers.length === state.users.users.length;

// Export reducer
export default usersSlice.reducer;