import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load offer letter components
const OfferLettersList = lazy(() => import('../pages/offer-letters/OfferLettersList'));
const OfferLetterDetail = lazy(() => import('../pages/offer-letters/OfferLetterDetail'));
const OfferLetterCreate = lazy(() => import('../pages/offer-letters/OfferLetterCreate'));
const OfferLetterEdit = lazy(() => import('../pages/offer-letters/OfferLetterEdit'));
const OfferLetterPreview = lazy(() => import('../pages/offer-letters/OfferLetterPreview'));

/**
 * Offer Letters Routes - Model-driven routing for Offer Letter CRUD operations
 * Aligned with offer-letters.slice.js async thunks
 */
const OfferLettersRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading offer letters..." />}>
      <Routes>
        {/* Offer Letters List - GET /offer-letters */}
        <Route index element={<OfferLettersList />} />
        
        {/* Create Offer Letter - POST /offer-letters */}
        <Route path="create" element={<OfferLetterCreate />} />
        
        {/* Offer Letter Detail - GET /offer-letters/:id */}
        <Route path=":offerLetterId" element={<OfferLetterDetail />} />
        
        {/* Edit Offer Letter - PUT /offer-letters/:id */}
        <Route path=":offerLetterId/edit" element={<OfferLetterEdit />} />
        
        {/* Preview Offer Letter */}
        <Route path=":offerLetterId/preview" element={<OfferLetterPreview />} />
        
        {/* Redirect unknown routes to offer letters list */}
        <Route path="*" element={<Navigate to="/offer-letters" replace />} />
      </Routes>
    </Suspense>
  );
};

export default OfferLettersRoutes;