const { body, validationResult } = require("express-validator");

const validateCourse = [
  body("title").trim().notEmpty().withMessage("Course title is required"),

  body("description").optional().trim(),

  body("price").isFloat({ min: 0 }).withMessage("Price must be 0 or greater"),

  body("duration").isInt({ min: 1 }).withMessage("Duration must be at least 1"),

  body("level")
    .isIn(["Beginner", "Intermediate", "Advanced"])
    .withMessage("Invalid course level"),

  body("category_id").isUUID().withMessage("Valid category is required"),

  body("instructor_id").isUUID().withMessage("Valid instructor is required"),

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
