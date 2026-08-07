const { pool } = require("../config/db");

async function getAllCourses(req, res) {
  try {
    const { search, category, instructor, level } = req.query;

    let query = `
      SELECT
        courses.*,
        categories.name AS category_name,
        instructors.full_name AS instructor_name
      FROM courses
      JOIN categories
        ON categories.id = courses.category_id
      JOIN instructors
        ON instructors.id = courses.instructor_id
      WHERE 1=1
    `;

    const values = [];
    let index = 1;

    if (search) {
      query += ` AND courses.title ILIKE $${index}`;
      values.push(`%${search}%`);
      index++;
    }

    if (category) {
      query += ` AND categories.name ILIKE $${index}`;
      values.push(`%${category}%`);
      index++;
    }

    if (instructor) {
      query += ` AND instructors.full_name ILIKE $${index}`;
      values.push(`%${instructor}%`);
      index++;
    }

    if (level) {
      query += ` AND courses.level ILIKE $${index}`;
      values.push(`%${level}%`);
      index++;
    }

    query += " ORDER BY courses.id ASC";

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve courses",
    });
  }
}

async function getCourseById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT
        courses.*,
        categories.name AS category_name,
        instructors.full_name AS instructor_name
      FROM courses
      JOIN categories
        ON categories.id = courses.category_id
      JOIN instructors
        ON instructors.id = courses.instructor_id
      WHERE courses.id = $1;
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve course",
    });
  }
}

async function createCourse(req, res) {
  try {
    const {
      title,
      description,
      price,
      duration,
      level,
      category_id,
      instructor_id,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO courses
      (
        title,
        description,
        price,
        duration,
        level,
        category_id,
        instructor_id
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *;
      `,
      [title, description, price, duration, level, category_id, instructor_id],
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to create course",
    });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      price,
      duration,
      level,
      category_id,
      instructor_id,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE courses
      SET
        title = $1,
        description = $2,
        price = $3,
        duration = $4,
        level = $5,
        category_id = $6,
        instructor_id = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *;
      `,
      [
        title,
        description,
        price,
        duration,
        level,
        category_id,
        instructor_id,
        id,
      ],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update course",
    });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM courses
      WHERE id = $1
      RETURNING *;
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
