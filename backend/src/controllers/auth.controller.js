const User = require('../models/user.model');
const Account = require('../models/account.model');
const Agency = require('../models/agency.model');
const asyncHandler = require('../utils/async-handler.util');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.util');
const { 
  successResponse, 
  createdResponse, 
  errorResponse, 
  unauthorizedResponse,
  validationErrorResponse 
} = require('../utils/response.util');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (with restrictions)
const register = asyncHandler(async (req, res) => {
  const { 
    email, 
    password, 
    firstName, 
    lastName, 
    role, 
    portalType, 
    accountId, 
    agencyId 
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 'User with this email already exists', 409);
  }

  // Validate account exists if provided
  if (accountId) {
    const account = await Account.findById(accountId);
    if (!account || !account.isActive) {
      return errorResponse(res, 'Invalid or inactive account', 400);
    }
  }

  // Validate agency exists if provided
  if (agencyId) {
    const agency = await Agency.findById(agencyId);
    if (!agency || !agency.isActive || agency.accountId.toString() !== accountId) {
      return errorResponse(res, 'Invalid or inactive agency', 400);
    }
  }

  // Validate portal type and required fields
  if (portalType === 'superadmin' && (accountId || agencyId)) {
    return validationErrorResponse(res, null, 'Superadmin users cannot belong to accounts or agencies');
  }

  if (portalType === 'account' && !accountId) {
    return validationErrorResponse(res, null, 'Account users must belong to an account');
  }

  if (portalType === 'agency' && (!accountId || !agencyId)) {
    return validationErrorResponse(res, null, 'Agency users must belong to both account and agency');
  }

  // Create user
  const user = await User.create({
    email,
    hashedPassword: password,
    firstName,
    lastName,
    role: role || 'user',
    portalType,
    accountId: portalType !== 'superadmin' ? accountId : undefined,
    agencyId: portalType === 'agency' ? agencyId : undefined
  });

  // Generate tokens
  const token = generateToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Remove password from response
  user.hashedPassword = undefined;

  createdResponse(res, {
    user,
    token,
    refreshToken
  }, 'User registered successfully');
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, portalType } = req.body;

  // Validate input
  if (!email || !password || !portalType) {
    return validationErrorResponse(res, null, 'Please provide email, password, and portal type');
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email, portalType })
    .select('+hashedPassword')
    .populate('accountId', 'name isActive')
    .populate('agencyId', 'name isActive');

  if (!user) {
    return unauthorizedResponse(res, 'Invalid credentials');
  }
  
  const passwordMatch = await user.comparePassword(password);
  
  if (!passwordMatch) {
    return unauthorizedResponse(res, 'Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    return unauthorizedResponse(res, 'Account is deactivated');
  }

  // Check if account is active (for non-superadmin users)
  if (user.portalType !== 'superadmin' && (!user.accountId || !user.accountId.isActive)) {
    return unauthorizedResponse(res, 'Account is inactive');
  }

  // Check if agency is active (for agency users)
  if (user.portalType === 'agency' && (!user.agencyId || !user.agencyId.isActive)) {
    return unauthorizedResponse(res, 'Agency is inactive');
  }

  // Update last login without triggering password re-hashing
  await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

  // Generate tokens
  const token = generateToken({ id: user._id });
  const refreshToken = generateRefreshToken({ id: user._id });

  // Remove password from response
  user.hashedPassword = undefined;

  successResponse(res, {
    user,
    token,
    refreshToken
  }, 'Login successful');
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return validationErrorResponse(res, null, 'Refresh token is required');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return unauthorizedResponse(res, 'Invalid refresh token');
    }

    // Generate new tokens
    const newToken = generateToken({ id: user._id });
    const newRefreshToken = generateRefreshToken({ id: user._id });

    successResponse(res, {
      token: newToken,
      refreshToken: newRefreshToken
    }, 'Token refreshed successfully');
  } catch (error) {
    return unauthorizedResponse(res, 'Invalid refresh token');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // Handle both development token (req.user._id) and real user (req.user.id)
  const userId = req.user._id || req.user.id;
  
  // For development token, return the mock user directly
  if (process.env.NODE_ENV === 'development' && req.user._id === 'dev-user-id-12345') {
    return successResponse(res, { user: req.user }, 'User profile retrieved successfully (development mode)');
  }
  
  const user = await User.findById(userId)
    .populate('accountId', 'name contactInfo')
    .populate('agencyId', 'name type contactInfo')
    .populate('managerId', 'firstName lastName email');

  successResponse(res, { user }, 'User profile retrieved successfully');
});

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowedFields = ['firstName', 'lastName', 'phoneNumber', 'profilePicture'];
  const updates = {};

  // Filter allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Handle both development token (req.user._id) and real user (req.user.id)
  const userId = req.user._id || req.user.id;
  
  // For development token, return updated mock user
  if (process.env.NODE_ENV === 'development' && req.user._id === 'dev-user-id-12345') {
    const updatedUser = { ...req.user, ...updates };
    return successResponse(res, { user: updatedUser }, 'Profile updated successfully (development mode)');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name contactInfo')
   .populate('agencyId', 'name type contactInfo');

  successResponse(res, { user }, 'Profile updated successfully');
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return validationErrorResponse(res, null, 'Current password and new password are required');
  }

  // Handle development token - password change not supported in dev mode
  if (process.env.NODE_ENV === 'development' && req.user._id === 'dev-user-id-12345') {
    return successResponse(res, null, 'Password change simulated successfully (development mode)');
  }

  // Handle both development token (req.user._id) and real user (req.user.id)
  const userId = req.user._id || req.user.id;

  // Get user with password
  const user = await User.findById(userId).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return unauthorizedResponse(res, 'Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  successResponse(res, null, 'Password changed successfully');
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just send a success response
  successResponse(res, null, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  logout
};