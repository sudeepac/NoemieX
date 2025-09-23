import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../shared/ProtectedRoute';
import {
  AccountPortal,
  AccountDashboard,
  AgencyManagement,
  StudentManagement,
  OfferLetterManagement,
  PaymentManagement,
  SystemSettings,
  ReportsAnalytics
} from '../shared/LazyComponents';

// Import relevant model routes for Account portal
import AgenciesRoutes from '../models/AgenciesRoutes';
import OfferLettersRoutes from '../models/OfferLettersRoutes';
import PaymentSchedulesRoutes from '../models/PaymentSchedulesRoutes';
import BillingTransactionsRoutes from '../models/BillingTransactionsRoutes';

/**
 * AccountRoutes - Routes for Account Portal
 * 
 * Handles:
 * - Account dashboard and management pages
 * - Agency management under this account
 * - Student and offer letter management
 * - Payment and billing operations
 * 
 * // AI-NOTE: Account portal routes with account-scoped access.
 * // Limited to managing agencies, students, and billing under this account.
 * // Protected by portal-specific authentication check.
 */
const AccountRoutes = () => {
  return (
    <ProtectedRoute requiredPortal="account">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          {/* Portal Layout */}
          <Route path="/" element={<AccountPortal />}>
            {/* Dashboard */}
            <Route index element={<AccountDashboard />} />
            
            {/* Management Pages */}
            <Route path="agency-management" element={<AgencyManagement />} />
            <Route path="student-management" element={<StudentManagement />} />
            <Route path="offer-letter-management" element={<OfferLetterManagement />} />
            <Route path="payment-management" element={<PaymentManagement />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="reports-analytics" element={<ReportsAnalytics />} />
            
            {/* Model Routes - Account Scoped */}
            <Route path="agencies/*" element={<AgenciesRoutes />} />
            <Route path="offer-letters/*" element={<OfferLettersRoutes />} />
            <Route path="payment-schedules/*" element={<PaymentSchedulesRoutes />} />
            <Route path="billing-transactions/*" element={<BillingTransactionsRoutes />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default AccountRoutes;