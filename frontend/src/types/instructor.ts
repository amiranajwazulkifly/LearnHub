import type { PaginationMeta } from "./api";

export interface Instructor {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  expertise: string;
  biography: string;
  is_active: boolean;
  user_id?: string | null;
  has_login?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface InstructorListResponse {
  instructors: Instructor[];
  pagination: PaginationMeta;
}
