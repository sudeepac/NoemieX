const BillingTransaction = require('../models/billing-transaction.model');
const PaymentScheduleItem = require('../models/payment-schedule-item.model');
const Agency = require('../models/agency.model');
const BillingEventHistory = require('../models/billing-event-history.model');
const asyncHandler = require('../utils/async-handler.util');
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/response.util');

// @desc    Get all billing transactions
// @route   GET /api/billing-transactions
// @access  Private (Superadmin, Account users, Agency users)
const getBillingTransactions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    transactionType,
    debtorType,
    paymentMethod,
    isOverdue,
    agencyId,
    paymentScheduleItemId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all transactions, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see transactions in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  // Apply additional filters
  if (search) {
    filter.$or = [
      { 'references.invoiceRef': { $regex: search, $options: 'i' } },
      { 'references.receiptRef': { $regex: search, $options: 'i' } },
      { 'references.externalRef': { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (transactionType) {
    filter.transactionType = transactionType;
  }

  if (debtorType) {
    filter.debtorType = debtorType;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (agencyId) {
    filter.agencyId = agencyId;
  }

  if (paymentScheduleItemId) {
    filter.paymentScheduleItemId = paymentScheduleItemId;
  }

  // Handle date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Handle overdue filter
  if (isOverdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $nin: ['paid', 'cancelled', 'refunded'] };
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const [billingTransactions, total] = await Promise.all([
    BillingTransaction.find(filter)
      .populate('accountId', 'name')
      .populate('agencyId', 'name type')
      .populate('paymentScheduleItemId', 'itemType scheduledAmount description')
      .populate('debtorId')
      .populate('bonusRuleId', 'name type')
      .populate('approvals.approvedBy', 'firstName lastName email')
      .populate('reconciliation.reconciledBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    BillingTransaction.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  successResponse(res, {
    billingTransactions,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  }, 'Billing transactions retrieved successfully');
});

// @desc    Get single billing transaction
// @route   GET /api/billing-transactions/:id
// @access  Private (Superadmin, Account users, Agency users with restrictions)
const getBillingTransaction = asyncHandler(async (req, res) => {
  const billingTransaction = await BillingTransaction.findById(req.params.id)
    .populate('accountId', 'name contactInfo')
    .populate('agencyId', 'name type contactInfo')
    .populate('paymentScheduleItemId')
    .populate('debtorId')
    .populate('bonusRuleId')
    .populate('approvals.approvedBy', 'firstName lastName email role')
    .populate('reconciliation.reconciledBy', 'firstName lastName email')
    .populate('createdBy', 'firstName lastName email')
    .populate('updatedBy', 'firstName lastName email')
    .populate('eventHistories');

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can access any billing transaction
  } else if (req.user.portalType === 'account') {
    // Account users can only access transactions in their account
    if (billingTransaction.accountId._id.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only access transactions in their agency
    if (billingTransaction.agencyId._id.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  successResponse(res, { billingTransaction }, 'Billing transaction retrieved successfully');
});

// @desc    Create new billing transaction
// @route   POST /api/billing-transactions
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const createBillingTransaction = asyncHandler(async (req, res) => {
  const {
    accountId,
    agencyId,
    paymentScheduleItemId,
    debtorType,
    debtorId,
    signedAmount,
    originalAmount,
    exchangeRate,
    transactionType,
    dueDate,
    paymentMethod,
    references,
    bonusRuleId,
    fees,
    notes,
    metadata
  } = req.body;

  // Determine the accountId and agencyId based on user type
  let finalAccountId = accountId;
  let finalAgencyId = agencyId;

  if (req.user.portalType === 'account' || req.user.portalType === 'agency') {
    finalAccountId = req.user.accountId;
  }

  if (req.user.portalType === 'agency') {
    finalAgencyId = req.user.agencyId;
  }

  // Validate agency exists and belongs to account
  if (finalAgencyId) {
    const agency = await Agency.findById(finalAgencyId);
    if (!agency || !agency.isActive || agency.accountId.toString() !== finalAccountId.toString()) {
      return errorResponse(res, 'Invalid or inactive agency', 400);
    }
  }

  // Validate payment schedule item exists and belongs to account/agency
  if (paymentScheduleItemId) {
    const paymentScheduleItem = await PaymentScheduleItem.findById(paymentScheduleItemId);
    if (!paymentScheduleItem) {
      return errorResponse(res, 'Payment schedule item not found', 400);
    }
    if (paymentScheduleItem.accountId.toString() !== finalAccountId.toString()) {
      return errorResponse(res, 'Payment schedule item must belong to the same account', 400);
    }
    if (finalAgencyId && paymentScheduleItem.agencyId.toString() !== finalAgencyId.toString()) {
      return errorResponse(res, 'Payment schedule item must belong to the same agency', 400);
    }
  }

  // Validate signed amount
  if (!signedAmount || !signedAmount.value || signedAmount.value === 0) {
    return validationErrorResponse(res, null, 'Valid signed amount is required');
  }

  // Validate debtor information
  if (!debtorType || !debtorId) {
    return validationErrorResponse(res, null, 'Debtor type and ID are required');
  }

  // Validate transaction type
  if (!transactionType) {
    return validationErrorResponse(res, null, 'Transaction type is required');
  }

  const billingTransaction = await BillingTransaction.create({
    accountId: finalAccountId,
    agencyId: finalAgencyId,
    paymentScheduleItemId,
    debtorType,
    debtorId,
    signedAmount,
    originalAmount,
    exchangeRate,
    transactionType,
    dueDate,
    paymentMethod,
    references: references || {},
    bonusRuleId,
    fees: fees || {},
    notes,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    metadata: {
      ...metadata,
      source: 'manual'
    }
  });

  // Create billing event history entry
  await BillingEventHistory.create({
    accountId: finalAccountId,
    agencyId: finalAgencyId,
    billingTransactionId: billingTransaction._id,
    eventType: 'transaction_created',
    eventData: {
      transactionType,
      amount: signedAmount,
      status: billingTransaction.status
    },
    triggeredBy: req.user._id,
    metadata: {
      source: 'manual_creation'
    }
  });

  // Populate the created billing transaction
  await billingTransaction.populate('accountId', 'name');
  await billingTransaction.populate('agencyId', 'name type');
  await billingTransaction.populate('paymentScheduleItemId', 'itemType scheduledAmount description');
  await billingTransaction.populate('createdBy', 'firstName lastName email');

  createdResponse(res, { billingTransaction }, 'Billing transaction created successfully');
});

// @desc    Update billing transaction
// @route   PUT /api/billing-transactions/:id
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const updateBillingTransaction = asyncHandler(async (req, res) => {
  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any billing transaction
  } else if (req.user.portalType === 'account') {
    // Account users can only update transactions in their account
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Only admin/manager can update
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update transactions in their agency
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Only admin/manager can update
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  // Restrict updates based on transaction status
  const restrictedFields = [];
  if (['paid', 'cancelled', 'refunded'].includes(billingTransaction.status)) {
    restrictedFields.push('signedAmount', 'debtorType', 'debtorId', 'transactionType');
  }

  if (billingTransaction.reconciliation.isReconciled) {
    restrictedFields.push('signedAmount', 'status', 'paidDate');
  }

  // Check for restricted field updates
  const updates = {};
  const originalData = {};
  Object.keys(req.body).forEach(key => {
    if (!restrictedFields.includes(key)) {
      originalData[key] = billingTransaction[key];
      updates[key] = req.body[key];
    }
  });

  // Validate signed amount if being updated
  if (updates.signedAmount && (!updates.signedAmount.value || updates.signedAmount.value === 0)) {
    return validationErrorResponse(res, null, 'Valid signed amount is required');
  }

  // Update audit field
  updates.updatedBy = req.user._id;

  const updatedBillingTransaction = await BillingTransaction.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name')
   .populate('agencyId', 'name type')
   .populate('paymentScheduleItemId', 'itemType scheduledAmount description')
   .populate('createdBy', 'firstName lastName email')
   .populate('updatedBy', 'firstName lastName email');

  // Create billing event history entry for update
  await BillingEventHistory.create({
    accountId: billingTransaction.accountId,
    agencyId: billingTransaction.agencyId,
    billingTransactionId: billingTransaction._id,
    eventType: 'transaction_updated',
    eventData: {
      originalData,
      updatedData: updates
    },
    triggeredBy: req.user._id,
    metadata: {
      source: 'manual_update'
    }
  });

  successResponse(res, { billingTransaction: updatedBillingTransaction }, 'Billing transaction updated successfully');
});

// @desc    Update billing transaction status
// @route   PATCH /api/billing-transactions/:id/status
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const updateBillingTransactionStatus = asyncHandler(async (req, res) => {
  const { status, paidDate, claimedDate, paymentMethod, references } = req.body;

  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any billing transaction status
  } else if (req.user.portalType === 'account') {
    // Account users can only update transactions in their account
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Only admin/manager can update status
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update transactions in their agency
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Only admin/manager can update status
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  // Validate status transition
  const validTransitions = {
    'pending': ['claimed', 'cancelled', 'disputed'],
    'claimed': ['partially_paid', 'paid', 'overdue', 'cancelled', 'disputed'],
    'partially_paid': ['paid', 'overdue', 'cancelled', 'disputed'],
    'overdue': ['paid', 'cancelled', 'disputed'],
    'disputed': ['paid', 'cancelled', 'refunded'],
    'paid': ['refunded', 'disputed'],
    'cancelled': [],
    'refunded': []
  };

  if (!validTransitions[billingTransaction.status].includes(status)) {
    return errorResponse(res, `Invalid status transition from ${billingTransaction.status} to ${status}`, 400);
  }

  const originalStatus = billingTransaction.status;
  const updates = { status };

  // Set appropriate dates based on status
  if (status === 'paid' && !billingTransaction.paidDate) {
    updates.paidDate = paidDate || new Date();
  }

  if (status === 'claimed' && !billingTransaction.claimedDate) {
    updates.claimedDate = claimedDate || new Date();
  }

  // Update payment method and references if provided
  if (paymentMethod) {
    updates.paymentMethod = paymentMethod;
  }

  if (references) {
    updates.references = { ...billingTransaction.references, ...references };
  }

  updates.updatedBy = req.user._id;

  const updatedBillingTransaction = await BillingTransaction.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name')
   .populate('agencyId', 'name type')
   .populate('paymentScheduleItemId', 'itemType scheduledAmount description');

  // Create billing event history entry for status change
  await BillingEventHistory.create({
    accountId: billingTransaction.accountId,
    agencyId: billingTransaction.agencyId,
    billingTransactionId: billingTransaction._id,
    eventType: 'status_changed',
    eventData: {
      originalStatus,
      newStatus: status,
      paidDate: updates.paidDate,
      claimedDate: updates.claimedDate
    },
    triggeredBy: req.user._id,
    metadata: {
      source: 'manual_status_update'
    }
  });

  successResponse(res, { billingTransaction: updatedBillingTransaction }, 'Billing transaction status updated successfully');
});

// @desc    Claim billing transaction
// @route   PATCH /api/billing-transactions/:id/claim
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const claimBillingTransaction = asyncHandler(async (req, res) => {
  const { claimDate } = req.body;

  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can claim any billing transaction
  } else if (req.user.portalType === 'account') {
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  try {
    await billingTransaction.claim(req.user._id, claimDate);

    // Create billing event history entry
    await BillingEventHistory.create({
      accountId: billingTransaction.accountId,
      agencyId: billingTransaction.agencyId,
      billingTransactionId: billingTransaction._id,
      eventType: 'transaction_claimed',
      eventData: {
        claimDate: billingTransaction.claimedDate,
        claimedBy: req.user._id
      },
      triggeredBy: req.user._id,
      metadata: {
        source: 'manual_claim'
      }
    });

    await billingTransaction.populate('accountId', 'name');
    await billingTransaction.populate('agencyId', 'name type');
    await billingTransaction.populate('paymentScheduleItemId', 'itemType scheduledAmount description');

    successResponse(res, { billingTransaction }, 'Billing transaction claimed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

// @desc    Dispute billing transaction
// @route   PATCH /api/billing-transactions/:id/dispute
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const disputeBillingTransaction = asyncHandler(async (req, res) => {
  const { disputeReason, disputeDate } = req.body;

  if (!disputeReason) {
    return validationErrorResponse(res, null, 'Dispute reason is required');
  }

  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can dispute any billing transaction
  } else if (req.user.portalType === 'account') {
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  try {
    await billingTransaction.dispute(req.user._id, disputeReason, disputeDate);

    // Create billing event history entry
    await BillingEventHistory.create({
      accountId: billingTransaction.accountId,
      agencyId: billingTransaction.agencyId,
      billingTransactionId: billingTransaction._id,
      eventType: 'transaction_disputed',
      eventData: {
        disputeReason,
        disputeDate: billingTransaction.metadata.disputeDate,
        disputedBy: req.user._id
      },
      triggeredBy: req.user._id,
      metadata: {
        source: 'manual_dispute'
      }
    });

    await billingTransaction.populate('accountId', 'name');
    await billingTransaction.populate('agencyId', 'name type');
    await billingTransaction.populate('paymentScheduleItemId', 'itemType scheduledAmount description');

    successResponse(res, { billingTransaction }, 'Billing transaction disputed successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

// @desc    Resolve dispute for billing transaction
// @route   PATCH /api/billing-transactions/:id/resolve-dispute
// @access  Private (Superadmin, Account Admin, Agency Admin)
const resolveDisputeBillingTransaction = asyncHandler(async (req, res) => {
  const { newStatus, resolvedDate } = req.body;

  if (!newStatus) {
    return validationErrorResponse(res, null, 'New status is required');
  }

  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions (only admins can resolve disputes)
  if (req.user.portalType === 'superadmin') {
    // Superadmin can resolve any dispute
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  try {
    await billingTransaction.resolveDispute(req.user._id, newStatus, resolvedDate);

    // Create billing event history entry
    await BillingEventHistory.create({
      accountId: billingTransaction.accountId,
      agencyId: billingTransaction.agencyId,
      billingTransactionId: billingTransaction._id,
      eventType: 'dispute_resolved',
      eventData: {
        originalStatus: 'disputed',
        newStatus,
        resolvedDate: billingTransaction.metadata.disputeResolvedDate,
        resolvedBy: req.user._id
      },
      triggeredBy: req.user._id,
      metadata: {
        source: 'manual_dispute_resolution'
      }
    });

    await billingTransaction.populate('accountId', 'name');
    await billingTransaction.populate('agencyId', 'name type');
    await billingTransaction.populate('paymentScheduleItemId', 'itemType scheduledAmount description');
    await billingTransaction.populate('metadata.disputeResolvedBy', 'firstName lastName email');

    successResponse(res, { billingTransaction }, 'Dispute resolved successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

// @desc    Get disputed billing transactions
// @route   GET /api/billing-transactions/disputed
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getDisputedTransactions = asyncHandler(async (req, res) => {
  let accountId, agencyId;

  // Determine scope based on user type
  if (req.user.portalType === 'superadmin') {
    accountId = req.query.accountId;
    agencyId = req.query.agencyId;
  } else if (req.user.portalType === 'account') {
    accountId = req.user.accountId;
    agencyId = req.query.agencyId;
  } else if (req.user.portalType === 'agency') {
    accountId = req.user.accountId;
    agencyId = req.user.agencyId;
  }

  if (!accountId) {
    return validationErrorResponse(res, null, 'Account ID is required');
  }

  const disputedTransactions = await BillingTransaction.getDisputedTransactions(accountId, agencyId);

  successResponse(res, { disputedTransactions }, 'Disputed billing transactions retrieved successfully');
});

// @desc    Add approval to billing transaction
// @route   POST /api/billing-transactions/:id/approve
// @access  Private (Superadmin, Account Admin, Agency Admin)
const approveBillingTransaction = asyncHandler(async (req, res) => {
  const { level, comments } = req.body;

  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can approve any billing transaction
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can approve transactions in their account
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can approve transactions in their agency
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Check if user has already approved at this level
  const existingApproval = billingTransaction.approvals.find(
    approval => approval.approvedBy.toString() === req.user._id.toString() && approval.level === level
  );

  if (existingApproval) {
    return errorResponse(res, 'You have already approved this transaction at this level', 400);
  }

  // Add approval
  await billingTransaction.addApproval(req.user._id, level, comments);

  // Create billing event history entry for approval
  await BillingEventHistory.create({
    accountId: billingTransaction.accountId,
    agencyId: billingTransaction.agencyId,
    billingTransactionId: billingTransaction._id,
    eventType: 'transaction_approved',
    eventData: {
      level,
      comments,
      approvedBy: req.user._id
    },
    triggeredBy: req.user._id,
    metadata: {
      source: 'manual_approval'
    }
  });

  await billingTransaction.populate('approvals.approvedBy', 'firstName lastName email');

  successResponse(res, { billingTransaction }, 'Billing transaction approved successfully');
});

// @desc    Reconcile billing transaction
// @route   PATCH /api/billing-transactions/:id/reconcile
// @access  Private (Superadmin, Account Admin, Agency Admin)
const reconcileBillingTransaction = asyncHandler(async (req, res) => {
  const { bankStatementRef } = req.body;

  const billingTransaction = await BillingTransaction.findById(req.params.id);

  if (!billingTransaction) {
    return notFoundResponse(res, 'Billing transaction not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can reconcile any billing transaction
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can reconcile transactions in their account
    if (billingTransaction.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can reconcile transactions in their agency
    if (billingTransaction.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Check if already reconciled
  if (billingTransaction.reconciliation.isReconciled) {
    return errorResponse(res, 'Billing transaction is already reconciled', 400);
  }

  // Check if transaction is paid
  if (billingTransaction.status !== 'paid') {
    return errorResponse(res, 'Only paid transactions can be reconciled', 400);
  }

  billingTransaction.reconciliation = {
    isReconciled: true,
    reconciledDate: new Date(),
    reconciledBy: req.user._id,
    bankStatementRef
  };

  await billingTransaction.save();

  // Create billing event history entry for reconciliation
  await BillingEventHistory.create({
    accountId: billingTransaction.accountId,
    agencyId: billingTransaction.agencyId,
    billingTransactionId: billingTransaction._id,
    eventType: 'transaction_reconciled',
    eventData: {
      bankStatementRef,
      reconciledBy: req.user._id
    },
    triggeredBy: req.user._id,
    metadata: {
      source: 'manual_reconciliation'
    }
  });

  await billingTransaction.populate('reconciliation.reconciledBy', 'firstName lastName email');

  successResponse(res, { billingTransaction }, 'Billing transaction reconciled successfully');
});

// @desc    Get overdue billing transactions
// @route   GET /api/billing-transactions/overdue
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getOverdueTransactions = asyncHandler(async (req, res) => {
  let accountId, agencyId;

  // Determine scope based on user type
  if (req.user.portalType === 'superadmin') {
    accountId = req.query.accountId;
    agencyId = req.query.agencyId;
  } else if (req.user.portalType === 'account') {
    accountId = req.user.accountId;
    agencyId = req.query.agencyId;
  } else if (req.user.portalType === 'agency') {
    accountId = req.user.accountId;
    agencyId = req.user.agencyId;
  }

  if (!accountId) {
    return validationErrorResponse(res, null, 'Account ID is required');
  }

  const overdueTransactions = await BillingTransaction.getOverdueTransactions(accountId, agencyId);

  successResponse(res, { overdueTransactions }, 'Overdue billing transactions retrieved successfully');
});

// @desc    Get revenue summary
// @route   GET /api/billing-transactions/revenue-summary
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getRevenueSummary = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  let accountId, agencyId;

  // Determine scope based on user type
  if (req.user.portalType === 'superadmin') {
    accountId = req.query.accountId;
    agencyId = req.query.agencyId;
  } else if (req.user.portalType === 'account') {
    accountId = req.user.accountId;
    agencyId = req.query.agencyId;
  } else if (req.user.portalType === 'agency') {
    accountId = req.user.accountId;
    agencyId = req.user.agencyId;
  }

  if (!accountId) {
    return validationErrorResponse(res, null, 'Account ID is required');
  }

  const revenueSummary = await BillingTransaction.getRevenueSummary(accountId, agencyId, startDate, endDate);

  successResponse(res, { revenueSummary }, 'Revenue summary retrieved successfully');
});

// @desc    Get billing transaction statistics
// @route   GET /api/billing-transactions/stats
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getBillingTransactionStats = asyncHandler(async (req, res) => {
  // Build filter based on user permissions
  const filter = {};

  if (req.user.portalType === 'account' || req.user.portalType === 'agency') {
    filter.accountId = req.user.accountId;
  }

  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  // Get statistics
  const [
    totalTransactions,
    paidTransactions,
    overdueTransactions,
    statusStats,
    typeStats,
    monthlyRevenue
  ] = await Promise.all([
    BillingTransaction.countDocuments(filter),
    BillingTransaction.countDocuments({ ...filter, status: 'paid' }),
    BillingTransaction.countDocuments({ 
      ...filter, 
      dueDate: { $lt: new Date() }, 
      status: { $nin: ['paid', 'cancelled', 'refunded'] }
    }),
    BillingTransaction.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$signedAmount.value' } } }
    ]),
    BillingTransaction.aggregate([
      { $match: filter },
      { $group: { _id: '$transactionType', count: { $sum: 1 }, totalAmount: { $sum: '$signedAmount.value' } } }
    ]),
    BillingTransaction.aggregate([
      { $match: { ...filter, status: 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          revenue: { $sum: '$signedAmount.value' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ])
  ]);

  successResponse(res, {
    totalTransactions,
    paidTransactions,
    overdueTransactions,
    statusStats,
    typeStats,
    monthlyRevenue
  }, 'Billing transaction statistics retrieved successfully');
});

module.exports = {
  getBillingTransactions,
  getBillingTransaction,
  createBillingTransaction,
  updateBillingTransaction,
  updateBillingTransactionStatus,
  claimBillingTransaction,
  disputeBillingTransaction,
  resolveDisputeBillingTransaction,
  getDisputedTransactions,
  approveBillingTransaction,
  reconcileBillingTransaction,
  getOverdueTransactions,
  getRevenueSummary,
  getBillingTransactionStats
};