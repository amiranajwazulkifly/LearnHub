const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const { uploadAssignmentFile, deleteAssignmentFileByUrl } = require("../utils/fileStorage");
const { assertStudentEnrolled, getAssignmentOwnedByInstructor } = require("./assignmentController");

function formatSubmission(row) {
  if (!row || !row.id) return null;

  return {
    id: row.id,
    assignmentId: row.assignment_id,
    studentId: row.student_id,
    studentName: row.student_name ?? undefined,
    studentEmail: row.student_email ?? undefined,
    submissionText: row.submission_text,
    submissionLink: row.submission_link,
    attachmentUrl: row.attachment_url,
    attachmentName: row.attachment_name,
    submittedAt: row.submitted_at,
    grade: row.grade,
    feedback: row.feedback,
    gradedAt: row.graded_at,
  };
}

async function getAssignmentForAccessCheck(assignmentId) {
  const result = await pool.query("SELECT * FROM public.assignments WHERE id = $1", [assignmentId]);
  if (result.rows.length === 0) {
    throw new ApiError(404, "Assignment not found");
  }
  return result.rows[0];
}

// POST /api/assignments/:id/submit  (student)
async function submitAssignment(req, res) {
  const { id: assignmentId } = req.params;
  const userId = req.user.id;
  const { submission_text, submission_link } = req.body;

  const assignment = await getAssignmentForAccessCheck(assignmentId);
  await assertStudentEnrolled(userId, assignment.course_id);

  if (!submission_text?.trim() && !submission_link?.trim() && !req.file) {
    throw new ApiError(400, "Submit at least text, a link, or a file");
  }

  const existing = await pool.query(
    "SELECT * FROM public.assignment_submissions WHERE assignment_id = $1 AND student_id = $2",
    [assignmentId, userId],
  );

  let attachmentUrl = existing.rows[0]?.attachment_url ?? null;
  let attachmentName = existing.rows[0]?.attachment_name ?? null;

  if (req.file) {
    const uploaded = await uploadAssignmentFile(req.file, "submissions");
    if (existing.rows[0]?.attachment_url) {
      await deleteAssignmentFileByUrl(existing.rows[0].attachment_url);
    }
    attachmentUrl = uploaded.url;
    attachmentName = uploaded.name;
  }

  // A resubmission clears any existing grade — it was graded against
  // different content, so it shouldn't keep looking "graded" until the
  // instructor reviews the new submission.
  const result = await pool.query(
    `
    INSERT INTO public.assignment_submissions
      (assignment_id, student_id, submission_text, submission_link, attachment_url, attachment_name, submitted_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (assignment_id, student_id) DO UPDATE SET
      submission_text = EXCLUDED.submission_text,
      submission_link = EXCLUDED.submission_link,
      attachment_url = EXCLUDED.attachment_url,
      attachment_name = EXCLUDED.attachment_name,
      submitted_at = NOW(),
      grade = NULL,
      feedback = NULL,
      graded_at = NULL,
      graded_by = NULL,
      updated_at = NOW()
    RETURNING *;
    `,
    [assignmentId, userId, submission_text || null, submission_link || null, attachmentUrl, attachmentName],
  );

  res.status(200).json({
    success: true,
    message: "Assignment submitted successfully",
    data: { submission: formatSubmission(result.rows[0]) },
  });
}

// GET /api/assignments/:id/my-submission  (student)
async function getMySubmission(req, res) {
  const { id: assignmentId } = req.params;
  const userId = req.user.id;

  const assignment = await getAssignmentForAccessCheck(assignmentId);
  await assertStudentEnrolled(userId, assignment.course_id);

  const result = await pool.query(
    "SELECT * FROM public.assignment_submissions WHERE assignment_id = $1 AND student_id = $2",
    [assignmentId, userId],
  );

  res.status(200).json({
    success: true,
    message: "Submission retrieved successfully",
    data: { submission: formatSubmission(result.rows[0]) },
  });
}

// GET /api/assignments/:id/submissions  (instructor)
// Every enrolled student, LEFT JOINed to their submission — so students
// who haven't turned anything in still show up (as "missing"), matching
// the Classroom-style "who hasn't submitted" visibility instructors want.
async function getSubmissionsForAssignment(req, res) {
  const { id: assignmentId } = req.params;
  const userId = req.user.id;

  const assignment = await getAssignmentOwnedByInstructor(userId, assignmentId);

  const result = await pool.query(
    `
    SELECT
      u.id AS student_id,
      u.full_name AS student_name,
      u.email AS student_email,
      s.*
    FROM public.enrollments e
    JOIN public.users u ON u.id = e.student_id
    LEFT JOIN public.assignment_submissions s
      ON s.assignment_id = $1 AND s.student_id = e.student_id
    WHERE e.course_id = $2 AND e.status != 'cancelled'
    ORDER BY u.full_name
    `,
    [assignmentId, assignment.course_id],
  );

  res.status(200).json({
    success: true,
    message: "Submissions retrieved successfully",
    data: {
      points: assignment.points,
      submissions: result.rows.map((row) => ({
        studentId: row.student_id,
        studentName: row.student_name,
        studentEmail: row.student_email,
        submission: formatSubmission(row.id ? row : null),
      })),
    },
  });
}

// PATCH /api/assignments/:id/submissions/:submissionId/grade  (instructor)
async function gradeSubmission(req, res) {
  const { id: assignmentId, submissionId } = req.params;
  const userId = req.user.id;
  const { grade, feedback } = req.body;

  const assignment = await getAssignmentOwnedByInstructor(userId, assignmentId);

  if (grade !== null && grade !== undefined && grade !== "") {
    const numericGrade = Number(grade);
    if (Number.isNaN(numericGrade) || numericGrade < 0) {
      throw new ApiError(400, "Grade must be a non-negative number");
    }
    if (assignment.points && numericGrade > assignment.points) {
      throw new ApiError(400, `Grade cannot exceed ${assignment.points} points`);
    }
  }

  const result = await pool.query(
    `
    UPDATE public.assignment_submissions
    SET grade = $1, feedback = $2, graded_at = NOW(), graded_by = $3, updated_at = NOW()
    WHERE id = $4 AND assignment_id = $5
    RETURNING *;
    `,
    [grade === "" ? null : grade, feedback || null, userId, submissionId, assignmentId],
  );

  if (result.rows.length === 0) {
    throw new ApiError(404, "Submission not found");
  }

  res.status(200).json({
    success: true,
    message: "Submission graded successfully",
    data: { submission: formatSubmission(result.rows[0]) },
  });
}

module.exports = {
  submitAssignment,
  getMySubmission,
  getSubmissionsForAssignment,
  gradeSubmission,
};
