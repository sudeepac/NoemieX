import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import styles from './auth.module.css';

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
            </div>

            {/* Right side - Success Message */}
            <div className={styles.authPageFormContainer}>
              <div className={styles.authForm}>
                <div className={styles.authFormHeader}>
                  <div className={styles.successIcon}>
                    <CheckCircle size={48} />
                  </div>
                  <h2>Check Your Email</h2>
                  <p>
                    We've sent password reset instructions to <strong>{email}</strong>
                  </p>
                </div>

                <div className={styles.authFormContent}>
                  <div className={styles.successMessage}>
                    <p>
                      If an account with that email exists, you'll receive an email with 
                      instructions to reset your password within a few minutes.
                    </p>
                    <p>
                      Didn't receive the email? Check your spam folder or try again.
                    </p>
                  </div>

                  <div className={styles.authFormActions}>
                    <Link to="/login" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFullWidth}`}>
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
                  <Mail />
                </div>
                <div className={styles.featureContent}>
                  <h3>Secure Password Reset</h3>
                  <p>Reset your password safely and securely</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Forgot Password Form */}
          <div className={styles.authPageFormContainer}>
            <div className={styles.authForm}>
              <div className={styles.authFormHeader}>
                <h2>Forgot Password?</h2>
                <p>Enter your email address and we'll send you instructions to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className={styles.authFormContent}>
                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email Address</label>
                  <div className={styles.formInputGroup}>
                    <Mail className={styles.formInputGroupIcon} />
                    <input
                      type="email"
                      id="email"
                      className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
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
                    <span className={styles.formError}>{errors.email.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`${styles.btn} ${styles.btnPrimary} ${styles.btnFull}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Instructions...' : 'Send Reset Instructions'}
                </button>

                {/* Back to Login */}
                <div className={styles.authFormFooter}>
                  <Link to="/login" className={styles.authLink}>
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