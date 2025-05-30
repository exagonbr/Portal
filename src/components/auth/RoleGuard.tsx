'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_BASED_ROUTES } from '@/types/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  redirectTo
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não há usuário, redireciona para login
        router.push('/login?error=unauthorized');
      } else if (!allowedRoles.includes(user.role as UserRole)) {
        // Se o usuário não tem o papel permitido, redireciona para seu dashboard específico
        const roleRoute = ROLE_BASED_ROUTES.find(route =>
          route.roles.includes(user.role as UserRole) &&
          route.path.startsWith('/dashboard')
        );
        
        router.push(roleRoute?.path || redirectTo || '/login');
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Se não há usuário ou não tem permissão, não renderiza nada
  if (!user || !allowedRoles.includes(user.role as UserRole)) {
    return null;
  }

  // Se tudo está ok, renderiza o conteúdo
  return <>{children}</>;
}