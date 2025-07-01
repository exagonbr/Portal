'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../lib/authFetch';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';

// Tipagem para o usuário e o contexto
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper para decodificar o token e extrair dados do usuário
const decodeToken = (token: string): any | null => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  // Função de logout centralizada
  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    setUser(null);
    apiClient.post('/auth/logout').catch(err => console.error("Logout API call failed:", err));
    router.push('/login');
    toast.success('Você foi desconectado.');
  }, [router]);

  // Efeito para verificar o token no carregamento inicial
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decodedPayload = decodeToken(token);
      if (decodedPayload && decodedPayload.exp * 1000 > Date.now()) {
        setUser({
          id: decodedPayload.id,
          name: decodedPayload.name,
          email: decodedPayload.email,
          role: decodedPayload.role,
          permissions: decodedPayload.permissions || [],
        });
      } else {
        localStorage.removeItem('accessToken');
      }
    }
    setIsLoading(false);
  }, []);


  // Função de login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { email, password });
      const { accessToken } = data.data;
      
      localStorage.setItem('accessToken', accessToken);
      const decodedPayload = decodeToken(accessToken);
      if (decodedPayload) {
        setUser({
          id: decodedPayload.id,
          name: decodedPayload.name,
          email: decodedPayload.email,
          role: decodedPayload.role,
          permissions: decodedPayload.permissions || [],
        });
      }

      
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard'); // Redireciona para uma página padrão

    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
      toast.error(message, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
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
