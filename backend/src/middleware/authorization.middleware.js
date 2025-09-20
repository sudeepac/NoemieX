// Re-export authorization functions from auth.middleware for better organization
const {
  authorize,
  requirePortal,
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission,
  canManageUser
} = require('./auth.middleware');

module.exports = {
  authorize,
  requirePortal,
  enforceAccountAccess,
  enforceAgencyAccess,
  requirePermission,
  canManageUser
};