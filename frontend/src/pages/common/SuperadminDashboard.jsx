import React from 'react';
import { usePermissions } from '../../shared';

const SuperadminDashboard = () => {
  const { user } = usePermissions();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Superadmin Dashboard</h1>
        <p>Welcome back, {user?.name || 'Admin'}</p>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Platform Overview</h3>
          <p>Manage the entire platform from here</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Account Management</h3>
          <p>Manage all accounts and users</p>
        </div>
        
        <div className="dashboard-card">
          <h3>System Settings</h3>
          <p>Configure platform settings</p>
        </div>
        
        <div className="dashboard-card">
          <h3>Analytics</h3>
          <p>View platform analytics and reports</p>
        </div>
      </div>
    </div>
  );
};

export default SuperadminDashboard;