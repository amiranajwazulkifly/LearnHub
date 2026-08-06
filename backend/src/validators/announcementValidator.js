// backend/src/validators/announcementValidator.js
//
// Lightweight manual validation (no extra dependency). If Nabil's shared
// validationMiddleware.js wraps a library like express-validator or Joi,
// swap this for that pattern to stay consistent — check with him first.

const ApiError = require('../utils/apiError');

function validateAnnouncementPayload(req, res, next) {
  const { title, content } = req.body;
  const errors = [];

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    errors.push('title is required');
  } else if (title.length > 200) {
    errors.push('title must be 200 characters or fewer');
  }

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    errors.push('content is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'VALIDATION_ERROR', errors.join('; ')));
  }
  next();
}

module.exports = { validateAnnouncementPayload };
