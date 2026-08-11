const jwt = require('jsonwebtoken');

const env = require('../config/env');
const ApiError = require('../utils/apiError');
const {
  getAuthContext,
} = require('../services/authService');

async function authMiddleware(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (
      !authorizationHeader ||
      !authorizationHeader.startsWith('Bearer ')
    ) {
      return next(
        new ApiError(
          401,
          'Authentication required'
        )
      );
    }

    const token = authorizationHeader
      .slice('Bearer '.length)
      .trim();

    if (!token) {
      return next(
        new ApiError(
          401,
          'Authentication required'
        )
      );
    }

    let payload;

    try {
      payload = jwt.verify(
        token,
        env.jwtSecret,
        {
          algorithms: ['HS256'],
        }
      );
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(
          new ApiError(
            401,
            'Authentication token has expired'
          )
        );
      }

      return next(
        new ApiError(
          401,
          'Invalid authentication token'
        )
      );
    }

    if (
      typeof payload !== 'object' ||
      !payload.userId
    ) {
      return next(
        new ApiError(
          401,
          'Invalid authentication token'
        )
      );
    }

    const context = await getAuthContext(payload.userId);

    if (!context) {
      return next(
        new ApiError(
          401,
          'User account no longer exists'
        )
      );
    }

    const { user, tokenValidAfter } = context;

    // Logout, password change, or an admin-triggered password reset bumps
    // token_valid_after — any token issued before that moment is rejected
    // here even though it hasn't naturally expired yet. Compared using the
    // millisecond-precision issuedAtMs claim (see generateToken) rather
    // than the standard second-precision `iat`, which is too coarse to
    // tell apart a login immediately followed by a logout.
    if (
      typeof payload.issuedAtMs === 'number' &&
      payload.issuedAtMs < new Date(tokenValidAfter).getTime()
    ) {
      return next(
        new ApiError(
          401,
          'Your session has expired, please log in again'
        )
      );
    }

    if (user.status !== 'active') {
      return next(
        new ApiError(
          403,
          'Your account is not currently active'
        )
      );
    }

    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = authMiddleware;
