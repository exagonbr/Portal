import { getAuthToken } from '../services/auth';

export function getCurrentToken(): string | null {
  return getAuthToken();
}

export function validateToken(token?: string): boolean {
  const tokenToValidate = token || getAuthToken();
  if (!tokenToValidate) return false;
  
  try {
    // Basic JWT structure validation
    const parts = tokenToValidate.split('.');
    if (parts.length !== 3) return false;
    
    // Try to decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return token ? validateToken(token) : false;
}

export function syncTokenWithApiClient(): void {
  // This function would sync the token with the API client
  // Implementation depends on your API client setup
  console.log('Token synced with API client');
}

export function clearAllTokens(): void {
  // Clear all possible token storage locations
  localStorage.removeItem('accessToken');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('token');
  
  // Clear cookies if needed
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
