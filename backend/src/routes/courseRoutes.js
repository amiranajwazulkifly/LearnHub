const express = require("express");

const router = express.Router();

const courseController = require("../controllers/courseController");
const validateCourse = require("../validators/courseValidator");

router.get("/", courseController.getAllCourses);
router.post("/", validateCourse, courseController.createCourse);
router.put("/:id", validateCourse, courseController.updateCourse);
router.delete("/:id", courseController.deleteCourse);

module.exports = router;
