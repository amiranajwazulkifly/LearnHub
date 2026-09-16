const { pool } = require("../config/db");
const ApiError = require("../utils/apiError");
const {
  uploadAssignmentFile,
  deleteAssignmentFile,
  createSignedDownloadUrl,
} = require("../utils/fileStorage");
const notifications = require("../services/notificationService");
const {
  assertStudentCanView,
  assertStudentCanSubmit,
  getAssignmentOwnedByInstructor,
} = require("./assignmentController");

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
    // See formatAssignment: downloads go through the authorized endpoint.
    hasAttachment: Boolean(row.attachment_path),
    attachmentName: row.attachment_name,
    submittedAt: row.submitted_at,
    grade: row.grade,
    feedback: row.feedback,
    gradedAt: row.graded_at,
  };
}

// Single definition of submitted/graded/missing, reused by the roster and
// by the instructor assignment list so no two screens can disagree.
function buildSubmissionCounts(rows) {
  return {
    total: rows.length,
    submitted: rows.filter((r) => r.status !== "missing").length,
    graded: rows.filter((r) => r.status === "graded").length,
    missing: rows.filter((r) => r.status === "missing").length,
    ungraded: rows.filter((r) => r.status === "submitted").length,
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
  await assertStudentCanSubmit(userId, assignment.course_id);

  if (!submission_text?.trim() && !submission_link?.trim() && !req.file) {
    throw new ApiError(400, "Submit at least text, a link, or a file");
  }

  const existing = await pool.query(
    "SELECT * FROM public.assignment_submissions WHERE assignment_id = $1 AND student_id = $2",
    [assignmentId, userId],
  );

  let attachmentPath = existing.rows[0]?.attachment_path ?? null;
  let attachmentName = existing.rows[0]?.attachment_name ?? null;

  if (req.file) {
    const uploaded = await uploadAssignmentFile(req.file, "submissions");
    if (existing.rows[0]?.attachment_path) {
      await deleteAssignmentFile(existing.rows[0].attachment_path);
    }
    attachmentPath = uploaded.path;
    attachmentName = uploaded.name;
  }

  // A resubmission clears any existing grade — it was graded against
  // different content, so it shouldn't keep looking "graded" until the
  // instructor reviews the new submission.
  const result = await pool.query(
    `
    INSERT INTO public.assignment_submissions
      (assignment_id, student_id, submission_text, submission_link, attachment_path, attachment_name, submitted_at)
    VALUES ($1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (assignment_id, student_id) DO UPDATE SET
      submission_text = EXCLUDED.submission_text,
      submission_link = EXCLUDED.submission_link,
      attachment_path = EXCLUDED.attachment_path,
      attachment_name = EXCLUDED.attachment_name,
      submitted_at = NOW(),
      grade = NULL,
      feedback = NULL,
      graded_at = NULL,
      graded_by = NULL,
      updated_at = NOW()
    RETURNING *;
    `,
    [assignmentId, userId, submission_text || null, submission_link || null, attachmentPath, attachmentName],
  );

  const student = await pool.query("SELECT full_name FROM public.users WHERE id = $1", [userId]);
  const isResubmission = existing.rows.length > 0;

  await notifications.notifyCourseInstructor(assignment.course_id, {
    type: "submission_received",
    title: `${student.rows[0]?.full_name ?? "A student"} ${
      isResubmission ? "resubmitted" : "submitted"
    } ${assignment.title}`,
    link: `/instructor/assignments/${assignmentId}/submissions`,
  });

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
  const access = await assertStudentCanView(userId, assignment.course_id);

  const result = await pool.query(
    "SELECT * FROM public.assignment_submissions WHERE assignment_id = $1 AND student_id = $2",
    [assignmentId, userId],
  );

  res.status(200).json({
    success: true,
    message: "Submission retrieved successfully",
    data: {
      submission: formatSubmission(result.rows[0]),
      enrollmentStatus: access.status,
      canSubmit: access.isActive,
    },
  });
}

// GET /api/assignments/:id/submissions  (instructor)
//
// The roster is the single source of truth for this assignment's state, and
// every other count in the app is derived the same way:
//
//   * currently-enrolled students always appear, with or without a
//     submission, so "who hasn't handed in" stays visible;
//   * a student who submitted and *later cancelled* still appears, because
//     submitted work is part of the academic record and must remain
//     gradeable — it is flagged so the UI can label it as historical;
//   * a cancelled student who never submitted is simply gone. They aren't
//     "missing" work, they left the course.
async function getSubmissionsForAssignment(req, res) {
  const { id: assignmentId } = req.params;
  const userId = req.user.id;

  const assignment = await getAssignmentOwnedByInstructor(userId, assignmentId);

  const result = await pool.query(
    `
    -- DISTINCT ON keeps one row per student: a student who cancelled and
    -- then re-enrolled has two enrollment rows, and the live one wins.
    SELECT DISTINCT ON (u.id)
      u.id AS student_id,
      u.full_name AS student_name,
      u.email AS student_email,
      e.status AS enrollment_status,
      s.*
    FROM public.enrollments e
    JOIN public.users u ON u.id = e.student_id
    LEFT JOIN public.assignment_submissions s
      ON s.assignment_id = $1 AND s.student_id = e.student_id
    WHERE e.course_id = $2
      AND (e.status <> 'cancelled' OR s.id IS NOT NULL)
    ORDER BY u.id, (e.status <> 'cancelled') DESC, e.enrolled_at DESC
    `,
    [assignmentId, assignment.course_id],
  );

  const rows = result.rows
    .sort((a, b) => a.student_name.localeCompare(b.student_name))
    .map((row) => {
      const submission = formatSubmission(row.id ? row : null);

      let status;
      if (!submission) {
        status = "missing";
      } else if (submission.grade !== null && submission.grade !== undefined) {
        status = "graded";
      } else {
        status = "submitted";
      }

      const isLate =
        Boolean(submission) &&
        Boolean(assignment.due_at) &&
        new Date(submission.submittedAt) > new Date(assignment.due_at);

      return {
        studentId: row.student_id,
        studentName: row.student_name,
        studentEmail: row.student_email,
        enrollmentStatus: row.enrollment_status,
        isHistorical: row.enrollment_status === "cancelled",
        status,
        isLate,
        submission,
      };
    });

  res.status(200).json({
    success: true,
    message: "Submissions retrieved successfully",
    data: {
      points: assignment.points,
      dueAt: assignment.due_at,
      counts: buildSubmissionCounts(rows),
      submissions: rows,
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

  // Only a recorded grade is news to the student; clearing a grade isn't.
  const graded = result.rows[0];
  if (graded.grade !== null) {
    const course = await pool.query("SELECT code FROM public.courses WHERE id = $1", [
      assignment.course_id,
    ]);

    await notifications.notifyUser(graded.student_id, {
      type: "submission_graded",
      title: [
        "Your",
        course.rows[0]?.code,
        `submission for ${assignment.title} was graded`,
      ]
        .filter(Boolean)
        .join(" "),
      body: assignment.points ? `${graded.grade} / ${assignment.points}` : String(graded.grade),
      link: `/student/tasks/${assignmentId}`,
    });
  }

  res.status(200).json({
    success: true,
    message: "Submission graded successfully",
    data: { submission: formatSubmission(result.rows[0]) },
  });
}

// GET /api/assignments/:id/submissions/:submissionId/attachment
// A student's submitted file is visible to exactly two people: the student
// who submitted it, and the instructor who teaches the course. Anyone else,
// including another student in the same class, gets a 404 that doesn't
// confirm the submission exists.
async function getSubmissionAttachment(req, res) {
  const { id: assignmentId, submissionId } = req.params;
  const { role, id: userId } = req.user;

  const result = await pool.query(
    `SELECT s.student_id, s.attachment_path, s.attachment_name, a.course_id
     FROM public.assignment_submissions s
     JOIN public.assignments a ON a.id = s.assignment_id
     WHERE s.id = $1 AND s.assignment_id = $2`,
    [submissionId, assignmentId],
  );

  const submission = result.rows[0];
  const notFound = new ApiError(404, "Submission not found");

  if (!submission) throw notFound;

  if (role === "student") {
    if (submission.student_id !== userId) throw notFound;
  } else if (role === "instructor") {
    // Reuses the ownership check; any failure is reported as not found.
    await getAssignmentOwnedByInstructor(userId, assignmentId).catch(() => {
      throw notFound;
    });
  } else {
    throw notFound;
  }

  if (!submission.attachment_path) {
    throw new ApiError(404, "This submission has no attachment");
  }

  const signed = await createSignedDownloadUrl(
    submission.attachment_path,
    submission.attachment_name,
  );

  res.status(200).json({
    success: true,
    message: "Download link created",
    data: signed,
  });
}

module.exports = {
  getSubmissionAttachment,
  buildSubmissionCounts,
  submitAssignment,
  getMySubmission,
  getSubmissionsForAssignment,
  gradeSubmission,
};
