import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load billing transaction components
const BillingTransactionsList = lazy(() => import('../pages/billing-transactions/BillingTransactionsList'));
const BillingTransactionDetail = lazy(() => import('../pages/billing-transactions/BillingTransactionDetail'));
const CommissionTracking = lazy(() => import('../pages/billing-transactions/CommissionTracking'));
const TransactionReports = lazy(() => import('../pages/billing-transactions/TransactionReports'));

/**
 * Billing Transactions Routes - Model-driven routing for Billing Transaction operations
 * Aligned with billing-transactions.slice.js async thunks
 */
const BillingTransactionsRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading billing transactions..." />}>
      <Routes>
        {/* Billing Transactions List - GET /billing-transactions */}
        <Route index element={<BillingTransactionsList />} />
        
        {/* Commission Tracking - GET /billing-transactions/commissions */}
        <Route path="commissions" element={<CommissionTracking />} />
        
        {/* Transaction Reports */}
        <Route path="reports" element={<TransactionReports />} />
        
        {/* Billing Transaction Detail - GET /billing-transactions/:id */}
        <Route path=":transactionId" element={<BillingTransactionDetail />} />
        
        {/* Redirect unknown routes to billing transactions list */}
        <Route path="*" element={<Navigate to="/billing-transactions" replace />} />
      </Routes>
    </Suspense>
  );
};

export default BillingTransactionsRoutes;