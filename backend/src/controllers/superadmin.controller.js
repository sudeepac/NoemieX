const asyncHandler = require('../utils/async-handler.util'); // AI-NOTE: Fixed import from express-async-handler to project's async-handler util
const mongoose = require('mongoose');
const { successResponse, errorResponse, forbiddenResponse } = require('../utils/response.util');

// Import models
const Account = require('../models/account.model');
const User = require('../models/user.model');
const Agency = require('../models/agency.model');
const BillingTransaction = require('../models/billing-transaction.model');
const BillingEventHistory = require('../models/billing-event-history.model');

// @desc    Get platform-wide statistics (SuperAdmin only)
// @route   GET /api/superadmin/platform-stats
// @access  Private (Superadmin only)
// AI-NOTE: SuperAdmin platform statistics endpoint - consolidated from account controller
const getPlatformStats = asyncHandler(async (req, res) => {
  try {
    // Get counts for all major entities
    const [accountCount, userCount, agencyCount] = await Promise.all([
      Account.countDocuments(),
      User.countDocuments(),
      Agency.countDocuments()
    ]);

    // Get active vs inactive counts
    const [activeAccounts, activeUsers, activeAgencies] = await Promise.all([
      Account.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true }),
      Agency.countDocuments({ isActive: true })
    ]);

    // Get recent growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [newAccounts, newUsers, newAgencies] = await Promise.all([
      Account.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Agency.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ]);

    const platformStats = {
      overview: {
        totalAccounts: accountCount,
        totalUsers: userCount,
        totalAgencies: agencyCount
      },
      active: {
        activeAccounts,
        activeUsers,
        activeAgencies
      },
      growth: {
        newAccounts,
        newUsers,
        newAgencies
      }
    };

    successResponse(res, { platformStats }, 'Platform statistics retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching platform statistics', 500);
  }
});

// @desc    Get platform health status (SuperAdmin only)
// @route   GET /api/superadmin/platform-health
// @access  Private (Superadmin only)
// AI-NOTE: Platform health monitoring endpoint - consolidated from account controller
const getPlatformHealth = asyncHandler(async (req, res) => {
  try {
    // Check database connectivity
    const dbStatus = 'connected'; // Since we're able to query, DB is connected
    
    // Get system metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    // Check for any critical issues
    const criticalIssues = [];
    
    // Check for inactive accounts with recent activity
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const inactiveAccountsWithActivity = await Account.countDocuments({
      isActive: false,
      updatedAt: { $gte: oneHourAgo }
    });
    
    if (inactiveAccountsWithActivity > 0) {
      criticalIssues.push(`Inactive accounts with recent activity: ${inactiveAccountsWithActivity}`);
    }
    
    const healthStatus = criticalIssues.length === 0 ? 'healthy' : 'warning';
    
    const health = {
      status: healthStatus,
      database: {
        status: dbStatus,
        connected: true
      },
      system: {
        uptime: Math.floor(uptime),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
        }
      },
      issues: criticalIssues,
      lastChecked: new Date().toISOString()
    };

    successResponse(res, { health }, 'Platform health retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error checking platform health', 500);
  }
});

