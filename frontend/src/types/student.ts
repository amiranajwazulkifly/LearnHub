// frontend/src/types/student.ts

export interface Student {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
  enrollment_count?: number;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
}

export type EnrollmentStatus = 'active' | 'completed' | 'dropped';

export interface StudentEnrollment {
  id: number;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at: string | null;
  course_id: number;
  title: string;
}

export interface StudentDetail {
  student: Student;
  enrollments: StudentEnrollment[];
}

// Admin-wide enrollment management row (EnrollmentsPage)
export interface AdminEnrollmentRow {
  id: number;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at: string | null;
  student_id: number;
  student_name: string;
  course_id: number;
  course_title: string;
}
