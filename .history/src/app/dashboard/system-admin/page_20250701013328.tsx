'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemAdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o dashboard real do system-admin que está em (main)
    console.log('🔄 Redirecionando SYSTEM_ADMIN para dashboard principal...');
    router.replace('/dashboard/system-admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Carregando Dashboard</h2>
        <p className="text-gray-600">Redirecionando para o painel do administrador do sistema...</p>
      </div>
    </div>
  );
}