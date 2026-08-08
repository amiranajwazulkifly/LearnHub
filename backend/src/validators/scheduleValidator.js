const { body, validationResult } = require("express-validator");

const uuidPattern =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const validateSchedule = [
  body("course_id")
    .matches(uuidPattern)
    .withMessage("A valid course is required"),

  body("day_of_week")
    .isInt({ min: 1, max: 7 })
    .withMessage("Day of week must be between 1 and 7"),

  body("start_time").notEmpty().withMessage("Start time is required"),

  body("end_time").notEmpty().withMessage("End time is required"),

  body("location").trim().notEmpty().withMessage("Location is required"),

  body("start_date").isISO8601().withMessage("Start date must be valid"),

  body("end_date").isISO8601().withMessage("End date must be valid"),

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

module.exports = validateSchedule;