// @desc    Get system metrics (SuperAdmin only)
// @route   GET /api/superadmin/system-metrics
// @access  Private (Superadmin only)
// AI-NOTE: System metrics endpoint for SuperAdmin monitoring - consolidated from account controller
const getSystemMetrics = asyncHandler(async (req, res) => {
  try {
    const { timeframe = '24h' } = req.query;
    
    // Calculate time range based on timeframe
    let timeRange;
    switch (timeframe) {
      case '1h':
        timeRange = new Date(Date.now() - 60 * 60 * 1000);
        break;
      case '24h':
        timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        timeRange = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        timeRange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        timeRange = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    // Get metrics for the specified timeframe
    const [accountsCreated, usersCreated, agenciesCreated] = await Promise.all([
      Account.countDocuments({ createdAt: { $gte: timeRange } }),
      User.countDocuments({ createdAt: { $gte: timeRange } }),
      Agency.countDocuments({ createdAt: { $gte: timeRange } })
    ]);
    
    const metrics = {
      timeframe,
      period: {
        start: timeRange.toISOString(),
        end: new Date().toISOString()
      },
      activity: {
        accountsCreated,
        usersCreated,
        agenciesCreated
      },
      system: {
        uptime: Math.floor(process.uptime()),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    };

    successResponse(res, { metrics }, 'System metrics retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching system metrics', 500);
  }
});

// @desc    Get billing overview for SuperAdmin
// @route   GET /api/superadmin/billing-overview
// @access  Private (Superadmin only)
// AI-NOTE: SuperAdmin billing overview endpoint - consolidated from billing-transactions controller
const getBillingOverview = asyncHandler(async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    // Calculate date ranges based on period
    const now = new Date();
    let startDate, previousStartDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
    }
    
    // Get current period stats
    const [currentRevenue, currentTransactions, overdueAmount, pendingAmount] = await Promise.all([
      BillingTransaction.aggregate([
        { $match: { status: 'paid', paidDate: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: '$signedAmount.value' } } }
      ]),
      BillingTransaction.countDocuments({ createdAt: { $gte: startDate } }),
      BillingTransaction.aggregate([
        { 
          $match: { 
            dueDate: { $lt: now }, 
            status: { $nin: ['paid', 'cancelled', 'refunded'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$signedAmount.value' } } }
      ]),
      BillingTransaction.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$signedAmount.value' } } }
      ])
    ]);
    
    // Get previous period stats for comparison
    const [previousRevenue, previousTransactions] = await Promise.all([
      BillingTransaction.aggregate([
        { 
          $match: { 
            status: 'paid', 
            paidDate: { $gte: previousStartDate, $lt: startDate }
          }
        },
        { $group: { _id: null, total: { $sum: '$signedAmount.value' } } }
      ]),
      BillingTransaction.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
    ]);
    
    // Calculate growth percentages
    const currentRevenueTotal = currentRevenue[0]?.total || 0;
    const previousRevenueTotal = previousRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenueTotal > 0 
      ? ((currentRevenueTotal - previousRevenueTotal) / previousRevenueTotal) * 100 
      : 0;
    
    const transactionGrowth = previousTransactions > 0 
      ? ((currentTransactions - previousTransactions) / previousTransactions) * 100 
      : 0;
    
    const billingOverview = {
      period,
      currentPeriod: {
        revenue: currentRevenueTotal,
        transactions: currentTransactions,
        startDate: startDate.toISOString(),
        endDate: now.toISOString()
      },
      previousPeriod: {
        revenue: previousRevenueTotal,
        transactions: previousTransactions
      },
      growth: {
        revenue: Math.round(revenueGrowth * 100) / 100,
        transactions: Math.round(transactionGrowth * 100) / 100
      },
      outstanding: {
        overdue: overdueAmount[0]?.total || 0,
        pending: pendingAmount[0]?.total || 0
      }
    };
    
    successResponse(res, { billingOverview }, 'Billing overview retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching billing overview', 500);
  }
});

