// User-related type definitions and constants

// User roles hierarchy
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager', 
  USER: 'user'
};

// Portal types
export const PORTAL_TYPES = {
  SUPERADMIN: 'superadmin',
  ACCOUNT: 'account',
  AGENCY: 'agency'
};

// User status options
export const USER_STATUS = {
  ACTIVE: true,
  INACTIVE: false
};

// Role hierarchy for permission checking
export const ROLE_HIERARCHY = {
  [USER_ROLES.ADMIN]: 3,
  [USER_ROLES.MANAGER]: 2,
  [USER_ROLES.USER]: 1
};

// User profile structure
export const createUserProfile = () => ({
  avatar: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    notifications: {
      email: true,
      sms: false,
      push: true
    }
  }
});

// User form data structure for creating/editing users
export const createUserFormData = () => ({
  accountId: '',
  agencyId: '',
  email: '',
  hashedPassword: '',
  firstName: '',
  lastName: '',
  role: USER_ROLES.USER,
  portalType: PORTAL_TYPES.ACCOUNT,
  managerId: '',
  profile: createUserProfile(),
  permissions: [],
  isActive: USER_STATUS.ACTIVE
});

// User filters for list view
export const createUserFilters = () => ({
  page: 1,
  limit: 10,
  search: '',
  role: '',
  portalType: '',
  isActive: undefined,
  agencyId: '',
  accountId: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Password change form data
export const createPasswordChangeData = () => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// User validation rules
export const USER_VALIDATION = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'First name must be between 2 and 50 characters'
  },
  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Last name must be between 2 and 50 characters'
  }
};

// Helper functions for user operations
export const userHelpers = {
  // Get user's full name
  getFullName: (user) => {
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  },

  // Check if user can manage another user based on role hierarchy
  canManageUser: (currentUser, targetUser) => {
    if (!currentUser || !targetUser) return false;
    
    // Superadmin can manage anyone
    if (currentUser.portalType === PORTAL_TYPES.SUPERADMIN) return true;
    
    // Users can't manage users with higher or equal roles
    const currentUserLevel = ROLE_HIERARCHY[currentUser.role] || 0;
    const targetUserLevel = ROLE_HIERARCHY[targetUser.role] || 0;
    
    return currentUserLevel > targetUserLevel;
  },

  // Check if user belongs to same account
  isSameAccount: (user1, user2) => {
    if (!user1 || !user2) return false;
    return user1.accountId === user2.accountId;
  },

  // Check if user belongs to same agency
  isSameAgency: (user1, user2) => {
    if (!user1 || !user2) return false;
    return user1.agencyId === user2.agencyId;
  },

  // Get user status display text
  getStatusText: (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  },

  // Get user role display text
  getRoleDisplayText: (role) => {
    const roleMap = {
      [USER_ROLES.ADMIN]: 'Administrator',
      [USER_ROLES.MANAGER]: 'Manager',
      [USER_ROLES.USER]: 'User'
    };
    return roleMap[role] || role;
  },

  // Get portal type display text
  getPortalDisplayText: (portalType) => {
    const portalMap = {
      [PORTAL_TYPES.SUPERADMIN]: 'Super Admin',
      [PORTAL_TYPES.ACCOUNT]: 'Account',
      [PORTAL_TYPES.AGENCY]: 'Agency'
    };
    return portalMap[portalType] || portalType;
  },

  // Validate user form data
  validateUserForm: (formData) => {
    const errors = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!USER_VALIDATION.email.pattern.test(formData.email)) {
      errors.email = USER_VALIDATION.email.message;
    }

    // Password validation (only for new users)
    if (!formData._id && !formData.hashedPassword) {
      errors.hashedPassword = 'Password is required';
    } else if (formData.hashedPassword && formData.hashedPassword.length < USER_VALIDATION.password.minLength) {
      errors.hashedPassword = USER_VALIDATION.password.message;
    }

    // First name validation
    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.length < USER_VALIDATION.firstName.minLength) {
      errors.firstName = USER_VALIDATION.firstName.message;
    }

    // Last name validation
    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.length < USER_VALIDATION.lastName.minLength) {
      errors.lastName = USER_VALIDATION.lastName.message;
    }

    // Portal type specific validations
    if (formData.portalType === PORTAL_TYPES.ACCOUNT && !formData.accountId) {
      errors.accountId = 'Account is required for account users';
    }

    if (formData.portalType === PORTAL_TYPES.AGENCY) {
      if (!formData.accountId) {
        errors.accountId = 'Account is required for agency users';
      }
      if (!formData.agencyId) {
        errors.agencyId = 'Agency is required for agency users';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Export validation functions for direct import
export const validateUserForm = userHelpers.validateUserForm;

// Password change validation function
export const validatePasswordChange = (formData, isOwnPassword = false) => {
  const errors = {};

  // Current password validation (only for own password changes)
  if (isOwnPassword && !formData.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  // New password validation
  if (!formData.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (formData.newPassword.length < USER_VALIDATION.password.minLength) {
    errors.newPassword = USER_VALIDATION.password.message;
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (formData.newPassword !== formData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// AI-NOTE: Created comprehensive user types, constants, validation rules, and helper functions. Added standalone validation exports for direct import in components.