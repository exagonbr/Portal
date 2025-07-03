'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'
import { useAwsSettings } from '@/hooks/useAwsSettings'
import { 
  Cloud, 
  Key, 
  Database, 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Server,
  HardDrive,
  Monitor,
  Wifi,
  Lock,
  Unlock,
  Save,
  RotateCcw,
  Info,
  ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface AwsConnectionTest {
  service: string
  status: 'success' | 'error' | 'testing' | 'idle'
  message?: string
  details?: any
}

interface AwsMetrics {
  s3: {
    buckets: number
    totalSize: string
    lastBackup: string
  }
  cloudwatch: {
    activeMetrics: number
    lastUpdate: string
  }
  ec2: {
    instances: number
    runningInstances: number
  }
}

export default function AdminAwsPage() {
  const { user } = useAuth()
  const { settings, updateSettings, resetSettings, testConnection, isLoading, error } = useAwsSettings()
  
  // Estados locais
  const [localSettings, setLocalSettings] = useState(settings)
  const [showSecrets, setShowSecrets] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [connectionTests, setConnectionTests] = useState<AwsConnectionTest[]>([
    { service: 'S3', status: 'idle' },
    { service: 'CloudWatch', status: 'idle' },
    { service: 'EC2', status: 'idle' },
    { service: 'IAM', status: 'idle' }
  ])
  const [awsMetrics, setAwsMetrics] = useState<AwsMetrics | null>(null)
  const [activeTab, setActiveTab] = useState('credentials')

  // Regiões AWS disponíveis
  const awsRegions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-1', label: 'US West (N. California)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'eu-central-1', label: 'Europe (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' }
  ]

  // Sincronizar configurações
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  // Detectar mudanças
  useEffect(() => {
    const hasChanges = JSON.stringify(localSettings) !== JSON.stringify(settings)
    setIsDirty(hasChanges)
  }, [localSettings, settings])

  // Atualizar configuração local
  const handleSettingChange = (key: keyof typeof localSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Salvar configurações
  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await updateSettings(localSettings)
      if (success) {
        toast.success('Configurações AWS salvas com sucesso!')
        setIsDirty(false)
      } else {
        toast.error('Erro ao salvar configurações AWS')
      }
    } catch (error) {
      toast.error('Erro ao salvar configurações AWS')
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  // Resetar configurações
  const handleReset = async () => {
    if (confirm('Tem certeza que deseja resetar todas as configurações AWS?')) {
      const success = await resetSettings()
      if (success) {
        setLocalSettings(settings)
        toast.success('Configurações AWS resetadas')
      } else {
        toast.error('Erro ao resetar configurações AWS')
      }
    }
  }

  // Testar conexão com serviço específico
  const testServiceConnection = async (service: string) => {
    setConnectionTests(prev => 
      prev.map(test => 
        test.service === service 
          ? { ...test, status: 'testing', message: undefined }
          : test
      )
    )

    try {
      const result = await testConnection(localSettings)
      
      if (result.success && result.services) {
        const serviceKey = service.toLowerCase()
        const serviceResult = result.services[serviceKey]
        
        if (serviceResult) {
          setConnectionTests(prev => 
            prev.map(test => 
              test.service === service 
                ? { 
                    ...test, 
                    status: serviceResult.status as any, 
                    message: serviceResult.message 
                  }
                : test
            )
          )

          if (serviceResult.status === 'success') {
            toast.success(`${service} conectado com sucesso!`)
          } else {
            toast.error(`Erro ao conectar com ${service}`)
          }
        }
      } else {
        throw new Error(result.message || 'Erro ao testar conexão')
      }
    } catch (error) {
      setConnectionTests(prev => 
        prev.map(test => 
          test.service === service 
            ? { ...test, status: 'error', message: 'Erro de conexão' }
            : test
        )
      )
      toast.error(`Erro ao testar ${service}`)
    }
  }

  // Testar todas as conexões
  const testAllConnections = async () => {
    for (const test of connectionTests) {
      await testServiceConnection(test.service)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Carregar métricas AWS
  const loadAwsMetrics = async () => {
    try {
      // Mock de métricas
      setAwsMetrics({
        s3: {
          buckets: 5,
          totalSize: '2.4 GB',
          lastBackup: new Date().toLocaleString()
        },
        cloudwatch: {
          activeMetrics: 24,
          lastUpdate: new Date().toLocaleString()
        },
        ec2: {
          instances: 3,
          runningInstances: 2
        }
      })
    } catch (error) {
      console.error('Erro ao carregar métricas:', error)
    }
  }

  // Copiar credencial para clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado para clipboard!')
  }

  useEffect(() => {
    loadAwsMetrics()
  }, [])

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardPageLayout
          title="Configurações AWS"
          subtitle="Gerencie as configurações da Amazon Web Services"
        >
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DashboardPageLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Configurações AWS"
        subtitle="Gerencie as configurações da Amazon Web Services"
      >
        <div className="space-y-6">
          {/* Header com ações */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Cloud className="w-6 h-6 text-orange-500" />
              <span className="text-lg font-semibold">Amazon Web Services</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={testAllConnections}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <TestTube className="w-4 h-4" />
                <span>Testar Conexões</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Resetar</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>

          {/* Status das mudanças */}
          {isDirty && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center">
                <Info className="w-5 h-5 text-amber-600 mr-2" />
                <span className="text-amber-800">
                  Existem alterações não salvas. Clique em "Salvar" para aplicar as mudanças.
                </span>
              </div>
            </div>
          )}

          {/* Erro na API */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-red-800">
                  Erro ao carregar configurações: {error}
                </span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'credentials', label: 'Credenciais', icon: Key },
                { id: 'services', label: 'Serviços', icon: Server },
                { id: 'monitoring', label: 'Monitoramento', icon: Monitor },
                { id: 'security', label: 'Segurança', icon: Shield }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Conteúdo das Tabs */}
          <div className="space-y-6">
            {/* Tab Credenciais */}
            {activeTab === 'credentials' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurações de Credenciais */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Credenciais de Acesso
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Access Key ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Access Key ID
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          value={localSettings.accessKeyId}
                          onChange={(e) => handleSettingChange('accessKeyId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-20"
                          placeholder="AKIA..."
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(localSettings.accessKeyId)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Secret Access Key */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Secret Access Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets ? 'text' : 'password'}
                          value={localSettings.secretAccessKey}
                          onChange={(e) => handleSettingChange('secretAccessKey', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-20"
                          placeholder="Sua secret key..."
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(localSettings.secretAccessKey)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowSecrets(!showSecrets)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Região */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Região AWS
                      </label>
                      <select
                        value={localSettings.region}
                        onChange={(e) => handleSettingChange('region', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {awsRegions.map((region) => (
                          <option key={region.value} value={region.value}>
                            {region.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* S3 Bucket */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        S3 Bucket Name
                      </label>
                      <input
                        type="text"
                        value={localSettings.s3BucketName}
                        onChange={(e) => handleSettingChange('s3BucketName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="meu-bucket-portal"
                      />
                    </div>
                  </div>
                </div>

                {/* Status das Conexões */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Wifi className="w-5 h-5 mr-2" />
                    Status das Conexões
                  </h3>
                  
                  <div className="space-y-3">
                    {connectionTests.map((test) => (
                      <div key={test.service} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            test.status === 'success' ? 'bg-green-500' :
                            test.status === 'error' ? 'bg-red-500' :
                            test.status === 'testing' ? 'bg-yellow-500 animate-pulse' :
                            'bg-gray-300'
                          }`} />
                          <span className="font-medium">{test.service}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {test.message && (
                            <span className="text-sm text-gray-600">{test.message}</span>
                          )}
                          <button
                            onClick={() => testServiceConnection(test.service)}
                            disabled={test.status === 'testing'}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${test.status === 'testing' ? 'animate-spin' : ''}`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Serviços */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configurações do CloudWatch */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    CloudWatch
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Namespace
                      </label>
                      <input
                        type="text"
                        value={localSettings.cloudWatchNamespace}
                        onChange={(e) => handleSettingChange('cloudWatchNamespace', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Portal/Metrics"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Intervalo de Atualização (segundos)
                      </label>
                      <input
                        type="number"
                        value={localSettings.updateInterval}
                        onChange={(e) => handleSettingChange('updateInterval', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        min="10"
                        max="3600"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="realTimeUpdates"
                        checked={localSettings.enableRealTimeUpdates}
                        onChange={(e) => handleSettingChange('enableRealTimeUpdates', e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <label htmlFor="realTimeUpdates" className="ml-2 block text-sm text-gray-700">
                        Habilitar atualizações em tempo real
                      </label>
                    </div>
                  </div>
                </div>

                {/* Métricas AWS */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Métricas dos Serviços
                  </h3>
                  
                  {awsMetrics ? (
                    <div className="space-y-4">
                      {/* S3 Metrics */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800">Amazon S3</h4>
                        <div className="text-sm text-blue-600 mt-1">
                          <p>{awsMetrics.s3.buckets} buckets • {awsMetrics.s3.totalSize}</p>
                          <p>Último backup: {awsMetrics.s3.lastBackup}</p>
                        </div>
                      </div>

                      {/* CloudWatch Metrics */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-green-800">CloudWatch</h4>
                        <div className="text-sm text-green-600 mt-1">
                          <p>{awsMetrics.cloudwatch.activeMetrics} métricas ativas</p>
                          <p>Última atualização: {awsMetrics.cloudwatch.lastUpdate}</p>
                        </div>
                      </div>

                      {/* EC2 Metrics */}
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <h4 className="font-medium text-purple-800">Amazon EC2</h4>
                        <div className="text-sm text-purple-600 mt-1">
                          <p>{awsMetrics.ec2.runningInstances}/{awsMetrics.ec2.instances} instâncias rodando</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <span className="text-gray-500">Carregando métricas...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab Monitoramento */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Configurações de Monitoramento</h3>
                  <div className="text-center py-8">
                    <Monitor className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Configurações de monitoramento em desenvolvimento</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Segurança */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Configurações de Segurança
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Alertas de Segurança */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2" />
                        <div>
                          <h4 className="text-red-800 font-medium">Importante</h4>
                          <p className="text-red-700 text-sm mt-1">
                            Mantenha suas credenciais AWS seguras. Nunca as compartilhe ou as exponha em código público.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recomendações */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-blue-800 font-medium mb-2">Recomendações de Segurança</h4>
                      <ul className="text-blue-700 text-sm space-y-1">
                        <li>• Use IAM roles sempre que possível</li>
                        <li>• Aplique o princípio do menor privilégio</li>
                        <li>• Monitore logs de acesso regularmente</li>
                        <li>• Configure MFA para contas administrativas</li>
                        <li>• Rotacione credenciais periodicamente</li>
                      </ul>
                    </div>

                    {/* Links Úteis */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-gray-800 font-medium mb-2">Links Úteis</h4>
                      <div className="space-y-2">
                        <a 
                          href="https://console.aws.amazon.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Console AWS
                        </a>
                        <a 
                          href="https://docs.aws.amazon.com/iam/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Documentação IAM
                        </a>
                        <a 
                          href="https://aws.amazon.com/security/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Centro de Segurança AWS
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}