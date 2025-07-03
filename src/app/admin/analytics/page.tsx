'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAwsSettings } from '@/hooks/useAwsSettings'
import { awsService, SystemAnalytics, S3StorageInfo } from '@/services/awsService'
import { analyticsSessionService } from '@/services/analyticsSessionService'
import { ActiveSession, SystemUsageData, ResourceDistribution } from '@/types/analytics'
import SystemUsageChart from '@/components/admin/analytics/SystemUsageChart'
import ResourceDistributionChart from '@/components/admin/analytics/ResourceDistributionChart'
import S3StorageAnalytics from '@/components/admin/analytics/S3StorageAnalytics'
import ActiveSessionsTable from '@/components/admin/analytics/ActiveSessionsTable'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const { settings, isLoading: settingsLoading } = useAwsSettings()
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [s3Info, setS3Info] = useState<S3StorageInfo | null>(null)
  const [systemUsageData, setSystemUsageData] = useState<SystemUsageData[]>([])
  const [resourceDistribution, setResourceDistribution] = useState<ResourceDistribution[]>([])
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null)
      awsService.setSettings(settings)
      
      const [analyticsData, s3Data, usageHistory, resourceDist, sessions] = await Promise.all([
        awsService.getSystemAnalytics(),
        settings.s3BucketName ? awsService.getS3StorageInfo() : Promise.resolve(null),
        awsService.getSystemUsageHistory(24),
        awsService.getResourceDistribution(),
        analyticsSessionService.getActiveSessions()
      ])
      
      setAnalytics(analyticsData)
      setS3Info(s3Data)
      setSystemUsageData(usageHistory)
      setResourceDistribution(resourceDist)
      setActiveSessions(sessions)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics')
      console.log('Erro ao buscar analytics:', err)
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  useEffect(() => {
    if (!settingsLoading && settings.accessKeyId) {
      fetchAnalytics()
    }
  }, [fetchAnalytics, settingsLoading, settings.accessKeyId])

  useEffect(() => {
    if (!settingsLoading && settings.enableRealTimeUpdates && settings.accessKeyId) {
      const interval = setInterval(fetchAnalytics, settings.updateInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [fetchAnalytics, settings.enableRealTimeUpdates, settings.updateInterval, settingsLoading, settings.accessKeyId])

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await analyticsSessionService.terminateSession(sessionId)
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (err) {
      console.log('Erro ao terminar sessão:', err)
    }
  }

  const getPerformanceColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-error h-2 rounded-full'
    if (value >= thresholds.warning) return 'bg-accent-yellow h-2 rounded-full'
    return 'bg-accent-green h-2 rounded-full'
  }

  const getTrendIcon = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (diff > 5) return <TrendingUp className="w-4 h-4" />
    if (diff < -5) return <TrendingDown className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const getTrendColor = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (diff > 5) return 'text-accent-green'
    if (diff < -5) return 'text-error'
    return 'text-primary'
  }

  if (settingsLoading) {
    return (
      <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardLayout>
          <DashboardPageLayout
            title="Analytics do Sistema"
            subtitle="Carregando configurações..."
          >
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Carregando configurações...</div>
            </div>
          </DashboardPageLayout>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!settings.accessKeyId) {
    return (
      <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardLayout>
          <DashboardPageLayout
            title="Analytics do Sistema"
            subtitle="Monitoramento e estatísticas em tempo real"
          >
            <div className="bg-accent-yellow/20 border border-accent-yellow/30 rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-accent-yellow mr-3">⚠️</div>
                <div>
                  <h3 className="text-lg font-medium text-accent-yellow">Configuração da AWS Necessária</h3>
                  <p className="text-gray-600 mt-1">
                    Para visualizar os analytics do sistema, configure suas credenciais da AWS na página de configurações.
                  </p>
                </div>
              </div>
            </div>
          </DashboardPageLayout>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardPageLayout
          title="Analytics do Sistema"
          subtitle={`Monitoramento e estatísticas em tempo real | Última atualização: ${lastUpdate.toLocaleTimeString()}`}
        >
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-end space-x-4">
              <button className="button-secondary">
                Exportar Dados
              </button>
              <button 
                onClick={fetchAnalytics}
                disabled={isLoading}
                className="button-primary disabled:opacity-50"
              >
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>

            {/* AWS Configuration Info */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl mb-1">🌍</div>
                  <div className="text-xs text-gray-500">Região</div>
                  <div className="font-medium text-sm text-gray-600">{settings.region}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">⏱️</div>
                  <div className="text-xs text-gray-500">Intervalo</div>
                  <div className="font-medium text-sm text-gray-600">{settings.updateInterval}s</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">📊</div>
                  <div className="text-xs text-gray-500">CloudWatch</div>
                  <div className="font-medium text-sm text-accent-green">Ativo</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🗄️</div>
                  <div className="text-xs text-gray-500">S3</div>
                  <div className="font-medium text-sm text-accent-green">
                    {settings.s3BucketName ? 'Configurado' : 'Não Configurado'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl mb-1">🔄</div>
                  <div className="text-xs text-gray-500">Auto-Update</div>
                  <div className="font-medium text-sm text-accent-green">
                    {settings.enableRealTimeUpdates ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-error/20 border border-error/30 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="text-error mr-3">❌</div>
                  <div>
                    <h3 className="text-lg font-medium text-error">Erro ao Carregar Dados</h3>
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-8 bg-gray-200 rounded w-16 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))
              ) : analytics ? (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Usuários Online</div>
                    <div className="text-2xl font-bold text-gray-600">{analytics.activeUsers.toLocaleString()}</div>
                    <div className="mt-4 flex items-center">
                      <span className={`${getTrendColor(analytics.activeUsers, 1200)} text-sm`}>
                        {getTrendIcon(analytics.activeUsers, 1200)} {Math.abs(((analytics.activeUsers - 1200) / 1200) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs. média</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Aulas em Andamento</div>
                    <div className="text-2xl font-bold text-gray-600">{analytics.activeClasses}</div>
                    <div className="mt-4 flex items-center">
                      <span className={`${getTrendColor(analytics.activeClasses, 40)} text-sm`}>
                        {getTrendIcon(analytics.activeClasses, 40)} {Math.abs(((analytics.activeClasses - 40) / 40) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs. média</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Carga do Sistema</div>
                    <div className="text-2xl font-bold text-gray-600">{analytics.systemLoad}%</div>
                    <div className="mt-4 flex items-center">
                      <span className={`${getTrendColor(analytics.systemLoad, 60)} text-sm`}>
                        {getTrendIcon(analytics.systemLoad, 60)} {Math.abs(((analytics.systemLoad - 60) / 60) * 100).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs. média</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-sm font-medium text-gray-500 mb-1">Tempo de Resposta</div>
                    <div className="text-2xl font-bold text-gray-600">{analytics.responseTime}ms</div>
                    <div className="mt-4 flex items-center">
                      <span className={`${getTrendColor(analytics.responseTime, 250)} text-sm`}>
                        {getTrendIcon(analytics.responseTime, 250)} {Math.abs(analytics.responseTime - 250)}ms
                      </span>
                      <span className="text-gray-500 text-sm ml-2">vs. média</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600 mb-4">Métricas de Performance AWS</h3>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : analytics ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">CPU</span>
                        <span className="text-gray-600">{analytics.cpuUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={getPerformanceColor(analytics.cpuUsage, { warning: 70, critical: 90 })} style={{ width: `${analytics.cpuUsage}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Memória</span>
                        <span className="text-gray-600">{analytics.memoryUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={getPerformanceColor(analytics.memoryUsage, { warning: 75, critical: 90 })} style={{ width: `${analytics.memoryUsage}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Disco</span>
                        <span className="text-gray-600">{analytics.diskUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={getPerformanceColor(analytics.diskUsage, { warning: 80, critical: 95 })} style={{ width: `${analytics.diskUsage}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Rede</span>
                        <span className="text-gray-600">{analytics.networkUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={getPerformanceColor(analytics.networkUsage, { warning: 80, critical: 95 })} style={{ width: `${analytics.networkUsage}%` }}></div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Usage Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600 mb-4">Uso do Sistema</h3>
                <div className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2 animate-pulse">📈</div>
                        <p>Carregando dados...</p>
                      </div>
                    </div>
                  ) : (
                    <SystemUsageChart data={systemUsageData} height={320} />
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600 mb-4">Distribuição de Recursos</h3>
                <div className="h-80">
                  {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-4xl mb-2 animate-pulse">🥧</div>
                        <p>Carregando dados...</p>
                      </div>
                    </div>
                  ) : (
                    <ResourceDistributionChart data={resourceDistribution} height={320} />
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-600 mb-1">S3 Storage Analytics</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Análise de armazenamento e custos do bucket {settings.s3BucketName || 'S3'}
                </p>
                
                {isLoading ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-16 mb-4"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-16 bg-gray-200 rounded"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                      <div className="h-32 bg-gray-200 rounded mt-4"></div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-error/20 border border-error/30 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-error mr-3">❌</div>
                      <div>
                        <h3 className="text-lg font-medium text-error">Erro ao Carregar Dados do S3</h3>
                        <p className="text-gray-600">Verifique as configurações do bucket S3 e tente novamente.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <S3StorageAnalytics
                    data={s3Info}
                    bucketName={settings.s3BucketName}
                    region={settings.region}
                  />
                )}
              </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-600 mb-4">Sessões Ativas</h3>
              </div>
              {isLoading ? (
                <div className="p-6">
                  <div className="animate-pulse space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex space-x-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <ActiveSessionsTable 
                  sessions={activeSessions}
                  onTerminateSession={handleTerminateSession}
                />
              )}
            </div>
          </div>
        </DashboardPageLayout>
    </ProtectedRoute>
  )
}
