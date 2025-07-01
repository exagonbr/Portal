import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
  fallback?: React.ReactNode;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedRoles = [], 
  fallback = null 
}: AuthGuardProps) {
  const { user, loading, error } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    if (!loading && !hasChecked) {
      setHasChecked(true);
      
      if (requireAuth && !user) {
        console.log('🔒 AuthGuard: Usuário não autenticado, redirecionando para login');
        router.push('/login');
        return;
      }

      if (user && allowedRoles.length > 0) {
        const userRole = user.role?.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
        
        if (!normalizedAllowedRoles.includes(userRole)) {
          console.log(`🚫 AuthGuard: Role ${userRole} não permitida. Roles permitidas: ${allowedRoles.join(', ')}`);
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [user, loading, requireAuth, allowedRoles, router, hasChecked]);

  // Show loading state
  if (loading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Show fallback if user doesn't meet requirements
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta página.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Show fallback if user doesn't have required role
  if (user && allowedRoles.length > 0) {
    const userRole = user.role?.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-4">
              Você não tem permissão para acessar esta página.
            </p>
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export default AuthGuard;
