'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface UseAuthOptions {
  required?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

export function useAuth(options: UseAuthOptions = {}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const {
    required = false,
    redirectTo = '/auth/login',
    allowedRoles = []
  } = options;

  useEffect(() => {
    if (status === 'loading') return; // Ainda carregando

    // Se autenticação é obrigatória e não há sessão
    if (required && !session) {
      router.push(redirectTo);
      return;
    }

    // Se há roles permitidos e o usuário não tem permissão
    if (session && allowedRoles.length > 0) {
      const userRole = session.user?.role;
      if (!userRole || !allowedRoles.includes(userRole)) {
        router.push('/dashboard'); // Redirecionar para dashboard padrão
        return;
      }
    }
  }, [session, status, required, redirectTo, allowedRoles, router]);

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    user: session?.user,
    hasRole: (role: string) => session?.user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(session?.user?.role || ''),
  };
}