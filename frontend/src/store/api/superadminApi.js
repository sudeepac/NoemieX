import { apiSlice } from '../apiSlice';

// AI-NOTE: SuperAdmin platform management API endpoints for system-wide statistics and operations
export const superadminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get platform-wide statistics
    getPlatformStats: builder.query({
      query: () => '/superadmin/platform-stats',
      providesTags: ['PlatformStats'],
    }),

    // Get platform health status
    getPlatformHealth: builder.query({
      query: () => '/superadmin/platform-health',
      providesTags: ['PlatformHealth'],
    }),

    // Get recent platform activity
    getRecentActivity: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.limit) searchParams.append('limit', params.limit);
        if (params.type) searchParams.append('type', params.type);
        return `/superadmin/recent-activity?${searchParams}`;
      },
      providesTags: ['PlatformActivity'],
    }),

    // Get system metrics
    getSystemMetrics: builder.query({
      query: (timeframe = '24h') => `/superadmin/system-metrics?timeframe=${timeframe}`,
      providesTags: ['SystemMetrics'],
    }),

    // Get billing overview
    getBillingOverview: builder.query({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        if (params.period) searchParams.append('period', params.period);
        return `/superadmin/billing-overview?${searchParams}`;
      },
      providesTags: ['BillingOverview'],
    }),

    // Get subscription analytics
    getSubscriptionAnalytics: builder.query({
      query: () => '/superadmin/subscription-analytics',
      providesTags: ['SubscriptionAnalytics'],
    }),

    // Update platform settings
    updatePlatformSettings: builder.mutation({
      query: (settings) => ({
        url: '/superadmin/platform-settings',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: ['PlatformSettings'],
    }),

    // Get platform settings
    getPlatformSettings: builder.query({
      query: () => '/superadmin/platform-settings',
      providesTags: ['PlatformSettings'],
    }),

    // Bulk account operations
    bulkAccountOperation: builder.mutation({
      query: ({ operation, accountIds, data }) => ({
        url: '/superadmin/bulk-accounts',
        method: 'POST',
        body: { operation, accountIds, data },
      }),
      invalidatesTags: [{ type: 'Account', id: 'LIST' }, 'PlatformStats'],
    }),

    // Export platform data
    exportPlatformData: builder.mutation({
      query: (exportConfig) => ({
        url: '/superadmin/export-data',
        method: 'POST',
        body: exportConfig,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetPlatformStatsQuery,
  useGetPlatformHealthQuery,
  useGetRecentActivityQuery,
  useGetSystemMetricsQuery,
  useGetBillingOverviewQuery,
  useGetSubscriptionAnalyticsQuery,
  useUpdatePlatformSettingsMutation,
  useGetPlatformSettingsQuery,
  useBulkAccountOperationMutation,
  useExportPlatformDataMutation,
} = superadminApi;