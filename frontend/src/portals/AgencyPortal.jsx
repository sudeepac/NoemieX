import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { usePermissions } from '../shared';
import { LogOut, User, Bell } from 'lucide-react';
import styles from './Portal.module.css';

/**
 * Agency Portal Layout
 * Main container for all agency portal pages
 */
const AgencyPortal = () => {
  const { user, logout } = usePermissions();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.portalContainer}>
      <header className={styles.portalHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.portalTitle}>Agency Portal</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user?.name || 'User'}</span>
            <span className={styles.portalBadge}>Agency</span>
            <div className={styles.headerActions}>
              <button className={styles.iconButton}>
                <Bell size={20} />
              </button>
              <button className={styles.iconButton}>
                <User size={20} />
              </button>
              <button className={styles.logoutButton} onClick={handleLogout}>
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <nav className={styles.portalNav}>
        <div className={styles.navContent}>
          <NavLink to="/agency/dashboard" className={styles.navLink}>Dashboard</NavLink>
          <NavLink to="/agency/students" className={styles.navLink}>Student Management</NavLink>
          <NavLink to="/agency/offers" className={styles.navLink}>Offer Letters</NavLink>
          <NavLink to="/agency/payments" className={styles.navLink}>Payment Management</NavLink>
          <NavLink to="/agency/reports" className={styles.navLink}>Reports</NavLink>
          <NavLink to="/agency/commissions" className={styles.navLink}>Commission Tracking</NavLink>
        </div>
      </nav>
      
      <main className={styles.portalMain}>
        <Outlet />
      </main>
      
      <footer className={styles.portalFooter}>
        <p>&copy; 2024 NoemieX Platform - Agency Portal</p>
      </footer>
    </div>
  );
};

export default AgencyPortal;