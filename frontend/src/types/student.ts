// Dzul
import type { PaginationMeta } from './api';

export interface Student {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  enrollmentCount?: number;
  studentNumber?: string | null;
  programme?: string | null;
  semester?: number | null;
}

export interface StudentListResponse {
  students: Student[];
  pagination: PaginationMeta;
}

export type EnrollmentStatus = 'enrolled' | 'completed' | 'cancelled';

export interface StudentEnrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  courseId: string;
  courseTitle: string;
}

export interface StudentDetail {
  student: Student;
  enrollments: StudentEnrollment[];
}

// Admin-wide enrollment management row (EnrollmentsPage)
export interface AdminEnrollmentRow {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
}

export interface AdminEnrollmentListResponse {
  enrollments: AdminEnrollmentRow[];
  pagination: PaginationMeta;
}
