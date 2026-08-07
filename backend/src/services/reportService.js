//Dzul
const { pool } = require('../config/db');

async function getEnrollmentTrend(days = 30) {
  const result = await pool.query(
    `
      SELECT DATE(enrolled_at) AS date, COUNT(*) AS count
      FROM public.enrollments
      WHERE enrolled_at >= NOW() - ($1 || ' days')::INTERVAL
      GROUP BY DATE(enrolled_at)
      ORDER BY date
    `,
    [days]
  );
  return result.rows.map((r) => ({ date: r.date, count: Number(r.count) }));
}

async function getCoursePopularity(limit = 10) {
  const result = await pool.query(
    `
      SELECT c.id, c.title,
             COUNT(e.id) FILTER (WHERE e.status = 'enrolled') AS active_count,
             COUNT(e.id) AS total_count
      FROM public.courses c
      LEFT JOIN public.enrollments e ON e.course_id = c.id
      GROUP BY c.id, c.title
      ORDER BY total_count DESC
      LIMIT $1
    `,
    [limit]
  );
  return result.rows.map((r) => ({
    id: r.id,
    title: r.title,
    activeEnrollments: Number(r.active_count),
    totalEnrollments: Number(r.total_count),
  }));
}

// "Completion rate" = completed / (enrolled + completed + cancelled) per course.
async function getCompletionRates() {
  const result = await pool.query(`
    SELECT c.id, c.title,
      COUNT(e.id) AS total_enrollments,
      COUNT(e.id) FILTER (WHERE e.status = 'completed') AS completed_count
    FROM public.courses c
    LEFT JOIN public.enrollments e ON e.course_id = c.id
    GROUP BY c.id, c.title
    ORDER BY c.title
  `);

  return result.rows.map((r) => {
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
