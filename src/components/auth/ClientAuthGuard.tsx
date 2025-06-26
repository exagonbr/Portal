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
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // CORREÇÃO: Adicionar timeout para evitar travamento indefinido
    const checkTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ ClientAuthGuard: Timeout na verificação - continuando sem bloqueio');
        setIsChecking(false);
      }
    }, 10000); // 10 segundos timeout

    if (!loading && !hasRedirected) {
      if (requireAuth && !user) {
        console.log('🔒 ClientAuthGuard: Usuário não autenticado, redirecionando para login');
        setHasRedirected(true);
        
        // Adicionar delay para evitar loops
        setTimeout(() => {
          router.replace(redirectTo);
        }, 100);
        return;
      }

      if (user && allowedRoles.length > 0) {
        const userRole = user.role?.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
        
        // SYSTEM_ADMIN pode acessar TODAS as rotas
        if (userRole === 'system_admin') {
          console.log('✅ SYSTEM_ADMIN detectado, permitindo acesso total');
          setIsChecking(false);
          clearTimeout(checkTimeout);
          return;
        }
        
        if (!normalizedAllowedRoles.includes(userRole)) {
          console.log(`🔒 ClientAuthGuard: Role ${userRole} não permitida, redirecionando`);
          setHasRedirected(true);
          
          // Redirecionar para o dashboard correto da role do usuário
          const dashboardPath = getDashboardPath(userRole);
          if (dashboardPath) {
            setTimeout(() => {
              router.replace(dashboardPath);
            }, 100);
          } else {
            setTimeout(() => {
              router.replace('/dashboard/student');
            }, 100);
          }
          return;
        }
      }

      setIsChecking(false);
    }

    return () => clearTimeout(checkTimeout);
  }, [user, loading, requireAuth, allowedRoles, redirectTo, router, hasRedirected]);

  // CORREÇÃO: Melhorar a condição de loading
  if (loading || (isChecking && !hasRedirected)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
          {/* CORREÇÃO: Adicionar indicador de progresso */}
          <div className="mt-2 text-xs text-gray-400">
            {loading ? 'Carregando dados...' : 'Verificando permissões...'}
          </div>
        </div>
      </div>
    );
  }

  // CORREÇÃO: Não renderizar nada se estiver redirecionando
  if (hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  // Se chegou até aqui, está autorizado
  return <>{children}</>;
} 