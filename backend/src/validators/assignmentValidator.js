const { body, validationResult } = require("express-validator");

const uuidPattern =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

function checkResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

// multipart/form-data always arrives as strings, so numeric/date fields
// are validated as strings here rather than with isInt()/isISO8601() on a
// native type.
const validateCreateAssignment = [
  body("course_id").matches(uuidPattern).withMessage("A valid course is required"),
  body("title").trim().isLength({ min: 2, max: 180 }).withMessage("Title must be between 2 and 180 characters"),
  body("description").optional({ nullable: true, checkFalsy: true }).trim(),
  body("points")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Points must be a positive whole number"),
  body("due_at")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Due date must be a valid date"),
  checkResult,
];

const validateUpdateAssignment = [
  body("title").trim().isLength({ min: 2, max: 180 }).withMessage("Title must be between 2 and 180 characters"),
  body("description").optional({ nullable: true, checkFalsy: true }).trim(),
  body("points")
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("Points must be a positive whole number"),
  body("due_at")
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage("Due date must be a valid date"),
  checkResult,
];

const validateSubmission = [
  body("submission_text").optional({ nullable: true, checkFalsy: true }).trim(),
  body("submission_link")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isURL()
    .withMessage("Link must be a valid URL"),
  checkResult,
];

const validateGrade = [
  body("grade")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Grade must be a non-negative number"),
  body("feedback").optional({ nullable: true, checkFalsy: true }).trim(),
  checkResult,
];

module.exports = {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateSubmission,
  validateGrade,
};
