const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requirePortal, enforceAccountAccess, enforceAgencyAccess, requirePermission } = require('../middleware/authorization.middleware');
const { validateRequest } = require('../middleware/validation.middleware');

// Import controller
const {
  getBillingEventHistories,
  getBillingEventHistory,
  getTransactionTimeline,
  getActivitySummary,
  getUserActivity,
  hideBillingEventHistory
} = require('../controllers/billing-event-histories.controller');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route GET /api/billing-event-histories
 * @desc Get billing event histories with filtering and pagination
 * @access Private (Super Admin, Account Admin, Agency Staff)
 */
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('eventType').optional().isIn([
      'created', 'updated', 'claimed', 'payment_received', 'payment_partial',
      'payment_failed', 'overdue', 'cancelled', 'refunded', 'approved',
      'rejected', 'reconciled', 'disputed', 'resolved'
    ]).withMessage('Invalid event type'),
    query('billingTransactionId').optional().isMongoId().withMessage('Invalid billing transaction ID'),
    query('performedBy').optional().isMongoId().withMessage('Invalid user ID'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
    query('sortBy').optional().isIn(['eventDate', 'eventType', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
    query('accountId').optional().isMongoId().withMessage('Invalid account ID'),
    query('agencyId').optional().isMongoId().withMessage('Invalid agency ID')
  ],
  authorize(['super_admin', 'account_admin', 'agency_staff']),
  requirePortal(['super_admin', 'account', 'agency']),
  getBillingEventHistories
);

/**
 * @route GET /api/billing-event-histories/activity-summary
 * @desc Get activity summary for account/agency
 * @access Private (Super Admin, Account Admin, Agency Staff)
 */
router.get('/activity-summary',
  [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    query('accountId').optional().isMongoId().withMessage('Invalid account ID'),
    query('agencyId').optional().isMongoId().withMessage('Invalid agency ID')
  ],
  authorize(['super_admin', 'account_admin', 'agency_staff']),
  requirePortal(['super_admin', 'account', 'agency']),
  getActivitySummary
);

/**
 * @route GET /api/billing-event-histories/user-activity/:userId
 * @desc Get user activity history
 * @access Private (Super Admin, Account Admin)
 */
router.get('/user-activity/:userId',
  [
    param('userId').isMongoId().withMessage('Invalid user ID'),
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('Days must be between 1 and 365'),
    query('accountId').optional().isMongoId().withMessage('Invalid account ID')
  ],
  authorize(['super_admin', 'account_admin']),
  requirePortal(['super_admin', 'account']),
  requirePermission('billing:read'),
  getUserActivity
);

/**
 * @route GET /api/billing-event-histories/transaction/:transactionId/timeline
 * @desc Get timeline of events for a specific billing transaction
 * @access Private (Super Admin, Account Admin, Agency Staff)
 */
router.get('/transaction/:transactionId/timeline',
  [
    param('transactionId').isMongoId().withMessage('Invalid transaction ID')
  ],
  authorize(['super_admin', 'account_admin', 'agency_staff']),
  requirePortal(['super_admin', 'account', 'agency']),
  requirePermission('billing:read'),
  getTransactionTimeline
);

/**
 * @route GET /api/billing-event-histories/:id
 * @desc Get single billing event history by ID
 * @access Private (Super Admin, Account Admin, Agency Staff)
 */
router.get('/:id',
  [
    param('id').isMongoId().withMessage('Invalid event history ID')
  ],
  authorize(['super_admin', 'account_admin', 'agency_staff']),
  requirePortal(['super_admin', 'account', 'agency']),
  getBillingEventHistory
);



/**
 * @route PUT /api/billing-event-histories/:id/hide
 * @desc Hide billing event history entry (soft delete)
 * @access Private (Super Admin, Account Admin)
 */
router.put('/:id/hide',
  [
    param('id').isMongoId().withMessage('Invalid event history ID')
  ],
  authorize(['super_admin', 'account_admin']),
  requirePortal(['super_admin', 'account']),
  requirePermission('billing:delete'),
  hideBillingEventHistory
);

module.exports = router;