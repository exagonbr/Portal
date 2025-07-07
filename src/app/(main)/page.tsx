'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginPage } from '@/components/auth/LoginPage';
import { getDashboardPath } from '@/utils/roleRedirect';
import { forceReloadIfChrome } from '@/utils/chromeDetection';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Correção específica para Chrome (desktop e mobile) quando não há usuário autenticado
    if (!loading && !user) {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('_nocache')) {
        const chromeReloadApplied = forceReloadIfChrome();
        if (chromeReloadApplied) {
          console.log('🔄 Aplicando correção de reload para Chrome na página inicial...');
          return; // Evita execução adicional já que a página será recarregada
        }
      }
    }

    // Se o usuário já está autenticado, redirecionar para o dashboard apropriado
    if (!loading && user) {
      const normalizedRole = user.role?.toLowerCase();
      const dashboardPath = getDashboardPath(normalizedRole || user.role);
      
      if (dashboardPath) {
        console.log(`🏠 Usuário já autenticado, redirecionando para: ${dashboardPath}`);
        router.push(dashboardPath);
      } else {
        console.warn(`⚠️ Dashboard não encontrado para role ${user.role}, usando fallback`);
        router.push('/dashboard/student');
      }
    }
  }, [user, loading, router]);

  // Se está carregando ou usuário está autenticado, mostrar loading
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {loading ? 'Verificando autenticação...' : 'Redirecionando...'}
          </p>
        </div>
      </div>
    );
  }

  // Se não está autenticado, mostrar página de login
  return <LoginPage />;
}