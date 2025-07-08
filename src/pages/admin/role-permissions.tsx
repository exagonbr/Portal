import React from 'react';
import { RolePermissionsManager } from '@/components/admin/RolePermissionsManager';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const RolePermissionsPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Verificar autenticação
  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Permissões de Função</h1>
      
      <RolePermissionsManager />
    </div>
  );
};

export default RolePermissionsPage; 