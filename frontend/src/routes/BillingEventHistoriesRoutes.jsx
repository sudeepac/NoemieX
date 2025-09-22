import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load billing event history components
const BillingEventHistoriesList = lazy(() => import('../pages/billing-event-histories/BillingEventHistoriesList'));
const BillingEventHistoryDetail = lazy(() => import('../pages/billing-event-histories/BillingEventHistoryDetail'));
const BillingEventHistoryCreate = lazy(() => import('../pages/billing-event-histories/BillingEventHistoryCreate'));
const BillingEventHistoryEdit = lazy(() => import('../pages/billing-event-histories/BillingEventHistoryEdit'));
const OverdueBillingEventHistories = lazy(() => import('../pages/billing-event-histories/OverdueBillingEventHistories'));
const UpcomingBillingEventHistories = lazy(() => import('../pages/billing-event-histories/UpcomingBillingEventHistories'));
const BillingEventHistoryStats = lazy(() => import('../pages/billing-event-histories/BillingEventHistoryStats'));
const GenerateTransactions = lazy(() => import('../pages/billing-event-histories/GenerateTransactions'));

/**
 * Billing Event Histories Routes - Model-driven routing for Billing Event History CRUD operations
 * Aligned with billing-event-histories.slice.js async thunks:
 * - fetchBillingEventHistories, fetchBillingEventHistoryById, createBillingEventHistory, 
 *   updateBillingEventHistory, deleteBillingEventHistory, approveBillingEventHistory,
 *   retireBillingEventHistory, replaceBillingEventHistory, completeBillingEventHistory,
 *   cancelBillingEventHistory, fetchOverdueBillingEventHistories, fetchUpcomingBillingEventHistories,
 *   generateTransactions, generateRecurringBillingEventHistories, fetchBillingEventHistoryStats
 */
const BillingEventHistoriesRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading billing event histories..." />}>
      <Routes>
        {/* Billing Event Histories List - GET /billing-event-histories */}
        <Route index element={<BillingEventHistoriesList />} />
        
        {/* Create Billing Event History - POST /billing-event-histories */}
        <Route path="create" element={<BillingEventHistoryCreate />} />
        
        {/* Overdue Items - GET /billing-event-histories/overdue */}
        <Route path="overdue" element={<OverdueBillingEventHistories />} />
        
        {/* Upcoming Items - GET /billing-event-histories/upcoming */}
        <Route path="upcoming" element={<UpcomingBillingEventHistories />} />
        
        {/* Statistics - GET /billing-event-histories/stats */}
        <Route path="stats" element={<BillingEventHistoryStats />} />
        
        {/* Generate Transactions - POST /billing-event-histories/generate-transactions */}
        <Route path="generate-transactions" element={<GenerateTransactions />} />
        
        {/* Billing Event History Detail - GET /billing-event-histories/:id */}
        <Route path=":billingEventHistoryId" element={<BillingEventHistoryDetail />} />
        
        {/* Edit Billing Event History - PUT /billing-event-histories/:id */}
        <Route path=":billingEventHistoryId/edit" element={<BillingEventHistoryEdit />} />
        
        {/* Redirect unknown routes to billing event histories list */}
        <Route path="*" element={<Navigate to="/billing-event-histories" replace />} />
      </Routes>
    </Suspense>
  );
};

export default BillingEventHistoriesRoutes;