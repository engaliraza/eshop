const express = require('express');
const router = express.Router();
const { authenticateToken, authRateLimit } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Public routes with rate limiting
router.post('/register', authRateLimit, userValidation.register, register);
router.post('/login', authRateLimit, userValidation.login, login);
router.post('/forgot-password', authRateLimit, userValidation.forgotPassword, forgotPassword);
router.post('/reset-password', authRateLimit, userValidation.resetPassword, resetPassword);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, userValidation.updateProfile, updateProfile);
router.put('/change-password', authenticateToken, userValidation.changePassword, changePassword);

module.exports = router;