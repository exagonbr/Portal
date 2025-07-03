import { getAuthToken } from '@/services/auth';

const createAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const authHeaders = createAuthHeaders();
  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};