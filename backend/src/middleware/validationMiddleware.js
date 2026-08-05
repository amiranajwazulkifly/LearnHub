const ApiError = require('../utils/apiError');

function validationMiddleware(validator) {
  return function validateRequest(req, res, next) {
    const validationErrors = validator(req);

    if (validationErrors.length > 0) {
      return next(
        new ApiError(
          400,
          'Validation failed',
          validationErrors
        )
      );
    }

    next();
  };
}

module.exports = validationMiddleware;
