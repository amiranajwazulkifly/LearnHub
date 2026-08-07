const express = require("express");

const enrollmentController = require("../controllers/enrollmentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Every enrollment endpoint requires a valid JWT
router.use(authMiddleware);

router.post("/", enrollmentController.createEnrollment);
router.get("/my-courses", enrollmentController.getMyCourses);
router.get("/timetable", enrollmentController.getMyTimetable);
router.delete("/:id", enrollmentController.cancelEnrollment);

module.exports = router;
