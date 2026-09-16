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


export interface LoadErrorCopy {
  title: string;
  description: string;
  /** Retrying a 403/404 will just fail again, so the button is hidden. */
  canRetry: boolean;
}

/**
 * Translates a failed GET into user-facing copy.
 *
 * Distinguishes the cases a reader actually cares about — it's gone, you
 * can't see it, or the request itself failed — instead of collapsing them
 * into one "failed to load" line. Never returns a server-supplied string
 * for 5xx, where the message may leak backend detail.
 */
export function describeLoadError(
  error: unknown,
  subject = "this item"
): LoadErrorCopy {
  const status = axios.isAxiosError(error)
    ? error.response?.status
    : undefined;

  if (status === 404) {
    return {
      title: `${capitalize(subject)} not found`,
      description: `This ${subject} may have been removed or is no longer available.`,
      canRetry: false,
    };
  }

  if (status === 403) {
    return {
      title: `${capitalize(subject)} unavailable`,
      description: `You may no longer have access to this ${subject}. If you left the course, ask your instructor to restore your enrollment.`,
      canRetry: false,
    };
  }

  if (status === 401) {
    return {
      title: 'Your session has expired',
      description: 'Please log in again to continue.',
      canRetry: false,
    };
  }

  if (status && status >= 500) {
    return {
      title: 'Something went wrong',
      description: `We couldn't load this ${subject} because the server ran into a problem. Please try again in a moment.`,
      canRetry: true,
    };
  }

  // No response at all — network down, request blocked, or timed out.
  return {
    title: `Couldn't load ${subject}`,
    description:
      'Check your connection and try again. If the problem continues, the service may be temporarily unavailable.',
    canRetry: true,
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
