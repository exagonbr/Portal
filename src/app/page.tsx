'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSafe } from '@/contexts/AuthContext';

export default function HomePage() {
  const authContext = useAuthSafe();
  const router = useRouter();

  useEffect(() => {
    // Aguardar o contexto de autenticação estar disponível
    if (!authContext) return;

    const { user, loading } = authContext;

    if (loading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Redirecionar baseado no role do usuário
    const userRole = user.role;
    
    switch (userRole) {
      case 'SYSTEM_ADMIN':
        router.push('/dashboard/system-admin');
        break;
      case 'INSTITUTION_MANAGER':
        router.push('/dashboard/institution-manager');
        break;
      case 'COORDINATOR':
        router.push('/dashboard/coordinator');
        break;
      case 'STUDENT':
        router.push('/dashboard/student');
        break;
      case 'TEACHER':
        router.push('/dashboard/teacher');
        break;
      case 'GUARDIAN':
        router.push('/dashboard/guardian');
        break;
      default:
        router.push('/auth/login');
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