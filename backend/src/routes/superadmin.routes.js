const express = require('express');
const router = express.Router();
const { query } = require('express-validator');

// Import middleware
const { authenticate, requirePortal } = require('../middleware/auth.middleware'); // AI-NOTE: Fixed import from portal.middleware to auth.middleware where requirePortal is defined

// Import controller functions
const {
  getPlatformStats,
  getPlatformHealth,
  getSystemMetrics,
  getBillingOverview,
  getSubscriptionAnalytics,
  getRecentActivity
} = require('../controllers/superadmin.controller');

// Apply authentication to all routes
router.use(authenticate);

// Apply superadmin portal requirement to all routes
router.use(requirePortal('superadmin'));

// @route   GET /api/superadmin/platform-stats
// @desc    Get platform-wide statistics
// @access  Private (Superadmin only)
router.get('/platform-stats', getPlatformStats);

// @route   GET /api/superadmin/platform-health
// @desc    Get platform health status
// @access  Private (Superadmin only)
router.get('/platform-health', getPlatformHealth);

// @route   GET /api/superadmin/system-metrics
// @desc    Get system metrics
// @access  Private (Superadmin only)
router.get('/system-metrics', [
  query('timeframe').optional().isIn(['1h', '24h', '7d', '30d']).withMessage('Invalid timeframe')
], getSystemMetrics);

// @route   GET /api/superadmin/billing-overview
// @desc    Get billing overview
// @access  Private (Superadmin only)
router.get('/billing-overview', [
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid period')
], getBillingOverview);

// @route   GET /api/superadmin/subscription-analytics
// @desc    Get subscription analytics
// @access  Private (Superadmin only)
router.get('/subscription-analytics', getSubscriptionAnalytics);

// @route   GET /api/superadmin/recent-activity
// @desc    Get recent activity across platform
// @access  Private (Superadmin only)
router.get('/recent-activity', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168')
], getRecentActivity);

// AI-NOTE: Dedicated SuperAdmin routes file following separation of concerns principle
module.exports = router;