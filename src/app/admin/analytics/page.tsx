'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAwsSettings } from '@/hooks/useAwsSettings'
import { awsService, SystemAnalytics, S3StorageInfo } from '@/services/awsService'
<<<<<<< HEAD
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
=======
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Monitor, 
  Database, 
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  BarChart3,
  Globe,
  HardDrive,
  Shield
} from 'lucide-react'
>>>>>>> master

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
<<<<<<< HEAD
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
=======
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando configurações...</p>
        </div>
      </div>
>>>>>>> master
    )
  }

  if (!settings.accessKeyId) {
    return (
<<<<<<< HEAD
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
=======
      <div className="min-h-screen bg-background-secondary">
        <div className="container-responsive py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="page-title">Analytics do Sistema</h1>
                <p className="page-subtitle">Monitoramento e estatísticas em tempo real</p>
              </div>
            </div>
          </div>

          <div className="card-modern">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-warning/20 to-accent-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-warning" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Configuração da AWS Necessária
              </h3>
              <p className="text-text-secondary mb-6">
                Para visualizar os analytics do sistema, configure suas credenciais da AWS na página de configurações.
              </p>
              <button className="button-primary">
                Ir para Configurações
              </button>
>>>>>>> master
            </div>
          </DashboardPageLayout>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
<<<<<<< HEAD
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
=======
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <div className="bg-background-card border-b border-border-light sticky top-0 z-10 backdrop-blur-xl">
        <div className="container-responsive py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="page-title">Analytics do Sistema</h1>
                <p className="page-subtitle">
                  Monitoramento em tempo real | Última atualização: {lastUpdate.toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="button-outline group inline-flex items-center gap-2">
                <Download className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Exportar Dados
              </button>
              <button 
                onClick={fetchAnalytics}
                disabled={isLoading}
                className="button-primary group inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:scale-110'} transition-transform duration-200`} />
                {isLoading ? 'Atualizando...' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        {/* AWS Configuration Info */}
        <div className="card-modern mb-8">
          <div className="p-6">
            <h2 className="section-title mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Configuração AWS
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div className="text-xs text-text-tertiary mb-1">Região</div>
                <div className="font-semibold text-text-primary">{settings.region}</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-xs text-text-tertiary mb-1">Intervalo</div>
                <div className="font-semibold text-text-primary">{settings.updateInterval}s</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Monitor className="w-6 h-6 text-accent-green" />
                </div>
                <div className="text-xs text-text-tertiary mb-1">CloudWatch</div>
                <div className="font-semibold text-accent-green">Ativo</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <HardDrive className="w-6 h-6 text-accent-purple" />
                </div>
                <div className="text-xs text-text-tertiary mb-1">S3 Storage</div>
                <div className={`font-semibold ${settings.s3BucketName ? 'text-accent-green' : 'text-text-muted'}`}>
                  {settings.s3BucketName ? 'Configurado' : 'Não Configurado'}
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent-orange/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-accent-orange" />
                </div>
                <div className="text-xs text-text-tertiary mb-1">Auto-Update</div>
                <div className={`font-semibold ${settings.enableRealTimeUpdates ? 'text-accent-green' : 'text-text-muted'}`}>
                  {settings.enableRealTimeUpdates ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="card mb-8 border-l-4 border-l-error">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-error/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-error" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-error mb-2">Erro ao Carregar Dados</h3>
                  <p className="text-text-secondary">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="p-6">
                  <div className="h-4 bg-background-tertiary rounded w-24 mb-2"></div>
                  <div className="h-8 bg-background-tertiary rounded w-16 mb-4"></div>
                  <div className="h-4 bg-background-tertiary rounded w-20"></div>
                </div>
              </div>
            ))
          ) : analytics ? (
            <>
              <div className="stat-card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Usuários Online</p>
                    <p className="stat-value text-primary">{analytics.activeUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`${getTrendColor(analytics.activeUsers, 1200)} text-sm flex items-center gap-1`}>
                        {getTrendIcon(analytics.activeUsers, 1200)}
                        {Math.abs(((analytics.activeUsers - 1200) / 1200) * 100).toFixed(1)}%
                      </span>
                      <span className="text-text-tertiary text-sm">vs. média</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Aulas Ativas</p>
                    <p className="stat-value text-secondary">{analytics.activeClasses}</p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={`${getTrendColor(analytics.activeClasses, 40)} text-sm flex items-center gap-1`}>
                        {getTrendIcon(analytics.activeClasses, 40)}
                        {Math.abs(((analytics.activeClasses - 40) / 40) * 100).toFixed(1)}%
                      </span>
                      <span className="text-text-tertiary text-sm">vs. média</span>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-secondary" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">CPU Usage</p>
                    <p className="stat-value text-accent-green">{analytics.cpuUsage.toFixed(1)}%</p>
                    <div className="w-full bg-background-tertiary rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-accent-green to-secondary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center">
                    <Server className="w-8 h-8 text-accent-green" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-label">Memory Usage</p>
                    <p className="stat-value text-accent-purple">{analytics.memoryUsage.toFixed(1)}%</p>
                    <div className="w-full bg-background-tertiary rounded-full h-2 mt-3">
                      <div 
                        className="bg-gradient-to-r from-accent-purple to-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${analytics.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-accent-purple/10 rounded-2xl flex items-center justify-center">
                    <Database className="w-8 h-8 text-accent-purple" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">
                Nenhum dado disponível
              </h3>
              <p className="text-text-secondary">
                Os dados de analytics não estão disponíveis no momento.
              </p>
            </div>
          )}
        </div>

        {/* Performance Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card-modern">
              <div className="p-6">
                <h3 className="section-title mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Performance do Sistema
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">CPU Usage</span>
                      <span className="text-sm text-text-secondary">{analytics.cpuUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-background-tertiary rounded-full h-3">
                      <div 
                        className={getPerformanceColor(analytics.cpuUsage, { warning: 70, critical: 90 })}
                        style={{ width: `${analytics.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">Memory Usage</span>
                      <span className="text-sm text-text-secondary">{analytics.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-background-tertiary rounded-full h-3">
                      <div 
                        className={getPerformanceColor(analytics.memoryUsage, { warning: 80, critical: 95 })}
                        style={{ width: `${analytics.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-text-primary">Response Time</span>
                      <span className="text-sm text-text-secondary">{analytics.responseTime}ms</span>
                    </div>
                    <div className="w-full bg-background-tertiary rounded-full h-3">
                      <div 
                        className={getPerformanceColor(analytics.responseTime, { warning: 500, critical: 1000 })}
                        style={{ width: `${Math.min((analytics.responseTime / 1000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {s3Info && (
              <div className="card-modern">
                <div className="p-6">
                  <h3 className="section-title mb-6 flex items-center gap-2">
                    <HardDrive className="w-5 h-5 text-accent-purple" />
                    Storage S3
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="stat-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="stat-label">Total de Objetos</p>
                          <p className="stat-value text-primary">{s3Info.objectCount.toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Database className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="stat-label">Tamanho Total</p>
                          <p className="stat-value text-secondary">{s3Info.bucketSize.toFixed(2)} GB</p>
                        </div>
                        <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                          <HardDrive className="w-6 h-6 text-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* System Status */}
        <div className="card-modern">
          <div className="p-6">
            <h3 className="section-title mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent-green" />
              Status do Sistema
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent-green" />
                </div>
                <h4 className="font-bold text-text-primary mb-2">API Status</h4>
                <p className="text-accent-green font-medium">Operacional</p>
                <p className="text-sm text-text-tertiary mt-1">99.9% uptime</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Database className="w-8 h-8 text-accent-green" />
                </div>
                <h4 className="font-bold text-text-primary mb-2">Database</h4>
                <p className="text-accent-green font-medium">Conectado</p>
                <p className="text-sm text-text-tertiary mt-1">Latência: 45ms</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Server className="w-8 h-8 text-accent-green" />
                </div>
                <h4 className="font-bold text-text-primary mb-2">Servidores</h4>
                <p className="text-accent-green font-medium">Saudável</p>
                <p className="text-sm text-text-tertiary mt-1">3/3 instâncias ativas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
>>>>>>> master
  )
}
