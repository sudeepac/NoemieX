import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load account-related components
const AccountsList = lazy(() => import('../pages/accounts/AccountsList'));
const AccountDetail = lazy(() => import('../pages/accounts/AccountDetail'));
const AccountCreate = lazy(() => import('../pages/accounts/AccountCreate'));
const AccountEdit = lazy(() => import('../pages/accounts/AccountEdit'));
const AccountBilling = lazy(() => import('../pages/accounts/AccountBilling'));
const AccountStats = lazy(() => import('../pages/accounts/AccountStats'));

/**
 * Accounts Routes - Model-driven routing for Account CRUD operations
 * Aligned with accounts.slice.js async thunks:
 * - fetchAccounts, fetchAccountById, createAccount, updateAccount, deleteAccount, 
 *   toggleAccountStatus, updateAccountBilling, fetchAccountStats
 */
const AccountsRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading accounts..." />}>
      <Routes>
        {/* Accounts List - GET /accounts */}
        <Route index element={<AccountsList />} />
        
        {/* Create Account - POST /accounts */}
        <Route path="create" element={<AccountCreate />} />
        
        {/* Account Detail - GET /accounts/:id */}
        <Route path=":accountId" element={<AccountDetail />} />
        
        {/* Edit Account - PUT /accounts/:id */}
        <Route path=":accountId/edit" element={<AccountEdit />} />
        
        {/* Account Billing - PUT /accounts/:id/billing */}
        <Route path=":accountId/billing" element={<AccountBilling />} />
        
        {/* Account Statistics - GET /accounts/:id/stats */}
        <Route path=":accountId/stats" element={<AccountStats />} />
        
        {/* Redirect unknown routes to accounts list */}
        <Route path="*" element={<Navigate to="/accounts" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AccountsRoutes;