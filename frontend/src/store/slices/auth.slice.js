import { createSlice } from '@reduxjs/toolkit';

// AI-NOTE: Client auth state ONLY - READ /store/README.md for our strict separation rules
// Handles: tokens, user data, UI state | Does NOT handle: server calls (use authApi.js)
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  // UI state
  showLoginModal: false,
  rememberMe: false,
  lastLoginTime: null,
  sessionExpiry: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set authentication data
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.error = null;
      state.lastLoginTime = new Date().toISOString();
    },

    // Clear authentication data
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      state.lastLoginTime = null;
      state.sessionExpiry = null;
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },

    // Update user profile data
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // UI state management
    toggleLoginModal: (state) => {
      state.showLoginModal = !state.showLoginModal;
    },

    setShowLoginModal: (state, action) => {
      state.showLoginModal = action.payload;
    },

    setRememberMe: (state, action) => {
      state.rememberMe = action.payload;
    },

    // Session management
    setSessionExpiry: (state, action) => {
      state.sessionExpiry = action.payload;
    },

    // Update tokens (for refresh token flow)
    updateTokens: (state, action) => {
      const { token, refreshToken } = action.payload;
      state.token = token;
      state.refreshToken = refreshToken;
      // Update localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    },

    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (token && refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
        // Note: user data should be fetched via RTK Query checkAuth
      }
    },
  },
});

// Export actions
export const {
  setCredentials,
  clearCredentials,
  updateUserProfile,
  setLoading,
  setError,
  clearError,
  toggleLoginModal,
  setShowLoginModal,
  setRememberMe,
  setSessionExpiry,
  updateTokens,
  initializeAuth,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectShowLoginModal = (state) => state.auth.showLoginModal;
export const selectRememberMe = (state) => state.auth.rememberMe;
export const selectSessionExpiry = (state) => state.auth.sessionExpiry;
export const selectLastLoginTime = (state) => state.auth.lastLoginTime;

// Export reducer
export default authSlice.reducer;