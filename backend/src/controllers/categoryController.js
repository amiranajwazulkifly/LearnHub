const { pool } = require("../config/db");

async function getAllCategories(req, res) {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to retrieve categories",
    });
  }
}

async function createCategory(req, res) {
  try {
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
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create category",
    });
  }
}

async function updateCategory(req, res) {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update category",
    });
  }
}

async function deleteCategory(req, res) {
  try {
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
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
