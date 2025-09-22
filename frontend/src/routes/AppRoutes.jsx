import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import * as LazyComponents from './LazyRoutes';
import { 
  LoadingSpinner, 
  SuperadminRoute, 
  AccountRoute, 
  AgencyRoute,
  usePermissions
} from '../shared';

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LazyComponents.LoginPage />} />
        <Route path="/register" element={<LazyComponents.RegisterPage />} />
        <Route path="/forgot-password" element={<LazyComponents.ForgotPasswordPage />} />
        
        {/* Superadmin Portal Routes */}
        <Route path="/superadmin" element={
          <SuperadminRoute>
            <LazyComponents.SuperadminPortal />
          </SuperadminRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyComponents.SuperadminDashboard />} />
          <Route path="accounts" element={<LazyComponents.SuperadminAccountManagement />} />
          <Route path="settings" element={<LazyComponents.SystemSettings />} />
          <Route path="analytics" element={<LazyComponents.PlatformAnalytics />} />
        </Route>
        
        {/* Account Portal Routes */}
        <Route path="/account" element={
          <AccountRoute>
            <LazyComponents.AccountPortal />
          </AccountRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyComponents.AccountDashboard />} />
          <Route path="students" element={<LazyComponents.StudentManagement />} />
          <Route path="offers" element={<LazyComponents.OfferLetterManagement />} />
          <Route path="agencies" element={<LazyComponents.AgencyManagement />} />
          <Route path="payments" element={<LazyComponents.PaymentManagement />} />
          <Route path="reports" element={<LazyComponents.ReportsAnalytics />} />
        </Route>
        
        {/* Agency Portal Routes */}
        <Route path="/agency" element={
          <AgencyRoute>
            <LazyComponents.AgencyPortal />
          </AgencyRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyComponents.AgencyDashboard />} />
          <Route path="students" element={<LazyComponents.AgencyStudentManagement />} />
          <Route path="offers" element={<LazyComponents.AgencyOfferLetterManagement />} />
          <Route path="payments" element={<LazyComponents.AgencyPaymentManagement />} />
          <Route path="commissions" element={<LazyComponents.CommissionTracking />} />
        </Route>
        

        
        {/* Root redirect based on user portal */}
        <Route path="/" element={<RootRedirect />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

/**
 * Root redirect component that sends users to their appropriate portal
 */
const RootRedirect = () => {
  const { user } = usePermissions();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  switch (user.portal) {
    case 'superadmin':
      return <Navigate to="/superadmin/dashboard" replace />;
    case 'account':
      return <Navigate to="/account/dashboard" replace />;
    case 'agency':
      return <Navigate to="/agency/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default AppRoutes;