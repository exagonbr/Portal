'use client'

import { useState } from 'react'
import { ActiveSession } from '@/types/analytics'

interface ActiveSessionsTableProps {
  sessions: ActiveSession[]
  onTerminateSession?: (sessionId: string) => void
}

export default function ActiveSessionsTable({ sessions, onTerminateSession }: ActiveSessionsTableProps) {
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])

  const getStatusColor = (status: ActiveSession['status']) => {
    switch (status) {
      case 'active':
        return 'bg-accent-green/20 text-accent-green'
      case 'idle':
        return 'bg-accent-yellow/20 text-accent-yellow'
      case 'away':
        return 'bg-gray-200 text-gray-600'
      default:
        return 'bg-gray-200 text-gray-600'
    }
  }

  const getStatusText = (status: ActiveSession['status']) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'idle':
        return 'Inativo'
      case 'away':
        return 'Ausente'
      default:
        return status
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  const toggleSelection = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedSessions.length === sessions.length) {
      setSelectedSessions([])
    } else {
      setSelectedSessions(sessions.map(s => s.id))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedSessions.length === sessions.length && sessions.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              IP
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localização
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Dispositivo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Duração
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sessions.map((session) => (
            <tr key={session.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedSessions.includes(session.id)}
                  onChange={() => toggleSelection(session.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-semibold">
                    {session.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{session.userName}</div>
                    <div className="text-sm text-gray-500">{session.userRole}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {session.ip}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {session.location}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {session.browser} / {session.device}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDuration(session.duration)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(session.status)}`}>
                  {getStatusText(session.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  onClick={() => onTerminateSession?.(session.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Encerrar sessão"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sessions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nenhuma sessão ativa no momento
        </div>
      )}

      {selectedSessions.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-700">
            {selectedSessions.length} sessão(ões) selecionada(s)
          </span>
          <button
            onClick={() => {
              selectedSessions.forEach(id => onTerminateSession?.(id))
              setSelectedSessions([])
            }}
            className="text-sm text-red-600 hover:text-red-900"
          >
            Encerrar sessões selecionadas
          </button>
        </div>
      )}
    </div>
  )
} 