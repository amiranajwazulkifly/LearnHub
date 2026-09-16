const express = require("express");

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

// A student's own enrollments. Admins manage enrollment through
// /api/admin/enrollments instead. Before the role guard, an admin or
// instructor could reach these and have their request fail inside the
// database trigger that only allows students to enroll.
router.use(authMiddleware, roleMiddleware("student"));

router.post("/", asyncHandler(enrollmentController.createEnrollment));
router.get("/my-courses", asyncHandler(enrollmentController.getMyCourses));
router.get("/timetable", asyncHandler(enrollmentController.getMyTimetable));
router.delete("/:id", asyncHandler(enrollmentController.cancelEnrollment));

module.exports = router;
