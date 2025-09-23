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
import styles from './auth.module.css';

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
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        {/* Left Side - Branding */}
        <div className={styles.authBranding}>
          <div className={styles.brandingContent}>
            <Link to="/" className={styles.backLink}>
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
            
            <div className={styles.brandLogo}>
              <h1>NoemieX</h1>
              <p>Enterprise Multi-Portal System</p>
            </div>

            <div className={styles.brandingFeatures}>
              <h3>Join thousands of companies using NoemieX</h3>
              <div className={styles.featureList}>
                <div className={styles.featureItem}>
                  <CheckCircle className="w-5 h-5" />
                  <span>Enterprise-grade security</span>
                </div>
                <div className={styles.featureItem}>
                  <CheckCircle className="w-5 h-5" />
                  <span>Role-based access control</span>
                </div>
                <div className={styles.featureItem}>
                  <CheckCircle className="w-5 h-5" />
                  <span>Real-time analytics</span>
                </div>
                <div className={styles.featureItem}>
                  <CheckCircle className="w-5 h-5" />
                  <span>24/7 support</span>
                </div>
              </div>
            </div>

            <div className={styles.testimonial}>
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
        <div className={styles.authFormSection}>
          <div className={styles.authFormContainer}>
            <div className={styles.authHeader}>
              <h2>Create Your Account</h2>
              <p>Get started with NoemieX today</p>
            </div>

            {/* Portal Selection */}
            <div className={styles.portalSelection}>
              <h3>Choose Your Portal Type</h3>
              <p>Select the portal that best fits your role and needs</p>
              
              <div className={styles.portalOptions}>
                {portalOptions.map((portal) => (
                  <div
                    key={portal.id}
                    className={`${styles.portalOption} ${selectedPortal === portal.id ? styles.selected : ''} ${styles[portal.color]}`}
                    onClick={() => setSelectedPortal(portal.id)}
                  >
                    <div className={styles.portalIcon}>
                      {portal.icon}
                    </div>
                    <div className={styles.portalInfo}>
                      <h4>{portal.title}</h4>
                      <p>{portal.description}</p>
                      <div className={styles.portalFeatures}>
                        {portal.features.map((feature, index) => (
                          <span key={index} className={styles.featureTag}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className={styles.portalSelector}>
                      <div className={styles.radioButton}>
                        {selectedPortal === portal.id && <div className={styles.radioInner} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
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
                      className={errors.firstName ? styles.error : ''}
                    />
                  </div>
                  {errors.firstName && (
                    <span className={styles.errorMessage}>{errors.firstName.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <div className={styles.inputWrapper}>
                    <User className={styles.inputIcon} />
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
                      className={errors.lastName ? styles.error : ''}
                    />
                  </div>
                  {errors.lastName && (
                    <span className={styles.errorMessage}>{errors.lastName.message}</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} />
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
                    className={errors.email ? styles.error : ''}
                  />
                </div>
                {errors.email && (
                  <span className={styles.errorMessage}>{errors.email.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    placeholder="Create a strong password"
                    {...register('password', {
                      required: 'Password is required',
                      validate: validatePassword
                    })}
                    className={errors.password ? styles.error : ''}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className={styles.errorMessage}>{errors.password.message}</span>
                )}
                <div className={styles.passwordRequirements}>
                  <p>Password must contain:</p>
                  <ul>
                    <li className={password && password.length >= 8 ? styles.valid : ''}>
                      At least 8 characters
                    </li>
                    <li className={password && /(?=.*[a-z])/.test(password) ? styles.valid : ''}>
                      One lowercase letter
                    </li>
                    <li className={password && /(?=.*[A-Z])/.test(password) ? styles.valid : ''}>
                      One uppercase letter
                    </li>
                    <li className={password && /(?=.*\d)/.test(password) ? styles.valid : ''}>
                      One number
                    </li>
                    <li className={password && /(?=.*[@$!%*?&])/.test(password) ? styles.valid : ''}>
                      One special character
                    </li>
                  </ul>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <Lock className={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match'
                    })}
                    className={errors.confirmPassword ? styles.error : ''}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className={styles.errorMessage}>{errors.confirmPassword.message}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    {...register('agreeToTerms', {
                      required: 'You must agree to the terms and conditions'
                    })}
                  />
                  <span className={styles.checkmark}></span>
                  I agree to the{' '}
                  <Link to="/terms" className={styles.link}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>
                </label>
                {errors.agreeToTerms && (
                  <span className={styles.errorMessage}>{errors.agreeToTerms.message}</span>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || !selectedPortal}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className={styles.authFooter}>
              <p>
                Already have an account?{' '}
                <Link to="/login" className={styles.link}>
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