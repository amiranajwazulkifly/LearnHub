export interface AssignmentSubmissionSummary {
  id: string;
  submittedAt: string;
  grade: number | string | null;
  gradedAt: string | null;
}

export interface Assignment {
  id: string;
  courseId: string;
  courseTitle?: string;
  courseCode?: string;
  title: string;
  description: string | null;
  points: number | null;
  dueAt: string | null;
  /** Files are private; download via the signed-link endpoints. */
  hasAttachment: boolean;
  attachmentName: string | null;
  createdAt: string;
  updatedAt: string;
  // Present only when fetched by a student — their own submission for this
  // assignment, or null if they haven't submitted yet.
  mySubmission?: AssignmentSubmissionSummary | null;

  // Present only on the single-assignment fetch, for a student. Reflects the
  // enrollment backing this access: a cancelled enrollment keeps read access
  // to the record but sets canSubmit to false.
  enrollmentStatus?: EnrollmentStatus;
  canSubmit?: boolean;

  // Present only for instructors/admins, on assignment lists.
  counts?: AssignmentCounts;
}

export type EnrollmentStatus = "enrolled" | "cancelled" | "completed";

export type SubmissionStatus = "submitted" | "graded" | "missing";

export interface AssignmentCounts {
  submitted: number;
  graded: number;
  missing: number;
  ungraded: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submissionText: string | null;
  submissionLink: string | null;
  /** Files are private; download via the signed-link endpoints. */
  hasAttachment: boolean;
  attachmentName: string | null;
  submittedAt: string;
  grade: number | string | null;
  feedback: string | null;
  gradedAt: string | null;
}

export interface SubmissionRosterEntry {
  studentId: string;
  studentName: string;
  studentEmail: string;
  /** The enrollment behind this row — 'cancelled' means a historical record. */
  enrollmentStatus: EnrollmentStatus;
  /** True when the student has left the course but their work remains. */
  isHistorical: boolean;
  status: SubmissionStatus;
  /** Submitted after the assignment's due date. */
  isLate: boolean;
  submission: Submission | null;
}

export interface SubmissionRoster {
  points: number | null;
  dueAt: string | null;
  counts: AssignmentCounts & { total: number };
  submissions: SubmissionRosterEntry[];
}

export interface AssignmentFormInput {
  course_id?: string;
  title: string;
  description?: string;
  points?: string;
  due_at?: string;
  attachment?: File | null;
  remove_attachment?: boolean;
}
