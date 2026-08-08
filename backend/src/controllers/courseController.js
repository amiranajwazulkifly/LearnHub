const { pool } = require("../config/db");

function handleCourseDatabaseError(error, res, actionLabel) {
  if (error.code === "23505" && error.constraint === "courses_code_unique") {
    return res.status(409).json({
      success: false,
      message: "A course with this code already exists",
    });
  }

  if (error.code === "23503") {
    if (error.constraint === "courses_category_id_fkey") {
      return res.status(400).json({
        success: false,
        message: "Category not found",
      });
    }

    if (error.constraint === "courses_instructor_id_fkey") {
      return res.status(400).json({
        success: false,
        message: "Instructor not found",
      });
    }
  }

  if (error.code === "22P02") {
    return res.status(400).json({
      success: false,
      message: "One of the submitted values has an invalid format",
    });
  }

  if (error.code === "23514") {
    return res.status(400).json({
      success: false,
      message: "One of the submitted values does not satisfy course rules",
    });
  }

  console.error(`${actionLabel} error:`, error);

  return res.status(500).json({
    success: false,
    message: `Failed to ${actionLabel.toLowerCase()}`,
  });
}

async function getAllCourses(req, res) {
  try {
    const { search, category, instructor, status } = req.query;

    let query = `
      SELECT
        courses.*,
        categories.name AS category_name,
        instructors.full_name AS instructor_name
      FROM courses
      LEFT JOIN categories
        ON categories.id = courses.category_id
      LEFT JOIN instructors
        ON instructors.id = courses.instructor_id
      WHERE 1=1
    `;

    const values = [];
    let index = 1;

    if (search) {
      query += `
        AND (
          courses.title ILIKE $${index}
          OR courses.code ILIKE $${index}
        )
      `;
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

    if (status) {
      query += ` AND courses.status::text ILIKE $${index}`;
      values.push(`%${status}%`);
      index++;
    }

    query += " ORDER BY courses.created_at DESC";

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get courses error:", error);

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
      code,
      title,
      description,
      category_id,
      instructor_id,
      capacity,
      status,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO courses
      (
        code,
        title,
        description,
        category_id,
        instructor_id,
        capacity,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
      `,
      [
        code,
        title,
        description || null,
        category_id || null,
        instructor_id || null,
        capacity ?? 30,
        status || "draft",
      ],
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return handleCourseDatabaseError(error, res, "Create course");
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;

    const {
      code,
      title,
      description,
      category_id,
      instructor_id,
      capacity,
      status,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE courses
      SET
        code = $1,
        title = $2,
        description = $3,
        category_id = $4,
        instructor_id = $5,
        capacity = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *;
      `,
      [
        code,
        title,
        description || null,
        category_id || null,
        instructor_id || null,
        capacity,
        status,
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
    return handleCourseDatabaseError(error, res, "Update course");
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
    console.error("Delete course error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
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
      LEFT JOIN categories
        ON categories.id = courses.category_id
      LEFT JOIN instructors
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
    console.error("Get course error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve course",
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
