export interface InstructorStats {
  courseCount: number;
  studentCount: number;
  activeAssignmentCount: number;
  pendingSubmissionCount: number;
}

export interface InstructorCourse {
  id: string;
  code: string;
  title: string;
  description: string | null;
  capacity: number;
  status: string;
  categoryName: string | null;
  enrolledCount: number;
  assignmentCount: number;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
}

export interface CourseRosterStudent {
  enrollmentId: string;
  status: string;
  enrolledAt: string;
  completedAt: string | null;
  studentId: string;
  fullName: string;
  email: string;
}

export interface CourseRoster {
  course: { id: string; code: string; title: string };
  students: CourseRosterStudent[];
}

export interface RecentSubmission {
  id: string;
  submittedAt: string;
  grade: number | null;
  gradedAt: string | null;

  studentId: string;
  studentName: string;
  studentEmail: string;

  assignmentId: string;
  assignmentTitle: string;

  courseId: string;
  courseCode: string;
  courseTitle: string;
}
