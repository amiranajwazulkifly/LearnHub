import type { UserRole } from '../constants/roles';

export type UserStatus =
  | 'active'
  | 'inactive'
  | 'suspended';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;

  // Student-only. Academic details are managed by the institution and shown
  // read-only.
  studentNumber?: string | null;
  programme?: string | null;
  semester?: number | null;
  phone?: string | null;
  address?: string | null;
  gender?: string | null;
  nationality?: string | null;

  // Instructor-only, from the linked instructors directory row.
  expertise?: string | null;
  biography?: string | null;
  isActiveInstructor?: boolean;
  courseCount?: number;
  studentCount?: number;
}
