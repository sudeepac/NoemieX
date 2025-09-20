const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requirePortal, enforceAccountAccess, enforceAgencyAccess, requirePermission } = require('../middleware/authorization.middleware');

// Import controller functions
const {
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
} = require('../controllers/billing-transactions.controller');

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/billing-transactions/stats
// @desc    Get billing transaction statistics
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/stats',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'read'),
  getBillingTransactionStats
);

// @route   GET /api/billing-transactions/overdue
// @desc    Get overdue billing transactions
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/overdue',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'read'),
  getOverdueTransactions
);

// @route   GET /api/billing-transactions/revenue-summary
// @desc    Get revenue summary
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/revenue-summary',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'read'),
  getRevenueSummary
);

// @route   GET /api/billing-transactions
// @desc    Get all billing transactions with filtering and pagination
// @access  Private (Superadmin, Account users, Agency users)
router.get('/',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager', 'user']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'read'),
  getBillingTransactions
);

// @route   POST /api/billing-transactions
// @desc    Create new billing transaction
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.post('/',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'create'),
  createBillingTransaction
);

// @route   GET /api/billing-transactions/:id
// @desc    Get single billing transaction
// @access  Private (Superadmin, Account users, Agency users with restrictions)
router.get('/:id',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager', 'user']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'read'),
  getBillingTransaction
);

// @route   PUT /api/billing-transactions/:id
// @desc    Update billing transaction
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.put('/:id',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'update'),
  updateBillingTransaction
);

// @route   PATCH /api/billing-transactions/:id/status
// @desc    Update billing transaction status
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.patch('/:id/status',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'update'),
  updateBillingTransactionStatus
);

// @route   POST /api/billing-transactions/:id/approve
// @desc    Add approval to billing transaction
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.post('/:id/approve',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'approve'),
  approveBillingTransaction
);

// @route   GET /api/billing-transactions/disputed
// @desc    Get disputed billing transactions
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/disputed',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin', 'manager']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'read'),
  getDisputedTransactions
);

// @route   PATCH /api/billing-transactions/:id/claim
// @desc    Claim billing transaction
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/claim',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'update'),
  claimBillingTransaction
);

// @route   PATCH /api/billing-transactions/:id/dispute
// @desc    Dispute billing transaction
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/dispute',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'update'),
  disputeBillingTransaction
);

// @route   PATCH /api/billing-transactions/:id/resolve-dispute
// @desc    Resolve dispute for billing transaction
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/resolve-dispute',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'update'),
  resolveDisputeBillingTransaction
);

// @route   PATCH /api/billing-transactions/:id/reconcile
// @desc    Reconcile billing transaction
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.patch('/:id/reconcile',
  requirePortal(['superadmin', 'account', 'agency']),
  authorize(['admin']),
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission('billing_transactions', 'reconcile'),
  reconcileBillingTransaction
);

module.exports = router;