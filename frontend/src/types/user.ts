import type { UserRole } from '../constants/roles';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  // Only present for students.
  address?: string | null;
  gender?: string | null;
  nationality?: string | null;
}