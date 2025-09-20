const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requirePortal, enforceAccountAccess, enforceAgencyAccess, requirePermission } = require('../middleware/authorization.middleware');

// Import controller functions
const {
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
  generateBillingTransactions,
  generateRecurringItems,
  getOverdueItems,
  getUpcomingItems,
  getPaymentScheduleItemStats
} = require('../controllers/payment-schedule-items.controller');

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/payment-schedule-items/stats
// @desc    Get payment schedule item statistics
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/stats',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'read'),
  getPaymentScheduleItemStats
);

// @route   GET /api/payment-schedule-items/overdue
// @desc    Get overdue payment schedule items
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/overdue',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'read'),
  getOverdueItems
);

// @route   GET /api/payment-schedule-items/upcoming
// @desc    Get upcoming payment schedule items
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/upcoming',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'read'),
  getUpcomingItems
);

// @route   GET /api/payment-schedule-items
// @desc    Get all payment schedule items with filtering and pagination
// @access  Private (Superadmin, Account users, Agency users)
router.get('/',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager', 'user']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'read'),
  getPaymentScheduleItems
);

// @route   POST /api/payment-schedule-items
// @desc    Create new payment schedule item
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.post('/',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'create'),
  createPaymentScheduleItem
);

// @route   GET /api/payment-schedule-items/:id
// @desc    Get single payment schedule item
// @access  Private (Superadmin, Account users, Agency users with restrictions)
router.get('/:id',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager', 'user']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'read'),
  getPaymentScheduleItem
);

// @route   PUT /api/payment-schedule-items/:id
// @desc    Update payment schedule item
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.put('/:id',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'update'),
  updatePaymentScheduleItem
);

// @route   PATCH /api/payment-schedule-items/:id/approve
// @desc    Approve payment schedule item
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/approve',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'approve'),
  approvePaymentScheduleItem
);

// @route   PATCH /api/payment-schedule-items/:id/retire
// @desc    Retire payment schedule item
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/retire',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'update'),
  retirePaymentScheduleItem
);

// @route   PATCH /api/payment-schedule-items/:id/replace
// @desc    Replace payment schedule item
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/replace',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'update'),
  replacePaymentScheduleItem
);

// @route   PATCH /api/payment-schedule-items/:id/complete
// @desc    Complete payment schedule item
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/complete',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'update'),
  completePaymentScheduleItem
);

// @route   PATCH /api/payment-schedule-items/:id/cancel
// @desc    Cancel payment schedule item
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/cancel',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'update'),
  cancelPaymentScheduleItem
);

// @route   POST /api/payment-schedule-items/generate-transactions
// @desc    Generate billing transactions from payment schedule items
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.post('/generate-transactions',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'create'),
  generateBillingTransactions
);

// @route   POST /api/payment-schedule-items/:id/generate-recurring
// @desc    Generate recurring payment schedule items
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.post('/:id/generate-recurring',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'create'),
  generateRecurringItems
);

// @route   DELETE /api/payment-schedule-items/:id
// @desc    Delete payment schedule item
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.delete('/:id',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('payment_schedule_items', 'delete'),
  deletePaymentScheduleItem
);

module.exports = router;