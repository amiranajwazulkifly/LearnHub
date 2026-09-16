// Dzul
import axiosInstance from '../api/axiosInstance';
import type {
  EnrollmentTrend,
  CoursePopularityItem,
  CompletionRateItem,
  ExportType,
} from '../types/report';

export async function getEnrollmentTrend(days = 30): Promise<EnrollmentTrend> {
  const { data } = await axiosInstance.get('/reports/enrollment-trend', { params: { days } });
  return { trend: data.data.trend, range: data.data.range };
}

export async function getCoursePopularity(limit = 10): Promise<CoursePopularityItem[]> {
  const { data } = await axiosInstance.get('/reports/course-popularity', { params: { limit } });
  return data.data.courses;
}

export async function getCompletionRates(): Promise<CompletionRateItem[]> {
  const { data } = await axiosInstance.get('/reports/completion-rates');
  return data.data.courses;
}
/**
 * Downloads a report as CSV.
 *
 * Fetched through the shared axios instance rather than opening the URL in a
 * new tab, because the endpoint needs the Authorization header — a plain
 * link would arrive unauthenticated. The blob is handed to the browser via a
 * temporary object URL, which is revoked immediately afterwards.
 */
export async function downloadReport(type: ExportType, days?: number): Promise<void> {
  const response = await axiosInstance.get(`/reports/export/${type}`, {
    params: days ? { days } : undefined,
    responseType: 'blob',
  });

  const disposition = String(response.headers['content-disposition'] ?? '');
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `learnhub-${type}.csv`;

  const url = URL.createObjectURL(response.data as Blob);

  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}
