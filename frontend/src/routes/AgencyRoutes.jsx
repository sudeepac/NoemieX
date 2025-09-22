import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth.slice';

// Portal Layout
import AgencyPortal from '../portals/AgencyPortal';

// Import from LazyRoutes
import * as LazyComponents from './LazyRoutes';

// Shared components
import { LoadingSpinner } from '../shared';

const AgencyRoutes = () => {
  const currentUser = useSelector(selectCurrentUser);

  // Check if user has agency access
  if (!currentUser || currentUser.portal !== 'agency') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AgencyPortal />}>
        {/* Nested routes within the portal layout */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AgencyDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="students" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AgencyStudentManagement />
            </Suspense>
          } 
        />
        <Route 
          path="offers" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AgencyOfferLetterManagement />
            </Suspense>
          } 
        />
        <Route 
          path="payments" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AgencyPaymentManagement />
            </Suspense>
          } 
        />
        <Route 
          path="reports" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AgencyReports />
            </Suspense>
          } 
        />
        <Route 
          path="commissions" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.AgencyCommissionManagement />
            </Suspense>
          } 
        />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/agency/dashboard" replace />} />
    </Routes>
  );
};

export default AgencyRoutes;