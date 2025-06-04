'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAwsSettings } from '@/hooks/useAwsSettings'
// import { awsService, SystemAnalytics, S3StorageInfo } from '@/services/awsService' // To be replaced by apiClient
import { apiClient, ApiClientError } from '@/services/apiClient'; // Added
import { ApiResponse } from '@/types/api'; // Corrected import path for ApiResponse
import { SystemAnalytics, S3StorageInfo } from '@/services/awsService'; // Keep types for now, or move them
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

// Endpoints de API para AWS Analytics
const AWS_API_ENDPOINTS = {
  systemAnalytics: '/api/admin/aws/system-analytics',
  s3StorageInfo: '/api/admin/aws/s3-storage-info',
  cloudWatchMetrics: '/api/admin/aws/cloudwatch-metrics',
  instanceStatus: '/api/admin/aws/instance-status',
  configTest: '/api/admin/aws/test-config'
}

// Mock de dados de tendência para comparação histórica
const TREND_BASELINES = {
  activeUsers: 900,
  activeClasses: 25,
  systemLoad: 40,
  responseTime: 180,
  cpuUsage: 35,
  memoryUsage: 45,
  diskUsage: 25,
  networkUsage: 60
}

const REGION_NAMES = {
  'sa-east-1': 'América do Sul (São Paulo)',
  'us-east-1': 'Leste dos EUA (Norte da Virgínia)',
  'us-east-2': 'Leste dos EUA (Ohio)',
  'us-west-1': 'Oeste dos EUA (N. Califórnia)',
  'us-west-2': 'Oeste dos EUA (Oregon)',
  'eu-west-1': 'UE (Irlanda)',
  'eu-central-1': 'UE (Frankfurt)'
}

