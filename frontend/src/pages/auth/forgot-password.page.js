import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import './auth.styles.css';

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();

  const email = watch('email');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // TODO: Implement forgot password API call
      console.log('Forgot password request:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error('Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
            </div>

            {/* Right side - Success Message */}
            <div className="auth-page__form-container">
              <div className="auth-form">
                <div className="auth-form__header">
                  <div className="success-icon">
                    <CheckCircle size={48} />
                  </div>
                  <h2>Check Your Email</h2>
                  <p>
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                </div>

                <div className="auth-form__content">
                  <div className="success-message">
                    <p>
                      If an account with that email exists, you'll receive an email with 
                      instructions to reset your password within a few minutes.
                    </p>
                    <p>
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  <div className="auth-form__actions">
                    <Link to="/login" className="btn btn-primary btn-full">
                      <ArrowLeft size={20} />
                      Back to Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  <Mail />
                </div>
                <div className="feature__content">
                  <h3>Secure Password Reset</h3>
                  <p>Reset your password safely and securely</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Forgot Password Form */}
          <div className="auth-page__form-container">
            <div className="auth-form">
              <div className="auth-form__header">
                <h2>Forgot Password?</h2>
                <p>Enter your email address and we'll send you instructions to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="auth-form__content">
                {/* Email */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <div className="form-input-group">
                    <Mail className="form-input-group__icon" />
                    <input
                      type="email"
                      id="email"
                      className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                      placeholder="Enter your email address"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Please enter a valid email address'
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
                </button>

                {/* Back to Login */}
                <div className="auth-form__footer">
                  <Link to="/login" className="auth-link">
                    <ArrowLeft size={16} />
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;