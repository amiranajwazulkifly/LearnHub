import { create } from 'zustand';

import { authService } from '../services/authService';

import type {
  LoginRequest,
  RegisterRequest,
} from '../types/auth';

import type { User } from '../types/user';

import { authStorage } from '../utils/storage';
import { getErrorMessage } from '../utils/errorHandler';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  register: (
    payload: RegisterRequest
  ) => Promise<User>;

  login: (
    payload: LoginRequest
  ) => Promise<User>;

  initializeAuth: () => Promise<void>;

  logout: () => Promise<void>;

  clearError: () => void;
}

const storedToken = authStorage.getToken();

export const useAuthStore = create<AuthState>(
  (set, get) => ({
    user: null,
    token: storedToken,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    error: null,

    register: async (payload) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const data =
          await authService.register(payload);

        authStorage.setToken(data.token);

        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });

        return data.user;
      } catch (error) {
        const message = getErrorMessage(error);

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    login: async (payload) => {
      set({
        isLoading: true,
        error: null,
      });

      try {
        const data =
          await authService.login(payload);

        authStorage.setToken(data.token);

        set({
          user: data.user,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });

        return data.user;
      } catch (error) {
        const message = getErrorMessage(error);

        authStorage.removeToken();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: message,
        });

        throw error;
      }
    },

    initializeAuth: async () => {
      const token = authStorage.getToken();

      if (!token) {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });

        return;
      }

      set({
        isLoading: true,
        error: null,
      });

      try {
        const data =
          await authService.getCurrentUser();

        set({
          user: data.user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        authStorage.removeToken();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
          error: getErrorMessage(error),
        });
      }
    },

    logout: async () => {
      const token = get().token;

      try {
        if (token) {
          await authService.logout();
        }
      } finally {
        authStorage.removeToken();

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },
  })
);
