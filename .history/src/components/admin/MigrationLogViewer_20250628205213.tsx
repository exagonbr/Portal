'use client'

import { useState, useEffect, useRef } from 'react'

interface LogEntry {
  timestamp: string
  level: 'info' | 'success' | 'warning' | 'error'
  message: string
  table?: string
  progress?: number
  realTimeData?: {
    tableName: string
    currentRow: number
    totalRows: number
    percentage: number
  }
}

interface MigrationLogViewerProps {
  logs: LogEntry[]
  isActive: boolean
  onClear?: () => void
}

export default function MigrationLogViewer({ logs, isActive, onClear }: MigrationLogViewerProps) {
  const logContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // Auto-scroll para o final quando novos logs chegam
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'check_circle'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'info':
      default:
        return 'info'
    }
  }

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'info':
      default:
        return 'text-blue-600'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR')
  }

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400">terminal</span>
          <h3 className="text-white font-medium">Logs da Migração</h3>
          {isActive && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Ativo</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              autoScroll 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
          >
            Auto-scroll
          </button>
          
          {onClear && (
            <button
              onClick={onClear}
              className="px-3 py-1 bg-gray-600 text-gray-300 rounded text-sm hover:bg-gray-500 transition-colors"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Log Container */}
      <div 
        ref={logContainerRef}
        className="h-96 overflow-y-auto p-4 font-mono text-sm bg-gray-900"
        onScroll={(e) => {
          const target = e.target as HTMLDivElement
          const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight
          setAutoScroll(isAtBottom)
        }}
      >
        {logs.length === 0 ? (
          <div className="text-gray-500 italic text-center py-8">
            Nenhum log disponível. Os logs aparecerão aqui quando a migração iniciar.
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 py-1">
                {/* Timestamp */}
                <span className="text-gray-500 text-xs min-w-[80px] mt-0.5">
                  {formatTimestamp(log.timestamp)}
                </span>
                
                {/* Icon */}
                <span className={`material-symbols-outlined text-sm mt-0.5 ${getLogColor(log.level)}`}>
                  {getLogIcon(log.level)}
                </span>
                
                {/* Message */}
                <div className="flex-1">
                  <span className="text-gray-200">
                    {log.table && (
                      <span className="text-blue-400 font-medium">[{log.table}] </span>
                    )}
                    {log.message}
                  </span>
                  
                  {/* Progress bar for individual table */}
                  {log.progress !== undefined && (
                    <div className="mt-1 w-48">
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${log.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">{log.progress.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer com estatísticas */}
      {logs.length > 0 && (
        <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>{logs.length} entradas de log</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-green-600">check_circle</span>
                {logs.filter(l => l.level === 'success').length} sucessos
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-yellow-600">warning</span>
                {logs.filter(l => l.level === 'warning').length} avisos
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-red-600">error</span>
                {logs.filter(l => l.level === 'error').length} erros
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 