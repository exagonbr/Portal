'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Database, 
  Server, 
  Download,
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  PieChart,
  Activity
} from 'lucide-react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

interface SystemReport {
  id: string
  title: string
  description: string
  type: 'chart' | 'table' | 'metric'
  data: any
  lastUpdated: string
}

export default function SystemReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const [reports, setReports] = useState<SystemReport[]>([])

  useEffect(() => {
    loadReports()
  }, [selectedPeriod, selectedCategory])

  const loadReports = async () => {
    setIsLoading(true)
    // Simular carregamento de dados
    setTimeout(() => {
      setReports([
        {
          id: '1',
          title: 'Usuários Ativos',
          description: 'Total de usuários ativos no sistema',
          type: 'metric',
          data: { value: 1247, change: '+12%' },
          lastUpdated: '2024-01-15 14:30'
        },
        {
          id: '2',
          title: 'Instituições Cadastradas',
          description: 'Número total de instituições no sistema',
          type: 'metric',
          data: { value: 45, change: '+3%' },
          lastUpdated: '2024-01-15 14:30'
        },
        {
          id: '3',
          title: 'Performance do Sistema',
          description: 'Métricas de performance e disponibilidade',
          type: 'chart',
          data: { uptime: '99.8%', responseTime: '120ms' },
          lastUpdated: '2024-01-15 14:30'
        },
        {
          id: '4',
          title: 'Uso de Recursos',
          description: 'Utilização de CPU, memória e armazenamento',
          type: 'chart',
          data: { cpu: 45, memory: 67, storage: 23 },
          lastUpdated: '2024-01-15 14:30'
        }
      ])
      setIsLoading(false)
    }, 1000)
  }

  const exportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exportando relatório em formato ${format}`)
    // Implementar lógica de exportação
  }

  return (
    <DashboardPageLayout
      title="Relatórios do Sistema"
    >
      <div className="space-y-6">
        {/* Filtros e Controles */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Período
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="7d">Últimos 7 dias</option>
                  <option value="30d">Últimos 30 dias</option>
                  <option value="90d">Últimos 90 dias</option>
                  <option value="1y">Último ano</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoria
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos</option>
                  <option value="users">Usuários</option>
                  <option value="performance">Performance</option>
                  <option value="security">Segurança</option>
                  <option value="content">Conteúdo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => loadReports()}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              
              <div className="relative group">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => exportReport('pdf')}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => exportReport('excel')}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => exportReport('csv')}
                    className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg"
                  >
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reports.filter(r => r.type === 'metric').map((report) => (
            <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  {report.title.includes('Usuários') && <Users className="w-6 h-6 text-blue-600" />}
                  {report.title.includes('Instituições') && <Database className="w-6 h-6 text-blue-600" />}
                  {report.title.includes('Performance') && <Activity className="w-6 h-6 text-blue-600" />}
                </div>
                <span className={`text-sm font-medium ${
                  report.data.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {report.data.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {report.data.value}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {report.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Atualizado: {report.lastUpdated}
              </p>
            </div>
          ))}
        </div>

        {/* Gráficos e Relatórios Detalhados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance do Sistema
              </h3>
              <Server className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                  <span className="font-medium text-green-600">99.8%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Tempo de Resposta</span>
                  <span className="font-medium text-blue-600">120ms</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Uso de Recursos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Uso de Recursos
              </h3>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">CPU</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Memória</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Armazenamento</span>
                  <span className="font-medium">23%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Relatórios Disponíveis */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Relatórios Disponíveis
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Relatório de Usuários', icon: Users, description: 'Análise detalhada dos usuários' },
              { name: 'Relatório de Performance', icon: TrendingUp, description: 'Métricas de performance do sistema' },
              { name: 'Relatório de Segurança', icon: Activity, description: 'Análise de segurança e acessos' },
              { name: 'Relatório de Conteúdo', icon: FileText, description: 'Estatísticas de conteúdo' },
              { name: 'Relatório Financeiro', icon: PieChart, description: 'Análise financeira do sistema' },
              { name: 'Relatório de Backup', icon: Database, description: 'Status dos backups do sistema' }
            ].map((report, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <report.icon className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {report.name}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {report.description}
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Gerar Relatório →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardPageLayout>
  )
} 