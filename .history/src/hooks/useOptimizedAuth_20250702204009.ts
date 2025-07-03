import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { ApiResponse } from '@/types/api';

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      role_slug: string;
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
      
      const response = await apiClient.post<LoginResponse['data']>('/auth/login', data);

      if (response.success && response.data) {
        console.log('✅ Login otimizado realizado com sucesso');
        
        // Armazenar tokens de forma segura
        apiClient.setAuthToken(response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirecionar para dashboard
        router.push('/dashboard');
        return { success: true, data: response.data, message: response.message || 'Login bem-sucedido' };
      }

      throw new Error(response.message || 'Erro no login');
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
      
      const response = await apiClient.post<LogoutResponse>('/auth/logout');

      // Sempre limpar dados locais, mesmo se a requisição falhar
      apiClient.clearAuth();
      
      console.log('✅ Logout otimizado realizado');
      
      // Redirecionar para login
      router.push('/auth/login');

      return response.data || { success: true, message: 'Logout bem-sucedido' };
    } catch (err: any) {
      // Mesmo com erro, limpar dados locais
      apiClient.clearAuth();
      
      const errorMessage = err.message || 'Erro no logout';
      setError(errorMessage);
      console.log('❌ Erro no logout otimizado:', errorMessage);
      
      // Ainda assim redirecionar para login
      router.push('/auth/login');
      
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
      const response = await apiClient.get<{ valid: boolean }>('/auth/validate');
      return response.success && response.data?.valid === true;
    } catch (err) {
      console.log('❌ Erro na validação do token:', err);
      return false;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const currentRefreshToken = localStorage.getItem('refreshToken');
      
      if (!currentRefreshToken) {
        return false;
      }

      const response = await apiClient.post<{ token: string }>('/auth/refresh', { refreshToken: currentRefreshToken });

      if (response.success && response.data?.token) {
        apiClient.setAuthToken(response.data.token);
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
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.log('❌ Erro ao obter usuário atual:', err);
      return null;
    }
  }, []);

  return {
    login,
    logout,
    validateToken,
    refreshToken,
    getCurrentUser,
    isLoading,
    error,
    clearError: () => setError(null)
  };
} 