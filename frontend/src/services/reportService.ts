// Dzul
import axiosInstance from '../api/axiosInstance';
import type {
  EnrollmentTrendPoint,
  CoursePopularityItem,
  CompletionRateItem,
} from '../types/report';

interface TrendApiResponse {
  data: { trend: EnrollmentTrendPoint[] };
}

interface PopularityApiResponse {
  data: {
    courses: Array<{ id: number; title: string; activeEnrollments: number; totalEnrollments: number }>;
  };
}

interface CompletionApiResponse {
  data: { courses: CompletionRateItem[] };
}

export async function getEnrollmentTrend(days = 30): Promise<EnrollmentTrendPoint[]> {
  const { data } = await axiosInstance.get<TrendApiResponse>('/reports/enrollment-trend', {
    params: { days },
  });
  return data.data.trend;
}

export async function getCoursePopularity(limit = 10): Promise<CoursePopularityItem[]> {
  const { data } = await axiosInstance.get<PopularityApiResponse>('/reports/course-popularity', {
    params: { limit },
  });
  return data.data.courses.map((c) => ({
    id: c.id,
    title: c.title,
    enrollmentCount: c.totalEnrollments,
  }));
}

export async function getCompletionRates(): Promise<CompletionRateItem[]> {
  const { data } = await axiosInstance.get<CompletionApiResponse>('/reports/completion-rates');
  return data.data.courses;
}
