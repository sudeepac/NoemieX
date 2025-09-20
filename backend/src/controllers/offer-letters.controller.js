const OfferLetter = require('../models/offer-letter.model');
const Agency = require('../models/agency.model');
const asyncHandler = require('../utils/async-handler.util');
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/response.util');

// @desc    Get all offer letters
// @route   GET /api/offer-letters
// @access  Private (Superadmin, Account users, Agency users)
const getOfferLetters = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    agencyId,
    studentId,
    courseId,
    intakeYear,
    intakeTerm,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build filter object
  const filter = {};

  // Apply account-based filtering
  if (req.user.portalType === 'superadmin') {
    // Superadmin can see all offer letters, optionally filter by accountId
    if (req.query.accountId) {
      filter.accountId = req.query.accountId;
    }
  } else {
    // Account and agency users can only see offer letters in their account
    filter.accountId = req.user.accountId;
  }

  // Apply agency-based filtering for agency users
  if (req.user.portalType === 'agency') {
    filter.agencyId = req.user.agencyId;
  }

  // Apply additional filters
  if (search) {
    filter.$or = [
      { 'institutionDetails.name': { $regex: search, $options: 'i' } },
      { 'courseDetails.name': { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } }
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (agencyId) {
    filter.agencyId = agencyId;
  }

  if (studentId) {
    filter.studentId = studentId;
  }

  if (courseId) {
    filter.courseId = courseId;
  }

  if (intakeYear) {
    filter['intake.year'] = parseInt(intakeYear);
  }

  if (intakeTerm) {
    filter['intake.term'] = intakeTerm;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Execute query with population
  const [offerLetters, total] = await Promise.all([
    OfferLetter.find(filter)
      .populate('accountId', 'name')
      .populate('agencyId', 'name type')
      .populate('studentId', 'firstName lastName email')
      .populate('courseId', 'name level')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    OfferLetter.countDocuments(filter)
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(total / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  successResponse(res, {
    offerLetters,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage,
      hasPrevPage
    }
  }, 'Offer letters retrieved successfully');
});

// @desc    Get single offer letter
// @route   GET /api/offer-letters/:id
// @access  Private (Superadmin, Account users, Agency users with restrictions)
const getOfferLetter = asyncHandler(async (req, res) => {
  const offerLetter = await OfferLetter.findById(req.params.id)
    .populate('accountId', 'name contactInfo')
    .populate('agencyId', 'name type contactInfo')
    .populate('studentId', 'firstName lastName email profile')
    .populate('courseId', 'name level description')
    .populate('paymentScheduleItems')
    .populate('billingTransactions');

  if (!offerLetter) {
    return notFoundResponse(res, 'Offer letter not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can access any offer letter
  } else if (req.user.portalType === 'account') {
    // Account users can only access offer letters in their account
    if (offerLetter.accountId._id.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only access offer letters in their agency
    if (offerLetter.agencyId._id.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  }

  successResponse(res, { offerLetter }, 'Offer letter retrieved successfully');
});

// @desc    Create new offer letter
// @route   POST /api/offer-letters
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const createOfferLetter = asyncHandler(async (req, res) => {
  const {
    accountId,
    agencyId,
    studentId,
    courseId,
    institutionDetails,
    courseDetails,
    intake,
    issueDate,
    expiryDate,
    status,
    documents,
    conditions,
    commissionDetails,
    notes
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

  // Validate required documents
  if (!documents || !documents.offerLetterUrl) {
    return validationErrorResponse(res, null, 'Offer letter document is required');
  }

  // Validate intake date
  if (intake && intake.year && intake.year < new Date().getFullYear()) {
    return validationErrorResponse(res, null, 'Intake year cannot be in the past');
  }

  // Validate tuition fee
  if (!courseDetails || !courseDetails.tuitionFee || courseDetails.tuitionFee.value <= 0) {
    return validationErrorResponse(res, null, 'Valid tuition fee is required');
  }

  const offerLetter = await OfferLetter.create({
    accountId: finalAccountId,
    agencyId: finalAgencyId,
    studentId,
    courseId,
    institutionDetails,
    courseDetails,
    intake,
    issueDate: issueDate || new Date(),
    expiryDate,
    status: status || 'draft',
    documents,
    conditions: conditions || [],
    commissionDetails,
    notes,
    version: 1,
    originalOfferLetterId: null,
    replacedByOfferLetterId: null,
    replacementReason: null,
    lifecycle: {
      draftedAt: new Date()
    },
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  // Populate the created offer letter
  await offerLetter.populate('accountId', 'name');
  await offerLetter.populate('agencyId', 'name type');
  await offerLetter.populate('studentId', 'firstName lastName email');
  await offerLetter.populate('courseId', 'name level');

  createdResponse(res, { offerLetter }, 'Offer letter created successfully');
});

// @desc    Update offer letter
// @route   PUT /api/offer-letters/:id
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const updateOfferLetter = asyncHandler(async (req, res) => {
  const offerLetter = await OfferLetter.findById(req.params.id);

  if (!offerLetter) {
    return notFoundResponse(res, 'Offer letter not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any offer letter
  } else if (req.user.portalType === 'account') {
    // Account users can only update offer letters in their account
    if (offerLetter.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Only admin/manager can update
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update offer letters in their agency
    if (offerLetter.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    // Only admin/manager can update
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  // Restrict fields based on status and system fields
  const restrictedFields = ['version', 'originalOfferLetterId', 'replacedByOfferLetterId', 'replacementReason', 'lifecycle', 'createdBy'];
  if (offerLetter.status === 'accepted') {
    restrictedFields.push('courseDetails', 'institutionDetails', 'intake');
  }
  if (['replaced', 'cancelled', 'expired'].includes(offerLetter.status)) {
    restrictedFields.push('courseDetails', 'institutionDetails', 'intake', 'documents', 'conditions', 'commissionDetails');
  }

  // Check for restricted field updates
  const updates = {};
  Object.keys(req.body).forEach(key => {
    if (!restrictedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Always update the updatedBy field
  updates.updatedBy = req.user._id;

  // Validate status transitions
  if (updates.status && updates.status !== offerLetter.status) {
    const validTransitions = {
      'draft': ['pending', 'cancelled'],
      'pending': ['issued', 'rejected', 'cancelled'],
      'issued': ['accepted', 'rejected', 'expired', 'cancelled'],
      'accepted': ['expired'],
      'rejected': [],
      'expired': [],
      'replaced': [],
      'cancelled': []
    };

    if (!validTransitions[offerLetter.status].includes(updates.status)) {
      return errorResponse(res, `Cannot change status from ${offerLetter.status} to ${updates.status}`, 400);
    }

    // Use model instance methods for lifecycle tracking
    if (updates.status === 'issued') {
      delete updates.status; // Remove from updates as we'll use the instance method
      await offerLetter.issue(req.user._id);
    } else if (updates.status === 'accepted') {
      delete updates.status;
      await offerLetter.accept(req.user._id);
    } else if (updates.status === 'rejected') {
      delete updates.status;
      await offerLetter.reject(req.user._id);
    } else if (updates.status === 'cancelled') {
      delete updates.status;
      await offerLetter.cancel(req.user._id);
    }
  }

  // Validate intake date if being updated
  if (updates.intake && updates.intake.year && updates.intake.year < new Date().getFullYear()) {
    return validationErrorResponse(res, null, 'Intake year cannot be in the past');
  }

  const updatedOfferLetter = await OfferLetter.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).populate('accountId', 'name')
   .populate('agencyId', 'name type')
   .populate('studentId', 'firstName lastName email')
   .populate('courseId', 'name level');

  successResponse(res, { offerLetter: updatedOfferLetter }, 'Offer letter updated successfully');
});

// @desc    Delete offer letter
// @route   DELETE /api/offer-letters/:id
// @access  Private (Superadmin, Account Admin, Agency Admin)
const deleteOfferLetter = asyncHandler(async (req, res) => {
  const offerLetter = await OfferLetter.findById(req.params.id);

  if (!offerLetter) {
    return notFoundResponse(res, 'Offer letter not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can delete any offer letter
  } else if (req.user.portalType === 'account' && req.user.role === 'admin') {
    // Only account admins can delete offer letters in their account
    if (offerLetter.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else if (req.user.portalType === 'agency' && req.user.role === 'admin') {
    // Only agency admins can delete offer letters in their agency
    if (offerLetter.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
  } else {
    return errorResponse(res, 'Access denied', 403);
  }

  // Check if offer letter has associated payment schedules or transactions
  const PaymentScheduleItem = require('../models/payment-schedule-item.model');
  const BillingTransaction = require('../models/billing-transaction.model');

  const [paymentScheduleCount, transactionCount] = await Promise.all([
    PaymentScheduleItem.countDocuments({ offerLetterId: req.params.id }),
    BillingTransaction.countDocuments({ offerLetterId: req.params.id })
  ]);

  if (paymentScheduleCount > 0 || transactionCount > 0) {
    return errorResponse(res, 'Cannot delete offer letter with associated payment schedules or transactions', 400);
  }

  // Prevent deletion of accepted offer letters
  if (offerLetter.status === 'accepted') {
    return errorResponse(res, 'Cannot delete accepted offer letters', 400);
  }

  await OfferLetter.findByIdAndDelete(req.params.id);

  successResponse(res, null, 'Offer letter deleted successfully');
});

// @desc    Replace offer letter
// @route   POST /api/offer-letters/:id/replace
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const replaceOfferLetter = asyncHandler(async (req, res) => {
  const { reason, ...newOfferLetterData } = req.body;
  const originalOfferLetter = await OfferLetter.findById(req.params.id);

  if (!originalOfferLetter) {
    return notFoundResponse(res, 'Original offer letter not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can replace any offer letter
  } else if (req.user.portalType === 'account') {
    if (originalOfferLetter.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    if (originalOfferLetter.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  // Validate replacement reason
  const validReasons = ['course_change', 'fee_update', 'intake_change', 'correction', 'upgrade', 'other'];
  if (!reason || !validReasons.includes(reason)) {
    return validationErrorResponse(res, null, 'Valid replacement reason is required');
  }

  // Check if original offer letter can be replaced
  if (['replaced', 'cancelled', 'expired'].includes(originalOfferLetter.status)) {
    return errorResponse(res, 'Cannot replace offer letter with current status', 400);
  }

  // Create new offer letter with incremented version
  const newOfferLetter = await OfferLetter.create({
    ...originalOfferLetter.toObject(),
    _id: undefined,
    __v: undefined,
    createdAt: undefined,
    updatedAt: undefined,
    ...newOfferLetterData,
    version: originalOfferLetter.version + 1,
    originalOfferLetterId: originalOfferLetter.originalOfferLetterId || originalOfferLetter._id,
    replacedByOfferLetterId: null,
    replacementReason: null,
    status: 'draft',
    lifecycle: {
      draftedAt: new Date()
    },
    createdBy: req.user._id,
    updatedBy: req.user._id
  });

  // Mark original offer letter as replaced
  await originalOfferLetter.replace(newOfferLetter._id, reason, req.user._id);

  // Populate the new offer letter
  await newOfferLetter.populate('accountId', 'name');
  await newOfferLetter.populate('agencyId', 'name type');
  await newOfferLetter.populate('studentId', 'firstName lastName email');
  await newOfferLetter.populate('courseId', 'name level');

  createdResponse(res, { 
    originalOfferLetter,
    newOfferLetter 
  }, 'Offer letter replaced successfully');
});

// @desc    Update offer letter status
// @route   PATCH /api/offer-letters/:id/status
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const updateOfferLetterStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const offerLetter = await OfferLetter.findById(req.params.id);

  if (!offerLetter) {
    return notFoundResponse(res, 'Offer letter not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can update any offer letter status
  } else if (req.user.portalType === 'account') {
    // Account users can only update offer letters in their account
    if (offerLetter.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    // Agency users can only update offer letters in their agency
    if (offerLetter.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  // Validate status transitions
  const validTransitions = {
    'draft': ['pending', 'cancelled'],
    'pending': ['issued', 'rejected', 'cancelled'],
    'issued': ['accepted', 'rejected', 'expired', 'cancelled'],
    'accepted': ['expired'],
    'rejected': [],
    'expired': [],
    'replaced': [],
    'cancelled': []
  };

  if (!validTransitions[offerLetter.status].includes(status)) {
    return errorResponse(res, `Cannot change status from ${offerLetter.status} to ${status}`, 400);
  }

  // Use model instance methods for lifecycle tracking
  if (status === 'issued') {
    await offerLetter.issue(req.user._id);
  } else if (status === 'accepted') {
    await offerLetter.accept(req.user._id);
  } else if (status === 'rejected') {
    await offerLetter.reject(req.user._id);
  } else if (status === 'cancelled') {
    await offerLetter.cancel(req.user._id);
  } else {
    offerLetter.status = status;
    offerLetter.updatedBy = req.user._id;
    await offerLetter.save();
  }

  successResponse(res, { offerLetter }, 'Offer letter status updated successfully');
});

// @desc    Add document to offer letter
// @route   POST /api/offer-letters/:id/documents
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const addDocument = asyncHandler(async (req, res) => {
  const { name, url } = req.body;
  const offerLetter = await OfferLetter.findById(req.params.id);

  if (!offerLetter) {
    return notFoundResponse(res, 'Offer letter not found');
  }

  // Check access permissions
  if (req.user.portalType === 'superadmin') {
    // Superadmin can add documents to any offer letter
  } else if (req.user.portalType === 'account') {
    if (offerLetter.accountId.toString() !== req.user.accountId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  } else if (req.user.portalType === 'agency') {
    if (offerLetter.agencyId.toString() !== req.user.agencyId.toString()) {
      return errorResponse(res, 'Access denied', 403);
    }
    if (!['admin', 'manager'].includes(req.user.role)) {
      return errorResponse(res, 'Insufficient permissions', 403);
    }
  }

  if (!name || !url) {
    return validationErrorResponse(res, null, 'Document name and URL are required');
  }

  offerLetter.documents.additionalDocs.push({
    name,
    url,
    uploadDate: new Date()
  });

  await offerLetter.save();

  successResponse(res, { offerLetter }, 'Document added successfully');
});

// @desc    Get offer letter statistics
// @route   GET /api/offer-letters/stats
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
const getOfferLetterStats = asyncHandler(async (req, res) => {
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
    totalOfferLetters,
    statusStats,
    intakeStats,
    monthlyStats,
    versionStats,
    replacementStats
  ] = await Promise.all([
    OfferLetter.countDocuments(filter),
    OfferLetter.aggregate([
      { $match: filter },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    OfferLetter.aggregate([
      { $match: filter },
      { $group: { _id: { year: '$intake.year', term: '$intake.term' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.term': 1 } }
    ]),
    OfferLetter.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]),
    OfferLetter.aggregate([
      { $match: filter },
      { $group: { _id: '$version', count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ]),
    OfferLetter.aggregate([
      { $match: { ...filter, replacementReason: { $ne: null } } },
      { $group: { _id: '$replacementReason', count: { $sum: 1 } } }
    ])
  ]);

  successResponse(res, {
    totalOfferLetters,
    statusStats,
    intakeStats,
    monthlyStats,
    versionStats,
    replacementStats
  }, 'Offer letter statistics retrieved successfully');
});

module.exports = {
  getOfferLetters,
  getOfferLetter,
  createOfferLetter,
  updateOfferLetter,
  deleteOfferLetter,
  replaceOfferLetter,
  updateOfferLetterStatus,
  addDocument,
  getOfferLetterStats
};