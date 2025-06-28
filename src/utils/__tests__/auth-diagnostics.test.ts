/**
 * Testes unitários para auth-diagnostics
 */

import { runAuthDiagnostics, clearAllAuthData, testApiConnectivity } from '../auth-diagnostics';

// Mock do window e localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock do document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

// Mock do navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Test Browser',
  },
});

// Mock do location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test',
    hostname: 'localhost',
  },
});

// Mock do fetch
global.fetch = jest.fn();

describe('Auth Diagnostics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSessionStorage.getItem.mockReturnValue(null);
    document.cookie = '';
  });

  describe('runAuthDiagnostics', () => {
    it('should return basic diagnostic info when no token is found', () => {
      const result = runAuthDiagnostics();

      expect(result).toMatchObject({
        timestamp: expect.any(String),
        browser: 'Test Browser',
        url: 'http://localhost:3000/test',
        token: {
          found: false,
        },
        storage: {
          localStorage: {},
          sessionStorage: {},
          cookies: {},
        },
        recommendations: expect.arrayContaining([
          'Nenhum token encontrado - faça login novamente',
        ]),
      });
    });

    it('should detect token in localStorage', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxNjAwMDAwMDAwfQ.test';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return mockToken;
        return null;
      });

      const result = runAuthDiagnostics();

      expect(result.token.found).toBe(true);
      expect(result.token.length).toBe(mockToken.length);
      expect(result.token.source).toBe('localStorage.auth_token');
      expect(result.token.isJWT).toBe(true);
    });

    it('should detect expired token', () => {
      // Token expirado (exp: 1600000000 = 2020)
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxNjAwMDAwMDAwfQ.test';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return expiredToken;
        return null;
      });

      const result = runAuthDiagnostics();

      expect(result.token.found).toBe(true);
      expect(result.token.isExpired).toBe(true);
      expect(result.recommendations).toContain('Token expirado - faça login novamente');
    });

    it('should detect corrupted storage data', () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'null';
        if (key === 'user') return 'undefined';
        return null;
      });

      const result = runAuthDiagnostics();

      expect(result.storage.localStorage).toMatchObject({
        auth_token: {
          isNull: true,
          length: 4,
        },
        user: {
          isUndefined: true,
          length: 9,
        },
      });
    });

    it('should parse cookies correctly', () => {
      document.cookie = 'auth_token=test123; user_data=%7B%22name%22%3A%22test%22%7D; other=value';

      const result = runAuthDiagnostics();

      expect(result.storage.cookies).toMatchObject({
        auth_token: 'test123',
        user_data: '{"name":"test"}',
        other: 'value',
      });
    });
  });

  describe('clearAllAuthData', () => {
    it('should clear all authentication data', () => {
      clearAllAuthData();

      // Verificar localStorage
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('userData');

      // Verificar sessionStorage
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('testApiConnectivity', () => {
    it('should test all API endpoints', async () => {
      // Mock successful responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true }) // health-check
        .mockResolvedValueOnce({ ok: true }) // users/stats
        .mockResolvedValueOnce({ ok: true }); // institutions

      const result = await testApiConnectivity();

      expect(result).toEqual({
        healthCheck: true,
        userStats: true,
        institutions: true,
        errors: [],
      });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle API errors correctly', async () => {
      // Mock failed responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 500 }) // health-check
        .mockResolvedValueOnce({ 
          ok: false, 
          status: 401, 
          text: () => Promise.resolve('Unauthorized') 
        }) // users/stats
        .mockRejectedValueOnce(new Error('Network error')); // institutions

      const result = await testApiConnectivity();

      expect(result).toEqual({
        healthCheck: false,
        userStats: false,
        institutions: false,
        errors: [
          'Health check failed: 500',
          'User stats failed: 401 - Unauthorized',
          'Institutions error: Network error',
        ],
      });
    });

    it('should include authorization header when token is available', async () => {
      const mockToken = 'test-token-123';
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return mockToken;
        return null;
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      await testApiConnectivity();

      // Verificar se o header Authorization foi incluído nas chamadas autenticadas
      const calls = (global.fetch as jest.Mock).mock.calls;
      
      // Health check não deve ter Authorization
      expect(calls[0][1].headers).not.toHaveProperty('Authorization');
      
      // Users stats deve ter Authorization
      expect(calls[1][1].headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
      
      // Institutions deve ter Authorization
      expect(calls[2][1].headers).toHaveProperty('Authorization', `Bearer ${mockToken}`);
    });
  });
});
