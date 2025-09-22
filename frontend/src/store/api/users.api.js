import { api } from './api';

// Users API slice with all CRUD operations
export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users with filtering and pagination
    getUsers: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.role) searchParams.append('role', params.role);
        if (params.portalType) searchParams.append('portalType', params.portalType);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive);
        if (params.agencyId) searchParams.append('agencyId', params.agencyId);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `users?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result?.data?.users
          ? [
              ...result.data.users.map(({ _id }) => ({ type: 'User', id: _id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // Get single user by ID
    getUser: builder.query({
      query: (id) => ({
        url: `users/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Create new user
    createUser: builder.mutation({
      query: (userData) => ({
        url: 'users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // Update existing user
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Toggle user status (activate/deactivate)
    toggleUserStatus: builder.mutation({
      query: (id) => ({
        url: `users/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Change user password
    changeUserPassword: builder.mutation({
      query: ({ id, currentPassword, newPassword }) => ({
        url: `users/${id}/change-password`,
        method: 'PATCH',
        body: { currentPassword, newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useChangeUserPasswordMutation,
} = usersApi;

// AI-NOTE: Created users RTK Query API slice with all CRUD endpoints matching backend controller functionality. Includes proper cache invalidation tags and query parameter handling for filtering, pagination, and sorting.