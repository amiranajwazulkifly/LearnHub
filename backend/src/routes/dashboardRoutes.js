// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/stats', authMiddleware, roleMiddleware('admin'), dashboardController.getStats);
router.get('/recent-activity', authMiddleware, roleMiddleware('admin'), dashboardController.getRecentActivity);

module.exports = router;
