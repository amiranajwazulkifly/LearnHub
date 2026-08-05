import axios from 'axios';

import type {
  ApiErrorResponse,
  ApiValidationError,
} from '../types/api';

export function getErrorMessage(
  error: unknown
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      'The request could not be completed'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

export function getValidationErrors(
  error: unknown
): ApiValidationError[] {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.errors || [];
  }

  return [];
}
