const jwt = require('jsonwebtoken');

const env = require('../config/env');
const ApiError = require('../utils/apiError');
const {
  findUserById,
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

    const user = await findUserById(payload.userId);

    if (!user) {
      return next(
        new ApiError(
          401,
          'User account no longer exists'
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
