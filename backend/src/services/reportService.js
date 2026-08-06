// backend/src/services/reportService.js
//
// Separated from the controller because reports tend to grow complex
// aggregation logic over time — keeping it here means reportController.js
// stays a thin HTTP layer, same repository/service split used elsewhere
// in the project.

const { pool } = require('../config/db');

// Enrollments per day over the last N days — feeds a line chart.
async function getEnrollmentTrend(days = 30) {
  const { rows } = await pool.query(
    `SELECT DATE(enrolled_at) AS date, COUNT(*) AS count
     FROM enrollments
     WHERE enrolled_at >= NOW() - ($1 || ' days')::INTERVAL
     GROUP BY DATE(enrolled_at)
     ORDER BY date`,
    [days]
  );
  return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

// Most-enrolled courses — feeds a bar chart.
async function getCoursePopularity(limit = 10) {
  const { rows } = await pool.query(
    `SELECT c.id, c.title, COUNT(e.id) AS enrollment_count
     FROM courses c
     LEFT JOIN enrollments e ON e.course_id = c.id
     GROUP BY c.id, c.title
     ORDER BY enrollment_count DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((r) => ({ id: r.id, title: r.title, enrollmentCount: Number(r.enrollment_count) }));
}

// Completion rate per course — feeds a table or a horizontal bar chart.
async function getCompletionRates() {
  const { rows } = await pool.query(`
    SELECT c.id, c.title,
      COUNT(e.id) AS total_enrollments,
      COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_count
    FROM courses c
    LEFT JOIN enrollments e ON e.course_id = c.id
    GROUP BY c.id, c.title
    ORDER BY c.title
  `);
  return rows.map((r) => {
    const total = Number(r.total_enrollments);
    const completed = Number(r.completed_count);
    return {
      id: r.id,
      title: r.title,
      total,
      completed,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  });
}

module.exports = { getEnrollmentTrend, getCoursePopularity, getCompletionRates };
