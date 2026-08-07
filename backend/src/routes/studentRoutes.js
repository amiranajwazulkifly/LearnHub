//Dzul
const express = require('express');

const {
  listStudents,
  getStudentDetail,
  listAllEnrollments,
  updateEnrollmentStatus,
} = require('../controllers/studentController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/students', authMiddleware, roleMiddleware('admin'), asyncHandler(listStudents));
router.get('/students/:id', authMiddleware, roleMiddleware('admin'), asyncHandler(getStudentDetail));

// Mounted under /admin/enrollments (not /enrollments) to avoid any path
// overlap with the student-facing enrollmentRoutes.js — even though the
// HTTP methods don't actually collide, distinct paths are far less
// confusing for anyone reading both route files side by side.
router.get(
  '/admin/enrollments',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(listAllEnrollments)
);
router.patch(
  '/admin/enrollments/:id',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(updateEnrollmentStatus)
);

module.exports = router;