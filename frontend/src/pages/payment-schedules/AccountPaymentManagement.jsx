import React from 'react';
import PaymentsList from '../../components/payment-schedules/PaymentsList';

const PaymentManagement = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Payment Management</h1>
        <p>Manage payments and billing</p>
      </div>
      
      <div className="page-content">
        <PaymentsList 
          showActions={true}
          showSummary={true}
          portalType="account"
        />
      </div>
    </div>
  );
};

export default PaymentManagement;