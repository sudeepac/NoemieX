import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth.slice';

// Portal Layout
import AccountPortal from '../portals/AccountPortal';

// Import from LazyRoutes
import * as LazyComponents from './LazyRoutes';

// Shared components
import { LoadingSpinner } from '../shared';

const AccountRoutes = () => {
  const currentUser = useSelector(selectCurrentUser);

  // Check if user has account access
  if (!currentUser || currentUser.portal !== 'account') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AccountPortal />}>
        {/* Nested routes within the portal layout */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AccountDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="students" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AccountStudentManagement />
            </Suspense>
          } 
        />
        <Route 
          path="offers" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AccountOfferLetterManagement />
            </Suspense>
          } 
        />
        <Route 
          path="agencies" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AccountAgencyManagement />
            </Suspense>
          } 
        />
        <Route 
          path="payments" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AccountPaymentManagement />
            </Suspense>
          } 
        />
        <Route 
          path="reports" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AccountReports />
            </Suspense>
          } 
        />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/account/dashboard" replace />} />
    </Routes>
  );
};

export default AccountRoutes;