import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings, 
  CreditCard, 
  FileText,
  TrendingUp,
  DollarSign,
  UserCheck,

  Menu,
  X,
  LogOut,
  User,
  Bell,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { logout } from '../../../store/slices/auth.slice';
import '../portal.styles.css';

const AccountPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'agencies', label: 'Agency Management', icon: <Building2 className="w-5 h-5" /> },
    { id: 'students', label: 'Student Management', icon: <Users className="w-5 h-5" /> },
    { id: 'offers', label: 'Offer Letters', icon: <FileText className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing & Payments', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'settings', label: 'Institution Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const stats = [
    {
      title: 'Partner Agencies',
      value: '24',
      change: '+3',
      trend: 'up',
      icon: <Building2 className="w-6 h-6" />,
      color: 'primary',
      description: 'Active recruitment partners'
    },
    {
      title: 'Student Applications',
      value: '1,847',
      change: '+127',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'success',
      description: 'Total applications this month'
    },
    {
      title: 'Tuition Revenue',
      value: '$2.4M',
      change: '+12%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'info',
      description: 'Monthly tuition collected'
    },
    {
      title: 'Active Offer Letters',
      value: '456',
      change: '+89',
      trend: 'up',
      icon: <FileText className="w-6 h-6" />,
      color: 'warning',
      description: 'Pending and active offers'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'offer_issued',
      message: 'Offer letter issued to Sarah Johnson - Computer Science',
      timestamp: '2 minutes ago',
      severity: 'success'
    },
    {
      id: 2,
      type: 'agency_partnership',
      message: 'New agency partnership: Global Education Partners',
      timestamp: '15 minutes ago',
      severity: 'info'
    },
    {
      id: 3,
      type: 'payment_received',
      message: 'Tuition payment received: $15,000 - Michael Chen',
      timestamp: '1 hour ago',
      severity: 'success'
    },
    {
      id: 4,
      type: 'application_submitted',
      message: 'New application: Emma Davis - Business Administration',
      timestamp: '2 hours ago',
      severity: 'info'
    },
    {
      id: 5,
      type: 'commission_due',
      message: 'Commission payment due to EduConnect Agency',
      timestamp: '3 hours ago',
      severity: 'warning'
    }
  ];

  const recentTenants = [
    {
      id: 1,
      name: 'TechCorp Solutions',
      users: 45,
      status: 'active',
      lastActivity: '2 hours ago',
      plan: 'Enterprise'
    },
    {
      id: 2,
      name: 'Digital Innovations',
      users: 23,
      status: 'active',
      lastActivity: '5 hours ago',
      plan: 'Professional'
    },
    {
      id: 3,
      name: 'StartupXYZ',
      users: 8,
      status: 'trial',
      lastActivity: '1 day ago',
      plan: 'Starter'
    },
    {
      id: 4,
      name: 'Global Enterprises',
      users: 156,
      status: 'active',
      lastActivity: '3 hours ago',
      plan: 'Enterprise'
    },
    {
      id: 5,
      name: 'Creative Agency',
      users: 12,
      status: 'suspended',
      lastActivity: '2 days ago',
      plan: 'Professional'
    }
  ]

  const revenueData = [
    { month: 'Jan', revenue: 18500 },
    { month: 'Feb', revenue: 21200 },
    { month: 'Mar', revenue: 19800 },
    { month: 'Apr', revenue: 23400 },
    { month: 'May', revenue: 24750 },
    { month: 'Jun', revenue: 26100 }
  ];

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Institution Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Manage your partner agencies and monitor student enrollment performance.</p>
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
        {/* Partner Agencies */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Partner Agencies</h3>
            <button className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              Add Agency
            </button>
          </div>
          <div className="tenants-list">
            {recentTenants.map((agency) => (
              <div key={agency.id} className="tenant-item">
                <div className="tenant-info">
                  <div className="tenant-name">{agency.name}</div>
                  <div className="tenant-meta">
                    <span className="tenant-users">{agency.users} students</span>
                    <span className="tenant-plan">{agency.plan}</span>
                  </div>
                </div>
                <div className="tenant-status">
                  <span className={`status-badge ${agency.status}`}>
                    {agency.status}
                  </span>
                  <div className="tenant-activity">{agency.lastActivity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tuition Revenue Chart */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Tuition Revenue Trend</h3>
            <div className="chart-period">
              <button className="period-btn active">6M</button>
              <button className="period-btn">1Y</button>
            </div>
          </div>
          <div className="revenue-chart">
            <div className="chart-container">
              {revenueData.map((data, index) => (
                <div key={index} className="chart-bar">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(data.revenue / 30000) * 100}%`,
                      background: `linear-gradient(to top, var(--color-primary), var(--color-secondary))`
                    }}
                  ></div>
                  <div className="bar-label">{data.month}</div>
                  <div className="bar-value">${(data.revenue / 1000).toFixed(0)}k</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <Building2 className="w-5 h-5" />
            <span>Add New Tenant</span>
          </button>
          <button className="action-btn secondary">
            <Users className="w-5 h-5" />
            <span>Invite Users</span>
          </button>
          <button className="action-btn info">
            <FileText className="w-5 h-5" />
            <span>Generate Report</span>
          </button>
          <button className="action-btn warning">
            <CreditCard className="w-5 h-5" />
            <span>View Billing</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTenants = () => (
    <div className="tenants-content">
      <div className="content-header">
        <h1>Tenant Management</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search className="w-5 h-5" />
            <input type="text" placeholder="Search tenants..." />
          </div>
          <button className="btn btn-outline">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Tenant
          </button>
        </div>
      </div>

      <div className="tenants-grid">
        {recentTenants.map((tenant) => (
          <div key={tenant.id} className="tenant-card">
            <div className="tenant-card-header">
              <div className="tenant-avatar">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="tenant-card-info">
                <h3>{tenant.name}</h3>
                <p>{tenant.plan} Plan</p>
              </div>
              <span className={`status-badge ${tenant.status}`}>
                {tenant.status}
              </span>
            </div>
            <div className="tenant-card-stats">
              <div className="stat">
                <span className="stat-label">Users</span>
                <span className="stat-value">{tenant.users}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Last Active</span>
                <span className="stat-value">{tenant.lastActivity}</span>
              </div>
            </div>
            <div className="tenant-card-actions">
              <button className="btn btn-sm btn-outline">View Details</button>
              <button className="btn btn-sm btn-primary">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'tenants':
        return renderTenants();
      case 'users':
        return (
          <div className="content-placeholder">
            <Users className="w-16 h-16" />
            <h2>User Management</h2>
            <p>Manage users across all your tenants</p>
          </div>
        );
      case 'billing':
        return (
          <div className="content-placeholder">
            <CreditCard className="w-16 h-16" />
            <h2>Billing & Invoices</h2>
            <p>View billing information and manage invoices</p>
          </div>
        );
      case 'reports':
        return (
          <div className="content-placeholder">
            <FileText className="w-16 h-16" />
            <h2>Reports</h2>
            <p>Generate and view detailed reports</p>
          </div>
        );
      case 'settings':
        return (
          <div className="content-placeholder">
            <Settings className="w-16 h-16" />
            <h2>Account Settings</h2>
            <p>Configure your account preferences</p>
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
            <span className="portal-badge account">Account</span>
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
              <div className="user-role">Account Manager</div>
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
              <span>Account Portal</span>
              <span>/</span>
              <span>{menuItems.find(item => item.id === activeTab)?.label}</span>
            </div>
          </div>
          
          <div className="top-bar-right">
            <button className="notification-btn">
              <Bell className="w-5 h-5" />
              <span className="notification-badge">2</span>
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

export default AccountPortal;