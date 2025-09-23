import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../shared/ProtectedRoute';
import {
  SuperadminPortal,
  SuperadminDashboard,
  SuperadminAccountManagement,
  SuperadminUserManagement,
  SystemSettings,
  PlatformAnalytics
} from '../shared/LazyComponents';
import SuperadminSubscriptionManagement from '../../pages/subscriptions/SuperadminSubscriptionManagement';

// Import model routes
import UsersRoutes from '../models/UsersRoutes';
import AccountsRoutes from '../models/AccountsRoutes';
import AgenciesRoutes from '../models/AgenciesRoutes';
import OfferLettersRoutes from '../models/OfferLettersRoutes';
import PaymentSchedulesRoutes from '../models/PaymentSchedulesRoutes';
import BillingTransactionsRoutes from '../models/BillingTransactionsRoutes';
import BillingEventHistoriesRoutes from '../models/BillingEventHistoriesRoutes';

/**
 * SuperadminRoutes - Routes for Superadmin Portal
 * 
 * Handles:
 * - Superadmin dashboard and management pages
 * - All model-based CRUD operations
 * - System-wide settings and analytics
 * 
 * // AI-NOTE: Superadmin portal routes with full system access.
 * // Includes all model routes since superadmin has complete access.
 * // Protected by portal-specific authentication check.
 */
const SuperadminRoutes = () => {
  return (
    <ProtectedRoute requiredPortal="superadmin">
      <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
        <Routes>
          {/* Portal Layout */}
          <Route path="/" element={<SuperadminPortal />}>
            {/* Dashboard */}
            <Route index element={<SuperadminDashboard />} />
            
            {/* Management Pages */}
            <Route path="users" element={<SuperadminUserManagement />} />
            <Route path="settings" element={<SystemSettings />} />
            <Route path="security" element={<div>Security & Compliance - Coming Soon</div>} />
            <Route path="database" element={<div>Data Management - Coming Soon</div>} />
            <Route path="analytics" element={<PlatformAnalytics />} />
            <Route path="subscriptions" element={<SuperadminSubscriptionManagement />} />
            
            {/* Model Routes - Full Access */}
            <Route path="users/*" element={<UsersRoutes />} />
            <Route path="accounts/*" element={<AccountsRoutes />} />
            <Route path="agencies/*" element={<AgenciesRoutes />} />
            <Route path="offer-letters/*" element={<OfferLettersRoutes />} />
            <Route path="payment-schedules/*" element={<PaymentSchedulesRoutes />} />
            <Route path="billing-transactions/*" element={<BillingTransactionsRoutes />} />
            <Route path="billing-event-histories/*" element={<BillingEventHistoriesRoutes />} />
          </Route>
        </Routes>
      </Suspense>
    </ProtectedRoute>
  );
};

export default SuperadminRoutes;