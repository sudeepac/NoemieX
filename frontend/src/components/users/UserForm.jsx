import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  useGetUserQuery,
  useCreateUserMutation, 
  useUpdateUserMutation 
} from '../../store/api/users.api';
import { 
  createUserFormData, 
  validateUserForm,
  USER_ROLES, 
  PORTAL_TYPES, 
  userHelpers 
} from '../../types/user.types';
import LoadingSpinner from '../common/loading-spinner.component';
import './UserForm.css';

// UserForm component for creating and editing users
function UserForm() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEditing = Boolean(userId);
  
  const { user: currentUser } = useSelector((state) => state.auth);
  
  // Form state
  const [formData, setFormData] = useState(createUserFormData());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setFormData({
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
      });
    }
  }, [isEditing, userData]);

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateUserForm(formData, isEditing);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check permissions
    if (!canSubmitForm()) {
      alert('You do not have permission to perform this action');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Remove password fields if empty during edit
        ...(isEditing && !formData.password && {
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
    } finally {
      setIsSubmitting(false);
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
      <div className="error-container">
        <h3>Error Loading User</h3>
        <p>Failed to load user data for editing</p>
        <button onClick={() => navigate('/users')} className="btn btn-primary">
          Back to Users
        </button>
      </div>
    );
  }

  if (!canSubmitForm()) {
    return (
      <div className="error-container">
        <h3>Access Denied</h3>
        <p>You do not have permission to {isEditing ? 'edit this user' : 'create users'}</p>
        <button onClick={() => navigate('/users')} className="btn btn-primary">
          Back to Users
        </button>
      </div>
    );
  }

  return (
    <div className="user-form-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>{isEditing ? 'Edit User' : 'Create New User'}</h1>
          <p>{isEditing ? 'Update user information and permissions' : 'Add a new user to the system'}</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => navigate('/users')} 
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-sections">
          {/* Basic Information */}
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  disabled={isFieldDisabled('email')}
                  className={errors.email ? 'error' : ''}
                  placeholder="user@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  disabled={isFieldDisabled('firstName')}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="John"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  disabled={isFieldDisabled('lastName')}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Doe"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>
          </div>

          {/* Role and Permissions */}
          <div className="form-section">
            <h3>Role and Permissions</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  disabled={isFieldDisabled('role')}
                  className={errors.role ? 'error' : ''}
                >
                  {getAvailableRoles().map(role => (
                    <option key={role} value={role}>
                      {userHelpers.getRoleDisplayText(role)}
                    </option>
                  ))}
                </select>
                {errors.role && <span className="error-text">{errors.role}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="portalType">Portal Type *</label>
                <select
                  id="portalType"
                  value={formData.portalType}
                  onChange={(e) => handleChange('portalType', e.target.value)}
                  disabled={isFieldDisabled('portalType')}
                  className={errors.portalType ? 'error' : ''}
                >
                  {getAvailablePortalTypes().map(portal => (
                    <option key={portal} value={portal}>
                      {userHelpers.getPortalDisplayText(portal)}
                    </option>
                  ))}
                </select>
                {errors.portalType && <span className="error-text">{errors.portalType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="isActive">Status</label>
                <select
                  id="isActive"
                  value={formData.isActive.toString()}
                  onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                  disabled={isFieldDisabled('isActive')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="form-section">
            <h3>Organization</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="accountId">Account</label>
                <input
                  type="text"
                  id="accountId"
                  value={formData.accountId}
                  onChange={(e) => handleChange('accountId', e.target.value)}
                  disabled={isFieldDisabled('accountId')}
                  placeholder="Account ID (will be auto-assigned based on portal)"
                />
                <small className="help-text">
                  Account will be automatically assigned based on your portal access
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="agencyId">Agency</label>
                <input
                  type="text"
                  id="agencyId"
                  value={formData.agencyId}
                  onChange={(e) => handleChange('agencyId', e.target.value)}
                  disabled={isFieldDisabled('agencyId')}
                  placeholder="Agency ID (optional for account-level users)"
                />
                <small className="help-text">
                  Required for agency portal users, optional for account-level users
                </small>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="form-section">
            <h3>Profile Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.profile.phone}
                  onChange={(e) => handleChange('profile.phone', e.target.value)}
                  disabled={isFieldDisabled('profile.phone')}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <input
                  type="text"
                  id="department"
                  value={formData.profile.department}
                  onChange={(e) => handleChange('profile.department', e.target.value)}
                  disabled={isFieldDisabled('profile.department')}
                  placeholder="Sales, Marketing, Operations, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  value={formData.profile.position}
                  onChange={(e) => handleChange('profile.position', e.target.value)}
                  disabled={isFieldDisabled('profile.position')}
                  placeholder="Manager, Specialist, Coordinator, etc."
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  value={formData.profile.address}
                  onChange={(e) => handleChange('profile.address', e.target.value)}
                  disabled={isFieldDisabled('profile.address')}
                  placeholder="Street address, city, state, zip code"
                  rows="3"
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={formData.profile.notes}
                  onChange={(e) => handleChange('profile.notes', e.target.value)}
                  disabled={isFieldDisabled('profile.notes')}
                  placeholder="Additional notes about this user"
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Password Section */}
          {(!isEditing || (isEditing && currentUser._id === userData?.data?._id)) && (
            <div className="form-section">
              <h3>{isEditing ? 'Change Password' : 'Password'}</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="password">
                    {isEditing ? 'New Password' : 'Password'} {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder={isEditing ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  {errors.password && <span className="error-text">{errors.password}</span>}
                  {!isEditing && (
                    <small className="help-text">
                      Password must be at least 8 characters long
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm {isEditing ? 'New ' : ''}Password {!isEditing && '*'}
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'error' : ''}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/users')} 
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
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

// AI-NOTE: Created comprehensive UserForm component with role-based field restrictions, validation, and portal-specific logic. Handles both create and edit modes with proper permission checks.