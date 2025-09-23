import { apiSlice } from '../apiSlice';

// AI-NOTE: Agencies API endpoints injected into main API slice following official RTK Query pattern
export const agenciesApi = apiSlice.injectEndpoints({
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
        
        return `/agencies?${searchParams}`;
      },
      // AI-NOTE: Fixed API response structure - backend returns data in result.data, not result.agencies
      providesTags: (result, error, arg) =>
        result?.data
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Agency', id: _id })),
              { type: 'Agency', id: 'LIST' },
            ]
          : [{ type: 'Agency', id: 'LIST' }],
    }),

    // Get single agency by ID
    getAgency: builder.query({
      query: (agencyId) => `/agencies/${agencyId}`,
      providesTags: (result, error, id) => [{ type: 'Agency', id }],
    }),

    // Create new agency
    createAgency: builder.mutation({
      query: (newAgency) => ({
        url: '/agencies',
        method: 'POST',
        body: newAgency,
      }),
      invalidatesTags: [{ type: 'Agency', id: 'LIST' }],
    }),

    // Update agency
    updateAgency: builder.mutation({
      query: ({ agencyId, ...patch }) => ({
        url: `/agencies/${agencyId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { agencyId }) => [
        { type: 'Agency', id: agencyId },
        { type: 'Agency', id: 'LIST' },
      ],
    }),

    // Delete agency
    deleteAgency: builder.mutation({
      query: (agencyId) => ({
        url: `/agencies/${agencyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, agencyId) => [
        { type: 'Agency', id: agencyId },
        { type: 'Agency', id: 'LIST' },
      ],
    }),

    // Toggle agency status
    toggleAgencyStatus: builder.mutation({
      query: (agencyId) => ({
        url: `/agencies/${agencyId}/toggle-status`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, agencyId) => [
        { type: 'Agency', id: agencyId },
        { type: 'Agency', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAgenciesQuery,
  useGetAgencyQuery,
  useCreateAgencyMutation,
  useUpdateAgencyMutation,
  useDeleteAgencyMutation,
  useToggleAgencyStatusMutation,
} = agenciesApi;