// Dzul
import axiosInstance from '../api/axiosInstance'; // Nabil's shared file
import type { DashboardStats, RecentActivityItem } from '../types/report';

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosInstance.get<DashboardStats>('/dashboard/stats');
  return data;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const { data } = await axiosInstance.get<RecentActivityItem[]>('/dashboard/recent-activity');
  return data;
}
