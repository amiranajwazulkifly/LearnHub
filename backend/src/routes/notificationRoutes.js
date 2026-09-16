const express = require('express');

const { listMine, markRead, markAllRead } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Every role has notifications; each user only ever sees their own.
router.use(authMiddleware, roleMiddleware('admin', 'student', 'instructor'));

router.get('/', asyncHandler(listMine));
// Declared before '/:id/read' so "read-all" is never captured as an id.
router.patch('/read-all', asyncHandler(markAllRead));
router.patch('/:id/read', asyncHandler(markRead));

module.exports = router;
