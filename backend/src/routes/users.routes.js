const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const { authorize, requirePortal, enforceAccountAccess, enforceAgencyAccess, requirePermission, canManageUser } = require('../middleware/authorization.middleware');

// Import controller functions
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserPassword
} = require('../controllers/users.controller');

// Apply authentication to all routes
router.use(authenticate);

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Superadmin, Account Admin/Manager, Agency Admin/Manager)
router.get('/',
  authorize(['admin', 'manager']),
  getUsers
);

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Account users, Agency users with restrictions)
router.get('/:id',
  authorize(['admin', 'manager', 'user']),
  getUser
);

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Account Admin/Manager, Agency Admin)
router.post('/',
  authorize(['admin', 'manager']),
  requirePortal(['account', 'agency']),
  createUser
);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Account Admin/Manager, Agency Admin, or self)
router.put('/:id',
  authorize(['admin', 'manager', 'user']),
  updateUser
);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Account Admin, Agency Admin)
router.delete('/:id',
  authorize(['admin']),
  deleteUser
);

// @route   PATCH /api/users/:id/toggle-status
// @desc    Toggle user status (activate/deactivate)
// @access  Private (Account Admin, Agency Admin)
router.patch('/:id/toggle-status',
  authorize(['admin']),
  toggleUserStatus
);

// @route   PATCH /api/users/:id/change-password
// @desc    Change user password
// @access  Private (Account Admin, Agency Admin, or self)
router.patch('/:id/change-password',
  authorize(['admin', 'manager', 'user']),
  changeUserPassword
);

module.exports = router;