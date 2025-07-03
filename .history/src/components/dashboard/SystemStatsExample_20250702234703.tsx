'use client';

import React from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Erro ao carregar estatísticas: {error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar novamente
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Status do Sistema
          </CardTitle>
          <div className={`h-3 w-3 rounded-full ${
            data.overview.systemStatus === 'operational' 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {data.overview.systemStatus}
          </div>
          <p className="text-xs text-muted-foreground">
            Uptime: {data.overview.uptime}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Usuários Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data.overview.activeUsers.toLocaleString('pt-BR')}
          </div>
          <p className="text-xs text-muted-foreground">
            de {data.overview.totalUsers.toLocaleString('pt-BR')} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
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
        </CardContent>
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
        <Card key={i}>
          <CardHeader className="space-y-0 pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-3 w-[80px]" />
          </CardContent>
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

// Importação necessária para usar em outros componentes
import { useApiMutation } from '@/hooks/useApiRequest';