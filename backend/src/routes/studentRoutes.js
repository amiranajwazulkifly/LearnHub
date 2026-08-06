// backend/src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Student management (StudentsPage, StudentDetailsPage)
router.get('/students', authMiddleware, roleMiddleware('admin'), studentController.listStudents);
router.get('/students/:id', authMiddleware, roleMiddleware('admin'), studentController.getStudentDetail);

// Enrollment management (EnrollmentsPage) — same router file since both
// are "admin oversight of students," but mounted under a separate prefix
// in app.js: /api/students and /api/enrollments respectively.
router.get('/enrollments', authMiddleware, roleMiddleware('admin'), studentController.listAllEnrollments);
router.patch('/enrollments/:id', authMiddleware, roleMiddleware('admin'), studentController.updateEnrollmentStatus);

module.exports = router;
