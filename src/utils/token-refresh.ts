import { getAuthToken } from '../services/auth';

export interface RefreshResult {
  success: boolean;
  newToken?: string;
  error?: string;
}

export async function autoRefreshToken(): Promise<RefreshResult> {
  try {
    const currentToken = getAuthToken();
    if (!currentToken) {
      return { success: false, error: 'No token available for refresh' };
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error: `Token refresh failed: ${error}` };
    }

    const data = await response.json();
    if (!data.accessToken) {
      return { success: false, error: 'No token in refresh response' };
    }

    // Store new token
    localStorage.setItem('accessToken', data.accessToken);

    return {
      success: true,
      newToken: data.accessToken
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during token refresh'
    };
  }
}

export function withAutoRefresh<T>(fn: () => Promise<T>): Promise<T> {
  return fn().catch(async (error) => {
    // Check if error is due to token expiration
    if (error?.response?.status === 401) {
      const refreshResult = await autoRefreshToken();
      if (refreshResult.success) {
        // Retry original function with new token
        return fn();
      }
    }
    throw error;
  });
}
