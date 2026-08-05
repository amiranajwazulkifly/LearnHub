const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  'http://localhost:5001/api';

export const env = {
  apiBaseUrl,
} as const;
