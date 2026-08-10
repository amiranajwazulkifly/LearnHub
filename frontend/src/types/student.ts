// Dzul
import type { PaginationMeta } from './api';

export interface Student {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  enrollmentCount?: number;
}

export interface StudentListResponse {
  students: Student[];
  pagination: PaginationMeta;
}

export type EnrollmentStatus = 'enrolled' | 'completed' | 'cancelled';

export interface StudentEnrollment {
  id: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  courseId: number;
  courseTitle: string;
}

export interface StudentDetail {
  student: Student;
  enrollments: StudentEnrollment[];
}

// Admin-wide enrollment management row (EnrollmentsPage)
export interface AdminEnrollmentRow {
  id: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  studentId: string;
  studentName: string;
  courseId: number;
  courseTitle: string;
}

export interface AdminEnrollmentListResponse {
  enrollments: AdminEnrollmentRow[];
  pagination: PaginationMeta;
}
