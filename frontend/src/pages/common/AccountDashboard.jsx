import React from 'react';
import { usePermissions } from '../../shared';
import styles from './AccountDashboard.module.css';

const AccountDashboard = () => {
  const { user } = usePermissions();

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1>Account Dashboard</h1>
        <p>Welcome back, {user?.name || 'User'}</p>
      </div>
      
      <div className={styles.dashboardGrid}>
        <div className={styles.dashboardCard}>
          <h3>Student Management</h3>
          <p>Manage your students and applications</p>
        </div>
        
        <div className={styles.dashboardCard}>
          <h3>Offer Letters</h3>
          <p>Track and manage offer letters</p>
        </div>
        
        <div className={styles.dashboardCard}>
          <h3>Payments</h3>
          <p>View payment history and schedules</p>
        </div>
        
        <div className={styles.dashboardCard}>
          <h3>Reports</h3>
          <p>Generate and view reports</p>
        </div>
      </div>
    </div>
  );
};

// AI-NOTE: Added CSS module import and updated class names to use camelCase.
// This fixes potential styling issues by following project conventions.

export default AccountDashboard;