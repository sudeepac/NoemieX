import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../shared/ProtectedRoute';
import {
  AgencyPortal,
  AgencyDashboard,
  AgencyStudentManagement,
  AgencyOfferLetterManagement,
  AgencyPaymentManagement,
  CommissionTracking,
  SystemSettings,
  ReportsAnalytics
} from '../shared/LazyComponents';

// Import relevant model routes for Agency portal
import OfferLettersRoutes from '../models/OfferLettersRoutes';
import PaymentSchedulesRoutes from '../models/PaymentSchedulesRoutes';
import BillingTransactionsRoutes from '../models/BillingTransactionsRoutes';

/**
 * AgencyRoutes - Routes for Agency Portal
 * 
 * Handles:
 * - Agency dashboard and management pages
 * - Student management for this agency
 * - Offer letter and payment operations
 * - Commission tracking and billing
 * 
 * // AI-NOTE: Agency portal routes with agency-scoped access.
 * // Limited to managing students, offer letters, and tracking commissions for this agency.
 * // Protected by portal-specific authentication check.
 */
const AgencyRoutes = () => {
  return (
    <ProtectedRoute requiredPortal="agency">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          {/* Portal Layout */}
          <Route path="/" element={<AgencyPortal />}>
            {/* Dashboard */}
            <Route index element={<AgencyDashboard />} />
            
            {/* Management Pages */}
            <Route path="student-management" element={<AgencyStudentManagement />} />
            <Route path="offer-letter-management" element={<AgencyOfferLetterManagement />} />
            <Route path="payment-management" element={<AgencyPaymentManagement />} />
            <Route path="commission-tracking" element={<CommissionTracking />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="reports-analytics" element={<ReportsAnalytics />} />
            
            {/* Model Routes - Agency Scoped */}
            <Route path="offer-letters/*" element={<OfferLettersRoutes />} />
            <Route path="payment-schedules/*" element={<PaymentSchedulesRoutes />} />
            <Route path="billing-transactions/*" element={<BillingTransactionsRoutes />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default AgencyRoutes;