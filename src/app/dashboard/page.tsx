'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import { getDefaultDashboard } from '@/utils/rolePermissions';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      try {
        if (!user) {
          setRedirecting(true);
          router.push('/login?error=unauthorized');
          return;
        }

        // Usar o utilitário para obter o dashboard padrão
        const userRole = user.role as UserRole;
        
        if (!userRole) {
          setError('Perfil de usuário não identificado. Por favor, faça login novamente.');
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        const defaultRoute = getDefaultDashboard(userRole);
        
        if (!defaultRoute) {
          setError('Erro interno: dashboard não encontrado para seu perfil. Entre em contato com o suporte.');
          return;
        }

        setRedirecting(true);
        router.push(defaultRoute);
      } catch (err) {
        console.error('Erro no redirecionamento do dashboard:', err);
        setError('Erro interno. Por favor, tente novamente ou entre em contato com o suporte.');
      }
    }
  }, [user, loading, router]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4" role="main">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-200">
            <svg 
              className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-base-responsive font-semibold text-red-800 mb-2">Erro de Acesso</h1>
            <p className="text-sm-responsive text-red-700 mb-4" role="alert">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 border border-transparent text-sm-responsive font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              aria-label="Voltar para página de login"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar ao Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4" role="main">
      <div className="text-center">
        <div className="relative">
          <div className="loading-spinner mx-auto mb-6"></div>
        </div>
        
        <h1 className="text-lg-responsive font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {redirecting ? 'Redirecionando...' : 'Carregando...'}
        </h1>
        
        <p className="text-sm-responsive text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
          {redirecting 
            ? 'Aguarde enquanto você é redirecionado para seu dashboard.'
            : 'Verificando suas permissões e configurando o ambiente.'
          }
        </p>
        
        <div className="mt-6 space-y-2">
          <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }}></div>
          </div>
          <p className="text-xs-responsive text-gray-500">Configurando experiência personalizada...</p>
        </div>
      </div>
    </div>
  );
}
