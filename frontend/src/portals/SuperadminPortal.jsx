import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { usePermissions } from '../shared';
import { LogOut, User, Bell } from 'lucide-react';
import styles from './Portal.module.css';

/**
 * Superadmin Portal Layout
 * Main container for all superadmin portal pages
 */
const SuperadminPortal = () => {
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
          <h1 className={styles.portalTitle}>Superadmin Portal</h1>
          <div className={styles.userInfo}>
            <span>Welcome, {user?.name || 'Admin'}</span>
            <span className={styles.portalBadge}>Superadmin</span>
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
          <NavLink to="/superadmin/dashboard" className={styles.navLink}>Dashboard</NavLink>
          <NavLink to="/superadmin/accounts" className={styles.navLink}>Account Management</NavLink>
          <NavLink to="/superadmin/settings" className={styles.navLink}>System Settings</NavLink>
          <NavLink to="/superadmin/analytics" className={styles.navLink}>Platform Analytics</NavLink>
        </div>
      </nav>
      
      <main className={styles.portalMain}>
        <Outlet />
      </main>
      
      <footer className={styles.portalFooter}>
        <p>&copy; 2024 NoemieX Platform - Superadmin Portal</p>
      </footer>
    </div>
  );
};

export default SuperadminPortal;