// @desc    Get subscription analytics for SuperAdmin
// @route   GET /api/superadmin/subscription-analytics
// @access  Private (Superadmin only)
// AI-NOTE: SuperAdmin subscription analytics endpoint - consolidated from billing-transactions controller
const getSubscriptionAnalytics = asyncHandler(async (req, res) => {
  try {
    // Get subscription-related transaction analytics
    const [subscriptionRevenue, subscriptionTrends, paymentMethods, churnAnalysis] = await Promise.all([
      // Total subscription revenue
      BillingTransaction.aggregate([
        { 
          $match: { 
            transactionType: 'subscription',
            status: 'paid'
          }
        },
        { 
          $group: { 
            _id: null, 
            total: { $sum: '$signedAmount.value' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Monthly subscription trends (last 12 months)
      BillingTransaction.aggregate([
        { 
          $match: { 
            transactionType: 'subscription',
            status: 'paid',
            paidDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$paidDate' },
              month: { $month: '$paidDate' }
            },
            revenue: { $sum: '$signedAmount.value' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Payment method distribution
      BillingTransaction.aggregate([
        { 
          $match: { 
            transactionType: 'subscription',
            status: 'paid'
          }
        },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            revenue: { $sum: '$signedAmount.value' }
          }
        }
      ]),
      
      // Failed subscription payments (churn indicators)
      BillingTransaction.aggregate([
        { 
          $match: { 
            transactionType: 'subscription',
            status: 'failed',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: null,
            failedCount: { $sum: 1 },
            failedAmount: { $sum: '$signedAmount.value' }
          }
        }
      ])
    ]);
    
    const subscriptionAnalytics = {
      revenue: {
        total: subscriptionRevenue[0]?.total || 0,
        transactionCount: subscriptionRevenue[0]?.count || 0
      },
      trends: subscriptionTrends,
      paymentMethods: paymentMethods,
      churn: {
        failedPayments: churnAnalysis[0]?.failedCount || 0,
        failedAmount: churnAnalysis[0]?.failedAmount || 0
      }
    };
    
    successResponse(res, { subscriptionAnalytics }, 'Subscription analytics retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching subscription analytics', 500);
  }
});

// @desc    Get recent activity across platform (SuperAdmin only)
// @route   GET /api/superadmin/recent-activity
// @access  Private (Superadmin only)
// AI-NOTE: SuperAdmin recent activity endpoint - consolidated from billing-event-histories controller
const getRecentActivity = asyncHandler(async (req, res) => {
  try {
    const { limit = 50, hours = 24 } = req.query;
    
    // Calculate time range
    const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Get recent billing events
    const recentBillingEvents = await BillingEventHistory.find({
      eventDate: { $gte: timeAgo },
      isVisible: true
    })
    .sort({ eventDate: -1 })
    .limit(parseInt(limit) / 2)
    .populate('triggeredBy', 'firstName lastName email portalType')
    .populate('billingTransactionId', 'signedAmount status references')
    .lean();
    
    // Get recent user registrations
    const recentUsers = await User.find({
      createdAt: { $gte: timeAgo }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('accountId', 'name')
    .populate('agencyId', 'name')
    .lean();
    
    // Get recent account creations
    const recentAccounts = await Account.find({
      createdAt: { $gte: timeAgo }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
    
    // Format activities into a unified structure
    const activities = [];
    
    // Add billing events
    recentBillingEvents.forEach(event => {
      activities.push({
        id: event._id,
        type: 'billing_event',
        action: event.eventType,
        description: event.description,
        user: event.triggeredBy,
        timestamp: event.eventDate,
        metadata: {
          transactionId: event.billingTransactionId?._id,
          amount: event.billingTransactionId?.signedAmount?.value,
          status: event.billingTransactionId?.status
        }
      });
    });
    
    // Add user registrations
    recentUsers.forEach(user => {
      activities.push({
        id: user._id,
        type: 'user_registration',
        action: 'user_created',
        description: `New ${user.portalType} user registered: ${user.firstName} ${user.lastName}`,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          portalType: user.portalType
        },
        timestamp: user.createdAt,
        metadata: {
          accountName: user.accountId?.name,
          agencyName: user.agencyId?.name,
          role: user.role
        }
      });
    });
    
    // Add account creations
    recentAccounts.forEach(account => {
      activities.push({
        id: account._id,
        type: 'account_creation',
        action: 'account_created',
        description: `New account created: ${account.name}`,
        user: null, // System-generated
        timestamp: account.createdAt,
        metadata: {
          accountName: account.name,
          subscriptionTier: account.subscription?.tier,
          isActive: account.isActive
        }
      });
    });
    
    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit to requested number
    const limitedActivities = activities.slice(0, parseInt(limit));
    
    const recentActivity = {
      activities: limitedActivities,
      summary: {
        totalActivities: activities.length,
        timeRange: {
          hours: parseInt(hours),
          from: timeAgo.toISOString(),
          to: new Date().toISOString()
        },
        breakdown: {
          billingEvents: recentBillingEvents.length,
          userRegistrations: recentUsers.length,
          accountCreations: recentAccounts.length
        }
      }
    };
    
    successResponse(res, { recentActivity }, 'Recent activity retrieved successfully');
  } catch (error) {
    errorResponse(res, 'Error fetching recent activity', 500);
  }
});

module.exports = {
  getPlatformStats,
  getPlatformHealth,
  getSystemMetrics,
  getBillingOverview,
  getSubscriptionAnalytics,
  getRecentActivity
};