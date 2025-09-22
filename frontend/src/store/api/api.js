import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem('token');
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        const { token, refreshToken: newRefreshToken } = refreshResult.data.data;
        
        // Store new tokens
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update auth state
        api.dispatch({ type: 'auth/setCredentials', payload: { token, refreshToken: newRefreshToken } });
        
        // Retry original query
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        api.dispatch({ type: 'auth/logout' });
      }
    } else {
      // No refresh token, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      api.dispatch({ type: 'auth/logout' });
    }
  }
  
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 
    'Account', 
    'AccountStats',
    'Agency', 
    'OfferLetter', 
    'OfferLetterStats',
    'PaymentScheduleItem', 
    'PaymentSchedule',
    'PaymentScheduleStats',
    'BillingTransaction',
    'BillingEventHistory'
  ],
  endpoints: (builder) => ({
    // Agencies endpoints
    // Get all agencies with filtering and pagination
    getAgencies: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.type) searchParams.append('type', params.type);
        if (params.isActive !== undefined) searchParams.append('isActive', params.isActive);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return {
          url: `agencies?${searchParams.toString()}`,
          method: 'GET',
        };
      },
      providesTags: (result) =>
        result?.data?.agencies
          ? [
              ...result.data.agencies.map(({ _id }) => ({ type: 'Agency', id: _id })),
              { type: 'Agency', id: 'LIST' },
            ]
          : [{ type: 'Agency', id: 'LIST' }],
    }),

    // Get single agency by ID
    getAgency: builder.query({
      query: (id) => ({
        url: `agencies/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Agency', id }],
    }),

    // Create new agency
    createAgency: builder.mutation({
      query: (agencyData) => ({
        url: 'agencies',
        method: 'POST',
        body: agencyData,
      }),
      invalidatesTags: [{ type: 'Agency', id: 'LIST' }],
    }),

    // Update agency
    updateAgency: builder.mutation({
      query: ({ id, ...agencyData }) => ({
        url: `agencies/${id}`,
        method: 'PUT',
        body: agencyData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Agency', id },
        { type: 'Agency', id: 'LIST' },
      ],
    }),

    // Delete agency (Superadmin and Account Admin only)
    deleteAgency: builder.mutation({
      query: (id) => ({
        url: `agencies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Agency', id: 'LIST' }],
    }),

    // Toggle agency status (activate/deactivate)
    toggleAgencyStatus: builder.mutation({
      query: (id) => ({
        url: `agencies/${id}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Agency', id },
        { type: 'Agency', id: 'LIST' },
      ],
    }),

    // Get agency statistics and performance metrics
    getAgencyStats: builder.query({
      query: (id) => ({
        url: `agencies/${id}/stats`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Agency', id: `${id}-stats` }],
    }),

    // Update agency performance (internal use)
    updateAgencyPerformance: builder.mutation({
      query: ({ id, performanceData }) => ({
        url: `agencies/${id}/performance`,
        method: 'PATCH',
        body: performanceData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Agency', id },
        { type: 'Agency', id: `${id}-stats` },
        { type: 'Agency', id: 'LIST' },
      ],
    }),

    // Billing Transactions endpoints
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
      invalidatesTags: (result, error, billingTransactionId) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingTransaction', id: 'STATS' },
        { type: 'BillingTransaction', id: 'REVENUE_SUMMARY' },
      ],
    }),

    // Mark billing transaction as paid
    markAsPaid: builder.mutation({
      query: ({ billingTransactionId, paymentData }) => ({
        url: `/billing-transactions/${billingTransactionId}/mark-as-paid`,
        method: 'PUT',
        body: paymentData,
      }),
      invalidatesTags: (result, error, { billingTransactionId }) => [
        { type: 'BillingTransaction', id: billingTransactionId },
        { type: 'BillingTransaction', id: 'LIST' },
        { type: 'BillingTransaction', id: 'STATS' },
        { type: 'BillingTransaction', id: 'REVENUE_SUMMARY' },
      ],
    }),

    // Billing Event Histories endpoints
    // Get all billing event histories with filtering and pagination
    listBillingEventHistories: builder.query({
      query: (params = {}) => ({
        url: '/billing-event-histories',
        method: 'GET',
        params,
      }),
      providesTags: (result) => [
        { type: 'BillingEventHistory', id: 'LIST' },
        ...(result?.billingEventHistories || []).map(({ _id }) => ({
          type: 'BillingEventHistory',
          id: _id,
        })),
      ],
    }),

    // Get single billing event history by ID
    getBillingEventHistoryById: builder.query({
      query: (billingEventHistoryId) => ({
        url: `/billing-event-histories/${billingEventHistoryId}`,
        method: 'GET',
      }),
      providesTags: (result, error, billingEventHistoryId) => [
        { type: 'BillingEventHistory', id: billingEventHistoryId },
      ],
    }),

    // Get activity summary for billing event histories
    getBillingEventHistoryActivitySummary: builder.query({
      query: (params = {}) => ({
        url: '/billing-event-histories/activity-summary',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'BillingEventHistory', id: 'ACTIVITY_SUMMARY' }],
    }),

    // Get transaction timeline for a specific billing transaction
    getBillingEventHistoryTransactionTimeline: builder.query({
      query: (billingTransactionId) => ({
        url: `/billing-event-histories/transaction-timeline/${billingTransactionId}`,
        method: 'GET',
      }),
      providesTags: (result, error, billingTransactionId) => [
        { type: 'BillingEventHistory', id: `TIMELINE_${billingTransactionId}` }
      ],
    }),

    // Hide/unhide billing event history (soft delete)
    updateBillingEventHistoryVisibility: builder.mutation({
      query: ({ billingEventHistoryId, isVisible }) => ({
        url: `/billing-event-histories/${billingEventHistoryId}/visibility`,
        method: 'PUT',
        body: { isVisible },
      }),
      invalidatesTags: (result, error, { billingEventHistoryId }) => [
        { type: 'BillingEventHistory', id: billingEventHistoryId },
        { type: 'BillingEventHistory', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'ACTIVITY_SUMMARY' },
      ],
    }),

    // Add note to billing event history
    addNoteToBillingEventHistory: builder.mutation({
      query: ({ billingTransactionId, note, eventData = {} }) => ({
        url: '/billing-event-histories/note',
        method: 'POST',
        body: {
          billingTransactionId,
          eventData: {
            ...eventData,
            description: note,
          },
        },
      }),
      invalidatesTags: [
        { type: 'BillingEventHistory', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'ACTIVITY_SUMMARY' },
      ],
    }),

    // Upload document to billing event history
    uploadBillingEventHistoryDocument: builder.mutation({
      query: ({ billingTransactionId, formData }) => ({
        url: '/billing-event-histories/upload-document',
        method: 'POST',
        body: formData,
        params: { billingTransactionId },
      }),
      invalidatesTags: [
        { type: 'BillingEventHistory', id: 'LIST' },
        { type: 'BillingEventHistory', id: 'ACTIVITY_SUMMARY' },
      ],
    }),

    // Offer Letters endpoints
    // Get all offer letters with filtering and pagination
    getOfferLetters: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return `/offer-letters?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.offerLetters
          ? [
              ...result.offerLetters.map(({ _id }) => ({ type: 'OfferLetter', id: _id })),
              { type: 'OfferLetter', id: 'LIST' },
            ]
          : [{ type: 'OfferLetter', id: 'LIST' }],
    }),

    // Get single offer letter by ID
    getOfferLetter: builder.query({
      query: (id) => `/offer-letters/${id}`,
      providesTags: (result, error, id) => [{ type: 'OfferLetter', id }],
    }),

    // Create new offer letter
    createOfferLetter: builder.mutation({
      query: (offerLetterData) => ({
        url: '/offer-letters',
        method: 'POST',
        body: offerLetterData,
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }, { type: 'OfferLetterStats' }],
    }),

    // Update offer letter
    updateOfferLetter: builder.mutation({
      query: ({ id, ...offerLetterData }) => ({
        url: `/offer-letters/${id}`,
        method: 'PUT',
        body: offerLetterData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'OfferLetter', id },
        { type: 'OfferLetter', id: 'LIST' },
        { type: 'OfferLetterStats' },
      ],
    }),

    // Delete offer letter
    deleteOfferLetter: builder.mutation({
      query: (id) => ({
        url: `/offer-letters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }, { type: 'OfferLetterStats' }],
    }),

    // Update offer letter status
    updateOfferLetterStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/offer-letters/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'OfferLetter', id },
        { type: 'OfferLetter', id: 'LIST' },
        { type: 'OfferLetterStats' },
      ],
    }),

    // Replace offer letter
    replaceOfferLetter: builder.mutation({
      query: ({ id, reason, ...newOfferLetterData }) => ({
        url: `/offer-letters/${id}/replace`,
        method: 'POST',
        body: { reason, ...newOfferLetterData },
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }, { type: 'OfferLetterStats' }],
    }),

    // Add document to offer letter
    addDocument: builder.mutation({
      query: ({ id, name, url }) => ({
        url: `/offer-letters/${id}/documents`,
        method: 'POST',
        body: { name, url },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'OfferLetter', id },
        { type: 'OfferLetter', id: 'LIST' },
      ],
    }),

    // Get offer letter statistics
    getOfferLetterStats: builder.query({
      query: () => '/stats',
      providesTags: [{ type: 'OfferLetterStats' }],
    }),

    // Payment Schedules endpoints
    // Get all payment schedule items with filtering and pagination
    getPaymentSchedules: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return `/payment-schedule-items?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result?.paymentScheduleItems
          ? [
              ...result.paymentScheduleItems.map(({ _id }) => ({ type: 'PaymentSchedule', id: _id })),
              { type: 'PaymentSchedule', id: 'LIST' },
            ]
          : [{ type: 'PaymentSchedule', id: 'LIST' }],
    }),

    // Get single payment schedule item
    getPaymentSchedule: builder.query({
      query: (id) => `/payment-schedule-items/${id}`,
      providesTags: (result, error, id) => [{ type: 'PaymentSchedule', id }],
    }),

    // Create new payment schedule item
    createPaymentSchedule: builder.mutation({
      query: (newPaymentSchedule) => ({
        url: '/payment-schedule-items',
        method: 'POST',
        body: newPaymentSchedule,
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Update payment schedule item
    updatePaymentSchedule: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/payment-schedule-items/${id}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentSchedule', id },
        { type: 'PaymentSchedule', id: 'LIST' },
        { type: 'PaymentScheduleStats', id: 'STATS' },
      ],
    }),

    // Delete payment schedule item
    deletePaymentSchedule: builder.mutation({
      query: (id) => ({
        url: `/payment-schedule-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Approve payment schedule item
    approvePaymentSchedule: builder.mutation({
      query: (id) => ({
        url: `/payment-schedule-items/${id}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PaymentSchedule', id },
        { type: 'PaymentSchedule', id: 'LIST' },
        { type: 'PaymentScheduleStats', id: 'STATS' },
      ],
    }),

    // Retire payment schedule item
    retirePaymentSchedule: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/payment-schedule-items/${id}/retire`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentSchedule', id },
        { type: 'PaymentSchedule', id: 'LIST' },
        { type: 'PaymentScheduleStats', id: 'STATS' },
      ],
    }),

    // Replace payment schedule item
    replacePaymentSchedule: builder.mutation({
      query: ({ id, newItemData, reason }) => ({
        url: `/payment-schedule-items/${id}/replace`,
        method: 'POST',
        body: { ...newItemData, reason },
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Complete payment schedule item
    completePaymentSchedule: builder.mutation({
      query: (id) => ({
        url: `/payment-schedule-items/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PaymentSchedule', id },
        { type: 'PaymentSchedule', id: 'LIST' },
        { type: 'PaymentScheduleStats', id: 'STATS' },
      ],
    }),

    // Cancel payment schedule item
    cancelPaymentSchedule: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/payment-schedule-items/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentSchedule', id },
        { type: 'PaymentSchedule', id: 'LIST' },
        { type: 'PaymentScheduleStats', id: 'STATS' },
      ],
    }),

    // Get overdue payment schedule items
    getOverduePaymentSchedules: builder.query({
      query: () => '/overdue',
      providesTags: [{ type: 'PaymentSchedule', id: 'OVERDUE' }],
    }),

    // Get upcoming payment schedule items
    getUpcomingPaymentSchedules: builder.query({
      query: (days = 30) => `/upcoming?days=${days}`,
      providesTags: [{ type: 'PaymentSchedule', id: 'UPCOMING' }],
    }),

    // Generate billing transactions from payment schedule items
    generateBillingTransactions: builder.mutation({
      query: ({ itemIds, options = {} }) => ({
        url: '/generate-transactions',
        method: 'POST',
        body: { itemIds, ...options },
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }],
    }),

    // Generate recurring payment schedule items
    generateRecurringItems: builder.mutation({
      query: ({ parentItemId }) => ({
        url: `/payment-schedule-items/${parentItemId}/generate-recurring`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Get payment schedule statistics
    getPaymentScheduleStats: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return `/stats?${searchParams.toString()}`;
      },
      providesTags: [{ type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Users endpoints
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

    // Accounts endpoints
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

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  // Agencies hooks
  useGetAgenciesQuery,
  useGetAgencyQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useDeleteAgencyMutation,
  useToggleAgencyStatusMutation,
  useGetAgencyStatsQuery,
  useUpdateAgencyPerformanceMutation,
  // Offer Letters hooks
  useGetOfferLettersQuery,
  useGetOfferLetterQuery,
  useCreateOfferLetterMutation,
  useUpdateOfferLetterMutation,
  useDeleteOfferLetterMutation,
  useUpdateOfferLetterStatusMutation,
  useReplaceOfferLetterMutation,
  useAddDocumentMutation,
  useGetOfferLetterStatsQuery,
  // Payment Schedules hooks
  useGetPaymentSchedulesQuery,
  useGetPaymentScheduleQuery,
  useCreatePaymentScheduleMutation,
  useUpdatePaymentScheduleMutation,
  useDeletePaymentScheduleMutation,
  useApprovePaymentScheduleMutation,
  useRetirePaymentScheduleMutation,
  useReplacePaymentScheduleMutation,
  useCompletePaymentScheduleMutation,
  useCancelPaymentScheduleMutation,
  useGenerateRecurringItemsMutation,
  useGetPaymentScheduleStatsQuery,
  useGenerateBillingTransactionsMutation,
  // Billing Transactions hooks
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
  // Billing Event Histories hooks
  useListBillingEventHistoriesQuery,
  useGetBillingEventHistoryByIdQuery,
  useGetBillingEventHistoryActivitySummaryQuery,
  useGetBillingEventHistoryTransactionTimelineQuery,
  useUpdateBillingEventHistoryVisibilityMutation,
  useAddNoteToBillingEventHistoryMutation,
  useUploadBillingEventHistoryDocumentMutation,
  // Users hooks
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useChangeUserPasswordMutation,
  // Accounts hooks
  useGetAccountsQuery,
  useGetAccountQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  useToggleAccountStatusMutation,
  useUpdateAccountBillingMutation,
  useGetAccountStatsQuery,
} = api;

// Export aliases for component compatibility
export const useGetBillingTransactionsQuery = useListBillingTransactionsQuery;
export const useGetBillingTransactionQuery = useGetBillingTransactionByIdQuery;