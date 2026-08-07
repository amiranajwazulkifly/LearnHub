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

router.get('/enrollments', authMiddleware, roleMiddleware('admin'), asyncHandler(listAllEnrollments));
router.patch(
  '/enrollments/:id',
  authMiddleware,
  roleMiddleware('admin'),
  asyncHandler(updateEnrollmentStatus)
);

module.exports = router;
