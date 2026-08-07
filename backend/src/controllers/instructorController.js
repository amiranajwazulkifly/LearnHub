const { pool } = require("../config/db");

async function getAllInstructors(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM instructors ORDER BY created_at DESC",
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Get instructors error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructors",
    });
  }
}

async function createInstructor(req, res) {
  try {
    const { full_name, email, phone, expertise, biography, is_active } =
      req.body;

    const result = await pool.query(
      `
      INSERT INTO instructors
      (
        full_name,
        email,
        phone,
        expertise,
        biography,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `,
      [
        full_name,
        email,
        phone || null,
        expertise || null,
        biography || null,
        is_active ?? true,
      ],
    );

    res.status(201).json({
      success: true,
      message: "Instructor created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create instructor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create instructor",
    });
  }
}

async function updateInstructor(req, res) {
  try {
    const { id } = req.params;

    const { full_name, email, phone, expertise, biography, is_active } =
      req.body;

    const result = await pool.query(
      `
      UPDATE instructors
      SET
        full_name = $1,
        email = $2,
        phone = $3,
        expertise = $4,
        biography = $5,
        is_active = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *;
      `,
      [
        full_name,
        email,
        phone || null,
        expertise || null,
        biography || null,
        is_active,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Instructor updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update instructor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update instructor",
    });
  }
}

async function deleteInstructor(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM instructors
      WHERE id = $1
      RETURNING *;
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Instructor deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Delete instructor error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete instructor",
    });
  }
}

module.exports = {
  getAllInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
};
