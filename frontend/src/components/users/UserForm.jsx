import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetUserQuery,
  useCreateUserMutation, 
  useUpdateUserMutation,
  useGetAccountsQuery,
  useGetAgenciesQuery
} from '../../store/api/api';
import { 
  createUserFormData, 
  validateUserForm,
  USER_ROLES, 
  PORTAL_TYPES, 
  userHelpers 
} from '../../types/user.types';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../../shared/components/ErrorMessage';
import styles from './UserForm.module.css';

// UserForm component for creating and editing users
function UserForm() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEditing = Boolean(userId);
  
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
    clearErrors
  } = useForm({
    defaultValues: createUserFormData(),
    mode: 'onChange'
  });
  
  const formData = watch();

  // RTK Query hooks
  const { 
    data: userData, 
    isLoading: isLoadingUser, 
    isError: isUserError 
  } = useGetUserQuery(userId, { skip: !isEditing });

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();

  // Load user data for editing
  useEffect(() => {
    if (isEditing && userData?.data) {
      const user = userData.data;
      const userFormData = {
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || USER_ROLES.USER,
        portalType: user.portalType || PORTAL_TYPES.AGENCY,
        accountId: user.accountId?._id || '',
        agencyId: user.agencyId?._id || '',
        isActive: user.isActive !== undefined ? user.isActive : true,
        profile: {
          phone: user.profile?.phone || '',
          address: user.profile?.address || '',
          department: user.profile?.department || '',
          position: user.profile?.position || '',
          notes: user.profile?.notes || ''
        },
        // Don't populate password fields for editing
        password: '',
        confirmPassword: ''
      };
      reset(userFormData);
    }
  }, [isEditing, userData, reset]);

  // Custom validation function for React Hook Form
  const validateForm = (data) => {
    const validationErrors = validateUserForm(data, isEditing);
    return Object.keys(validationErrors).length === 0 ? true : validationErrors;
  };

  // Handle form submission
  const onSubmit = async (data) => {
    // Check permissions
    if (!canSubmitForm()) {
      alert('You do not have permission to perform this action');
      return;
    }
    
    try {
      // Prepare data for submission
      const submitData = {
        ...data,
        // Remove password fields if empty during edit
        ...(isEditing && !data.password && {
          password: undefined,
          confirmPassword: undefined
        })
      };

      if (isEditing) {
        await updateUser({ id: userId, userData: submitData }).unwrap();
        alert('User updated successfully');
      } else {
        await createUser(submitData).unwrap();
        alert('User created successfully');
      }
      
      navigate('/users');
    } catch (error) {
      console.error('Form submission error:', error);
      alert(`Error ${isEditing ? 'updating' : 'creating'} user: ${error.data?.message || error.message}`);
    }
  };

  // Check if current user can submit the form
  const canSubmitForm = () => {
    if (!currentUser) return false;
    
    if (isEditing) {
      // Check if user can edit this specific user
      const targetUser = userData?.data;
      if (!targetUser) return false;
      
      // Users can edit themselves (limited fields)
      if (currentUser._id === targetUser._id) return true;
      
      // Check role hierarchy and portal access
      return userHelpers.canManageUser(currentUser, targetUser);
    } else {
      // Check if user can create users
      return currentUser.portalType === PORTAL_TYPES.SUPERADMIN || 
             [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(currentUser.role);
    }
  };

  // Get available roles based on current user
  const getAvailableRoles = () => {
    if (!currentUser) return [];
    
    const roles = Object.values(USER_ROLES);
    
    if (currentUser.portalType === PORTAL_TYPES.SUPERADMIN) {
      return roles;
    }
    
    // Users can only assign roles they can manage
    const currentUserLevel = userHelpers.ROLE_HIERARCHY[currentUser.role] || 0;
    return roles.filter(role => {
      const roleLevel = userHelpers.ROLE_HIERARCHY[role] || 0;
      return roleLevel < currentUserLevel;
    });
  };

  // Get available portal types based on current user
  const getAvailablePortalTypes = () => {
    if (!currentUser) return [];
    
    if (currentUser.portalType === PORTAL_TYPES.SUPERADMIN) {
      return Object.values(PORTAL_TYPES);
    }
    
    // Account users can only create agency users
    if (currentUser.portalType === PORTAL_TYPES.ACCOUNT) {
      return [PORTAL_TYPES.AGENCY];
    }
    
    // Agency users can only create agency users
    return [PORTAL_TYPES.AGENCY];
  };

  // Check if field should be disabled
  const isFieldDisabled = (field) => {
    if (!currentUser) return true;
    
    // If editing yourself, only allow certain fields
    if (isEditing && userData?.data && currentUser._id === userData.data._id) {
      const allowedFields = ['firstName', 'lastName', 'profile.phone', 'profile.address', 'profile.department', 'profile.position'];
      return !allowedFields.includes(field);
    }
    
    // Superadmin can edit everything
    if (currentUser.portalType === PORTAL_TYPES.SUPERADMIN) {
      return false;
    }
    
    // Portal type is restricted based on current user's portal
    if (field === 'portalType') {
      return getAvailablePortalTypes().length <= 1;
    }
    
    return false;
  };

  if (isEditing && isLoadingUser) {
    return <LoadingSpinner />;
  }

  if (isEditing && isUserError) {
    return (
      <ErrorMessage 
        error={{message: "Failed to load user data for editing"}} 
        variant="page" 
        type="error"
        title="Error Loading User"
      />
      <button onClick={() => navigate('/users')} className={`${styles.btn} ${styles.btnPrimary}`}>
        Back to Users
      </button>
    );
  }

  if (!canSubmitForm()) {
    return (
      <ErrorMessage 
        error={{message: `You do not have permission to ${isEditing ? 'edit this user' : 'create users'}`}} 
        variant="page" 
        type="error"
        title="Access Denied"
      />
      <button onClick={() => navigate('/users')} className={`${styles.btn} ${styles.btnPrimary}`}>
        Back to Users
      </button>
    );
  }

  return (
    <div className={styles.userFormContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1>{isEditing ? 'Edit User' : 'Create New User'}</h1>
          <p>{isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}</p>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={() => navigate('/users')} 
            className={`${styles.btn} ${styles.btnOutline}`}
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.userForm}>
        <div className={styles.formSections}>
          {/* Basic Information */}
          <div className={styles.formSection}>
            <h3>Basic Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  disabled={isFieldDisabled('email')}
                  className={errors.email ? styles.error : ''}
                  placeholder="user@example.com"
                />
                <ErrorMessage error={errors.email} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters'
                    }
                  })}
                  disabled={isFieldDisabled('firstName')}
                  className={errors.firstName ? styles.error : ''}
                  placeholder="John"
                />
                <ErrorMessage error={errors.firstName} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters'
                    }
                  })}
                  disabled={isFieldDisabled('lastName')}
                  className={errors.lastName ? styles.error : ''}
                  placeholder="Doe"
                />
                <ErrorMessage error={errors.lastName} variant="inline" type="validation" />
              </div>
            </div>
          </div>

          {/* Role and Permissions */}
          <div className={styles.formSection}>
            <h3>Role and Permissions</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  {...register('role', {
                    required: 'Role is required'
                  })}
                  disabled={isFieldDisabled('role')}
                  className={errors.role ? styles.error : ''}
                >
                  {getAvailableRoles().map(role => (
                    <option key={role} value={role}>
                      {userHelpers.getRoleDisplayText(role)}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={errors.role} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="portalType">Portal Type *</label>
                <select
                  id="portalType"
                  {...register('portalType', {
                    required: 'Portal type is required'
                  })}
                  disabled={isFieldDisabled('portalType')}
                  className={errors.portalType ? styles.error : ''}
                >
                  {getAvailablePortalTypes().map(portal => (
                    <option key={portal} value={portal}>
                      {userHelpers.getPortalDisplayText(portal)}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={errors.portalType} variant="inline" type="validation" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  {...register('isActive', {
                    setValueAs: (value) => value === 'true'
                  })}
                  disabled={isFieldDisabled('isActive')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className={styles.formSection}>
            <h3>Organization</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="accountId">Account</label>
                <input
                  type="text"
                  id="accountId"
                  {...register('accountId')}
                  disabled={isFieldDisabled('accountId')}
                  placeholder="Account ID (will be auto-assigned based on portal)"
                />
                <small className={styles.helpText}>
                  Account will be automatically assigned based on your portal access
                </small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="agencyId">Agency</label>
                <input
                  type="text"
                  id="agencyId"
                  {...register('agencyId')}
                  disabled={isFieldDisabled('agencyId')}
                  placeholder="Agency ID (optional for account-level users)"
                />
                <small className={styles.helpText}>
                  Required for agency portal users, optional for account-level users
                </small>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className={styles.formSection}>
            <h3>Profile Information</h3>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  {...register('profile.phone')}
                  disabled={isFieldDisabled('profile.phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  {...register('profile.department')}
                  disabled={isFieldDisabled('profile.department')}
                  placeholder="Sales, Marketing, Operations, etc."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  {...register('profile.position')}
                  disabled={isFieldDisabled('profile.position')}
                  placeholder="Manager, Specialist, Coordinator, etc."
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  {...register('profile.address')}
                  disabled={isFieldDisabled('profile.address')}
                  placeholder="Street address, city, state, zip code"
                  rows="3"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  {...register('profile.notes')}
                  disabled={isFieldDisabled('profile.notes')}
                  placeholder="Additional notes about this user"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          {(!isEditing || (isEditing && currentUser._id === userData?.data?._id)) && (
            <div className={styles.formSection}>
              <h3>{isEditing ? 'Change Password' : 'Password'}</h3>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">
                    {isEditing ? 'New Password' : 'Password'} {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: !isEditing ? 'Password is required' : false,
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters long'
                      }
                    })}
                    className={errors.password ? styles.error : ''}
                    placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  <ErrorMessage error={errors.password} variant="inline" type="validation" />
                  {!isEditing && (
                    <small className={styles.helpText}>
                      Password must be at least 8 characters long
                    </small>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">
                    Confirm {isEditing ? 'New ' : ''}Password {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    {...register('confirmPassword', {
                      required: !isEditing ? 'Please confirm your password' : false,
                      validate: (value) => {
                        const password = watch('password');
                        if (!isEditing && password && value !== password) {
                          return 'Passwords do not match';
                        }
                        if (isEditing && password && value !== password) {
                          return 'Passwords do not match';
                        }
                        return true;
                      }
                    })}
                    className={errors.confirmPassword ? styles.error : ''}
                    placeholder="Confirm password"
                  />
                  <ErrorMessage error={errors.confirmPassword} variant="inline" type="validation" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={() => navigate('/users')} 
            className={`${styles.btn} ${styles.btnOutline}`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;

// AI-NOTE: Migrated UserForm from useState to React Hook Form for better performance and validation. Maintained all role-based restrictions, nested object handling (profile fields), and conditional validation for password fields. Form now uses register() for field binding and handleSubmit() wrapper for submission.