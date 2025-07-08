'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'
import { Button } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import { format } from 'date-fns'
import { pt } from 'date-fns/locale'

interface UserActivity {
  id: string | number
  user_id: string
  user_name?: string
  user_email?: string
  activity_type: string
  entity_type?: string
  entity_id?: string
  action: string
  details?: Record<string, any>
  ip_address?: string
  ip?: string
  user_agent?: string
  device_info?: string
  browser?: string
  operating_system?: string
  location?: string
  duration_seconds?: number
  start_time?: string
  end_time?: string
  session_id?: string
  created_at: string
  updated_at: string
  timestamp?: string
  severity?: string
  user?: string
}

interface LogStats {
  totalActivities: number
  uniqueUsers: number
  uniqueSessions: number
  errorCount: number
  warningCount: number
  logSize: string
}

interface ApiResponse {
  logs: UserActivity[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminLogsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<UserActivity[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [limit, setLimit] = useState(10)
  const [activityType, setActivityType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [selectedLog, setSelectedLog] = useState<UserActivity | null>(null)
  const [sortOrder, setSortOrder] = useState('desc')
  const [showModal, setShowModal] = useState(false)
  const [severity, setSeverity] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [page, limit, activityType, startDate, endDate, sortOrder, severity])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      // Construir parâmetros de consulta
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        activity_type: activityType,
        severity: severity
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      if (startDate) {
        params.append('start_date', startDate)
      }

      if (endDate) {
        params.append('end_date', endDate)
      }

      // Buscar logs
      const response = await fetch(`/api/admin/audit?${params.toString()}`, {
        credentials: 'include' // Importante para enviar cookies de autenticação
      })
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar logs: ${response.status} ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      setLogs(data.logs || [])
      setTotalItems(data.pagination?.total || 0)
      setTotalPages(data.pagination?.totalPages || 1)

      // Buscar estatísticas
      await fetchStats()
    } catch (error) {
      console.error('Erro ao buscar logs:', error)
      alert('Erro ao carregar logs do sistema')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Como não existe um endpoint específico para estatísticas, vamos usar o endpoint POST
      const response = await fetch('/api/admin/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate,
          endDate
        }),
        credentials: 'include' // Importante para enviar cookies de autenticação
      })

      if (response.ok) {
        const data = await response.json()
        // Adaptar os dados para o formato esperado
        setStats({
          totalActivities: data.totalActivities || 0,
          uniqueUsers: data.uniqueUsers || 0,
          uniqueSessions: data.uniqueSessions || 0,
          errorCount: data.errorCount || 0,
          warningCount: data.warningCount || 0,
          logSize: data.logSize || '0 KB'
        })
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLogs()
  }

  const handleExportLogs = async () => {
    try {
      // Construir parâmetros para exportação
      const params = new URLSearchParams({
        activity_type: activityType,
        severity: severity,
        format: 'csv'
      })

      if (startDate) {
        params.append('start_date', startDate)
      }

      if (endDate) {
        params.append('end_date', endDate)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      // Iniciar download
      window.location.href = `/api/admin/audit/export?${params.toString()}`
      alert('Exportação de logs iniciada')
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      alert('Erro ao exportar logs')
    }
  }

  const handleCleanupLogs = async () => {
    if (confirm('Tem certeza que deseja limpar logs antigos? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch('/api/admin/audit/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ daysToKeep: 90 }),
          credentials: 'include' // Importante para enviar cookies de autenticação
        })

        if (!response.ok) {
          throw new Error('Falha ao limpar logs')
        }

        const data = await response.json()
        alert(`${data.deletedCount} logs antigos foram removidos`)
        fetchLogs()
      } catch (error) {
        console.error('Erro ao limpar logs:', error)
        alert('Erro ao limpar logs antigos')
      }
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'error': return 'Erro'
      case 'warning': return 'Alerta'
      case 'info': return 'Informação'
      default: return severity
    }
  }

  const getActivityTypeBadge = (type: string) => {
    if (type.includes('login') || type === 'login' || type === 'logout') {
      return 'Autenticação'
    } else if (type.includes('video')) {
      return 'Vídeo'
    } else if (type.includes('system')) {
      return 'Sistema'
    } else if (type.includes('data') || type.includes('create') || type.includes('update') || type.includes('delete')) {
      return 'Dados'
    } else if (type.includes('error')) {
      return 'Erro'
    } else if (type.includes('quiz')) {
      return 'Quiz'
    } else {
      return type
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss', { locale: pt })
    } catch (e) {
      return dateString
    }
  }

  const headerActions = (
    <div className="flex space-x-2">
      <Button variant="outline" onClick={handleExportLogs}>
        Exportar
      </Button>
      <Button variant="destructive" onClick={handleCleanupLogs}>
        Limpar Logs
      </Button>
    </div>
  )

  const columns = [
    {
      key: 'timestamp',
      title: 'Data/Hora',
      render: (value: string) => formatDate(value || '')
    },
    {
      key: 'user',
      title: 'Usuário',
      render: (value: string, record: UserActivity) => value || record.user_name || record.user_email || record.user_id || 'Anônimo'
    },
    {
      key: 'severity',
      title: 'Nível',
      render: (value: string) => getSeverityLabel(value || 'info')
    },
    {
      key: 'action',
      title: 'Ação',
      dataIndex: 'action'
    },
    {
      key: 'ip',
      title: 'IP',
      dataIndex: 'ip'
    },
    {
      key: 'details',
      title: 'Detalhes',
      render: (_: any, record: UserActivity) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setSelectedLog(record)
            setShowModal(true)
          }}
        >
          Detalhes
        </Button>
      )
    }
  ]

  return (
    <ProtectedRoute requiredRole={[UserRole.SYSTEM_ADMIN, UserRole.INSTITUTION_MANAGER]}>
      <DashboardPageLayout
        title="Logs do Sistema"
        subtitle="Visualize e analise os logs de atividade dos usuários no sistema"
        actions={headerActions}
      >
        <div className="space-y-6">
          {/* Filtros */}
          <Card>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
              <Select
                placeholder="Tipo de Atividade"
                options={[
                  { value: 'all', label: 'Todos os Tipos' },
                  { value: 'LOGIN', label: 'Autenticação' },
                  { value: 'VIDEO', label: 'Vídeos' },
                  { value: 'QUIZ', label: 'Quiz' },
                  { value: 'SYSTEM', label: 'Sistema' },
                  { value: 'ASSIGNMENT', label: 'Tarefas' }
                ]}
                value={activityType}
                onChange={(value) => setActivityType(value as string)}
              />

              <Select
                placeholder="Nível"
                options={[
                  { value: 'all', label: 'Todos os Níveis' },
                  { value: 'info', label: 'Informação' },
                  { value: 'warning', label: 'Alerta' },
                  { value: 'error', label: 'Erro' }
                ]}
                value={severity}
                onChange={(value) => setSeverity(value as string)}
              />

              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Data inicial"
              />

              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Data final"
              />

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Pesquisar logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit">Filtrar</Button>
              </div>
            </form>
          </Card>

          {/* Resumo dos logs */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <div className="text-sm font-medium text-gray-500 mb-1 p-4">Total de Logs</div>
                <div className="text-2xl font-bold px-4 pb-4">{stats.totalActivities.toLocaleString()}</div>
              </Card>
              
              <Card>
                <div className="text-sm font-medium text-gray-500 mb-1 p-4">Usuários Únicos</div>
                <div className="text-2xl font-bold px-4 pb-4">{stats.uniqueUsers}</div>
              </Card>
              
              <Card>
                <div className="text-sm font-medium text-gray-500 mb-1 p-4">Sessões Únicas</div>
                <div className="text-2xl font-bold px-4 pb-4">{stats.uniqueSessions}</div>
              </Card>
              
              <Card>
                <div className="text-sm font-medium text-gray-500 mb-1 p-4">Erros</div>
                <div className="text-2xl font-bold text-red-600 px-4 pb-4">{stats.errorCount}</div>
              </Card>
              
              <Card>
                <div className="text-sm font-medium text-gray-500 mb-1 p-4">Alertas</div>
                <div className="text-2xl font-bold text-amber-600 px-4 pb-4">{stats.warningCount}</div>
              </Card>
              
              <Card>
                <div className="text-sm font-medium text-gray-500 mb-1 p-4">Tamanho dos Logs</div>
                <div className="text-2xl font-bold px-4 pb-4">{stats.logSize}</div>
              </Card>
            </div>
          )}

          {/* Tabela de logs */}
          <Table
            columns={columns}
            data={logs}
            loading={loading}
            pagination={{
              current: page,
              pageSize: limit,
              total: totalItems,
              onChange: (newPage) => setPage(newPage)
            }}
            emptyText="Nenhum log encontrado"
            hoverable
            striped
          />

          {/* Modal de detalhes do log */}
          {showModal && selectedLog && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-700 mb-4">Detalhes do Log</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">ID</p>
                      <p>{selectedLog.id}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Data/Hora</p>
                      <p>{formatDate(selectedLog.timestamp || selectedLog.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Usuário</p>
                      <p>{selectedLog.user || selectedLog.user_name || selectedLog.user_email || selectedLog.user_id || 'Anônimo'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">IP</p>
                      <p>{selectedLog.ip || selectedLog.ip_address || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Tipo</p>
                      <p>{selectedLog.activity_type || selectedLog.action}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nível</p>
                      <p>{getSeverityLabel(selectedLog.severity || 'info')}</p>
                    </div>
                    {(selectedLog.browser || selectedLog.operating_system) && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Navegador/SO</p>
                        <p>{[selectedLog.browser, selectedLog.operating_system].filter(Boolean).join(' / ')}</p>
                      </div>
                    )}
                    {selectedLog.session_id && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">ID da Sessão</p>
                        <p>{selectedLog.session_id}</p>
                      </div>
                    )}
                  </div>
                  
                  {(selectedLog.details && typeof selectedLog.details === 'object') && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-2">Detalhes</p>
                      <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-xs">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => setShowModal(false)}>
                      Fechar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  )
}

