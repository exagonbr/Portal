'use client'

import { useState } from 'react'
import { syncAuthentication, validateCurrentToken, clearAuthentication } from '@/utils/auth-sync'
import { apiClient } from '@/lib/api-client'

export default function ApiDebug() {
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test: string, status: 'success' | 'error' | 'warning', message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data, timestamp: new Date() }])
  }

  const clearResults = () => {
    setResults([])
  }

  const testAuthentication = async () => {
    setIsLoading(true)
    addResult('Auth Test', 'warning', 'Iniciando teste de autenticação...')

    try {
      // 1. Validar token atual
      const validation = await validateCurrentToken()
      addResult('Token Validation', validation.success ? 'success' : 'error', validation.message || 'Sem mensagem')

      // 2. Se inválido, sincronizar
      if (!validation.success) {
        addResult('Auth Sync', 'warning', 'Token inválido, tentando sincronizar...')
        const sync = await syncAuthentication()
        addResult('Auth Sync', sync.success ? 'success' : 'error', sync.message || 'Sem mensagem')
      }

      // 3. Testar endpoints
      const endpoints = [
        '/users/stats',
        '/dashboard/analytics', 
        '/dashboard/system',
        '/dashboard/health',
        '/dashboard/metrics/realtime'
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint)
          addResult(`API ${endpoint}`, response.success ? 'success' : 'error', 
            response.message || `Status: ${response.success}`)
        } catch (error: any) {
          addResult(`API ${endpoint}`, 'error', error.message || 'Erro desconhecido')
        }
      }

    } catch (error: any) {
      addResult('Auth Test', 'error', error.message || 'Erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const testServiceWorker = async () => {
    addResult('SW Test', 'warning', 'Testando Service Worker...')

    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        const isActive = registrations.length > 0 && registrations.some(reg => reg.active)
        
        addResult('SW Status', isActive ? 'success' : 'warning', 
          isActive ? 'Service Worker ativo' : 'Service Worker inativo')

        // Testar requisição através do SW
        try {
          const response = await fetch('/api/dashboard/analytics', {
            cache: 'no-cache',
            headers: { 'Accept': 'application/json' }
          })
          
          addResult('SW Request', response.ok ? 'success' : 'error', 
            `Status: ${response.status} ${response.statusText}`)
        } catch (error: any) {
          addResult('SW Request', 'error', error.message)
        }

      } catch (error: any) {
        addResult('SW Test', 'error', error.message)
      }
    } else {
      addResult('SW Test', 'error', 'Service Worker não suportado')
    }
  }

  const testUrlConstruction = () => {
    addResult('URL Test', 'warning', 'Testando construção de URLs...')

    const testCases = [
      { input: '/dashboard/analytics', expected: 'https://portal.sabercon.com.br/api/dashboard/analytics' },
      { input: 'dashboard/analytics', expected: 'https://portal.sabercon.com.br/api/dashboard/analytics' },
      { input: '/users/stats', expected: 'https://portal.sabercon.com.br/api/users/stats' }
    ]

    testCases.forEach(({ input, expected }) => {
      // Simular construção de URL do apiClient
      const baseURL = 'https://portal.sabercon.com.br/api'
      const cleanEndpoint = input.startsWith('/') ? input : `/${input}`
      const cleanBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
      const result = `${cleanBaseURL}${cleanEndpoint}`

      const isCorrect = result === expected
      addResult(`URL ${input}`, isCorrect ? 'success' : 'error', 
        `${result} ${isCorrect ? '✓' : `≠ ${expected}`}`)
    })
  }

  const handleClearAuth = () => {
    clearAuthentication()
    addResult('Clear Auth', 'success', 'Autenticação limpa')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Debug de APIs e Autenticação</h2>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={testAuthentication}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Testando...' : 'Testar Autenticação'}
        </button>
        
        <button
          onClick={testServiceWorker}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Testar Service Worker
        </button>
        
        <button
          onClick={testUrlConstruction}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Testar URLs
        </button>
        
        <button
          onClick={handleClearAuth}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Limpar Auth
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Limpar Resultados
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 rounded border-l-4 ${
              result.status === 'success' ? 'bg-green-50 border-green-400' :
              result.status === 'error' ? 'bg-red-50 border-red-400' :
              'bg-yellow-50 border-yellow-400'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-sm text-gray-800">{result.test}</div>
                <div className="text-sm text-gray-600">{result.message}</div>
                {result.data && (
                  <pre className="text-xs text-gray-500 mt-1 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                )}
              </div>
              <div className="text-xs text-gray-400">
                {result.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {results.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Nenhum teste executado ainda. Clique em um dos botões acima para começar.
          </div>
        )}
      </div>
    </div>
  )
}
