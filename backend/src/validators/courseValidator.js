const { body, validationResult } = require("express-validator");

const uuidPattern =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const validateCourse = [
  body("code").trim().notEmpty().withMessage("Course code is required"),

  body("title").trim().notEmpty().withMessage("Course title is required"),

  body("description").optional({ nullable: true }).trim(),

  body("category_id")
    .optional({ nullable: true, checkFalsy: true })
    .matches(uuidPattern)
    .withMessage("Category must be a valid UUID"),

  body("instructor_id")
    .optional({ nullable: true, checkFalsy: true })
    .matches(uuidPattern)
    .withMessage("Instructor must be a valid UUID"),

  body("capacity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be at least 1"),

  body("status").optional().isString().withMessage("Status must be valid"),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    next();
  },
];

module.exports = validateCourse;
