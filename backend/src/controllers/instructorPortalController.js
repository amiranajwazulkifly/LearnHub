const { pool } = require('../config/db');
const ApiError = require('../utils/apiError');

// Resolves the instructors row linked to the logged-in instructor's user
// account. Every route below scopes its query by this id so an instructor
// can only ever see their own courses/students.
async function getInstructorIdForUser(userId) {
  const result = await pool.query(
    'SELECT id, full_name, email FROM instructors WHERE user_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Instructor profile not found for this account');
  }

  return result.rows[0];
}

// GET /api/instructor-portal/me/stats
async function getStats(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);

  const result = await pool.query(
    `
      SELECT
        COUNT(DISTINCT c.id) AS course_count,
        COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'enrolled') AS student_count
      FROM public.courses c
      LEFT JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.instructor_id = $1
    `,
    [instructor.id]
  );

  res.status(200).json({
    success: true,
    message: 'Instructor stats retrieved successfully',
    data: {
      courseCount: Number(result.rows[0].course_count),
      studentCount: Number(result.rows[0].student_count),
    },
  });
}

// GET /api/instructor-portal/me/courses
async function getMyCourses(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);

  const result = await pool.query(
    `
      SELECT
        c.id, c.code, c.title, c.description, c.capacity, c.status,
        cat.name AS category_name,
        COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS enrolled_count
      FROM public.courses c
      LEFT JOIN public.categories cat ON cat.id = c.category_id
      LEFT JOIN public.enrollments e ON e.course_id = c.id
      WHERE c.instructor_id = $1
      GROUP BY c.id, cat.name
      ORDER BY c.created_at DESC
    `,
    [instructor.id]
  );

  res.status(200).json({
    success: true,
    message: 'Instructor courses retrieved successfully',
    data: {
      courses: result.rows.map((r) => ({
        id: r.id,
        code: r.code,
        title: r.title,
        description: r.description,
        capacity: r.capacity,
        status: r.status,
        categoryName: r.category_name,
        enrolledCount: Number(r.enrolled_count),
      })),
    },
  });
}

// GET /api/instructor-portal/me/courses/:courseId/students
async function getCourseStudents(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);
  const { courseId } = req.params;

  const courseResult = await pool.query(
    'SELECT id, code, title FROM public.courses WHERE id = $1 AND instructor_id = $2',
    [courseId, instructor.id]
  );

  if (courseResult.rows.length === 0) {
    throw new ApiError(404, 'Course not found');
  }

  const studentsResult = await pool.query(
    `
      SELECT
        e.id AS enrollment_id, e.status, e.enrolled_at, e.completed_at,
        u.id AS student_id, u.full_name, u.email
      FROM public.enrollments e
      JOIN public.users u ON u.id = e.student_id
      WHERE e.course_id = $1
      ORDER BY u.full_name
    `,
    [courseId]
  );

  res.status(200).json({
    success: true,
    message: 'Course roster retrieved successfully',
    data: {
      course: courseResult.rows[0],
      students: studentsResult.rows.map((r) => ({
        enrollmentId: r.enrollment_id,
        status: r.status,
        enrolledAt: r.enrolled_at,
        completedAt: r.completed_at,
        studentId: r.student_id,
        fullName: r.full_name,
        email: r.email,
      })),
    },
  });
}

module.exports = { getStats, getMyCourses, getCourseStudents };
