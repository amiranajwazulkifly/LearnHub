// Dzul
// frontend/src/services/studentService.ts
import axiosInstance from '../api/axiosInstance';
import type {
  StudentListResponse,
  StudentDetail,
  AdminEnrollmentRow,
  EnrollmentStatus,
} from '../types/student';

export async function getStudents(search = '', page = 1, limit = 20): Promise<StudentListResponse> {
  const { data } = await axiosInstance.get('/students', { params: { search, page, limit } });
  return data.data; // { students, total, page, limit }
}

export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const { data } = await axiosInstance.get(`/students/${id}`);
  return data.data; // { student, enrollments }
}

// /admin/enrollments, not /enrollments — that path is a teammate's
// student-facing enroll/cancel routes, kept separate to avoid any ambiguity.
export async function getAllEnrollments(): Promise<AdminEnrollmentRow[]> {
  const { data } = await axiosInstance.get('/admin/enrollments');
  return data.data.enrollments;
}

export async function updateEnrollmentStatus(
  id: number,
  status: EnrollmentStatus
): Promise<AdminEnrollmentRow> {
  const { data } = await axiosInstance.patch(`/admin/enrollments/${id}`, { status });
  return data.data.enrollment;
}