// backend/src/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/enrollment-trend', authMiddleware, roleMiddleware('admin'), reportController.enrollmentTrend);
router.get('/course-popularity', authMiddleware, roleMiddleware('admin'), reportController.coursePopularity);
router.get('/completion-rates', authMiddleware, roleMiddleware('admin'), reportController.completionRates);

module.exports = router;