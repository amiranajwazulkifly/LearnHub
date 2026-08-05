import axiosInstance from '../api/axiosInstance';

import type { ApiResponse } from '../types/api';

import type {
  AuthData,
  ChangePasswordRequest,
  CurrentUserData,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '../types/auth';

import type { User } from '../types/user';

export const authService = {
  async register(
    payload: RegisterRequest
  ): Promise<AuthData> {
    const response = await axiosInstance.post<
      ApiResponse<AuthData>
    >('/auth/register', payload);

    if (!response.data.data) {
      throw new Error(
        'Registration response did not contain authentication data'
      );
    }

    return response.data.data;
  },

  async login(
    payload: LoginRequest
  ): Promise<AuthData> {
    const response = await axiosInstance.post<
      ApiResponse<AuthData>
    >('/auth/login', payload);

    if (!response.data.data) {
      throw new Error(
        'Login response did not contain authentication data'
      );
    }

    return response.data.data;
  },

  async getCurrentUser(): Promise<CurrentUserData> {
    const response = await axiosInstance.get<
      ApiResponse<CurrentUserData>
    >('/auth/me');

    if (!response.data.data) {
      throw new Error(
        'User response did not contain user data'
      );
    }

    return response.data.data;
  },

  async updateProfile(
    payload: UpdateProfileRequest
  ): Promise<User> {
    const response = await axiosInstance.patch<
      ApiResponse<CurrentUserData>
    >('/auth/me', payload);

    if (!response.data.data?.user) {
      throw new Error(
        'Profile response did not contain user data'
      );
    }

    return response.data.data.user;
  },

  async changePassword(
    payload: ChangePasswordRequest
  ): Promise<void> {
    await axiosInstance.patch(
      '/auth/password',
      payload
    );
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },
};
