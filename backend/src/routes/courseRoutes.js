const express = require("express");

const router = express.Router();

const courseController = require("../controllers/courseController");
const validateCourse = require("../validators/courseValidator");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Every course route requires a valid session; only admins can write.
router.use(authMiddleware, roleMiddleware("admin", "student", "instructor"));

router.get("/", courseController.getAllCourses);

router.get("/:id", courseController.getCourseById);

router.post("/", roleMiddleware("admin"), validateCourse, courseController.createCourse);

router.put("/:id", roleMiddleware("admin"), validateCourse, courseController.updateCourse);

router.delete("/:id", roleMiddleware("admin"), courseController.deleteCourse);

module.exports = router;
