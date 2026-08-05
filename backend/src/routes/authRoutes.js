const express = require('express');

const {
  register,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
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

const asyncHandler = require(
  '../utils/asyncHandler'
);

const router = express.Router();

router.post(
  '/register',
  validationMiddleware(validateRegister),
  asyncHandler(register)
);

router.post(
  '/login',
  validationMiddleware(validateLogin),
  asyncHandler(login)
);

router.get(
  '/me',
  authMiddleware,
  roleMiddleware('admin', 'student'),
  asyncHandler(getCurrentUser)
);

router.patch(
  '/me',
  authMiddleware,
  roleMiddleware('admin', 'student'),
  validationMiddleware(validateUpdateProfile),
  asyncHandler(updateProfile)
);

router.patch(
  '/password',
  authMiddleware,
  roleMiddleware('admin', 'student'),
  validationMiddleware(validateChangePassword),
  asyncHandler(changePassword)
);

router.post(
  '/logout',
  authMiddleware,
  roleMiddleware('admin', 'student'),
  asyncHandler(logout)
);

module.exports = router;
