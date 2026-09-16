class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message   Safe to show a user.
   * @param {Array|null} details  Field-level validation errors, sent as `errors`.
   * @param {object|null} extra   Additional top-level response fields, for the
   *   few endpoints whose error contract carries more than a message (e.g. the
   *   clashing session on a timetable conflict).
   */
  constructor(statusCode, message, details = null, extra = null) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.extra = extra;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
