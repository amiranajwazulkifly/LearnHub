const {
  rateLimit,
} = require('express-rate-limit');

const env = require('../config/env');

const FIFTEEN_MINUTES = 15 * 60 * 1000;

// General API ceiling, per client IP. A single page load in the SPA is several
// requests (a dashboard is about six), and a campus NAT puts a whole class
// behind one address, so this is set well above what one busy user needs.
// It exists to stop scripted abuse, not to shape normal traffic.
const apiRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: env.apiRateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many requests. Please try again later.',
  },
});

const authRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: env.authRateLimitMax,
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
