import { apiSlice } from '../apiSlice';

// AI-NOTE: Payment Schedules API endpoints injected into main API slice following official RTK Query pattern
export const paymentSchedulesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all payment schedules with filtering and pagination
    getPaymentSchedules: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        // Add pagination parameters
        if (params.page) searchParams.append('page', params.page);
        if (params.limit) searchParams.append('limit', params.limit);
        
        // Add filter parameters
        if (params.search) searchParams.append('search', params.search);
        if (params.status) searchParams.append('status', params.status);
        if (params.accountId) searchParams.append('accountId', params.accountId);
        if (params.agencyId) searchParams.append('agencyId', params.agencyId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return `/payment-schedules?${searchParams}`;
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.paymentSchedules.map(({ id }) => ({ type: 'PaymentSchedule', id })),
              { type: 'PaymentSchedule', id: 'LIST' },
            ]
          : [{ type: 'PaymentSchedule', id: 'LIST' }],
    }),

    // Get single payment schedule by ID
    getPaymentSchedule: builder.query({
      query: (scheduleId) => `/payment-schedules/${scheduleId}`,
      providesTags: (result, error, id) => [{ type: 'PaymentSchedule', id }],
    }),

    // Create new payment schedule
    createPaymentSchedule: builder.mutation({
      query: (newSchedule) => ({
        url: '/payment-schedules',
        method: 'POST',
        body: newSchedule,
      }),
      invalidatesTags: [{ type: 'PaymentSchedule', id: 'LIST' }],
    }),

    // Update payment schedule
    updatePaymentSchedule: builder.mutation({
      query: ({ scheduleId, ...patch }) => ({
        url: `/payment-schedules/${scheduleId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { scheduleId }) => [
        { type: 'PaymentSchedule', id: scheduleId },
        { type: 'PaymentSchedule', id: 'LIST' },
      ],
    }),

    // Delete payment schedule
    deletePaymentSchedule: builder.mutation({
      query: (scheduleId) => ({
        url: `/payment-schedules/${scheduleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, scheduleId) => [
        { type: 'PaymentSchedule', id: scheduleId },
        { type: 'PaymentSchedule', id: 'LIST' },
      ],
    }),

    // Generate payment transactions from schedule
    generatePaymentTransactions: builder.mutation({
      query: (scheduleId) => ({
        url: `/payment-schedules/${scheduleId}/generate-transactions`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, scheduleId) => [
        { type: 'PaymentSchedule', id: scheduleId },
        { type: 'BillingTransaction', id: 'LIST' },
      ],
    }),

    // Update payment schedule status
    updatePaymentScheduleStatus: builder.mutation({
      query: ({ scheduleId, status }) => ({
        url: `/payment-schedules/${scheduleId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { scheduleId }) => [
        { type: 'PaymentSchedule', id: scheduleId },
        { type: 'PaymentSchedule', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPaymentSchedulesQuery,
  useGetPaymentScheduleQuery,
  useCreatePaymentScheduleMutation,
  useUpdatePaymentScheduleMutation,
  useDeletePaymentScheduleMutation,
  useGeneratePaymentTransactionsMutation,
  useUpdatePaymentScheduleStatusMutation,
} = paymentSchedulesApi;