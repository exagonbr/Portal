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
import { usePersistentSession } from '@/hooks/usePersistentSession';


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
    // Armazenar o token em todas as chaves possíveis para compatibilidade
    localStorage.setItem('accessToken', token);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    
    // Definir também em cookies para requisições do servidor
    document.cookie = `accessToken=${token}; path=/; max-age=86400; SameSite=Lax`;
    document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
  } catch (error) {
    console.error('Error setting token storage:', error);
  }
};

const removeStoredToken = (): void => {
  if (typeof window === 'undefined') return;
  try {
    // Remover de todas as chaves possíveis
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    
    // Remover também de sessionStorage
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('authToken');
    
    // Limpar cookies
    document.cookie = 'accessToken=; path=/; max-age=0';
    document.cookie = 'auth_token=; path=/; max-age=0';
  } catch (error) {
    console.error('Error removing from storage:', error);
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
    console.log('🔓 Iniciando processo de logout completo...');
    setIsLoggingOut(true);

    try {
      // 1. Primeiro notificar o backend sobre o logout
      const token = getStoredToken();
      if (token) {
        try {
          await apiClient.post('/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000 // Timeout de 5 segundos para não travar
          });
          console.log('✅ Backend notificado sobre logout');
        } catch (error) {
          console.warn('⚠️ Erro ao notificar backend sobre logout (ignorando):', error);
        }
      }

      // 2. Limpar dados de autenticação completos
      await clearAllDataForUnauthorized();
      
      // 3. Limpar estado do contexto
      setUser(null);
      apiClient.defaults.headers.common['Authorization'] = '';
      
      // 4. Mostrar mensagem de sucesso
      toast.success('Até a próxima!');
      
      // 5. Redirecionar para login usando window.location para garantir limpeza completa
      const loginUrl = buildLoginUrl({ logout: 'true' });
      console.log('🔄 Redirecionando para:', loginUrl);
      
      // Usar window.location.href para garantir que todos os dados sejam limpos
      if (typeof window !== 'undefined') {
        window.location.href = loginUrl;
      } else {
        router.push(loginUrl);
      }
      
    } catch (error) {
      console.error('❌ Erro durante logout:', error);
      
      // Limpeza de emergência se algo deu errado
      try {
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          
          // Limpar cookies manualmente
          document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
          });
        }
        
        setUser(null);
        apiClient.defaults.headers.common['Authorization'] = '';
        
        // Redirecionar mesmo com erro
        const loginUrl = buildLoginUrl({ logout: 'error' });
        if (typeof window !== 'undefined') {
          window.location.href = loginUrl;
        } else {
          router.push(loginUrl);
        }
      } catch (emergencyError) {
        console.error('❌ Erro na limpeza de emergência:', emergencyError);
        // Como último recurso, simplesmente recarregar a página
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login?logout=emergency';
        }
      }
    }
    // Nota: Não resetamos isLoggingOut aqui porque vamos redirecionar
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
    let retryCount = 0;
    const maxRetries = 2;

    const attemptLogin = async (): Promise<any> => {
      try {
        // CORREÇÃO: Verificar conectividade com o servidor antes de tentar login
        try {
          const pingResponse = await apiClient.get('/health', { timeout: 5000 });
          if (!pingResponse.data || pingResponse.status !== 200) {
            console.warn('⚠️ Servidor não respondeu ao health check corretamente:', pingResponse);
          } else {
            console.log('✅ Servidor respondeu ao health check:', pingResponse.data);
          }
        } catch (pingError) {
          console.warn('⚠️ Erro ao verificar conectividade com o servidor:', pingError);
          // Não interrompe o fluxo, apenas loga o erro
        }
        
        // CORREÇÃO: Aumentar o timeout para 60 segundos para evitar timeout prematuro
        const loginPromise = apiClient.post('/users/login', { email, password }, { 
          timeout: 60000 // Garantir que o timeout seja respeitado também pelo axios
        });
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Tempo limite excedido')), 60000)
        );
        
        const response = await Promise.race([loginPromise, timeoutPromise]) as any;
        
        // CORREÇÃO: Verificar se a resposta é válida antes de prosseguir
        if (!response || !response.data) {
          throw new Error('Resposta inválida do servidor');
        }
        
        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken, user: userData } = response.data.data;
          
          console.log('🔍 [AuthContext] Dados recebidos da API:', {
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            hasUser: !!userData,
            tokenPreview: accessToken ? accessToken.substring(0, 50) + '...' : 'N/A'
          });
          
          // Verificar se o token existe antes de prosseguir
          if (!accessToken) {
            throw new Error('Token não foi retornado pelo servidor');
          }
          
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
          
          // CORREÇÃO: Salvar dados sem aguardar o UnifiedAuthService para evitar travamento
          try {
            const authData = {
              accessToken,
              refreshToken: refreshToken || accessToken,
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

            // Salvar de forma assíncrona sem bloquear
            UnifiedAuthService.saveAuthData(authData).then((saveResult) => {
              if (saveResult.success) {
                console.log('✅ Dados salvos em todos os locais com sessão:', saveResult.sessionId);
              } else {
                console.warn('⚠️ Erro ao salvar dados:', saveResult.message);
              }
            }).catch((error) => {
              console.warn('⚠️ Erro ao salvar dados UnifiedAuth:', error);
            });
          } catch (saveError) {
            console.warn('⚠️ Erro no UnifiedAuthService, continuando com login:', saveError);
          }
          
          // CORREÇÃO: Definir o usuário antes de qualquer redirecionamento
          setUser(user);
          setIsLoading(false); // Garantir que isLoading seja atualizado imediatamente
          
          console.log('✅ Login realizado com sucesso!', user);
          toast.success('Login realizado com sucesso!');
          
          // CORREÇÃO: Simplificar redirecionamento para evitar travamento
          const targetPath = getDashboardPath(user.role);
          console.log('🎯 Redirecionando para dashboard:', targetPath);
          
          if (targetPath) {
            console.log('🔄 [AuthContext] Chamando router.push para:', targetPath);
            
            // CORREÇÃO: Usar timeout para garantir que o estado seja atualizado antes do redirect
            setTimeout(() => {
              router.push(targetPath);
            }, 100);
          } else {
            console.warn('⚠️ Caminho do dashboard não encontrado, usando fallback');
            setTimeout(() => {
              router.push('/dashboard');
            }, 100);
          }
          
          return response;
        } else {
          throw new Error(response.data.message || 'Falha no login');
        }
      } catch (error: any) {
        console.error('❌ Erro no login:', error);
        
        let errorMessage = 'Falha no login. Verifique suas credenciais.';
        
        // CORREÇÃO: Melhor tratamento de mensagens de erro
        if (error.message === 'Tempo limite excedido') {
          errorMessage = 'O servidor está demorando para responder. Tentaremos novamente automaticamente.';
          toast.error(errorMessage);
          throw error; // Propagar erro de timeout para permitir retry
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          toast.error(errorMessage);
        } else if (error.message) {
          errorMessage = error.message;
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
        
        setIsLoading(false); // CORREÇÃO: Garantir que isLoading seja resetado no caso de erro
        throw error;
      }
    };
    
    try {
      // Tentar login com retry em caso de timeout
      for (let i = 0; i <= maxRetries; i++) {
        try {
          if (i > 0) {
            console.log(`🔄 Tentativa de login ${i+1}/${maxRetries+1}`);
            toast.loading(`Tentando reconectar ao servidor... (${i}/${maxRetries})`, { id: 'login-retry' });
          }
          
          await attemptLogin();
          if (i > 0) {
            toast.success('Reconectado com sucesso!', { id: 'login-retry' });
          }
          break; // Se o login for bem-sucedido, sair do loop
        } catch (error: any) {
          // Se for o último retry ou não for um erro de timeout, não tentar novamente
          const isTimeout = error.message && error.message.includes('Tempo limite excedido');
          if (i === maxRetries || !isTimeout) {
            throw error; // Propagar o erro para o catch externo
          }
          
          // Esperar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    } catch (finalError: any) {
      // O erro já foi tratado no attemptLogin
      console.error('❌ Todas as tentativas de login falharam:', finalError);
      
      // Mostrar mensagem final de erro
      const isTimeout = finalError.message && finalError.message.includes('Tempo limite excedido');
      if (isTimeout) {
        toast.error('Não foi possível conectar ao servidor após várias tentativas. Por favor, verifique sua conexão e tente novamente mais tarde.', { id: 'login-retry' });
      }
    } finally {
      // CORREÇÃO: Garantir que isLoading sempre seja resetado, mesmo que ocorra um erro no toast
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  const handleGoogleLogin = async (token: string) => {
    if (!isClient) return;

    setIsLoading(true);
    try {
      
      const { data } = await apiClient.post('https://portal.sabercon.com.br/api/auth/google-login', { token });
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
      console.log('🔄 Tentando atualizar dados do usuário...');
      try {
        setIsLoading(true);
        
        // Obter token atual
        const token = getStoredToken();
        if (!token) {
          console.warn('❌ Não foi possível atualizar usuário: Token não encontrado');
          throw new Error('Token não encontrado');
        }
        
        // Verificar se o token é válido
        const decodedToken = decodeToken(token);
        if (!decodedToken || !isValidDecodedToken(decodedToken)) {
          console.warn('❌ Token inválido durante refresh');
          throw new Error('Token inválido');
        }
        
        // Verificar se o token está expirado
        const isExpired = decodedToken.exp && decodedToken.exp * 1000 <= Date.now();
        if (isExpired) {
          console.warn('❌ Token expirado durante refresh');
          throw new Error('Token expirado');
        }
        
        // Tentar obter dados do usuário atualizados da API
        try {
          const response = await apiClient.get('/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000 // Timeout de 5 segundos
          });
          
          if (response.data && response.data.success) {
            const userData = response.data.data;
            
            // Atualizar o usuário com os dados mais recentes
            const updatedUser: User = {
              id: userData.id || decodedToken.id,
              name: userData.name || decodedToken.name,
              email: userData.email || decodedToken.email,
              role: userData.role || decodedToken.role,
              permissions: userData.permissions || decodedToken.permissions || [],
              institution_name: userData.institution_name || decodedToken.institution_name
            };
            
            setUser(updatedUser);
            console.log('✅ Dados do usuário atualizados com sucesso da API');
            return;
          }
        } catch (apiError) {
          console.warn('⚠️ Erro ao buscar dados atualizados do usuário da API:', apiError);
          // Continuar e tentar usar o token existente
        }
        
        // Se não conseguiu da API, usar o token existente
        const success = setupUserFromToken(token);
        if (success) {
          console.log('✅ Dados do usuário atualizados com sucesso do token');
        } else {
          console.warn('❌ Falha ao atualizar dados do usuário do token');
          throw new Error('Falha ao atualizar dados do usuário');
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar dados do usuário:', error);
        throw error;
      } finally {
        setIsLoading(false);
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

