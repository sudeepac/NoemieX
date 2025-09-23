import { apiSlice } from '../apiSlice';

// AI-NOTE: Billing Transactions API endpoints injected into main API slice following official RTK Query pattern
export const billingTransactionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all billing transactions with filtering and pagination
    getBillingTransactions: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.type) searchParams.append('type', params.type);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        if (params.agencyId) searchParams.append('agencyId', params.agencyId);
        if (params.paymentScheduleId) searchParams.append('paymentScheduleId', params.paymentScheduleId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        if (params.minAmount) searchParams.append('minAmount', params.minAmount);
        if (params.maxAmount) searchParams.append('maxAmount', params.maxAmount);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return `/billing-transactions?${searchParams}`;
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.transactions.map(({ id }) => ({ type: 'BillingTransaction', id })),
              { type: 'BillingTransaction', id: 'LIST' },
            ]
          : [{ type: 'BillingTransaction', id: 'LIST' }],
    }),

    // Get single billing transaction by ID
    getBillingTransaction: builder.query({
      query: (transactionId) => `/billing-transactions/${transactionId}`,
      providesTags: (result, error, id) => [{ type: 'BillingTransaction', id }],
    }),

    // Create new billing transaction
    createBillingTransaction: builder.mutation({
      query: (newTransaction) => ({
        url: '/billing-transactions',
        method: 'POST',
        body: newTransaction,
      }),
      invalidatesTags: [{ type: 'BillingTransaction', id: 'LIST' }],
    }),

    // Update billing transaction
    updateBillingTransaction: builder.mutation({
      query: ({ transactionId, ...patch }) => ({
        url: `/billing-transactions/${transactionId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { transactionId }) => [
        { type: 'BillingTransaction', id: transactionId },
        { type: 'BillingTransaction', id: 'LIST' },
      ],
    }),

    // Update billing transaction status
    updateBillingTransactionStatus: builder.mutation({
      query: ({ transactionId, status, statusReason }) => ({
        url: `/billing-transactions/${transactionId}/status`,
        method: 'PATCH',
        body: { status, statusReason },
      }),
      invalidatesTags: (result, error, { transactionId }) => [
        { type: 'BillingTransaction', id: transactionId },
        { type: 'BillingTransaction', id: 'LIST' },
      ],
    }),

    // Claim billing transaction
    claimBillingTransaction: builder.mutation({
      query: (transactionId) => ({
        url: `/billing-transactions/${transactionId}/claim`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, transactionId) => [
        { type: 'BillingTransaction', id: transactionId },
        { type: 'BillingTransaction', id: 'LIST' },
      ],
    }),

    // Dispute billing transaction
    disputeBillingTransaction: builder.mutation({
      query: ({ transactionId, disputeReason, disputeDate }) => ({
        url: `/billing-transactions/${transactionId}/dispute`,
        method: 'PATCH',
        body: { disputeReason, disputeDate },
      }),
      invalidatesTags: (result, error, { transactionId }) => [
        { type: 'BillingTransaction', id: transactionId },
        { type: 'BillingTransaction', id: 'LIST' },
      ],
    }),

    // Delete billing transaction
    deleteBillingTransaction: builder.mutation({
      query: (transactionId) => ({
        url: `/billing-transactions/${transactionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, transactionId) => [
        { type: 'BillingTransaction', id: transactionId },
        { type: 'BillingTransaction', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetBillingTransactionsQuery,
  useGetBillingTransactionQuery,
  useCreateBillingTransactionMutation,
  useUpdateBillingTransactionMutation,
  useUpdateBillingTransactionStatusMutation,
  useClaimBillingTransactionMutation,
  useDisputeBillingTransactionMutation,
  useDeleteBillingTransactionMutation,
} = billingTransactionsApi;