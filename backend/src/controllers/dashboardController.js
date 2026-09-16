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
//
// An operational feed rather than just an enrollment log: enrollments and
// cancellations, assignments posted, and announcements published, merged by
// timestamp. Derived from the timestamps already on each table — there is no
// event store, and this doesn't need one.
async function getRecentActivity(req, res) {
  const result = await pool.query(`
    (
      SELECT
        e.id,
        'enrollment'::text AS kind,
        CASE WHEN e.status = 'cancelled' THEN 'cancelled' ELSE 'enrolled' END AS action,
        COALESCE(e.cancelled_at, e.enrolled_at) AS occurred_at,
        u.full_name AS actor,
        c.code AS course_code,
        c.title AS subject
      FROM public.enrollments e
      JOIN public.users u ON u.id = e.student_id
      JOIN public.courses c ON c.id = e.course_id
    )
    UNION ALL
    (
      SELECT
        a.id,
        'assignment'::text,
        'posted',
        a.created_at,
        COALESCE(i.full_name, 'An instructor'),
        c.code,
        a.title
      FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      LEFT JOIN public.instructors i ON i.id = c.instructor_id
    )
    UNION ALL
    (
      SELECT
        an.id,
        'announcement'::text,
        'published',
        an.published_at,
        COALESCE(u.full_name, 'An administrator'),
        NULL,
        an.title
      FROM public.announcements an
      LEFT JOIN public.users u ON u.id = an.created_by
      WHERE an.status = 'published' AND an.published_at IS NOT NULL
    )
    ORDER BY occurred_at DESC
    LIMIT 12
  `);

  res.status(200).json({
    success: true,
    message: 'Recent activity retrieved successfully',
    data: {
      activity: result.rows.map((r) => ({
        id: r.id,
        kind: r.kind,
        action: r.action,
        occurredAt: r.occurred_at,
        actor: r.actor,
        courseCode: r.course_code,
        subject: r.subject,
      })),
    },
  });
}

// GET /api/dashboard/course-capacity
//
// How full each published course is. Surfaces the courses that are at or
// near capacity, which is the thing an administrator most often needs to act
// on before registration closes.
async function getCourseCapacity(req, res) {
  const result = await pool.query(`
    SELECT
      c.id, c.code, c.title, c.capacity,
      COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS enrolled
    FROM public.courses c
    LEFT JOIN public.enrollments e ON e.course_id = c.id
    WHERE c.status = 'published'
    GROUP BY c.id
    ORDER BY
      -- Fullest first, so anything at capacity is impossible to miss.
      (COUNT(e.id) FILTER (WHERE e.status = 'enrolled'))::numeric
        / NULLIF(c.capacity, 0) DESC NULLS LAST,
      c.code
  `);

  res.status(200).json({
    success: true,
    message: 'Course capacity retrieved successfully',
    data: {
      courses: result.rows.map((r) => {
        const capacity = Number(r.capacity);
        const enrolled = Number(r.enrolled);

        return {
          id: r.id,
          code: r.code,
          title: r.title,
          capacity,
          enrolled,
          seatsRemaining: Math.max(capacity - enrolled, 0),
          isFull: enrolled >= capacity,
          percentFull: capacity === 0 ? 0 : Math.round((enrolled / capacity) * 100),
        };
      }),
    },
  });
}

module.exports = { getStats, getRecentActivity, getCourseCapacity };
