import { apiSlice } from '../apiSlice';

// AI-NOTE: Billing Event Histories API endpoints injected into main API slice following official RTK Query pattern
export const billingEventHistoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all billing event histories with filtering and pagination
    getBillingEventHistories: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.eventType) searchParams.append('eventType', params.eventType);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        if (params.agencyId) searchParams.append('agencyId', params.agencyId);
        if (params.transactionId) searchParams.append('transactionId', params.transactionId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return `/billing-event-histories?${searchParams}`;
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.eventHistories.map(({ id }) => ({ type: 'BillingEventHistory', id })),
              { type: 'BillingEventHistory', id: 'LIST' },
            ]
          : [{ type: 'BillingEventHistory', id: 'LIST' }],
    }),

    // Get single billing event history by ID
    getBillingEventHistory: builder.query({
      query: (historyId) => `/billing-event-histories/${historyId}`,
      providesTags: (result, error, id) => [{ type: 'BillingEventHistory', id }],
    }),

    // Get billing event histories for specific transaction
    getBillingEventHistoriesByTransaction: builder.query({
      query: (transactionId) => `/billing-transactions/${transactionId}/event-histories`,
      providesTags: (result, error, transactionId) => [
        { type: 'BillingEventHistory', id: `TRANSACTION_${transactionId}` },
      ],
    }),

    // Get billing event histories for specific account
    getBillingEventHistoriesByAccount: builder.query({
      query: (accountId) => `/accounts/${accountId}/billing-event-histories`,
      providesTags: (result, error, accountId) => [
        { type: 'BillingEventHistory', id: `ACCOUNT_${accountId}` },
      ],
    }),

    // Create new billing event history (usually done automatically by system)
    createBillingEventHistory: builder.mutation({
      query: (newHistory) => ({
        url: '/billing-event-histories',
        method: 'POST',
        body: newHistory,
      }),
      invalidatesTags: (result, error, { transactionId, accountId }) => [
        { type: 'BillingEventHistory', id: 'LIST' },
        ...(transactionId ? [{ type: 'BillingEventHistory', id: `TRANSACTION_${transactionId}` }] : []),
        ...(accountId ? [{ type: 'BillingEventHistory', id: `ACCOUNT_${accountId}` }] : []),
      ],
    }),

    // Update billing event history (rare operation)
    updateBillingEventHistory: builder.mutation({
      query: ({ historyId, ...patch }) => ({
        url: `/billing-event-histories/${historyId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { historyId }) => [
        { type: 'BillingEventHistory', id: historyId },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Delete billing event history (admin only)
    deleteBillingEventHistory: builder.mutation({
      query: (historyId) => ({
        url: `/billing-event-histories/${historyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, historyId) => [
        { type: 'BillingEventHistory', id: historyId },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Export billing event histories to CSV
    exportBillingEventHistories: builder.mutation({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add filter parameters for export
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.eventType) searchParams.append('eventType', params.eventType);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        
        return {
          url: `/billing-event-histories/export?${searchParams}`,
          method: 'POST',
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetBillingEventHistoriesQuery,
  useGetBillingEventHistoryQuery,
  useGetBillingEventHistoriesByTransactionQuery,
  useGetBillingEventHistoriesByAccountQuery,
  useCreateBillingEventHistoryMutation,
  useUpdateBillingEventHistoryMutation,
  useDeleteBillingEventHistoryMutation,
  useExportBillingEventHistoriesMutation,
} = billingEventHistoriesApi;