// Dzul
import { z } from 'zod';

export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(180, 'Title must be 180 characters or fewer'),
  content: z.string().min(1, 'Content is required'),
  audience: z.enum(['all', 'students', 'instructors']).optional(),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;