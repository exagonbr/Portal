import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/login`, {
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
        
        // Armazenar tokens de forma segura
        localStorage.setItem('accessToken', result.data.token);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        // Redirecionar para dashboard
        router.push('/dashboard');
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
      
      const token = localStorage.getItem('accessToken');
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      const result: LogoutResponse = await response.json();

      // Sempre limpar dados locais, mesmo se a requisição falhar
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      console.log('✅ Logout otimizado realizado');
      
      // Redirecionar para login
      router.push('/auth/login');

      return result;
    } catch (err: any) {
      // Mesmo com erro, limpar dados locais
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
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
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        return false;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/validate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      return result.success && result.data?.valid;
    } catch (err) {
      console.log('❌ Erro na validação do token:', err);
      return false;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        return false;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        localStorage.setItem('accessToken', result.data.token);
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