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
  asyncHandler(getCurrentUser)
);

router.post(
  '/logout',
  authMiddleware,
  asyncHandler(logout)
);

module.exports = router;
