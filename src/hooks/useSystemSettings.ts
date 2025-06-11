import { useState, useEffect } from 'react'

export interface BackgroundSettings {
  type: 'video' | 'image' | 'color'
  value: string
  opacity?: number
  overlay?: boolean
}

export interface SystemSettings {
  platformName: string
  systemUrl: string
  supportEmail: string
  loginBackground: BackgroundSettings
  maintenanceMode: {
    enabled: boolean
    message: string
  }
  security: {
    minPasswordLength: number
    requireSpecialChars: boolean
    requireNumbers: boolean
    twoFactorAuth: 'optional' | 'required' | 'disabled'
    sessionTimeout: number
  }
  email: {
    smtpServer: string
    port: number
    encryption: 'tls' | 'ssl' | 'none'
    fromEmail: string
  }
}

// Interface para as configurações completas do sistema
export interface FullSystemSettings {
  // Configurações gerais
  site_name: string
  site_title: string
  site_url: string
  site_description: string
  maintenance_mode: boolean
  
  // Configurações de aparência
  logo_light: string
  logo_dark: string
  background_type: 'video' | 'image' | 'color'
  main_background: string
  primary_color: string
  secondary_color: string
  
  // Configurações AWS
  aws_access_key: string
  aws_secret_key: string
  aws_region: string
  aws_bucket_main: string
  aws_bucket_backup: string
  aws_bucket_media: string
  
  // Configurações de Email
  email_smtp_host: string
  email_smtp_port: number
  email_smtp_user: string
  email_smtp_password: string
  email_smtp_secure: boolean
  email_from_name: string
  email_from_address: string
  
  // Configurações de Notificações
  notifications_email_enabled: boolean
  notifications_sms_enabled: boolean
  notifications_push_enabled: boolean
  notifications_digest_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
}

const defaultSettings: SystemSettings = {
  platformName: 'Portal Educacional',
  systemUrl: 'https://portal.educacional.com',
  supportEmail: 'suporte@portal.educacional.com',
  loginBackground: {
    type: 'video',
    value: '/back_video4.mp4',
    opacity: 100,
    overlay: false
  },
  maintenanceMode: {
    enabled: false,
    message: 'Sistema em manutenção. Voltaremos em breve.'
  },
  security: {
    minPasswordLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    twoFactorAuth: 'optional',
    sessionTimeout: 30
  },
  email: {
    smtpServer: '',
    port: 587,
    encryption: 'tls',
    fromEmail: ''
  }
}

const defaultFullSettings: FullSystemSettings = {
  // Configurações gerais
  site_name: 'Portal Educacional',
  site_title: 'Portal Educacional - Sistema de Gestão',
  site_url: 'https://portal.educacional.com',
  site_description: 'Sistema completo de gestão educacional',
  maintenance_mode: false,
  
  // Configurações de aparência
  logo_light: '/logo-light.png',
  logo_dark: '/logo-dark.png',
  background_type: 'video',
  main_background: '/back_video4.mp4',
  primary_color: '#1e3a8a',
  secondary_color: '#3b82f6',
  
  // Configurações AWS
  aws_access_key: 'AKIAYKBH43KYB2DJUQJL',
  aws_secret_key: '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',
  aws_region: 'sa-east-1',
  aws_bucket_main: '',
  aws_bucket_backup: '',
  aws_bucket_media: '',
  
  // Configurações de Email
  email_smtp_host: 'smtp.gmail.com',
  email_smtp_port: 587,
  email_smtp_user: 'sabercon@sabercon.com.br',
  email_smtp_password: 'Mayta#P1730*K',
  email_smtp_secure: true,
  email_from_name: 'Portal Educacional - Sabercon',
  email_from_address: 'noreply@sabercon.com.br',
  
  // Configurações de Notificações
  notifications_email_enabled: true,
  notifications_sms_enabled: false,
  notifications_push_enabled: true,
  notifications_digest_frequency: 'daily'
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<FullSystemSettings>(defaultFullSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableVideos, setAvailableVideos] = useState<string[]>([])

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultFullSettings, ...parsed })
      } catch (error) {
        console.error('Erro ao carregar configurações do sistema:', error)
        setError('Erro ao carregar configurações')
      }
    }

    // Carregar lista de vídeos disponíveis
    loadAvailableVideos()
    setLoading(false)
  }, [])

  const loadAvailableVideos = async () => {
    try {
      // Lista de vídeos conhecidos baseada na pasta public
      const videos = [
        '/back_video.mp4',
        '/back_video1.mp4',
        '/back_video2.mp4',
        '/back_video3.mp4',
        '/back_video4.mp4'
      ]
      setAvailableVideos(videos)
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error)
    }
  }

  const updateSettings = (newSettings: Partial<FullSystemSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('systemSettings', JSON.stringify(updatedSettings))
  }

  const updateLoginBackground = (background: Partial<BackgroundSettings>) => {
    // Compatibilidade com o formato antigo
    if (background.type) {
      updateSettings({
        background_type: background.type,
        main_background: background.value || settings.main_background
      })
    } else if (background.value) {
      updateSettings({
        main_background: background.value
      })
    }
  }

  const saveSettings = async (newSettings: Partial<FullSystemSettings>): Promise<boolean> => {
    setSaving(true)
    setError(null)
    
    try {
      // Simular salvamento no servidor
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      updateSettings(newSettings)
      setSaving(false)
      return true
    } catch (err) {
      setError('Erro ao salvar configurações')
      setSaving(false)
      return false
    }
  }

  const testAwsConnection = async (credentials: {
    accessKeyId: string
    secretAccessKey: string
    region: string
  }): Promise<{
    success: boolean
    message: string
    buckets?: string[]
  }> => {
    try {
      // Simular teste de conexão AWS
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Em produção, isso faria uma chamada real para a API AWS
      // Por enquanto, vamos simular uma resposta de sucesso
      if (credentials.accessKeyId && credentials.secretAccessKey) {
        return {
          success: true,
          message: 'Conexão com AWS estabelecida com sucesso!',
          buckets: [
            'portal-educacional-main',
            'portal-educacional-backup',
            'portal-educacional-media'
          ]
        }
      } else {
        return {
          success: false,
          message: 'Credenciais AWS inválidas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao testar conexão com AWS'
      }
    }
  }

  const testEmailConnection = async (emailConfig: {
    host: string
    port: number
    user: string
    password: string
    secure: boolean
    fromAddress: string
  }): Promise<{
    success: boolean
    message: string
  }> => {
    try {
      // Simular teste de conexão de email
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Em produção, isso faria uma chamada real para testar SMTP
      if (emailConfig.host && emailConfig.user && emailConfig.password) {
        return {
          success: true,
          message: 'Email de teste enviado com sucesso!'
        }
      } else {
        return {
          success: false,
          message: 'Configurações de email incompletas'
        }
      }
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao testar conexão de email'
      }
    }
  }

  const resetSettings = () => {
    setSettings(defaultFullSettings)
    localStorage.removeItem('systemSettings')
  }

  const getRandomVideo = () => {
    if (availableVideos.length === 0) return '/back_video4.mp4'
    const randomIndex = Math.floor(Math.random() * availableVideos.length)
    return availableVideos[randomIndex]
  }

  return {
    settings,
    loading,
    saving,
    error,
    saveSettings,
    testAwsConnection,
    testEmailConnection,
    updateSettings,
    updateLoginBackground,
    resetSettings,
    isLoading: loading, // Compatibilidade
    availableVideos,
    getRandomVideo
  }
}