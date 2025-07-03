'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

interface AuditLog {
  id: string
  timestamp: string
  user: string
  user_email: string
  action: string
  entity_type?: string
  entity_id?: string
  resource: string
  details: string
  ip: string
  user_agent?: string
  browser?: string
  operating_system?: string
  location?: string
  duration_seconds?: number
  session_id?: string
  severity: 'info' | 'warning' | 'error'
}

interface AuditStats {
  totalActivities: number
  uniqueUsers: number
  uniqueSessions: number
  loginCount: number
  videoActivities: number
  quizActivities: number
  assignmentActivities: number
  errorCount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function AdminAuditPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })
  
  // Filtros
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedUser, setSelectedUser] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        activity_type: selectedAction,
        severity: selectedSeverity,
        ...(selectedUser && { user_id: selectedUser }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      })

      const response = await fetch(`/api/admin/audit?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setPagination(data.pagination)
      } else {
        console.log('Erro ao buscar logs:', data.error)
      }
    } catch (error) {
      console.log('Erro ao buscar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate })
      })
      
      const data = await response.json()
      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.log('Erro ao buscar estatísticas:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [pagination.page, selectedAction, selectedSeverity, selectedUser, startDate, endDate])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-100 text-red-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐'
    if (action.includes('video')) return '📹'
    if (action.includes('quiz')) return '📝'
    if (action.includes('assignment')) return '📋'
    if (action.includes('error')) return '❌'
    if (action.includes('delete')) return '🗑️'
    if (action.includes('create')) return '➕'
    if (action.includes('update')) return '✏️'
    return '📊'
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER]}>
      <DashboardPageLayout
        title="Auditoria do Sistema"
        subtitle="Logs detalhados de todas as atividades dos usuários"
      >
        <div className="space-y-6">
          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.totalActivities.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total de Atividades</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</div>
                <div className="text-sm text-gray-600">Usuários Únicos</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-purple-600">{stats.uniqueSessions}</div>
                <div className="text-sm text-gray-600">Sessões Únicas</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-indigo-600">{stats.loginCount}</div>
                <div className="text-sm text-gray-600">Logins</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-pink-600">{stats.videoActivities}</div>
                <div className="text-sm text-gray-600">Ativ. Vídeo</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-cyan-600">{stats.quizActivities}</div>
                <div className="text-sm text-gray-600">Quiz</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-orange-600">{stats.assignmentActivities}</div>
                <div className="text-sm text-gray-600">Tarefas</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
                <div className="text-sm text-gray-600">Erros</div>
              </div>
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <select 
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas as Ações</option>
                <option value="LOGIN">Login/Logout</option>
                <option value="VIDEO">Vídeos</option>
                <option value="QUIZ">Quiz</option>
                <option value="ASSIGNMENT">Tarefas</option>
                <option value="SYSTEM">Sistema</option>
                <option value="page_view">Navegação</option>
                <option value="error">Erros</option>
              </select>
              
              <select 
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Todas as Severidades</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Data Inicial"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Data Final"
              />

              <input
                type="text"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                placeholder="ID do Usuário"
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tabela de Logs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Carregando logs...</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Timestamp</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Usuário</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Ação</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Recurso</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Duração</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">IP</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatTimestamp(log.timestamp)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div className="font-medium text-gray-900">{log.user}</div>
                            {log.user_email && (
                              <div className="text-xs text-gray-500">{log.user_email}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getActionIcon(log.action)}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                                {log.action}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{log.resource}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDuration(log.duration_seconds)}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">{log.ip || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <button
                              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Ver detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Detalhes expandidos */}
                {expandedLog && (
                  <div className="border-t bg-gray-50 p-4">
                    {(() => {
                      const log = logs.find(l => l.id === expandedLog)
                      if (!log) return null
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-gray-900">Detalhes da Atividade</h4>
                            <button
                              onClick={() => setExpandedLog(null)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Session ID:</span>
                              <p className="text-gray-600 break-all">{log.session_id || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Navegador:</span>
                              <p className="text-gray-600">{log.browser || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Sistema Operacional:</span>
                              <p className="text-gray-600">{log.operating_system || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Localização:</span>
                              <p className="text-gray-600">{log.location || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium">Tipo de Entidade:</span>
                              <p className="text-gray-600">{log.entity_type || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium">ID da Entidade:</span>
                              <p className="text-gray-600">{log.entity_id || '-'}</p>
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium">User Agent:</span>
                            <p className="text-gray-600 text-xs break-all">{log.user_agent || '-'}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium">Detalhes:</span>
                            <pre className="text-gray-600 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                              {log.details}
                            </pre>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* Paginação */}
                {pagination.totalPages > 1 && (
                  <div className="border-t bg-gray-50 px-6 py-3 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} registros
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-1">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}