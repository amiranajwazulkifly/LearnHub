import axiosInstance from '../api/axiosInstance';
import type { CourseRoster, InstructorCourse, InstructorStats } from '../types/instructorPortal';

interface StatsResponse {
  data: InstructorStats;
}

interface CoursesResponse {
  data: { courses: InstructorCourse[] };
}

interface RosterResponse {
  data: CourseRoster;
}

export async function getMyStats(): Promise<InstructorStats> {
  const { data } = await axiosInstance.get<StatsResponse>('/instructor-portal/me/stats');
  return data.data;
}

export async function getMyCourses(): Promise<InstructorCourse[]> {
  const { data } = await axiosInstance.get<CoursesResponse>('/instructor-portal/me/courses');
  return data.data.courses;
}

export async function getCourseRoster(courseId: string): Promise<CourseRoster> {
  const { data } = await axiosInstance.get<RosterResponse>(
    `/instructor-portal/me/courses/${courseId}/students`
  );
  return data.data;
}
