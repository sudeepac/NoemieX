// Central export for all controllers
// AI-NOTE: Convention requires index.js files for centralized exports

const accountController = require('./account.controller');
const agenciesController = require('./agencies.controller');
const authController = require('./auth.controller');
const billingEventHistoriesController = require('./billing-event-histories.controller');
const billingTransactionsController = require('./billing-transactions.controller');
const offerLettersController = require('./offer-letters.controller');
const paymentScheduleItemsController = require('./payment-schedule-items.controller');
const usersController = require('./users.controller');

module.exports = {
  accountController,
  agenciesController,
  authController,
  billingEventHistoriesController,
  billingTransactionsController,
  offerLettersController,
  paymentScheduleItemsController,
  usersController
};