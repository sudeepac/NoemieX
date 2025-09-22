import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load payment schedule components
const PaymentSchedulesList = lazy(() => import('../pages/payment-schedules/PaymentSchedulesList'));
const PaymentScheduleDetail = lazy(() => import('../pages/payment-schedules/PaymentScheduleDetail'));
const PaymentScheduleCreate = lazy(() => import('../pages/payment-schedules/PaymentScheduleCreate'));
const PaymentScheduleEdit = lazy(() => import('../pages/payment-schedules/PaymentScheduleEdit'));
const OverduePaymentSchedules = lazy(() => import('../pages/payment-schedules/OverduePaymentSchedules'));
const UpcomingPaymentSchedules = lazy(() => import('../pages/payment-schedules/UpcomingPaymentSchedules'));
const PaymentScheduleStats = lazy(() => import('../pages/payment-schedules/PaymentScheduleStats'));
const GeneratePaymentTransactions = lazy(() => import('../pages/payment-schedules/GeneratePaymentTransactions'));

/**
 * Payment Schedules Routes - Model-driven routing for Payment Schedule CRUD operations
 * Aligned with payment-schedules.slice.js async thunks:
 * - fetchPaymentScheduleItems, fetchPaymentScheduleItemById, createPaymentScheduleItem,
 *   updatePaymentScheduleItem, deletePaymentScheduleItem, approvePaymentScheduleItem,
 *   retirePaymentScheduleItem, replacePaymentScheduleItem, completePaymentScheduleItem,
 *   cancelPaymentScheduleItem, fetchOverduePaymentScheduleItems, fetchUpcomingPaymentScheduleItems,
 *   generateTransactions, generateRecurringPaymentScheduleItems, fetchPaymentScheduleItemStats
 */
const PaymentSchedulesRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading payment schedules..." />}>
      <Routes>
        {/* Payment Schedules List - GET /payment-schedule-items */}
        <Route index element={<PaymentSchedulesList />} />
        
        {/* Create Payment Schedule - POST /payment-schedule-items */}
        <Route path="create" element={<PaymentScheduleCreate />} />
        
        {/* Overdue Items - GET /payment-schedule-items/overdue */}
        <Route path="overdue" element={<OverduePaymentSchedules />} />
        
        {/* Upcoming Items - GET /payment-schedule-items/upcoming */}
        <Route path="upcoming" element={<UpcomingPaymentSchedules />} />
        
        {/* Statistics - GET /payment-schedule-items/stats */}
        <Route path="stats" element={<PaymentScheduleStats />} />
        
        {/* Generate Transactions - POST /payment-schedule-items/generate-transactions */}
        <Route path="generate-transactions" element={<GeneratePaymentTransactions />} />
        
        {/* Payment Schedule Detail - GET /payment-schedule-items/:id */}
        <Route path=":paymentScheduleId" element={<PaymentScheduleDetail />} />
        
        {/* Edit Payment Schedule - PUT /payment-schedule-items/:id */}
        <Route path=":paymentScheduleId/edit" element={<PaymentScheduleEdit />} />
        
        {/* Redirect unknown routes to payment schedules list */}
        <Route path="*" element={<Navigate to="/payment-schedules" replace />} />
      </Routes>
    </Suspense>
  );
};

export default PaymentSchedulesRoutes;