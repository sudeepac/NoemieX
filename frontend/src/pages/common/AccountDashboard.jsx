import React from 'react';
import { usePermissions } from '../../shared';

const AccountDashboard = () => {
  const { user } = usePermissions();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Account Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Student Management</h3>
          <p>Manage your students and applications</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Offer Letters</h3>
          <p>Track and manage offer letters</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Payments</h3>
          <p>View payment history and schedules</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Reports</h3>
          <p>Generate and view reports</p>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;