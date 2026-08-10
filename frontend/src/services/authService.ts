import axiosInstance from '../api/axiosInstance';

import type { ApiResponse } from '../types/api';

import type {
  AuthData,
  ChangePasswordData,
  ChangePasswordRequest,
  CurrentUserData,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
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
  ): Promise<ChangePasswordData> {
    const response = await axiosInstance.patch<
      ApiResponse<ChangePasswordData>
    >('/auth/password', payload);

    if (!response.data.data) {
      throw new Error(
        'Change password response did not contain a token'
      );
    }

    return response.data.data;
  },

  async logout(): Promise<void> {
    await axiosInstance.post('/auth/logout');
  },

  async forgotPassword(
    payload: ForgotPasswordRequest
  ): Promise<void> {
    await axiosInstance.post(
      '/auth/forgot-password',
      payload
    );
  },

  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<void> {
    await axiosInstance.post(
      '/auth/reset-password',
      payload
    );
  },
};
