import { apiSlice } from '../apiSlice';

// AI-NOTE: Accounts API endpoints injected into main API slice following official RTK Query pattern
export const accountsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all accounts with filtering and pagination
    getAccounts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return `/accounts?${searchParams}`;
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.accounts.map(({ id }) => ({ type: 'Account', id })),
              { type: 'Account', id: 'LIST' },
            ]
          : [{ type: 'Account', id: 'LIST' }],
    }),

    // Get single account by ID
    getAccount: builder.query({
      query: (accountId) => `/accounts/${accountId}`,
      providesTags: (result, error, id) => [{ type: 'Account', id }],
    }),

    // Get account statistics
    getAccountStats: builder.query({
      query: (accountId) => `/accounts/${accountId}/stats`,
      providesTags: (result, error, id) => [{ type: 'AccountStats', id }],
    }),

    // Create new account
    createAccount: builder.mutation({
      query: (newAccount) => ({
        url: '/accounts',
        method: 'POST',
        body: newAccount,
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    // Update account
    updateAccount: builder.mutation({
      query: ({ accountId, ...patch }) => ({
        url: `/accounts/${accountId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { accountId }) => [
        { type: 'Account', id: accountId },
        { type: 'Account', id: 'LIST' },
        { type: 'AccountStats', id: accountId },
      ],
    }),

    // Delete account
    deleteAccount: builder.mutation({
      query: (accountId) => ({
        url: `/accounts/${accountId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, accountId) => [
        { type: 'Account', id: accountId },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    // Toggle account status
    toggleAccountStatus: builder.mutation({
      query: (accountId) => ({
        url: `/accounts/${accountId}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, accountId) => [
        { type: 'Account', id: accountId },
        { type: 'Account', id: 'LIST' },
        { type: 'AccountStats', id: accountId },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useGetAccountStatsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useToggleAccountStatusMutation,
} = accountsApi;