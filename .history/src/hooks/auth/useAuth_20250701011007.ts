'use client';

import { useAuth as useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function useAuth(options: UseAuthOptions = {}) {
  const { user, loading, isAuthenticated } = useAuthContext();
  const router = useRouter();
  
  const {
    required = false,
    redirectTo = '/auth/login',
    allowedRoles = []
  } = options;

  useEffect(() => {
    if (loading) return; // Ainda carregando

    // Se autenticação é obrigatória e não há usuário
    if (required && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Se há roles permitidos e o usuário não tem permissão
    if (user && allowedRoles.length > 0) {
      const userRole = user.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push('/dashboard'); // Redirecionar para dashboard padrão
        return;
      }
    }
  }, [user, loading, isAuthenticated, required, redirectTo, allowedRoles, router]);

  return {
    session: user ? { user } : null, // Compatibilidade com código existente
    status: loading ? 'loading' : (isAuthenticated ? 'authenticated' : 'unauthenticated'),
    isLoading: loading,
    isAuthenticated,
    user,
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(user?.role || ''),
  };
}