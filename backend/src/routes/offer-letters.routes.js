const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requirePortal, enforceAccountAccess, enforceAgencyAccess, requirePermission } = require('../middleware/authorization.middleware');

// Import controller functions
const {
  getOfferLetters,
  getOfferLetter,
  createOfferLetter,
  updateOfferLetter,
  deleteOfferLetter,
  updateOfferLetterStatus,
  addDocument,
  getOfferLetterStats
} = require('../controllers/offer-letters.controller');

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/offer-letters/stats
// @desc    Get offer letter statistics
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/stats',
  authorize(['admin', 'manager']),
  getOfferLetterStats
);

// @route   GET /api/offer-letters
// @desc    Get all offer letters
// @access  Private (Superadmin, Account users, Agency users)
router.get('/',
  authorize(['admin', 'manager', 'user']),
  getOfferLetters
);

// @route   GET /api/offer-letters/:id
// @desc    Get single offer letter
// @access  Private (Superadmin, Account users, Agency users with restrictions)
router.get('/:id',
  authorize(['admin', 'manager', 'user']),
  getOfferLetter
);

// @route   POST /api/offer-letters
// @desc    Create new offer letter
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.post('/',
  authorize(['admin', 'manager']),
  requirePortal(['account', 'agency']),
  createOfferLetter
);

// @route   PUT /api/offer-letters/:id
// @desc    Update offer letter
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.put('/:id',
  authorize(['admin', 'manager']),
  updateOfferLetter
);

// @route   DELETE /api/offer-letters/:id
// @desc    Delete offer letter
// @access  Private (Superadmin, Account Admin, Agency Admin)
router.delete('/:id',
  authorize(['admin']),
  deleteOfferLetter
);

// @route   PATCH /api/offer-letters/:id/status
// @desc    Update offer letter status
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.patch('/:id/status',
  authorize(['admin', 'manager']),
  updateOfferLetterStatus
);

// @route   POST /api/offer-letters/:id/documents
// @desc    Add document to offer letter
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.post('/:id/documents',
  authorize(['admin', 'manager']),
  addDocument
);

module.exports = router;