'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Verificar se o usuário tem permissão para acessar área de gestão
    const allowedRoles = ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR'];
    if (!allowedRoles.includes(session.user?.role || '')) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session || !['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'COORDINATOR'].includes(session.user?.role || '')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Gestão Educacional</h1>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar de gestão será adicionado aqui */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}