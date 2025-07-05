'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSafe } from '@/contexts/AuthContext';
import { buildLoginUrl, buildDashboardUrl } from '@/utils/urlBuilder';

export default function HomePage() {
  const authContext = useAuthSafe();
  const router = useRouter();

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
    
    switch (userRole) {
      case 'SYSTEM_ADMIN':
        router.push(buildDashboardUrl('SYSTEM_ADMIN'));
        break;
      case 'INSTITUTION_MANAGER':
        router.push(buildDashboardUrl('INSTITUTION_MANAGER'));
        break;
      case 'COORDINATOR':
        router.push(buildDashboardUrl('COORDINATOR'));
        break;
      case 'STUDENT':
        router.push(buildDashboardUrl('STUDENT'));
        break;
      case 'TEACHER':
        router.push(buildDashboardUrl('TEACHER'));
        break;
      case 'GUARDIAN':
        router.push(buildDashboardUrl('GUARDIAN'));
        break;
      default:
        router.push(buildLoginUrl());
    }
  }, [authContext, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}