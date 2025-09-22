import React from 'react';
import PaymentsList from '../../components/payment-schedules/PaymentsList';

const AgencyPaymentManagement = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment Management</h1>
        <p>Track payments and commission status</p>
      </div>
      
      <div className="page-content">
        <PaymentsList 
          showActions={true}
          showSummary={true}
          portalType="agency"
        />
      </div>
    </div>
  );
};

export default AgencyPaymentManagement;