const BillingEventHistory = require('../models/billing-event-history.model');
const BillingTransaction = require('../models/billing-transaction.model');
const asyncHandler = require('../utils/async-handler.util');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/response.util');

// @desc    Get billing event histories with filtering and pagination
// @route   GET /api/billing-event-histories
// @access  Private (Superadmin, Account users, Agency users)
const getBillingEventHistories = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    eventType,
    billingTransactionId,
    triggeredBy,
    startDate,
    endDate,
    sortBy = 'eventDate',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object based on user access
  const filter = {};

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all events, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see events in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  } else if (req.query.agencyId && req.user.portalType !== 'superadmin') {
    filter.agencyId = req.query.agencyId;
  }

  // Add additional filters
  if (eventType) {
    filter.eventType = eventType;
  }

  if (billingTransactionId) {
    filter.billingTransactionId = billingTransactionId;
  }

  if (triggeredBy) {
    filter.triggeredBy = triggeredBy;
  }

  if (startDate || endDate) {
    filter.eventDate = {};
    if (startDate) {
      filter.eventDate.$gte = new Date(startDate);
    }
    if (endDate) {
      filter.eventDate.$lte = new Date(endDate);
    }
  }

  // Only show visible events
  filter.isVisible = true;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [eventHistories, total] = await Promise.all([
    BillingEventHistory.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('triggeredBy', 'firstName lastName email')
      .populate('performedBy.userId', 'firstName lastName email')
      .populate('billingTransactionId', 'signedAmount status references dueDate')
      .populate('eventData.resolvedBy', 'firstName lastName email')
      .lean(),
    BillingEventHistory.countDocuments(filter)
  ]);

  successResponse(res, {
    eventHistories,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalItems: total,
      itemsPerPage: parseInt(limit)
    }
  }, 'Billing event histories retrieved successfully');
});

// @desc    Get a specific billing event history
// @route   GET /api/billing-event-histories/:id
// @access  Private (Superadmin, Account users, Agency users)
const getBillingEventHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Build filter object based on user access
  const filter = { _id: id, isVisible: true };

  // Apply account-based filtering
  if (req.user.portalType !== 'superadmin') {
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  const eventHistory = await BillingEventHistory.findOne(filter)
    .populate('triggeredBy', 'firstName lastName email')
    .populate('performedBy.userId', 'firstName lastName email')
    .populate('billingTransactionId', 'signedAmount status references dueDate')
    .populate('eventData.resolvedBy', 'firstName lastName email')
    .lean();

  if (!eventHistory) {
    return notFoundResponse(res, 'Billing event history not found');
  }

  successResponse(res, eventHistory, 'Billing event history retrieved successfully');
});

// @desc    Get timeline of events for a specific billing transaction
// @route   GET /api/billing-event-histories/transaction/:transactionId/timeline
// @access  Private (Superadmin, Account users, Agency users)
const getTransactionTimeline = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  // Build filter object based on user access
  const filter = { billingTransactionId: transactionId, isVisible: true };

  // Apply account-based filtering
  if (req.user.portalType !== 'superadmin') {
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  const timeline = await BillingEventHistory.getTransactionTimeline(transactionId, filter);

  successResponse(res, timeline, 'Transaction timeline retrieved successfully');
});

// @desc    Get activity summary for billing events
// @route   GET /api/billing-event-histories/activity/summary
// @access  Private (Superadmin, Account users, Agency users)
const getActivitySummary = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  // Build filter object based on user access
  const filter = { isVisible: true };

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all events, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see events in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  const summary = await BillingEventHistory.getActivitySummary(filter, {
    startDate,
    endDate,
    groupBy
  });

  successResponse(res, summary, 'Activity summary retrieved successfully');
});

// @desc    Get user activity for billing events
// @route   GET /api/billing-event-histories/user/:userId/activity
// @access  Private (Superadmin, Account users, Agency users)
const getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, limit = 50 } = req.query;

  // Build filter object based on user access
  const filter = { triggeredBy: userId, isVisible: true };

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all events, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see events in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  const activity = await BillingEventHistory.getUserActivity(userId, filter, {
    startDate,
    endDate,
    limit: parseInt(limit)
  });

  successResponse(res, activity, 'User activity retrieved successfully');
});

// Note: createBillingEventHistory is removed as event histories should only be created
// automatically by the system through model methods, not via direct API calls.
// This maintains the insert-only audit trail integrity.

// @desc    Hide a billing event history (soft delete)
// @route   PATCH /api/billing-event-histories/:id/hide
// @access  Private (Superadmin, Account admins only)
const hideBillingEventHistory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Only superadmin and account admins can hide events
  if (!['superadmin', 'account'].includes(req.user.portalType)) {
    return forbiddenResponse(res, 'Access denied - insufficient permissions');
  }

  // Build filter object based on user access
  const filter = { _id: id };

  // Apply account-based filtering for account users
  if (req.user.portalType === 'account') {
    filter.accountId = req.user.accountId;
  }

  const eventHistory = await BillingEventHistory.findOneAndUpdate(
    filter,
    { 
      isVisible: false,
      updatedBy: req.user._id,
      updatedAt: new Date()
    },
    { new: true }
  );

  if (!eventHistory) {
    return notFoundResponse(res, 'Billing event history not found');
  }

  successResponse(res, eventHistory, 'Billing event history hidden successfully');
});

module.exports = {
  getBillingEventHistories,
  getBillingEventHistory,
  getTransactionTimeline,
  getActivitySummary,
  getUserActivity,
  hideBillingEventHistory
};