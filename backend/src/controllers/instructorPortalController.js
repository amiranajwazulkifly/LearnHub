const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");

// Resolves the instructors row linked to the logged-in instructor's user
// account. Every route below scopes its query by this id so an instructor
// can only ever see their own courses/students.
async function getInstructorIdForUser(userId) {
  const result = await pool.query(
    "SELECT id, full_name, email FROM instructors WHERE user_id = $1",
    [userId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Instructor profile not found for this account");
  }

  return result.rows[0];
}

// GET /api/instructor-portal/me/stats
//
// Each figure is its own scalar subquery. The previous version LEFT JOINed
// enrollments, assignments and submissions in a single pass, which fans the
// result set out into a cartesian product — COUNT(DISTINCT ...) papered over
// it, but any non-distinct aggregate added later would have been silently
// wrong. Separate subqueries also let each stat use exactly the rule the
// matching detail page uses, which is what keeps the screens agreeing.
async function getStats(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);

  const result = await pool.query(
    `
    WITH my_courses AS (
      SELECT id FROM public.courses WHERE instructor_id = $1
    )
    SELECT
      (SELECT COUNT(*) FROM my_courses) AS course_count,

      (
        SELECT COUNT(DISTINCT e.student_id)
        FROM public.enrollments e
        WHERE e.course_id IN (SELECT id FROM my_courses)
          AND e.status = 'enrolled'
      ) AS student_count,

      (
        SELECT COUNT(*)
        FROM public.assignments a
        WHERE a.course_id IN (SELECT id FROM my_courses)
          AND (a.due_at IS NULL OR a.due_at >= NOW())
      ) AS active_assignment_count,

      -- Ungraded work waiting on this instructor. Counts every real
      -- submission, including those from students who have since cancelled,
      -- because that work is still on the roster and still gradeable.
      (
        SELECT COUNT(*)
        FROM public.assignment_submissions s
        JOIN public.assignments a ON a.id = s.assignment_id
        WHERE a.course_id IN (SELECT id FROM my_courses)
          AND s.grade IS NULL
      ) AS pending_submission_count
    `,
    [instructor.id],
  );

  res.status(200).json({
    success: true,
    message: "Instructor stats retrieved successfully",
    data: {
      courseCount: Number(result.rows[0].course_count),
      studentCount: Number(result.rows[0].student_count),
      activeAssignmentCount: Number(result.rows[0].active_assignment_count),
      pendingSubmissionCount: Number(result.rows[0].pending_submission_count),
    },
  });
}

// GET /api/instructor-portal/me/courses
async function getMyCourses(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);

  const result = await pool.query(
    `
      SELECT
        c.id,
        c.code,
        c.title,
        c.description,
        c.capacity,
        c.status,

        cat.name AS category_name,

        COUNT(DISTINCT e.student_id)
          FILTER (WHERE e.status = 'enrolled')
          AS enrolled_count,

        COUNT(DISTINCT e.student_id)
          AS associated_count,

        COUNT(DISTINCT a.id)
          AS assignment_count,

        MIN(cs.day_of_week)
          AS day_of_week,

        MIN(cs.start_time)
          AS start_time,

        MIN(cs.end_time)
          AS end_time,

        MIN(cs.location)
          AS location

      FROM public.courses c

      LEFT JOIN public.categories cat
        ON cat.id = c.category_id

      LEFT JOIN public.enrollments e
        ON e.course_id = c.id

      LEFT JOIN public.assignments a
        ON a.course_id = c.id

      LEFT JOIN public.course_schedules cs
        ON cs.course_id = c.id

      WHERE c.instructor_id = $1

      GROUP BY
        c.id,
        cat.name

      ORDER BY c.created_at DESC
    `,
    [instructor.id],
  );

  res.status(200).json({
    success: true,
    message: "Instructor courses retrieved successfully",
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
        associatedCount: Number(r.associated_count),
        assignmentCount: Number(r.assignment_count),

        dayOfWeek: r.day_of_week !== null ? Number(r.day_of_week) : null,

        startTime: r.start_time,
        endTime: r.end_time,
        location: r.location,
      })),
    },
  });
}

// GET /api/instructor-portal/me/courses/:courseId/students
async function getCourseStudents(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);
  const { courseId } = req.params;

  const courseResult = await pool.query(
    "SELECT id, code, title FROM public.courses WHERE id = $1 AND instructor_id = $2",
    [courseId, instructor.id],
  );

  if (courseResult.rows.length === 0) {
    throw new ApiError(404, "Course not found");
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
    [courseId],
  );

  res.status(200).json({
    success: true,
    message: "Course roster retrieved successfully",
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

async function getRecentSubmissions(req, res) {
  const instructor = await getInstructorIdForUser(req.user.id);

  const result = await pool.query(
    `
    SELECT
      s.id,
      s.submitted_at,
      s.grade,
      s.graded_at,

      u.id AS student_id,
      u.full_name AS student_name,
      u.email AS student_email,

      a.id AS assignment_id,
      a.title AS assignment_title,

      c.id AS course_id,
      c.code AS course_code,
      c.title AS course_title

    FROM public.assignment_submissions s

    JOIN public.assignments a
      ON a.id = s.assignment_id

    JOIN public.courses c
      ON c.id = a.course_id

    JOIN public.users u
      ON u.id = s.student_id

    WHERE c.instructor_id = $1

    ORDER BY s.submitted_at DESC

    LIMIT 5
    `,
    [instructor.id],
  );

  res.status(200).json({
    success: true,
    message: "Recent submissions retrieved successfully",
    data: {
      submissions: result.rows.map((row) => ({
        id: row.id,
        submittedAt: row.submitted_at,
        grade: row.grade,
        gradedAt: row.graded_at,

        studentId: row.student_id,
        studentName: row.student_name,
        studentEmail: row.student_email,

        assignmentId: row.assignment_id,
        assignmentTitle: row.assignment_title,

        courseId: row.course_id,
        courseCode: row.course_code,
        courseTitle: row.course_title,
      })),
    },
  });
}

module.exports = {
  getStats,
  getMyCourses,
  getCourseStudents,
  getRecentSubmissions,
};
