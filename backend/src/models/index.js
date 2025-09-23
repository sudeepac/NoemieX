// Central export for all models
// AI-NOTE: Convention requires index.js files for centralized exports

const Account = require('./account.model');
const Agency = require('./agency.model');
const BillingEventHistory = require('./billing-event-history.model');
const BillingTransaction = require('./billing-transaction.model');
const OfferLetter = require('./offer-letter.model');
const PaymentScheduleItem = require('./payment-schedule-item.model');
const User = require('./user.model');

module.exports = {
  Account,
  Agency,
  BillingEventHistory,
  BillingTransaction,
  OfferLetter,
  PaymentScheduleItem,
  User
};