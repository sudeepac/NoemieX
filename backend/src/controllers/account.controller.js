const Account = require('../models/account.model');
const User = require('../models/user.model');
const Agency = require('../models/agency.model');
const asyncHandler = require('../utils/async-handler.util');
const { 
  successResponse, 
  createdResponse, 
  errorResponse, 
  notFoundResponse,
  paginatedResponse 
} = require('../utils/response.util');

// @desc    Get all accounts (Superadmin only)
// @route   GET /api/accounts
// @access  Private (Superadmin)
const getAccounts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.search) {
    filter.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { 'contactInfo.email': { $regex: req.query.search, $options: 'i' } }
    ];
  }
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Get accounts with pagination
  const accounts = await Account.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('agenciesCount')
    .populate('usersCount');

  const totalItems = await Account.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);

  paginatedResponse(res, accounts, {
    page,
    limit,
    totalPages,
    totalItems
  }, 'Accounts retrieved successfully');
});

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private (Superadmin or Account Admin)
const getAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id)
    .populate('agenciesCount')
    .populate('usersCount');

  if (!account) {
    return notFoundResponse(res, 'Account not found');
  }

  // Check access permissions
  if (req.user.portalType !== 'superadmin' && 
      req.user.accountId.toString() !== account._id.toString()) {
    return errorResponse(res, 'Access denied', 403);
  }

  successResponse(res, { account }, 'Account retrieved successfully');
});

// @desc    Create new account
// @route   POST /api/accounts
// @access  Private (Superadmin only)
const createAccount = asyncHandler(async (req, res) => {
  const {
    name,
    contactInfo,
    subscription,
    settings
  } = req.body;

  // Check if account with same name exists
  const existingAccount = await Account.findOne({ name });
  if (existingAccount) {
    return errorResponse(res, 'Account with this name already exists', 409);
  }

  // Set trial period (30 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 30);

  const account = await Account.create({
    name,
    contactInfo,
    subscription: {
      plan: subscription?.plan || 'trial',
      status: subscription?.status || 'trial',
      startDate: new Date(),
      trialEndDate,
      billingCycle: subscription?.billingCycle || 'monthly'
    },
    billing: {
      status: 'current',
      totalRevenue: 0,
      outstandingBalance: 0
    },
    settings: settings || {},
    createdBy: req.user._id
  });

  createdResponse(res, { account }, 'Account created successfully');
});

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private (Superadmin or Account Admin)
const updateAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return notFoundResponse(res, 'Account not found');
  }

  // Check access permissions
  if (req.user.portalType !== 'superadmin' && 
      req.user.accountId.toString() !== account._id.toString()) {
    return errorResponse(res, 'Access denied', 403);
  }

  // Restrict fields based on user role
  const allowedFields = req.user.portalType === 'superadmin' 
    ? ['name', 'contactInfo', 'subscription', 'billing', 'settings', 'isActive']
    : ['contactInfo', 'settings'];

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  const updatedAccount = await Account.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  );

  successResponse(res, { account: updatedAccount }, 'Account updated successfully');
});

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private (Superadmin only)
const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return notFoundResponse(res, 'Account not found');
  }

  // Check if account has active users or agencies
  const userCount = await User.countDocuments({ accountId: req.params.id });
  const agencyCount = await Agency.countDocuments({ accountId: req.params.id });

  if (userCount > 0 || agencyCount > 0) {
    return errorResponse(res, 'Cannot delete account with existing users or agencies', 400);
  }

  await Account.findByIdAndDelete(req.params.id);

  successResponse(res, null, 'Account deleted successfully');
});

// @desc    Activate/Deactivate account
// @route   PATCH /api/accounts/:id/toggle-status
// @access  Private (Superadmin only)
const toggleAccountStatus = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);

  if (!account) {
    return notFoundResponse(res, 'Account not found');
  }

  account.isActive = !account.isActive;
  await account.save();

  // Also update all users and agencies under this account
  await User.updateMany(
    { accountId: req.params.id },
    { isActive: account.isActive }
  );

  await Agency.updateMany(
    { accountId: req.params.id },
    { isActive: account.isActive }
  );

  const status = account.isActive ? 'activated' : 'deactivated';
  successResponse(res, { account }, `Account ${status} successfully`);
});

// @desc    Update account billing
// @route   PATCH /api/accounts/:id/billing
// @access  Private (Superadmin only)
const updateAccountBilling = asyncHandler(async (req, res) => {
  const { billingStatus, totalRevenue, outstandingBalance } = req.body;

  const account = await Account.findById(req.params.id);
  if (!account) {
    return notFoundResponse(res, 'Account not found');
  }

  // Update billing information
  if (billingStatus) account.billing.status = billingStatus;
  if (totalRevenue !== undefined) account.billing.totalRevenue = totalRevenue;
  if (outstandingBalance !== undefined) account.billing.outstandingBalance = outstandingBalance;

  await account.save();

  successResponse(res, { account }, 'Account billing updated successfully');
});

// @desc    Get account statistics
// @route   GET /api/accounts/:id/stats
// @access  Private (Superadmin or Account Admin)
const getAccountStats = asyncHandler(async (req, res) => {
  const accountId = req.params.id;

  // Check access permissions
  if (req.user.portalType !== 'superadmin' && 
      req.user.accountId.toString() !== accountId) {
    return errorResponse(res, 'Access denied', 403);
  }

  const account = await Account.findById(accountId);
  if (!account) {
    return notFoundResponse(res, 'Account not found');
  }

  // Get statistics
  const [
    totalUsers,
    activeUsers,
    totalAgencies,
    activeAgencies
  ] = await Promise.all([
    User.countDocuments({ accountId }),
    User.countDocuments({ accountId, isActive: true }),
    Agency.countDocuments({ accountId }),
    Agency.countDocuments({ accountId, isActive: true })
  ]);

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers
    },
    agencies: {
      total: totalAgencies,
      active: activeAgencies,
      inactive: totalAgencies - activeAgencies
    },
    billing: account.billing,
    subscription: account.subscription
  };

  successResponse(res, { stats }, 'Account statistics retrieved successfully');
});



module.exports = {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
  updateAccountBilling,
  getAccountStats
};