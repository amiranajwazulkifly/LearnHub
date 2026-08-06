// Dzul
import axiosInstance from '../api/axiosInstance';
import type {
  StudentListResponse,
  StudentDetail,
  AdminEnrollmentRow,
  EnrollmentStatus,
} from '../types/student';

export async function getStudents(search = '', page = 1, limit = 20): Promise<StudentListResponse> {
  const { data } = await axiosInstance.get<StudentListResponse>('/students', {
    params: { search, page, limit },
  });
  return data;
}

export async function getStudentDetail(id: number): Promise<StudentDetail> {
  const { data } = await axiosInstance.get<StudentDetail>(`/students/${id}`);
  return data;
}

export async function getAllEnrollments(): Promise<AdminEnrollmentRow[]> {
  const { data } = await axiosInstance.get<AdminEnrollmentRow[]>('/enrollments');
  return data;
}

export async function updateEnrollmentStatus(
  id: number,
  status: EnrollmentStatus
): Promise<AdminEnrollmentRow> {
  const { data } = await axiosInstance.patch<AdminEnrollmentRow>(`/enrollments/${id}`, { status });
  return data;
}
