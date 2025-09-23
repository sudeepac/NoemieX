import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  OfferLettersList,
  OfferLetterDetail,
  OfferLetterCreate,
  OfferLetterEdit
} from '../shared/LazyComponents';

/**
 * OfferLettersRoutes - Model-based routes for Offer Letters CRUD operations
 * 
 * Route Structure:
 * - /offer-letters -> List all offer letters
 * - /offer-letters/create -> Create new offer letter
 * - /offer-letters/:id -> View offer letter details
 * - /offer-letters/:id/edit -> Edit offer letter
 * 
 * // AI-NOTE: Offer Letters model routes following RESTful patterns and Redux slice structure.
 * // Aligned with offerLettersSlice actions: fetchOfferLetters, createOfferLetter, updateOfferLetter, deleteOfferLetter.
 * // Each route corresponds to specific CRUD operations as defined in MODEL_ROUTES_MAPPING.md.
 */
const OfferLettersRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Offer Letters...</div>}>
      <Routes>
        {/* List View - GET /offer-letters */}
        <Route index element={<OfferLettersList />} />
        
        {/* Create View - POST /offer-letters */}
        <Route path="create" element={<OfferLetterCreate />} />
        
        {/* Detail View - GET /offer-letters/:id */}
        <Route path=":id" element={<OfferLetterDetail />} />
        
        {/* Edit View - PUT /offer-letters/:id */}
        <Route path=":id/edit" element={<OfferLetterEdit />} />
      </Routes>
    </Suspense>
  );
};

export default OfferLettersRoutes;