// Central export for all middleware
// AI-NOTE: Convention requires index.js files for centralized exports

const authMiddleware = require('./auth.middleware');
const authorizationMiddleware = require('./authorization.middleware');
const errorMiddleware = require('./error.middleware');
const validationMiddleware = require('./validation.middleware');

module.exports = {
  authMiddleware,
  authorizationMiddleware,
  errorMiddleware,
  validationMiddleware
};