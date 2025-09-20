import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Users, 
  Shield,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/auth.slice';
import LoadingSpinner from '../../components/common/loading-spinner.component';
import './auth.styles.css';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedPortal, setSelectedPortal] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset
  } = useForm({
    mode: 'onChange'
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    if (!selectedPortal) {
      toast.error('Please select a portal type');
      return;
    }

    const registrationData = {
      ...data,
      portalType: selectedPortal
    };

    try {
      await dispatch(registerUser(registrationData)).unwrap();
      toast.success('Registration successful! Please check your email for verification.');
      reset();
      navigate('/login');
    } catch (error) {
      // Error is handled by the useEffect above
    }
  };

  const portalOptions = [
    {
      id: 'superadmin',
      title: 'Superadmin Portal',
      description: 'Full system access and global management',
      icon: <Shield className="w-8 h-8" />,
      features: ['Global oversight', 'System configuration', 'User management', 'Security controls'],
      color: 'primary'
    },
    {
      id: 'account',
      title: 'Account Portal',
      description: 'Tenant and account management',
      icon: <Building2 className="w-8 h-8" />,
      features: ['Tenant management', 'Analytics dashboard', 'Billing & reports', 'Account settings'],
      color: 'secondary'
    },
    {
      id: 'agency',
      title: 'Agency Portal',
      description: 'Client and project management',
      icon: <Users className="w-8 h-8" />,
      features: ['Client management', 'Project tracking', 'Team collaboration', 'Resource planning'],
      color: 'success'
    }
  ];

  const validatePassword = (value) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return 'Password must contain at least one special character';
    }
    return true;
  };

  if (loading) {
    return <LoadingSpinner message="Creating your account..." />;
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <Link to="/" className="back-link">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            
            <div className="brand-logo">
              <h1>NoemieX</h1>
              <p>Enterprise Multi-Portal System</p>
            </div>

            <div className="branding-features">
              <h3>Join thousands of companies using NoemieX</h3>
              <div className="feature-list">
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5" />
                  <span>Role-based access control</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5" />
                  <span>Real-time analytics</span>
                </div>
                <div className="feature-item">
                  <CheckCircle className="w-5 h-5" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>

            <div className="testimonial">
              <blockquote>
                "NoemieX has transformed how we manage our operations. The multi-portal 
                system is exactly what we needed for our enterprise."
              </blockquote>
              <cite>
                <strong>Sarah Johnson</strong>
                <span>IT Director, TechCorp Inc.</span>
              </cite>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Create Your Account</h2>
              <p>Get started with NoemieX today</p>
            </div>

            {/* Portal Selection */}
            <div className="portal-selection">
              <h3>Choose Your Portal Type</h3>
              <p>Select the portal that best fits your role and needs</p>
              
              <div className="portal-options">
                {portalOptions.map((portal) => (
                  <div
                    key={portal.id}
                    className={`portal-option ${selectedPortal === portal.id ? 'selected' : ''} ${portal.color}`}
                    onClick={() => setSelectedPortal(portal.id)}
                  >
                    <div className="portal-icon">
                      {portal.icon}
                    </div>
                    <div className="portal-info">
                      <h4>{portal.title}</h4>
                      <p>{portal.description}</p>
                      <div className="portal-features">
                        {portal.features.map((feature, index) => (
                          <span key={index} className="feature-tag">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="portal-selector">
                      <div className="radio-button">
                        {selectedPortal === portal.id && <div className="radio-inner" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      id="firstName"
                      placeholder="Enter your first name"
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters'
                        }
                      })}
                      className={errors.firstName ? 'error' : ''}
                    />
                  </div>
                  {errors.firstName && (
                    <span className="error-message">{errors.firstName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Enter your last name"
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters'
                        }
                      })}
                      className={errors.lastName ? 'error' : ''}
                    />
                  </div>
                  {errors.lastName && (
                    <span className="error-message">{errors.lastName.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    className={errors.email ? 'error' : ''}
                  />
                </div>
                {errors.email && (
                  <span className="error-message">{errors.email.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Create a strong password"
                    {...register('password', {
                      required: 'Password is required',
                      validate: validatePassword
                    })}
                    className={errors.password ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">{errors.password.message}</span>
                )}
                <div className="password-requirements">
                  <p>Password must contain:</p>
                  <ul>
                    <li className={password && password.length >= 8 ? 'valid' : ''}>
                      At least 8 characters
                    </li>
                    <li className={password && /(?=.*[a-z])/.test(password) ? 'valid' : ''}>
                      One lowercase letter
                    </li>
                    <li className={password && /(?=.*[A-Z])/.test(password) ? 'valid' : ''}>
                      One uppercase letter
                    </li>
                    <li className={password && /(?=.*\d)/.test(password) ? 'valid' : ''}>
                      One number
                    </li>
                    <li className={password && /(?=.*[@$!%*?&])/.test(password) ? 'valid' : ''}>
                      One special character
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match'
                    })}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-message">{errors.confirmPassword.message}</span>
                )}
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions'
                    })}
                  />
                  <span className="checkmark"></span>
                  I agree to the{' '}
                  <Link to="/terms" className="link">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="link">
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <span className="error-message">{errors.agreeToTerms.message}</span>
                )}
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading || !selectedPortal}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;