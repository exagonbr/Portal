'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useCallback } from 'react'
import { apiClient, ApiClientError } from '@/services/apiClient'
import { PaginatedResponseDto } from '@/types/api' // Assuming logs might be paginated

interface AuditLog {
  id: number | string;
  timestamp: string; // Or Date, if conversion is handled
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  severity: 'info' | 'warning' | 'error' | string; // Allow string for flexibility from API
}

// MOCK_AUDIT_LOGS will be replaced by API data
// const MOCK_AUDIT_LOGS = [ ... ]

export default function AdminAuditPage() {
  const { user } = useAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  // Add pagination state if needed, e.g., currentPage, totalPages

  const fetchAuditLogs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params: Record<string, string> = {}
      if (selectedAction !== 'all') {
        params.action = selectedAction
      }
      if (selectedSeverity !== 'all') {
        params.severity = selectedSeverity
      }
      // Add pagination params if implementing: params.page = currentPage; params.limit = logsPerPage;

      // TODO: Adjust API endpoint as necessary
      const response = await apiClient.get<PaginatedResponseDto<AuditLog>>('/api/admin/audit-logs', params)
      
      if (response.success && response.data) {
        setAuditLogs(response.data.items || [])
        // Set pagination state if applicable: setTotalPages(response.data.pagination.totalPages);
      } else {
        setError(response.message || 'Falha ao buscar logs de auditoria.')
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message)
      } else {
        setError('Ocorreu um erro desconhecido ao buscar logs.')
      }
      console.error("Erro ao buscar logs de auditoria:", err)
    } finally {
      setLoading(false)
    }
  }, [selectedAction, selectedSeverity /*, currentPage */]) // Add currentPage if paginating

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])
  
  // The filtering logic is now handled by the backend via query parameters.
  // If client-side filtering is still desired on top of backend filtering (e.g. for quick text search not sent to backend):
  // const filteredLogs = auditLogs.filter(log => { ... });
  // For now, we assume backend handles all filtering based on selectedAction and selectedSeverity.
  const filteredLogs = auditLogs;


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Carregando logs de auditoria...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Auditoria</h1>
           <p className="text-xl text-red-500">Erro: {error}</p>
            <button
              onClick={fetchAuditLogs}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-200"
            >
              Tentar Novamente
            </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Auditoria</h1>
        <p className="text-gray-600">Logs de auditoria e atividades do sistema</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <select 
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">Todas as Ações</option>
          <option value="LOGIN">Login</option>
          <option value="UPDATE">Atualizações</option>
          <option value="CREATE">Criações</option>
          <option value="DELETE">Exclusões</option>
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
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-primary">Timestamp</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Usuário</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Ação</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Recurso</th>
              <th className="text-left py-3 px-6 font-medium text-primary">Detalhes</th>
              <th className="text-left py-3 px-6 font-medium text-primary">IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-600">{log.timestamp}</td>
                <td className="py-4 px-6 text-sm font-medium text-primary-dark">{log.user}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.severity === 'error' ? 'bg-error/20 text-error' :
                    log.severity === 'warning' ? 'bg-accent-yellow/20 text-accent-yellow' :
                    'bg-primary/20 text-primary'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{log.resource}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{log.details}</td>
                <td className="py-4 px-6 text-sm text-gray-600">{log.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}