'use client';

import React from 'react';
import SessionManager from '../../../components/admin/SessionManager';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@prisma/client';

const SessionsAdminPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verifica se o usuário tem permissão de admin
    if (!loading && (!user || user.role !== UserRole.SYSTEM_ADMIN)) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.role !== UserRole.SYSTEM_ADMIN) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-600 mb-2">
            Administração de Sessões
          </h1>
          <p className="text-gray-600">
            Gerencie e monitore as sessões ativas dos usuários no sistema.
          </p>
        </div>

        <SessionManager />

        {/* Informações sobre Redis */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            ℹ️ Informações sobre o Sistema de Sessões
          </h3>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>Redis:</strong> As sessões são armazenadas no Redis para alta performance e escalabilidade.
            </p>
            <p>
              <strong>TTL:</strong> As sessões expiram automaticamente após 24 horas de inatividade.
            </p>
            <p>
              <strong>Limpeza:</strong> Sessões expiradas são limpas automaticamente, mas você pode forçar a limpeza usando o botão &quot;Limpar Expiradas&quot;.
            </p>
            <p>
              <strong>Segurança:</strong> Cada sessão é única e contém informações sobre IP, dispositivo e última atividade.
            </p>
          </div>
        </div>

        {/* Comandos Redis úteis */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-600 mb-3">
            🔧 Comandos Redis Úteis
          </h3>
          <div className="text-sm text-gray-700 space-y-2 font-mono">
            <p><strong>Listar todas as chaves de sessão:</strong> <code>KEYS session:*</code></p>
            <p><strong>Contar sessões ativas:</strong> <code>EVAL &quot;return #redis.call(&apos;keys&apos;, &apos;session:*&apos;)&quot; 0</code></p>
            <p><strong>Ver usuários ativos:</strong> <code>SMEMBERS active_users</code></p>
            <p><strong>Ver sessões de um usuário:</strong> <code>SMEMBERS user_sessions:USER_ID</code></p>
            <p><strong>Limpar todas as sessões:</strong> <code>FLUSHDB</code> (⚠️ Use com cuidado!)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsAdminPage;