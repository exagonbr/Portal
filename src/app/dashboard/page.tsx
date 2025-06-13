'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import { getDefaultDashboard } from '@/utils/rolePermissions';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [redirecting, setRedirecting] = useState(false);
  const redirectAttempts = useRef(0);
  const maxRedirectAttempts = 3;

  useEffect(() => {
    // Evita múltiplos redirecionamentos
    if (redirecting || redirectAttempts.current >= maxRedirectAttempts) {
      return;
    }

    if (!loading) {
      try {
        redirectAttempts.current++;

        if (!user) {
          console.log('🔄 DashboardRedirect: Usuário não autenticado, redirecionando para login');
          setRedirecting(true);
          router.push('/login?error=unauthorized');
          return;
        }

        console.log(`🔍 DashboardRedirect: Processando usuário ${user.name} com role ${user.role}`);

        // Usar o utilitário para obter o dashboard padrão
        const userRole = user.role as UserRole;
        
        if (!userRole) {
          console.error('❌ DashboardRedirect: Perfil de usuário não identificado');
          setError('Perfil de usuário não identificado. Por favor, faça login novamente.');
          
          // Aguarda 3 segundos antes de redirecionar para login
          setTimeout(() => {
            if (!redirecting) {
              setRedirecting(true);
              router.push('/login?error=invalid_role');
            }
          }, 3000);
          return;
        }

        const defaultRoute = getDefaultDashboard(userRole);
        
        if (!defaultRoute) {
          console.error('❌ DashboardRedirect: Dashboard não encontrado para o perfil');
          setError('Erro interno: dashboard não encontrado para seu perfil. Entre em contato com o suporte.');
          return;
        }

        // Evita redirecionamento circular
        if (defaultRoute === '/dashboard') {
          console.warn('⚠️ DashboardRedirect: Dashboard genérico retornado, possível problema de configuração');
          setError('Erro de configuração do sistema. Entre em contato com o suporte.');
          return;
        }

        console.log(`✅ DashboardRedirect: Redirecionando para: ${defaultRoute}`);
        setRedirecting(true);
        router.push(defaultRoute);

      } catch (err) {
        console.error('❌ DashboardRedirect: Erro no redirecionamento:', err);
        setError('Erro interno. Por favor, tente novamente ou entre em contato com o suporte.');
        
        // Se houve erro, tenta redirecionar para login após um tempo
        setTimeout(() => {
          if (!redirecting) {
            setRedirecting(true);
            router.push('/login?error=redirect_error');
          }
        }, 5000);
      }
    }
  }, [user, loading, router, redirecting]);

  // Renderização condicional baseada no estado
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Erro de Redirecionamento</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError('');
              setRedirecting(false);
              redirectAttempts.current = 0;
              router.push('/login');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // Estado de carregamento/redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="loading-spinner mb-4 mx-auto h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {loading ? 'Carregando...' : 'Redirecionando...'}
        </h2>
        <p className="text-gray-600">
          {loading ? 'Verificando suas credenciais...' : 'Direcionando você para sua área personalizada...'}
        </p>
        
        {/* Botão de fallback caso o redirecionamento demore muito */}
        {redirecting && (
          <div className="mt-6">
            <button
              onClick={() => {
                setRedirecting(false);
                redirectAttempts.current = 0;
                router.push('/login');
              }}
              className="text-blue-600 hover:text-blue-700 text-sm underline"
            >
              Cancelar e voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
