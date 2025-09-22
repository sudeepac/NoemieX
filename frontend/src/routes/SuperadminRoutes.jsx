import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth.slice';

// Portal Layout
import SuperadminPortal from '../portals/SuperadminPortal';

// Import from LazyRoutes
import * as LazyComponents from './LazyRoutes';

// Shared components
import { LoadingSpinner } from '../shared';

const SuperadminRoutes = () => {
  const currentUser = useSelector(selectCurrentUser);

  // Check if user has superadmin access
  if (!currentUser || currentUser.portal !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<SuperadminPortal />}>
        {/* Nested routes within the portal layout */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route 
          path="dashboard" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.SuperadminDashboard />
            </Suspense>
          } 
        />
        <Route 
          path="accounts" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.SuperadminAccountManagement />
            </Suspense>
          } 
        />
        <Route 
          path="settings" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.SystemSettings />
            </Suspense>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <LazyComponents.PlatformAnalytics />
            </Suspense>
          } 
        />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/superadmin/dashboard" replace />} />
    </Routes>
  );
};

export default SuperadminRoutes;