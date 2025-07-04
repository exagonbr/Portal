'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { useAwsSettings } from '../../../hooks/useAwsSettings'
import { awsService, SystemAnalytics, S3StorageInfo } from '../../../services/awsService'
import { analyticsSessionService } from '../../../services/analyticsSessionService'
import { ActiveSession, SystemUsageData, ResourceDistribution } from '../../../types/analytics'
import SystemUsageChart from '../../../components/admin/analytics/SystemUsageChart'
import ResourceDistributionChart from '../../../components/admin/analytics/ResourceDistributionChart'
import S3StorageAnalytics from '../../../components/admin/analytics/S3StorageAnalytics'
import ActiveSessionsTable from '../../../components/admin/analytics/ActiveSessionsTable'
import DashboardLayout from '../../../components/dashboard/DashboardLayout'
import DashboardPageLayout from '../../../components/dashboard/DashboardPageLayout'
import ProtectedRoute from '../../../components/auth/ProtectedRoute'
import { UserRole } from '../../../types/roles'

export default function AdminAnalyticsPage() {
  const { settings } = useAwsSettings()
  
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [s3Info, setS3Info] = useState<S3StorageInfo | null>(null)
  const [systemUsageData, setSystemUsageData] = useState<SystemUsageData>([])
  const [resourceDistribution, setResourceDistribution] = useState<ResourceDistribution[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAllAnalytics = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const [
        analyticsData, 
        s3Data, 
        usageHistory, 
        resourceDist, 
        sessions
      ] = await Promise.all([
        awsService.getSystemAnalytics(),
        awsService.getS3StorageInfo(),
        awsService.getSystemUsageHistory(24), // Busca últimas 24 horas
        awsService.getResourceDistribution(),
        analyticsSessionService.getActiveSessions()
      ]);

      setAnalytics(analyticsData);
      setS3Info(s3Data);
      setSystemUsageData(usageHistory);
      setResourceDistribution(resourceDist as ResourceDistribution[]); // Cast para o tipo correto
      setActiveSessions(sessions);
      setLastUpdate(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao carregar os dados de analytics.';
      setError(errorMessage);
      console.error('Erro ao buscar analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await analyticsSessionService.terminateSession(sessionId);
      setActiveSessions(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch (err) {
      console.error('Erro ao terminar sessão:', err);
      // Opcional: Adicionar um toast/notificação de erro para o usuário
    }
  };

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Analytics do Sistema"
          subtitle={lastUpdate ? `Monitoramento e estatísticas | Última atualização: ${lastUpdate.toLocaleTimeString()}` : "Monitoramento e estatísticas"}
          actions={
            <button 
              onClick={fetchAllAnalytics}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </button>
          }
        >
          <div className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Erro: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cards de Métricas Rápidas - Placeholders */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Usuários Online</h4>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{isLoading ? '...' : activeSessions.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uso de CPU</h4>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{isLoading || !analytics ? '...' : `${analytics.cpuUsage.toFixed(1)}%`}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Uso de Memória</h4>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{isLoading || !analytics ? '...' : `${analytics.memoryUsage.toFixed(1)}%`}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Armazenamento S3</h4>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{isLoading || !s3Info ? '...' : `${(s3Info.totalSizeMb / 1024).toFixed(2)} GB`}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <SystemUsageChart data={systemUsageData} loading={isLoading} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <ResourceDistributionChart data={resourceDistribution} loading={isLoading} title="Distribuição de Recursos" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Sessões Ativas</h3>
                </div>
                <ActiveSessionsTable sessions={activeSessions} onTerminateSession={handleTerminateSession} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Análise de Armazenamento S3</h3>
                <S3StorageAnalytics data={s3Info} bucketName={settings.region} />
              </div>
            </div>

          </div>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
