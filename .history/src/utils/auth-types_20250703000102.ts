/**
 * Tipos para o sistema de autenticação
 */

export interface LoginDebugInfo {
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasUserData: boolean;
  tokenInfo?: {
    exp?: number;
    iat?: number;
    userId?: string;
    email?: string;
    role?: string;
  };
  cookies: string[];
}

export interface AuthDiagnosticResult {
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
  details: {
    tokenStatus: 'valid' | 'expired' | 'invalid' | 'missing';
    storageStatus: 'ok' | 'partial' | 'empty';
    networkStatus: 'unknown' | 'online' | 'offline';
    browserCompatibility: 'supported' | 'limited' | 'unsupported';
  };
  timestamp: string;
}

export interface SimpleAuthDiagnostic {
  hasAuth: boolean;
  hasAccessToken: boolean;
  hasRefreshToken: boolean;
  hasUserData: boolean;
  tokenInfo?: {
    isExpired: boolean;
    expiresIn?: string;
    role?: string;
    email?: string;
  };
  cookies: number;
  issues: string[];
  recommendations: string[];
}