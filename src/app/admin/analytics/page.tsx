'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAwsSettings } from '../../../hooks/useAwsSettings'
import { awsService, SystemAnalytics, S3StorageInfo } from '../../../services/awsService'
import { SystemUsageData, ResourceDistribution } from '../../../types/analytics'
import SystemUsageChart from '../../../components/admin/analytics/SystemUsageChart'
import ResourceDistributionChart from '../../../components/admin/analytics/ResourceDistributionChart'
import S3StorageAnalytics from '../../../components/admin/analytics/S3StorageAnalytics'
import NetworkTrafficChart from '../../../components/admin/analytics/NetworkTrafficChart'
import MetricsCards from '../../../components/admin/analytics/MetricsCards'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import { UserRole } from '../../../types/roles'

export default function AdminAnalyticsPage() {
  const { settings } = useAwsSettings()
  
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [s3Info, setS3Info] = useState<S3StorageInfo | null>(null)
  const [systemUsageData, setSystemUsageData] = useState<SystemUsageData>([])
  const [resourceDistribution, setResourceDistribution] = useState<ResourceDistribution[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Usar Promise.allSettled para permitir que algumas chamadas falhem sem interromper todas
      const results = await Promise.allSettled([
        awsService.getSystemAnalytics(),
        awsService.getS3StorageInfo(),
        awsService.getSystemUsageHistory(24), // Busca últimas 24 horas
        awsService.getResourceDistribution()
      ]);

      // Processar os resultados individualmente
      if (results[0].status === 'fulfilled') {
        setAnalytics(results[0].value);
      } else {
        console.error('Erro ao buscar analytics do sistema:', results[0].reason);
        // Não definimos o erro global aqui para permitir carregamento parcial
      }

      if (results[1].status === 'fulfilled') {
        setS3Info(results[1].value);
      } else {
        console.error('Erro ao buscar informações do S3:', results[1].reason);
      }

      if (results[2].status === 'fulfilled') {
        setSystemUsageData(results[2].value);
      } else {
        console.error('Erro ao buscar histórico de uso do sistema:', results[2].reason);
      }

      if (results[3].status === 'fulfilled') {
        setResourceDistribution(results[3].value as ResourceDistribution[]);
      } else {
        console.error('Erro ao buscar distribuição de recursos:', results[3].reason);
      }

      // Verificar se todas as chamadas falharam
      const allFailed = results.every(result => result.status === 'rejected');
      if (allFailed) {
        const mainError = results[0].status === 'rejected' ? results[0].reason : null;
        if (mainError && mainError instanceof Error) {
          setError(mainError.message);
        } else {
          setError('Não foi possível carregar os dados de analytics. Verifique sua conexão ou tente novamente mais tarde.');
        }
      } else {
        // Se pelo menos uma chamada foi bem-sucedida, atualizamos o timestamp
        setLastUpdate(new Date());
      }

    } catch (err) {
      let errorMessage = 'Ocorreu um erro desconhecido ao carregar os dados de analytics.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        // Se tivermos informações adicionais do erro
        const anyError = err as any;
        if (anyError.status) {
          errorMessage += ` (Status: ${anyError.status})`;
        }
        if (anyError.info && typeof anyError.info === 'object') {
          const infoMessage = anyError.info.message || anyError.info.error;
          if (infoMessage) {
            errorMessage += ` - ${infoMessage}`;
          }
        }
      }
      
      setError(errorMessage);
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics AWS</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {lastUpdate ? `Última atualização: ${lastUpdate.toLocaleTimeString()}` : "Monitoramento e estatísticas"}
            </p>
          </div>
          <button 
            onClick={fetchAllAnalytics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Erro: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Cards de Métricas com Gráficos */}
          <MetricsCards 
            analytics={analytics} 
            s3Info={s3Info} 
            loading={isLoading} 
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <SystemUsageChart data={systemUsageData} loading={isLoading} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <ResourceDistributionChart data={resourceDistribution} loading={isLoading} title="Distribuição de Recursos" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <NetworkTrafficChart data={analytics} loading={isLoading} />
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Análise de Armazenamento S3</h3>
              <S3StorageAnalytics data={s3Info} bucketName={settings.region} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
