import axiosInstance from "../api/axiosInstance";

export interface Enrollment {
  enrollment_id: string;
  enrollment_status: string;
  enrolled_at: string;
  course_id: string;
  code: string;
  title: string;
  description: string;
  capacity: number;
  course_status: string;
  instructor_name: string;
  category_name: string;
}

interface EnrollmentListResponse {
  success: boolean;
  count: number;
  data: Enrollment[];
}

export async function enrollCourse(courseId: string) {
  const response = await axiosInstance.post("/enrollments", {
    courseId,
  });

  return response.data;
}

export async function getMyCourses(): Promise<EnrollmentListResponse> {
  const response = await axiosInstance.get("/enrollments/my-courses");

  return response.data;
}

export async function cancelEnrollment(enrollmentId: string) {
  const response = await axiosInstance.delete(`/enrollments/${enrollmentId}`);

  return response.data;
}
