// dzul
const { pool } = require('../config/db');

// GET /api/dashboard/stats
// Admin-only. instructors is a standalone directory table (not a users.role),
// so instructor count comes from there, not from users.
async function getStats(req, res) {
  const [students, instructors, courses, enrollments] = await Promise.all([
    pool.query(`SELECT COUNT(*) FROM public.users WHERE role = 'student'`),
    pool.query(`SELECT COUNT(*) FROM public.instructors WHERE is_active = true`),
    pool.query(`SELECT COUNT(*) FROM public.courses`),
    pool.query(`SELECT COUNT(*) FROM public.enrollments WHERE status = 'enrolled'`),
  ]);

  res.status(200).json({
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: {
      totalStudents: Number(students.rows[0].count),
      totalInstructors: Number(instructors.rows[0].count),
      totalCourses: Number(courses.rows[0].count),
      totalActiveEnrollments: Number(enrollments.rows[0].count),
    },
  });
}

// GET /api/dashboard/recent-activity
async function getRecentActivity(req, res) {
  const result = await pool.query(`
    SELECT e.id, e.enrolled_at, e.status,
           u.full_name AS student_name,
           c.title AS course_title
    FROM public.enrollments e
    JOIN public.users u ON u.id = e.student_id
    JOIN public.courses c ON c.id = e.course_id
    ORDER BY e.enrolled_at DESC
    LIMIT 10
  `);

  res.status(200).json({
    success: true,
    message: 'Recent activity retrieved successfully',
    data: {
      activity: result.rows.map((r) => ({
        id: r.id,
        studentName: r.student_name,
        courseTitle: r.course_title,
        status: r.status,
        enrolledAt: r.enrolled_at,
      })),
    },
  });
}

module.exports = { getStats, getRecentActivity };
