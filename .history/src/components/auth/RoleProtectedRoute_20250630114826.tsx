'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { isValidRole, getDashboardPath } from '../../utils/roleRedirect';
import { clearAllDataForUnauthorized } from '../../utils/clearAllData';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
  showLoading?: boolean;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

/**
 * Componente para proteger rotas baseado nas roles do usuário
 */
export function RoleProtectedRoute({
  children,
  allowedRoles,
  fallbackPath = '/auth/login',
  showLoading = true,
  loadingComponent,
  unauthorizedComponent
}: RoleProtectedRouteProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthorization = async () => {
      // Se ainda está carregando, aguarda
      if (loading) {
        setIsAuthorized(null);
        return;
      }

      // Se não há usuário, redireciona para login
      if (!user) {
        console.log('Usuário não autenticado, redirecionando para login');
        
        // Se redirecionando para login, limpar dados primeiro
        if (fallbackPath.includes('/login')) {
          clearAllDataForUnauthorized().then(() => {
            router.push(fallbackPath + '?error=unauthorized');
          }).catch((error) => {
            console.error('❌ Erro durante limpeza de dados:', error);
            router.push(fallbackPath + '?error=unauthorized');
          });
        } else {
          router.push(fallbackPath);
        }
        
        setIsAuthorized(false);
        return;
      }

      // Verifica se a role é válida
      if (!isValidRole(user.role)) {
        console.error(`Role inválida detectada: ${user.role}`);
        await logout();
        
        // Se redirecionando para login, limpar dados primeiro
        if (fallbackPath.includes('/login')) {
          clearAllDataForUnauthorized().then(() => {
            router.push(fallbackPath + '?error=unauthorized');
          }).catch((error) => {
            console.error('❌ Erro durante limpeza de dados:', error);
            router.push(fallbackPath + '?error=unauthorized');
          });
        } else {
          router.push(fallbackPath);
        }
        
        setIsAuthorized(false);
        return;
      }

      // Normaliza as roles para comparação (lowercase)
      const normalizedUserRole = user.role.toLowerCase();
      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
      
      // SYSTEM_ADMIN tem acesso COMPLETO a todas as rotas
      const isSystemAdmin = normalizedUserRole === 'system_admin' || 
                           normalizedUserRole === 'administrador do sistema' ||
                           normalizedUserRole === 'administrador';
      
      // Verifica se o usuário tem permissão para acessar a rota
      const hasPermission = isSystemAdmin || normalizedAllowedRoles.includes(normalizedUserRole);

      if (!hasPermission) {
        console.warn(`Usuário ${user.name} (${user.role}) tentou acessar rota não autorizada. Roles permitidas: ${allowedRoles.join(', ')}`);
        
        // Redireciona para o dashboard apropriado da role do usuário
        const userDashboard = getDashboardPath(normalizedUserRole);
        if (userDashboard) {
          console.log(`RoleProtectedRoute: Redirecionando para ${userDashboard}`);
          router.push(userDashboard);
        } else {
          console.log(`RoleProtectedRoute: Redirecionando para fallback ${fallbackPath}`);
          router.push(fallbackPath);
        }
        setIsAuthorized(false);
        return;
      }

      if (isSystemAdmin) {
        console.log(`✅ SYSTEM_ADMIN ${user.name} tem acesso completo à rota`);
      } else {
        console.log(`Acesso autorizado para usuário ${user.name} (${user.role})`);
      }
      setIsAuthorized(true);
    };

    checkAuthorization();
  }, [user, loading, allowedRoles, router, logout, fallbackPath]);

  // Mostra loading enquanto verifica autorização
  if (loading || isAuthorized === null) {
    if (showLoading) {
      return loadingComponent || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    return null;
  }

  // Se não autorizado, mostra componente de não autorizado ou null
  if (!isAuthorized) {
    return unauthorizedComponent || null;
  }

  // Se autorizado, renderiza os children
  return <>{children}</>;
}

/**
 * HOC para proteger páginas baseado em roles
 */
export function withRoleProtection<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[],
  options?: {
    fallbackPath?: string;
    showLoading?: boolean;
    loadingComponent?: ReactNode;
    unauthorizedComponent?: ReactNode;
  }
) {
  const ProtectedComponent = (props: P) => {
    return (
      <RoleProtectedRoute
        allowedRoles={allowedRoles}
        fallbackPath={options?.fallbackPath}
        showLoading={options?.showLoading}
        loadingComponent={options?.loadingComponent}
        unauthorizedComponent={options?.unauthorizedComponent}
      >
        <WrappedComponent {...props} />
      </RoleProtectedRoute>
    );
  };

  ProtectedComponent.displayName = `withRoleProtection(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ProtectedComponent;
}