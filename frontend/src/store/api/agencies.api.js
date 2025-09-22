import { api } from './api';

// Agencies API slice with all CRUD operations
export const agenciesApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

// Export hooks for use in components
export const {
  useGetAgenciesQuery,
  useGetAgencyQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useDeleteAgencyMutation,
  useToggleAgencyStatusMutation,
  useGetAgencyStatsQuery,
  useUpdateAgencyPerformanceMutation,
} = agenciesApi;

// AI-NOTE: Created comprehensive agencies API slice with all CRUD operations,
// filtering, pagination, and performance tracking endpoints matching backend controller methods