//Dzul
const express = require('express');

const {
  getStats,
  getRecentActivity,
  getCourseCapacity,
} = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/stats', authMiddleware, roleMiddleware('admin'), asyncHandler(getStats));
router.get('/recent-activity', authMiddleware, roleMiddleware('admin'), asyncHandler(getRecentActivity));

router.get('/course-capacity', authMiddleware, roleMiddleware('admin'), asyncHandler(getCourseCapacity));

module.exports = router;
