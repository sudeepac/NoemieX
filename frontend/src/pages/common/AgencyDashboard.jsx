import React from 'react';
import { usePermissions } from '../../shared';
import styles from './AgencyDashboard.module.css';

const AgencyDashboard = () => {
  const { user } = usePermissions();

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Agency Dashboard</h1>
        <p>Welcome back, {user?.name || 'Agency User'}</p>
      </div>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardCard}>
          <h3>Student Management</h3>
          <p>Manage students and applications</p>
        </div>
        
        <div className={styles.dashboardCard}>
          <h3>Offer Letters</h3>
          <p>Track offer letter progress</p>
        </div>
        
        <div className={styles.dashboardCard}>
          <h3>Payments</h3>
          <p>Monitor payment status</p>
        </div>
        
        <div className={styles.dashboardCard}>
          <h3>Commission Tracking</h3>
          <p>Track your commissions</p>
        </div>
      </div>
    </div>
  );
};

// AI-NOTE: Added CSS module import and updated class names to use camelCase.
// This completes the dashboard styling fixes for all three portal types.

export default AgencyDashboard;