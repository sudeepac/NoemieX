import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  BillingTransactionsList,
  BillingTransactionDetail,
  BillingTransactionCreate,
  BillingTransactionEdit
} from '../shared/LazyComponents';

/**
 * BillingTransactionsRoutes - Model-based routes for Billing Transactions CRUD operations
 * 
 * Route Structure:
 * - /billing-transactions -> List all billing transactions
 * - /billing-transactions/create -> Create new billing transaction
 * - /billing-transactions/:id -> View billing transaction details
 * - /billing-transactions/:id/edit -> Edit billing transaction
 * 
 * // AI-NOTE: Billing Transactions model routes following RESTful patterns and Redux slice structure.
 * // Aligned with billingTransactionsSlice actions: fetchBillingTransactions, createBillingTransaction, updateBillingTransaction, deleteBillingTransaction.
 * // Each route corresponds to specific CRUD operations as defined in MODEL_ROUTES_MAPPING.md.
 */
const BillingTransactionsRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Billing Transactions...</div>}>
      <Routes>
        {/* List View - GET /billing-transactions */}
        <Route index element={<BillingTransactionsList />} />
        
        {/* Create View - POST /billing-transactions */}
        <Route path="create" element={<BillingTransactionCreate />} />
        
        {/* Detail View - GET /billing-transactions/:id */}
        <Route path=":id" element={<BillingTransactionDetail />} />
        
        {/* Edit View - PUT /billing-transactions/:id */}
        <Route path=":id/edit" element={<BillingTransactionEdit />} />
      </Routes>
    </Suspense>
  );
};

export default BillingTransactionsRoutes;