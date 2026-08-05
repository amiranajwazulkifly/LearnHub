import type { User } from './user';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface CurrentUserData {
  user: User;
}
