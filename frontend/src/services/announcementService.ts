// Dzul
import axiosInstance from '../api/axiosInstance';
import type { Announcement, CreateAnnouncementInput } from '../types/announcement';

export async function getAllAnnouncements(): Promise<Announcement[]> {
  const { data } = await axiosInstance.get('/announcements');
  return data.data.announcements;
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const { data } = await axiosInstance.get('/announcements/published');
  return data.data.announcements;
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.get(`/announcements/${id}`);
  return data.data.announcement;
}

export async function createAnnouncement(payload: CreateAnnouncementInput): Promise<Announcement> {
  const { data } = await axiosInstance.post('/announcements', payload);
  return data.data.announcement;
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<CreateAnnouncementInput>
): Promise<Announcement> {
  const { data } = await axiosInstance.patch(`/announcements/${id}`, payload);
  return data.data.announcement;
}

export async function publishAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.patch(`/announcements/${id}/publish`);
  return data.data.announcement;
}

export async function archiveAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.patch(`/announcements/${id}/archive`);
  return data.data.announcement;
}

export async function moveAnnouncementToDraft(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.patch(`/announcements/${id}/draft`);
  return data.data.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await axiosInstance.delete(`/announcements/${id}`);
}