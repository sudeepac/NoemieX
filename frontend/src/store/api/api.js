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
    'Agency', 
    'OfferLetter', 
    'PaymentScheduleItem', 
    'BillingTransaction',
    'BillingEventHistory'
  ],
  endpoints: (builder) => ({
    // Get all agencies
    getAgencies: builder.query({
      query: (params = {}) => ({
        url: '/agencies',
        method: 'GET',
        params,
      }),
      providesTags: (result) => [
        { type: 'Agency', id: 'LIST' },
        ...(result?.agencies || []).map(({ _id }) => ({
          type: 'Agency',
          id: _id,
        })),
      ],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useGetAgenciesQuery,
} = api;

export default api;