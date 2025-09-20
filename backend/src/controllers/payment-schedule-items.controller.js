const PaymentScheduleItem = require('../models/payment-schedule-item.model');
const BillingTransaction = require('../models/billing-transaction.model');
const BillingEventHistory = require('../models/billing-event-history.model');
const OfferLetter = require('../models/offer-letter.model');
const Agency = require('../models/agency.model');
const asyncHandler = require('../utils/async-handler.util');
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse,
  forbiddenResponse
} = require('../utils/response.util');

// @desc    Get all payment schedule items
// @route   GET /api/payment-schedule-items
// @access  Private (Superadmin, Account users, Agency users)
const getPaymentScheduleItems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    itemType,
    milestoneType,
    priority,
    isActive,
    isOverdue,
    agencyId,
    offerLetterId,
    sortBy = 'scheduledDueDate',
    sortOrder = 'asc'
  } = req.query;

  // Build filter object
  const filter = {};

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all payment schedule items, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else if (req.user.portalType === 'account') {
    // Account users can only see items in their account
    filter.accountId = req.user.accountId;
  } else if (req.user.portalType === 'agency') {
    // Agency users can only see items in their account and agency
    filter.accountId = req.user.accountId;
    filter.agencyId = req.user.agencyId;
  }

  // Apply additional filters
  if (search) {
    filter.$or = [
      { description: { $regex: search, $options: 'i' } },
      { 'metadata.notes': { $regex: search, $options: 'i' } }
    ];
  }

  if (itemType) {
    filter.itemType = itemType;
  }

  if (milestoneType) {
    filter.milestoneType = milestoneType;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }

  if (agencyId) {
    filter.agencyId = agencyId;
  }

  if (offerLetterId) {
    filter.offerLetterId = offerLetterId;
  }

  // Handle overdue filter
  if (isOverdue === 'true') {
    filter.scheduledDueDate = { $lt: new Date() };
    filter.isActive = true;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const [paymentScheduleItems, total] = await Promise.all([
    PaymentScheduleItem.find(filter)
      .populate('accountId', 'name')
      .populate('agencyId', 'name type')
      .populate('offerLetterId', 'institutionDetails.name courseDetails.name studentId')
      .populate('replacedById', 'itemType scheduledAmount')
      .populate('parentItemId', 'itemType scheduledAmount')
      .populate('metadata.createdBy', 'firstName lastName email')
      .populate('metadata.approvedBy', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    PaymentScheduleItem.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  successResponse(res, {
    paymentScheduleItems,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  }, 'Payment schedule items retrieved successfully');
});

// @desc    Get single payment schedule item
// @route   GET /api/payment-schedule-items/:id
// @access  Private (Superadmin, Account users, Agency users with restrictions)
const getPaymentScheduleItem = asyncHandler(async (req, res) => {
  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id)
    .populate('accountId', 'name contactInfo')
    .populate('agencyId', 'name type contactInfo')
    .populate('offerLetterId')
    .populate('replacedById')
    .populate('parentItemId')
    .populate('childItems')
    .populate('billingTransactions')
    .populate('metadata.createdBy', 'firstName lastName email')
    .populate('metadata.approvedBy', 'firstName lastName email');

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can access any payment schedule item
  } else if (req.user.portalType === 'account') {
    // Account users can only access items in their account
    if (paymentScheduleItem.accountId._id.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only access items in their agency
    if (paymentScheduleItem.accountId._id.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId._id.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  }

  successResponse(res, { paymentScheduleItem }, 'Payment schedule item retrieved successfully');
});

// @desc    Create new payment schedule item
// @route   POST /api/payment-schedule-items
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const createPaymentScheduleItem = asyncHandler(async (req, res) => {
  const {
    accountId,
    agencyId,
    offerLetterId,
    itemType,
    milestoneType,
    scheduledAmount,
    scheduledDueDate,
    description,
    priority,
    isRecurring,
    recurringDetails,
    conditions,
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

  // Validate offer letter exists and belongs to account/agency
  if (offerLetterId) {
    const offerLetter = await OfferLetter.findById(offerLetterId);
    if (!offerLetter) {
      return errorResponse(res, 'Offer letter not found', 400);
    }
    if (offerLetter.accountId.toString() !== finalAccountId.toString()) {
      return errorResponse(res, 'Offer letter must belong to the same account', 400);
    }
    if (finalAgencyId && offerLetter.agencyId.toString() !== finalAgencyId.toString()) {
      return errorResponse(res, 'Offer letter must belong to the same agency', 400);
    }
  }

  // Validate scheduled amount
  if (!scheduledAmount || !scheduledAmount.value || scheduledAmount.value <= 0) {
    return validationErrorResponse(res, null, 'Valid scheduled amount is required');
  }

  // Validate scheduled due date
  if (!scheduledDueDate) {
    return validationErrorResponse(res, null, 'Scheduled due date is required');
  }

  // Validate recurring details if recurring
  if (isRecurring) {
    if (!recurringDetails || !recurringDetails.frequency) {
      return validationErrorResponse(res, null, 'Recurring frequency is required for recurring items');
    }
    if (!recurringDetails.endDate && !recurringDetails.occurrences) {
      return validationErrorResponse(res, null, 'Either end date or number of occurrences is required for recurring items');
    }
  }

  const paymentScheduleItem = await PaymentScheduleItem.create({
    accountId: finalAccountId,
    agencyId: finalAgencyId,
    offerLetterId,
    itemType,
    milestoneType,
    scheduledAmount,
    scheduledDueDate,
    description,
    priority: priority || 'medium',
    status: 'active',
    isRecurring: isRecurring || false,
    recurringDetails: isRecurring ? recurringDetails : undefined,
    conditions: conditions || [],
    createdBy: req.user._id,
    updatedBy: req.user._id,
    metadata: {
      ...metadata
    }
  });

  // Populate the created payment schedule item
  await paymentScheduleItem.populate('accountId', 'name');
  await paymentScheduleItem.populate('agencyId', 'name type');
  await paymentScheduleItem.populate('offerLetterId', 'institutionDetails.name courseDetails.name');
  await paymentScheduleItem.populate('metadata.createdBy', 'firstName lastName email');

  createdResponse(res, { paymentScheduleItem }, 'Payment schedule item created successfully');
});

// @desc    Update payment schedule item
// @route   PUT /api/payment-schedule-items/:id
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const updatePaymentScheduleItem = asyncHandler(async (req, res) => {
  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id);

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any payment schedule item
  } else if (req.user.portalType === 'account') {
    // Account users can only update items in their account
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
    // Only admin/manager can update
    if (!['admin', 'manager'].includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions to update payment schedule items');
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update items in their agency
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
    // Only admin/manager can update
    if (!['admin', 'manager'].includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions to update payment schedule items');
    }
  }

  // Check if item has associated billing transactions
  const transactionCount = await BillingTransaction.countDocuments({ 
    paymentScheduleItemId: req.params.id 
  });

  // Restrict updates if there are associated transactions
  const restrictedFields = ['accountId', 'agencyId', 'createdBy', 'status', 'replacedById', 'replacementReason', 'retiredAt', 'retiredBy', 'retirementReason'];
  if (transactionCount > 0) {
    restrictedFields.push('scheduledAmount', 'itemType', 'offerLetterId');
  }

  // Check for restricted field updates
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (!restrictedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Add audit trail
  updates.updatedBy = req.user._id;

  // Validate scheduled amount if being updated
  if (updates.scheduledAmount && (!updates.scheduledAmount.value || updates.scheduledAmount.value <= 0)) {
    return validationErrorResponse(res, null, 'Valid scheduled amount is required');
  }

  // Validate recurring details if being updated
  if (updates.isRecurring && updates.recurringDetails) {
    if (!updates.recurringDetails.frequency) {
      return validationErrorResponse(res, null, 'Recurring frequency is required for recurring items');
    }
    if (!updates.recurringDetails.endDate && !updates.recurringDetails.occurrences) {
      return validationErrorResponse(res, null, 'Either end date or number of occurrences is required for recurring items');
    }
  }

  const updatedPaymentScheduleItem = await PaymentScheduleItem.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name')
   .populate('agencyId', 'name type')
   .populate('offerLetterId', 'institutionDetails.name courseDetails.name')
   .populate('metadata.createdBy', 'firstName lastName email')
   .populate('metadata.approvedBy', 'firstName lastName email');

  successResponse(res, { paymentScheduleItem: updatedPaymentScheduleItem }, 'Payment schedule item updated successfully');
});

// @desc    Delete payment schedule item
// @route   DELETE /api/payment-schedule-items/:id
// @access  Private (Superadmin, Account Admin, Agency Admin)
const deletePaymentScheduleItem = asyncHandler(async (req, res) => {
  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id);

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can delete any payment schedule item
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can delete items in their account
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can delete items in their agency
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else {
    return forbiddenResponse(res, 'Insufficient permissions to delete payment schedule items');
  }

  // Check if item has associated billing transactions
  const BillingTransaction = require('../models/billing-transaction.model');
  const transactionCount = await BillingTransaction.countDocuments({ 
    paymentScheduleItemId: req.params.id 
  });

  if (transactionCount > 0) {
    return errorResponse(res, 'Cannot delete payment schedule item with associated billing transactions', 400);
  }

  // Check if item has child items (for recurring items)
  const childItemCount = await PaymentScheduleItem.countDocuments({ 
    parentItemId: req.params.id 
  });

  if (childItemCount > 0) {
    return errorResponse(res, 'Cannot delete payment schedule item with child items', 400);
  }

  await PaymentScheduleItem.findByIdAndDelete(req.params.id);

  successResponse(res, null, 'Payment schedule item deleted successfully');
});

// @desc    Approve payment schedule item
// @route   PATCH /api/payment-schedule-items/:id/approve
// @access  Private (Superadmin, Account Admin, Agency Admin)
const approvePaymentScheduleItem = asyncHandler(async (req, res) => {
  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id);

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can approve any payment schedule item
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can approve items in their account
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can approve items in their agency
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else {
    return forbiddenResponse(res, 'Insufficient permissions to approve payment schedule items');
  }

  // Check if already approved
  if (paymentScheduleItem.metadata.approvedBy) {
    return errorResponse(res, 'Payment schedule item is already approved', 400);
  }

  paymentScheduleItem.metadata.approvedBy = req.user._id;
  paymentScheduleItem.metadata.approvedAt = new Date();
  await paymentScheduleItem.save();

  await paymentScheduleItem.populate('metadata.approvedBy', 'firstName lastName email');

  successResponse(res, { paymentScheduleItem }, 'Payment schedule item approved successfully');
});

// @desc    Retire payment schedule item
// @route   PATCH /api/payment-schedule-items/:id/retire
// @access  Private (Superadmin, Account Admin, Agency Admin)
const retirePaymentScheduleItem = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason) {
    return validationErrorResponse(res, null, 'Retirement reason is required');
  }

  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id);

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can retire any payment schedule item
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can retire items in their account
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can retire items in their agency
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else {
    return forbiddenResponse(res, 'Insufficient permissions to retire payment schedule items');
  }

  // Check if item is already retired
  if (paymentScheduleItem.status === 'retired') {
    return errorResponse(res, 'Payment schedule item is already retired', 400);
  }

  // Use model instance method for retirement
  await paymentScheduleItem.retire(req.user._id, reason);

  await paymentScheduleItem.populate('retiredBy', 'firstName lastName email');

  successResponse(res, { paymentScheduleItem }, 'Payment schedule item retired successfully');
});

