import React from 'react';
import OffersList from '../../components/offer-letters/OffersList';

const OfferLetterManagement = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Offer Letter Management</h1>
        <p>Manage and track offer letters</p>
      </div>
      
      <div className="page-content">
        <OffersList 
          showActions={true}
          showSummary={true}
          portalType="account"
        />
      </div>
    </div>
  );
};

export default OfferLetterManagement;