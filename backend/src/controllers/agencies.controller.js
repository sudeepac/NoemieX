const Agency = require('../models/agency.model');
const User = require('../models/user.model');
const OfferLetter = require('../models/offer-letter.model');
const asyncHandler = require('../utils/async-handler.util');
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/response.util');

// @desc    Get all agencies
// @route   GET /api/agencies
// @access  Private (Superadmin, Account Admin/Manager/User)
const getAgencies = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    type,
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all agencies, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see agencies in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter._id = req.user.agencyId;
  }

  // Apply additional filters
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { 'contactInfo.email': { $regex: search, $options: 'i' } }
    ];
  }

  if (type) {
    filter.type = type;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const [agencies, total] = await Promise.all([
    Agency.find(filter)
      .populate('accountId', 'name')
      .populate('parentAgencyId', 'name')
      .populate('usersCount')
      .populate('offerLettersCount')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Agency.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  successResponse(res, {
    agencies,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  }, 'Agencies retrieved successfully');
});

// @desc    Get single agency
// @route   GET /api/agencies/:id
// @access  Private (Superadmin, Account users, or own agency)
const getAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id)
    .populate('accountId', 'name contactInfo')
    .populate('parentAgencyId', 'name type')
    .populate('subAgencies')
    .populate('usersCount')
    .populate('offerLettersCount');

  if (!agency) {
    return notFoundResponse(res, 'Agency not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can access any agency
  } else if (req.user.portalType === 'account') {
    // Account users can only access agencies in their account
    if (agency.accountId._id.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only access their own agency
    if (agency._id.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  successResponse(res, { agency }, 'Agency retrieved successfully');
});

// @desc    Create new agency
// @route   POST /api/agencies
// @access  Private (Superadmin, Account Admin/Manager)
const createAgency = asyncHandler(async (req, res) => {
  const {
    accountId,
    name,
    type,
    contactInfo,
    commissionSplitPercent,
    parentAgencyId,
    businessDetails,
    bankDetails
  } = req.body;

  // Determine the accountId based on user type
  let finalAccountId = accountId;
  if (req.user.portalType === 'account' || req.user.portalType === 'agency') {
    finalAccountId = req.user.accountId;
  }

  // Check if agency with same name exists in the account
  const existingAgency = await Agency.findOne({ 
    name, 
    accountId: finalAccountId 
  });
  if (existingAgency) {
    return errorResponse(res, 'Agency with this name already exists in the account', 409);
  }

  // Validate parent agency if provided
  if (parentAgencyId) {
    const parentAgency = await Agency.findById(parentAgencyId);
    if (!parentAgency || parentAgency.accountId.toString() !== finalAccountId.toString()) {
      return errorResponse(res, 'Invalid parent agency', 400);
    }
  }

  const agency = await Agency.create({
    accountId: finalAccountId,
    name,
    type: type || 'main',
    contactInfo,
    commissionSplitPercent: commissionSplitPercent || 0,
    commissionStructure: req.body.commissionStructure || {
      type: 'percentage',
      tiers: [],
      fixedAmount: null
    },
    performance: {
      totalCommissionEarned: 0,
      totalOfferLetters: 0,
      totalTransactions: 0,
      lastActivityDate: new Date()
    },
    parentAgencyId,
    businessDetails,
    bankDetails,
    createdBy: req.user._id
  });

  // Populate the created agency
  await agency.populate('accountId', 'name');
  if (parentAgencyId) {
    await agency.populate('parentAgencyId', 'name type');
  }

  createdResponse(res, { agency }, 'Agency created successfully');
});

// @desc    Update agency
// @route   PUT /api/agencies/:id
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin)
const updateAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return notFoundResponse(res, 'Agency not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any agency
  } else if (req.user.portalType === 'account') {
    // Account users can only update agencies in their account
    if (agency.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update their own agency and must be admin
    if (agency._id.toString() !== req.user.agencyId.toString() || req.user.role !== 'admin') {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  // Restrict fields based on user type and role
  let allowedFields;
  if (req.user.portalType === 'superadmin') {
    allowedFields = ['name', 'type', 'contactInfo', 'commissionSplitPercent', 'commissionStructure', 'performance', 'parentAgencyId', 'businessDetails', 'bankDetails', 'isActive'];
  } else if (req.user.portalType === 'account' && ['admin', 'manager'].includes(req.user.role)) {
    allowedFields = ['name', 'type', 'contactInfo', 'commissionSplitPercent', 'commissionStructure', 'parentAgencyId', 'businessDetails', 'bankDetails'];
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    allowedFields = ['contactInfo', 'businessDetails', 'bankDetails'];
  } else {
    return errorResponse(res, 'Insufficient permissions to update agency', 403);
  }

  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Validate parent agency if being updated
  if (updates.parentAgencyId) {
    const parentAgency = await Agency.findById(updates.parentAgencyId);
    if (!parentAgency || parentAgency.accountId.toString() !== agency.accountId.toString()) {
      return errorResponse(res, 'Invalid parent agency', 400);
    }
  }

  const updatedAgency = await Agency.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name')
   .populate('parentAgencyId', 'name type');

  successResponse(res, { agency: updatedAgency }, 'Agency updated successfully');
});

// @desc    Delete agency
// @route   DELETE /api/agencies/:id
// @access  Private (Superadmin, Account Admin)
const deleteAgency = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return notFoundResponse(res, 'Agency not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can delete any agency
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can delete agencies in their account
    if (agency.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Check if agency has active users
  const userCount = await User.countDocuments({ agencyId: req.params.id });
  if (userCount > 0) {
    return errorResponse(res, 'Cannot delete agency with existing users', 400);
  }

  // Check if agency has sub-agencies
  const subAgencyCount = await Agency.countDocuments({ parentAgencyId: req.params.id });
  if (subAgencyCount > 0) {
    return errorResponse(res, 'Cannot delete agency with existing sub-agencies', 400);
  }

  // Check if agency has offer letters
  const offerLetterCount = await OfferLetter.countDocuments({ agencyId: req.params.id });
  if (offerLetterCount > 0) {
    return errorResponse(res, 'Cannot delete agency with existing offer letters', 400);
  }

  await Agency.findByIdAndDelete(req.params.id);

  successResponse(res, null, 'Agency deleted successfully');
});

// @desc    Toggle agency status
// @route   PATCH /api/agencies/:id/toggle-status
// @access  Private (Superadmin, Account Admin)
const toggleAgencyStatus = asyncHandler(async (req, res) => {
  const agency = await Agency.findById(req.params.id);

  if (!agency) {
    return notFoundResponse(res, 'Agency not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can toggle any agency
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can toggle agencies in their account
    if (agency.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  agency.isActive = !agency.isActive;
  await agency.save();

  // Also update all users under this agency
  await User.updateMany(
    { agencyId: req.params.id },
    { isActive: agency.isActive }
  );

  const status = agency.isActive ? 'activated' : 'deactivated';
  successResponse(res, { agency }, `Agency ${status} successfully`);
});

// @desc    Update agency performance
// @route   PATCH /api/agencies/:id/performance
// @access  Private (Superadmin, Account Admin/Manager)
const updateAgencyPerformance = asyncHandler(async (req, res) => {
  const { totalCommissionEarned, totalOfferLetters, totalTransactions } = req.body;

  const agency = await Agency.findById(req.params.id);
  if (!agency) {
    return notFoundResponse(res, 'Agency not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any agency performance
  } else if (req.user.portalType === 'account' && ['admin', 'manager'].includes(req.user.role)) {
    // Account admins/managers can update agencies in their account
    if (agency.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Update performance metrics
  if (totalCommissionEarned !== undefined) agency.performance.totalCommissionEarned = totalCommissionEarned;
  if (totalOfferLetters !== undefined) agency.performance.totalOfferLetters = totalOfferLetters;
  if (totalTransactions !== undefined) agency.performance.totalTransactions = totalTransactions;
  agency.performance.lastActivityDate = new Date();

  await agency.save();

  successResponse(res, { agency }, 'Agency performance updated successfully');
});

// @desc    Get agency statistics
// @route   GET /api/agencies/:id/stats
// @access  Private (Superadmin, Account users, or own agency)
const getAgencyStats = asyncHandler(async (req, res) => {
  const agencyId = req.params.id;

  const agency = await Agency.findById(agencyId);
  if (!agency) {
    return notFoundResponse(res, 'Agency not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can access any agency stats
  } else if (req.user.portalType === 'account') {
    // Account users can only access agencies in their account
    if (agency.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only access their own agency stats
    if (agency._id.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  // Get statistics
  const [
    totalUsers,
    activeUsers,
    totalSubAgencies,
    activeSubAgencies,
    totalOfferLetters
  ] = await Promise.all([
    User.countDocuments({ agencyId }),
    User.countDocuments({ agencyId, isActive: true }),
    Agency.countDocuments({ parentAgencyId: agencyId }),
    Agency.countDocuments({ parentAgencyId: agencyId, isActive: true }),
    OfferLetter.countDocuments({ agencyId })
  ]);

  const stats = {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers
    },
    subAgencies: {
      total: totalSubAgencies,
      active: activeSubAgencies,
      inactive: totalSubAgencies - activeSubAgencies
    },
    offerLetters: {
      total: totalOfferLetters
    },
    performance: agency.performance,
    commissionStructure: agency.commissionStructure
  };

  successResponse(res, { stats }, 'Agency statistics retrieved successfully');
});

module.exports = {
  getAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
  toggleAgencyStatus,
  updateAgencyPerformance,
  getAgencyStats
};