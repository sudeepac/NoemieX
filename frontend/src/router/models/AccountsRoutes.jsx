import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AccountsList,
  AccountDetail,
  AccountCreate,
  AccountEdit,
  AccountBilling,
  AccountStats
} from '../shared/LazyComponents';

/**
 * AccountsRoutes - Model-based routes for Accounts CRUD operations
 * 
 * Route Structure:
 * - /accounts -> List all accounts
 * - /accounts/create -> Create new account
 * - /accounts/:id -> View account details
 * - /accounts/:id/edit -> Edit account
 * - /accounts/:id/billing -> Account billing information
 * - /accounts/:id/stats -> Account statistics
 * 
 * // AI-NOTE: Accounts model routes following RESTful patterns and Redux slice structure.
 * // Aligned with accountsSlice actions: fetchAccounts, createAccount, updateAccount, deleteAccount.
 * // Includes additional views for billing and statistics as per business requirements.
 */
const AccountsRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Accounts...</div>}>
      <Routes>
        {/* List View - GET /accounts */}
        <Route index element={<AccountsList />} />
        
        {/* Create View - POST /accounts */}
        <Route path="create" element={<AccountCreate />} />
        
        {/* Detail View - GET /accounts/:id */}
        <Route path=":id" element={<AccountDetail />} />
        
        {/* Edit View - PUT /accounts/:id */}
        <Route path=":id/edit" element={<AccountEdit />} />
        
        {/* Billing View - Account-specific billing */}
        <Route path=":id/billing" element={<AccountBilling />} />
        
        {/* Statistics View - Account analytics */}
        <Route path=":id/stats" element={<AccountStats />} />
      </Routes>
    </Suspense>
  );
};

export default AccountsRoutes;