// Dzul
import axiosInstance from '../api/axiosInstance';
import type {
  EnrollmentTrendPoint,
  CoursePopularityItem,
  CompletionRateItem,
} from '../types/report';

export async function getEnrollmentTrend(days = 30): Promise<EnrollmentTrendPoint[]> {
  const { data } = await axiosInstance.get<EnrollmentTrendPoint[]>('/reports/enrollment-trend', {
    params: { days },
  });
  return data;
}

export async function getCoursePopularity(limit = 10): Promise<CoursePopularityItem[]> {
  const { data } = await axiosInstance.get<CoursePopularityItem[]>('/reports/course-popularity', {
    params: { limit },
  });
  return data;
}

export async function getCompletionRates(): Promise<CompletionRateItem[]> {
  const { data } = await axiosInstance.get<CompletionRateItem[]>('/reports/completion-rates');
  return data;
}
