'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SystemLayout({
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

    // Apenas SYSTEM_ADMIN pode acessar área de sistema
    if (session.user?.role !== 'SYSTEM_ADMIN') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!session || session.user?.role !== 'SYSTEM_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-red-600 p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Sistema - Administração</h1>
        </div>
      </header>
      <div className="flex">
        {/* Sidebar de sistema será adicionado aqui */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}