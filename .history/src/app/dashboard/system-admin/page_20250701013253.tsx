'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SystemAdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o dashboard real do system-admin
    router.replace('/dashboard/system-admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o dashboard do administrador...</p>
      </div>
    </div>
  );
}