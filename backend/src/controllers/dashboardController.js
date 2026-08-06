// backend/src/controllers/dashboardController.js
//
// Assumes Nabil's shared files exist at these paths:
//   ../config/db.js        -> exports a `pool` (pg Pool)
//   ../utils/asyncHandler.js -> wraps async route handlers, forwards errors to next()
//   ../utils/apiError.js   -> a custom Error subclass with .status and .code

const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/dashboard/stats
// Admin-only. Returns the 4 headline counts for the dashboard cards.
exports.getStats = asyncHandler(async (req, res) => {
  const [students, instructors, courses, enrollments] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'student'`),
    pool.query(`SELECT COUNT(*) FROM users WHERE role = 'instructor'`),
    pool.query(`SELECT COUNT(*) FROM courses`),
    pool.query(`SELECT COUNT(*) FROM enrollments`),
  ]);

  res.status(200).json({
    totalStudents: Number(students.rows[0].count),
    totalInstructors: Number(instructors.rows[0].count),
    totalCourses: Number(courses.rows[0].count),
    totalEnrollments: Number(enrollments.rows[0].count),
  });
});

// GET /api/dashboard/recent-activity
// Small feed for the dashboar