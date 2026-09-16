const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const {
  uploadAssignmentFile,
  deleteAssignmentFile,
  createSignedDownloadUrl,
} = require("../utils/fileStorage");
const notifications = require("../services/notificationService");

// Per-assignment tallies for instructor-facing lists. These deliberately
// mirror the roster rule in submissionController.getSubmissionsForAssignment
// so the assignment list and the submissions page can never disagree:
//   submitted — every real submission, including from students who have
//               since cancelled (the work still exists and is gradeable)
//   graded    — those with a grade recorded
//   missing   — currently-enrolled students with nothing turned in
const ASSIGNMENT_COUNT_COLUMNS = `
  (
    SELECT COUNT(*) FROM public.assignment_submissions sub
    WHERE sub.assignment_id = a.id
  ) AS submitted_count,
  (
    SELECT COUNT(*) FROM public.assignment_submissions sub
    WHERE sub.assignment_id = a.id AND sub.grade IS NOT NULL
  ) AS graded_count,
  (
    SELECT COUNT(DISTINCT en.student_id)
    FROM public.enrollments en
    WHERE en.course_id = a.course_id
      AND en.status <> 'cancelled'
      AND NOT EXISTS (
        SELECT 1 FROM public.assignment_submissions sub
        WHERE sub.assignment_id = a.id AND sub.student_id = en.student_id
      )
  ) AS missing_count
`;

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
    // Never a URL: files live in a private bucket and are fetched through
    // GET /api/assignments/:id/attachment, which authorizes and signs.
    hasAttachment: Boolean(row.attachment_path),
    attachmentName: row.attachment_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    counts:
      row.submitted_count === undefined
        ? undefined
        : {
            submitted: Number(row.submitted_count),
            graded: Number(row.graded_count),
            missing: Number(row.missing_count),
            ungraded: Number(row.submitted_count) - Number(row.graded_count),
          },
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

// Course access for a student, split deliberately into two levels.
//
// Cancelling an enrollment removes *active* access (you can no longer turn
// work in), but it must not erase the academic record: a student who
// submitted while enrolled keeps read access to that assignment, its grade
// and its feedback. Returns the enrollment status so callers can surface a
// read-only banner rather than a dead end.
async function getStudentCourseAccess(userId, courseId) {
  const result = await pool.query(
    `
    SELECT status
    FROM public.enrollments
    WHERE student_id = $1 AND course_id = $2
    ORDER BY (status <> 'cancelled') DESC, enrolled_at DESC
    LIMIT 1
    `,
    [userId, courseId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(403, "You are not enrolled in this course");
  }

  const status = result.rows[0].status;

  return { status, isActive: status !== "cancelled" };
}

// Read access — any enrollment record, current or historical.
async function assertStudentCanView(userId, courseId) {
  return getStudentCourseAccess(userId, courseId);
}

// Write access — submitting requires a live enrollment.
async function assertStudentCanSubmit(userId, courseId) {
  const access = await getStudentCourseAccess(userId, courseId);

  if (!access.isActive) {
    throw new ApiError(
      403,
      "Your enrollment in this course is no longer active, so you can't submit new work",
    );
  }

  return access;
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
    await assertStudentCanView(userId, courseId);
  }

  const includeSubmission = role === "student";
  const includeCounts = role === "instructor" || role === "admin";

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
      ${includeCounts ? `, ${ASSIGNMENT_COUNT_COLUMNS}` : ""}
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

  let access = null;

  if (role === "instructor") {
    await assertInstructorOwnsCourse(userId, assignment.course_id);
  } else if (role === "student") {
    access = await assertStudentCanView(userId, assignment.course_id);
  }

  res.status(200).json({
    success: true,
    message: "Assignment retrieved successfully",
    data: {
      assignment: {
        ...formatAssignment(assignment),
        // Lets the student page render a read-only notice instead of an
        // enabled submit form for a course they've left.
        enrollmentStatus: access ? access.status : undefined,
        canSubmit: access ? access.isActive : undefined,
      },
    },
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
    (course_id, created_by, title, description, points, due_at, attachment_path, attachment_name)
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
      uploaded?.path || null,
      uploaded?.name || null,
    ],
  );

  const created = result.rows[0];
  const course = await pool.query("SELECT code FROM public.courses WHERE id = $1", [course_id]);

  await notifications.notifyCourseStudents(course_id, {
    type: "assignment_posted",
    title: `${created.title} was posted in ${course.rows[0]?.code ?? "your course"}`,
    body: created.due_at ? `Due ${new Date(created.due_at).toISOString()}` : null,
    link: `/student/tasks/${created.id}`,
  });

  res.status(201).json({
    success: true,
    message: "Assignment created successfully",
    data: { assignment: formatAssignment(created) },
  });
}

// PUT /api/assignments/:id  (instructor)
async function updateAssignment(req, res) {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, description, points, due_at, remove_attachment } = req.body;

  const existing = await getAssignmentOwnedByInstructor(userId, id);

  let attachmentPath = existing.attachment_path;
  let attachmentName = existing.attachment_name;

  if (req.file) {
    const uploaded = await uploadAssignmentFile(req.file, "assignments");
    await deleteAssignmentFile(existing.attachment_path);
    attachmentPath = uploaded.path;
    attachmentName = uploaded.name;
  } else if (remove_attachment === "true" || remove_attachment === true) {
    await deleteAssignmentFile(existing.attachment_path);
    attachmentPath = null;
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
      attachment_path = $5,
      attachment_name = $6,
      updated_at = NOW()
    WHERE id = $7
    RETURNING *;
    `,
    [title, description || null, points || null, due_at || null, attachmentPath, attachmentName, id],
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
  await deleteAssignmentFile(existing.attachment_path);

  res.status(200).json({
    success: true,
    message: "Assignment deleted successfully",
    data: { assignment: formatAssignment(existing) },
  });
}

// GET /api/assignments/:id/attachment
// A short-lived download link for the instructor's attachment, for anyone
// entitled to see the assignment itself.
async function getAssignmentAttachment(req, res) {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  const result = await pool.query(
    "SELECT course_id, attachment_path, attachment_name FROM public.assignments WHERE id = $1",
    [id],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Assignment not found");
  }

  const assignment = result.rows[0];

  if (role === "instructor") {
    await assertInstructorOwnsCourse(userId, assignment.course_id);
  } else if (role === "student") {
    await assertStudentCanView(userId, assignment.course_id);
  }

  if (!assignment.attachment_path) {
    throw new ApiError(404, "This assignment has no attachment");
  }

  const signed = await createSignedDownloadUrl(
    assignment.attachment_path,
    assignment.attachment_name,
  );

  res.status(200).json({
    success: true,
    message: "Download link created",
    data: signed,
  });
}

module.exports = {
  getAssignmentAttachment,
  getCourseAssignments,
  getMyAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  assertInstructorOwnsCourse,
  getStudentCourseAccess,
  assertStudentCanView,
  assertStudentCanSubmit,
  getAssignmentOwnedByInstructor,
};
