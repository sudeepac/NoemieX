import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load agency-related components
const AgenciesList = lazy(() => import('../pages/agencies/AgenciesList'));
const AgencyDetail = lazy(() => import('../pages/agencies/AgencyDetail'));
const AgencyCreate = lazy(() => import('../pages/agencies/AgencyCreate'));
const AgencyEdit = lazy(() => import('../pages/agencies/AgencyEdit'));
const AgencyStats = lazy(() => import('../pages/agencies/AgencyStats'));

/**
 * Agencies Routes - Model-driven routing for Agency CRUD operations
 * Aligned with agencies.slice.js async thunks:
 * - fetchAgencies, fetchAgencyById, createAgency, updateAgency, deleteAgency, 
 *   toggleAgencyStatus, fetchAgencyStats
 */
const AgenciesRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading agencies..." />}>
      <Routes>
        {/* Agencies List - GET /agencies */}
        <Route index element={<AgenciesList />} />
        
        {/* Create Agency - POST /agencies */}
        <Route path="create" element={<AgencyCreate />} />
        
        {/* Agency Detail - GET /agencies/:id */}
        <Route path=":agencyId" element={<AgencyDetail />} />
        
        {/* Edit Agency - PUT /agencies/:id */}
        <Route path=":agencyId/edit" element={<AgencyEdit />} />
        
        {/* Agency Statistics - GET /agencies/:id/stats */}
        <Route path=":agencyId/stats" element={<AgencyStats />} />
        
        {/* Redirect unknown routes to agencies list */}
        <Route path="*" element={<Navigate to="/agencies" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AgenciesRoutes;