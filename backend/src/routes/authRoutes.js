const express = require('express');

const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} = require('../validators/authValidator');

const validationMiddleware = require(
  '../middleware/validationMiddleware'
);

const authMiddleware = require(
  '../middleware/authMiddleware'
);

const roleMiddleware = require(
  '../middleware/roleMiddleware'
);

const {
  authRateLimiter,
} = require('../middleware/rateLimitMiddleware');

const asyncHandler = require(
  '../utils/asyncHandler'
);

const router = express.Router();

// Public registration
router.post(
  '/register',
  authRateLimiter,
  validationMiddleware(validateRegister),
  asyncHandler(register)
);

// Public login
router.post(
  '/login',
  authRateLimiter,
  validationMiddleware(validateLogin),
  asyncHandler(login)
);

// Public — request a password reset link
router.post(
  '/forgot-password',
  authRateLimiter,
  validationMiddleware(validateForgotPassword),
  asyncHandler(forgotPassword)
);

// Public — consume a reset token to set a new password
router.post(
  '/reset-password',
  authRateLimiter,
  validationMiddleware(validateResetPassword),
  asyncHandler(resetPassword)
);

// Get authenticated user
router.get(
  '/me',
  authMiddleware,
  roleMiddleware('admin', 'student', 'instructor'),
  asyncHandler(getCurrentUser)
);

// Update authenticated user's profile
router.patch(
  '/me',
  authMiddleware,
  roleMiddleware('admin', 'student', 'instructor'),
  validationMiddleware(validateUpdateProfile),
  asyncHandler(updateProfile)
);

// Change password
router.patch(
  '/password',
  authMiddleware,
  roleMiddleware('admin', 'student', 'instructor'),
  validationMiddleware(validateChangePassword),
  asyncHandler(changePassword)
);

// Logout
router.post(
  '/logout',
  authMiddleware,
  roleMiddleware('admin', 'student', 'instructor'),
  asyncHandler(logout)
);

module.exports = router;