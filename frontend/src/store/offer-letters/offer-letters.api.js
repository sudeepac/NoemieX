import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create the offer letters API slice
export const offerLettersApi = createApi({
  reducerPath: 'offerLettersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/offer-letters',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['OfferLetter', 'OfferLetterStats'],
  endpoints: (builder) => ({
    // Get all offer letters with filtering and pagination
    getOfferLetters: builder.query({
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
        result?.offerLetters
          ? [
              ...result.offerLetters.map(({ _id }) => ({ type: 'OfferLetter', id: _id })),
              { type: 'OfferLetter', id: 'LIST' },
            ]
          : [{ type: 'OfferLetter', id: 'LIST' }],
    }),

    // Get single offer letter by ID
    getOfferLetter: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'OfferLetter', id }],
    }),

    // Create new offer letter
    createOfferLetter: builder.mutation({
      query: (offerLetterData) => ({
        url: '',
        method: 'POST',
        body: offerLetterData,
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }, { type: 'OfferLetterStats' }],
    }),

    // Update offer letter
    updateOfferLetter: builder.mutation({
      query: ({ id, ...offerLetterData }) => ({
        url: `/${id}`,
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
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }, { type: 'OfferLetterStats' }],
    }),

    // Update offer letter status
    updateOfferLetterStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
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
        url: `/${id}/replace`,
        method: 'POST',
        body: { reason, ...newOfferLetterData },
      }),
      invalidatesTags: [{ type: 'OfferLetter', id: 'LIST' }, { type: 'OfferLetterStats' }],
    }),

    // Add document to offer letter
    addDocument: builder.mutation({
      query: ({ id, name, url }) => ({
        url: `/${id}/documents`,
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
  }),
});

// Export hooks for usage in functional components
export const {
  useGetOfferLettersQuery,
  useGetOfferLetterQuery,
  useCreateOfferLetterMutation,
  useUpdateOfferLetterMutation,
  useDeleteOfferLetterMutation,
  useUpdateOfferLetterStatusMutation,
  useReplaceOfferLetterMutation,
  useAddDocumentMutation,
  useGetOfferLetterStatsQuery,
} = offerLettersApi;

// AI-NOTE: Created RTK Query API slice for offer letters with all CRUD operations, status management, document handling, and statistics following project conventions