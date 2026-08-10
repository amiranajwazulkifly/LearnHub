// Dzul
import axiosInstance from '../api/axiosInstance'; // Nabil's shared file
import type { DashboardStats, RecentActivityItem } from '../types/report';

interface StatsApiResponse {
  data: {
    totalStudents: number;
    totalInstructors: number;
    totalCourses: number;
    totalActiveEnrollments: number;
  };
}

interface RecentActivityApiResponse {
  data: {
    activity: Array<{
      id: number;
      studentName: string;
      courseTitle: string;
      status: string;
      enrolledAt: string;
    }>;
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosInstance.get<StatsApiResponse>('/dashboard/stats');
  const stats = data.data;

  return {
    totalStudents: stats.totalStudents,
    totalInstructors: stats.totalInstructors,
    totalCourses: stats.totalCourses,
    totalEnrollments: stats.totalActiveEnrollments,
  };
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const { data } = await axiosInstance.get<RecentActivityApiResponse>('/dashboard/recent-activity');

  return data.data.activity.map((item) => ({
    id: item.id,
    student_name: item.studentName,
    course_title: item.courseTitle,
    enrolled_at: item.enrolledAt,
  }));
}
