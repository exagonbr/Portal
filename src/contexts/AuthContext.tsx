'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/authFetch';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';
import { ROLE_PERMISSIONS, UserRole } from '@/types/roles';
import { buildLoginUrl, buildDashboardUrl, buildUrl } from '../utils/urlBuilder';
import { getDashboardPath } from '@/utils/roleRedirect';
import { isDevelopment } from '../utils/env';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';
import { debugToken, cleanupTokens } from '@/utils/token-debug';
import { UnifiedAuthService } from '@/services/unifiedAuthService';

// Variável de ambiente para controlar o uso do token de teste
const useTestToken = process.env.NEXT_PUBLIC_USE_TEST_TOKEN === 'true' && isDevelopment();

// Função para criar um token de teste com dados de usuário personalizáveis
const createTestToken = (user: Partial<User> = {}): string => {
  const testUser: User = {
    id: user.id || 2,
    name: user.name || 'Test User',
    email: user.email || 'test@sabercon.edu.br',
    role: user.role || UserRole.SYSTEM_ADMIN,
    permissions: user.permissions || Object.keys(ROLE_PERMISSIONS[UserRole.SYSTEM_ADMIN]),
    ...user,
  };

  const payload = {
    ...testUser,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 horas de validade
  };

  // Simula um token JWT (codificação base64, não uma assinatura real)
  return `test-header.${btoa(JSON.stringify(payload))}.test-signature`;
};

// Tipagem para o usuário e o contexto
interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  contact?: {
    phone?: string;
    address?: string;
    educationUnit?: string;
  };
  telefone?: string;
  endereco?: string;
  unidadeEnsino?: string;
  institution_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  handleGoogleLogin: (token: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para decodificar o token e extrair dados do usuário
const decodeToken = (token: string): any | null => {
  try {
    // Verificar se o token é válido antes de tentar decodificar
    if (!token || typeof token !== 'string') {
      console.warn("Token inválido ou não fornecido:", token);
      return null;
    }

    // Verificar se o token tem o formato JWT (3 partes separadas por pontos)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn("Token não tem formato JWT válido (deve ter 3 partes):", {
        parts: parts.length,
        tokenPreview: token.substring(0, 50) + '...'
      });
      
      // Tentar decodificar como token base64 simples
      try {
        const decoded = atob(token);
        const parsed = JSON.parse(decoded);
        if (parsed && typeof parsed === 'object') {
          console.log("Token decodificado como base64 simples:", parsed);
          return parsed;
        }
      } catch (base64Error) {
        console.warn("Falha ao decodificar como base64:", base64Error);
      }
      
      return null;
    }

    // Tentar decodificar como JWT
    const decoded = jwtDecode(token);
    
    // Verificar se o payload decodificado tem estrutura básica esperada
    if (!decoded || typeof decoded !== 'object') {
      console.error("Token decodificado não tem estrutura válida:", decoded);
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

// Helper para verificar se um token decodificado é válido
const isValidDecodedToken = (decodedToken: any): boolean => {
  if (!decodedToken || typeof decodedToken !== 'object') {
    return false;
  }

  // Verificar se tem propriedades mínimas necessárias
  const hasRequiredFields = decodedToken.id || decodedToken.email || decodedToken.role;
  
  if (!hasRequiredFields) {
    console.warn("Token decodificado não tem campos obrigatórios:", decodedToken);
    return false;
  }

  return true;
};

// Helper para acessar localStorage de forma segura
const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('accessToken');
  } catch (error) {
    console.error('Error accessing localStorage:', error);
    return null;
  }
};

const setStoredToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('accessToken', token);
  } catch (error) {
    console.error('Error setting localStorage:', error);
  }
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Função para limpar tokens inválidos
const clearInvalidTokens = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verificar se o token tem formato válido
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Token inválido encontrado no localStorage, removendo...', {
          parts: parts.length,
          tokenPreview: token.substring(0, 50) + '...'
        });
        localStorage.removeItem('accessToken');
      }
    }
  } catch (error) {
    console.error('Erro ao limpar tokens inválidos:', error);
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const initializationRef = useRef(false);
  
  // Debug: monitorar mudanças no estado do usuário
  useEffect(() => {
    console.log('AuthProvider: User state changed:', {
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.role,
      userEmail: user?.email,
      isLoading,
      isClient
    });
  }, [user, isLoading, isClient]);
  
  // Hook para limpeza de cache

  const isAuthenticated = !!user;

  // Detectar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função de logout centralizada
  const logout = useCallback(async () => {
    console.log('Starting logout process...');
    setIsLoggingOut(true);

    try {
      // Obter dados antes de limpar
      const token = UnifiedAuthService.getAccessToken();
      const sessionId = UnifiedAuthService.getSessionId();

      // Chamar API de logout
      if (token) {
        apiClient.post('/auth/logout').catch(err => console.error("Logout API call failed:", err));
      }

      // Limpar dados de todos os locais (localStorage, cookies, Redis)
      await UnifiedAuthService.clearAuthData(sessionId || undefined, token || undefined);
      
      // Limpar outros dados não relacionados à autenticação
      await clearAllDataForUnauthorized();
      
      console.log('✅ Logout concluído - dados limpos de todos os locais');
      
      setUser(null);
      apiClient.defaults.headers.common['Authorization'] = '';
      
      router.push(buildLoginUrl());
      toast.success('Até a próxima!');
      
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      // Forçar limpeza mesmo com erro
      setUser(null);
      apiClient.defaults.headers.common['Authorization'] = '';
      router.push(buildLoginUrl());
    } finally {
      // Reseta o estado após a conclusão
      setIsLoggingOut(false);
    }
  }, [router]);

  // Função para validar e configurar usuário a partir do token
  const setupUserFromToken = useCallback((token: string): boolean => {
    console.log('AuthProvider: setupUserFromToken called with token:', {
      hasToken: !!token,
      tokenType: typeof token,
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 50) + '...'
    });

    // Debug detalhado em desenvolvimento
    if (isDevelopment()) {
      debugToken(token);
    }

    const decodedPayload = decodeToken(token);
    
    if (!decodedPayload || !isValidDecodedToken(decodedPayload)) {
      console.log('AuthProvider: Failed to decode token or token is invalid, removing from storage');
      removeStoredToken();
      return false;
    }

    // Verificar se o token está expirado
    const isExpired = decodedPayload.exp && decodedPayload.exp * 1000 <= Date.now();
    if (isExpired) {
      console.log('AuthProvider: Token expired, removing from storage');
      removeStoredToken();
      return false;
    }

    console.log('AuthProvider: Token decoded successfully:', {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
      exp: decodedPayload.exp ? new Date(decodedPayload.exp * 1000).toISOString() : 'No expiration'
    });

    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser({
      id: decodedPayload.id || 0,
      name: decodedPayload.name || 'Usuário',
      email: decodedPayload.email || '',
      role: decodedPayload.role as UserRole || UserRole.STUDENT,
      permissions: decodedPayload.permissions || [],
    });
    
    console.log('AuthProvider: User set from token successfully');
    return true;
  }, []);

  // Efeito de inicialização único - executa apenas uma vez quando o cliente está pronto
  useEffect(() => {
    if (!isClient || initializationRef.current) {
      return;
    }

    initializationRef.current = true;
    console.log('AuthProvider: Initializing authentication check');

    try {
      // Primeiro, limpar tokens inválidos
      clearInvalidTokens();
      
      // Debug: verificar estado do localStorage
      if (isDevelopment()) {
        cleanupTokens();
      }
      
      const token = getStoredToken();
      
      if (token) {
        console.log('AuthProvider: Token found, validating...');
        const success = setupUserFromToken(token);
        console.log('AuthProvider: Token validation result:', success);
      } else if (useTestToken) {
        console.log('AuthProvider: No token found, using test token');
        const testToken = createTestToken({
          name: 'Admin Teste',
          role: UserRole.SYSTEM_ADMIN,
        });
        setStoredToken(testToken);
        const success = setupUserFromToken(testToken);
        console.log('AuthProvider: Test token setup result:', success);
      } else {
        console.log('AuthProvider: No token found');
      }
    } catch (error) {
      console.error("Error during auth initialization:", error);
    } finally {
      console.log('AuthProvider: Setting isLoading to false');
      setIsLoading(false);
    }
  }, [isClient, setupUserFromToken]);

  // Função de login
  const login = async (email: string, password: string) => {
    if (!isClient) return;

    setIsLoading(true);

    try {
      console.log('🔐 Fazendo login via API...');
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.data) {
        const { accessToken, refreshToken, user: userData } = response.data.data;
        
        // Configurar o header de autorização
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Decodificar o token para obter informações do usuário
        const decodedToken = decodeToken(accessToken);
        
        if (!decodedToken || !isValidDecodedToken(decodedToken)) {
          console.error('❌ Erro: Token não pôde ser decodificado ou é inválido');
          throw new Error('Token inválido recebido do servidor');
        }
        
        // Configurar o usuário no estado com valores padrão seguros
        const user: User = {
          id: userData.id || decodedToken.id || 0,
          name: userData.name || decodedToken.name || 'Usuário',
          email: userData.email || decodedToken.email || '',
          role: userData.role || decodedToken.role || UserRole.STUDENT,
          permissions: userData.permissions || decodedToken.permissions || [],
          telefone: userData.telefone || undefined,
          endereco: userData.endereco || undefined,
          unidadeEnsino: userData.unidadeEnsino || undefined,
          institution_name: userData.institution_name || decodedToken.institution_name || undefined
        };
        
        // Salvar dados em todos os locais usando o serviço unificado
        const authData = {
          accessToken,
          refreshToken: refreshToken || accessToken, // Fallback se não houver refresh token
          user: {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions,
            institution_name: user.institution_name
          },
          expiresIn: decodedToken.exp ? decodedToken.exp - Math.floor(Date.now() / 1000) : 60 * 60 * 24
        };

        const saveResult = await UnifiedAuthService.saveAuthData(authData);
        
        if (saveResult.success) {
          console.log('✅ Dados salvos em todos os locais com sessão:', saveResult.sessionId);
        } else {
          console.warn('⚠️ Erro ao salvar dados:', saveResult.message);
          // Continuar mesmo com erro, dados já estão no contexto
        }
        
        setUser(user);
        
        console.log('✅ Login realizado com sucesso!', user);
        toast.success('Login realizado com sucesso!');
        
        // Redirecionar para o dashboard apropriado
        const targetPath = getDashboardPath(user.role);
        console.log('🎯 Redirecionando para dashboard:', targetPath);
        
        if (targetPath) {
          // Usar caminho relativo para evitar problemas com URLs absolutas
          router.push(targetPath);
        } else {
          console.warn('⚠️ Caminho do dashboard não encontrado, usando fallback');
          router.push('/dashboard');
        }
      } else {
        throw new Error(response.data.message || 'Falha no login');
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      
      let errorMessage = 'Falha no login. Verifique suas credenciais.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (token: string) => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      
      const { data } = await apiClient.post('/auth/google-login', { token });
      const { accessToken } = data.data;
      
      setStoredToken(accessToken);
      
      if (setupUserFromToken(accessToken)) {
        toast.success('Login com Google realizado com sucesso!');
        
        // Decodificar token com verificação de segurança
        const decoded = decodeToken(accessToken);
        if (!decoded || !isValidDecodedToken(decoded) || !decoded.role) {
          console.error('❌ Erro: Token do Google não pôde ser decodificado, é inválido ou não tem role');
          throw new Error('Token inválido recebido do servidor Google');
        }
        
        const targetPath = getDashboardPath(decoded.role);
        console.log('🎯 Redirecionando Google login para:', targetPath);
        
        if (targetPath) {
          router.push(targetPath);
        } else {
          console.warn('⚠️ Caminho do dashboard não encontrado para Google login, usando fallback');
          router.push('/dashboard');
        }
      } else {
        throw new Error('Token inválido recebido do servidor');
      }
    } catch (error: any) {
      console.error("Google login failed:", error);
      const message = error.response?.data?.message || 'Falha no login com Google.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    loading: isLoading,
    error: null, // Placeholder, será implementado no futuro
    isLoggingOut,
    login,
    logout,
    handleGoogleLogin,
    refreshUser: async () => {
      const token = getStoredToken();
      if (token) {
        setupUserFromToken(token);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar o contexto de autenticação
 * 
 * Renomeado para useAuthSafe para corresponder ao uso no código que causou o erro.
 */
export const useAuthSafe = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthSafe must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook para usar o contexto de autenticação
 * 
 * Alias para useAuthSafe para manter compatibilidade com componentes que importam useAuth
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

