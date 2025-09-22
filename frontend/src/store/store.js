import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/api';

// Import slices - all slices are now in the centralized slices folder
import authReducer from './slices/auth.slice';
import accountsReducer from './slices/accounts.slice';
import agenciesReducer from './slices/agencies.slice';
import billingEventHistoriesReducer from './slices/billing-event-histories.slice';
import offerLettersReducer from './slices/offer-letters.slice';
import paymentSchedulesReducer from './slices/payment-schedules.slice';
import billingTransactionsReducer from './slices/billing-transactions.slice';
import usersReducer from './slices/users.slice';

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [api.reducerPath]: api.reducer,
    // Traditional slices for local state management
    auth: authReducer,
    accounts: accountsReducer,
    agencies: agenciesReducer,
    offerLetters: offerLettersReducer,
    paymentSchedules: paymentSchedulesReducer,
    billingTransactions: billingTransactionsReducer,
    billingEventHistories: billingEventHistoriesReducer,
    users: usersReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    });
    return defaultMiddleware.concat(api.middleware);
  },
});

// Optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

// Export types for TypeScript (if needed)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;