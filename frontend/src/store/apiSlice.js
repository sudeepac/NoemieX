import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// AI-NOTE: Main API slice - READ /store/README.md for our strict RTK Query setup patterns
// This is the single source of truth for all server data - never create additional API slices
// Base query with authentication and token refresh logic
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

// Define a service using a base URL and expected endpoints
export const apiSlice = createApi({
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
    // This will be extended by individual API files using injectEndpoints
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {} = apiSlice;