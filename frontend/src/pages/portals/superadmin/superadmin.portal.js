import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  Building2, 
  Shield, 
  Settings, 
  BarChart3, 
  Activity,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Database,

  Menu,
  X,
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { logout } from '../../../store/slices/auth.slice';
import '../portal.styles.css';

const SuperadminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
    { id: 'accounts', label: 'Account Management', icon: <Building2 className="w-5 h-5" /> },
    { id: 'security', label: 'Security Center', icon: <Shield className="w-5 h-5" /> },
    { id: 'system', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <Activity className="w-5 h-5" /> }
  ];

  const stats = [
    {
      title: 'Total Accounts (Tenants)',
      value: '247',
      change: '+12',
      trend: 'up',
      icon: <Building2 className="w-6 h-6" />,
      color: 'primary',
      description: 'Active education institutions'
    },
    {
      title: 'Total Agencies',
      value: '1,847',
      change: '+89',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'success',
      description: 'Partner recruitment agencies'
    },
    {
      title: 'Platform Revenue',
      value: '$2.4M',
      change: '+18%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'info',
      description: 'Monthly recurring revenue'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: '+0.1%',
      trend: 'up',
      icon: <Activity className="w-6 h-6" />,
      color: 'warning',
      description: 'Platform uptime'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'account_created',
      message: 'New account onboarded: Melbourne University',
      timestamp: '2 minutes ago',
      severity: 'success'
    },
    {
      id: 2,
      type: 'agency_suspended',
      message: 'Agency suspended: Global Education Partners (compliance violation)',
      timestamp: '15 minutes ago',
      severity: 'warning'
    },
    {
      id: 3,
      type: 'billing_alert',
      message: 'Payment overdue: Sydney Institute ($12,450)',
      timestamp: '1 hour ago',
      severity: 'error'
    },
    {
      id: 4,
      type: 'commission_processed',
      message: 'Commission batch processed: $45,230 to 23 agencies',
      timestamp: '2 hours ago',
      severity: 'info'
    },
    {
      id: 5,
      type: 'account_trial_expiring',
      message: 'Trial expiring soon: Brisbane College (3 days remaining)',
      timestamp: '3 hours ago',
      severity: 'warning'
    }
  ];

  const systemMetrics = [
    { label: 'Active Offer Letters', value: 1247, unit: '', status: 'good' },
    { label: 'Pending Payments', value: 89, unit: '', status: 'warning' },
    { label: 'Overdue Transactions', value: 23, unit: '', status: 'error' },
    { label: 'Monthly Commissions', value: 156, unit: 'K', status: 'good' }
  ];

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Platform Administration</h1>
        <p>Welcome back, {user?.firstName}! Monitor and manage the NoemieX education platform across all accounts and agencies.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className={`stat-change ${stat.trend}`}>
                <TrendingUp className="w-4 h-4" />
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* System Metrics */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>System Metrics</h3>
            <Database className="w-5 h-5" />
          </div>
          <div className="metrics-list">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="metric-item">
                <div className="metric-info">
                  <span className="metric-label">{metric.label}</span>
                  <span className="metric-value">
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <div className="metric-bar">
                  <div 
                    className={`metric-fill ${metric.status}`}
                    style={{ width: `${metric.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Activities</h3>
            <Activity className="w-5 h-5" />
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className={`activity-item ${activity.severity}`}>
                <div className="activity-indicator"></div>
                <div className="activity-content">
                  <p className="activity-message">{activity.message}</p>
                  <span className="activity-timestamp">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <Building2 className="w-5 h-5" />
            <span>Onboard Account</span>
          </button>
          <button className="action-btn secondary">
            <TrendingUp className="w-5 h-5" />
            <span>Process Commissions</span>
          </button>
          <button className="action-btn warning">
            <AlertTriangle className="w-5 h-5" />
            <span>Review Disputes</span>
          </button>
          <button className="action-btn info">
            <Settings className="w-5 h-5" />
            <span>Platform Settings</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return (
          <div className="content-placeholder">
            <Users className="w-16 h-16" />
            <h2>User Management</h2>
            <p>Manage all users across the platform</p>
          </div>
        );
      case 'accounts':
        return (
          <div className="content-placeholder">
            <Building2 className="w-16 h-16" />
            <h2>Account Management</h2>
            <p>Manage tenant accounts and organizations</p>
          </div>
        );
      case 'security':
        return (
          <div className="content-placeholder">
            <Shield className="w-16 h-16" />
            <h2>Security Center</h2>
            <p>Monitor security events and configure policies</p>
          </div>
        );
      case 'system':
        return (
          <div className="content-placeholder">
            <Settings className="w-16 h-16" />
            <h2>System Settings</h2>
            <p>Configure global system settings</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="content-placeholder">
            <Activity className="w-16 h-16" />
            <h2>Analytics</h2>
            <p>View detailed analytics and reports</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="portal-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <h2>NoemieX</h2>
            <span className="portal-badge superadmin">Superadmin</span>
          </div>
          <button 
            className="sidebar-toggle mobile-only"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <User className="w-5 h-5" />
            </div>
            <div className="user-details">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">Superadmin</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="breadcrumb">
              <span>Superadmin Portal</span>
              <span>/</span>
              <span>{menuItems.find(item => item.id === activeTab)?.label}</span>
            </div>
          </div>
          
          <div className="top-bar-right">
            <button className="notification-btn">
              <Bell className="w-5 h-5" />
              <span className="notification-badge">3</span>
            </button>
            <div className="user-menu">
              <div className="user-avatar">
                <User className="w-5 h-5" />
              </div>
              <span className="user-name">{user?.firstName}</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {renderContent()}
        </div>
      </main>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default SuperadminPortal;