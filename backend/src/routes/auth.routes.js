const express = require('express');
const {
  register,
  login,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  logout
} = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/me', getMe);
router.put('/me', updateMe);
router.put('/change-password', changePassword);
router.post('/logout', logout);

module.exports = router;