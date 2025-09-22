import React from 'react';
import { usePermissions } from '../../shared';

const AgencyDashboard = () => {
  const { user } = usePermissions();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Agency Dashboard</h1>
        <p>Welcome back, {user?.name || 'Agency User'}</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Student Management</h3>
          <p>Manage students and applications</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Offer Letters</h3>
          <p>Track offer letter progress</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Payments</h3>
          <p>Monitor payment status</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Commission Tracking</h3>
          <p>Track your commissions</p>
        </div>
      </div>
    </div>
  );
};

export default AgencyDashboard;