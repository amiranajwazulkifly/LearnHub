const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");

async function getAllCategories(req, res) {
  const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");

  res.status(200).json({
    success: true,
    message: "Categories retrieved successfully",
    data: { categories: result.rows },
  });
}

async function createCategory(req, res) {
  const { name, description } = req.body;

  const result = await pool.query(
    `
    INSERT INTO categories (name, description)
    VALUES ($1, $2)
    RETURNING *
    `,
    [name, description],
  );

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category: result.rows[0] },
  });
}

async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  const result = await pool.query(
    `
    UPDATE categories
    SET name = $1,
        description = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
    `,
    [name, description, id],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: { category: result.rows[0] },
  });
}

async function deleteCategory(req, res) {
  const { id } = req.params;

  const result = await pool.query(
    `
    DELETE FROM categories
    WHERE id = $1
    RETURNING *;
    `,
    [id],
  );

  if (result.rowCount === 0) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: { category: result.rows[0] },
  });
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
