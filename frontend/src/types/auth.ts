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
  address?: string;
  gender?: string;
  nationality?: string;
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

export interface ChangePasswordData {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}
