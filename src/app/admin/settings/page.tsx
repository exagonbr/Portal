'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'
import { useSystemSettings } from '@/hooks/useSystemSettings'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const { 
    settings, 
    loading, 
    saving, 
    error, 
    saveSettings, 
    testAwsConnection, 
    testEmailConnection,
    resetSettings,
    loadSettings
  } = useSystemSettings()

  // Estados locais para edição
  const [localSettings, setLocalSettings] = useState<any>({})
  const [activeTab, setActiveTab] = useState('general')
  const [testingAws, setTestingAws] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [reconfiguringEmail, setReconfiguringEmail] = useState(false)
  const [awsBuckets, setAwsBuckets] = useState<string[]>([])
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false)

  // Lista de vídeos disponíveis
  const availableVideos = [
    '/back_video.mp4',
    '/back_video1.mp4',
    '/back_video2.mp4',
    '/back_video3.mp4',
    '/back_video4.mp4',
    '/back_video5.mp4',
    '/back_video6.mp4',
    '/back_video7.mp4',
    '/back_video8.mp4',
    '/back_video9.mp4',
    '/back_video10.mp4',
    '/back_video11.mp4',
    '/back_video12.mp4',
    '/back_video13.mp4',
    '/back_video14.mp4',
    '/back_video15.mp4',
    '/back_video16.mp4',
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
      setLocalSettings({ ...settings })
    }
  }, [settings])

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      showNotification('error', error)
    }
  }, [error])

  // Atualizar configuração local
  const updateLocalSetting = (key: string, value: any) => {
    setLocalSettings((prev: any) => ({
      ...prev,
      [key]: value
    }))
  }

  // Mostrar notificação
  const showNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  // Salvar todas as configurações
  const handleSaveSettings = async () => {
    try {
      const success = await saveSettings(localSettings)
      if (success) {
        // Verificar se configurações de background foram alteradas
        const backgroundChanged = settings && (
          settings.background_type !== localSettings.background_type ||
          settings.main_background !== localSettings.main_background ||
          settings.primary_color !== localSettings.primary_color ||
          settings.secondary_color !== localSettings.secondary_color
        )
        
        if (backgroundChanged) {
          showNotification('success', 'Configurações salvas! O background da página de login foi atualizado.')
        } else {
          showNotification('success', 'Configurações salvas com sucesso!')
        }
      } else {
        showNotification('error', 'Erro ao salvar configurações')
      }
    } catch (err) {
      showNotification('error', 'Erro ao salvar configurações')
    }
  }

  // Recarregar configurações
  const handleReloadSettings = async () => {
    try {
      await loadSettings()
      showNotification('info', 'Configurações recarregadas!')
    } catch (err) {
      showNotification('error', 'Erro ao recarregar configurações')
    }
  }

  // Resetar configurações
  const handleResetSettings = async () => {
    try {
      const success = await resetSettings()
      if (success) {
        showNotification('success', 'Configurações resetadas para padrão!')
        setShowResetConfirm(false)
      } else {
        showNotification('error', 'Erro ao resetar configurações')
      }
    } catch (err) {
      showNotification('error', 'Erro ao resetar configurações')
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

  // Reconfigurar serviço de email
  const handleReconfigureEmail = async () => {
    setReconfiguringEmail(true)
    try {
      const response = await fetch('/api/settings/reconfigure-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (result.success) {
        showNotification('success', 'Serviço de email reconfigurado com sucesso!')
      } else {
        showNotification('error', result.error || 'Erro ao reconfigurar serviço de email')
      }
    } catch (err) {
      showNotification('error', 'Erro ao reconfigurar serviço de email')
    } finally {
      setReconfiguringEmail(false)
    }
  }

  // Função para fechar preview com ESC
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && showFullscreenPreview) {
      setShowFullscreenPreview(false)
    }
  }, [showFullscreenPreview])

  // Adicionar/remover listener do teclado
  useEffect(() => {
    if (showFullscreenPreview) {
      document.addEventListener('keydown', handleEscKey)
      return () => {
        document.removeEventListener('keydown', handleEscKey)
      }
    }
  }, [showFullscreenPreview, handleEscKey])

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
        <DashboardPageLayout
          title="Configurações do Sistema"
          subtitle="Gerencie as configurações globais do sistema"
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
            {/* Notificações */}
            {notification && (
              <div className={`p-4 rounded-xl shadow-lg ${
                notification.type === 'success' 
                  ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border border-emerald-200' 
                  : notification.type === 'error'
                  ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border border-red-200'
                  : notification.type === 'warning'
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200'
                  : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined mr-2">
                      {notification.type === 'success' ? 'check_circle' : 
                       notification.type === 'error' ? 'error' :
                       notification.type === 'warning' ? 'warning' : 'info'}
                    </span>
                    {notification.message}
                  </div>
                  <button
                    onClick={() => setNotification(null)}
                    className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <nav className="flex space-x-2">
                {[
                  { id: 'general', label: 'Geral', icon: 'settings' },
                  { id: 'appearance', label: 'Aparência', icon: 'palette' },
                  { id: 'aws', label: 'AWS', icon: 'cloud' },
                  { id: 'email', label: 'Email', icon: 'mail' },
                  { id: 'notifications', label: 'Notificações', icon: 'notifications' },
                  { id: 'advanced', label: 'Avançado', icon: 'tune' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-4 rounded-lg font-medium text-sm flex items-center space-x-2 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
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
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-blue-600">settings</span>
                    Configurações Gerais
                  </h3>
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
                    <div>
                      <div className="font-semibold text-amber-800 flex items-center">
                        <span className="material-symbols-outlined mr-2 text-amber-600">warning</span>
                        Modo de Manutenção
                      </div>
                      <div className="text-sm text-amber-700">Ativar para bloquear acesso de usuários</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.maintenance_mode || false}
                        onChange={(e) => updateLocalSetting('maintenance_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Aparência */}
            {activeTab === 'appearance' && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-purple-600">palette</span>
                    Configurações de Aparência
                  </h3>
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Destaque para configurações de background */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <span className="material-symbols-outlined text-blue-600 mr-2">public</span>
                        <h4 className="font-medium text-blue-800">Configurações de Background Público</h4>
                      </div>
                      <p className="text-sm text-blue-700">
                        Estas configurações de background serão aplicadas na <strong>página de login pública</strong> e em todas as áreas não autenticadas do sistema.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Background da Área Principal
                      </label>
                      <select
                        value={localSettings.background_type || 'video'}
                        onChange={(e) => updateLocalSetting('background_type', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                          className="w-full h-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full h-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full h-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Preview do Background */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-700 flex items-center">
                        <span className="material-symbols-outlined mr-2 text-purple-600">preview</span>
                        Preview do Background
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.open('/auth/login', '_blank')}
                          className="text-sm text-blue-600 hover:text-blue-700 flex items-center transition-colors"
                        >
                          <span className="material-symbols-outlined mr-1 text-sm">login</span>
                          Ver Login
                        </button>
                        <button
                          onClick={() => setShowFullscreenPreview(true)}
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center transition-colors"
                        >
                          <span className="material-symbols-outlined mr-1 text-sm">fullscreen</span>
                          Tela Cheia
                        </button>
                      </div>
                    </div>
                    <div
                      className="w-full h-48 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden shadow-inner cursor-pointer group"
                      onClick={() => setShowFullscreenPreview(true)}
                      style={{
                        backgroundColor: localSettings.background_type === 'color'
                          ? localSettings.main_background
                          : localSettings.primary_color,
                        backgroundImage: localSettings.background_type === 'image'
                          ? `url(${localSettings.main_background})`
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {localSettings.background_type === 'video' && localSettings.main_background && (
                        <video
                          key={localSettings.main_background} // Força re-render quando o vídeo muda
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Erro ao carregar vídeo:', e);
                          }}
                        >
                          <source src={localSettings.main_background} type="video/mp4" />
                        </video>
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                      <div className="relative z-10 text-white font-medium text-sm bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined mr-2 text-xs">visibility</span>
                          Preview em Tempo Real
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-white bg-black/50 rounded p-1">fullscreen</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                      <span className="material-symbols-outlined mr-1 text-xs">info</span>
                      Clique no preview ou use o botão para visualizar em tela cheia
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações AWS */}
            {activeTab === 'aws' && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-orange-600">cloud</span>
                    Configurações AWS
                  </h3>
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região
                    </label>
                    <select
                      value={localSettings.aws_region || 'sa-east-1'}
                      onChange={(e) => updateLocalSetting('aws_region', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {awsRegions.map(region => (
                        <option key={region.value} value={region.value}>
                          {region.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleTestAws}
                      disabled={testingAws}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
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
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 shadow-sm">
                      <h4 className="font-semibold text-emerald-800 mb-2 flex items-center">
                        <span className="material-symbols-outlined mr-2 text-emerald-600">check_circle</span>
                        Buckets Disponíveis:
                      </h4>
                      <div className="space-y-2">
                        {awsBuckets.map(bucket => (
                          <div key={bucket} className="text-sm text-emerald-700 flex items-center">
                            <span className="material-symbols-outlined mr-2 text-xs">folder</span>
                            {bucket}
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações de Email */}
            {activeTab === 'email' && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-green-600">mail</span>
                    Configurações de Email
                  </h3>
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={handleTestEmail}
                      disabled={testingEmail}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
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
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-cyan-600">notifications</span>
                    Configurações de Notificações
                  </h3>
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
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                        className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
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
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {digestFrequencies.map(freq => (
                        <option key={freq.value} value={freq.value}>
                          {freq.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <div className="flex items-start">
                      <span className="material-symbols-outlined text-blue-600 mr-2">info</span>
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Sobre as Notificações</p>
                        <p>As notificações serão enviadas de acordo com as preferências individuais de cada usuário e as configurações globais definidas aqui.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações Avançadas */}
            {activeTab === 'advanced' && (
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-gray-50 rounded-t-xl">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-slate-600">tune</span>
                    Configurações Avançadas
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start">
                      <span className="material-symbols-outlined text-red-600 mr-2">warning</span>
                      <div className="text-sm text-red-800">
                        <p className="font-semibold mb-1">⚠️ Atenção</p>
                        <p>As operações nesta seção podem afetar o funcionamento do sistema. Use com cuidado.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                      <div>
                        <div className="font-medium text-gray-700">Recarregar Configurações</div>
                        <div className="text-sm text-gray-500">Recarregar configurações do servidor</div>
                      </div>
                      <button
                        onClick={handleReloadSettings}
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <span className="material-symbols-outlined mr-2 text-sm">refresh</span>
                        Recarregar
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 shadow-sm">
                      <div>
                        <div className="font-semibold text-red-800 flex items-center">
                          <span className="material-symbols-outlined mr-2 text-red-600">restart_alt</span>
                          Resetar Configurações
                        </div>
                        <div className="text-sm text-red-700">Restaurar todas as configurações para os valores padrão</div>
                      </div>
                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        <span className="material-symbols-outlined mr-2 text-sm">restart_alt</span>
                        Resetar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Confirmação de Reset */}
            {showResetConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-red-100 rounded-full mr-3">
                      <span className="material-symbols-outlined text-red-600">warning</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Confirmar Reset</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Tem certeza que deseja resetar todas as configurações para os valores padrão? 
                    Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleResetSettings}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 flex items-center transition-all duration-200 shadow-lg font-medium"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Resetando...
                        </>
                      ) : (
                        'Resetar'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
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

            {/* Modal de Preview em Tela Cheia */}
            {showFullscreenPreview && (
              <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
                <button
                  onClick={() => setShowFullscreenPreview(false)}
                  className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors z-10"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                
                <div className="absolute inset-0">
                  {localSettings.background_type === 'video' && localSettings.main_background && (
                    <video
                      key={localSettings.main_background}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={localSettings.main_background} type="video/mp4" />
                    </video>
                  )}
                  
                  {localSettings.background_type === 'image' && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage: `url(${localSettings.main_background})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  )}
                  
                  {localSettings.background_type === 'color' && (
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundColor: localSettings.main_background
                      }}
                    />
                  )}
                </div>
                
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-lg backdrop-blur-sm">
                  <p className="text-sm">
                    {localSettings.background_type === 'video' && `Vídeo: ${localSettings.main_background}`}
                    {localSettings.background_type === 'image' && `Imagem: ${localSettings.main_background}`}
                    {localSettings.background_type === 'color' && `Cor: ${localSettings.main_background}`}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">Pressione ESC ou clique no X para fechar</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </DashboardPageLayout>
  )
}
