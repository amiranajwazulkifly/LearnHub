const { pool } = require("../config/db");

async function getAllSchedules(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        schedules.*,
        courses.title AS course_title
      FROM schedules
      JOIN courses
        ON courses.id = schedules.course_id
      ORDER BY schedules.id ASC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve schedules",
    });
  }
}

async function createSchedule(req, res) {
  try {
    const { course_id, day_of_week, start_time, end_time, room } = req.body;

    const result = await pool.query(
      `
      INSERT INTO schedules
      (
        course_id,
        day_of_week,
        start_time,
        end_time,
        room
      )
      VALUES
      ($1,$2,$3,$4,$5)
      RETURNING *;
      `,
      [course_id, day_of_week, start_time, end_time, room],
    );

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create schedule",
    });
  }
}

async function updateSchedule(req, res) {
  try {
    const { id } = req.params;

    const { course_id, day_of_week, start_time, end_time, room } = req.body;

    const result = await pool.query(
      `
      UPDATE schedules
      SET
        course_id = $1,
        day_of_week = $2,
        start_time = $3,
        end_time = $4,
        room = $5,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *;
      `,
      [course_id, day_of_week, start_time, end_time, room, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
    });
  }
}

async function deleteSchedule(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM schedules
      WHERE id = $1
      RETURNING *;
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Schedule deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
    });
  }
}

module.exports = {
  getAllSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
};
