// backend/src/routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { validateAnnouncementPayload } = require('../validators/announcementValidator');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student-facing — any authenticated user can read published announcements.
// Placed before /:id so it doesn't get swallowed by the param route.
router.get('/published', authMiddleware, announcementController.listPublished);

// Admin management
router.get('/', authMiddleware, roleMiddleware('admin'), announcementController.listAll);
router.get('/:id', authMiddleware, roleMiddleware('admin'), announcementController.getOne);
router.post('/', authMiddleware, roleMiddleware('admin'), validateAnnouncementPayload, announcementController.create);
router.patch('/:id', authMiddleware, roleMiddleware('admin'), announcementController.update);
router.patch('/:id/publish', authMiddleware, roleMiddleware('admin'), announcementController.publish);
router.patch('/:id/unpublish', authMiddleware, roleMiddleware('admin'), announcementController.unpublish);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), announcementController.remove);

module.exports = router;
