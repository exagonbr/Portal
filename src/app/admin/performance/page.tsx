'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAwsSettings } from '@/hooks/useAwsSettings'
import { awsService, CloudWatchMetric } from '@/services/awsService'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

// Registrar componentes do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Interface para histórico de métricas
interface MetricHistory {
  timestamp: string
  [key: string]: string | number
}

export default function AdminPerformancePage() {
  const { settings, isLoading: settingsLoading } = useAwsSettings()
  const [metrics, setMetrics] = useState<CloudWatchMetric[]>([])
  const [metricsHistory, setMetricsHistory] = useState<MetricHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    try {
      setError(null)
      awsService.setSettings(settings)
      const data = await awsService.getPerformanceMetrics()
      setMetrics(data)
      setLastUpdate(new Date())

      // Adicionar ao histórico (manter apenas os últimos 20 pontos)
      const historyEntry: MetricHistory = {
        timestamp: new Date().toLocaleTimeString(),
        ...data.reduce((acc, metric) => {
          // Extrair valor numérico do string (ex: "70%" -> 70)
          const numericValue = parseFloat(metric.value.replace(/[^0-9.]/g, ''))
          acc[metric.name] = isNaN(numericValue) ? 0 : numericValue
          return acc
        }, {} as Record<string, number>)
      }

      setMetricsHistory(prev => {
        const newHistory = [...prev, historyEntry]
        return newHistory.slice(-20) // Manter apenas os últimos 20 pontos
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar métricas')
      console.error('Erro ao buscar métricas:', err)
    } finally {
      setIsLoading(false)
    }
  }, [settings])

  useEffect(() => {
    if (!settingsLoading && settings.accessKeyId) {
      fetchMetrics()
    }
  }, [fetchMetrics, settingsLoading, settings.accessKeyId])

  useEffect(() => {
    if (!settingsLoading && settings.enableRealTimeUpdates && settings.accessKeyId) {
      const interval = setInterval(fetchMetrics, settings.updateInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [fetchMetrics, settings.enableRealTimeUpdates, settings.updateInterval, settingsLoading, settings.accessKeyId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-accent-green/20 text-accent-green'
      case 'warning': return 'bg-accent-yellow/20 text-accent-yellow'
      case 'critical': return 'bg-error/20 text-error'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'good': return 'Normal'
      case 'warning': return 'Atenção'
      case 'critical': return 'Crítico'
      default: return 'Desconhecido'
    }
  }

  // Configuração do gráfico de linha (histórico)
  const lineChartData = {
    labels: metricsHistory.map(h => h.timestamp),
    datasets: [
      {
        label: 'CPU Usage (%)',
        data: metricsHistory.map(h => h['CPU Usage'] || 0),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Memory Usage (%)',
        data: metricsHistory.map(h => h['Memory Usage'] || 0),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Disk Usage (%)',
        data: metricsHistory.map(h => h['Disk Usage'] || 0),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  }

  // Configuração do gráfico de barras (valores atuais)
  const barChartData = {
    labels: metrics.map(m => m.name),
    datasets: [{
      label: 'Valores Atuais',
      data: metrics.map(m => {
        const numericValue = parseFloat(m.value.replace(/[^0-9.]/g, ''))
        return isNaN(numericValue) ? 0 : numericValue
      }),
      backgroundColor: metrics.map(m => {
        switch (m.status) {
          case 'good': return 'rgba(16, 185, 129, 0.8)'
          case 'warning': return 'rgba(245, 158, 11, 0.8)'
          case 'critical': return 'rgba(239, 68, 68, 0.8)'
          default: return 'rgba(156, 163, 175, 0.8)'
        }
      }),
      borderColor: metrics.map(m => {
        switch (m.status) {
          case 'good': return 'rgb(16, 185, 129)'
          case 'warning': return 'rgb(245, 158, 11)'
          case 'critical': return 'rgb(239, 68, 68)'
          default: return 'rgb(156, 163, 175)'
        }
      }),
      borderWidth: 2,
    }]
  }

  // Configuração do gráfico de rosca (status das métricas)
  const statusCounts = metrics.reduce((acc, metric) => {
    acc[metric.status] = (acc[metric.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const doughnutChartData = {
    labels: ['Normal', 'Atenção', 'Crítico'],
    datasets: [{
      data: [
        statusCounts['good'] || 0,
        statusCounts['warning'] || 0,
        statusCounts['critical'] || 0
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)'
      ],
      borderWidth: 2,
    }]
  }

  // Opções dos gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Para métricas em porcentagem
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando configurações...</div>
      </div>
    )
  }

  if (!settings.accessKeyId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Performance do Sistema</h1>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-yellow-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Configuração da AWS Necessária</h3>
              <p className="text-yellow-700 mt-1">
                Para visualizar as métricas de performance, configure suas credenciais da AWS na página de configurações.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Performance do Sistema</h1>
          <p className="text-gray-600 text-sm mt-1">
            Dados atualizados a cada {settings.updateInterval}s | Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Região:</span>
            <span className="bg-gray-100 px-2 py-1 rounded text-sm font-medium">{settings.region}</span>
          </div>
          <button 
            onClick={fetchMetrics}
            disabled={isLoading}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
          >
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">❌</div>
            <div>
              <h3 className="text-lg font-medium text-red-800">Erro ao Carregar Dados</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          ))
        ) : (
          metrics.map((metric) => (
            <div key={metric.name} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md">
              <h3 className="text-sm font-medium text-gray-500">{metric.name}</h3>
              <p className="text-2xl font-bold text-primary mt-2">{metric.value}</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getStatusColor(metric.status)}`}>
                {getStatusText(metric.status)}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Atualizado: {metric.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Gráficos de Performance */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Gráfico de Linha - Histórico */}
        <div className="xl:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Histórico de Performance</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>CloudWatch:</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{settings.cloudWatchNamespace}</span>
            </div>
          </div>
          <div className="h-64">
            {metricsHistory.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 border border-gray-100 rounded-lg bg-gray-50">
                <div className="text-center">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Coletando dados de histórico...</p>
                  <p className="text-sm mt-1">Os gráficos aparecerão após algumas atualizações</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico de Rosca - Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-primary mb-4">Status das Métricas</h2>
          <div className="h-64">
            {metrics.length > 0 ? (
              <Doughnut data={doughnutChartData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 border border-gray-100 rounded-lg bg-gray-50">
                <div className="text-center">
                  <div className="text-4xl mb-2">🍩</div>
                  <p>Carregando status...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfico de Barras - Valores Atuais */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Valores Atuais</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Atenção</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Crítico</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          {metrics.length > 0 ? (
            <Bar data={barChartData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 border border-gray-100 rounded-lg bg-gray-50">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>Carregando métricas...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AWS Connection Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-primary mb-4">Status da Conexão AWS</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-2">🔗</div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-green-600 font-semibold">Conectado</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🌍</div>
            <p className="text-sm font-medium">Região</p>
            <p className="text-gray-700 font-semibold">{settings.region}</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">⏱️</div>
            <p className="text-sm font-medium">Intervalo</p>
            <p className="text-gray-700 font-semibold">{settings.updateInterval}s</p>
          </div>
        </div>
      </div>
    </div>
  )
}