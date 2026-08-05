const env = require('../config/env');

function errorMiddleware(error, req, res, next) {
  console.error(error);

  const statusCode = error.statusCode || error.status || 500;

  const response = {
    success: false,
    message:
      statusCode === 500
        ? 'Internal server error'
        : error.message,
  };

  if (error.details) {
    response.errors = error.details;
  }

  if (env.nodeEnv === 'development' && statusCode === 500) {
    response.debugMessage = error.message;
  }

  res.status(statusCode).json(response);
}

module.exports = errorMiddleware;
