'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// Interfaces para tipagem
interface AwsSettings {
  id?: string
  accessKeyId: string
  secretAccessKey: string
  region: string
  s3BucketName: string
  cloudWatchNamespace: string
  updateInterval: number
  enableRealTimeUpdates: boolean
}

interface BackgroundSettings {
  id?: string
  type: string
  videoFile: string
  customUrl: string
  solidColor: string
}

interface GeneralSettings {
  id?: string
  platformName: string
  systemUrl: string
  supportEmail: string
}

interface SecuritySettings {
  id?: string
  minPasswordLength: number
  requireSpecialChars: boolean
  requireNumbers: boolean
  twoFactorAuth: string
  sessionTimeout: number
}

interface EmailSettings {
  id?: string
  smtpServer: string
  smtpPort: number
  encryption: string
  senderEmail: string
  senderPassword: string
}

// Funções CRUD para API
const settingsAPI = {
  // AWS Settings CRUD
  async getAwsSettings(): Promise<AwsSettings> {
    try {
      const response = await fetch('/api/settings/aws')
      if (!response.ok) throw new Error('Erro ao carregar configurações AWS')
      return await response.json()
    } catch (error) {
      console.error('Erro ao carregar AWS settings:', error)
      return {
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us-east-1',
        s3BucketName: '',
        cloudWatchNamespace: 'Portal/Metrics',
        updateInterval: 30,
        enableRealTimeUpdates: true
      }
    }
  },

  async saveAwsSettings(settings: AwsSettings): Promise<AwsSettings> {
    const response = await fetch('/api/settings/aws', {
      method: settings.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!response.ok) throw new Error('Erro ao salvar configurações AWS')
    return await response.json()
  },

  async deleteAwsSettings(id: string): Promise<void> {
    const response = await fetch(`/api/settings/aws/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error('Erro ao deletar configurações AWS')
  },

  // Background Settings CRUD
  async getBackgroundSettings(): Promise<BackgroundSettings> {
    try {
      const response = await fetch('/api/settings/background')
      if (!response.ok) throw new Error('Erro ao carregar configurações de fundo')
      return await response.json()
    } catch (error) {
      console.error('Erro ao carregar background settings:', error)
      return {
        type: 'video',
        videoFile: '/back_video1.mp4',
        customUrl: '',
        solidColor: '#1e3a8a'
      }
    }
  },

  async saveBackgroundSettings(settings: BackgroundSettings): Promise<BackgroundSettings> {
    const response = await fetch('/api/settings/background', {
      method: settings.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!response.ok) throw new Error('Erro ao salvar configurações de fundo')
    return await response.json()
  },

  // General Settings CRUD
  async getGeneralSettings(): Promise<GeneralSettings> {
    try {
      const response = await fetch('/api/settings/general')
      if (!response.ok) throw new Error('Erro ao carregar configurações gerais')
      return await response.json()
    } catch (error) {
      console.error('Erro ao carregar general settings:', error)
      return {
        platformName: 'Portal Educacional',
        systemUrl: 'https://portal.educacional.com',
        supportEmail: 'suporte@portal.educacional.com'
      }
    }
  },

  async saveGeneralSettings(settings: GeneralSettings): Promise<GeneralSettings> {
    const response = await fetch('/api/settings/general', {
      method: settings.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!response.ok) throw new Error('Erro ao salvar configurações gerais')
    return await response.json()
  },

  // Security Settings CRUD
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await fetch('/api/settings/security')
      if (!response.ok) throw new Error('Erro ao carregar configurações de segurança')
      return await response.json()
    } catch (error) {
      console.error('Erro ao carregar security settings:', error)
      return {
        minPasswordLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        twoFactorAuth: 'optional',
        sessionTimeout: 30
      }
    }
  },

  async saveSecuritySettings(settings: SecuritySettings): Promise<SecuritySettings> {
    const response = await fetch('/api/settings/security', {
      method: settings.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!response.ok) throw new Error('Erro ao salvar configurações de segurança')
    return await response.json()
  },

  // Email Settings CRUD
  async getEmailSettings(): Promise<EmailSettings> {
    try {
      const response = await fetch('/api/settings/email')
      if (!response.ok) throw new Error('Erro ao carregar configurações de email')
      return await response.json()
    } catch (error) {
      console.error('Erro ao carregar email settings:', error)
      return {
        smtpServer: '',
        smtpPort: 587,
        encryption: 'tls',
        senderEmail: '',
        senderPassword: ''
      }
    }
  },

  async saveEmailSettings(settings: EmailSettings): Promise<EmailSettings> {
    const response = await fetch('/api/settings/email', {
      method: settings.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
    if (!response.ok) throw new Error('Erro ao salvar configurações de email')
    return await response.json()
  },

  // Teste de conexões
  async testS3Connection(settings: AwsSettings): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/test-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      return response.ok
    } catch (error) {
      console.error('Erro ao testar conexão S3:', error)
      return false
    }
  },

  async testEmailConnection(settings: EmailSettings): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      return response.ok
    } catch (error) {
      console.error('Erro ao testar conexão email:', error)
      return false
    }
  }
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  
  // Estados para as configurações
  const [awsSettings, setAwsSettings] = useState<AwsSettings>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    s3BucketName: '',
    cloudWatchNamespace: 'Portal/Metrics',
    updateInterval: 30,
    enableRealTimeUpdates: true
  })

  const [backgroundSettings, setBackgroundSettings] = useState<BackgroundSettings>({
    type: 'video',
    videoFile: '/back_video1.mp4',
    customUrl: '',
    solidColor: '#1e3a8a'
  })

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    platformName: 'Portal Educacional',
    systemUrl: 'https://portal.educacional.com',
    supportEmail: 'suporte@portal.educacional.com'
  })

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    twoFactorAuth: 'optional',
    sessionTimeout: 30
  })

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpServer: '',
    smtpPort: 587,
    encryption: 'tls',
    senderEmail: '',
    senderPassword: ''
  })

  // Estados para controle de UI
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [testingS3, setTestingS3] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)

  // Lista de vídeos disponíveis na pasta public
  const availableVideos = [
    '/back_video.mp4',
    '/back_video1.mp4', 
    '/back_video2.mp4',
    '/back_video3.mp4',
    '/back_video4.mp4'
  ]

  // Funções de manipulação de estado
  const handleAwsSettingsChange = (field: string, value: string | number | boolean) => {
    setAwsSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleBackgroundSettingsChange = (field: string, value: string) => {
    setBackgroundSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleGeneralSettingsChange = (field: string, value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }))
  }

  const handleSecuritySettingsChange = (field: string, value: string | number | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }))
  }

  const handleEmailSettingsChange = (field: string, value: string | number) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }))
  }

  // Função para mostrar notificações
  const showNotification = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message)
      setError(null)
    } else {
      setError(message)
      setSuccess(null)
    }
    setTimeout(() => {
      setSuccess(null)
      setError(null)
    }, 5000)
  }

  // Salvar todas as configurações
  const saveSettings = async () => {
    setLoading(true)
    try {
      await Promise.all([
        settingsAPI.saveAwsSettings(awsSettings),
        settingsAPI.saveBackgroundSettings(backgroundSettings),
        settingsAPI.saveGeneralSettings(generalSettings),
        settingsAPI.saveSecuritySettings(securitySettings),
        settingsAPI.saveEmailSettings(emailSettings)
      ])
      showNotification('Configurações salvas com sucesso!', 'success')
    } catch (error: any) {
      showNotification(error.message || 'Erro ao salvar configurações', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Restaurar configurações padrão
  const restoreDefaults = async () => {
    if (!confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoading(true)
    try {
      // Reset dos estados para valores padrão
      setAwsSettings({
        accessKeyId: '',
        secretAccessKey: '',
        region: 'us-east-1',
        s3BucketName: '',
        cloudWatchNamespace: 'Portal/Metrics',
        updateInterval: 30,
        enableRealTimeUpdates: true
      })
      setBackgroundSettings({
        type: 'video',
        videoFile: '/back_video1.mp4',
        customUrl: '',
        solidColor: '#1e3a8a'
      })
      setGeneralSettings({
        platformName: 'Portal Educacional',
        systemUrl: 'https://portal.educacional.com',
        supportEmail: 'suporte@portal.educacional.com'
      })
      setSecuritySettings({
        minPasswordLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        twoFactorAuth: 'optional',
        sessionTimeout: 30
      })
      setEmailSettings({
        smtpServer: '',
        smtpPort: 587,
        encryption: 'tls',
        senderEmail: '',
        senderPassword: ''
      })
      
      showNotification('Configurações restauradas para os valores padrão', 'success')
    } catch (error: any) {
      showNotification('Erro ao restaurar configurações padrão', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Testar conexão S3
  const testS3Connection = async () => {
    setTestingS3(true)
    try {
      const result = await settingsAPI.testS3Connection(awsSettings)
      if (result) {
        showNotification('Conexão S3 testada com sucesso!', 'success')
      } else {
        showNotification('Falha na conexão S3. Verifique as credenciais.', 'error')
      }
    } catch (error) {
      showNotification('Erro ao testar conexão S3', 'error')
    } finally {
      setTestingS3(false)
    }
  }

  // Testar conexão de email
  const testEmailConnection = async () => {
    setTestingEmail(true)
    try {
      const result = await settingsAPI.testEmailConnection(emailSettings)
      if (result) {
        showNotification('Conexão de email testada com sucesso!', 'success')
      } else {
        showNotification('Falha na conexão de email. Verifique as configurações.', 'error')
      }
    } catch (error) {
      showNotification('Erro ao testar conexão de email', 'error')
    } finally {
      setTestingEmail(false)
    }
  }

  // Carregar configurações ao montar o componente
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      try {
        const [aws, background, general, security, email] = await Promise.all([
          settingsAPI.getAwsSettings(),
          settingsAPI.getBackgroundSettings(),
          settingsAPI.getGeneralSettings(),
          settingsAPI.getSecuritySettings(),
          settingsAPI.getEmailSettings()
        ])
        
        setAwsSettings(aws)
        setBackgroundSettings(background)
        setGeneralSettings(general)
        setSecuritySettings(security)
        setEmailSettings(email)
      } catch (error: any) {
        showNotification('Erro ao carregar configurações', 'error')
      } finally {
        setLoading(false)
      }
    }
    
    loadSettings()
  }, [])

  return (
    <div className="space-y-6">
      {/* Notificações */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-600">Configurações do Sistema</h1>
          <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
        </div>
        <div className="space-x-4">
          <button 
            onClick={restoreDefaults}
            disabled={loading}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : 'Restaurar Padrões'}
          </button>
          <button 
            onClick={saveSettings}
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* AWS Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Configurações da AWS</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Key ID
                  </label>
                  <input
                    type="password"
                    value={awsSettings.accessKeyId}
                    onChange={(e) => handleAwsSettingsChange('accessKeyId', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="AKIA..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secret Access Key
                  </label>
                  <input
                    type="password"
                    value={awsSettings.secretAccessKey}
                    onChange={(e) => handleAwsSettingsChange('secretAccessKey', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="*****"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Região
                  </label>
                  <select 
                    value={awsSettings.region}
                    onChange={(e) => handleAwsSettingsChange('region', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="us-east-1">US East (N. Virginia)</option>
                    <option value="us-west-2">US West (Oregon)</option>
                    <option value="eu-west-1">Europe (Ireland)</option>
                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                    <option value="sa-east-1">South America (São Paulo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervalo de Atualização (segundos)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={awsSettings.updateInterval}
                    onChange={(e) => handleAwsSettingsChange('updateInterval', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CloudWatch Namespace
                </label>
                <input
                  type="text"
                  value={awsSettings.cloudWatchNamespace}
                  onChange={(e) => handleAwsSettingsChange('cloudWatchNamespace', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Portal/Metrics"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Atualizações em Tempo Real</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={awsSettings.enableRealTimeUpdates}
                    onChange={(e) => handleAwsSettingsChange('enableRealTimeUpdates', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* S3 Storage Configuration */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Configurações do S3</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Bucket S3
                </label>
                <input
                  type="text"
                  value={awsSettings.s3BucketName}
                  onChange={(e) => handleAwsSettingsChange('s3BucketName', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="portal-educacional-storage"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classe de Armazenamento
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
                    <option value="STANDARD">Standard</option>
                    <option value="REDUCED_REDUNDANCY">Reduced Redundancy</option>
                    <option value="STANDARD_IA">Standard-IA</option>
                    <option value="GLACIER">Glacier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criptografia
                  </label>
                  <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue">
                    <option value="AES256">AES-256</option>
                    <option value="aws:kms">AWS KMS</option>
                    <option value="none">Nenhuma</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={testS3Connection}
                  disabled={testingS3}
                  className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/80 disabled:opacity-50"
                >
                  {testingS3 ? 'Testando...' : 'Testar Conexão S3'}
                </button>
                <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                  Visualizar Buckets
                </button>
              </div>
            </div>
          </div>

          {/* General Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Configurações Gerais</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Plataforma
                </label>
                <input
                  type="text"
                  value={generalSettings.platformName}
                  onChange={(e) => handleGeneralSettingsChange('platformName', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL do Sistema
                </label>
                <input
                  type="text"
                  value={generalSettings.systemUrl}
                  onChange={(e) => handleGeneralSettingsChange('systemUrl', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Suporte
                </label>
                <input
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => handleGeneralSettingsChange('supportEmail', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plano de Fundo do Login
                </label>
                <div className="space-y-4">
                  {/* Tipo de plano de fundo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Plano de Fundo
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundType"
                          value="video"
                          checked={backgroundSettings.type === 'video'}
                          onChange={(e) => handleBackgroundSettingsChange('type', e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Vídeo</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundType"
                          value="url"
                          checked={backgroundSettings.type === 'url'}
                          onChange={(e) => handleBackgroundSettingsChange('type', e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">URL</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="backgroundType"
                          value="color"
                          checked={backgroundSettings.type === 'color'}
                          onChange={(e) => handleBackgroundSettingsChange('type', e.target.value)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-600">Cor Sólida</span>
                      </label>
                    </div>
                  </div>

                  {/* Opções condicionais baseadas no tipo */}
                  {backgroundSettings.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selecionar Vídeo
                      </label>
                      <select
                        value={backgroundSettings.videoFile}
                        onChange={(e) => handleBackgroundSettingsChange('videoFile', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      >
                        {availableVideos.map((video) => (
                          <option key={video} value={video}>
                            {video.replace('/', '').replace('.mp4', '')}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Vídeos disponíveis na pasta public/
                      </p>
                    </div>
                  )}

                  {backgroundSettings.type === 'url' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL do Arquivo
                      </label>
                      <input
                        type="url"
                        value={backgroundSettings.customUrl}
                        onChange={(e) => handleBackgroundSettingsChange('customUrl', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        placeholder="https://exemplo.com/video.mp4"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL para vídeo ou imagem externa
                      </p>
                    </div>
                  )}

                  {backgroundSettings.type === 'color' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cor de Fundo
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={backgroundSettings.solidColor}
                          onChange={(e) => handleBackgroundSettingsChange('solidColor', e.target.value)}
                          className="h-10 w-20 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={backgroundSettings.solidColor}
                          onChange={(e) => handleBackgroundSettingsChange('solidColor', e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                          placeholder="#1e3a8a"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Escolha uma cor sólida para o fundo
                      </p>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                    <div className="h-24 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-sm text-gray-600">
                      {backgroundSettings.type === 'video' && (
                        <span>Vídeo: {backgroundSettings.videoFile.replace('/', '').replace('.mp4', '')}</span>
                      )}
                      {backgroundSettings.type === 'url' && (
                        <span>URL: {backgroundSettings.customUrl || 'Nenhuma URL definida'}</span>
                      )}
                      {backgroundSettings.type === 'color' && (
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: backgroundSettings.solidColor }}
                          />
                          <span>Cor: {backgroundSettings.solidColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Segurança</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Política de Senha
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary" 
                      checked={securitySettings.minPasswordLength >= 8}
                      onChange={(e) => handleSecuritySettingsChange('minPasswordLength', e.target.checked ? 8 : 6)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Mínimo 8 caracteres</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary" 
                      checked={securitySettings.requireSpecialChars}
                      onChange={(e) => handleSecuritySettingsChange('requireSpecialChars', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Exigir caracteres especiais</span>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="h-4 w-4 text-primary" 
                      checked={securitySettings.requireNumbers}
                      onChange={(e) => handleSecuritySettingsChange('requireNumbers', e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Exigir números</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autenticação em Duas Etapas
                </label>
                <select 
                  value={securitySettings.twoFactorAuth}
                  onChange={(e) => handleSecuritySettingsChange('twoFactorAuth', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                >
                  <option value="optional">Opcional</option>
                  <option value="required">Obrigatório</option>
                  <option value="disabled">Desativado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tempo de Sessão (minutos)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Configurações de Email</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Servidor SMTP
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpServer}
                  onChange={(e) => handleEmailSettingsChange('smtpServer', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="smtp.servidor.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Porta
                  </label>
                  <input
                    type="number"
                    value={emailSettings.smtpPort}
                    onChange={(e) => handleEmailSettingsChange('smtpPort', parseInt(e.target.value))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                    placeholder="587"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Criptografia
                  </label>
                  <select 
                    value={emailSettings.encryption}
                    onChange={(e) => handleEmailSettingsChange('encryption', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="none">Nenhuma</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Envio
                </label>
                <input
                  type="email"
                  value={emailSettings.senderEmail}
                  onChange={(e) => handleEmailSettingsChange('senderEmail', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="noreply@portal.educacional.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha do Email
                </label>
                <input
                  type="password"
                  value={emailSettings.senderPassword}
                  onChange={(e) => handleEmailSettingsChange('senderPassword', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  placeholder="Senha do email"
                />
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={testEmailConnection}
                  disabled={testingEmail}
                  className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/80 disabled:opacity-50"
                >
                  {testingEmail ? 'Testando...' : 'Testar Conexão Email'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* AWS Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Status da AWS</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Conexão</span>
                <p className="text-sm font-medium text-accent-green">Conectado</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Região Ativa</span>
                <p className="text-sm font-medium text-gray-600">{awsSettings.region}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">CloudWatch</span>
                <p className="text-sm font-medium text-accent-green">Ativo</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Última Sincronização</span>
                <p className="text-sm font-medium text-gray-600">Há 2 minutos</p>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Informações do Sistema</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Versão</span>
                <p className="text-sm font-medium text-gray-600">2.1.0</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Última Atualização</span>
                <p className="text-sm font-medium text-gray-600">01/01/2024</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Status</span>
                <p className="text-sm font-medium text-accent-green">Operacional</p>
              </div>
            </div>
          </div>

          {/* AWS S3 Storage */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Armazenamento S3</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Uso do Bucket</span>
                  <span className="text-gray-600">2.3 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">2.3GB de 10GB usado</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-gray-600">Arquivos</p>
                  <p className="font-medium">1,234</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Custo/Mês</p>
                  <p className="font-medium">$12.45</p>
                </div>
              </div>
              <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">
                Gerenciar S3
              </button>
            </div>
          </div>

          {/* Maintenance Mode */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-600 mb-4">Modo de Manutenção</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent-blue/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem de Manutenção
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  rows={3}
                  placeholder="Sistema em manutenção..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
