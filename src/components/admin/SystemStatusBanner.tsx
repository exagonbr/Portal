'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  frontend: {
    status: string
    version: string
    uptime: number
    environment: string
  }
  backend: {
    status: string
    url: string
    responseTime: number | null
    error: string | null
  }
  services: {
    authentication: string
    database: string
    redis: string
  }
}

export default function SystemStatusBanner() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastCheck, setLastCheck] = useState<Date>(new Date())

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      setHealth(data)
      setLastCheck(new Date())
    } catch (error) {
      console.log('Erro ao verificar saúde do sistema:', error)
      setHealth({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        frontend: {
          status: 'healthy',
          version: '1.0.0',
          uptime: 0,
          environment: 'unknown'
        },
        backend: {
          status: 'unreachable',
          url: 'unknown',
          responseTime: null,
          error: 'Failed to check health'
        },
        services: {
          authentication: 'fallback_available',
          database: 'unknown',
          redis: 'unknown'
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSystemHealth()
    
    // Verificar a cada 30 segundos
    const interval = setInterval(checkSystemHealth, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-100 border-l-4 border-gray-400 p-4 mb-4">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600">Verificando status do sistema...</span>
        </div>
      </div>
    )
  }

  if (!health) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'green'
      case 'degraded': return 'yellow'
      case 'unhealthy': return 'red'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'unhealthy': return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusMessage = () => {
    if (health.status === 'healthy') {
      return 'Todos os sistemas operando normalmente'
    } else if (health.status === 'degraded') {
      return 'Sistema operando em modo degradado - Backend indisponível, usando fallback'
    } else {
      return 'Problemas detectados no sistema'
    }
  }

  const color = getStatusColor(health.status)
  const shouldShow = health.status !== 'healthy' // Só mostrar se não estiver 100% saudável

  if (!shouldShow) return null

  return (
    <div className={`bg-${color}-50 border-l-4 border-${color}-400 p-4 mb-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getStatusIcon(health.status)}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium text-${color}-800`}>
            Status do Sistema
          </h3>
          <div className={`mt-1 text-sm text-${color}-700`}>
            <p>{getStatusMessage()}</p>
            
            {health.backend.status !== 'healthy' && (
              <div className="mt-2 space-y-1">
                <p className="font-medium">Detalhes:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Backend: {health.backend.status} ({health.backend.url})</li>
                  {health.backend.error && (
                    <li>Erro: {health.backend.error}</li>
                  )}
                  <li>Autenticação: {health.services.authentication}</li>
                  {health.backend.responseTime && (
                    <li>Tempo de resposta: {health.backend.responseTime}ms</li>
                  )}
                </ul>
              </div>
            )}
            
            <p className="mt-2 text-xs opacity-75">
              Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
        
        <div className="ml-3">
          <button
            onClick={checkSystemHealth}
            className={`text-xs bg-${color}-100 hover:bg-${color}-200 text-${color}-800 px-2 py-1 rounded transition-colors`}
          >
            Verificar Novamente
          </button>
        </div>
      </div>
    </div>
  )
} 