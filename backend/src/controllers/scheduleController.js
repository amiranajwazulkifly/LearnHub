const { pool } = require("../config/db");

async function getAllSchedules(req, res) {
  try {
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

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get schedules error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve schedules",
    });
  }
}

async function createSchedule(req, res) {
  try {
    const {
      course_id,
      day_of_week,
      start_time,
      end_time,
      location,
      start_date,
      end_date,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO course_schedules
      (
        course_id,
        day_of_week,
        start_time,
        end_time,
        location,
        start_date,
        end_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        course_id,
        day_of_week,
        start_time,
        end_time,
        location,
        start_date,
        end_date,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create schedule error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create schedule",
    });
  }
}

async function updateSchedule(req, res) {
  try {
    const { id } = req.params;

    const {
      course_id,
      day_of_week,
      start_time,
      end_time,
      location,
      start_date,
      end_date,
    } = req.body;

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
      [
        course_id,
        day_of_week,
        start_time,
        end_time,
        location,
        start_date,
        end_date,
        id,
      ],
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
    console.error("Update schedule error:", error);

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
      DELETE FROM course_schedules
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
    console.error("Delete schedule error:", error);

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
