/**
 * Testes de integração para validação de tokens
 */

import { getCurrentToken, validateToken, isAuthenticated, syncTokenWithApiClient } from '../token-validator';
import { apiClient } from '../../lib/api-client';

// Mock do localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock do apiClient
jest.mock('../../lib/api-client', () => ({
  apiClient: {
    setAuthToken: jest.fn(),
    clearAuth: jest.fn(),
  },
}));

describe('Token Validator Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Token Flow Integration', () => {
    it('should handle complete authentication flow', () => {
      // 1. Inicialmente sem token
      expect(getCurrentToken()).toBeNull();
      expect(isAuthenticated().authenticated).toBe(false);

      // 2. Simular login - token válido
      const validToken = createMockJWT({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'SYSTEM_ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600, // Expira em 1 hora
      });

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return validToken;
        return null;
      });

      // 3. Verificar token válido
      const token = getCurrentToken();
      expect(token).toBe(validToken);

      const validation = validateToken(token!);
      expect(validation.isValid).toBe(true);
      expect(validation.isExpired).toBe(false);

      const authStatus = isAuthenticated();
      expect(authStatus.authenticated).toBe(true);
      expect(authStatus.tokenValid).toBe(true);
    });

    it('should handle expired token correctly', () => {
      // Token expirado
      const expiredToken = createMockJWT({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'SYSTEM_ADMIN',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expirou há 1 hora
      });

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return expiredToken;
        return null;
      });

      const token = getCurrentToken();
      expect(token).toBe(expiredToken);

      const validation = validateToken(token!);
      expect(validation.isValid).toBe(false);
      expect(validation.isExpired).toBe(true);

      const authStatus = isAuthenticated();
      expect(authStatus.authenticated).toBe(false);
      expect(authStatus.tokenValid).toBe(false);
      expect(authStatus.needsRefresh).toBe(true);
    });

    it('should handle token that needs refresh', () => {
      // Token que expira em 2 minutos (precisa refresh)
      const tokenNeedingRefresh = createMockJWT({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'SYSTEM_ADMIN',
        exp: Math.floor(Date.now() / 1000) + 120, // Expira em 2 minutos
      });

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return tokenNeedingRefresh;
        return null;
      });

      const token = getCurrentToken();
      const validation = validateToken(token!);
      
      expect(validation.isValid).toBe(true);
      expect(validation.isExpired).toBe(false);
      expect(validation.needsRefresh).toBe(true);

      const authStatus = isAuthenticated();
      expect(authStatus.authenticated).toBe(true);
      expect(authStatus.needsRefresh).toBe(true);
    });

    it('should sync token with apiClient', async () => {
      const validToken = createMockJWT({
        userId: 'test-user',
        email: 'test@example.com',
        role: 'SYSTEM_ADMIN',
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      const result = await syncTokenWithApiClient(validToken);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('auth_token', validToken);
    });

    it('should handle malformed tokens', () => {
      const malformedTokens = [
        'not.a.jwt',
        'invalid-token',
        '',
        'null',
        'undefined',
      ];

      malformedTokens.forEach((malformedToken) => {
        mockLocalStorage.getItem.mockReturnValue(malformedToken);

        const token = getCurrentToken();
        if (token) {
          const validation = validateToken(token);
          expect(validation.isValid).toBe(false);
        }

        const authStatus = isAuthenticated();
        expect(authStatus.authenticated).toBe(false);
      });
    });

    it('should prioritize localStorage over sessionStorage', () => {
      const localToken = 'local-token';
      const sessionToken = 'session-token';

      // Mock sessionStorage
      const mockSessionStorage = {
        getItem: jest.fn().mockReturnValue(sessionToken),
      };
      Object.defineProperty(window, 'sessionStorage', {
        value: mockSessionStorage,
      });

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return localToken;
        return null;
      });

      const token = getCurrentToken();
      expect(token).toBe(localToken);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle storage access errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      expect(() => getCurrentToken()).not.toThrow();
      expect(getCurrentToken()).toBeNull();
    });

    it('should handle JSON parsing errors in token validation', () => {
      // Token com payload inválido
      const invalidPayloadToken = 'header.invalid-base64.signature';
      
      const validation = validateToken(invalidPayloadToken);
      expect(validation.isValid).toBe(false);
      expect(validation.error).toContain('Erro ao decodificar payload');
    });
  });
});

/**
 * Cria um JWT mock para testes
 */
function createMockJWT(payload: any): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = 'mock-signature';
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
