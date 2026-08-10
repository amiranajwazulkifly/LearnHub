const { pool } = require("../config/db");

async function findCourseById(courseId) {
  const result = await pool.query(
    `
    SELECT *
    FROM courses
    WHERE id = $1;
    `,
    [courseId],
  );

  return result.rows[0] || null;
}

async function findActiveEnrollment(studentId, courseId) {
  const result = await pool.query(
    `
    SELECT *
    FROM enrollments
    WHERE student_id = $1
      AND course_id = $2
      AND status = 'enrolled';
    `,
    [studentId, courseId],
  );

  return result.rows[0] || null;
}

async function countActiveEnrollments(courseId) {
  const result = await pool.query(
    `
    SELECT COUNT(*)::integer AS total
    FROM enrollments
    WHERE course_id = $1
      AND status = 'enrolled';
    `,
    [courseId],
  );

  return result.rows[0].total;
}

async function findTimetableConflict(studentId, courseId) {
  const result = await pool.query(
    `
    SELECT
      existing_course.id AS existing_course_id,
      existing_course.code AS existing_course_code,
      existing_course.title AS existing_course_title,
      existing_schedule.day_of_week,
      existing_schedule.start_time AS existing_start_time,
      existing_schedule.end_time AS existing_end_time,
      new_schedule.start_time AS new_start_time,
      new_schedule.end_time AS new_end_time
    FROM enrollments
    JOIN courses AS existing_course
      ON existing_course.id = enrollments.course_id
    JOIN course_schedules AS existing_schedule
      ON existing_schedule.course_id = existing_course.id
    JOIN course_schedules AS new_schedule
      ON new_schedule.course_id = $2
    WHERE enrollments.student_id = $1
      AND enrollments.status = 'enrolled'

      AND existing_schedule.day_of_week = new_schedule.day_of_week

      AND existing_schedule.start_time < new_schedule.end_time
      AND existing_schedule.end_time > new_schedule.start_time

      AND (
        existing_schedule.start_date IS NULL
        OR new_schedule.end_date IS NULL
        OR existing_schedule.start_date <= new_schedule.end_date
      )

      AND (
        existing_schedule.end_date IS NULL
        OR new_schedule.start_date IS NULL
        OR existing_schedule.end_date >= new_schedule.start_date
      )

    LIMIT 1;
    `,
    [studentId, courseId],
  );

  return result.rows[0] || null;
}

async function createEnrollment(studentId, courseId) {
  const result = await pool.query(
    `
    INSERT INTO enrollments
    (
      student_id,
      course_id,
      status
    )
    VALUES ($1, $2, 'enrolled')
    RETURNING *;
    `,
    [studentId, courseId],
  );

  return result.rows[0];
}

async function getEnrollmentsByStudentId(studentId) {
  const result = await pool.query(
    `
    SELECT
      enrollments.id AS enrollment_id,
      enrollments.status AS enrollment_status,
      enrollments.enrolled_at,
      courses.id AS course_id,
      courses.code,
      courses.title,
      courses.description,
      courses.capacity,
      courses.status AS course_status,
      instructors.full_name AS instructor_name,
      categories.name AS category_name
    FROM enrollments
    JOIN courses
      ON courses.id = enrollments.course_id
    LEFT JOIN instructors
      ON instructors.id = courses.instructor_id
    LEFT JOIN categories
      ON categories.id = courses.category_id
    WHERE enrollments.student_id = $1
      AND enrollments.status = 'enrolled'
    ORDER BY enrollments.enrolled_at DESC;
    `,
    [studentId],
  );

  return result.rows;
}

async function cancelEnrollment(enrollmentId, studentId) {
  const result = await pool.query(
    `
    UPDATE enrollments
    SET
      status = 'cancelled',
      cancelled_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
      AND student_id = $2
      AND status = 'enrolled'
    RETURNING *;
    `,
    [enrollmentId, studentId],
  );

  return result.rows[0] || null;
}

async function getTimetableByStudentId(studentId) {
  const result = await pool.query(
    `
    SELECT
      courses.id AS course_id,
      courses.code,
      courses.title,
      instructors.full_name AS instructor_name,
      course_schedules.id AS schedule_id,
      course_schedules.day_of_week,
      course_schedules.start_time,
      course_schedules.end_time,
      course_schedules.location,
      course_schedules.start_date,
      course_schedules.end_date
    FROM enrollments
    JOIN courses
      ON courses.id = enrollments.course_id
    JOIN course_schedules
      ON course_schedules.course_id = courses.id
    LEFT JOIN instructors
      ON instructors.id = courses.instructor_id
    WHERE enrollments.student_id = $1
      AND enrollments.status = 'enrolled'
    ORDER BY
      course_schedules.day_of_week ASC,
      course_schedules.start_time ASC;
    `,
    [studentId],
  );

  return result.rows;
}

module.exports = {
  findCourseById,
  findActiveEnrollment,
  countActiveEnrollments,
  findTimetableConflict,
  createEnrollment,
  getEnrollmentsByStudentId,
  cancelEnrollment,
  getTimetableByStudentId,
};
