import type { PaginationMeta } from "./api";

export interface CourseListResponse {
  courses: Course[];
  pagination: PaginationMeta;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string | null;

  category_id: string | null;
  instructor_id: string | null;

  capacity: number;
  status: string;

  created_by?: string | null;
  created_at?: string;
  updated_at?: string;

  category_name?: string;
  instructor_name?: string;
}
