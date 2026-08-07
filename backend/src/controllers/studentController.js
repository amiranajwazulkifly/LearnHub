// dzul
const { pool } = require('../config/db');
const ApiError = require('../utils/apiError');

function formatStudent(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    enrollmentCount: row.enrollment_count !== undefined ? Number(row.enrollment_count) : undefined,
    studentNumber: row.student_number ?? null,
    programme: row.programme ?? null,
    semester: row.semester ?? null,
  };
}

// GET /api/students?search=&page=&limit=
async function listStudents(req, res) {
  const search = (req.query.search || '').trim();
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
      SELECT u.id, u.full_name, u.email, u.status, u.created_at,
             sp.student_number, sp.programme, sp.semester,
             (SELECT COUNT(*) FROM public.enrollments e WHERE e.student_id = u.id) AS enrollment_count
      FROM public.users u
      LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
      WHERE u.role = 'student'
        AND (u.full_name ILIKE $1 OR u.email ILIKE $1)
      ORDER BY u.full_name
      LIMIT $2 OFFSET $3
    `,
    [`%${search}%`, limit, offset]
  );

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM public.users WHERE role = 'student' AND (full_name ILIKE $1 OR email ILIKE $1)`,
    [`%${search}%`]
  );

  res.status(200).json({
    success: true,
    message: 'Students retrieved successfully',
    data: {
      students: result.rows.map(formatStudent),
      total: Number(countResult.rows[0].count),
      page,
      limit,
    },
  });
}

// GET /api/students/:id  (id is a UUID)
async function getStudentDetail(req, res) {
  const { id } = req.params;

  const userResult = await pool.query(
    `
      SELECT u.id, u.full_name, u.email, u.status, u.created_at,
             sp.student_number, sp.programme, sp.semester
      FROM public.users u
      LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
      WHERE u.id = $1 AND u.role = 'student'
    `,
    [id]
  );

  if (userResult.rows.length === 0) {
    throw new ApiError(404, 'Student not found');
  }

  const enrollmentsResult = await pool.query(
    `
      SELECT e.id, e.status, e.enrolled_at, e.cancelled_at, e.completed_at,
             c.id AS course_id, c.title, c.code
      FROM public.enrollments e
      JOIN public.courses c ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `,
    [id]
  );

  res.status(200).json({
    success: true,
    message: 'Student detail retrieved successfully',
    data: {
      student: formatStudent(userResult.rows[0]),
      enrollments: enrollmentsResult.rows.map((e) => ({
        id: e.id,
        status: e.status,
        enrolledAt: e.enrolled_at,
        cancelledAt: e.cancelled_at,
        completedAt: e.completed_at,
        courseId: e.course_id,
        courseTitle: e.title,
        courseCode: e.code,
      })),
    },
  });
}

// GET /api/enrollments  (admin-wide enrollment management)
async function listAllEnrollments(req, res) {
  const result = await pool.query(`
    SELECT e.id, e.status, e.enrolled_at, e.cancelled_at, e.completed_at,
           u.id AS student_id, u.full_name AS student_name,
           c.id AS course_id, c.title AS course_title
    FROM public.enrollments e
    JOIN public.users u ON u.id = e.student_id
    JOIN public.courses c ON c.id = e.course_id
    ORDER BY e.enrolled_at DESC
  `);

  res.status(200).json({
    success: true,
    message: 'Enrollments retrieved successfully',
    data: {
      enrollments: result.rows.map((r) => ({
        id: r.id,
        status: r.status,
        enrolledAt: r.enrolled_at,
        cancelledAt: r.cancelled_at,
        completedAt: r.completed_at,
        studentId: r.student_id,
        studentName: r.student_name,
        courseId: r.course_id,
        courseTitle: r.course_title,
      })),
    },
  });
}

// PATCH /api/enrollments/:id  { status }
// Real enum values: 'enrolled' | 'cancelled' | 'completed' — NOT 'active'/'dropped'.
async function updateEnrollmentStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ['enrolled', 'cancelled', 'completed'];

  if (!allowed.includes(status)) {
    throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);
  }

  // The schema's CHECK constraints require cancelled_at/completed_at to be
  // set when those statuses are used — set them here so the DB constraint
  // doesn't reject the update.
  const timestampColumn =
    status === 'cancelled' ? 'cancelled_at' : status === 'completed' ? 'completed_at' : null;

  const query = timestampColumn
    ? `UPDATE public.enrollments SET status = $2, ${timestampColumn} = now() WHERE id = $1 RETURNING *`
    : `UPDATE public.enrollments SET status = $2 WHERE id = $1 RETURNING *`;

  const result = await pool.query(query, [id, status]);

  if (result.rows.length === 0) {
    throw new ApiError(404, 'Enrollment not found');
  }

  res.status(200).json({
    success: true,
    message: 'Enrollment status updated successfully',
    data: { enrollment: result.rows[0] },
  });
}

module.exports = { listStudents, getStudentDetail, listAllEnrollments, updateEnrollmentStatus };
