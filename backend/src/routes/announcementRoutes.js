//Dzul
const express = require('express');

const {
  listAll,
  listPublished,
  getOne,
  create,
  update,
  publish,
  archive,
  backToDraft,
  remove,
} = require('../controllers/announcementController');

const {
  validateCreateAnnouncement,
  validateUpdateAnnouncement,
} = require('../validators/announcementValidator');

const validationMiddleware = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Student-facing — any authenticated user reads published announcements
// scoped to their audience. Declared before '/:id' so it isn't swallowed
// by the param route.
router.get('/published', authMiddleware, roleMiddleware('admin', 'student'), asyncHandler(listPublished));

// Admin management
router.get('/', authMiddleware, roleMiddleware('admin'), asyncHandler(listAll));
router.get('/:id', authMiddleware, roleMiddleware('admin'), asyncHandler(getOne));

router.post(
  '/',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(validateCreateAnnouncement),
  asyncHandler(create)
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('admin'),
  validationMiddleware(validateUpdateAnnouncement),
  asyncHandler(update)
);

router.patch('/:id/publish', authMiddleware, roleMiddleware('admin'), asyncHandler(publish));
router.patch('/:id/archive', authMiddleware, roleMiddleware('admin'), asyncHandler(archive));
router.patch('/:id/draft', authMiddleware, roleMiddleware('admin'), asyncHandler(backToDraft));

router.delete('/:id', authMiddleware, roleMiddleware('admin'), asyncHandler(remove));

module.exports = router;
