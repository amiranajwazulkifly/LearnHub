const { pool } = require("../config/db");
const { hashPassword } = require("../utils/password");
const ApiError = require("../utils/apiError");
const { parsePagination, buildPaginationMeta } = require("../utils/pagination");

// GET /api/instructors?page=&limit=
async function getAllInstructors(req, res) {
  const { page, limit, offset } = parsePagination(req.query);

  const result = await pool.query(
    `
    SELECT
      instructors.*,
      (instructors.user_id IS NOT NULL) AS has_login
    FROM instructors
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset],
  );

  const countResult = await pool.query("SELECT COUNT(*) FROM instructors");

  res.status(200).json({
    success: true,
    message: "Instructors retrieved successfully",
    data: {
      instructors: result.rows,
      pagination: buildPaginationMeta({ page, limit, total: Number(countResult.rows[0].count) }),
    },
  });
}

async function createInstructor(req, res) {
  const { full_name, email, phone, expertise, biography, is_active } = req.body;

  const result = await pool.query(
    `
    INSERT INTO instructors
    (full_name, email, phone, expertise, biography, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
    [full_name, email, phone || null, expertise || null, biography || null, is_active ?? true],
  );

  res.status(201).json({
    success: true,
    message: "Instructor created successfully",
    data: { instructor: result.rows[0] },
  });
}

async function updateInstructor(req, res) {
  const { id } = req.params;
  const { full_name, email, phone, expertise, biography, is_active } = req.body;

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
    [full_name, email, phone || null, expertise || null, biography || null, is_active, id],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Instructor not found");
  }

  res.status(200).json({
    success: true,
    message: "Instructor updated successfully",
    data: { instructor: result.rows[0] },
  });
}

async function deleteInstructor(req, res) {
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
    throw new ApiError(404, "Instructor not found");
  }

  res.status(200).json({
    success: true,
    message: "Instructor deleted successfully",
    data: { instructor: result.rows[0] },
  });
}

// POST /api/instructors/:id/account  { password }
// Grants (or resets) login access for an existing instructor record by
// creating/updating a linked public.users row with role='instructor'.
// Admin-only — see instructorRoutes.js.
async function setInstructorAccount(req, res) {
  const { id } = req.params;
  const { password } = req.body;

  if (!password || String(password).length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  const instructorResult = await pool.query("SELECT * FROM instructors WHERE id = $1", [id]);

  if (instructorResult.rowCount === 0) {
    throw new ApiError(404, "Instructor not found");
  }

  const instructor = instructorResult.rows[0];
  const passwordHash = await hashPassword(password);

  if (instructor.user_id) {
    // Also revokes any token issued before now, so the instructor's old
    // password stops granting access to already-issued sessions too.
    await pool.query(
      `
      UPDATE users
      SET password_hash = $1, token_valid_after = NOW(), updated_at = NOW()
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

  const existingUser = await pool.query("SELECT id FROM users WHERE lower(email) = lower($1)", [
    instructor.email,
  ]);

  if (existingUser.rowCount > 0) {
    throw new ApiError(
      409,
      "An account with this email already exists. Use a different email on the instructor record before granting login access.",
    );
  }

  const userResult = await pool.query(
    `
    INSERT INTO users (full_name, email, password_hash, role, status)
    VALUES ($1, $2, $3, 'instructor', 'active')
    RETURNING id
    `,
    [instructor.full_name, instructor.email, passwordHash],
  );

  await pool.query("UPDATE instructors SET user_id = $1, updated_at = NOW() WHERE id = $2", [
    userResult.rows[0].id,
    id,
  ]);

  res.status(201).json({
    success: true,
    message: "Instructor login access granted successfully",
    data: { has_login: true },
  });
}

module.exports = {
  getAllInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  setInstructorAccount,
};
