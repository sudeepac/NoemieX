import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './apiSlice';

// Import client-state-only slices
import authReducer from './slices/auth.slice';
import paymentSchedulesUiReducer from './slices/paymentSchedulesUi.slice';
import offerLettersUiReducer from './slices/offerLettersUi.slice';
import billingTransactionsUiReducer from './slices/billingTransactionsUi.slice';
import billingEventHistoriesUiReducer from './slices/billingEventHistoriesUi.slice';
import agenciesUiReducer from './slices/agenciesUi.slice';

// Import all API endpoints to ensure they are injected
import './api';

// AI-NOTE: Store setup - READ /store/README.md for our strict patterns and rules
// Key: Single API slice + client-state-only slices, never mix server data with client state
export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Client state slices only (no server data)
    auth: authReducer,
    paymentSchedulesUi: paymentSchedulesUiReducer,
    offerLettersUi: offerLettersUiReducer,
    billingTransactionsUi: billingTransactionsUiReducer,
    billingEventHistoriesUi: billingEventHistoriesUiReducer,
    agenciesUi: agenciesUiReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;