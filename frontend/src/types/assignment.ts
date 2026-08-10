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
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  updatedAt: string;
  // Present only when fetched by a student — their own submission for this
  // assignment, or null if they haven't submitted yet.
  mySubmission?: AssignmentSubmissionSummary | null;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  submissionText: string | null;
  submissionLink: string | null;
  attachmentUrl: string | null;
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
  submission: Submission | null;
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
