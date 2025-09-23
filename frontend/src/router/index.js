// AI-NOTE: Main router exports following React Router v6 best practices.
// Centralized exports for all routing components with clear organization.
// Use this file to import routing components throughout the application.

// Main App Router
export { default as AppRoutes } from './AppRoutes';

// Public Routes
export { default as PublicRoutes } from './public/PublicRoutes';

// Portal Routes
export { default as SuperadminRoutes } from './portals/SuperadminRoutes';
export { default as AccountRoutes } from './portals/AccountRoutes';
export { default as AgencyRoutes } from './portals/AgencyRoutes';

// Model Routes
export { default as UsersRoutes } from './models/UsersRoutes';
export { default as AccountsRoutes } from './models/AccountsRoutes';
export { default as AgenciesRoutes } from './models/AgenciesRoutes';
export { default as OfferLettersRoutes } from './models/OfferLettersRoutes';
export { default as PaymentSchedulesRoutes } from './models/PaymentSchedulesRoutes';
export { default as BillingTransactionsRoutes } from './models/BillingTransactionsRoutes';
export { default as BillingEventHistoriesRoutes } from './models/BillingEventHistoriesRoutes';

// Shared Components
export { default as ProtectedRoute } from './shared/ProtectedRoute';
export * from './shared/LazyComponents';