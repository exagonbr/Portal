'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_BASED_ROUTES } from '@/types/roles';
import { clearAllDataForUnauthorized } from '@/utils/clearAllData';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

function RoleGuardContent({
  children,
  allowedRoles,
  redirectTo
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());

  // Safely get search params
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const params = new URLSearchParams(window.location.search);
        setSearchParams(params);
      } else {
        setSearchParams(new URLSearchParams());
      }
    } catch (error) {
      console.warn('Erro ao obter search params:', error);
      setSearchParams(new URLSearchParams());
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não há usuário, limpar dados e redirecionar para login
        clearAllDataForUnauthorized().then(() => {
          router.push('/login?error=unauthorized');
        }).catch((error) => {
          console.error('❌ Erro durante limpeza de dados:', error);
          // Redirecionar mesmo com erro na limpeza
          router.push('/login?error=unauthorized');
        });
      } else {
        // SYSTEM_ADMIN pode acessar TODAS as rotas
        if (user.role === UserRole.SYSTEM_ADMIN.toString() || user.role?.toLowerCase() === 'system_admin') {
          console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total');
          return;
        }
        
        // Verifica se é SYSTEM_ADMIN simulando outra role
        const isAdminSimulation = searchParams.get('admin_simulation') === 'true' && user.role === UserRole.SYSTEM_ADMIN.toString();
        
        if (!allowedRoles.includes(user.role as UserRole) && !isAdminSimulation) {
          console.log(`🔒 RoleGuard: Role ${user.role} não permitida para esta rota`);
          // Se o usuário não tem o papel permitido, redireciona para seu dashboard específico
          const roleRoute = ROLE_BASED_ROUTES.find(route =>
            route.roles.includes(user.role as UserRole) &&
            route.path.startsWith('/dashboard')
          );
          
          router.push(roleRoute?.path || redirectTo || '/login');
        }
      }
    }
  }, [user, loading, allowedRoles, router, redirectTo, searchParams]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // SYSTEM_ADMIN pode acessar TODAS as rotas
  if (user && (user.role === UserRole.SYSTEM_ADMIN.toString() || user.role?.toLowerCase() === 'system_admin')) {
    console.log('✅ SYSTEM_ADMIN detectado no render, permitindo acesso total');
    return <>{children}</>;
  }
  
  // Verifica se é SYSTEM_ADMIN simulando outra role
  const isAdminSimulation = searchParams.get('admin_simulation') === 'true' && user?.role === UserRole.SYSTEM_ADMIN.toString();
  
  // Se não há usuário ou não tem permissão, não renderiza nada
  if (!user || (!allowedRoles.includes(user.role as UserRole) && !isAdminSimulation)) {
    return null;
  }

  // Se tudo está ok, renderiza o conteúdo
  return <>{children}</>;
}

export default function RoleGuard(props: RoleGuardProps) {
  return (
    <RoleGuardContent {...props} />
  );
}