import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { buildLoginUrl, buildUrl } from '../utils/urlBuilder';
import { getApiUrl } from '@/config/urls';
import { UnifiedAuthService, AuthData } from '@/services/unifiedAuthService';
import { getDashboardPath } from '@/utils/roleRedirect';
import { toast } from 'react-hot-toast';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      permissions: string[];
      institution_name?: string;
    };
    expiresIn: number;
  };
  message: string;
}

interface LogoutResponse {
  success: boolean;
  message: string;
}

export function useOptimizedAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const login = useCallback(async (data: LoginData): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Iniciando login otimizado...');
      
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro no login');
      }

      if (result.success && result.data) {
        console.log('✅ Login otimizado realizado com sucesso');
        
        // Preparar dados para o serviço unificado
        const authData: AuthData = {
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
          user: result.data.user,
          expiresIn: result.data.expiresIn
        };

        // Salvar em todos os locais (localStorage, cookies, Redis)
        const saveResult = await UnifiedAuthService.saveAuthData(authData);
        
        if (saveResult.success) {
          console.log('✅ Dados salvos em todos os locais');
          
          // Obter caminho do dashboard baseado na role
          const dashboardPath = getDashboardPath(result.data.user.role);
          
          if (dashboardPath) {
            console.log('🎯 Redirecionando para dashboard:', dashboardPath);
            toast.success('Login realizado com sucesso!');
            router.push(dashboardPath);
          } else {
            console.warn('⚠️ Dashboard não encontrado para role:', result.data.user.role);
            toast.success('Login realizado com sucesso!');
            router.push('/dashboard'); // Fallback
          }
        } else {
          console.warn('⚠️ Erro ao salvar dados:', saveResult.message);
          toast.error('Login realizado, mas houve problemas ao salvar os dados');
        }
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro interno do servidor';
      setError(errorMessage);
      console.log('❌ Erro no login otimizado:', errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async (): Promise<LogoutResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔓 Iniciando logout otimizado...');
      
      const token = UnifiedAuthService.getAccessToken();
      const sessionId = UnifiedAuthService.getSessionId();
      
      const response = await fetch(`${getApiUrl()}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result: LogoutResponse = await response.json();

      // Limpar dados de todos os locais (localStorage, cookies, Redis)
      await UnifiedAuthService.clearAuthData(sessionId || undefined, token || undefined);
      
      console.log('✅ Logout otimizado realizado - dados limpos de todos os locais');
      toast.success('Logout realizado com sucesso!');
      
      // Redirecionar para login
      router.push(buildLoginUrl());

      return result;
    } catch (err: any) {
      // Mesmo com erro, limpar dados locais
      const token = UnifiedAuthService.getAccessToken();
      const sessionId = UnifiedAuthService.getSessionId();
      await UnifiedAuthService.clearAuthData(sessionId || undefined, token || undefined);
      
      const errorMessage = err.message || 'Erro no logout';
      setError(errorMessage);
      console.log('❌ Erro no logout otimizado:', errorMessage);
      
      // Ainda assim redirecionar para login
      router.push(buildLoginUrl());
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = UnifiedAuthService.getAccessToken();
      
      if (!token) {
        return false;
      }

      const response = await fetch(`${getApiUrl()}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      
      // Se token válido, atualizar atividade da sessão
      if (result.success && result.data?.valid) {
        await UnifiedAuthService.updateActivity();
      }
      
      return result.success && result.data?.valid;
    } catch (err) {
      console.log('❌ Erro na validação do token:', err);
      return false;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const authData = UnifiedAuthService.loadAuthData();
      const refreshToken = authData.merged?.refreshToken;
      
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${getApiUrl()}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Atualizar token em todos os locais
        const sessionId = UnifiedAuthService.getSessionId();
        await UnifiedAuthService.updateAccessToken(result.data.accessToken, sessionId || undefined);
        
        console.log('✅ Token renovado em todos os locais');
        return true;
      }

      return false;
    } catch (err) {
      console.log('❌ Erro no refresh do token:', err);
      return false;
    }
  }, []);

  const getCurrentUser = useCallback(() => {
    try {
      return UnifiedAuthService.getCurrentUser();
    } catch (err) {
      console.log('❌ Erro ao obter usuário atual:', err);
      return null;
    }
  }, []);

  // Função para verificar se está autenticado
  const isAuthenticated = useCallback(() => {
    return UnifiedAuthService.isAuthenticated();
  }, []);

  // Função para sincronizar dados entre storages
  const syncStorages = useCallback(() => {
    UnifiedAuthService.syncStorages();
  }, []);

  // Função para obter dados completos de autenticação
  const getAuthData = useCallback(() => {
    return UnifiedAuthService.loadAuthData();
  }, []);

  // Função para atualizar atividade (heartbeat)
  const updateActivity = useCallback(async () => {
    await UnifiedAuthService.updateActivity();
  }, []);

  return {
    login,
    logout,
    validateToken,
    refreshToken,
    getCurrentUser,
    isAuthenticated,
    syncStorages,
    getAuthData,
    updateActivity,
    isLoading,
    error,
    clearError: () => setError(null)
  };
} 