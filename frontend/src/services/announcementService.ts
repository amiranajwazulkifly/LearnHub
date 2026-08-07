// Dzul
import axiosInstance from '../api/axiosInstance';
import type { Announcement, CreateAnnouncementInput } from '../types/announcement';

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const { data } = await axiosInstance.get<Announcement[]>('/announcements');
  return data;
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const { data } = await axiosInstance.get<Announcement[]>('/announcements/published');
  return data;
}

export async function getAnnouncement(id: number): Promise<Announcement> {
  const { data } = await axiosInstance.get<Announcement>(`/announcements/${id}`);
  return data;
}

export async function createAnnouncement(payload: CreateAnnouncementInput): Promise<Announcement> {
  const { data } = await axiosInstance.post<Announcement>('/announcements', payload);
  return data;
}

export async function updateAnnouncement(
  id: number,
  payload: Partial<CreateAnnouncementInput>
): Promise<Announcement> {
  const { data } = await axiosInstance.patch<Announcement>(`/announcements/${id}`, payload);
  return data;
}

export async function publishAnnouncement(id: number): Promise<Announcement> {
  const { data } = await axiosInstance.patch<Announcement>(`/announcements/${id}/publish`);
  return data;
}

export async function unpublishAnnouncement(id: number): Promise<Announcement> {
  const { data } = await axiosInstance.patch<Announcement>(`/announcements/${id}/unpublish`);
  return data;
}

export async function deleteAnnouncement(id: number): Promise<void> {
  await axiosInstance.delete(`/announcements/${id}`);
}
