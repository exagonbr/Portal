import { getAuthToken } from '../services/auth';
import { getCurrentToken, validateToken, isAuthenticated } from './token-validator';

export interface AuthDiagnosticResult {
  isAuthenticated: boolean;
  hasToken: boolean;
  tokenValid: boolean;
  tokenSource: string | null;
  apiConnectivity: boolean;
  errors: string[];
  warnings: string[];
}

export async function runAuthDiagnostics(): Promise<AuthDiagnosticResult> {
  const result: AuthDiagnosticResult = {
    isAuthenticated: false,
    hasToken: false,
    tokenValid: false,
    tokenSource: null,
    apiConnectivity: false,
    errors: [],
    warnings: []
  };

  try {
    // Check if user is authenticated
    result.isAuthenticated = isAuthenticated();

    // Check for token presence
    const token = getCurrentToken();
    result.hasToken = !!token;

    if (token) {
      // Validate token
      result.tokenValid = validateToken(token);
      
      // Determine token source
      if (localStorage.getItem('accessToken')) {
        result.tokenSource = 'localStorage.accessToken';
      } else if (localStorage.getItem('auth_token')) {
        result.tokenSource = 'localStorage.auth_token';
      } else if (localStorage.getItem('token')) {
        result.tokenSource = 'localStorage.token';
      } else if (sessionStorage.getItem('accessToken')) {
        result.tokenSource = 'sessionStorage.accessToken';
      } else {
        result.tokenSource = 'cookies or other';
      }
    }

    // Test API connectivity
    result.apiConnectivity = await testApiConnectivity();

    // Generate warnings and errors
    if (!result.hasToken) {
      result.errors.push('No authentication token found');
    } else if (!result.tokenValid) {
      result.errors.push('Authentication token is invalid or expired');
    }

    if (!result.apiConnectivity) {
      result.warnings.push('API connectivity test failed');
    }

  } catch (error) {
    result.errors.push(`Diagnostic error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
}

export async function testApiConnectivity(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch (error) {
    console.warn('API connectivity test failed:', error);
    return false;
  }
}

export function clearAllAuthData(): void {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('systemSettings');

  // Clear sessionStorage
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('auth_token');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');

  // Clear cookies
  const cookies = ['accessToken', 'auth_token', 'token', 'session'];
  cookies.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
  });

  console.log('All authentication data cleared');
}

export function debugAuth(): void {
  runAuthDiagnostics().then(result => {
    console.group('🔍 Auth Diagnostics');
    console.log('Is Authenticated:', result.isAuthenticated);
    console.log('Has Token:', result.hasToken);
    console.log('Token Valid:', result.tokenValid);
    console.log('Token Source:', result.tokenSource);
    console.log('API Connectivity:', result.apiConnectivity);
    
    if (result.errors.length > 0) {
      console.error('Errors:', result.errors);
    }
    
    if (result.warnings.length > 0) {
      console.warn('Warnings:', result.warnings);
    }
    
    console.groupEnd();
  });
}
