import { apiSlice } from '../apiSlice';

// AI-NOTE: Auth API endpoints injected into main API slice following official RTK Query pattern
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    login: builder.mutation({
      query: ({ email, password, portalType }) => ({
        url: '/auth/login',
        method: 'POST',
        body: { email, password, portalType },
      }),
      transformResponse: (response) => {
        const { user, token, refreshToken } = response.data;
        
        // Store tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        return { user, token, refreshToken };
      },
    }),

    // Register user
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => {
        const { user, token, refreshToken } = response.data;
        
        // Store tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        return { user, token, refreshToken };
      },
    }),

    // Check authentication status
    checkAuth: builder.query({
      query: () => '/auth/me',
      transformResponse: (response) => {
        const token = localStorage.getItem('token');
        return { user: response.data.user, token };
      },
      transformErrorResponse: (response) => {
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return response.data?.message || 'Authentication failed';
      },
    }),

    // Update user profile
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData,
      }),
      transformResponse: (response) => response.data.user,
    }),

    // Change password
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    }),

    // Forgot password
    forgotPassword: builder.mutation({
      query: ({ email }) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
    }),

    // Reset password
    resetPassword: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, newPassword },
      }),
    }),

    // Refresh token
    refreshToken: builder.mutation({
      query: ({ refreshToken }) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => {
        const { token, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        return { token, refreshToken: newRefreshToken };
      },
    }),

    // Logout
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      transformResponse: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        return {};
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useCheckAuthQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;