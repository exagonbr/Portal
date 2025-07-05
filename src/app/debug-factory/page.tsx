'use client'

import React, { useState, useEffect } from 'react'
import { useFactoryDiagnostic } from '@/utils/factory-diagnostic'

export default function DebugFactoryPage() {
  const [authStatus, setAuthStatus] = useState<string>('Carregando...')
  const [themeStatus, setThemeStatus] = useState<string>('Carregando...')
  const [testResults, setTestResults] = useState<string[]>([])
  
  const { diagnostics, lastDiagnostic, isHealthy, generateReport } = useFactoryDiagnostic()

  useEffect(() => {
    testAuthContext()
    testThemeContext()
  }, [])

  const testAuthContext = async () => {
    try {
      const { useAuth } = await import('@/contexts/AuthContext')
      setAuthStatus('✅ AuthContext carregado com sucesso')
      addTestResult('AuthContext: OK')
    } catch (error) {
      setAuthStatus(`❌ Erro ao carregar AuthContext: ${error}`)
      addTestResult(`AuthContext: ERRO - ${error}`)
    }
  }

  const testThemeContext = async () => {
    try {
      const { useTheme } = await import('@/contexts/ThemeContext')
      setThemeStatus('✅ ThemeContext carregado com sucesso')
      addTestResult('ThemeContext: OK')
    } catch (error) {
      setThemeStatus(`❌ Erro ao carregar ThemeContext: ${error}`)
      addTestResult(`ThemeContext: ERRO - ${error}`)
    }
  }

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testFactoryError = () => {
    try {
      // Simular um erro de factory
      const fakeError = new Error("Cannot read properties of undefined (reading 'call')")
      throw fakeError
    } catch (error) {
      addTestResult(`Erro de factory simulado capturado: ${error}`)
    }
  }

  const clearDiagnostics = () => {
    const diagnostic = require('@/utils/factory-diagnostic').FactoryDiagnostic.getInstance()
    diagnostic.clearDiagnostics()
    addTestResult('Diagnósticos limpos')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Factory & Auth</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Status do Sistema */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Status do Sistema</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded">
                <strong>Factory Health:</strong> {isHealthy ? '✅ Saudável' : '❌ Problemas detectados'}
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <strong>Auth Context:</strong> {authStatus}
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <strong>Theme Context:</strong> {themeStatus}
              </div>
            </div>
          </div>

          {/* Diagnósticos */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Diagnósticos de Factory</h2>
            <div className="space-y-2">
              <p><strong>Total de erros:</strong> {diagnostics.length}</p>
              {lastDiagnostic && (
                <div className="p-3 bg-red-50 rounded border border-red-200">
                  <p className="text-sm text-red-800">
                    <strong>Último erro:</strong> {lastDiagnostic.error}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {lastDiagnostic.timestamp}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Testes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Testes</h2>
            <div className="space-y-3">
              <button
                onClick={testFactoryError}
                className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Simular Erro de Factory
              </button>
              <button
                onClick={clearDiagnostics}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Limpar Diagnósticos
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Recarregar Página
              </button>
            </div>
          </div>

          {/* Log de Testes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Log de Testes</h2>
            <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm text-gray-700 mb-1">
                  {result}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Relatório Completo */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Relatório de Diagnóstico</h2>
          <details className="cursor-pointer">
            <summary className="text-blue-600 hover:text-blue-800">
              Ver relatório completo (JSON)
            </summary>
            <pre className="mt-4 bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
              {generateReport()}
            </pre>
          </details>
        </div>

        {/* Informações do Sistema */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Agent:</strong>
              <p className="text-gray-600 break-all">{navigator.userAgent}</p>
            </div>
            <div>
              <strong>URL:</strong>
              <p className="text-gray-600 break-all">{window.location.href}</p>
            </div>
            <div>
              <strong>Timestamp:</strong>
              <p className="text-gray-600">{new Date().toISOString()}</p>
            </div>
            <div>
              <strong>Webpack:</strong>
              <p className="text-gray-600">
                {typeof (window as any).__webpack_require__ !== 'undefined' ? 'Disponível' : 'Não disponível'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 