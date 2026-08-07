const { body, validationResult } = require("express-validator");

const validateInstructor = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Instructor name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Instructor name must be between 2 and 150 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 30 })
    .withMessage("Phone number is too long"),

  body("expertise")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 150 })
    .withMessage("Expertise must not exceed 150 characters"),

  body("biography")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Biography must not exceed 1000 characters"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be true or false"),

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

module.exports = validateInstructor;
