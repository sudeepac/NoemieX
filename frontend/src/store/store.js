import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/api';
import { offerLettersApi } from './offer-letters/offer-letters.api';
import { paymentSchedulesApi } from './payment-schedules/payment-schedules.api';
import authReducer from './slices/auth.slice';
import agenciesReducer from './slices/agencies.slice';
import offerLettersReducer from './offer-letters/offer-letters.slice';
import paymentSchedulesReducer from './payment-schedules/payment-schedules.slice';
import billingTransactionsReducer from './billing-transactions/billing-transactions.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    agencies: agenciesReducer,
    offerLetters: offerLettersReducer,
    paymentSchedules: paymentSchedulesReducer,
    billingTransactions: billingTransactionsReducer,
    [api.reducerPath]: api.reducer,
    [offerLettersApi.reducerPath]: offerLettersApi.reducer,
    [paymentSchedulesApi.reducerPath]: paymentSchedulesApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware, offerLettersApi.middleware, paymentSchedulesApi.middleware),
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;