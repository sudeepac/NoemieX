import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  PaymentSchedulesList,
  PaymentScheduleDetail,
  PaymentScheduleCreate,
  PaymentScheduleEdit
} from '../shared/LazyComponents';

/**
 * PaymentSchedulesRoutes - Model-based routes for Payment Schedules CRUD operations
 * 
 * Route Structure:
 * - /payment-schedules -> List all payment schedules
 * - /payment-schedules/create -> Create new payment schedule
 * - /payment-schedules/:id -> View payment schedule details
 * - /payment-schedules/:id/edit -> Edit payment schedule
 * 
 * // AI-NOTE: Payment Schedules model routes following RESTful patterns and Redux slice structure.
 * // Aligned with paymentSchedulesSlice actions: fetchPaymentSchedules, createPaymentSchedule, updatePaymentSchedule, deletePaymentSchedule.
 * // Each route corresponds to specific CRUD operations as defined in MODEL_ROUTES_MAPPING.md.
 */
const PaymentSchedulesRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Payment Schedules...</div>}>
      <Routes>
        {/* List View - GET /payment-schedules */}
        <Route index element={<PaymentSchedulesList />} />
        
        {/* Create View - POST /payment-schedules */}
        <Route path="create" element={<PaymentScheduleCreate />} />
        
        {/* Detail View - GET /payment-schedules/:id */}
        <Route path=":id" element={<PaymentScheduleDetail />} />
        
        {/* Edit View - PUT /payment-schedules/:id */}
        <Route path=":id/edit" element={<PaymentScheduleEdit />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentSchedulesRoutes;