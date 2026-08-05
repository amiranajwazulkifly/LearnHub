const ApiError = require('../utils/apiError');

function roleMiddleware(...allowedRoles) {
  if (allowedRoles.length === 0) {
    throw new Error(
      'roleMiddleware requires at least one allowed role'
    );
  }

  return function authorizeRole(req, res, next) {
    if (!req.user) {
      return next(
        new ApiError(
          401,
          'Authentication required'
        )
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          'You do not have permission to access this resource'
        )
      );
    }

    next();
  };
}

module.exports = roleMiddleware;
