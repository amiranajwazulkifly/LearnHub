const express = require("express");

const router = express.Router();

const courseController = require("../controllers/courseController");
const validateCourse = require("../validators/courseValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// Every course route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", asyncHandler(courseController.getAllCourses));

router.get("/:id", asyncHandler(courseController.getCourseById));

router.post(
  "/",
  roleMiddleware("admin"),
  validateCourse,
  asyncHandler(courseController.createCourse),
);

router.put(
  "/:id",
  roleMiddleware("admin"),
  validateCourse,
  asyncHandler(courseController.updateCourse),
);

router.delete("/:id", roleMiddleware("admin"), asyncHandler(courseController.deleteCourse));

module.exports = router;
