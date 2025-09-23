import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Eye, EyeOff, LogIn, Building, Users, User, Zap } from 'lucide-react';
import { clearError, setCredentials } from '../../store/slices/auth.slice';
import { useLoginMutation } from '../../store/api/authApi';
import styles from './auth.module.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { error } = useSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  
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
      const result = await login(data).unwrap();
      
      // Set credentials in Redux store
      dispatch(setCredentials({
        user: result.user,
        token: result.token
      }));
      
      toast.success('Login successful!');
      
      // Redirect to intended page or portal dashboard
      const from = location.state?.from?.pathname || `/${result.user.portalType}`;
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error?.data?.message || 'Login failed');
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
    <div className={styles.authPage}>
      <div className={styles.authPageContainer}>
        <div className={styles.authPageContent}>
          {/* Left side - Branding */}
          <div className={styles.authPageBranding}>
            <div className={styles.authPageBrand}>
              <h1 className={styles.authPageBrandTitle}>NoemieX</h1>
              <p className={styles.authPageBrandSubtitle}>
                Multi-tenant billing system for study abroad agencies
              </p>
            </div>
            
            <div className={styles.authPageFeatures}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Building />
                </div>
                <div className={styles.featureContent}>
                  <h3>Multi-tenant Architecture</h3>
                  <p>Secure data isolation for each account</p>
                </div>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Users />
                </div>
                <div className={styles.featureContent}>
                  <h3>Role-based Access</h3>
                  <p>Granular permissions and user management</p>
                </div>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <LogIn />
                </div>
                <div className={styles.featureContent}>
                  <h3>Secure Authentication</h3>
                  <p>JWT-based authentication with refresh tokens</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className={styles.authPageFormContainer}>
            <div className={styles.authForm}>
              <div className={styles.authFormHeader}>
                <h2 className={styles.authFormTitle}>Welcome Back</h2>
                <p className={styles.authFormSubtitle}>
                  Sign in to your account to continue
                </p>
              </div>

              {/* Demo Users Quick Login */}
              <div className={styles.demoUsersSection}>
                <button
                  type="button"
                  onClick={() => setShowDemoUsers(!showDemoUsers)}
                  className={styles.demoUsersToggle}
                >
                  <Zap size={16} />
                  {showDemoUsers ? 'Hide Demo Users' : 'Quick Login with Demo Users'}
                </button>
                
                {showDemoUsers && (
                  <div className={styles.demoUsersGrid}>
                    <div className={styles.demoUsersHeader}>
                      <p>Click any user below to auto-fill login credentials:</p>
                    </div>
                    
                    {/* Super Admin Users */}
                    <div className={styles.demoPortalGroup}>
                      <h4 className={styles.demoPortalTitle}>
                        <Building size={16} />
                        Super Admin Portal
                      </h4>
                      <div className={styles.demoUsersList}>
                        {demoUsers.filter(user => user.portalType === 'superadmin').map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className={styles.demoUserCard}
                          >
                            <div className={styles.demoUserInfo}>
                              <span className={styles.demoUserName}>{user.name}</span>
                              <span className={styles.demoUserRole}>{user.role}</span>
                              <span className={styles.demoUserEmail}>{user.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Account Portal Users */}
                    <div className={styles.demoPortalGroup}>
                      <h4 className={styles.demoPortalTitle}>
                        <Users size={16} />
                        Account Portal
                      </h4>
                      <div className={styles.demoUsersList}>
                        {demoUsers.filter(user => user.portalType === 'account').map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className={styles.demoUserCard}
                          >
                            <div className={styles.demoUserInfo}>
                              <span className={styles.demoUserName}>{user.name}</span>
                              <span className={styles.demoUserRole}>{user.role}</span>
                              <span className={styles.demoUserEmail}>{user.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Agency Portal Users */}
                    <div className={styles.demoPortalGroup}>
                      <h4 className={styles.demoPortalTitle}>
                        <User size={16} />
                        Agency Portal
                      </h4>
                      <div className={styles.demoUsersList}>
                        {demoUsers.filter(user => user.portalType === 'agency').map((user, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleQuickLogin(user)}
                            className={styles.demoUserCard}
                          >
                            <div className={styles.demoUserInfo}>
                              <span className={styles.demoUserName}>{user.name}</span>
                              <span className={styles.demoUserRole}>{user.role}</span>
                              <span className={styles.demoUserEmail}>{user.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className={styles.authFormForm}>
                {/* Portal Selection */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Select Portal</label>
                  <div className={styles.portalOptions}>
                    {portalOptions.map((option) => (
                      <label key={option.value} className={styles.portalOption}>
                        <input
                          type="radio"
                          value={option.value}
                          {...register('portalType', { 
                            required: 'Please select a portal' 
                          })}
                          className={styles.portalOptionInput}
                        />
                        <div className={`${styles.portalOptionContent} ${
                          selectedPortal === option.value ? styles.portalOptionContentSelected : ''
                        }`}>
                          {option.icon}
                          <div className={styles.portalOptionText}>
                            <span className={styles.portalOptionLabel}>{option.label}</span>
                            <span className={styles.portalOptionDescription}>{option.description}</span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.portalType && (
                    <span className={styles.formError}>{errors.portalType.message}</span>
                  )}
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
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
                    <span className={styles.formError}>{errors.email.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>Password</label>
                  <div className={styles.formInputGroup}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      className={`${styles.formInput} ${errors.password ? styles.formInputError : ''}`}
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
                      className={styles.formInputGroupButton}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className={styles.formError}>{errors.password.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFullWidth}`}
                >
                  {isLoading ? (
                    <span className={styles.btnLoading}>
                      <div className={styles.btnSpinner}></div>
                      Signing in...
                    </span>
                  ) : (
                    <span className={styles.btnContent}>
                      <LogIn size={20} />
                      Sign In
                    </span>
                  )}
                </button>
              </form>

              <div className={styles.authFormFooter}>
                <p className={styles.authFormFooterText}>
                  Don't have an account?{' '}
                  <Link to="/register" className={styles.authFormLink}>
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