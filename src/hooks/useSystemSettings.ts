import { useState, useEffect } from 'react'

export interface BackgroundSettings {
  type: 'video' | 'url' | 'color'
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

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [availableVideos, setAvailableVideos] = useState<string[]>([])

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (error) {
        console.error('Erro ao carregar configurações do sistema:', error)
      }
    }

    // Carregar lista de vídeos disponíveis
    loadAvailableVideos()
    setIsLoading(false)
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

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('systemSettings', JSON.stringify(updatedSettings))
  }

  const updateLoginBackground = (background: Partial<BackgroundSettings>) => {
    const updatedBackground = { ...settings.loginBackground, ...background }
    updateSettings({ loginBackground: updatedBackground })
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('systemSettings')
  }

  const getRandomVideo = () => {
    if (availableVideos.length === 0) return '/back_video4.mp4'
    const randomIndex = Math.floor(Math.random() * availableVideos.length)
    return availableVideos[randomIndex]
  }

  return {
    settings,
    updateSettings,
    updateLoginBackground,
    resetSettings,
    isLoading,
    availableVideos,
    getRandomVideo
  }
} 