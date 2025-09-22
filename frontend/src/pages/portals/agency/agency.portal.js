import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  FolderOpen, 
  BarChart3, 
  Settings, 
  Calendar, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  Building2,
  DollarSign,
  UserCheck,
  CreditCard,
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
import UsersList from '../../../components/users/UsersList';
import UserForm from '../../../components/users/UserForm';
import UserDetail from '../../../components/users/UserDetail';
import AgencyForm from '../../../components/agencies/AgencyForm';
import AgencyDetail from '../../../components/agencies/AgencyDetail';
import AgencyStats from '../../../components/agencies/AgencyStats';
import OfferLettersList from '../../../components/offer-letters/OfferLettersList';
import OfferLetterForm from '../../../components/offer-letters/OfferLetterForm';
import OfferLetterDetail from '../../../components/offer-letters/OfferLetterDetail';
import PaymentSchedules from '../../../components/payment-schedules/PaymentSchedules';
import BillingTransactionsList from '../../../components/billing-transactions/BillingTransactionsList';
import BillingTransactionForm from '../../../components/billing-transactions/BillingTransactionForm';
import BillingTransactionDetail from '../../../components/billing-transactions/BillingTransactionDetail';
import '../portal.styles.css';

const AgencyPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userView, setUserView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [agencyView, setAgencyView] = useState('profile'); // 'profile', 'edit', 'stats'
  const [editingAgency, setEditingAgency] = useState(false);
  const [offerLetterView, setOfferLetterView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedOfferLetterId, setSelectedOfferLetterId] = useState(null);
  const [editingOfferLetter, setEditingOfferLetter] = useState(null);
  const [paymentScheduleView, setPaymentScheduleView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedPaymentScheduleId, setSelectedPaymentScheduleId] = useState(null);
  const [editingPaymentSchedule, setEditingPaymentSchedule] = useState(null);
  const [billingTransactionView, setBillingTransactionView] = useState('list'); // 'list', 'form', 'detail'
  const [selectedBillingTransactionId, setSelectedBillingTransactionId] = useState(null);
  const [editingBillingTransaction, setEditingBillingTransaction] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

