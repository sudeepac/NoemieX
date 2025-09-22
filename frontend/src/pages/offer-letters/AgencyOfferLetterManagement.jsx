import React from 'react';
import OffersList from '../../components/offer-letters/OffersList';

const AgencyOfferLetterManagement = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Offer Letter Management</h1>
        <p>Manage and track offer letters for your students</p>
      </div>
      
      <div className="page-content">
        <OffersList 
          showActions={true}
          showSummary={true}
          portalType="agency"
        />
      </div>
    </div>
  );
};

export default AgencyOfferLetterManagement;