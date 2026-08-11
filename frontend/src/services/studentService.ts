// Dzul
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
  return data.data;
}

export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const { data } = await axiosInstance.get(`/students/${id}`);
  return data.data;
}

export async function getAllEnrollments(page = 1, limit = 20): Promise<AdminEnrollmentListResponse> {
  const { data } = await axiosInstance.get('/admin/enrollments', { params: { page, limit } });
  return data.data;
}

export async function updateEnrollmentStatus(
  id: string,
  status: EnrollmentStatus
): Promise<AdminEnrollmentRow> {
  const { data } = await axiosInstance.patch(`/admin/enrollments/${id}`, { status });
  return data.data.enrollment;
}