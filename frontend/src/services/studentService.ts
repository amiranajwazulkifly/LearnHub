// Dzul
// frontend/src/services/studentService.ts
import axiosInstance from '../api/axiosInstance';
import type {
  StudentListResponse,
  StudentDetail,
  AdminEnrollmentListResponse,
  AdminEnrollmentRow,
  EnrollmentStatus,
} from '../types/student';

export async function getStudents(search = '', page = 1, limit = 20): Promise<StudentListResponse> {
  const { data } = await axiosInstance.get('/students', { params: { search, page, limit } });
  return data.data; // { students, pagination }
}

export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const { data } = await axiosInstance.get(`/students/${id}`);
  return data.data; // { student, enrollments }
}

// /admin/enrollments, not /enrollments — that path is a teammate's
// student-facing enroll/cancel routes, kept separate to avoid any ambiguity.
export async function getAllEnrollments(page = 1, limit = 20): Promise<AdminEnrollmentListResponse> {
  const { data } = await axiosInstance.get('/admin/enrollments', { params: { page, limit } });
  return data.data; // { enrollments, pagination }
}

export async function updateEnrollmentStatus(
  id: number,
  status: EnrollmentStatus
): Promise<AdminEnrollmentRow> {
  const { data } = await axiosInstance.patch(`/admin/enrollments/${id}`, { status });
  return data.data.enrollment;
}