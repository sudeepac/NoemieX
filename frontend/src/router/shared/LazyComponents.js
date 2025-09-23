import { lazy } from 'react';

// AI-NOTE: Centralized lazy loading for all route components following React Router v6 best practices.
// Organized by category for better maintainability. All components are lazy-loaded for optimal performance.
// When adding new pages, add them here and export from the appropriate category.

// ============================================================================
// PORTAL COMPONENTS
// ============================================================================
export const SuperadminPortal = lazy(() => import('../../portals/SuperadminPortal'));
export const AccountPortal = lazy(() => import('../../portals/AccountPortal'));
export const AgencyPortal = lazy(() => import('../../portals/AgencyPortal'));

// ============================================================================
// PUBLIC PAGES (No Authentication Required)
// ============================================================================
export const LoginPage = lazy(() => import('../../pages/auth/login.page'));
export const RegisterPage = lazy(() => import('../../pages/auth/register.page'));
export const ForgotPasswordPage = lazy(() => import('../../pages/auth/forgot-password.page'));
export const LandingPage = lazy(() => import('../../pages/landing/landing.page'));

// ============================================================================
// PORTAL DASHBOARD PAGES
// ============================================================================
export const SuperadminDashboard = lazy(() => import('../../pages/common/SuperadminDashboard'));
export const AccountDashboard = lazy(() => import('../../pages/common/AccountDashboard'));
export const AgencyDashboard = lazy(() => import('../../pages/common/AgencyDashboard'));

// ============================================================================
// COMMON PORTAL PAGES
// ============================================================================
export const SystemSettings = lazy(() => import('../../pages/common/SystemSettings'));
export const PlatformAnalytics = lazy(() => import('../../pages/common/PlatformAnalytics'));
export const ReportsAnalytics = lazy(() => import('../../pages/common/ReportsAnalytics'));

// ============================================================================
// PORTAL-SPECIFIC MANAGEMENT PAGES
// ============================================================================
// Superadmin Portal
export const SuperadminAccountManagement = lazy(() => import('../../pages/accounts/SuperadminAccountManagement'));

// Account Portal
export const AgencyManagement = lazy(() => import('../../pages/accounts/AgencyManagement'));
export const StudentManagement = lazy(() => import('../../pages/students/AccountStudentManagement'));
export const OfferLetterManagement = lazy(() => import('../../pages/offer-letters/AccountOfferLetterManagement'));
export const PaymentManagement = lazy(() => import('../../pages/payment-schedules/AccountPaymentManagement'));

// Agency Portal
export const AgencyStudentManagement = lazy(() => import('../../pages/students/AgencyStudentManagement'));
export const AgencyOfferLetterManagement = lazy(() => import('../../pages/offer-letters/AgencyOfferLetterManagement'));
export const AgencyPaymentManagement = lazy(() => import('../../pages/payment-schedules/AgencyPaymentManagement'));
export const CommissionTracking = lazy(() => import('../../pages/billing-transactions/CommissionTracking'));

// ============================================================================
// MODEL-BASED CRUD PAGES
// ============================================================================

// Users Model
export const UsersList = lazy(() => import('../../pages/users/UsersList'));
export const UserDetail = lazy(() => import('../../pages/users/UserDetail'));
export const UserCreate = lazy(() => import('../../pages/users/UserCreate'));
export const UserEdit = lazy(() => import('../../pages/users/UserEdit'));
export const UserProfile = lazy(() => import('../../pages/users/UserProfile'));

// Accounts Model
export const AccountsList = lazy(() => import('../../pages/accounts/AccountsList'));
export const AccountDetail = lazy(() => import('../../pages/accounts/AccountDetail'));
export const AccountCreate = lazy(() => import('../../pages/accounts/AccountCreate'));
export const AccountEdit = lazy(() => import('../../pages/accounts/AccountEdit'));
export const AccountBilling = lazy(() => import('../../pages/accounts/AccountBilling'));
export const AccountStats = lazy(() => import('../../pages/accounts/AccountStats'));

// Agencies Model
export const AgenciesList = lazy(() => import('../../pages/agencies/AgenciesList'));
export const AgencyDetail = lazy(() => import('../../pages/agencies/AgencyDetail'));
export const AgencyCreate = lazy(() => import('../../pages/agencies/AgencyCreate'));
export const AgencyEdit = lazy(() => import('../../pages/agencies/AgencyEdit'));

// Offer Letters Model
export const OfferLettersList = lazy(() => import('../../pages/offer-letters/OfferLettersList'));
export const OfferLetterDetail = lazy(() => import('../../pages/offer-letters/OfferLetterDetail'));
export const OfferLetterCreate = lazy(() => import('../../pages/offer-letters/OfferLetterCreate'));
export const OfferLetterEdit = lazy(() => import('../../pages/offer-letters/OfferLetterEdit'));

// Payment Schedules Model
export const PaymentSchedulesList = lazy(() => import('../../pages/payment-schedules/PaymentSchedulesList'));
export const PaymentScheduleDetail = lazy(() => import('../../pages/payment-schedules/PaymentScheduleDetail'));
export const PaymentScheduleCreate = lazy(() => import('../../pages/payment-schedules/PaymentScheduleCreate'));
export const PaymentScheduleEdit = lazy(() => import('../../pages/payment-schedules/PaymentScheduleEdit'));

// Billing Transactions Model
export const BillingTransactionsList = lazy(() => import('../../pages/billing-transactions/BillingTransactionsList'));
export const BillingTransactionDetail = lazy(() => import('../../pages/billing-transactions/BillingTransactionDetail'));
export const BillingTransactionCreate = lazy(() => import('../../pages/billing-transactions/BillingTransactionCreate'));
export const BillingTransactionEdit = lazy(() => import('../../pages/billing-transactions/BillingTransactionEdit'));

// Billing Event Histories Model
export const BillingEventHistoriesList = lazy(() => import('../../pages/billing-event-histories/BillingEventHistoriesList'));
export const BillingEventHistoryDetail = lazy(() => import('../../pages/billing-event-histories/BillingEventHistoryDetail'));
export const BillingEventHistoryCreate = lazy(() => import('../../pages/billing-event-histories/BillingEventHistoryCreate'));
export const BillingEventHistoryEdit = lazy(() => import('../../pages/billing-event-histories/BillingEventHistoryEdit'));