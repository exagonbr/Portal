'use client'

import { useState } from 'react'
import { 
  LineChart, 
  BarChart, 
  Activity, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle,
  AreaChart,
  Download,
  RefreshCw,
  Lightbulb,
  AlertCircle
} from 'lucide-react'
import { UserRole } from '@/types/roles'

export default function AdminPerformancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d')

  const performanceData = {
    overview: {
      totalRequests: 1245876,
      avgResponseTime: 124,
      errorRate: 0.15,
      uptime: 99.97
    },
    metrics: [
      { name: 'Requisições/min', value: 2847, change: 12.5, trend: 'up' },
      { name: 'Tempo de Resposta', value: 124, change: -8.2, trend: 'down' },
      { name: 'Taxa de Erro', value: 0.15, change: -0.05, trend: 'down' },
      { name: 'Uso de CPU', value: 68, change: 5.3, trend: 'up' },
      { name: 'Uso de Memória', value: 72, change: 2.1, trend: 'up' },
      { name: 'Throughput', value: 156, change: 18.7, trend: 'up' }
    ],
    endpoints: [
      { path: '/api/user', requests: 45678, avgTime: 89, errorRate: 0.12 },
      { path: '/api/courses', requests: 34521, avgTime: 156, errorRate: 0.08 },
      { path: '/api/auth/login', requests: 28945, avgTime: 234, errorRate: 0.25 },
      { path: '/api/content', requests: 23456, avgTime: 312, errorRate: 0.45 },
      { path: '/api/files', requests: 18734, avgTime: 445, errorRate: 0.89 }
    ]
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center">
          <Activity className="mr-2 h-8 w-8 text-indigo-600" />
          Performance do Sistema
        </h1>
        <p className="text-slate-600">
          Análise detalhada da performance e otimização do sistema
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
          </select>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Total de Requisições</div>
              <div className="text-2xl font-bold text-slate-800">
                {performanceData.overview.totalRequests.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 flex-shrink-0">
              <AreaChart className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-center">
            <span className="text-emerald-600 text-sm flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              12.5%
            </span>
            <span className="text-slate-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Tempo de Resposta</div>
              <div className="text-2xl font-bold text-slate-800">
                {performanceData.overview.avgResponseTime}ms
              </div>
            </div>
            <div className="p-3 rounded-full bg-blue-100 flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-center">
            <span className="text-emerald-600 text-sm flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              8.2ms
            </span>
            <span className="text-slate-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Taxa de Erro</div>
              <div className="text-2xl font-bold text-slate-800">
                {performanceData.overview.errorRate}%
              </div>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-center">
            <span className="text-emerald-600 text-sm flex items-center">
              <ArrowDownRight className="h-3 w-3 mr-1" />
              0.05%
            </span>
            <span className="text-slate-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col h-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Uptime</div>
              <div className="text-2xl font-bold text-slate-800">
                {performanceData.overview.uptime}%
              </div>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-auto pt-4 flex items-center">
            <span className="text-emerald-600 text-sm flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              0.03%
            </span>
            <span className="text-slate-500 text-sm ml-2">vs. período anterior</span>
          </div>
        </div>
      </div>

      {/* Métricas Detalhadas */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Métricas Detalhadas</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {performanceData.metrics.map((metric, index) => (
              <div key={index} className="border border-slate-200 rounded-lg p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-700 truncate">{metric.name}</h4>
                  <span className={`
                    flex items-center text-sm whitespace-nowrap ml-2
                    ${metric.trend === 'up' 
                      ? metric.name.includes('Erro') ? 'text-red-600' : 'text-emerald-600'
                      : 'text-emerald-600'}
                  `}>
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1 flex-shrink-0" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1 flex-shrink-0" />
                    )}
                    {Math.abs(metric.change)}%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-800 mb-2">
                  {metric.value}
                  {metric.name.includes('Taxa') ? '%' : 
                   metric.name.includes('Tempo') ? 'ms' : 
                   metric.name.includes('Throughput') ? 'MB/s' : ''}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-auto">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.name.includes('Erro') && metric.value > 1 ? 'bg-red-500' :
                      metric.value > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ 
                      width: `${
                        metric.name.includes('Taxa') ? Math.min(metric.value * 20, 100) : 
                        metric.name.includes('Tempo') ? Math.min(metric.value / 5, 100) :
                        metric.name.includes('Throughput') ? Math.min(metric.value, 100) :
                        Math.min(metric.value, 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Análise de Endpoints */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Performance por Endpoint</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Requisições
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tempo Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Taxa de Erro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {performanceData.endpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="text-xs sm:text-sm bg-slate-100 px-2 py-1 rounded">{endpoint.path}</code>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {endpoint.requests.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${
                      endpoint.avgTime > 400 ? 'text-red-600' :
                      endpoint.avgTime > 200 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {endpoint.avgTime}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`${
                      endpoint.errorRate > 0.5 ? 'text-red-600' :
                      endpoint.errorRate > 0.2 ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {endpoint.errorRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${endpoint.errorRate > 0.5 ? 'bg-red-100 text-red-800' :
                        endpoint.avgTime > 400 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'}
                    `}>
                      {endpoint.errorRate > 0.5 ? 'Crítico' :
                       endpoint.avgTime > 400 ? 'Lento' : 'Normal'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex flex-col sm:flex-row sm:justify-end gap-2">
                    <button className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50">
                      Analisar
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50">
                      Otimizar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendações de Otimização */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-medium text-slate-800">Recomendações de Otimização</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r">
              <div className="flex items-start">
                <Lightbulb className="text-blue-500 mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-blue-700">Otimizar endpoint /api/content</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Este endpoint tem tempo de resposta alto (312ms). Considere implementar cache ou otimizar queries.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded-r">
              <div className="flex items-start">
                <AlertCircle className="text-amber-500 mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-amber-700">Monitorar endpoint /api/files</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Taxa de erro elevada (0.89%). Verificar logs para identificar problemas.
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-l-4 border-emerald-500 bg-emerald-50 p-4 rounded-r">
              <div className="flex items-start">
                <CheckCircle className="text-emerald-500 mr-3 mt-1 h-5 w-5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-emerald-700">Performance geral estável</div>
                  <div className="text-sm text-slate-600 mt-1">
                    O sistema está operando dentro dos parâmetros normais na maioria dos endpoints.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}