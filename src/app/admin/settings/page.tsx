'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'
import { useSystemSettings } from '@/hooks/useSystemSettings'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { 
    settings, 
    loading, 
    saving, 
    error, 
    saveSettings, 
    testAwsConnection, 
    testEmailConnection 
  } = useSystemSettings()

  // Estados locais para edição
  const [localSettings, setLocalSettings] = useState<any>({})
  const [activeTab, setActiveTab] = useState('general')
  const [testingAws, setTestingAws] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [awsBuckets, setAwsBuckets] = useState<string[]>([])
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Lista de vídeos disponíveis
  const availableVideos = [
    '/back_video.mp4',
    '/back_video1.mp4',
    '/back_video2.mp4',
    '/back_video3.mp4',
    '/back_video4.mp4'
  ]

  // Tipos de background disponíveis
  const backgroundTypes = [
    { value: 'video', label: 'Vídeo' },
    { value: 'image', label: 'Imagem' },
    { value: 'color', label: 'Cor Sólida' }
  ]

  // Frequências de notificação
  const digestFrequencies = [
    { value: 'realtime', label: 'Tempo Real' },
    { value: 'hourly', label: 'A cada hora' },
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' }
  ]

  // Regiões AWS
  const awsRegions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'sa-east-1', label: 'South America (São Paulo)' },
    { value: 'eu-west-1', label: 'EU (Ireland)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' }
  ]

  // Sincronizar configurações carregadas com estado local
  useEffect(() => {
    if (settings) {
      const flatSettings: any = {}
      Object.entries(settings).forEach(([category, categorySettings]) => {
        Object.entries(categorySettings).forEach(([key, setting]: [string, any]) => {
          flatSettings[key] = setting.value
        })
      })
      setLocalSettings(flatSettings)
    }
  }, [settings])

  // Atualizar configuração local
  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [key]: value
    }))
  }

  // Mostrar notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Salvar todas as configurações
  const handleSaveSettings = async () => {
    try {
      const success = await saveSettings(localSettings)
      if (success) {
        showNotification('success', 'Configurações salvas com sucesso!')
      } else {
        showNotification('error', 'Erro ao salvar configurações')
      }
    } catch (err) {
      showNotification('error', 'Erro ao salvar configurações')
    }
  }

  // Testar conexão AWS
  const handleTestAws = async () => {
    setTestingAws(true)
    try {
      const result = await testAwsConnection({
        accessKeyId: localSettings.aws_access_key,
        secretAccessKey: localSettings.aws_secret_key,
        region: localSettings.aws_region
      })

      if (result.success) {
        showNotification('success', result.message)
        if (result.buckets) {
          setAwsBuckets(result.buckets)
        }
      } else {
        showNotification('error', result.message)
      }
    } catch (err) {
      showNotification('error', 'Erro ao testar conexão AWS')
    } finally {
      setTestingAws(false)
    }
  }

  // Testar conexão de email
  const handleTestEmail = async () => {
    setTestingEmail(true)
    try {
      const result = await testEmailConnection({
        host: localSettings.email_smtp_host,
        port: localSettings.email_smtp_port,
        user: localSettings.email_smtp_user,
        password: localSettings.email_smtp_password,
        secure: localSettings.email_smtp_secure,
        fromAddress: localSettings.email_from_address
      })

      if (result.success) {
        showNotification('success', result.message)
      } else {
        showNotification('error', result.message)
      }
    } catch (err) {
      showNotification('error', 'Erro ao testar email')
    } finally {
      setTestingEmail(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN]}>
        <DashboardPageLayout
          title="Configurações do Sistema"
          subtitle="Gerencie as configurações globais do sistema"
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
        title="Configurações do Sistema"
        subtitle="Gerencie as configurações globais do sistema"
      >
        <div className="space-y-6">
          {/* Notificações */}
          {notification && (
            <div className={`p-4 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center">
                <span className="material-symbols-outlined mr-2">
                  {notification.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {notification.message}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'general', label: 'Geral', icon: 'settings' },
                { id: 'appearance', label: 'Aparência', icon: 'palette' },
                { id: 'aws', label: 'AWS', icon: 'cloud' },
                { id: 'email', label: 'Email', icon: 'mail' },
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
                      value={localSettings.site_name || ''}
                      onChange={(e) => updateLocalSetting('site_name', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Sistema
                    </label>
                    <input
                      type="text"
                      value={localSettings.site_title || ''}
                      onChange={(e) => updateLocalSetting('site_title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL do Sistema
                  </label>
                  <input
                    type="url"
                    value={localSettings.site_url || ''}
                    onChange={(e) => updateLocalSetting('site_url', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Sistema
                  </label>
                  <textarea
                    value={localSettings.site_description || ''}
                    onChange={(e) => updateLocalSetting('site_description', e.target.value)}
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
                    checked={localSettings.maintenance_mode || false}
                    onChange={(e) => updateLocalSetting('maintenance_mode', e.target.checked)}
                    className="w-4 h-4 text-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Configurações de Aparência */}
          {activeTab === 'appearance' && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Configurações de Aparência</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo (Tema Claro)
                    </label>
                    <input
                      type="text"
                      value={localSettings.logo_light || ''}
                      onChange={(e) => updateLocalSetting('logo_light', e.target.value)}
                      placeholder="/logo-light.png"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logo (Tema Escuro)
                    </label>
                    <input
                      type="text"
                      value={localSettings.logo_dark || ''}
                      onChange={(e) => updateLocalSetting('logo_dark', e.target.value)}
                      placeholder="/logo-dark.png"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Background da Área Principal
                    </label>
                    <select
                      value={localSettings.background_type || 'video'}
                      onChange={(e) => updateLocalSetting('background_type', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {backgroundTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {localSettings.background_type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vídeo de Background
                      </label>
                      <select
                        value={localSettings.main_background || ''}
                        onChange={(e) => updateLocalSetting('main_background', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {availableVideos.map(video => (
                          <option key={video} value={video}>
                            {video}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {localSettings.background_type === 'image' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL da Imagem de Background
                      </label>
                      <input
                        type="text"
                        value={localSettings.main_background || ''}
                        onChange={(e) => updateLocalSetting('main_background', e.target.value)}
                        placeholder="/background.jpg"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}

                  {localSettings.background_type === 'color' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor de Background
                      </label>
                      <input
                        type="color"
                        value={localSettings.main_background || '#1e3a8a'}
                        onChange={(e) => updateLocalSetting('main_background', e.target.value)}
                        className="w-full h-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Primária
                    </label>
                    <input
                      type="color"
                      value={localSettings.primary_color || '#1e3a8a'}
                      onChange={(e) => updateLocalSetting('primary_color', e.target.value)}
                      className="w-full h-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cor Secundária
                    </label>
                    <input
                      type="color"
                      value={localSettings.secondary_color || '#3b82f6'}
                      onChange={(e) => updateLocalSetting('secondary_color', e.target.value)}
                      className="w-full h-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configurações AWS */}
          {activeTab === 'aws' && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Configurações AWS</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Access Key ID
                    </label>
                    <input
                      type="text"
                      value={localSettings.aws_access_key || ''}
                      onChange={(e) => updateLocalSetting('aws_access_key', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Access Key
                    </label>
                    <input
                      type="password"
                      value={localSettings.aws_secret_key || ''}
                      onChange={(e) => updateLocalSetting('aws_secret_key', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Região
                  </label>
                  <select
                    value={localSettings.aws_region || 'us-east-1'}
                    onChange={(e) => updateLocalSetting('aws_region', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {awsRegions.map(region => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleTestAws}
                    disabled={testingAws}
                    className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {testingAws ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Testando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2 text-sm">cloud_sync</span>
                        Testar Conexão
                      </>
                    )}
                  </button>
                </div>

                {awsBuckets.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">Buckets Disponíveis:</h4>
                    <div className="space-y-2">
                      {awsBuckets.map(bucket => (
                        <div key={bucket} className="text-sm text-green-700">
                          • {bucket}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">Configuração dos Buckets S3</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bucket Principal (Arquivos)
                    </label>
                    <input
                      type="text"
                      value={localSettings.aws_bucket_main || ''}
                      onChange={(e) => updateLocalSetting('aws_bucket_main', e.target.value)}
                      placeholder="meu-bucket-principal"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bucket de Backup
                    </label>
                    <input
                      type="text"
                      value={localSettings.aws_bucket_backup || ''}
                      onChange={(e) => updateLocalSetting('aws_bucket_backup', e.target.value)}
                      placeholder="meu-bucket-backup"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bucket de Mídia
                    </label>
                    <input
                      type="text"
                      value={localSettings.aws_bucket_media || ''}
                      onChange={(e) => updateLocalSetting('aws_bucket_media', e.target.value)}
                      placeholder="meu-bucket-media"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
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
                      value={localSettings.email_smtp_host || ''}
                      onChange={(e) => updateLocalSetting('email_smtp_host', e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porta SMTP
                    </label>
                    <input
                      type="number"
                      value={localSettings.email_smtp_port || 587}
                      onChange={(e) => updateLocalSetting('email_smtp_port', parseInt(e.target.value))}
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
                      value={localSettings.email_smtp_user || ''}
                      onChange={(e) => updateLocalSetting('email_smtp_user', e.target.value)}
                      placeholder="seu-email@gmail.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha SMTP
                    </label>
                    <input
                      type="password"
                      value={localSettings.email_smtp_password || ''}
                      onChange={(e) => updateLocalSetting('email_smtp_password', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Remetente
                    </label>
                    <input
                      type="text"
                      value={localSettings.email_from_name || ''}
                      onChange={(e) => updateLocalSetting('email_from_name', e.target.value)}
                      placeholder="Portal Educacional"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email do Remetente
                    </label>
                    <input
                      type="email"
                      value={localSettings.email_from_address || ''}
                      onChange={(e) => updateLocalSetting('email_from_address', e.target.value)}
                      placeholder="noreply@portal.com"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-700">Usar TLS/SSL</div>
                    <div className="text-sm text-gray-500">Conexão segura com o servidor SMTP</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.email_smtp_secure || false}
                    onChange={(e) => updateLocalSetting('email_smtp_secure', e.target.checked)}
                    className="w-4 h-4 text-primary"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleTestEmail}
                    disabled={testingEmail}
                    className="bg-accent-blue text-white px-4 py-2 rounded-lg hover:bg-accent-blue/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {testingEmail ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2 text-sm">send</span>
                        Enviar Email de Teste
                      </>
                    )}
                  </button>
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
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-700">Notificações por Email</div>
                      <div className="text-sm text-gray-500">Enviar notificações via email</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.notifications_email_enabled || false}
                      onChange={(e) => updateLocalSetting('notifications_email_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-700">Notificações por SMS</div>
                      <div className="text-sm text-gray-500">Enviar notificações via SMS</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.notifications_sms_enabled || false}
                      onChange={(e) => updateLocalSetting('notifications_sms_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-700">Notificações Push</div>
                      <div className="text-sm text-gray-500">Enviar notificações push no navegador</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={localSettings.notifications_push_enabled || false}
                      onChange={(e) => updateLocalSetting('notifications_push_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequência do Resumo de Notificações
                  </label>
                  <select
                    value={localSettings.notifications_digest_frequency || 'daily'}
                    onChange={(e) => updateLocalSetting('notifications_digest_frequency', e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {digestFrequencies.map(freq => (
                      <option key={freq.value} value={freq.value}>
                        {freq.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-blue-600 mr-2">info</span>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Sobre as Notificações</p>
                      <p>As notificações serão enviadas de acordo com as preferências individuais de cada usuário e as configurações globais definidas aqui.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2 text-sm">save</span>
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}
