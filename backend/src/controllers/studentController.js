// backend/src/controllers/studentController.js
const { pool } = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

// GET /api/students?search=&page=&limit=
// Admin-only. Paginated + searchable list of students.
exports.listStudents = asyncHandler(async (req, res) => {
  const search = (req.query.search || '').trim();
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const offset = (page - 1) * limit;

  const params = [`%${search}%`];
  const { rows } = await pool.query(
    `SELECT id, email, full_name, created_at,
       (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = users.id) AS enrollment_count
     FROM users
     WHERE role = 'student' AND (full_name ILIKE $1 OR email ILIKE $1)
     ORDER BY full_name
     LIMIT $2 OFFSET $3`,
    [...params, limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) FROM users WHERE role = 'student' AND (full_name ILIKE $1 OR email ILIKE $1)`,
    params
  );

  res.status(200).json({
    students: rows,
    total: Number(countRows[0].count),
    page,
    limit,
  });
});

// GET /api/students/:id
// Admin-only. Full profile + their enrollment history.
exports.getStudentDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { rows: userRows } = await pool.query(
    `SELECT id, email, full_name, created_at FROM users WHERE id = $1 AND role = 'student'`,
    [id]
  );
  if (userRows.length === 0) {
    throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
  }

  const { rows: enrollments } = await pool.query(
    `SELECT e.id, e.status, e.enrolled_at, e.completed_at, c.id AS course_id, c.title
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     WHERE e.student_id = $1
     ORDER BY e.enrolled_at DESC`,
    [id]
  );

  res.status(200).json({ student: userRows[0], enrollments });
});

// GET /api/enrollments  (admin enrollment management page)
// Lists all enrollments across the platform, with student + course names.
exports.listAllEnrollments = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT e.id, e.status, e.enrolled_at, e.completed_at,
           u.id AS student_id, u.full_name AS student_name,
           c.id AS course_id, c.title AS course_title
    FROM enrollments e
    JOIN users u ON u.id = e.student_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY e.enrolled_at DESC
  `);
  res.status(200).json(rows);
});

// PATCH /api/enrollments/:id  { status }
// Admin override — e.g. manually mark an enrollment dropped/completed.
exports.updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['active', 'completed', 'dropped'];
  if (!allowed.includes(status)) {
    throw new ApiError(400, 'VALIDATION_ERROR', `status must be one of: ${allowed.join(', ')}`);
  }

  const { rows } = await pool.query(
    `UPDATE enrollments SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  if (rows.length === 0) {
    throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found');
  }
  res.status(200).json(rows[0]);
});
