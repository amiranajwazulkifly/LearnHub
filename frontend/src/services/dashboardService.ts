// Dzul
import axiosInstance from '../api/axiosInstance';
import type { DashboardStats, RecentActivityItem } from '../types/report';

// Every real response looks like: { success, message, data: {...} }
// so we always unwrap response.data.data, not response.data.

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await axiosInstance.get('/dashboard/stats');
  return data.data;
}

export async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const { data } = await axiosInstance.get('/dashboard/recent-activity');
  return data.data.activity;
}