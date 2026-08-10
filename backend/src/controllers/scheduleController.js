const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");

async function getAllSchedules(req, res) {
  const result = await pool.query(`
    SELECT
      course_schedules.*,
      courses.title AS course_title,
      courses.code AS course_code
    FROM course_schedules
    JOIN courses
      ON courses.id = course_schedules.course_id
    ORDER BY course_schedules.created_at DESC;
  `);

  res.status(200).json({
    success: true,
    message: "Schedules retrieved successfully",
    data: { schedules: result.rows },
  });
}

async function createSchedule(req, res) {
  const { course_id, day_of_week, start_time, end_time, location, start_date, end_date } = req.body;

  const result = await pool.query(
    `
    INSERT INTO course_schedules
    (course_id, day_of_week, start_time, end_time, location, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
    [course_id, day_of_week, start_time, end_time, location, start_date, end_date],
  );

  res.status(201).json({
    success: true,
    message: "Schedule created successfully",
    data: { schedule: result.rows[0] },
  });
}

async function updateSchedule(req, res) {
  const { id } = req.params;
  const { course_id, day_of_week, start_time, end_time, location, start_date, end_date } = req.body;

  const result = await pool.query(
    `
    UPDATE course_schedules
    SET
      course_id = $1,
      day_of_week = $2,
      start_time = $3,
      end_time = $4,
      location = $5,
      start_date = $6,
      end_date = $7,
      updated_at = NOW()
    WHERE id = $8
    RETURNING *;
    `,
    [course_id, day_of_week, start_time, end_time, location, start_date, end_date, id],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Schedule not found");
  }

  res.status(200).json({
    success: true,
    message: "Schedule updated successfully",
    data: { schedule: result.rows[0] },
  });
}

async function deleteSchedule(req, res) {
  const { id } = req.params;

  const result = await pool.query(
    `
    DELETE FROM course_schedules
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Schedule not found");
  }

  res.status(200).json({
    success: true,
    message: "Schedule deleted successfully",
    data: { schedule: result.rows[0] },
  });
}

module.exports = {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
