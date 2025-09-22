import { api } from './api';

// Accounts API slice with all CRUD operations
export const accountsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all accounts with filtering and pagination (Superadmin only)
    getAccounts: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive);
        
        return {
          url: `accounts?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result?.data?.accounts
          ? [
              ...result.data.accounts.map(({ _id }) => ({ type: 'Account', id: _id })),
              { type: 'Account', id: 'LIST' },
            ]
          : [{ type: 'Account', id: 'LIST' }],
    }),

    // Get single account by ID
    getAccount: builder.query({
      query: (id) => ({
        url: `accounts/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Account', id }],
    }),

    // Create new account (Superadmin only)
    createAccount: builder.mutation({
      query: (accountData) => ({
        url: 'accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    // Update account
    updateAccount: builder.mutation({
      query: ({ id, ...accountData }) => ({
        url: `accounts/${id}`,
        method: 'PUT',
        body: accountData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    // Delete account (Superadmin only)
    deleteAccount: builder.mutation({
      query: (id) => ({
        url: `accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }],
    }),

    // Toggle account status (activate/deactivate) (Superadmin only)
    toggleAccountStatus: builder.mutation({
      query: (id) => ({
        url: `accounts/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    // Update account billing (Superadmin only)
    updateAccountBilling: builder.mutation({
      query: ({ id, ...billingData }) => ({
        url: `accounts/${id}/billing`,
        method: 'PATCH',
        body: billingData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Account', id },
        { type: 'Account', id: 'LIST' },
      ],
    }),

    // Get account statistics
    getAccountStats: builder.query({
      query: (id) => ({
        url: `accounts/${id}/stats`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'AccountStats', id }],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAccountsQuery,
  useGetAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useToggleAccountStatusMutation,
  useUpdateAccountBillingMutation,
  useGetAccountStatsQuery,
} = accountsApi;

// AI-NOTE: Created accounts API slice following backend controller endpoints and existing users.api.js pattern. Includes all CRUD operations with proper RTK Query caching and invalidation tags for optimal data management.