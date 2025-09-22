import { lazy } from 'react';

// Portal Components - Lazy loaded for better performance
export const SuperadminPortal = lazy(() => import('../portals/SuperadminPortal'));
export const AccountPortal = lazy(() => import('../portals/AccountPortal'));
export const AgencyPortal = lazy(() => import('../portals/AgencyPortal'));

// Public Pages
export const LoginPage = lazy(() => import('../pages/auth/login.page'));
export const RegisterPage = lazy(() => import('../pages/auth/register.page'));
export const ForgotPasswordPage = lazy(() => import('../pages/auth/forgot-password.page'));

// Common Portal Pages
export const SuperadminDashboard = lazy(() => import('../pages/common/SuperadminDashboard'));
export const AccountDashboard = lazy(() => import('../pages/common/AccountDashboard'));
export const AgencyDashboard = lazy(() => import('../pages/common/AgencyDashboard'));
export const SystemSettings = lazy(() => import('../pages/common/SystemSettings'));
export const PlatformAnalytics = lazy(() => import('../pages/common/PlatformAnalytics'));
export const ReportsAnalytics = lazy(() => import('../pages/common/ReportsAnalytics'));

// Account Model Pages
export const SuperadminAccountManagement = lazy(() => import('../pages/accounts/SuperadminAccountManagement'));
export const AgencyManagement = lazy(() => import('../pages/accounts/AgencyManagement'));

// Student Model Pages
export const StudentManagement = lazy(() => import('../pages/students/AccountStudentManagement'));
export const AgencyStudentManagement = lazy(() => import('../pages/students/AgencyStudentManagement'));

// Offer Letter Model Pages
export const OfferLetterManagement = lazy(() => import('../pages/offer-letters/AccountOfferLetterManagement'));
export const AgencyOfferLetterManagement = lazy(() => import('../pages/offer-letters/AgencyOfferLetterManagement'));

// Payment Schedule Model Pages
export const PaymentManagement = lazy(() => import('../pages/payment-schedules/AccountPaymentManagement'));
export const AgencyPaymentManagement = lazy(() => import('../pages/payment-schedules/AgencyPaymentManagement'));

// Billing Transaction Model Pages
export const CommissionTracking = lazy(() => import('../pages/billing-transactions/CommissionTracking'));