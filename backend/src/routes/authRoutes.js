const express = require('express');

const {
  register,
  login,
  getCurrentUser,
  logout,
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
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

const asyncHandler = require('../utils/asyncHandler');

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

router.post(
  '/logout',
  authMiddleware,
  roleMiddleware('admin', 'student'),
  asyncHandler(logout)
);

module.exports = router;
