'use client'

import { useEffect, useState } from 'react'
import { syncAuthentication, clearAuthentication, AuthSyncResult } from '@/utils/auth-sync'

interface AuthSyncProps {
  onAuthSync?: (result: AuthSyncResult) => void
  autoSync?: boolean
  showStatus?: boolean
}

export default function AuthSync({ onAuthSync, autoSync = true, showStatus = false }: AuthSyncProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')

  const handleSync = async () => {
    setSyncStatus('syncing')
    setMessage('Sincronizando autenticação...')
    
    try {
      const result = await syncAuthentication()
      
      if (result.success) {
        setSyncStatus('success')
        setMessage(result.message || 'Autenticação sincronizada com sucesso')
      } else {
        setSyncStatus('error')
        setMessage(result.message || 'Falha na sincronização')
      }
      
      onAuthSync?.(result)
    } catch (error) {
      setSyncStatus('error')
      setMessage('Erro inesperado na sincronização')
      onAuthSync?.({ success: false, message: 'Erro inesperado' })
    }
  }

  const handleClear = () => {
    clearAuthentication()
    setSyncStatus('idle')
    setMessage('Autenticação limpa')
  }

  useEffect(() => {
    if (autoSync) {
      handleSync()
    }
  }, [autoSync])

  if (!showStatus) {
    return null
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Status da Autenticação</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar'}
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Limpar
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          syncStatus === 'idle' ? 'bg-gray-400' :
          syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
          syncStatus === 'success' ? 'bg-green-400' :
          'bg-red-400'
        }`} />
        <span className="text-xs text-gray-600">{message}</span>
      </div>
    </div>
  )
}
