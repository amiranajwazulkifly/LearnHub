const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { uploadAssignmentFile, deleteAssignmentFileByUrl } = require("../utils/fileStorage");

function formatAssignment(row) {
  return {
    id: row.id,
    courseId: row.course_id,
    courseTitle: row.course_title ?? undefined,
    courseCode: row.course_code ?? undefined,
    title: row.title,
    description: row.description,
    points: row.points,
    dueAt: row.due_at,
    attachmentUrl: row.attachment_url,
    attachmentName: row.attachment_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mySubmission:
      row.my_submission_id === undefined
        ? undefined
        : row.my_submission_id
          ? {
              id: row.my_submission_id,
              submittedAt: row.my_submission_submitted_at,
              grade: row.my_submission_grade,
              gradedAt: row.my_submission_graded_at,
            }
          : null,
  };
}

async function assertInstructorOwnsCourse(userId, courseId) {
  const result = await pool.query(
    `
    SELECT c.id
    FROM public.courses c
    JOIN public.instructors i ON i.id = c.instructor_id
    WHERE c.id = $1 AND i.user_id = $2
    `,
    [courseId, userId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(403, "You don't have access to this course");
  }
}

async function assertStudentEnrolled(userId, courseId) {
  const result = await pool.query(
    `
    SELECT id FROM public.enrollments
    WHERE student_id = $1 AND course_id = $2 AND status != 'cancelled'
    `,
    [userId, courseId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(403, "You are not enrolled in this course");
  }
}

async function getAssignmentOwnedByInstructor(userId, assignmentId) {
  const result = await pool.query(
    `
    SELECT a.*
    FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    JOIN public.instructors i ON i.id = c.instructor_id
    WHERE a.id = $1 AND i.user_id = $2
    `,
    [assignmentId, userId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Assignment not found");
  }

  return result.rows[0];
}

// GET /api/assignments/course/:courseId
async function getCourseAssignments(req, res) {
  const { courseId } = req.params;
  const { role, id: userId } = req.user;

  if (role === "instructor") {
    await assertInstructorOwnsCourse(userId, courseId);
  } else if (role === "student") {
    await assertStudentEnrolled(userId, courseId);
  }

  const includeSubmission = role === "student";

  const result = await pool.query(
    `
    SELECT
      a.*,
      c.title AS course_title,
      c.code AS course_code
      ${
        includeSubmission
          ? `,
      s.id AS my_submission_id,
      s.submitted_at AS my_submission_submitted_at,
      s.grade AS my_submission_grade,
      s.graded_at AS my_submission_graded_at`
          : ""
      }
    FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    ${
      includeSubmission
        ? "LEFT JOIN public.assignment_submissions s ON s.assignment_id = a.id AND s.student_id = $2"
        : ""
    }
    WHERE a.course_id = $1
    ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC
    `,
    includeSubmission ? [courseId, userId] : [courseId],
  );

  res.status(200).json({
    success: true,
    message: "Assignments retrieved successfully",
    data: { assignments: result.rows.map(formatAssignment) },
  });
}

// GET /api/assignments/mine  (student — every assignment across enrolled courses)
async function getMyAssignments(req, res) {
  const userId = req.user.id;

  const result = await pool.query(
    `
    SELECT
      a.*,
      c.title AS course_title,
      c.code AS course_code,
      s.id AS my_submission_id,
      s.submitted_at AS my_submission_submitted_at,
      s.grade AS my_submission_grade,
      s.graded_at AS my_submission_graded_at
    FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    JOIN public.enrollments e ON e.course_id = a.course_id AND e.student_id = $1 AND e.status != 'cancelled'
    LEFT JOIN public.assignment_submissions s ON s.assignment_id = a.id AND s.student_id = $1
    ORDER BY a.due_at ASC NULLS LAST, a.created_at DESC
    `,
    [userId],
  );

  res.status(200).json({
    success: true,
    message: "Assignments retrieved successfully",
    data: { assignments: result.rows.map(formatAssignment) },
  });
}

// GET /api/assignments/:id
async function getAssignmentById(req, res) {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const result = await pool.query(
    `
    SELECT a.*, c.title AS course_title, c.code AS course_code
    FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    WHERE a.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Assignment not found");
  }

  const assignment = result.rows[0];

  if (role === "instructor") {
    await assertInstructorOwnsCourse(userId, assignment.course_id);
  } else if (role === "student") {
    await assertStudentEnrolled(userId, assignment.course_id);
  }

  res.status(200).json({
    success: true,
    message: "Assignment retrieved successfully",
    data: { assignment: formatAssignment(assignment) },
  });
}

// POST /api/assignments  (instructor)
async function createAssignment(req, res) {
  const userId = req.user.id;
  const { course_id, title, description, points, due_at } = req.body;

  await assertInstructorOwnsCourse(userId, course_id);

  const uploaded = await uploadAssignmentFile(req.file, "assignments");

  const result = await pool.query(
    `
    INSERT INTO public.assignments
    (course_id, created_by, title, description, points, due_at, attachment_url, attachment_name)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
    `,
    [
      course_id,
      userId,
      title,
      description || null,
      points || null,
      due_at || null,
      uploaded?.url || null,
      uploaded?.name || null,
    ],
  );

  res.status(201).json({
    success: true,
    message: "Assignment created successfully",
    data: { assignment: formatAssignment(result.rows[0]) },
  });
}

// PUT /api/assignments/:id  (instructor)
async function updateAssignment(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, points, due_at, remove_attachment } = req.body;

  const existing = await getAssignmentOwnedByInstructor(userId, id);

  let attachmentUrl = existing.attachment_url;
  let attachmentName = existing.attachment_name;

  if (req.file) {
    const uploaded = await uploadAssignmentFile(req.file, "assignments");
    await deleteAssignmentFileByUrl(existing.attachment_url);
    attachmentUrl = uploaded.url;
    attachmentName = uploaded.name;
  } else if (remove_attachment === "true" || remove_attachment === true) {
    await deleteAssignmentFileByUrl(existing.attachment_url);
    attachmentUrl = null;
    attachmentName = null;
  }

  const result = await pool.query(
    `
    UPDATE public.assignments
    SET
      title = $1,
      description = $2,
      points = $3,
      due_at = $4,
      attachment_url = $5,
      attachment_name = $6,
      updated_at = NOW()
    WHERE id = $7
    RETURNING *;
    `,
    [title, description || null, points || null, due_at || null, attachmentUrl, attachmentName, id],
  );

  res.status(200).json({
    success: true,
    message: "Assignment updated successfully",
    data: { assignment: formatAssignment(result.rows[0]) },
  });
}

// DELETE /api/assignments/:id  (instructor)
async function deleteAssignment(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  const existing = await getAssignmentOwnedByInstructor(userId, id);

  await pool.query("DELETE FROM public.assignments WHERE id = $1", [id]);
  await deleteAssignmentFileByUrl(existing.attachment_url);

  res.status(200).json({
    success: true,
    message: "Assignment deleted successfully",
    data: { assignment: formatAssignment(existing) },
  });
}

module.exports = {
  getCourseAssignments,
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  assertInstructorOwnsCourse,
  assertStudentEnrolled,
  getAssignmentOwnedByInstructor,
};
