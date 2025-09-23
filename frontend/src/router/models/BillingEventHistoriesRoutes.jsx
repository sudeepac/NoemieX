import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  BillingEventHistoriesList,
  BillingEventHistoryDetail,
  BillingEventHistoryCreate,
  BillingEventHistoryEdit
} from '../shared/LazyComponents';

/**
 * BillingEventHistoriesRoutes - Model-based routes for Billing Event Histories CRUD operations
 * 
 * Route Structure:
 * - /billing-event-histories -> List all billing event histories
 * - /billing-event-histories/create -> Create new billing event history
 * - /billing-event-histories/:id -> View billing event history details
 * - /billing-event-histories/:id/edit -> Edit billing event history
 * 
 * // AI-NOTE: Billing Event Histories model routes following RESTful patterns and Redux slice structure.
 * // Aligned with billingEventHistoriesSlice actions: fetchBillingEventHistories, createBillingEventHistory, updateBillingEventHistory, deleteBillingEventHistory.
 * // Each route corresponds to specific CRUD operations as defined in MODEL_ROUTES_MAPPING.md.
 */
const BillingEventHistoriesRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Billing Event Histories...</div>}>
      <Routes>
        {/* List View - GET /billing-event-histories */}
        <Route index element={<BillingEventHistoriesList />} />
        
        {/* Create View - POST /billing-event-histories */}
        <Route path="create" element={<BillingEventHistoryCreate />} />
        
        {/* Detail View - GET /billing-event-histories/:id */}
        <Route path=":id" element={<BillingEventHistoryDetail />} />
        
        {/* Edit View - PUT /billing-event-histories/:id */}
        <Route path=":id/edit" element={<BillingEventHistoryEdit />} />
      </Routes>
    </Suspense>
  );
};

export default BillingEventHistoriesRoutes;