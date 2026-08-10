// Dzul

export type AnnouncementStatus = 'draft' | 'published' | 'archived';

export interface Announcement {
  id: string;
  title: string;
  content: string;
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
}
