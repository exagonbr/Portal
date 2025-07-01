import { getAuthToken } from '../services/auth';

export interface DebugLoginResult {
  success: boolean;
  token?: string;
  user?: any;
  error?: string;
}

export async function debugLogin(email: string, password: string): Promise<DebugLoginResult> {
  try {
    console.log('🔐 Debug Login Attempt:', { email, password: '***' });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    console.log('📡 Login Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = errorData.message || `Login failed with status ${response.status}`;
      console.error('❌ Login Error:', error);
      return { success: false, error };
    }

    const data = await response.json();
    console.log('✅ Login Success:', { 
      hasToken: !!data.data?.accessToken,
      hasUser: !!data.data?.user 
    });

    // Store token if provided
    if (data.data?.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
    }

    return {
      success: true,
      token: data.data?.accessToken,
      user: data.data?.user
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Debug Login Exception:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export function debugCurrentAuth(): void {
  console.group('🔍 Current Auth State');
  
  const token = getAuthToken();
  console.log('Token Present:', !!token);
  
  if (token) {
    console.log('Token Preview:', token.substring(0, 20) + '...');
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('Token Payload:', {
          exp: payload.exp ? new Date(payload.exp * 1000) : 'No expiration',
          iat: payload.iat ? new Date(payload.iat * 1000) : 'No issued at',
          user: payload.name || payload.email || 'No user info'
        });
      }
    } catch (e) {
      console.warn('Could not decode token payload');
    }
  }
  
  // Check localStorage
  const storageKeys = ['accessToken', 'auth_token', 'token'];
  storageKeys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`localStorage.${key}:`, value ? 'Present' : 'Not found');
  });
  
  console.groupEnd();
}

export function clearDebugAuth(): void {
  console.log('🧹 Clearing all auth data for debug...');
  
  // Clear localStorage
  ['accessToken', 'auth_token', 'token', 'user'].forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Clear sessionStorage
  ['accessToken', 'auth_token', 'token', 'user'].forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  console.log('✅ Auth data cleared');
}
