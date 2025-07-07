'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSafe } from '@/contexts/AuthContext';
import { buildLoginUrl, buildDashboardUrl } from '@/utils/urlBuilder';
import { standardizeTokens } from '@/utils/tokenCleanup';

export default function HomePage() {
  const authContext = useAuthSafe();
  const router = useRouter();

  // Redirecionar com base no estado de autenticação
  useEffect(() => {
    // Aguardar o contexto de autenticação estar disponível
    if (!authContext) return;

    const { user, isLoading } = authContext;

    if (isLoading) return;

    if (!user) {
      router.push(buildLoginUrl());
      return;
    }

    // Redirecionar baseado no role do usuário
    const userRole = user.role;
    router.push(buildDashboardUrl(userRole));
  }, [authContext, router]);

  // Padronizar tokens quando a página for carregada
  useEffect(() => {
    // Executar a padronização de tokens
    if (typeof window !== 'undefined') {
      try {
        standardizeTokens();
      } catch (error) {
        console.error('Erro ao padronizar tokens:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}