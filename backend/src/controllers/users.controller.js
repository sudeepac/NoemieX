const User = require('../models/user.model');
const Account = require('../models/account.model');
const Agency = require('../models/agency.model');
const asyncHandler = require('../utils/async-handler.util');
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/response.util');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    portalType,
    isActive,
    agencyId,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all users, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see users in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  // Apply additional filters
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (portalType) {
    filter.portalType = portalType;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (agencyId) {
    filter.agencyId = agencyId;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const [users, total] = await Promise.all([
    User.find(filter)
      .populate('accountId', 'name')
      .populate('agencyId', 'name type')
      .populate('managerId', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    User.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  successResponse(res, {
    users,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  }, 'Users retrieved successfully');
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Superadmin, Account users, Agency users with restrictions)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .populate('accountId', 'name contactInfo')
    .populate('agencyId', 'name type')
    .populate('managerId', 'firstName lastName email role')
    .populate('subordinates', 'firstName lastName email role');

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  // Check access permissions
  console.log('DEBUG getUser access check:');
  console.log('  Requesting user portal type:', req.user.portalType);
  console.log('  Requesting user account ID:', req.user.accountId);
  console.log('  Target user account ID:', user.accountId._id);
  console.log('  Requesting user agency ID:', req.user.agencyId);
  console.log('  Target user agency ID:', user.agencyId?._id);
  
  if (req.user.portalType === 'superadmin') {
    // Superadmin can access any user
    console.log('  Access granted: superadmin');
  } else if (req.user.portalType === 'account') {
    // Account users can only access users in their account
    console.log('  Checking account access...');
    console.log('  Target account ID (string):', user.accountId._id.toString());
    const requestingAccountId = req.user.accountId._id ? req.user.accountId._id.toString() : req.user.accountId.toString();
    console.log('  Requesting account ID (string):', requestingAccountId);
    if (user.accountId._id.toString() !== requestingAccountId) {
      console.log('  Access denied: different accounts');
      return errorResponse(res, 'Access denied', 403);
    }
    console.log('  Access granted: same account');
  } else if (req.user.portalType === 'agency') {
    // Agency users can only access users in their agency
    console.log('  Checking agency access...');
    const requestingAgencyId = req.user.agencyId._id ? req.user.agencyId._id.toString() : req.user.agencyId.toString();
    console.log('  Requesting agency ID (string):', requestingAgencyId);
    console.log('  Target user agency ID (string):', user.agencyId?._id?.toString() || 'None');
    if (!user.agencyId || user.agencyId._id.toString() !== requestingAgencyId) {
      console.log('  Access denied: different agencies or no agency');
      return errorResponse(res, 'Access denied', 403);
    }
    console.log('  Access granted: same agency');
  }

  successResponse(res, { user }, 'User retrieved successfully');
});

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin)
const createUser = asyncHandler(async (req, res) => {
  const {
    accountId,
    agencyId,
    email,
    hashedPassword,
    firstName,
    lastName,
    role,
    portalType,
    managerId,
    profile,
    permissions
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse(res, 'User with this email already exists', 409);
  }

  // Determine the accountId and agencyId based on user type
  let finalAccountId = accountId;
  let finalAgencyId = agencyId;

  if (req.user.portalType === 'account' || req.user.portalType === 'agency') {
    finalAccountId = req.user.accountId;
  }

  if (req.user.portalType === 'agency') {
    finalAgencyId = req.user.agencyId;
  }

  // Validate account exists
  if (finalAccountId) {
    const account = await Account.findById(finalAccountId);
    if (!account || !account.isActive) {
      return errorResponse(res, 'Invalid or inactive account', 400);
    }
  }

  // Validate agency exists and belongs to account
  if (finalAgencyId) {
    const agency = await Agency.findById(finalAgencyId);
    if (!agency || !agency.isActive || agency.accountId.toString() !== finalAccountId.toString()) {
      return errorResponse(res, 'Invalid or inactive agency', 400);
    }
  }

  // Validate portal type and required fields
  if (portalType === 'superadmin' && (finalAccountId || finalAgencyId)) {
    return validationErrorResponse(res, null, 'Superadmin users cannot belong to accounts or agencies');
  }

  if (portalType === 'account' && !finalAccountId) {
    return validationErrorResponse(res, null, 'Account users must belong to an account');
  }

  if (portalType === 'agency' && (!finalAccountId || !finalAgencyId)) {
    return validationErrorResponse(res, null, 'Agency users must belong to both account and agency');
  }

  // Check role hierarchy - users can only create users with lower or equal roles
  const hierarchy = User.getRoleHierarchy();
  if (hierarchy[req.user.role] <= hierarchy[role]) {
    return errorResponse(res, 'Cannot create user with higher or equal role', 403);
  }

  // Validate manager if provided
  if (managerId) {
    const manager = await User.findById(managerId);
    if (!manager || manager.accountId.toString() !== finalAccountId.toString()) {
      return errorResponse(res, 'Invalid manager', 400);
    }
    if (finalAgencyId && (!manager.agencyId || manager.agencyId.toString() !== finalAgencyId.toString())) {
      return errorResponse(res, 'Manager must belong to the same agency', 400);
    }
  }

  const user = await User.create({
    accountId: portalType !== 'superadmin' ? finalAccountId : undefined,
    agencyId: portalType === 'agency' ? finalAgencyId : undefined,
    email,
    hashedPassword,
    firstName,
    lastName,
    role: role || 'user',
    portalType,
    managerId,
    profile,
    permissions: permissions || []
  });

  // Populate the created user
  await user.populate('accountId', 'name');
  if (finalAgencyId) {
    await user.populate('agencyId', 'name type');
  }
  if (managerId) {
    await user.populate('managerId', 'firstName lastName email');
  }

  createdResponse(res, { user }, 'User created successfully');
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin, or self)
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  // Check access permissions
  const isSelf = req.user._id.toString() === user._id.toString();
  
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any user
  } else if (req.user.portalType === 'account') {
    // Account users can only update users in their account
    const requestingAccountId = req.user.accountId._id ? req.user.accountId._id.toString() : req.user.accountId.toString();
    const targetAccountId = user.accountId._id ? user.accountId._id.toString() : user.accountId.toString();
    if (targetAccountId !== requestingAccountId) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Check role hierarchy for non-self updates
    if (!isSelf && !req.user.canManage(user)) {
      return errorResponse(res, 'Cannot manage user with higher or equal role', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update users in their agency
    const requestingAgencyId = req.user.agencyId._id ? req.user.agencyId._id.toString() : req.user.agencyId.toString();
    const targetAgencyId = user.agencyId ? (user.agencyId._id ? user.agencyId._id.toString() : user.agencyId.toString()) : null;
    if (!targetAgencyId || targetAgencyId !== requestingAgencyId) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Check role hierarchy for non-self updates
    if (!isSelf && !req.user.canManage(user)) {
      return errorResponse(res, 'Cannot manage user with higher or equal role', 403);
    }
  }

  // Restrict fields based on user type and role
  let allowedFields;
  if (isSelf) {
    // Users can update their own profile information
    allowedFields = ['firstName', 'lastName', 'profile'];
  } else if (req.user.portalType === 'superadmin') {
    allowedFields = ['firstName', 'lastName', 'role', 'portalType', 'managerId', 'profile', 'permissions', 'isActive', 'accountId', 'agencyId'];
  } else if (['admin', 'manager'].includes(req.user.role)) {
    allowedFields = ['firstName', 'lastName', 'role', 'managerId', 'profile', 'permissions', 'isActive'];
  } else {
    return errorResponse(res, 'Insufficient permissions to update user', 403);
  }

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Validate role hierarchy for role updates
  if (updates.role && !isSelf) {
    const hierarchy = User.getRoleHierarchy();
    if (hierarchy[req.user.role] <= hierarchy[updates.role]) {
      return errorResponse(res, 'Cannot assign higher or equal role', 403);
    }
  }

  // Validate manager if being updated
  if (updates.managerId) {
    const manager = await User.findById(updates.managerId);
    if (!manager || manager.accountId.toString() !== user.accountId.toString()) {
      return errorResponse(res, 'Invalid manager', 400);
    }
    if (user.agencyId && (!manager.agencyId || manager.agencyId.toString() !== user.agencyId.toString())) {
      return errorResponse(res, 'Manager must belong to the same agency', 400);
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name')
   .populate('agencyId', 'name type')
   .populate('managerId', 'firstName lastName email');

  successResponse(res, { user: updatedUser }, 'User updated successfully');
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Superadmin, Account Admin, Agency Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can delete any user
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can delete users in their account
    const requestingAccountId = req.user.accountId._id ? req.user.accountId._id.toString() : req.user.accountId.toString();
    const targetAccountId = user.accountId._id ? user.accountId._id.toString() : user.accountId.toString();
    if (targetAccountId !== requestingAccountId) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can delete users in their agency
    const requestingAgencyId = req.user.agencyId._id ? req.user.agencyId._id.toString() : req.user.agencyId.toString();
    const targetAgencyId = user.agencyId ? (user.agencyId._id ? user.agencyId._id.toString() : user.agencyId.toString()) : null;
    if (!targetAgencyId || targetAgencyId !== requestingAgencyId) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Check if user has subordinates
  const subordinateCount = await User.countDocuments({ managerId: req.params.id });
  if (subordinateCount > 0) {
    return errorResponse(res, 'Cannot delete user with subordinates', 400);
  }

  // Prevent self-deletion
  if (req.user._id.toString() === user._id.toString()) {
    return errorResponse(res, 'Cannot delete your own account', 400);
  }

  await User.findByIdAndDelete(req.params.id);

  successResponse(res, null, 'User deleted successfully');
});

// @desc    Toggle user status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private (Superadmin, Account Admin, Agency Admin)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can toggle any user
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can toggle users in their account
    const requestingAccountId = req.user.accountId._id ? req.user.accountId._id.toString() : req.user.accountId.toString();
    const targetAccountId = user.accountId._id ? user.accountId._id.toString() : user.accountId.toString();
    if (targetAccountId !== requestingAccountId) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can toggle users in their agency
    const requestingAgencyId = req.user.agencyId._id ? req.user.agencyId._id.toString() : req.user.agencyId.toString();
    const targetAgencyId = user.agencyId ? (user.agencyId._id ? user.agencyId._id.toString() : user.agencyId.toString()) : null;
    if (!targetAgencyId || targetAgencyId !== requestingAgencyId) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Prevent self-deactivation
  if (req.user._id.toString() === user._id.toString()) {
    return errorResponse(res, 'Cannot deactivate your own account', 400);
  }

  user.isActive = !user.isActive;
  await user.save();

  const status = user.isActive ? 'activated' : 'deactivated';
  successResponse(res, { user }, `User ${status} successfully`);
});

// @desc    Change user password
// @route   PATCH /api/users/:id/change-password
// @access  Private (Superadmin, Account Admin, Agency Admin, or self)
const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.params.id).select('+hashedPassword');

  if (!user) {
    return notFoundResponse(res, 'User not found');
  }

  const isSelf = req.user._id.toString() === user._id.toString();

  // Check access permissions
  if (!isSelf) {
    if (req.user.portalType === 'superadmin') {
      // Superadmin can change any user's password
    } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
      // Account admins can change passwords for users in their account
      const requestingAccountId = req.user.accountId._id ? req.user.accountId._id.toString() : req.user.accountId.toString();
      const targetAccountId = user.accountId._id ? user.accountId._id.toString() : user.accountId.toString();
      if (targetAccountId !== requestingAccountId) {
        return errorResponse(res, 'Access denied', 403);
      }
    } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
      // Agency admins can change passwords for users in their agency
      const requestingAgencyId = req.user.agencyId._id ? req.user.agencyId._id.toString() : req.user.agencyId.toString();
      const targetAgencyId = user.agencyId ? (user.agencyId._id ? user.agencyId._id.toString() : user.agencyId.toString()) : null;
      if (!targetAgencyId || targetAgencyId !== requestingAgencyId) {
        return errorResponse(res, 'Access denied', 403);
      }
    } else {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  // For self password change, verify current password
  if (isSelf) {
    if (!currentPassword) {
      return validationErrorResponse(res, null, 'Current password is required');
    }
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return errorResponse(res, 'Current password is incorrect', 400);
    }
  }

  // Update password
  user.hashedPassword = newPassword;
  await user.save();

  successResponse(res, null, 'Password changed successfully');
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserPassword
};