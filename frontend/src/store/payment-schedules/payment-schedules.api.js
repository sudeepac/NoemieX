// AI-NOTE: Payment schedule RTK Query API slice for all CRUD operations and stats
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const paymentSchedulesApi = createApi({
  reducerPath: 'paymentSchedulesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/payment-schedule-items',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['PaymentSchedule', 'PaymentScheduleStats'],
  endpoints: (builder) => ({
    // Get all payment schedule items with filtering and pagination
    getPaymentSchedules: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
          }
        });
        return `?${searchParams.toString()}`;
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
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'PaymentSchedule', id }],
    }),

    // Create new payment schedule item
    createPaymentSchedule: builder.mutation({
      query: (newPaymentSchedule) => ({
        url: '',
        method: 'POST',
        body: newPaymentSchedule,
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Update payment schedule item
    updatePaymentSchedule: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/${id}`,
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
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Approve payment schedule item
    approvePaymentSchedule: builder.mutation({
      query: (id) => ({
        url: `/${id}/approve`,
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
        url: `/${id}/retire`,
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
        url: `/${id}/replace`,
        method: 'POST',
        body: { ...newItemData, reason },
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }, { type: 'PaymentScheduleStats', id: 'STATS' }],
    }),

    // Complete payment schedule item
    completePaymentSchedule: builder.mutation({
      query: (id) => ({
        url: `/${id}/complete`,
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
        url: `/${id}/cancel`,
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
        url: `/${parentItemId}/generate-recurring`,
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
  }),
});

export const {
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
  useGetOverduePaymentSchedulesQuery,
  useGetUpcomingPaymentSchedulesQuery,
  useGenerateBillingTransactionsMutation,
  useGenerateRecurringItemsMutation,
  useGetPaymentScheduleStatsQuery,
} = paymentSchedulesApi;