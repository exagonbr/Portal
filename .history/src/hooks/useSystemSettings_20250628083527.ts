import { useState, useEffect, useRef, useCallback } from 'react'

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
  
  // Refs para controle de requisições
  const loadingRef = useRef(false)
  const lastLoadTimeRef = useRef(0)
  const CACHE_DURATION = 30000 // 30 segundos de cache

  // Helper function para buscar token de autenticação
  const getAuthToken = (): string | null => {
    // Buscar token do localStorage primeiro, depois dos cookies
    let token = localStorage.getItem('token') || localStorage.getItem('auth_token')
    
    // Se não encontrou no localStorage, tentar buscar dos cookies
    if (!token && typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
      if (authCookie) {
        token = authCookie.split('=')[1]
      }
    }
    
    return token
  }

  // Carregar configurações da API com controle de cache
  const loadSettings = useCallback(async (forceReload = false) => {
    // Evitar múltiplas requisições simultâneas
    if (loadingRef.current) {
      console.log('⚠️ Requisição de settings já em andamento, ignorando...')
      return
    }

    // Verificar cache (não recarregar se foi feito recentemente)
    const now = Date.now()
    if (!forceReload && (now - lastLoadTimeRef.current) < CACHE_DURATION) {
      console.log('⚡ Usando cache de settings (carregado há menos de 30s)')
      return
    }

    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)

      // Buscar token do localStorage primeiro, depois dos cookies
      let token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      
      // Se não encontrou no localStorage, tentar buscar dos cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }
      
      console.log('🔑 Token encontrado:', token ? 'Sim' : 'Não')
      console.log('🔑 Token source:', token ? (localStorage.getItem('token') ? 'localStorage' : 'cookies') : 'none')
      
      // Adicionar timestamp para evitar cache do navegador
      const url = `/api/settings?_t=${now}`
      console.log('📡 Fazendo requisição para:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })

      console.log('📡 Resposta recebida:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', errorText)
        throw new Error(`Erro ao carregar configurações: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        setSettings({ ...defaultFullSettings, ...data.data })
        lastLoadTimeRef.current = now
        
        // Se é fallback, salvar no localStorage
        if (data.fallback) {
          localStorage.setItem('systemSettings', JSON.stringify(data.data))
        }
      } else {
        throw new Error(data.error || 'Erro ao carregar configurações')
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Fallback para localStorage
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          setSettings({ ...defaultFullSettings, ...parsed })
        } catch (parseError) {
          console.error('Erro ao carregar configurações do localStorage:', parseError)
          setSettings(defaultFullSettings)
        }
      }
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [])

  // Carregar apenas uma vez na inicialização
  useEffect(() => {
    loadSettings()
    loadAvailableVideos()
  }, [loadSettings])

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
    
    // Salvar no localStorage como backup
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
      // Buscar token do localStorage primeiro, depois dos cookies
      let token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      
      // Se não encontrou no localStorage, tentar buscar dos cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (!response.ok) {
        throw new Error(`Erro ao salvar configurações: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        updateSettings(newSettings)
        return true
      } else {
        throw new Error(data.error || 'Erro ao salvar configurações')
      }
    } catch (err) {
      console.error('Erro ao salvar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setSaving(false)
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
      // Buscar token do localStorage primeiro, depois dos cookies
      let token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      
      // Se não encontrou no localStorage, tentar buscar dos cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test-aws',
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          region: credentials.region
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ao testar conexão AWS: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao testar conexão AWS:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao testar conexão com AWS'
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
      // Buscar token do localStorage primeiro, depois dos cookies
      let token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      
      // Se não encontrou no localStorage, tentar buscar dos cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'test-email',
          host: emailConfig.host,
          port: emailConfig.port,
          user: emailConfig.user,
          password: emailConfig.password,
          secure: emailConfig.secure,
          fromAddress: emailConfig.fromAddress
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ao testar email: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Erro ao testar email:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao testar conexão de email'
      }
    }
  }

  const resetSettings = async () => {
    try {
      setSaving(true)
      setError(null)

      // Buscar token do localStorage primeiro, depois dos cookies
      let token = localStorage.getItem('token') || localStorage.getItem('auth_token')
      
      // Se não encontrou no localStorage, tentar buscar dos cookies
      if (!token && typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='))
        if (authCookie) {
          token = authCookie.split('=')[1]
        }
      }
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'reset'
        })
      })

      if (!response.ok) {
        throw new Error(`Erro ao resetar configurações: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setSettings(defaultFullSettings)
        localStorage.removeItem('systemSettings')
        return true
      } else {
        throw new Error(data.error || 'Erro ao resetar configurações')
      }
    } catch (err) {
      console.error('Erro ao resetar configurações:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      return false
    } finally {
      setSaving(false)
    }
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
    loadSettings,
    isLoading: loading, // Compatibilidade
    availableVideos,
    getRandomVideo
  }
}