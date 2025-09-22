import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { usePermissions } from '../shared';
import { LogOut, User, Bell } from 'lucide-react';
import styles from './Portal.module.css';

/**
 * Account Portal Layout
 * Main container for all account portal pages
 */
const AccountPortal = () => {
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
          <h1 className={styles.portalTitle}>Account Portal</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user?.name || 'User'}</span>
            <span className={styles.portalBadge}>Account</span>
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
          <NavLink to="/account/dashboard" className={styles.navLink}>Dashboard</NavLink>
          <NavLink to="/account/students" className={styles.navLink}>Student Management</NavLink>
          <NavLink to="/account/offers" className={styles.navLink}>Offer Letters</NavLink>
          <NavLink to="/account/agencies" className={styles.navLink}>Agency Management</NavLink>
          <NavLink to="/account/payments" className={styles.navLink}>Payment Management</NavLink>
          <NavLink to="/account/reports" className={styles.navLink}>Reports & Analytics</NavLink>
        </div>
      </nav>
      
      <main className={styles.portalMain}>
        <Outlet />
      </main>
      
      <footer className={styles.portalFooter}>
        <p>&copy; 2024 NoemieX Platform - Account Portal</p>
      </footer>
    </div>
  );
};

export default AccountPortal;