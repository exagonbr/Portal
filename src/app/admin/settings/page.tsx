'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

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
      const response = await fetch('/api/settings/aws', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        throw new Error('Erro ao carregar configurações AWS')
      }
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
      body: JSON.stringify(settings),
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      throw new Error('Erro ao salvar configurações AWS')
    }
    return await response.json()
  },

  async deleteAwsSettings(id: string): Promise<void> {
    const response = await fetch(`/api/settings/aws/${id}`, { 
      method: 'DELETE',
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      throw new Error('Erro ao deletar configurações AWS')
    }
  },

  // Background Settings CRUD
  async getBackgroundSettings(): Promise<BackgroundSettings> {
    try {
      const response = await fetch('/api/settings/background', {
        credentials: 'include'
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        throw new Error('Erro ao carregar configurações de fundo')
      }
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
      body: JSON.stringify(settings),
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      throw new Error('Erro ao salvar configurações de fundo')
    }
    return await response.json()
  },

  // General Settings CRUD
  async getGeneralSettings(): Promise<GeneralSettings> {
    try {
      const response = await fetch('/api/settings/general', {
        credentials: 'include'
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        throw new Error('Erro ao carregar configurações gerais')
      }
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
      body: JSON.stringify(settings),
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      throw new Error('Erro ao salvar configurações gerais')
    }
    return await response.json()
  },

  // Security Settings CRUD
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await fetch('/api/settings/security', {
        credentials: 'include'
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        throw new Error('Erro ao carregar configurações de segurança')
      }
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
      body: JSON.stringify(settings),
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      throw new Error('Erro ao salvar configurações de segurança')
    }
    return await response.json()
  },

  // Email Settings CRUD
  async getEmailSettings(): Promise<EmailSettings> {
    try {
      const response = await fetch('/api/settings/email', {
        credentials: 'include'
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        throw new Error('Erro ao carregar configurações de email')
      }
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
      body: JSON.stringify(settings),
      credentials: 'include'
    })
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      throw new Error('Erro ao salvar configurações de email')
    }
    return await response.json()
  },

  // Teste de conexões
  async testS3Connection(settings: AwsSettings): Promise<{ success: boolean; buckets?: string[]; message?: string }> {
    try {
      const response = await fetch('/api/settings/test-s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        return { success: false, message: data.message || 'Erro ao testar conexão S3' }
      }
      
      return data
    } catch (error) {
      console.error('Erro ao testar conexão S3:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Erro ao testar conexão S3' }
    }
  },

  async listS3Buckets(): Promise<{ success: boolean; buckets?: string[]; error?: string }> {
    try {
      const response = await fetch('/api/settings/s3-buckets', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Por favor, faça login novamente.')
        }
        const data = await response.json()
        return { success: false, error: data.error || 'Erro ao listar buckets' }
      }
      
      const data = await response.json()
      return { success: true, buckets: data.buckets || [] }
    } catch (error) {
      console.error('Erro ao listar buckets S3:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erro ao listar buckets' }
    }
  },

  async testEmailConnection(settings: EmailSettings): Promise<boolean> {
    try {
      const response = await fetch('/api/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        credentials: 'include'
      })
      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, faça login novamente.')
      }
      return response.ok
    } catch (error) {
      console.error('Erro ao testar conexão email:', error)
      return false
    }
  }
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { data: session } = useSession()
  
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
  const [s3Buckets, setS3Buckets] = useState<string[]>([])
  const [showBuckets, setShowBuckets] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

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

  // Testar conexão S3 e listar buckets
  const testS3Connection = async () => {
    setTestingS3(true)
    setShowBuckets(false)
    try {
      const result = await settingsAPI.testS3Connection(awsSettings)
      if (result.success) {
        showNotification('Conexão S3 testada com sucesso!', 'success')
        // Listar buckets após teste bem-sucedido
        const bucketsResult = await settingsAPI.listS3Buckets()
        if (bucketsResult.success && bucketsResult.buckets) {
          setS3Buckets(bucketsResult.buckets)
          setShowBuckets(true)
        }
      } else {
        showNotification(result.message || 'Falha na conexão S3. Verifique as credenciais.', 'error')
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Erro ao testar conexão S3', 'error')
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
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Configurações do Sistema"
          subtitle="Gerencie as configurações globais do sistema"
        >
          <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'general', label: 'Geral', icon: 'settings' },
                  { id: 'email', label: 'Email', icon: 'mail' },
                  { id: 'security', label: 'Segurança', icon: 'security' },
                  { id: 'notifications', label: 'Notificações', icon: 'notifications' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Configurações Gerais */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-600">Configurações Gerais</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Sistema
                      </label>
                      <input
                        type="text"
                        value={generalSettings.platformName}
                        onChange={(e) => handleGeneralSettingsChange('platformName', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fuso Horário
                      </label>
                      <select
                        value={generalSettings.systemUrl}
                        onChange={(e) => handleGeneralSettingsChange('systemUrl', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                        <option value="America/Rio_Branco">Rio Branco (GMT-5)</option>
                        <option value="America/Manaus">Manaus (GMT-4)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Sistema
                    </label>
                    <textarea
                      value={generalSettings.supportEmail}
                      onChange={(e) => handleGeneralSettingsChange('supportEmail', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-accent-yellow/10 rounded-lg border border-accent-yellow/20">
                    <div>
                      <div className="font-medium text-gray-700">Modo de Manutenção</div>
                      <div className="text-sm text-gray-500">Ativar para bloquear acesso de usuários</div>
                    </div>
                    <input
                      type="checkbox"
                                               checked={generalSettings.systemUrl === 'maintenance'}
                         onChange={(e) => handleGeneralSettingsChange('systemUrl', e.target.checked ? 'maintenance' : generalSettings.systemUrl)}
                      className="w-4 h-4 text-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Email */}
            {activeTab === 'email' && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-600">Configurações de Email</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Servidor SMTP
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpServer}
                        onChange={(e) => handleEmailSettingsChange('smtpServer', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porta SMTP
                      </label>
                      <input
                        type="text"
                        value={emailSettings.smtpPort}
                        onChange={(e) => handleEmailSettingsChange('smtpPort', parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Usuário SMTP
                      </label>
                      <input
                        type="email"
                        value={emailSettings.senderEmail}
                        onChange={(e) => handleEmailSettingsChange('senderEmail', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Senha SMTP
                      </label>
                      <input
                        type="password"
                        value={emailSettings.senderPassword}
                        onChange={(e) => handleEmailSettingsChange('senderPassword', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/80 transition-colors duration-200">
                      Testar Configuração
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Segurança */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-600">Configurações de Segurança</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timeout de Sessão (min)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max. Tentativas de Login
                      </label>
                      <input
                        type="number"
                        value={securitySettings.minPasswordLength}
                        onChange={(e) => handleSecuritySettingsChange('minPasswordLength', parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    
                                         <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">
                         Tamanho Mín. da Senha
                       </label>
                       <input
                         type="number"
                         value={securitySettings.minPasswordLength}
                         onChange={(e) => handleSecuritySettingsChange('minPasswordLength', parseInt(e.target.value))}
                         className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                       />
                     </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Requerer Letras Maiúsculas</div>
                        <div className="text-sm text-gray-500">A senha deve conter pelo menos uma letra maiúscula</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.requireNumbers}
                        onChange={(e) => handleSecuritySettingsChange('requireNumbers', e.target.checked)}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Requerer Números</div>
                        <div className="text-sm text-gray-500">A senha deve conter pelo menos um número</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.requireSpecialChars}
                        onChange={(e) => handleSecuritySettingsChange('requireSpecialChars', e.target.checked)}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Autenticação de Dois Fatores</div>
                        <div className="text-sm text-gray-500">Obrigar 2FA para todos os usuários</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorAuth === 'required'}
                        onChange={(e) => handleSecuritySettingsChange('twoFactorAuth', e.target.checked ? 'required' : 'optional')}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Notificações */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-600">Configurações de Notificações</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Notificações por Email</div>
                        <div className="text-sm text-gray-500">Enviar notificações via email</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={emailSettings.senderEmail !== 'noreply@escola.com'}
                        onChange={(e) => handleEmailSettingsChange('senderEmail', e.target.checked ? 'noreply@escola.com' : '')}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Notificações por SMS</div>
                        <div className="text-sm text-gray-500">Enviar notificações via SMS</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => handleEmailSettingsChange('senderEmail', 'noreply@escola.com')}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Notificações Push</div>
                        <div className="text-sm text-gray-500">Enviar notificações push no navegador</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={(e) => handleEmailSettingsChange('senderEmail', 'noreply@escola.com')}
                        className="w-4 h-4 text-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência do Resumo
                    </label>
                    <select
                      value={emailSettings.encryption}
                      onChange={(e) => handleEmailSettingsChange('encryption', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="tls">TLS</option>
                      <option value="ssl">SSL</option>
                      <option value="none">Nenhuma</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4">
              <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                Cancelar
              </button>
              <button 
                onClick={saveSettings}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-200"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
