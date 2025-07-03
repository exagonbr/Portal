'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Redirecionar baseado no role do usuário
    const userRole = session.user?.role;
    
    switch (userRole) {
      case 'SYSTEM_ADMIN':
        router.push('/dashboard/system-admin');
        break;
      case 'INSTITUTION_ADMIN':
        router.push('/dashboard/institution-admin');
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
      case 'SCHOOL_MANAGER':
        router.push('/management/schools');
        break;
      default:
        router.push('/auth/login');
    }
  }, [session, status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecionando...</p>
      </div>
    </div>
  );
}