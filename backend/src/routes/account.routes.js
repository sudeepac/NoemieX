const express = require('express');
const {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
  getAccountStats
} = require('../controllers/account.controller');
const { 
  authenticate, 
  authorize, 
  requirePortal,
  enforceAccountAccess 
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by superadmin only
router.get('/', requirePortal('superadmin'), getAccounts);
router.post('/', requirePortal('superadmin'), createAccount);
router.delete('/:id', requirePortal('superadmin'), deleteAccount);
router.patch('/:id/toggle-status', requirePortal('superadmin'), toggleAccountStatus);

// Routes accessible by superadmin or account users
router.get('/:id', enforceAccountAccess, getAccount);
router.put('/:id', enforceAccountAccess, updateAccount);
router.get('/:id/stats', enforceAccountAccess, getAccountStats);

module.exports = router;