export default function AdminAnalyticsPage() {
  const { user } = useAuth()
  const { settings, updateSettings, isLoading: settingsLoading } = useAwsSettings()
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null)
  const [s3Info, setS3Info] = useState<S3StorageInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<{success: boolean; message: string} | null>(null)

  // Função para testar configuração AWS
  const testAwsConnection = async () => {
    if (!settings.accessKeyId || !settings.secretAccessKey) {
      setTestResult({
        success: false,
        message: 'Credenciais AWS não configuradas'
      })
      return
    }

    try {
      setTestingConnection(true)
      setError(null)
      
      const response = await apiClient.post(AWS_API_ENDPOINTS.configTest, {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
        region: settings.region
      })
      
      if (response.data) {
        setTestResult(response.data as {success: boolean; message: string})
      } else {
        setTestResult({
          success: response.success,
          message: response.message || 'Teste concluído'
        })
      }
      
      if (response.success) {
        // Salvamos a última conexão bem-sucedida usando localStorage diretamente
        // já que o hook não possui essa propriedade
        localStorage.setItem('aws_last_test_success', new Date().toISOString())
      }
    } catch (err) {
      const errorMessage = err instanceof ApiClientError 
        ? err.message 
        : (err instanceof Error ? err.message : 'Erro desconhecido ao testar conexão')
      
      setTestResult({
        success: false,
        message: errorMessage
      })
      
      console.error('Erro ao testar conexão AWS:', err)
    } finally {
      setTestingConnection(false)
    }
  }

  const fetchAnalytics = useCallback(async () => {
    if (!settings.accessKeyId && !settingsLoading) { 
      setIsLoading(false)
      setError("Configuração da AWS não encontrada para buscar analytics.")
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      
      // Criando um payload com as credenciais AWS para cada requisição
      // Isso permite que as APIs do backend usem as credenciais sem armazená-las no servidor
      const awsConfig = {
        accessKeyId: settings.accessKeyId,
        secretAccessKey: settings.secretAccessKey,
        region: settings.region
      }
      
      // Requisições paralelas para as APIs
      const analyticsPromise = apiClient.post<SystemAnalytics>(
        AWS_API_ENDPOINTS.systemAnalytics, 
        awsConfig
      )
      
      let s3Promise: Promise<ApiResponse<S3StorageInfo | null>> = Promise.resolve({ 
        success: true, 
        data: null, 
        message: "S3 Bucket não configurado" 
      })
      
      if (settings.s3BucketName) {
        s3Promise = apiClient.post<S3StorageInfo>(
          AWS_API_ENDPOINTS.s3StorageInfo, 
          {
            ...awsConfig,
            bucketName: settings.s3BucketName
          }
        )
      }
      
      const [analyticsResponse, s3Response] = await Promise.all([
        analyticsPromise,
        s3Promise
      ])
      
      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data)
      } else {
        console.error("Falha ao buscar system analytics:", analyticsResponse.message)
        setError(analyticsResponse.message || 'Falha ao buscar system analytics.')
      }

      if (s3Response.success && s3Response.data) {
        setS3Info(s3Response.data)
      } else if (!s3Response.success) {
        console.warn("Falha ao buscar S3 info:", s3Response.message)
      }
      
      setLastUpdate(new Date())
    } catch (err) {
      const errorMessage = err instanceof ApiClientError 
        ? err.message 
        : (err instanceof Error ? err.message : 'Erro desconhecido ao carregar analytics')
      setError(errorMessage)
      console.error('Erro ao buscar analytics via API:', err)
    } finally {
      setIsLoading(false)
    }
  }, [settings, settingsLoading])

  useEffect(() => {
    if (!settingsLoading && settings.accessKeyId) {
      fetchAnalytics()
    } else if (!settingsLoading && !settings.accessKeyId) {
      setIsLoading(false)
      setError("Configuração da AWS não encontrada. Verifique as configurações.")
    }
  }, [fetchAnalytics, settingsLoading, settings.accessKeyId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (!settingsLoading && settings.enableRealTimeUpdates && settings.accessKeyId) {
      interval = setInterval(fetchAnalytics, (settings.updateInterval || 60) * 1000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [fetchAnalytics, settings.enableRealTimeUpdates, settings.updateInterval, settingsLoading, settings.accessKeyId])

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

  // Função para formatar bytes em unidades legíveis
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Exporta dados analytics para CSV
  const exportAnalyticsCSV = () => {
    if (!analytics) return
    
    const csvContent = [
      'Métrica,Valor,Unidade,Data',
      `Usuários Ativos,${analytics.activeUsers},usuários,${lastUpdate.toISOString()}`,
      `Turmas Ativas,${analytics.activeClasses},turmas,${lastUpdate.toISOString()}`,
      `Carga do Sistema,${analytics.systemLoad},%,${lastUpdate.toISOString()}`,
      `Tempo de Resposta,${analytics.responseTime},ms,${lastUpdate.toISOString()}`,
      `Uso de CPU,${analytics.cpuUsage},%,${lastUpdate.toISOString()}`,
      `Uso de Memória,${analytics.memoryUsage},%,${lastUpdate.toISOString()}`,
      `Uso de Disco,${analytics.diskUsage},%,${lastUpdate.toISOString()}`,
      `Uso de Rede,${analytics.networkUsage},%,${lastUpdate.toISOString()}`
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics-sistema-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  if (!settings.accessKeyId) {
    return (
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
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-warning/20 to-accent-orange/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-warning" />
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">
                  Configuração da AWS Necessária
                </h3>
                <p className="text-text-secondary mb-6">
                  Para visualizar os analytics do sistema, configure suas credenciais da AWS abaixo.
                </p>
              </div>
              
              {/* Formulário de Configuração AWS */}
              <div className="bg-background-secondary p-6 rounded-xl border border-border-light mb-6">
                <h4 className="font-medium text-lg mb-4">Configurações da AWS</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Access Key ID
                    </label>
                    <input
                      type="text"
                      value={settings.accessKeyId}
                      onChange={(e) => updateSettings({ accessKeyId: e.target.value })}
                      className="w-full p-2 border border-border-light rounded-lg bg-background-card focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      ID da chave de acesso AWS IAM
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Secret Access Key
                    </label>
                    <input
                      type="password"
                      value={settings.secretAccessKey}
                      onChange={(e) => updateSettings({ secretAccessKey: e.target.value })}
                      className="w-full p-2 border border-border-light rounded-lg bg-background-card focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      Chave secreta da AWS (nunca compartilhe esta chave)
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Região
                    </label>
                    <select
                      value={settings.region}
                      onChange={(e) => updateSettings({ region: e.target.value })}
                      className="w-full p-2 border border-border-light rounded-lg bg-background-card focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="sa-east-1">América do Sul (São Paulo)</option>
                      <option value="us-east-1">Leste dos EUA (Norte da Virgínia)</option>
                      <option value="us-east-2">Leste dos EUA (Ohio)</option>
                      <option value="us-west-1">Oeste dos EUA (N. Califórnia)</option>
                      <option value="us-west-2">Oeste dos EUA (Oregon)</option>
                      <option value="eu-west-1">UE (Irlanda)</option>
                      <option value="eu-central-1">UE (Frankfurt)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Nome do Bucket S3
                    </label>
                    <input
                      type="text"
                      value={settings.s3BucketName}
                      onChange={(e) => updateSettings({ s3BucketName: e.target.value })}
                      className="w-full p-2 border border-border-light rounded-lg bg-background-card focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="meu-bucket-portal"
                    />
                    <p className="text-xs text-text-tertiary mt-1">
                      Opcional - para monitoramento de armazenamento
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">
                      Intervalo de Atualização (segundos)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="600"
                      value={settings.updateInterval}
                      onChange={(e) => updateSettings({ updateInterval: parseInt(e.target.value) || 30 })}
                      className="w-full p-2 border border-border-light rounded-lg bg-background-card focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <div className="flex items-center mb-6">
                  <input
                    type="checkbox"
                    id="enableRealTimeUpdates"
                    checked={settings.enableRealTimeUpdates}
                    onChange={(e) => updateSettings({ enableRealTimeUpdates: e.target.checked })}
                    className="w-4 h-4 text-primary focus:ring-primary rounded"
                  />
                  <label htmlFor="enableRealTimeUpdates" className="ml-2 text-sm text-text-secondary">
                    Habilitar atualizações em tempo real
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <button
                    onClick={testAwsConnection}
                    disabled={testingConnection || !settings.accessKeyId || !settings.secretAccessKey}
                    className="button-outline inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {testingConnection ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Testar Conexão
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={fetchAnalytics}
                    disabled={!settings.accessKeyId || !settings.secretAccessKey}
                    className="button-primary inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Monitor className="w-4 h-4" />
                    Salvar e Acessar Analytics
                  </button>
                </div>
                
                {/* Resultado do teste */}
                {testResult && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    testResult.success ? 'bg-accent-green/10 text-accent-green' : 'bg-error/10 text-error'
                  }`}>
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      )}
                      <p className="text-sm">{testResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-background-secondary p-6 rounded-xl border border-border-light">
                <h4 className="font-medium text-lg mb-4">Informações Importantes</h4>
                
                <div className="space-y-2 text-sm text-text-secondary">
                  <p className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Suas credenciais são armazenadas apenas localmente no navegador e nunca são compartilhadas.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Server className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>Recomendamos criar um usuário IAM específico com permissões limitadas apenas para CloudWatch e S3.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>Nunca use suas credenciais de usuário root da AWS.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
                <div className="font-semibold text-text-primary">{REGION_NAMES[settings.region as keyof typeof REGION_NAMES] || settings.region}</div>
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

        {/* CloudWatch Metrics */}
        <div className="card-modern mb-8">
          <div className="p-6">
            <h2 className="section-title mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Métricas CloudWatch
            </h2>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="loading-spinner w-8 h-8"></div>
              </div>
            ) : error ? (
              <div className="bg-error/5 border border-error/10 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-error" />
                  <p className="text-error">{error}</p>
                </div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Métricas de CloudWatch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* CPU Usage */}
                  <div className="bg-background-secondary p-4 rounded-lg border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Server className="w-4 h-4 text-primary" />
                        Uso de CPU
                      </h3>
                      <div className={`${getTrendColor(analytics.cpuUsage, TREND_BASELINES.cpuUsage)} flex items-center gap-1`}>
                        {getTrendIcon(analytics.cpuUsage, TREND_BASELINES.cpuUsage)}
                        <span className="text-sm">{analytics.cpuUsage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-card rounded-full h-2 mb-1">
                      <div 
                        className={getPerformanceColor(analytics.cpuUsage, { warning: 70, critical: 90 })}
                        style={{ width: `${analytics.cpuUsage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-tertiary">
                      {analytics.cpuUsage < 50 ? 'Utilização normal' : 
                       analytics.cpuUsage < 80 ? 'Utilização moderada' : 'Utilização alta'}
                    </p>
                  </div>
                  
                  {/* Memory Usage */}
                  <div className="bg-background-secondary p-4 rounded-lg border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Database className="w-4 h-4 text-primary" />
                        Uso de Memória
                      </h3>
                      <div className={`${getTrendColor(analytics.memoryUsage, TREND_BASELINES.memoryUsage)} flex items-center gap-1`}>
                        {getTrendIcon(analytics.memoryUsage, TREND_BASELINES.memoryUsage)}
                        <span className="text-sm">{analytics.memoryUsage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-card rounded-full h-2 mb-1">
                      <div 
                        className={getPerformanceColor(analytics.memoryUsage, { warning: 75, critical: 90 })}
                        style={{ width: `${analytics.memoryUsage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-text-tertiary">
                      {analytics.memoryUsage < 60 ? 'Utilização normal' : 
                       analytics.memoryUsage < 85 ? 'Utilização moderada' : 'Utilização alta'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Disk Usage */}
                  <div className="bg-background-secondary p-4 rounded-lg border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-primary" />
                        Uso de Disco
                      </h3>
                      <div className={`${getTrendColor(analytics.diskUsage, TREND_BASELINES.diskUsage)} flex items-center gap-1`}>
                        {getTrendIcon(analytics.diskUsage, TREND_BASELINES.diskUsage)}
                        <span className="text-sm">{analytics.diskUsage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-card rounded-full h-2"></div>
                    <div 
                      className={getPerformanceColor(analytics.diskUsage, { warning: 80, critical: 90 })}
                      style={{ width: `${analytics.diskUsage}%`, height: '0.5rem', borderRadius: '9999px', marginTop: '-0.5rem' }}
                    ></div>
                  </div>
                  
                  {/* Network Usage */}
                  <div className="bg-background-secondary p-4 rounded-lg border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Rede
                      </h3>
                      <div className={`${getTrendColor(analytics.networkUsage, TREND_BASELINES.networkUsage)} flex items-center gap-1`}>
                        {getTrendIcon(analytics.networkUsage, TREND_BASELINES.networkUsage)}
                        <span className="text-sm">{analytics.networkUsage}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-card rounded-full h-2"></div>
                    <div 
                      className={getPerformanceColor(analytics.networkUsage, { warning: 70, critical: 90 })}
                      style={{ width: `${analytics.networkUsage}%`, height: '0.5rem', borderRadius: '9999px', marginTop: '-0.5rem' }}
                    ></div>
                  </div>
                  
                  {/* Response Time */}
                  <div className="bg-background-secondary p-4 rounded-lg border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Tempo de Resposta
                      </h3>
                      <div className={`${getTrendColor(analytics.responseTime, TREND_BASELINES.responseTime)} flex items-center gap-1`}>
                        {getTrendIcon(analytics.responseTime, TREND_BASELINES.responseTime)}
                        <span className="text-sm">{analytics.responseTime} ms</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-card rounded-full h-2"></div>
                    <div 
                      className={getPerformanceColor(analytics.responseTime/5, { warning: 60, critical: 80 })}
                      style={{ width: `${Math.min(100, analytics.responseTime / 5)}%`, height: '0.5rem', borderRadius: '9999px', marginTop: '-0.5rem' }}
                    ></div>
                  </div>
                  
                  {/* System Load */}
                  <div className="bg-background-secondary p-4 rounded-lg border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Carga do Sistema
                      </h3>
                      <div className={`${getTrendColor(analytics.systemLoad, TREND_BASELINES.systemLoad)} flex items-center gap-1`}>
                        {getTrendIcon(analytics.systemLoad, TREND_BASELINES.systemLoad)}
                        <span className="text-sm">{analytics.systemLoad}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-background-card rounded-full h-2"></div>
                    <div 
                      className={getPerformanceColor(analytics.systemLoad, { warning: 70, critical: 90 })}
                      style={{ width: `${analytics.systemLoad}%`, height: '0.5rem', borderRadius: '9999px', marginTop: '-0.5rem' }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-warning/5 border border-warning/10 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <p className="text-warning">Nenhum dado disponível. Clique em Atualizar para buscar os dados.</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-end gap-4 mb-8">
          <button 
            onClick={() => {
              // Abrir um modal ou página de configurações
              // Por enquanto apenas exibe as configurações atuais
              console.log('Configurações AWS atuais:', settings);
            }}
            className="button-outline flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Gerenciar Configurações AWS
          </button>
          
          <button
            onClick={exportAnalyticsCSV}
            disabled={!analytics}
            className="button-outline flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar Dados CSV
          </button>
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
                          <p className="stat-value text-secondary">{formatBytes(s3Info.bucketSize)}</p>
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
  )
}
