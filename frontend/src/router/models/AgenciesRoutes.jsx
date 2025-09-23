import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
// AI-NOTE: Commented out imports for non-existent pages to fix compilation errors
// import {
//   AgenciesList,
//   AgencyDetail,
//   AgencyCreate,
//   AgencyEdit
// } from '../shared/LazyComponents';

/**
 * AgenciesRoutes - Model-based routes for Agencies CRUD operations
 * 
 * Route Structure:
 * - /agencies -> List all agencies
 * - /agencies/create -> Create new agency
 * - /agencies/:id -> View agency details
 * - /agencies/:id/edit -> Edit agency
 * 
 * // AI-NOTE: Agencies model routes following RESTful patterns and Redux slice structure.
 * // Aligned with agenciesSlice actions: fetchAgencies, createAgency, updateAgency, deleteAgency.
 * // Each route corresponds to specific CRUD operations as defined in MODEL_ROUTES_MAPPING.md.
 * // Routes temporarily commented out until pages are created.
 */
const AgenciesRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Agencies...</div>}>
      <Routes>
        {/* Temporarily commented out until pages are created */}
        {/* List View - GET /agencies */}
        {/* <Route index element={<AgenciesList />} /> */}
        
        {/* Create View - POST /agencies */}
        {/* <Route path="create" element={<AgencyCreate />} /> */}
        
        {/* Detail View - GET /agencies/:id */}
        {/* <Route path=":id" element={<AgencyDetail />} /> */}
        
        {/* Edit View - PUT /agencies/:id */}
        {/* <Route path=":id/edit" element={<AgencyEdit />} /> */}
        
        {/* Placeholder route to prevent empty Routes */}
        <Route path="*" element={<div>Agencies pages coming soon...</div>} />
      </Routes>
    </Suspense>
  );
};

export default AgenciesRoutes;