// AI-NOTE: Added comprehensive agency self-management capabilities including profile editing, stats viewing, and navigation helpers for agency portal

  // User management navigation helpers
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserView('form');
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserView('form');
  };

  const handleViewUser = (userId) => {
    setSelectedUserId(userId);
    setUserView('detail');
  };

  const handleBackToUsersList = () => {
    setUserView('list');
    setSelectedUserId(null);
    setEditingUser(null);
  };

  // Agency management navigation helpers
  const handleEditAgencyProfile = () => {
    setEditingAgency(true);
    setAgencyView('edit');
  };

  const handleViewAgencyStats = () => {
    setAgencyView('stats');
  };

  const handleBackToAgencyProfile = () => {
    setAgencyView('profile');
    setEditingAgency(false);
  };

  // Offer letter management navigation helpers
  const handleCreateOfferLetter = () => {
    setEditingOfferLetter(null);
    setOfferLetterView('form');
  };

  const handleEditOfferLetter = (offerLetter) => {
    setEditingOfferLetter(offerLetter);
    setOfferLetterView('form');
  };

  const handleViewOfferLetter = (offerLetterId) => {
    setSelectedOfferLetterId(offerLetterId);
    setOfferLetterView('detail');
  };

  const handleBackToOfferLettersList = () => {
    setOfferLetterView('list');
    setSelectedOfferLetterId(null);
    setEditingOfferLetter(null);
  };

  // Payment schedule management navigation helpers
  const handleCreatePaymentSchedule = () => {
    setEditingPaymentSchedule(null);
    setPaymentScheduleView('form');
  };

  const handleEditPaymentSchedule = (paymentSchedule) => {
    setEditingPaymentSchedule(paymentSchedule);
    setPaymentScheduleView('form');
  };

  const handleViewPaymentSchedule = (paymentScheduleId) => {
    setSelectedPaymentScheduleId(paymentScheduleId);
    setPaymentScheduleView('detail');
  };

  const handleBackToPaymentSchedulesList = () => {
    setPaymentScheduleView('list');
    setSelectedPaymentScheduleId(null);
    setEditingPaymentSchedule(null);
  };

  // Billing transaction management navigation helpers
  const handleCreateBillingTransaction = () => {
    setEditingBillingTransaction(null);
    setBillingTransactionView('form');
  };

  const handleEditBillingTransaction = (billingTransaction) => {
    setEditingBillingTransaction(billingTransaction);
    setBillingTransactionView('form');
  };

  const handleViewBillingTransaction = (billingTransactionId) => {
    setSelectedBillingTransactionId(billingTransactionId);
    setBillingTransactionView('detail');
  };

  const handleBackToBillingTransactionsList = () => {
    setBillingTransactionView('list');
    setSelectedBillingTransactionId(null);
    setEditingBillingTransaction(null);
  };

  // Tab change handler to reset user and agency views
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
    if (tabId !== 'users') {
      setUserView('list');
      setSelectedUserId(null);
      setEditingUser(null);
    }
    if (tabId !== 'settings') {
      setAgencyView('profile');
      setEditingAgency(false);
    }
    if (tabId !== 'offers') {
      setOfferLetterView('list');
      setSelectedOfferLetterId(null);
      setEditingOfferLetter(null);
    }
    if (tabId !== 'billing') {
      setBillingTransactionView('list');
      setSelectedBillingTransactionId(null);
      setEditingBillingTransaction(null);
    }
  };

  // Render user management content based on current view
  const renderUserManagement = () => {
    switch (userView) {
      case 'form':
        return (
          <UserForm
            user={editingUser}
            onCancel={handleBackToUsersList}
            onSuccess={handleBackToUsersList}
          />
        );
      case 'detail':
        return (
          <UserDetail
            userId={selectedUserId}
            onBack={handleBackToUsersList}
            onEdit={handleEditUser}
          />
        );
      default:
        return (
          <UsersList
            onCreateUser={handleCreateUser}
            onEditUser={handleEditUser}
            onViewUser={handleViewUser}
          />
        );
    }
  };

  // Render agency management content for settings tab
  const renderAgencyManagement = () => {
    switch (agencyView) {
      case 'edit':
        return (
          <AgencyForm
            agency={user?.agency} // Current agency data from user context
            onCancel={handleBackToAgencyProfile}
            onSuccess={handleBackToAgencyProfile}
            isOwnAgency={true} // Flag to indicate self-management
          />
        );
      case 'stats':
        return (
          <AgencyStats
            agency={user?.agency}
            stats={null} // Will be fetched by component
            loading={false}
            error={null}
          />
        );
      case 'profile':
      default:
        return (
          <AgencyDetail
            agencyId={user?.agency?.id}
            onBack={null} // No back button for own agency
            onEdit={handleEditAgencyProfile}
            onViewStats={handleViewAgencyStats}
            isOwnAgency={true} // Flag to indicate self-management
          />
        );
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', label: 'User Management', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'students', label: 'Student Management', icon: <Users className="w-5 h-5" /> },
    { id: 'applications', label: 'Applications', icon: <FileText className="w-5 h-5" /> },
    { id: 'offers', label: 'Offer Letters', icon: <FileText className="w-5 h-5" /> },
    { id: 'payment-schedules', label: 'Payment Schedules', icon: <Calendar className="w-5 h-5" /> },
    { id: 'billing', label: 'Billing & Transactions', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'institutions', label: 'Partner Institutions', icon: <Building2 className="w-5 h-5" /> },
    { id: 'commissions', label: 'Commissions', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'settings', label: 'Agency Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const stats = [
    {
      title: 'Active Students',
      value: '156',
      change: '+12',
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'primary',
      description: 'Students in application process'
    },
    {
      title: 'Successful Placements',
      value: '89',
      change: '+7',
      trend: 'up',
      icon: <UserCheck className="w-6 h-6" />,
      color: 'success',
      description: 'Students enrolled this month'
    },
    {
      title: 'Commission Earned',
      value: '$45,200',
      change: '+18%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'info',
      description: 'Monthly commission revenue'
    },
    {
      title: 'Success Rate',
      value: '87%',
      change: '+5%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'warning',
      description: 'Application to enrollment ratio'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'student_enrolled',
      message: 'Student enrolled: Alex Chen - University of Toronto',
      timestamp: '5 minutes ago',
      severity: 'success'
    },
    {
      id: 2,
      type: 'application_submitted',
      message: 'New application: Maria Rodriguez - Computer Science',
      timestamp: '30 minutes ago',
      severity: 'info'
    },
    {
      id: 3,
      type: 'commission_received',
      message: 'Commission received: $2,500 - McGill University',
      timestamp: '1 hour ago',
      severity: 'success'
    },
    {
      id: 4,
      type: 'document_pending',
      message: 'Document verification pending: John Smith',
      timestamp: '2 hours ago',
      severity: 'warning'
    },
    {
      id: 5,
      type: 'partnership_update',
      message: 'New partnership: York University - Business Programs',
      timestamp: '4 hours ago',
      severity: 'info'
    }
  ];

  const recentProjects = [
    {
      id: 1,
      name: 'Website Redesign',
      client: 'TechCorp Solutions',
      status: 'in-progress',
      progress: 75,
      deadline: '2024-02-15',
      team: ['John', 'Sarah', 'Mike']
    },
    {
      id: 2,
      name: 'Mobile App Development',
      client: 'StartupXYZ',
      status: 'in-progress',
      progress: 45,
      deadline: '2024-03-20',
      team: ['Alice', 'Bob', 'Carol']
    },
    {
      id: 3,
      name: 'Brand Identity',
      client: 'Creative Agency',
      status: 'review',
      progress: 90,
      deadline: '2024-01-30',
      team: ['David', 'Emma']
    },
    {
      id: 4,
      name: 'E-commerce Platform',
      client: 'Global Enterprises',
      status: 'planning',
      progress: 15,
      deadline: '2024-04-10',
      team: ['Frank', 'Grace', 'Henry', 'Ivy']
    }
  ]

  const upcomingTasks = [
    {
      id: 1,
      title: 'Review application documents for Maria Rodriguez',
      project: 'Student Applications',
      dueDate: 'Today, 2:00 PM',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Submit offer letter acceptance for Alex Chen',
      project: 'University of Toronto',
      dueDate: 'Tomorrow, 10:00 AM',
      priority: 'high'
    },
    {
      id: 3,
      title: 'Follow up on visa documentation',
      project: 'International Students',
      dueDate: 'Tomorrow, 9:00 AM',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Commission reconciliation with McGill University',
      project: 'Financial',
      dueDate: 'Jan 28, 5:00 PM',
      priority: 'medium'
    }
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'John Smith',
      role: 'Frontend Developer',
      avatar: 'JS',
      status: 'online',
      projects: 3
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'UI/UX Designer',
      avatar: 'SJ',
      status: 'online',
      projects: 2
    },
    {
      id: 3,
      name: 'Mike Wilson',
      role: 'Backend Developer',
      avatar: 'MW',
      status: 'away',
      projects: 4
    },
    {
      id: 4,
      name: 'Alice Brown',
      role: 'Project Manager',
      avatar: 'AB',
      status: 'offline',
      projects: 5
    }
  ];

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1>Education Agency Dashboard</h1>
        <p>Welcome back, {user?.firstName}! Manage your student applications and track placement success across partner institutions.</p>
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
        {/* Active Applications */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Active Applications</h3>
            <button className="btn btn-primary btn-sm">
              <Plus className="w-4 h-4" />
              New Application
            </button>
          </div>
          <div className="projects-list">
            {recentProjects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="project-info">
                  <div className="project-name">{project.name}</div>
                  <div className="project-client">{project.client}</div>
                  <div className="project-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{project.progress}%</span>
                  </div>
                </div>
                <div className="project-meta">
                  <span className={`status-badge ${project.status}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                  <div className="project-deadline">
                    <Clock className="w-4 h-4" />
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Upcoming Tasks</h3>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="tasks-list">
            {upcomingTasks.map((task) => (
              <div key={task.id} className={`task-item priority-${task.priority}`}>
                <div className="task-priority"></div>
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className="task-project">{task.project}</span>
                    <span className="task-due">{task.dueDate}</span>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="btn btn-sm btn-outline">View</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Overview */}
      <div className="team-overview">
        <div className="card-header">
          <h3>Team Overview</h3>
          <button className="btn btn-outline btn-sm">
            <Users className="w-4 h-4" />
            Manage Team
          </button>
        </div>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-member-card">
              <div className="member-avatar">
                <span>{member.avatar}</span>
                <div className={`status-indicator ${member.status}`}></div>
              </div>
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-role">{member.role}</div>
                <div className="member-projects">{member.projects} active projects</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn primary">
            <FolderOpen className="w-5 h-5" />
            <span>Create Project</span>
          </button>
          <button className="action-btn secondary">
            <Users className="w-5 h-5" />
            <span>Add Client</span>
          </button>
          <button className="action-btn info">
            <Calendar className="w-5 h-5" />
            <span>Schedule Meeting</span>
          </button>
          <button className="action-btn warning">
            <MessageSquare className="w-5 h-5" />
            <span>Send Message</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="projects-content">
      <div className="content-header">
        <h1>Projects</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search className="w-5 h-5" />
            <input type="text" placeholder="Search projects..." />
          </div>
          <button className="btn btn-outline">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="btn btn-primary">
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      <div className="projects-grid">
        {recentProjects.map((project) => (
          <div key={project.id} className="project-card">
            <div className="project-card-header">
              <div className="project-card-info">
                <h3>{project.name}</h3>
                <p>{project.client}</p>
              </div>
              <span className={`status-badge ${project.status}`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>
            <div className="project-card-progress">
              <div className="progress-info">
                <span>Progress</span>
                <span>{project.progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="project-card-meta">
              <div className="project-deadline">
                <Clock className="w-4 h-4" />
                Due: {new Date(project.deadline).toLocaleDateString()}
              </div>
              <div className="project-team">
                <Users className="w-4 h-4" />
                {project.team.length} members
              </div>
            </div>
            <div className="project-card-actions">
              <button className="btn btn-sm btn-outline">View Details</button>
              <button className="btn btn-sm btn-primary">Manage</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render offer letter management content
  const renderOfferLetterManagement = () => {
    switch (offerLetterView) {
      case 'form':
        return (
          <OfferLetterForm
            offerLetter={editingOfferLetter}
            onCancel={handleBackToOfferLettersList}
            onSuccess={handleBackToOfferLettersList}
          />
        );
      case 'detail':
        return (
          <OfferLetterDetail
            offerLetterId={selectedOfferLetterId}
            onBack={handleBackToOfferLettersList}
            onEdit={handleEditOfferLetter}
          />
        );
      case 'list':
      default:
        return (
          <OfferLettersList
            onCreateOfferLetter={handleCreateOfferLetter}
            onEditOfferLetter={handleEditOfferLetter}
            onViewOfferLetter={handleViewOfferLetter}
          />
        );
    }
  };

  // Render payment schedule management content
  const renderPaymentScheduleManagement = () => {
    return (
      <PaymentSchedules />
    );
  };

  // Render billing transaction management content
  const renderBillingTransactionManagement = () => {
    switch (billingTransactionView) {
      case 'form':
        return (
          <BillingTransactionForm
            billingTransaction={editingBillingTransaction}
            onCancel={handleBackToBillingTransactionsList}
            onSuccess={handleBackToBillingTransactionsList}
          />
        );
      case 'detail':
        return (
          <BillingTransactionDetail
            billingTransactionId={selectedBillingTransactionId}
            onBack={handleBackToBillingTransactionsList}
            onEdit={handleEditBillingTransaction}
          />
        );
      case 'list':
      default:
        return (
          <BillingTransactionsList
            portal="agency"
            onCreateBillingTransaction={handleCreateBillingTransaction}
            onEditBillingTransaction={handleEditBillingTransaction}
            onViewBillingTransaction={handleViewBillingTransaction}
          />
        );
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'offers':
        return renderOfferLetterManagement();
      case 'payment-schedules':
        return renderPaymentScheduleManagement();
      case 'billing':
        return renderBillingTransactionManagement();
      case 'projects':
        return renderProjects();
      case 'clients':
        return (
          <div className="content-placeholder">
            <Users className="w-16 h-16" />
            <h2>Client Management</h2>
            <p>Manage your client relationships and contacts</p>
          </div>
        );
      case 'team':
        return (
          <div className="content-placeholder">
            <Users className="w-16 h-16" />
            <h2>Team Management</h2>
            <p>Manage your team members and their roles</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="content-placeholder">
            <Calendar className="w-16 h-16" />
            <h2>Calendar</h2>
            <p>View and manage your schedule and meetings</p>
          </div>
        );
      case 'messages':
        return (
          <div className="content-placeholder">
            <MessageSquare className="w-16 h-16" />
            <h2>Messages</h2>
            <p>Communicate with your team and clients</p>
          </div>
        );
      case 'settings':
        return renderAgencyManagement();
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
            <span className="portal-badge agency">Agency</span>
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
              onClick={() => handleTabChange(item.id)}
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
              <div className="user-role">Agency Manager</div>
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
              <span>Agency Portal</span>
              <span>/</span>
              <span>{menuItems.find(item => item.id === activeTab)?.label}</span>
            </div>
          </div>
          
          <div className="top-bar-right">
            <button className="notification-btn">
              <Bell className="w-5 h-5" />
              <span className="notification-badge">5</span>
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

export default AgencyPortal;