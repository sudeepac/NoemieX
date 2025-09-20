const express = require('express');
const {
  getAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
  toggleAgencyStatus,
  getAgencyStats
} = require('../controllers/agencies.controller');
const { 
  authenticate, 
  authorize, 
  requirePortal,
  enforceAccountAccess,
  enforceAgencyAccess
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Routes accessible by superadmin only
router.delete('/:id', requirePortal('superadmin', 'account'), authorize('admin'), deleteAgency);
router.patch('/:id/toggle-status', requirePortal('superadmin', 'account'), authorize('admin'), toggleAgencyStatus);

// Routes accessible by superadmin and account users
router.get('/', enforceAccountAccess, getAgencies);
router.post('/', requirePortal('superadmin', 'account'), authorize('admin', 'manager'), createAgency);

// Routes accessible by superadmin, account users, and agency users (with restrictions)
router.get('/:id', enforceAgencyAccess, getAgency);
router.put('/:id', enforceAgencyAccess, updateAgency);
router.get('/:id/stats', enforceAgencyAccess, getAgencyStats);

module.exports = router;