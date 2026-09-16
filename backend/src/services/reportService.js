//Dzul
const { pool } = require('../config/db');

/**
 * Daily enrollment counts over the trailing `days` window.
 *
 * generate_series supplies every date in the range and the LEFT JOIN fills
 * the gaps with zero. Without it the query returned only days that happened
 * to have activity, and a line chart would then join 3 Sep straight to
 * 11 Sep as though they were consecutive — visually implying steady activity
 * across a week where there was none.
 */
async function getEnrollmentTrend(days = 30) {
  const result = await pool.query(
    `
      SELECT
        d.date::date AS date,
        COUNT(e.id) AS count
      FROM generate_series(
        CURRENT_DATE - ($1::int - 1),
        CURRENT_DATE,
        INTERVAL '1 day'
      ) AS d(date)
      LEFT JOIN public.enrollments e
        ON DATE(e.enrolled_at) = d.date::date
      GROUP BY d.date
      ORDER BY d.date
    `,
    [days]
  );

  return result.rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

async function getCoursePopularity(limit = 10) {
  const result = await pool.query(
    `
      SELECT c.id, c.code, c.title,
             COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS active_count,
             COUNT(e.id) AS total_count
      FROM public.courses c
      LEFT JOIN public.enrollments e ON e.course_id = c.id
      GROUP BY c.id, c.code, c.title
      ORDER BY total_count DESC, c.code
      LIMIT $1
    `,
    [limit]
  );
  return result.rows.map((r) => ({
    id: r.id,
    code: r.code,
    title: r.title,
    activeEnrollments: Number(r.active_count),
    totalEnrollments: Number(r.total_count),
  }));
}

// "Completion rate" = completed / (enrolled + completed + cancelled) per course.
async function getCompletionRates() {
  const result = await pool.query(`
    SELECT c.id, c.code, c.title,
      COUNT(e.id) AS total_enrollments,
      COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_count,
      COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS active_count
    FROM public.courses c
    LEFT JOIN public.enrollments e ON e.course_id = c.id
    GROUP BY c.id, c.code, c.title
    ORDER BY c.code
  `);

  return result.rows.map((r) => {
    const total = Number(r.total_enrollments);
    const completed = Number(r.completed_count);
    return {
      id: r.id,
      code: r.code,
      title: r.title,
      total,
      active: Number(r.active_count),
      completed,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

// ============================================================
// Export datasets.
//
// Each returns { filename, columns, rows } — a shape the CSV serializer can
// consume without knowing anything about the specific report.
// ============================================================

async function getStudentExport() {
  const result = await pool.query(`
    SELECT
      u.full_name, u.email, u.status,
      sp.student_number, sp.programme, sp.semester,
      COUNT(e.id) FILTER (WHERE e.status = 'enrolled')  AS active_enrollments,
      COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_enrollments,
      u.created_at
    FROM public.users u
    LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
    LEFT JOIN public.enrollments e ON e.student_id = u.id
    WHERE u.role = 'student'
    GROUP BY u.id, sp.student_number, sp.programme, sp.semester
    ORDER BY sp.student_number NULLS LAST, u.full_name
  `);

  return {
    filename: 'students',
    columns: [
      ['student_number', 'Student Number'],
      ['full_name', 'Full Name'],
      ['email', 'Email'],
      ['programme', 'Programme'],
      ['semester', 'Semester'],
      ['status', 'Account Status'],
      ['active_enrollments', 'Active Enrollments'],
      ['completed_enrollments', 'Completed Enrollments'],
      ['created_at', 'Registered At'],
    ],
    rows: result.rows,
  };
}

async function getCourseExport() {
  const result = await pool.query(`
    SELECT
      c.code, c.title, c.status, c.capacity,
      cat.name AS category,
      i.full_name AS instructor,
      COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS enrolled,
      c.capacity - COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS seats_remaining,
      COUNT(DISTINCT a.id) AS assignments
    FROM public.courses c
    LEFT JOIN public.categories cat ON cat.id = c.category_id
    LEFT JOIN public.instructors i ON i.id = c.instructor_id
    LEFT JOIN public.enrollments e ON e.course_id = c.id
    LEFT JOIN public.assignments a ON a.course_id = c.id
    GROUP BY c.id, cat.name, i.full_name
    ORDER BY c.code
  `);

  return {
    filename: 'courses',
    columns: [
      ['code', 'Code'],
      ['title', 'Title'],
      ['category', 'Category'],
      ['instructor', 'Instructor'],
      ['status', 'Status'],
      ['capacity', 'Capacity'],
      ['enrolled', 'Enrolled'],
      ['seats_remaining', 'Seats Remaining'],
      ['assignments', 'Assignments'],
    ],
    rows: result.rows,
  };
}

async function getEnrollmentExport() {
  const result = await pool.query(`
    SELECT
      sp.student_number, u.full_name AS student_name, u.email,
      c.code AS course_code, c.title AS course_title,
      i.full_name AS instructor,
      e.status, e.enrolled_at, e.completed_at, e.cancelled_at
    FROM public.enrollments e
    JOIN public.users u ON u.id = e.student_id
    LEFT JOIN public.student_profiles sp ON sp.user_id = u.id
    JOIN public.courses c ON c.id = e.course_id
    LEFT JOIN public.instructors i ON i.id = c.instructor_id
    ORDER BY e.enrolled_at DESC
  `);

  return {
    filename: 'enrollments',
    columns: [
      ['student_number', 'Student Number'],
      ['student_name', 'Student'],
      ['email', 'Email'],
      ['course_code', 'Course Code'],
      ['course_title', 'Course'],
      ['instructor', 'Instructor'],
      ['status', 'Status'],
      ['enrolled_at', 'Enrolled At'],
      ['completed_at', 'Completed At'],
      ['cancelled_at', 'Cancelled At'],
    ],
    rows: result.rows,
  };
}

async function getCompletionRateExport() {
  const rows = await getCompletionRates();

  return {
    filename: 'completion-rates',
    columns: [
      ['code', 'Course Code'],
      ['title', 'Course'],
      ['total', 'Total Enrollments'],
      ['active', 'Currently Enrolled'],
      ['completed', 'Completed'],
      ['completionRate', 'Completion Rate (%)'],
    ],
    rows,
  };
}

async function getInstructorAllocationExport() {
  const result = await pool.query(`
    SELECT
      i.full_name, i.email, i.expertise, i.is_active,
      COUNT(DISTINCT c.id) AS courses,
      COUNT(DISTINCT e.student_id) FILTER (WHERE e.status = 'enrolled') AS students
    FROM public.instructors i
    LEFT JOIN public.courses c ON c.instructor_id = i.id
    LEFT JOIN public.enrollments e ON e.course_id = c.id
    GROUP BY i.id
    ORDER BY i.full_name
  `);

  return {
    filename: 'instructor-allocation',
    columns: [
      ['full_name', 'Instructor'],
      ['email', 'Email'],
      ['expertise', 'Expertise'],
      ['is_active', 'Active'],
      ['courses', 'Courses'],
      ['students', 'Students'],
    ],
    rows: result.rows,
  };
}

async function getEnrollmentTrendExport(days = 30) {
  const rows = await getEnrollmentTrend(days);

  return {
    filename: `enrollment-trend-${days}-days`,
    columns: [
      ['date', 'Date'],
      ['count', 'Enrollments'],
    ],
    rows,
  };
}

// Every export the API offers, keyed by the `type` in the route.
const EXPORTS = {
  students: getStudentExport,
  courses: getCourseExport,
  enrollments: getEnrollmentExport,
  'completion-rates': getCompletionRateExport,
  'instructor-allocation': getInstructorAllocationExport,
  'enrollment-trend': getEnrollmentTrendExport,
};

module.exports = {
  getEnrollmentTrend,
  getCoursePopularity,
  getCompletionRates,
  EXPORTS,
};
