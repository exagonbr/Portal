'use client';

import { useAuth } from '@/hooks/auth';
import { Header } from '@/components/layout';

export default function AdminDashboard() {
  const { isLoading, user } = useAuth({
    required: true,
    allowedRoles: ['SYSTEM_ADMIN', 'INSTITUTION_MANAGER']
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard Administrativo" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Dashboard Administrativo
              </h2>
              <p className="text-gray-600">
                Bem-vindo, {user?.name}!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Role: {user?.role}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}