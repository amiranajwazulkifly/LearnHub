const express = require('express');

const {
  getStats,
  getMyCourses,
  getCourseStudents,
} = require('../controllers/instructorPortalController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(authMiddleware, roleMiddleware('instructor'));

router.get('/me/stats', asyncHandler(getStats));
router.get('/me/courses', asyncHandler(getMyCourses));
router.get('/me/courses/:courseId/students', asyncHandler(getCourseStudents));

module.exports = router;
