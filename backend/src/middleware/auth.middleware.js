const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const asyncHandler = require('../utils/async-handler.util');

// Verify JWT token and attach user to request
const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  // DEVELOPMENT BYPASS: Check for DEV_STATIC_TOKEN (REMOVE IN PRODUCTION)
  if (process.env.NODE_ENV === 'development' && token === process.env.DEV_STATIC_TOKEN) {
    console.log('🚨 DEVELOPMENT MODE: Using fixed DEV_STATIC_TOKEN bypass for authentication');
    console.log('📋 Token matched, creating mock development user');
    
    // Create a mock user for development - NO JWT verification needed
    req.user = {
      _id: 'dev-user-id-12345',
      email: 'dev@test.com',
      firstName: 'Dev',
      lastName: 'User',
      role: 'admin',
      portalType: 'superadmin', // Fixed for development - can be changed here for testing different portal types
      isActive: true,
      accountId: process.env.DEV_ACCOUNT_ID || null, // Set DEV_ACCOUNT_ID in .env if testing account/agency portals
      agencyId: process.env.DEV_AGENCY_ID || null,   // Set DEV_AGENCY_ID in .env if testing agency portal
      lastLogin: new Date(),
      // Mock methods for development
      hasPermission: () => true,
      canManage: () => true
    };
    
    console.log('✅ Development user created:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      portalType: req.user.portalType
    });
    
    return next();
  }
  // END DEVELOPMENT BYPASS

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id)
      .populate('accountId', 'name isActive')
      .populate('agencyId', 'name isActive');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.'
      });
    }

    // Check if account is active (for non-superadmin users)
    if (user.portalType !== 'superadmin' && (!user.accountId || !user.accountId.isActive)) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive.'
      });
    }

    // Check if agency is active (for agency users)
    if (user.portalType === 'agency' && (!user.agencyId || !user.agencyId.isActive)) {
      return res.status(401).json({
        success: false,
        message: 'Agency is inactive.'
      });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
});

// Check if user has required role
const authorize = (...roles) => {
  return (req, res, next) => {
    // Flatten the roles array in case it's passed as a single array argument
    const flatRoles = roles.flat();
    
    console.log('🔍 authorize Debug:', {
      userRole: req.user?.role,
      userPortalType: req.user?.portalType,
      requiredRoles: flatRoles,
      includes: req.user ? flatRoles.includes(req.user.role) : false,
      userDetails: req.user ? {
        id: req.user._id,
        email: req.user.email
      } : null
    });
    
    if (!req.user) {
      console.log('❌ Authorization failed: No user');
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Superadmin portal type has access to all routes
    if (req.user.portalType === 'superadmin') {
      console.log('✅ Authorization granted: Superadmin access');
      return next();
    }

    if (!flatRoles.includes(req.user.role)) {
      console.log('❌ Authorization failed: Role not allowed', {
        userRole: req.user.role,
        requiredRoles: flatRoles
      });
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${flatRoles.join(',')}`
      });
    }

    console.log('✅ Authorization granted: Role allowed');
    next();
  };
};

// Check if user belongs to specific portal type
const requirePortal = (...portalTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Handle both array and spread arguments
    // If first argument is an array, flatten it
    const flatPortalTypes = Array.isArray(portalTypes[0]) ? portalTypes[0] : portalTypes;

    if (!flatPortalTypes.includes(req.user.portalType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required portal: ${flatPortalTypes.join(' or ')}`
      });
    }

    next();
  };
};

// Ensure user can only access their own account's data
const enforceAccountAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Superadmin can access all accounts
  if (req.user.portalType === 'superadmin') {
    return next();
  }

  // Extract accountId from request (params, body, or query)
  const requestAccountId = req.params.accountId || req.body.accountId || req.query.accountId;
  
  if (requestAccountId && requestAccountId !== req.user.accountId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Cannot access other account data.'
    });
  }

  // Attach accountId to request for filtering
  req.accountId = req.user.accountId;
  next();
};

// Ensure agency users can only access their own agency's data
const enforceAgencyAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Superadmin and account users can access all agencies within account
  if (req.user.portalType === 'superadmin' || req.user.portalType === 'account') {
    return next();
  }

  // Agency users can only access their own agency
  if (req.user.portalType === 'agency') {
    const requestAgencyId = req.params.agencyId || req.body.agencyId || req.query.agencyId;
    
    if (requestAgencyId && requestAgencyId !== req.user.agencyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Cannot access other agency data.'
      });
    }

    // Attach agencyId to request for filtering
    req.agencyId = req.user.agencyId;
  }

  next();
};

// Check if user has specific permission
const requirePermission = (resource, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Superadmin has all permissions
    if (req.user.portalType === 'superadmin') {
      return next();
    }

    // Check if user has the specific permission
    if (!req.user.hasPermission(resource, action)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Missing permission: ${action} on ${resource}`
      });
    }

    next();
  };
};

// Check if user can manage another user (based on role hierarchy)
const canManageUser = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  const targetUserId = req.params.userId || req.params.id;
  
  if (!targetUserId) {
    return next(); // No specific user to check
  }

  const targetUser = await User.findById(targetUserId);
  
  if (!targetUser) {
    return res.status(404).json({
      success: false,
      message: 'Target user not found.'
    });
  }

  // Superadmin can manage all users
  if (req.user.portalType === 'superadmin') {
    return next();
  }

  // Users can only manage users in their account
  if (targetUser.accountId.toString() !== req.user.accountId.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Cannot manage users from other accounts.'
    });
  }

  // Agency users can only manage users in their agency
  if (req.user.portalType === 'agency') {
    if (!targetUser.agencyId || targetUser.agencyId.toString() !== req.user.agencyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Cannot manage users from other agencies.'
      });
    }
  }

  // Check role hierarchy
  if (!req.user.canManage(targetUser)) {
    return res.status(403).json({
      success: false,
      message: 'Insufficient role level to manage this user.'
    });
  }

  next();
});

module.exports = {
  authenticate,
  authorize,
  requirePortal,
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission,
  canManageUser
};