// Dzul

export type AnnouncementStatus = 'draft' | 'published';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  status: AnnouncementStatus;
  author_id: number;
  author_name?: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementInput {
  title: string;
  content: string;
}
