'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2024-03-20 14:30:15',
    user: 'admin@escola.com',
    action: 'USER_LOGIN',
    resource: 'Sistema',
    details: 'Login realizado com sucesso',
    ip: '192.168.1.100',
    severity: 'info'
  },
  {
    id: 2,
    timestamp: '2024-03-20 14:25:30',
    user: 'coord@escola.com',
    action: 'STUDENT_GRADE_UPDATE',
    resource: 'Notas - Ana Silva',
    details: 'Nota de matemática alterada de 8.0 para 8.5',
    ip: '192.168.1.50',
    severity: 'warning'
  },
  {
    id: 3,
    timestamp: '2024-03-20 14:20:45',
    user: 'teacher@escola.com',
    action: 'ASSIGNMENT_CREATE',
    resource: 'Atividades',
    details: 'Nova atividade criada: Trabalho de História',
    ip: '192.168.1.75',
    severity: 'info'
  }
]

export default function AdminAuditPage() {
  const { user } = useAuth()
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')

  const filteredLogs = MOCK_AUDIT_LOGS.filter(log => {
    const matchesAction = selectedAction === 'all' || log.action.includes(selectedAction)
    const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity
    return matchesAction && matchesSeverity
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Auditoria</h1>
        <p className="text-gray-600">Logs de auditoria e atividades do sistema</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <select 
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as Severidades</option>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Timestamp</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Usuário</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Ação</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Recurso</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">Detalhes</th>
              <th className="text-left py-3 px-6 font-medium text-gray-700">IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-6 text-sm text-gray-600">{log.timestamp}</td>
                <td className="py-4 px-6 text-sm font-medium text-gray-800">{log.user}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.severity === 'error' ? 'bg-red-100 text-red-800' :
                    log.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
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