'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Activity,
  Clock,
  TrendingUp,
  Download,
  Filter,
  RefreshCw,
  School,
  UserCheck,
  BookOpen,
  MousePointer,
  LogIn,
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  Search,
  Target,
  Globe,
  Zap,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'

interface UsageData {
  totalUsers: number
  activeUsers: number
  totalSessions: number
  averageSessionDuration: number
  byRole: Record<string, number>
  byInstitution: Record<string, number>
  byActivityType: Record<string, number>
  timeline: Array<{
    date: string
    users: number
    sessions: number
    activities: number
  }>
  averageUsersPerDay: number
  averageSessionsPerDay: number
  averageActivitiesPerDay: number
  peakUsageDay: {
    date: string
    users: number
    sessions: number
    activities: number
  }
  growthRate: string
}

interface Filters {
  period: string
  role: string
  institution_id: string
  activity_type: string
  date_from: string
  date_to: string
  user_name: string
  institution_name: string
}

export default function UsageReportsPage() {
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    period: '30d',
    role: 'all',
    institution_id: '',
    activity_type: 'all',
    date_from: '',
    date_to: '',
    user_name: '',
    institution_name: ''
  })

  useEffect(() => {
    loadUsageData()
  }, [])

  const loadUsageData = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/reports/usage?${params}`)
      const result = await response.json()

      if (result.success) {
        setUsageData(result.data)
      } else {
        console.error('Erro ao carregar dados:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar dados de uso:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    loadUsageData()
  }

  const clearFilters = () => {
    setFilters({
      period: '30d',
      role: 'all',
      institution_id: '',
      activity_type: 'all',
      date_from: '',
      date_to: '',
      user_name: '',
      institution_name: ''
    })
    setTimeout(() => loadUsageData(), 100)
  }

  const exportReport = async (format: 'PDF' | 'EXCEL' | 'CSV') => {
    try {
      const response = await fetch('/api/reports/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format, filters })
      })

      const result = await response.json()
      if (result.success) {
        alert('Exportação iniciada! Você será notificado quando estiver pronta.')
      } else {
        alert('Erro ao iniciar exportação: ' + result.error)
      }
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('Erro ao exportar relatório')
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT': return <Users className="w-5 h-5" />
      case 'TEACHER': return <BookOpen className="w-5 h-5" />
      case 'MANAGER': return <UserCheck className="w-5 h-5" />
      case 'PARENT': return <Users className="w-5 h-5" />
      case 'ADMIN': return <Activity className="w-5 h-5" />
      case 'INSTITUTION_ADMIN': return <School className="w-5 h-5" />
      case 'SYSTEM_ADMIN': return <Activity className="w-5 h-5" />
      default: return <Users className="w-5 h-5" />
    }
  }

  const getRoleName = (role: string) => {
    switch (role) {
      case 'STUDENT': return 'Alunos'
      case 'TEACHER': return 'Professores'
      case 'MANAGER': return 'Gestores'
      case 'PARENT': return 'Responsáveis'
      case 'ADMIN': return 'Administradores'
      case 'INSTITUTION_ADMIN': return 'Admins Instituição'
      case 'SYSTEM_ADMIN': return 'Admins Sistema'
      default: return role
    }
  }

  const getActivityIcon = (activity: string) => {
    switch (activity) {
      case 'login': return <LogIn className="w-4 h-4" />
      case 'logout': return <LogIn className="w-4 h-4" />
      case 'video': return <Eye className="w-4 h-4" />
      case 'page_view': return <MousePointer className="w-4 h-4" />
      case 'content_access': return <FileText className="w-4 h-4" />
      case 'quiz_attempt': return <BookOpen className="w-4 h-4" />
      case 'assignment_submit': return <FileText className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  const getActivityName = (activity: string) => {
    switch (activity) {
      case 'login': return 'Logins'
      case 'logout': return 'Logouts'
      case 'video': return 'Visualização de Vídeos'
      case 'page_view': return 'Visualizações'
      case 'content_access': return 'Acesso a Conteúdo'
      case 'quiz_attempt': return 'Tentativas de Quiz'
      case 'assignment_submit': return 'Envios de Tarefas'
      default: return activity
    }
  }

  return (
    <DashboardPageLayout
      title="📊 Relatórios de Uso da Plataforma"
      subtitle="Análise completa do uso e engajamento dos usuários"
    >
      <div className="space-y-8">
        {/* Filtros em Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Filtros de Pesquisa
            </h3>
          </div>
          
          {/* Grid de Filtros Responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Período
              </label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="1y">Último ano</option>
                <option value="custom">Período customizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                👥 Tipo de Usuário
              </label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos os usuários</option>
                <option value="STUDENT">👨‍🎓 Alunos</option>
                <option value="TEACHER">👨‍🏫 Professores</option>
                <option value="MANAGER">👨‍💼 Gestores</option>
                <option value="PARENT">👨‍👩‍👧‍👦 Responsáveis</option>
                <option value="INSTITUTION_ADMIN">🏛️ Admins Instituição</option>
                <option value="SYSTEM_ADMIN">⚙️ Admins Sistema</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎯 Tipo de Atividade
              </label>
              <select
                value={filters.activity_type}
                onChange={(e) => handleFilterChange('activity_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas as atividades</option>
                <option value="login">🔐 Logins</option>
                <option value="video">📺 Visualização de Vídeos</option>
                <option value="page_view">👁️ Visualizações</option>
                <option value="content_access">📖 Acesso a Conteúdo</option>
                <option value="quiz_attempt">📝 Tentativas de Quiz</option>
                <option value="assignment_submit">📤 Envios de Tarefas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔍 Nome do Usuário
              </label>
              <input
                type="text"
                value={filters.user_name}
                onChange={(e) => handleFilterChange('user_name', e.target.value)}
                placeholder="Digite o nome..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🏫 Nome da Instituição
              </label>
              <input
                type="text"
                value={filters.institution_name}
                onChange={(e) => handleFilterChange('institution_name', e.target.value)}
                placeholder="Digite a instituição..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {filters.period === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📅 Data Inicial
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📅 Data Final
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={applyFilters}
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Carregando...' : 'Aplicar Filtros'}
            </button>
            
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Limpar Filtros
            </button>
            
            <div className="relative group">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => exportReport('PDF')}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => exportReport('EXCEL')}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  📊 Excel
                </button>
                <button
                  onClick={() => exportReport('CSV')}
                  className="block w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg"
                >
                  📋 CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas Principais */}
        {usageData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Usuários */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Users className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium flex items-center gap-1 ${
                    parseFloat(usageData.growthRate) >= 0 ? 'text-green-200' : 'text-red-200'
                  }`}>
                    {parseFloat(usageData.growthRate) >= 0 ? 
                      <ArrowUp className="w-4 h-4" /> : 
                      <ArrowDown className="w-4 h-4" />
                    }
                    {Math.abs(parseFloat(usageData.growthRate))}%
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {formatNumber(usageData.totalUsers)}
              </h3>
              <p className="text-blue-100 mb-1">Total de Usuários</p>
              <p className="text-xs text-blue-200">
                {formatNumber(usageData.averageUsersPerDay)} usuários/dia em média
              </p>
            </div>

            {/* Usuários Ativos */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <UserCheck className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-200">
                    {usageData.totalUsers > 0 ? Math.round((usageData.activeUsers / usageData.totalUsers) * 100) : 0}% ativo
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {formatNumber(usageData.activeUsers)}
              </h3>
              <p className="text-green-100 mb-1">Usuários Ativos</p>
              <p className="text-xs text-green-200">
                Últimos 7 dias do período
              </p>
            </div>

            {/* Total de Sessões */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-purple-200">
                    <Zap className="w-4 h-4 inline" />
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {formatNumber(usageData.totalSessions)}
              </h3>
              <p className="text-purple-100 mb-1">Total de Sessões</p>
              <p className="text-xs text-purple-200">
                {formatNumber(usageData.averageSessionsPerDay)} sessões/dia em média
              </p>
            </div>

            {/* Duração Média */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-orange-200">
                    <Target className="w-4 h-4 inline" />
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-2">
                {usageData.averageSessionDuration}min
              </h3>
              <p className="text-orange-100 mb-1">Duração Média</p>
              <p className="text-xs text-orange-200">
                Por sessão de usuário
              </p>
            </div>
          </div>
        )}

        {/* Cards de Resumo Adicional */}
        {usageData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Atividades por Dia */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(usageData.averageActivitiesPerDay)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Atividades por dia
                  </p>
                </div>
              </div>
            </div>

            {/* Dia de Pico */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <Calendar className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {usageData.peakUsageDay.date.split('-').reverse().join('/')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dia de maior uso ({formatNumber(usageData.peakUsageDay.users)} usuários)
                  </p>
                </div>
              </div>
            </div>

            {/* Taxa de Crescimento */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  parseFloat(usageData.growthRate) >= 0 ? 
                  'bg-green-100 dark:bg-green-900' : 
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  {parseFloat(usageData.growthRate) >= 0 ? 
                    <ArrowUp className="w-6 h-6 text-green-600" /> : 
                    <ArrowDown className="w-6 h-6 text-red-600" />
                  }
                </div>
                <div>
                  <h4 className={`text-2xl font-bold ${
                    parseFloat(usageData.growthRate) >= 0 ? 
                    'text-green-600' : 
                    'text-red-600'
                  }`}>
                    {parseFloat(usageData.growthRate) >= 0 ? '+' : ''}{usageData.growthRate}%
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Taxa de crescimento
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas por Tipo de Usuário */}
        {usageData && Object.keys(usageData.byRole).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <PieChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Distribuição por Tipo de Usuário
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(usageData.byRole).map(([role, count]) => (
                <div key={role} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        {getRoleIcon(role)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {getRoleName(role)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {usageData.totalUsers > 0 ? Math.round((count / usageData.totalUsers) * 100) : 0}% do total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(count)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas por Instituição */}
        {usageData && Object.keys(usageData.byInstitution).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <School className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Top Instituições por Usuários
              </h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(usageData.byInstitution).map(([institution, count]) => (
                <div key={institution} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {institution}
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatNumber(count)} usuários
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(count / Math.max(...Object.values(usageData.byInstitution))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estatísticas por Tipo de Atividade */}
        {usageData && Object.keys(usageData.byActivityType).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Atividades por Tipo
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(usageData.byActivityType).map(([activity, count]) => (
                <div key={activity} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        {getActivityIcon(activity)}
     