// @desc    Replace payment schedule item
// @route   POST /api/payment-schedule-items/:id/replace
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const replacePaymentScheduleItem = asyncHandler(async (req, res) => {
  const { reason, newItemData } = req.body;
  
  if (!reason) {
    return validationErrorResponse(res, null, 'Replacement reason is required');
  }

  if (!newItemData) {
    return validationErrorResponse(res, null, 'New item data is required');
  }

  const originalItem = await PaymentScheduleItem.findById(req.params.id);

  if (!originalItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can replace any payment schedule item
  } else if (req.user.portalType === 'account') {
    // Account users can only replace items in their account
    if (originalItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
    // Only admin/manager can replace
    if (!['admin', 'manager'].includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions to replace payment schedule items');
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only replace items in their agency
    if (originalItem.accountId.toString() !== req.user.accountId.toString() ||
        originalItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
    // Only admin/manager can replace
    if (!['admin', 'manager'].includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions to replace payment schedule items');
    }
  }

  // Check if item is already replaced
  if (originalItem.status === 'replaced') {
    return errorResponse(res, 'Payment schedule item is already replaced', 400);
  }

  // Create new item with updated data
  const newItem = await PaymentScheduleItem.create({
    ...newItemData,
    accountId: originalItem.accountId,
    agencyId: originalItem.agencyId,
    parentItemId: originalItem._id,
    createdBy: req.user._id,
    updatedBy: req.user._id,
    status: 'active'
  });

  // Mark original item as replaced
  await originalItem.replace(newItem._id, reason, req.user._id);

  // Populate the new item
  await newItem.populate('accountId', 'name');
  await newItem.populate('agencyId', 'name type');
  await newItem.populate('offerLetterId', 'institutionDetails.name courseDetails.name');
  await newItem.populate('parentItemId', 'itemType scheduledAmount');

  successResponse(res, { 
    originalItem, 
    newItem 
  }, 'Payment schedule item replaced successfully');
});

// @desc    Complete payment schedule item
// @route   PATCH /api/payment-schedule-items/:id/complete
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const completePaymentScheduleItem = asyncHandler(async (req, res) => {
  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id);

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can complete any payment schedule item
  } else if (req.user.portalType === 'account') {
    // Account users can only complete items in their account
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
    // Only admin/manager can complete
    if (!['admin', 'manager'].includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions to complete payment schedule items');
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only complete items in their agency
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
    // Only admin/manager can complete
    if (!['admin', 'manager'].includes(req.user.role)) {
      return forbiddenResponse(res, 'Insufficient permissions to complete payment schedule items');
    }
  }

  // Check if item is already completed
  if (paymentScheduleItem.status === 'completed') {
    return errorResponse(res, 'Payment schedule item is already completed', 400);
  }

  // Use model instance method for completion
  await paymentScheduleItem.complete(req.user._id);

  await paymentScheduleItem.populate('metadata.completedBy', 'firstName lastName email');

  successResponse(res, { paymentScheduleItem }, 'Payment schedule item completed successfully');
});

// @desc    Cancel payment schedule item
// @route   PATCH /api/payment-schedule-items/:id/cancel
// @access  Private (Superadmin, Account Admin, Agency Admin)
const cancelPaymentScheduleItem = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  if (!reason) {
    return validationErrorResponse(res, null, 'Cancellation reason is required');
  }

  const paymentScheduleItem = await PaymentScheduleItem.findById(req.params.id);

  if (!paymentScheduleItem) {
    return notFoundResponse(res, 'Payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can cancel any payment schedule item
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can cancel items in their account
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can cancel items in their agency
    if (paymentScheduleItem.accountId.toString() !== req.user.accountId.toString() ||
        paymentScheduleItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else {
    return forbiddenResponse(res, 'Insufficient permissions to cancel payment schedule items');
  }

  // Check if item is already cancelled
  if (paymentScheduleItem.status === 'cancelled') {
    return errorResponse(res, 'Payment schedule item is already cancelled', 400);
  }

  // Use model instance method for cancellation
  await paymentScheduleItem.cancel(req.user._id, reason);

  await paymentScheduleItem.populate('retiredBy', 'firstName lastName email');

  successResponse(res, { paymentScheduleItem }, 'Payment schedule item cancelled successfully');
});

// @desc    Get overdue payment schedule items
// @route   GET /api/payment-schedule-items/overdue
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getOverdueItems = asyncHandler(async (req, res) => {
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

  const overdueItems = await PaymentScheduleItem.getOverdueItems(accountId, agencyId);

  successResponse(res, { overdueItems }, 'Overdue payment schedule items retrieved successfully');
});

// @desc    Get upcoming payment schedule items
// @route   GET /api/payment-schedule-items/upcoming
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getUpcomingItems = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
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

  const upcomingItems = await PaymentScheduleItem.getUpcomingItems(accountId, parseInt(days), agencyId);

  successResponse(res, { upcomingItems }, 'Upcoming payment schedule items retrieved successfully');
});

// @desc    Generate billing transactions from payment schedule items
// @route   POST /api/payment-schedule-items/generate-transactions
// @access  Private (Superadmin, Account Admin, Agency Admin)
const generateBillingTransactions = asyncHandler(async (req, res) => {
  const { accountId, agencyId, dueDate, itemIds } = req.body;

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can generate transactions for any account
    if (!accountId) {
      return validationErrorResponse(res, null, 'Account ID is required for superadmin');
    }
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Account admins can only generate transactions for their account
    if (accountId && accountId !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to generate transactions for this account');
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Agency admins can only generate transactions for their agency
    if (accountId && accountId !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to generate transactions for this account');
    }
    if (agencyId && agencyId !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to generate transactions for this agency');
    }
  } else {
    return forbiddenResponse(res, 'Insufficient permissions to generate billing transactions');
  }

  try {
    // Use the static method from the model to generate transactions
    const result = await PaymentScheduleItem.generateBillingTransactions({
      accountId: accountId || req.user.accountId,
      agencyId: agencyId || req.user.agencyId,
      dueDate: dueDate ? new Date(dueDate) : new Date(),
      itemIds,
      triggeredBy: req.user._id
    });

    successResponse(res, {
      generatedTransactions: result.transactions.length,
      transactions: result.transactions,
      eventHistories: result.eventHistories.length
    }, 'Billing transactions generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

// @desc    Generate recurring payment schedule items
// @route   POST /api/payment-schedule-items/generate-recurring
// @access  Private (Superadmin, Account Admin, Agency Admin)
const generateRecurringItems = asyncHandler(async (req, res) => {
  const { parentItemId, generateUntil } = req.body;

  if (!parentItemId) {
    return validationErrorResponse(res, null, 'Parent item ID is required');
  }

  const parentItem = await PaymentScheduleItem.findById(parentItemId);
  if (!parentItem) {
    return notFoundResponse(res, 'Parent payment schedule item not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can generate recurring items for any payment schedule item
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Account admins can only generate recurring items for their account
    if (parentItem.accountId.toString() !== req.user.accountId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Agency admins can only generate recurring items for their agency
    if (parentItem.accountId.toString() !== req.user.accountId.toString() ||
        parentItem.agencyId.toString() !== req.user.agencyId.toString()) {
      return forbiddenResponse(res, 'Access denied to this payment schedule item');
    }
  } else {
    return forbiddenResponse(res, 'Insufficient permissions to generate recurring items');
  }

  if (!parentItem.isRecurring) {
    return errorResponse(res, 'Payment schedule item is not configured for recurring', 400);
  }

  try {
    // Use the static method from the model to generate recurring items
    const childItems = await PaymentScheduleItem.generateRecurringItems(
      parentItemId,
      generateUntil ? new Date(generateUntil) : undefined
    );

    successResponse(res, {
      generatedItems: childItems.length,
      childItems
    }, 'Recurring payment schedule items generated successfully');
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
});

// @desc    Get payment schedule item statistics
// @route   GET /api/payment-schedule-items/stats
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getPaymentScheduleItemStats = asyncHandler(async (req, res) => {
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
    totalItems,
    activeItems,
    overdueItems,
    itemTypeStats,
    milestoneStats,
    priorityStats,
    statusStats,
    replacementStats
  ] = await Promise.all([
    PaymentScheduleItem.countDocuments(filter),
    PaymentScheduleItem.countDocuments({ ...filter, status: 'active', isActive: true }),
    PaymentScheduleItem.countDocuments({ 
      ...filter, 
      scheduledDueDate: { $lt: new Date() }, 
      status: 'active',
      isActive: true 
    }),
    PaymentScheduleItem.aggregate([
      { $match: filter },
      { $group: { _id: '$itemType', count: { $sum: 1 }, totalAmount: { $sum: '$scheduledAmount.value' } } }
    ]),
    PaymentScheduleItem.aggregate([
      { $match: filter },
      { $group: { _id: '$milestoneType', count: { $sum: 1 } } }
    ]),
    PaymentScheduleItem.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]),
    PaymentScheduleItem.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    PaymentScheduleItem.aggregate([
      { $match: { ...filter, replacementReason: { $ne: null } } },
      { $group: { _id: '$replacementReason', count: { $sum: 1 } } }
    ])
  ]);

  successResponse(res, {
    totalItems,
    activeItems,
    overdueItems,
    itemTypeStats,
    milestoneStats,
    priorityStats,
    statusStats,
    replacementStats
  }, 'Payment schedule item statistics retrieved successfully');
});

module.exports = {
  getPaymentScheduleItems,
  getPaymentScheduleItem,
  createPaymentScheduleItem,
  updatePaymentScheduleItem,
  deletePaymentScheduleItem,
  approvePaymentScheduleItem,
  retirePaymentScheduleItem,
  replacePaymentScheduleItem,
  completePaymentScheduleItem,
  cancelPaymentScheduleItem,
  getOverdueItems,
  getUpcomingItems,
  generateBillingTransactions,
  generateRecurringItems,
  getPaymentScheduleItemStats
};