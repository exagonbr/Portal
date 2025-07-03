'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Se não há usuário, limpar dados e redirecionar para login
        clearAllDataForUnauthorized().then(() => {
          router.push('/auth/login?error=unauthorized');
        }).catch((error) => {
          console.log('❌ Erro durante limpeza de dados:', error);
          // Redirecionar mesmo com erro na limpeza
          router.push('/auth/login?error=unauthorized');
        });
      } else {
        // SYSTEM_ADMIN pode acessar TODAS as rotas
        if (user.role === UserRole.SYSTEM_ADMIN.toString() || user.role?.toLowerCase() === 'system_admin') {
          console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total');
          return;
        }
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

  // SYSTEM_ADMIN pode acessar TODAS as rotas
  if (user && (user.role === UserRole.SYSTEM_ADMIN.toString() || user.role?.toLowerCase() === 'system_admin')) {
    console.log('✅ SYSTEM_ADMIN detectado no render, permitindo acesso total');
    return <>{children}</>;
  }
  
  // Se não há usuário ou não tem permissão, não renderiza nada
  if (!user || !allowedRoles.includes(user.role as UserRole)) {
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