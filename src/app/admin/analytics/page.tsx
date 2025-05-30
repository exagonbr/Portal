'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAwsSettings } from '@/hooks/useAwsSettings'
import { awsService, SystemAnalytics, S3StorageInfo } from '@/services/awsService'

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const { settings, isLoading: settingsLoading } = useAwsSettings()
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [s3Info, setS3Info] = useState<S3StorageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null)
      awsService.setSettings(settings)
      
      const [analyticsData, s3Data] = await Promise.all([
        awsService.getSystemAnalytics(),
        settings.s3BucketName ? awsService.getS3StorageInfo() : Promise.resolve(null)
      ])
      
      setAnalytics(analyticsData)
      setS3Info(s3Data)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar analytics')
      console.error('Erro ao buscar analytics:', err)
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

  const getPerformanceColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'bg-error h-2 rounded-full'
    if (value >= thresholds.warning) return 'bg-accent-yellow h-2 rounded-full'
    return 'bg-accent-green h-2 rounded-full'
  }

  const getTrendIcon = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (diff > 5) return '↑'
    if (diff < -5) return '↓'
    return '='
  }

  const getTrendColor = (value: number, baseline: number) => {
    const diff = ((value - baseline) / baseline) * 100
    if (diff > 5) return 'text-accent-green'
    if (diff < -5) return 'text-error'
    return 'text-accent-blue'
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando configurações...</div>
      </div>
    )
  }

  if (!settings.accessKeyId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Analytics do Sistema</h1>
            <p className="text-gray-600">Monitoramento e estatísticas em tempo real</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Configuração da AWS Necessária</h3>
              <p className="text-yellow-700 mt-1">
                Para visualizar os analytics do sistema, configure suas credenciais da AWS na página de configurações.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Analytics do Sistema</h1>
          <p className="text-gray-600">
            Monitoramento e estatísticas em tempo real | Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Exportar Dados
          </button>
          <button 
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* AWS Configuration Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🌍</div>
            <div className="text-xs text-gray-600">Região</div>
            <div className="font-medium text-sm">{settings.region}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⏱️</div>
            <div className="text-xs text-gray-600">Intervalo</div>
            <div className="font-medium text-sm">{settings.updateInterval}s</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xs text-gray-600">CloudWatch</div>
            <div className="font-medium text-sm text-green-600">Ativo</div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🗄️</div>
            <div className="text-xs text-gray-600">S3</div>
            <div className="font-medium text-sm text-green-600">
              {settings.s3BucketName ? 'Configurado' : 'Não Configurado'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🔄</div>
            <div className="text-xs text-gray-600">Auto-Update</div>
            <div className="font-medium text-sm text-green-600">
              {settings.enableRealTimeUpdates ? 'Ativo' : 'Inativo'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">❌</div>
            <div>
              <h3 className="text-lg font-medium text-red-800">Erro ao Carregar Dados</h3>
              <p className="text-red-700">{error}</p>
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
              <div className="text-2xl font-bold text-gray-800">{analytics.activeUsers.toLocaleString()}</div>
              <div className="mt-4 flex items-center">
                <span className={`${getTrendColor(analytics.activeUsers, 1200)} text-sm`}>
                  {getTrendIcon(analytics.activeUsers, 1200)} {Math.abs(((analytics.activeUsers - 1200) / 1200) * 100).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm ml-2">vs. média</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Aulas em Andamento</div>
              <div className="text-2xl font-bold text-gray-800">{analytics.activeClasses}</div>
              <div className="mt-4 flex items-center">
                <span className={`${getTrendColor(analytics.activeClasses, 40)} text-sm`}>
                  {getTrendIcon(analytics.activeClasses, 40)} {Math.abs(((analytics.activeClasses - 40) / 40) * 100).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm ml-2">vs. média</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Carga do Sistema</div>
              <div className="text-2xl font-bold text-gray-800">{analytics.systemLoad}%</div>
              <div className="mt-4 flex items-center">
                <span className={`${getTrendColor(analytics.systemLoad, 60)} text-sm`}>
                  {getTrendIcon(analytics.systemLoad, 60)} {Math.abs(((analytics.systemLoad - 60) / 60) * 100).toFixed(1)}%
                </span>
                <span className="text-gray-500 text-sm ml-2">vs. média</span>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm font-medium text-gray-500 mb-1">Tempo de Resposta</div>
              <div className="text-2xl font-bold text-gray-800">{analytics.responseTime}ms</div>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Métricas de Performance AWS</h3>
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
                  <span className="text-gray-800">{analytics.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={getPerformanceColor(analytics.cpuUsage, { warning: 70, critical: 90 })} style={{ width: `${analytics.cpuUsage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Memória</span>
                  <span className="text-gray-800">{analytics.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={getPerformanceColor(analytics.memoryUsage, { warning: 75, critical: 90 })} style={{ width: `${analytics.memoryUsage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Disco</span>
                  <span className="text-gray-800">{analytics.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={getPerformanceColor(analytics.diskUsage, { warning: 80, critical: 95 })} style={{ width: `${analytics.diskUsage}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Rede</span>
                  <span className="text-gray-800">{analytics.networkUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={getPerformanceColor(analytics.networkUsage, { warning: 80, critical: 95 })} style={{ width: `${analytics.networkUsage}%` }}></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">S3 Storage Analytics</h3>
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ) : s3Info ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tamanho Total</p>
                  <p className="text-xl font-bold text-primary">{s3Info.bucketSize.toFixed(2)} GB</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Arquivos</p>
                  <p className="text-xl font-bold text-primary">{s3Info.objectCount.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Custo Mensal</p>
                  <p className="text-lg font-semibold text-green-600">${s3Info.monthlyCost.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Modificação</p>
                  <p className="text-sm text-gray-700">{s3Info.lastModified.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Bucket: {settings.s3BucketName}</p>
                <p className="text-xs text-gray-600">Região: {settings.region}</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <p>S3 não configurado</p>
              <p className="text-sm mt-1">Configure o bucket S3 nas configurações</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Uso do Sistema</h3>
          <div className="h-80 bg-gray-50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">📈</div>
                <p>Gráfico de Uso</p>
                <p className="text-sm mt-1">Dados do CloudWatch ({settings.cloudWatchNamespace})</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Recursos</h3>
          <div className="h-80 bg-gray-50 rounded-lg">
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-2">🥧</div>
                <p>Gráfico de Distribuição</p>
                <p className="text-sm mt-1">Métricas AWS integradas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sessões Ativas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dispositivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">João Silva</div>
                      <div className="text-sm text-gray-500">Professor</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  192.168.1.1
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  São Paulo, BR
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Chrome / Windows
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  45min
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-accent-green/20 text-accent-green">
                    Ativo
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
