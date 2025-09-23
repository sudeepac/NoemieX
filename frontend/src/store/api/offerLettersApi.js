import { apiSlice } from '../apiSlice';

// AI-NOTE: Offer Letters API endpoints injected into main API slice following official RTK Query pattern
export const offerLettersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all offer letters with filtering and pagination
    getOfferLetters: builder.query({
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
        if (params.candidateId) searchParams.append('candidateId', params.candidateId);
        if (params.startDate) searchParams.append('startDate', params.startDate);
        if (params.endDate) searchParams.append('endDate', params.endDate);
        
        // Add sorting parameters
        if (params.sortBy) searchParams.append('sortBy', params.sortBy);
        if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
        
        return `/offer-letters?${searchParams}`;
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.offerLetters.map(({ id }) => ({ type: 'OfferLetter', id })),
              { type: 'OfferLetter', id: 'LIST' },
            ]
          : [{ type: 'OfferLetter', id: 'LIST' }],
    }),

    // Get single offer letter by ID
    getOfferLetter: builder.query({
      query: (letterId) => `/offer-letters/${letterId}`,
      providesTags: (result, error, id) => [{ type: 'OfferLetter', id }],
    }),

    // Create new offer letter
    createOfferLetter: builder.mutation({
      query: (newLetter) => ({
        url: '/offer-letters',
        method: 'POST',
        body: newLetter,
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }],
    }),

    // Update offer letter
    updateOfferLetter: builder.mutation({
      query: ({ letterId, ...patch }) => ({
        url: `/offer-letters/${letterId}`,
        method: 'PUT',
        body: patch,
      }),
      invalidatesTags: (result, error, { letterId }) => [
        { type: 'OfferLetter', id: letterId },
        { type: 'OfferLetter', id: 'LIST' },
      ],
    }),

    // Delete offer letter
    deleteOfferLetter: builder.mutation({
      query: (letterId) => ({
        url: `/offer-letters/${letterId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, letterId) => [
        { type: 'OfferLetter', id: letterId },
        { type: 'OfferLetter', id: 'LIST' },
      ],
    }),

    // Send offer letter
    sendOfferLetter: builder.mutation({
      query: (letterId) => ({
        url: `/offer-letters/${letterId}/send`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, letterId) => [
        { type: 'OfferLetter', id: letterId },
        { type: 'OfferLetter', id: 'LIST' },
      ],
    }),

    // Accept offer letter
    acceptOfferLetter: builder.mutation({
      query: ({ letterId, signature }) => ({
        url: `/offer-letters/${letterId}/accept`,
        method: 'POST',
        body: { signature },
      }),
      invalidatesTags: (result, error, { letterId }) => [
        { type: 'OfferLetter', id: letterId },
        { type: 'OfferLetter', id: 'LIST' },
      ],
    }),

    // Reject offer letter
    rejectOfferLetter: builder.mutation({
      query: ({ letterId, reason }) => ({
        url: `/offer-letters/${letterId}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (result, error, { letterId }) => [
        { type: 'OfferLetter', id: letterId },
        { type: 'OfferLetter', id: 'LIST' },
      ],
    }),

    // Generate offer letter PDF
    generateOfferLetterPDF: builder.mutation({
      query: (letterId) => ({
        url: `/offer-letters/${letterId}/pdf`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, letterId) => [
        { type: 'OfferLetter', id: letterId },
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetOfferLettersQuery,
  useGetOfferLetterQuery,
  useCreateOfferLetterMutation,
  useUpdateOfferLetterMutation,
  useDeleteOfferLetterMutation,
  useSendOfferLetterMutation,
  useAcceptOfferLetterMutation,
  useRejectOfferLetterMutation,
  useGenerateOfferLetterPDFMutation,
} = offerLettersApi;