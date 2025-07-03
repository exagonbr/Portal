'use client';

import React from 'react';
import { useApiRequest, useApiMutation } from '@/hooks/useApiRequest';
import { Card } from '@/components/ui/Card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SystemStats {
  overview: {
    systemStatus: string;
    uptime: number;
    totalUsers: number;
    activeUsers: number;
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

/**
 * Exemplo de componente que busca estatísticas do sistema
 * usando o hook useApiRequest com autenticação automática
 */
export function SystemStatsExample() {
  const { data, loading, error, refetch } = useApiRequest<SystemStats>(
    '/api/dashboard/system',
    {
      onError: (error) => {
        console.error('Erro ao buscar estatísticas:', error);
      }
    }
  );

  if (loading) {
    return <SystemStatsLoading />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">
              Erro ao carregar estatísticas: {error}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Status do Sistema</h3>
          <div className={`h-3 w-3 rounded-full ${
            data.overview.systemStatus === 'operational'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`} />
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold capitalize">
            {data.overview.systemStatus}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Uptime: {data.overview.uptime}%
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Usuários Ativos</h3>
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold">
            {data.overview.activeUsers.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            de {data.overview.totalUsers.toLocaleString('pt-BR')} total
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium">Performance</h3>
        </div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>CPU</span>
            <span className="font-medium">{data.performance.cpuUsage}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Memória</span>
            <span className="font-medium">{data.performance.memoryUsage}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Disco</span>
            <span className="font-medium">{data.performance.diskUsage}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

/**
 * Componente de loading com skeletons
 */
function SystemStatsLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-6">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}

/**
 * Exemplo de uso com mutação
 */
export function SystemActionExample() {
  const { mutate, loading } = useApiMutation<
    { action: string },
    { success: boolean; message: string }
  >('/api/system/restart', 'post');

  const handleRestart = async () => {
    const result = await mutate(
      { action: 'restart' },
      {
        onSuccess: (data) => {
          console.log('Sistema reiniciado:', data.message);
          // Mostrar notificação de sucesso
        },
        onError: (error) => {
          console.error('Erro ao reiniciar:', error);
          // Mostrar notificação de erro
        }
      }
    );

    if (result.success) {
      // Ações adicionais após sucesso
    }
  };

  return (
    <Button 
      onClick={handleRestart} 
      disabled={loading}
      variant="destructive"
    >
      {loading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Reiniciando...
        </>
      ) : (
        'Reiniciar Sistema'
      )}
    </Button>
  );
}