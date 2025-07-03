import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { getDashboardPath, isValidRole } from '../utils/roleRedirect';

/**
 * Hook para gerenciar redirecionamentos baseados na role do usuário
 * @param redirectOnLogin - Se deve redirecionar automaticamente após login (padrão: true)
 * @param fallbackPath - Caminho de fallback se role inválida (padrão: '/login')
 */
export function useRoleRedirect(
  redirectOnLogin: boolean = true,
  fallbackPath: string = '/login'
) {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !redirectOnLogin) return;

    const userRole = user.role;

    // Verifica se a role é válida
    if (!isValidRole(userRole)) {
      console.error(`Role inválida detectada no redirecionamento: ${userRole}`);
      logout();
      router.push(fallbackPath);
      return;
    }

    // Obtém o caminho do dashboard baseado na role
    const dashboardPath = getDashboardPath(userRole);

    if (dashboardPath) {
      console.log(`Redirecionando usuário ${user.name} (${userRole}) para: ${dashboardPath}`);
      router.push(dashboardPath);
    } else {
      console.error(`Caminho do dashboard não encontrado para a role: ${userRole}`);
      router.push(fallbackPath);
    }
  }, [user, redirectOnLogin, fallbackPath, router, logout]);

  /**
   * Função para redirecionar manualmente baseado na role atual
   */
  const redirectToDashboard = () => {
    if (!user) {
      router.push(fallbackPath);
      return;
    }

    const userRole = user.role;

    if (!isValidRole(userRole)) {
      console.error(`Role inválida para redirecionamento manual: ${userRole}`);
      logout();
      router.push(fallbackPath);
      return;
    }

    const dashboardPath = getDashboardPath(userRole);

    if (dashboardPath) {
      router.push(dashboardPath);
    } else {
      router.push(fallbackPath);
    }
  };

  /**
   * Verifica se o usuário tem acesso a uma rota específica baseado na role
   */
  const hasAccessToRoute = (requiredRole: string): boolean => {
    if (!user) return false;
    return user.role === requiredRole;
  };

  /**
   * Verifica se o usuário tem acesso a múltiplas roles
   */
  const hasAccessToAnyRole = (requiredRoles: string[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return {
    redirectToDashboard,
    hasAccessToRoute,
    hasAccessToAnyRole,
    currentUserRole: user?.role || null,
    isValidCurrentRole: user ? isValidRole(user.role) : false
  };
}