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

  useEffect(() => {
    // Carregar configurações do localStorage
    const savedSettings = localStorage.getItem('awsSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Erro ao carregar configurações da AWS:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const updateSettings = (newSettings: Partial<AwsSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem('awsSettings', JSON.stringify(updatedSettings))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('awsSettings')
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoading
  }
} 