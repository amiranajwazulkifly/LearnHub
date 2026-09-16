const env = require('../config/env');

function errorMiddleware(error, req, res, next) {
  console.error(error);

  // Postgres 22P02 (invalid_text_representation) is almost always a malformed
  // id in the URL, e.g. /api/notifications/not-a-uuid/read. That's a bad
  // request from the client, not a server fault, so report it as a 400
  // instead of letting it surface as an opaque 500.
  if (error.code === '22P02') {
    error.statusCode = 400;
    error.message = 'One of the submitted values has an invalid format';
  }

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

  // Never for a 500, whose internals shouldn't reach the client.
  if (error.extra && statusCode !== 500) {
    Object.assign(response, error.extra);
  }

  if (env.nodeEnv === 'development' && statusCode === 500) {
    response.debugMessage = error.message;
  }

  res.status(statusCode).json(response);
}

module.exports = errorMiddleware;
