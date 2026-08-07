// Dzul
import { z } from 'zod';

export const announcementSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  content: z
    .string()
    .min(1, 'Content is required'),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
