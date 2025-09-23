import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../shared';
import { 
  LogOut, 
  User, 
  Bell, 
  Menu, 
  X, 
  LayoutDashboard,
  Building2,
  Settings,
  BarChart3,
  CreditCard,
  Shield,
  Users,
  Database
} from 'lucide-react';
import styles from './SidebarPortal.module.css';

/**
 * Superadmin Portal Layout with Modern Sidebar
 * Focuses on platform management, tenant administration, and system oversight
 */
const SuperadminPortal = () => {
  const { user, logout } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'SA';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Navigation items focused on platform management
  const navigationSections = [
    {
      title: 'Platform Overview',
      items: [
        {
          to: '/superadmin/dashboard',
          icon: LayoutDashboard,
          label: 'Dashboard',
          description: 'Platform overview & metrics'
        }
      ]
    },
    {
      title: 'Tenant Management',
      items: [
        {
          to: '/superadmin/accounts',
          icon: Building2,
          label: 'Account Management',
          description: 'Manage tenant accounts'
        },
        {
          to: '/superadmin/subscriptions',
          icon: CreditCard,
          label: 'Subscriptions & Billing',
          description: 'Tenant billing & plans'
        },
        {
          to: '/superadmin/users',
          icon: Users,
          label: 'User Oversight',
          description: 'Cross-tenant user management'
        }
      ]
    },
    {
      title: 'System Administration',
      items: [
        {
          to: '/superadmin/settings',
          icon: Settings,
          label: 'System Settings',
          description: 'Platform configuration'
        },
        {
          to: '/superadmin/security',
          icon: Shield,
          label: 'Security & Compliance',
          description: 'Security monitoring'
        },
        {
          to: '/superadmin/database',
          icon: Database,
          label: 'Data Management',
          description: 'System data oversight'
        }
      ]
    },
    {
      title: 'Analytics & Reports',
      items: [
        {
          to: '/superadmin/analytics',
          icon: BarChart3,
          label: 'Platform Analytics',
          description: 'Usage & performance metrics'
        }
      ]
    }
  ];

  return (
    <div className={styles.portalContainer}>
      {/* Mobile Overlay */}
      <div 
        className={`${styles.overlay} ${sidebarOpen ? styles.show : ''}`}
        onClick={closeSidebar}
      />
      
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
        {/* Sidebar Header */}
        <div className={styles.sidebarHeader}>
          <h1 className={styles.sidebarTitle}>NoemieX</h1>
          <p className={styles.sidebarSubtitle}>
            <Shield className={styles.navIcon} />
            <span className={styles.portalBadge}>Superadmin</span>
          </p>
        </div>

        {/* Navigation */}
        <nav className={styles.sidebarNav}>
          {navigationSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.navSection}>
              <h3 className={styles.navSectionTitle}>{section.title}</h3>
              <ul className={styles.navList}>
                {section.items.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.to;
                  
                  return (
                    <li key={itemIndex} className={styles.navItem}>
                      <NavLink 
                        to={item.to} 
                        className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                        onClick={closeSidebar}
                      >
                        <IconComponent className={styles.navIcon} />
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className={styles.sidebarUser}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {getUserInitials(user?.name)}
            </div>
            <div className={styles.userDetails}>
              <p className={styles.userName}>{user?.name || 'System Admin'}</p>
              <p className={styles.userRole}>Platform Administrator</p>
            </div>
          </div>
          
          <div className={styles.userActions}>
            <button className={styles.userActionButton}>
              <User size={16} />
              Profile
            </button>
            <button className={`${styles.userActionButton} ${styles.logoutButton}`} onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button className={styles.mobileMenuButton} onClick={toggleSidebar}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <p className={styles.breadcrumb}>Platform Administration</p>
          </div>
          
          <div className={styles.topBarRight}>
            <button className={styles.topBarButton}>
              <Bell size={20} />
              <span className={styles.notificationBadge}></span>
            </button>
            <button className={styles.topBarButton}>
              <User size={20} />
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className={styles.portalMain}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// AI-NOTE: Completely redesigned SuperadminPortal with modern sidebar navigation.
// Focused on platform management functions: tenant administration, system settings,
// security oversight, and analytics. Removed business workflow operations as per
// business rules - superadmin manages the platform, not tenant operations.

export default SuperadminPortal;