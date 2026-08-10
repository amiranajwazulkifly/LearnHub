const { pool } = require("../config/db");
const { hashPassword } = require("../utils/password");

async function getAllInstructors(req, res) {
  try {
    const result = await pool.query(
      `
      SELECT
        instructors.*,
        (instructors.user_id IS NOT NULL) AS has_login
      FROM instructors
      ORDER BY created_at DESC
      `,
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

// POST /api/instructors/:id/account  { password }
// Grants (or resets) login access for an existing instructor record by
// creating/updating a linked public.users row with role='instructor'.
// Admin-only — see instructorRoutes.js.
async function setInstructorAccount(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const instructorResult = await pool.query(
      "SELECT * FROM instructors WHERE id = $1",
      [id],
    );

    if (instructorResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Instructor not found",
      });
    }

    const instructor = instructorResult.rows[0];
    const passwordHash = await hashPassword(password);

    if (instructor.user_id) {
      await pool.query(
        `
        UPDATE users
        SET password_hash = $1, updated_at = NOW()
        WHERE id = $2
        `,
        [passwordHash, instructor.user_id],
      );

      return res.status(200).json({
        success: true,
        message: "Instructor password reset successfully",
        data: { has_login: true },
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE lower(email) = lower($1)",
      [instructor.email],
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists. Use a different email on the instructor record before granting login access.",
      });
    }

    const userResult = await pool.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, status)
      VALUES ($1, $2, $3, 'instructor', 'active')
      RETURNING id
      `,
      [instructor.full_name, instructor.email, passwordHash],
    );

    await pool.query(
      "UPDATE instructors SET user_id = $1, updated_at = NOW() WHERE id = $2",
      [userResult.rows[0].id, id],
    );

    res.status(201).json({
      success: true,
      message: "Instructor login access granted successfully",
      data: { has_login: true },
    });
  } catch (error) {
    console.error("Set instructor account error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to set up instructor login access",
    });
  }
}

module.exports = {
  getAllInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  setInstructorAccount,
};
