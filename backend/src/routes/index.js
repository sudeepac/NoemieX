// Central export for all routes
// AI-NOTE: Convention requires index.js files for centralized exports

const accountRoutes = require('./account.routes');
const agenciesRoutes = require('./agencies.routes');
const authRoutes = require('./auth.routes');
const billingEventHistoriesRoutes = require('./billing-event-histories.routes');
const billingTransactionsRoutes = require('./billing-transactions.routes');
const offerLettersRoutes = require('./offer-letters.routes');
const paymentScheduleItemsRoutes = require('./payment-schedule-items.routes');
const superadminRoutes = require('./superadmin.routes');
const usersRoutes = require('./users.routes');

module.exports = {
  accountRoutes,
  agenciesRoutes,
  authRoutes,
  billingEventHistoriesRoutes,
  billingTransactionsRoutes,
  offerLettersRoutes,
  paymentScheduleItemsRoutes,
  superadminRoutes,
  usersRoutes
};