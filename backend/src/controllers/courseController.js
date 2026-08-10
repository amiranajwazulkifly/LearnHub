const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");

// Translates known Postgres error codes into an ApiError so callers can
// just `throw` and let asyncHandler + errorMiddleware format the response.
// Anything unrecognized re-throws as-is and falls through to the generic
// 500 handler in errorMiddleware.
function translateCourseDatabaseError(error) {
  if (error.code === "23505" && error.constraint === "courses_code_unique") {
    return new ApiError(409, "A course with this code already exists");
  }

  if (error.code === "23503") {
    if (error.constraint === "courses_category_id_fkey") {
      return new ApiError(400, "Category not found");
    }
    if (error.constraint === "courses_instructor_id_fkey") {
      return new ApiError(400, "Instructor not found");
    }
  }

  if (error.code === "22P02") {
    return new ApiError(400, "One of the submitted values has an invalid format");
  }

  if (error.code === "23514") {
    return new ApiError(400, "One of the submitted values does not satisfy course rules");
  }

  return error;
}

async function getAllCourses(req, res) {
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
    message: "Courses retrieved successfully",
    data: {
      courses: result.rows,
      count: result.rows.length,
    },
  });
}

// LEFT JOINs so a course missing a category and/or instructor is still
// fetchable — an earlier duplicate definition of this function (now
// removed) used inner JOINs and would silently 404 for such courses.
async function getCourseById(req, res) {
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
    throw new ApiError(404, "Course not found");
  }

  res.status(200).json({
    success: true,
    message: "Course retrieved successfully",
    data: { course: result.rows[0] },
  });
}

async function createCourse(req, res) {
  const { code, title, description, category_id, instructor_id, capacity, status } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO courses
      (code, title, description, category_id, instructor_id, capacity, status)
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
      data: { course: result.rows[0] },
    });
  } catch (error) {
    throw translateCourseDatabaseError(error);
  }
}

async function updateCourse(req, res) {
  const { id } = req.params;
  const { code, title, description, category_id, instructor_id, capacity, status } = req.body;

  try {
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
      [code, title, description || null, category_id || null, instructor_id || null, capacity, status, id],
    );

    if (result.rowCount === 0) {
      throw new ApiError(404, "Course not found");
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: { course: result.rows[0] },
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw translateCourseDatabaseError(error);
  }
}

async function deleteCourse(req, res) {
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
    throw new ApiError(404, "Course not found");
  }

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
    data: { course: result.rows[0] },
  });
}

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};
