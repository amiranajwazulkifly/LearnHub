const {
  rateLimit,
} = require('express-rate-limit');

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests. Please try again later.',
  },
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,

  // Successful login/registration requests are not counted.
  skipSuccessfulRequests: true,

  message: {
    success: false,
    message:
      'Too many authentication attempts. Please try again later.',
  },
});

module.exports = {
  apiRateLimiter,
  authRateLimiter,
};
