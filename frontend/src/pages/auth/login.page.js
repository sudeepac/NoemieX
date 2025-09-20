import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff, LogIn, Building, Users, User, Zap } from 'lucide-react';
import { loginUser, clearError } from '../../store/slices/auth.slice';
import './auth.styles.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoading, error } = useSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  const selectedPortal = watch('portalType');

  // Demo users data from the seeded database (SeedDatabase.js)
  const demoUsers = [
    // Super Admin Users
    {
      email: 'superadmin@noemiex.com',
      password: 'SuperAdmin123!',
      portalType: 'superadmin',
      name: 'Super Admin',
      role: 'Super Admin',
      description: 'Full system access'
    },
    {
      email: 'manager.super@noemiex.com',
      password: 'Manager123!',
      portalType: 'superadmin',
      name: 'Super Manager',
      role: 'Manager',
      description: 'System management'
    },
    {
      email: 'user.super@noemiex.com',
      password: 'User123!',
      portalType: 'superadmin',
      name: 'Super User',
      role: 'User',
      description: 'Basic super admin access'
    },
    // Account Portal Users
    {
      email: 'admin@demo.com',
      password: 'Admin123!',
      portalType: 'account',
      name: 'Account Admin',
      role: 'Admin',
      description: 'Account management'
    },
    {
      email: 'manager@demo.com',
      password: 'Manager123!',
      portalType: 'account',
      name: 'Account Manager',
      role: 'Manager',
      description: 'Account operations'
    },
    {
      email: 'user@demo.com',
      password: 'User123!',
      portalType: 'account',
      name: 'Account User',
      role: 'User',
      description: 'Basic account access'
    },
    // Agency Portal Users
    {
      email: 'admin@demoagency.com',
      password: 'Admin123!',
      portalType: 'agency',
      name: 'Agency Admin',
      role: 'Admin',
      description: 'Agency management'
    },
    {
      email: 'manager@demoagency.com',
      password: 'Manager123!',
      portalType: 'agency',
      name: 'Agency Manager',
      role: 'Manager',
      description: 'Agency operations'
    },
    {
      email: 'user@demoagency.com',
      password: 'User123!',
      portalType: 'agency',
      name: 'Agency User',
      role: 'User',
      description: 'Basic agency access'
    }
  ];

  // Quick login function
  const handleQuickLogin = (user) => {
    setValue('email', user.email);
    setValue('password', user.password);
    setValue('portalType', user.portalType);
    setShowDemoUsers(false);
    toast.info(`Demo login selected: ${user.name}`);
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      
      toast.success('Login successful!');
      
      // Redirect to intended page or portal dashboard
      const from = location.state?.from?.pathname || `/${result.user.portalType}`;
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const portalOptions = [
    {
      value: 'superadmin',
      label: 'Super Admin',
      description: 'System administration',
      icon: <Building className="portal-option__icon" />
    },
    {
      value: 'account',
      label: 'Account Portal',
      description: 'Account management',
      icon: <Users className="portal-option__icon" />
    },
    {
      value: 'agency',
      label: 'Agency Portal',
      description: 'Agency operations',
      icon: <User className="portal-option__icon" />
    }
  ];

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__content">
          {/* Left side - Branding */}
          <div className="auth-page__branding">
            <div className="auth-page__brand">
              <h1 className="auth-page__brand-title">NoemieX</h1>
              <p className="auth-page__brand-subtitle">
                Multi-tenant billing system for study abroad agencies
              </p>
            </div>
            
            <div className="auth-page__features">
              <div className="feature">
                <div className="feature__icon">
                  <Building />
                </div>
                <div className="feature__content">
                  <h3>Multi-tenant Architecture</h3>
                  <p>Secure data isolation for each account</p>
                </div>
              </div>
              
              <div className="feature">
                <div className="feature__icon">
                  <Users />
                </div>
                <div className="feature__content">
                  <h3>Role-based Access</h3>
                  <p>Granular permissions and user management</p>
                </div>
              </div>
              
              <div className="feature">
                <div className="feature__icon">
                  <LogIn />
                </div>
                <div className="feature__content">
                  <h3>Secure Authentication</h3>
                  <p>JWT-based authentication with refresh tokens</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="auth-page__form-container">
            <div className="auth-form">
              <div className="auth-form__header">
                <h2 className="auth-form__title">Welcome Back</h2>
                <p className="auth-form__subtitle">
                  Sign in to your account to continue
                </p>
              </div>

              {/* Demo Users Quick Login */}
              <div className="demo-users-section">
                <button
                  type="button"
                  onClick={() => setShowDemoUsers(!showDemoUsers)}
                  className="demo-users-toggle"
                >
                  <Zap size={16} />
                  {showDemoUsers ? 'Hide Demo Users' : 'Quick Login with Demo Users'}
                </button>
                
                {showDemoUsers && (
                  <div className="demo-users-grid">
                    <div className="demo-users-header">
                      <p>Click any user below to auto-fill login credentials:</p>
                    </div>
                    
                    {/* Super Admin Users */}
                    <div className="demo-portal-group">
                      <h4 className="demo-portal-title">
                        <Building size={16} />
                        Super Admin Portal
                      </h4>
                      <div className="demo-users-list">
                        {demoUsers.filter(user => user.portalType === 'superadmin').map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className="demo-user-card"
                          >
                            <div className="demo-user-info">
                              <span className="demo-user-name">{user.name}</span>
                              <span className="demo-user-role">{user.role}</span>
                              <span className="demo-user-email">{user.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Account Portal Users */}
                    <div className="demo-portal-group">
                      <h4 className="demo-portal-title">
                        <Users size={16} />
                        Account Portal
                      </h4>
                      <div className="demo-users-list">
                        {demoUsers.filter(user => user.portalType === 'account').map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className="demo-user-card"
                          >
                            <div className="demo-user-info">
                              <span className="demo-user-name">{user.name}</span>
                              <span className="demo-user-role">{user.role}</span>
                              <span className="demo-user-email">{user.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Agency Portal Users */}
                    <div className="demo-portal-group">
                      <h4 className="demo-portal-title">
                        <User size={16} />
                        Agency Portal
                      </h4>
                      <div className="demo-users-list">
                        {demoUsers.filter(user => user.portalType === 'agency').map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className="demo-user-card"
                          >
                            <div className="demo-user-info">
                              <span className="demo-user-name">{user.name}</span>
                              <span className="demo-user-role">{user.role}</span>
                              <span className="demo-user-email">{user.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form__form">
                {/* Portal Selection */}
                <div className="form-group">
                  <label className="form-label">Select Portal</label>
                  <div className="portal-options">
                    {portalOptions.map((option) => (
                      <label key={option.value} className="portal-option">
                        <input
                          type="radio"
                          value={option.value}
                          {...register('portalType', { 
                            required: 'Please select a portal' 
                          })}
                          className="portal-option__input"
                        />
                        <div className={`portal-option__content ${
                          selectedPortal === option.value ? 'portal-option__content--selected' : ''
                        }`}>
                          {option.icon}
                          <div className="portal-option__text">
                            <span className="portal-option__label">{option.label}</span>
                            <span className="portal-option__description">{option.description}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.portalType && (
                    <span className="form-error">{errors.portalType.message}</span>
                  )}
                </div>

                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                    placeholder="Enter your email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <div className="form-input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                      placeholder="Enter your password"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    <button
                      type="button"
                      className="form-input-group__button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="form-error">{errors.password.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn--primary btn--full-width"
                >
                  {isLoading ? (
                    <span className="btn__loading">
                      <div className="btn__spinner"></div>
                      Signing in...
                    </span>
                  ) : (
                    <span className="btn__content">
                      <LogIn size={20} />
                      Sign In
                    </span>
                  )}
                </button>
              </form>

              <div className="auth-form__footer">
                <p className="auth-form__footer-text">
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-form__link">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;