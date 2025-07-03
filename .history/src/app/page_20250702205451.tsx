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

    const frontendUrl = process.env.FRONTEND_URL || process.env.NEXTAUTH_URL || '';
    
    if (!user) {
      const loginUrl = frontendUrl ? `${frontendUrl}/auth/login` : '/auth/login';
      router.push(loginUrl);
      return;
    }

    // Redirecionar baseado no role do usuário
    const userRole = user.role;
    
    switch (userRole) {
      case 'SYSTEM_ADMIN':
        const systemAdminUrl = frontendUrl ? `${frontendUrl}/dashboard/system-admin` : '/dashboard/system-admin';
        router.push(systemAdminUrl);
        break;
      case 'INSTITUTION_MANAGER':
        const institutionManagerUrl = frontendUrl ? `${frontendUrl}/dashboard/institution-manager` : '/dashboard/institution-manager';
        router.push(institutionManagerUrl);
        break;
      case 'COORDINATOR':
        const coordinatorUrl = frontendUrl ? `${frontendUrl}/dashboard/coordinator` : '/dashboard/coordinator';
        router.push(coordinatorUrl);
        break;
      case 'STUDENT':
        const studentUrl = frontendUrl ? `${frontendUrl}/dashboard/student` : '/dashboard/student';
        router.push(studentUrl);
        break;
      case 'TEACHER':
        const teacherUrl = frontendUrl ? `${frontendUrl}/dashboard/teacher` : '/dashboard/teacher';
        router.push(teacherUrl);
        break;
      case 'GUARDIAN':
        const guardianUrl = frontendUrl ? `${frontendUrl}/dashboard/guardian` : '/dashboard/guardian';
        router.push(guardianUrl);
        break;
      default:
        const defaultLoginUrl = frontendUrl ? `${frontendUrl}/auth/login` : '/auth/login';
        router.push(defaultLoginUrl);
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