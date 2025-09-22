import { api } from '../api/api';

// AI-NOTE: Billing transactions API slice with RTK Query for all CRUD operations and specialized endpoints
// Follows convention.md naming patterns and business-rules.md multi-tenancy requirements

export const billingTransactionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all billing transactions with filtering and pagination
    listBillingTransactions: builder.query({
      query: (params = {}) => ({
        url: '/billing-transactions',
        method: 'GET',
        params,
      }),
      providesTags: (result) => [
        { type: 'BillingTransaction', id: 'LIST' },
        ...(result?.billingTransactions || []).map(({ _id }) => ({
          type: 'BillingTransaction',
          id: _id,
        })),
      ],
    }),

    // Get single billing transaction by ID
    getBillingTransactionById: builder.query({
      query: (billingTransactionId) => ({
        url: `/billing-transactions/${billingTransactionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, billingTransactionId) => [
        { type: 'BillingTransaction', id: billingTransactionId },
      ],
    }),

    // Create new billing transaction
    createBillingTransaction: builder.mutation({
      query: (billingTransactionData) => ({
        url: '/billing-transactions',
        method: 'POST',
        body: billingTransactionData,
      }),
      invalidatesTags: [
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Update billing transaction
    updateBillingTransaction: builder.mutation({
      query: ({ billingTransactionId, ...billingTransactionData }) => ({
        url: `/billing-transactions/${billingTransactionId}`,
        method: 'PUT',
        body: billingTransactionData,
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Update billing transaction status
    updateBillingTransactionStatus: builder.mutation({
      query: ({ billingTransactionId, status, ...statusData }) => ({
        url: `/billing-transactions/${billingTransactionId}/status`,
        method: 'PATCH',
        body: { status, ...statusData },
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Claim billing transaction
    claimBillingTransaction: builder.mutation({
      query: ({ billingTransactionId, claimDate }) => ({
        url: `/billing-transactions/${billingTransactionId}/claim`,
        method: 'PATCH',
        body: { claimDate },
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Dispute billing transaction
    disputeBillingTransaction: builder.mutation({
      query: ({ billingTransactionId, disputeReason, disputeDate }) => ({
        url: `/billing-transactions/${billingTransactionId}/dispute`,
        method: 'PATCH',
        body: { disputeReason, disputeDate },
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Resolve dispute for billing transaction
    resolveDisputeBillingTransaction: builder.mutation({
      query: ({ billingTransactionId, newStatus, resolvedDate }) => ({
        url: `/billing-transactions/${billingTransactionId}/resolve-dispute`,
        method: 'PATCH',
        body: { newStatus, resolvedDate },
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Add approval to billing transaction
    approveBillingTransaction: builder.mutation({
      query: ({ billingTransactionId, level, comments }) => ({
        url: `/billing-transactions/${billingTransactionId}/approve`,
        method: 'POST',
        body: { level, comments },
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Reconcile billing transaction
    reconcileBillingTransaction: builder.mutation({
      query: ({ billingTransactionId, bankStatementRef }) => ({
        url: `/billing-transactions/${billingTransactionId}/reconcile`,
        method: 'PATCH',
        body: { bankStatementRef },
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Get overdue billing transactions
    getOverdueTransactions: builder.query({
      query: (params = {}) => ({
        url: '/billing-transactions/overdue',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'BillingTransaction', id: 'OVERDUE' }],
    }),

    // Get disputed billing transactions
    getDisputedTransactions: builder.query({
      query: (params = {}) => ({
        url: '/billing-transactions/disputed',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'BillingTransaction', id: 'DISPUTED' }],
    }),

    // Get revenue summary
    getRevenueSummary: builder.query({
      query: (params = {}) => ({
        url: '/billing-transactions/revenue-summary',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'BillingTransaction', id: 'REVENUE' }],
    }),

    // Get billing transaction statistics
    getBillingTransactionStats: builder.query({
      query: (params = {}) => ({
        url: '/billing-transactions/stats',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'BillingTransaction', id: 'STATS' }],
    }),

    // Delete billing transaction
    deleteBillingTransaction: builder.mutation({
      query: (billingTransactionId) => ({
        url: `/billing-transactions/${billingTransactionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),

    // Mark billing transaction as paid
    markAsPaid: builder.mutation({
      query: ({ billingTransactionId, paymentData }) => ({
        url: `/billing-transactions/${billingTransactionId}/mark-paid`,
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useListBillingTransactionsQuery,
  useGetBillingTransactionByIdQuery,
  useCreateBillingTransactionMutation,
  useUpdateBillingTransactionMutation,
  useUpdateBillingTransactionStatusMutation,
  useClaimBillingTransactionMutation,
  useDisputeBillingTransactionMutation,
  useResolveDisputeBillingTransactionMutation,
  useApproveBillingTransactionMutation,
  useReconcileBillingTransactionMutation,
  useGetOverdueTransactionsQuery,
  useGetDisputedTransactionsQuery,
  useGetRevenueSummaryQuery,
  useGetBillingTransactionStatsQuery,
  useDeleteBillingTransactionMutation,
  useMarkAsPaidMutation,
} = billingTransactionsApi;

// Export aliases for component compatibility
export const useGetBillingTransactionsQuery = useListBillingTransactionsQuery;
export const useGetBillingTransactionQuery = useGetBillingTransactionByIdQuery;