// Dzul
import axiosInstance from '../api/axiosInstance';
import type {
  EnrollmentTrendPoint,
  CoursePopularityItem,
  CompletionRateItem,
} from '../types/report';

export async function getEnrollmentTrend(days = 30): Promise<EnrollmentTrendPoint[]> {
  const { data } = await axiosInstance.get('/reports/enrollment-trend', { params: { days } });
  return data.data.trend;
}

export async function getCoursePopularity(limit = 10): Promise<CoursePopularityItem[]> {
  const { data } = await axiosInstance.get('/reports/course-popularity', { params: { limit } });
  return data.data.courses;
}

export async function getCompletionRates(): Promise<CompletionRateItem[]> {
  const { data } = await axiosInstance.get('/reports/completion-rates');
  return data.data.courses;
}