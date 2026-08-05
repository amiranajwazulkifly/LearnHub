const express = require('express');

const {
  register,
  login,
  logout,
} = require('../controllers/authController');

const {
  validateRegister,
  validateLogin,
} = require('../validators/authValidator');

const validationMiddleware = require(
  '../middleware/validationMiddleware'
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

router.post(
  '/logout',
  asyncHandler(logout)
);

module.exports = router;
