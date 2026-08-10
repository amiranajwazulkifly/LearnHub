export interface InstructorStats {
  courseCount: number;
  studentCount: number;
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
