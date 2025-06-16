import { useState, useEffect } from 'react'

export interface AwsSettings {
  accessKeyId: string
  secretAccessKey: string
  region: string
  s3BucketName: string
  cloudWatchNamespace: string
  updateInterval: number
  enableRealTimeUpdates: boolean
}

const defaultSettings: AwsSettings = {
  accessKeyId: '',
  secretAccessKey: '',
  region: 'sa-east-1',
  s3BucketName: '',
  cloudWatchNamespace: 'Portal/Metrics',
  updateInterval: 30,
  enableRealTimeUpdates: true
}

export function useAwsSettings() {
  const [settings, setSettings] = useState<AwsSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar configurações do servidor
  const loadSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/aws/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        // Se não encontrar configurações, usar padrão
        if (response.status === 404) {
          setSettings(defaultSettings)
          return
        }
        throw new Error(`Erro ao carregar configurações: ${response.status}`)
      }

      const data = await response.json()
      if (data.success && data.data) {
        setSettings(data.data)
      } else {
        // Fallback para localStorage se API falhar
        const savedSettings = localStorage.getItem('awsSettings')
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings))
        } else {
          setSettings(defaultSettings)
        }
      }
    } catch (err) {
      console.error('Erro ao carregar configurações AWS:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      
      // Fallback para localStorage
      const savedSettings = localStorage.getItem('awsSettings')
      if (savedSettings) {
        try {
          setSettings(JSON.parse(savedSettings))
        } catch (parseError) {
          setSettings(defaultSettings)
        }
      } else {
        setSettings(defaultSettings)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Salvar configurações no servidor
  const updateSettings = async (newSettings: Partial<AwsSettings>): Promise<boolean> => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/aws/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSettings)
      })

      if (!response.ok) {
        throw new Error(`Erro ao salvar configurações: ${response.status}`)
      }

      const data = await response.json()
      if (data.success) {
        setSettings(updatedSettings)
        // Também salvar no localStorage como backup
        localStorage.setItem('awsSettings', JSON.stringify(updatedSettings))
        setError(null)
        return true
      } else {
        throw new Error(data.message || 'Erro ao salvar configurações')
      }
    } catch (err) {
      console.error('Erro ao salvar configurações AWS:', err)
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações')
      
      // Fallback para localStorage
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)
      localStorage.setItem('awsSettings', JSON.stringify(updatedSettings))
      return false
    }
  }

  // Resetar configurações
  const resetSettings = async (): Promise<boolean> => {
    try {
      setSettings(defaultSettings)
      localStorage.removeItem('awsSettings')
      
      // Opcional: também limpar no servidor
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/aws/settings', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      }
      
      setError(null)
      return true
    } catch (err) {
      console.error('Erro ao resetar configurações:', err)
      return false
    }
  }

  // Testar conexão AWS
  const testConnection = async (testSettings?: Partial<AwsSettings>) => {
    try {
      const settingsToTest = testSettings ? { ...settings, ...testSettings } : settings
      
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Token de autenticação não encontrado')
      }

      const response = await fetch('/api/aws/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsToTest)
      })

      const data = await response.json()
      return data
    } catch (err) {
      console.error('Erro ao testar conexão AWS:', err)
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Erro ao testar conexão'
      }
    }
  }

  // Carregar configurações na inicialização
  useEffect(() => {
    loadSettings()
  }, [])

  return {
    settings,
    updateSettings,
    resetSettings,
    testConnection,
    loadSettings,
    isLoading,
    error
  }
} 