'use client'

import React, { useState } from 'react'
import { userService } from '@/services/userService'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function TestConnection() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState<any>(null)

  const testConnection = async () => {
    setStatus('testing')
    setMessage('Testando conexão com o backend...')
    setDetails(null)

    try {
      // Tenta buscar apenas 1 usuário para testar a conexão
      const response = await userService.getUsers({ limit: 1 })
      
      setStatus('success')
      setMessage('Conexão estabelecida com sucesso!')
      setDetails({
        endpoint: '/api/users',
        totalUsers: response.pagination?.total || 0,
        responseStructure: {
          hasItems: !!response.items,
          itemsCount: response.items?.length || 0,
          hasPagination: !!response.pagination
        }
      })
    } catch (error: any) {
      setStatus('error')
      setMessage(error.message || 'Erro ao conectar com o backend')
      setDetails({
        error: error.toString(),
        possibleCauses: [
          'Backend não está rodando',
          'URL da API incorreta',
          'Problema de CORS',
          'Erro de autenticação'
        ]
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">Teste de Conexão com a API</h2>
        
        <div className="space-y-4">
          {/* Status da conexão */}
          <div className="flex items-center gap-3">
            {status === 'idle' && <AlertCircle className="h-6 w-6 text-gray-400" />}
            {status === 'testing' && <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            
            <span className={`text-lg font-medium ${
              status === 'idle' ? 'text-gray-600' :
              status === 'testing' ? 'text-blue-600' :
              status === 'success' ? 'text-green-600' :
              'text-red-600'
            }`}>
              {message || 'Clique no botão para testar a conexão'}
            </span>
          </div>

          {/* Detalhes */}
          {details && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-slate-700">Detalhes:</h3>
              <pre className="text-sm text-slate-600 overflow-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          {/* Informações da API */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800">Configuração Atual:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>URL da API:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api</p>
              <p><strong>Endpoint testado:</strong> /api/users</p>
              <p><strong>Método:</strong> GET</p>
            </div>
          </div>

          {/* Botão de teste */}
          <div className="mt-6">
            <Button
              onClick={testConnection}
              disabled={status === 'testing'}
              className="w-full"
            >
              {status === 'testing' ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Testar Conexão
                </>
              )}
            </Button>
          </div>

          {/* Instruções */}
          {status === 'error' && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold mb-2 text-red-800">Como resolver:</h3>
              <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
                <li>Verifique se o backend está rodando na porta 3001</li>
                <li>Confirme que o arquivo .env.local existe com NEXT_PUBLIC_API_URL configurado</li>
                <li>Verifique se o backend tem CORS habilitado para o frontend</li>
                <li>Confirme que você está autenticado (se necessário)</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}