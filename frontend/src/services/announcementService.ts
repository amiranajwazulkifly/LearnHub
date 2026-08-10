// Dzul
import axiosInstance from '../api/axiosInstance';
import type { Announcement, AnnouncementListResponse, CreateAnnouncementInput } from '../types/announcement';

interface ListApiResponse {
  data: AnnouncementListResponse;
}

interface PublishedListApiResponse {
  data: { announcements: Announcement[] };
}

interface OneApiResponse {
  data: { announcement: Announcement };
}

export async function getAllAnnouncements(page = 1, limit = 20): Promise<AnnouncementListResponse> {
  const { data } = await axiosInstance.get<ListApiResponse>('/announcements', { params: { page, limit } });
  return data.data;
}

export async function getPublishedAnnouncements(): Promise<Announcement[]> {
  const { data } = await axiosInstance.get<PublishedListApiResponse>('/announcements/published');
  return data.data.announcements;
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.get<OneApiResponse>(`/announcements/${id}`);
  return data.data.announcement;
}

export async function createAnnouncement(payload: CreateAnnouncementInput): Promise<Announcement> {
  const { data } = await axiosInstance.post<OneApiResponse>('/announcements', payload);
  return data.data.announcement;
}

export async function updateAnnouncement(
  id: string,
  payload: Partial<CreateAnnouncementInput>
): Promise<Announcement> {
  const { data } = await axiosInstance.patch<OneApiResponse>(`/announcements/${id}`, payload);
  return data.data.announcement;
}

export async function publishAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.patch<OneApiResponse>(`/announcements/${id}/publish`);
  return data.data.announcement;
}

// The backend models a 3-state lifecycle (draft/published/archived), not a
// binary publish toggle — "unpublishing" a published announcement archives it.
export async function archiveAnnouncement(id: string): Promise<Announcement> {
  const { data } = await axiosInstance.patch<OneApiResponse>(`/announcements/${id}/archive`);
  return data.data.announcement;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await axiosInstance.delete(`/announcements/${id}`);
}
