'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getDashboardPath } from '@/utils/roleRedirect';

interface ClientAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function ClientAuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  redirectTo = '/login' 
}: ClientAuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        console.log('🔒 ClientAuthGuard: Usuário não autenticado, redirecionando para login');
        router.replace(redirectTo);
        return;
      }

      if (user && allowedRoles.length > 0) {
        const userRole = user.role?.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        
        // SYSTEM_ADMIN pode acessar TODAS as rotas
        if (userRole === 'system_admin') {
          console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total');
          setIsChecking(false);
          return;
        }
        
        if (!normalizedAllowedRoles.includes(userRole)) {
          console.log(`🔒 ClientAuthGuard: Role ${userRole} não permitida, redirecionando`);
          
          // Redirecionar para o dashboard correto da role do usuário
          const dashboardPath = getDashboardPath(userRole);
          if (dashboardPath) {
            router.replace(dashboardPath);
          } else {
            router.replace('/dashboard/student');
          }
          return;
        }
      }

      setIsChecking(false);
    }
  }, [user, loading, requireAuth, allowedRoles, redirectTo, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se chegou até aqui, está autorizado
  return <>{children}</>;
} 