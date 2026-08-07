//Dzul
const express = require('express');

const {
  enrollmentTrend,
  coursePopularity,
  completionRates,
} = require('../controllers/reportController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/enrollment-trend', authMiddleware, roleMiddleware('admin'), asyncHandler(enrollmentTrend));
router.get('/course-popularity', authMiddleware, roleMiddleware('admin'), asyncHandler(coursePopularity));
router.get('/completion-rates', authMiddleware, roleMiddleware('admin'), asyncHandler(completionRates));

module.exports = router;
