// Dzul
import type { PaginationMeta } from './api';

export type AnnouncementStatus = 'draft' | 'published' | 'archived';
export type AnnouncementAudience = 'all' | 'students' | 'instructors';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: AnnouncementAudience;
  status: AnnouncementStatus;
  createdBy: string;
  authorName?: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
  audience?: AnnouncementAudience;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  pagination: PaginationMeta;
}