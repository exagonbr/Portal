'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import { getDefaultDashboard } from '@/utils/rolePermissions';
import { EnhancedLoadingState, EnhancedRedirectState, EnhancedErrorState } from '@/components/ui/LoadingStates';

export default function DashboardRedirect() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [redirecting, setRedirecting] = useState(false);
  const [destination, setDestination] = useState<string>('');
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
          setDestination('/login?error=unauthorized');
          setRedirecting(true);
          return;
        }

        console.log(`🔍 DashboardRedirect: Processando usuário ${user.name} com role ${user.role}`);

        // Usar o utilitário para obter o dashboard padrão
        const userRole = user.role as UserRole;
        
        if (!userRole) {
          console.error('❌ DashboardRedirect: Perfil de usuário não identificado');
          setError('Perfil de usuário não identificado. Por favor, faça login novamente.');
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
        setDestination(defaultRoute);
        setRedirecting(true);

      } catch (err) {
        console.error('❌ DashboardRedirect: Erro no redirecionamento:', err);
        setError('Erro interno. Por favor, tente novamente ou entre em contato com o suporte.');
      }
    }
  }, [user, loading, router, redirecting]);

  const handleRetry = () => {
    setError('');
    setRedirecting(false);
    redirectAttempts.current = 0;
    // Força uma nova verificação
    window.location.reload();
  };

  const handleCancelRedirect = () => {
    setRedirecting(false);
    redirectAttempts.current = 0;
    router.push('/login');
  };

  // Estado de erro
  if (error) {
    return (
      <EnhancedErrorState
        title="Erro de Redirecionamento"
        message={error}
        onRetry={handleRetry}
        onCancel={() => router.push('/login')}
        retryText="Tentar Novamente"
        cancelText="Voltar ao Login"
        details={`Tentativas: ${redirectAttempts.current}/${maxRedirectAttempts}`}
      />
    );
  }

  // Estado de redirecionamento
  if (redirecting && destination) {
    return (
      <EnhancedRedirectState
        destination={destination}
        message="Redirecionando para seu dashboard"
        countdown={3}
        onCancel={handleCancelRedirect}
        autoRedirect={true}
      />
    );
  }

  // Estado de carregamento
  return (
    <EnhancedLoadingState
      message={loading ? 'Carregando...' : 'Preparando redirecionamento...'}
      submessage={loading ? 'Verificando suas credenciais...' : 'Identificando sua área personalizada...'}
      timeout={30}
      onTimeout={() => {
        setError('Tempo limite excedido. Tente fazer login novamente.');
      }}
      onCancel={handleCancelRedirect}
      cancelText="Cancelar e voltar ao login"
    />
  );
}
