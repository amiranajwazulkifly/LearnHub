const { pool } = require('../config/db');

/**
 * Creating notifications.
 *
 * Every function here is best-effort: a notification is a side effect of the
 * real action (grading, enrolling, publishing), so a failure to write one is
 * logged and swallowed rather than failing the request that triggered it.
 * Recipients are resolved in SQL with INSERT ... SELECT, so notifying a whole
 * course is one round trip regardless of class size.
 */

async function safely(label, fn) {
  try {
    await fn();
  } catch (error) {
    console.error(`Notification failed (${label}):`, error);
  }
}

/** Notifies a single user. */
function notifyUser(userId, { type, title, body = null, link = null }) {
  return safely(type, () =>
    pool.query(
      `INSERT INTO public.notifications (user_id, type, title, body, link)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, type, title, body, link]
    )
  );
}

/** Notifies every currently enrolled student in a course. */
function notifyCourseStudents(courseId, { type, title, body = null, link = null }) {
  return safely(type, () =>
    pool.query(
      `INSERT INTO public.notifications (user_id, type, title, body, link)
       SELECT DISTINCT e.student_id, $2, $3, $4, $5
       FROM public.enrollments e
       WHERE e.course_id = $1 AND e.status = 'enrolled'`,
      [courseId, type, title, body, link]
    )
  );
}

/** Notifies the instructor who teaches a course, if they have a login. */
function notifyCourseInstructor(courseId, { type, title, body = null, link = null }) {
  return safely(type, () =>
    pool.query(
      `INSERT INTO public.notifications (user_id, type, title, body, link)
       SELECT i.user_id, $2, $3, $4, $5
       FROM public.courses c
       JOIN public.instructors i ON i.id = c.instructor_id
       WHERE c.id = $1 AND i.user_id IS NOT NULL`,
      [courseId, type, title, body, link]
    )
  );
}

/** Notifies every active user with a given role. */
function notifyRole(role, { type, title, body = null, link = null }) {
  return safely(type, () =>
    pool.query(
      `INSERT INTO public.notifications (user_id, type, title, body, link)
       SELECT u.id, $2, $3, $4, $5
       FROM public.users u
       WHERE u.role = $1 AND u.status = 'active'`,
      [role, type, title, body, link]
    )
  );
}

module.exports = {
  notifyUser,
  notifyCourseStudents,
  notifyCourseInstructor,
  notifyRole,
};
