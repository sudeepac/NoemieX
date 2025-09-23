import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  AgenciesList,
  AgencyDetail,
  AgencyCreate,
  AgencyEdit
} from '../shared/LazyComponents';

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
 */
const AgenciesRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Agencies...</div>}>
      <Routes>
        {/* List View - GET /agencies */}
        <Route index element={<AgenciesList />} />
        
        {/* Create View - POST /agencies */}
        <Route path="create" element={<AgencyCreate />} />
        
        {/* Detail View - GET /agencies/:id */}
        <Route path=":id" element={<AgencyDetail />} />
        
        {/* Edit View - PUT /agencies/:id */}
        <Route path=":id/edit" element={<AgencyEdit />} />
      </Routes>
    </Suspense>
  );
};

export default AgenciesRoutes;