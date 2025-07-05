'use client'

import { useState } from 'react'
import ApiDebug from '@/components/debug/ApiDebug'
import AuthSync from '@/components/auth/AuthSync'
import { AuthSyncResult } from '@/utils/auth-sync'

export default function DebugApisPage() {
  const [authResult, setAuthResult] = useState<AuthSyncResult | null>(null)

  const handleAuthSync = (result: AuthSyncResult) => {
    setAuthResult(result)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug de APIs e Autenticação</h1>
          <p className="text-gray-600">
            Página para testar e debugar problemas de autenticação e APIs com o backend de produção.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status da Autenticação */}
          <div className="lg:col-span-1">
            <AuthSync 
              onAuthSync={handleAuthSync}
              autoSync={false}
              showStatus={true}
            />
            
            {authResult && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Último Resultado</h3>
                <div className={`text-sm ${authResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {authResult.message}
                </div>
                {authResult.token && (
                  <div className="text-xs text-gray-500 mt-1">
                    Token: {authResult.token.substring(0, 20)}...
                  </div>
                )}
              </div>
            )}

            {/* Informações do Ambiente */}
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Configuração</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Frontend: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</div>
                <div>Backend: {process.env.NEXT_PUBLIC_API_URL || 'https://portal.sabercon.com.br/api'}</div>
                <div>SW: {typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? 'Suportado' : 'Não suportado'}</div>
              </div>
            </div>
          </div>

          {/* Debug Principal */}
          <div className="lg:col-span-2">
            <ApiDebug />
          </div>
        </div>

        {/* Informações Técnicas */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Problemas Corrigidos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-green-600 mb-2">✅ Service Worker</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Corrigido retorno de undefined</li>
                <li>• Adicionados fallbacks válidos</li>
                <li>• Melhor tratamento de erros</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">✅ URLs de API</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Corrigidas URLs malformadas</li>
                <li>• Prevenção de barras duplas</li>
                <li>• Construção consistente de URLs</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">✅ Autenticação</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sincronização automática</li>
                <li>• Múltiplas credenciais de fallback</li>
                <li>• Validação robusta de tokens</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-green-600 mb-2">✅ CORS</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Headers CORS configurados</li>
                <li>• Suporte a credenciais</li>
                <li>• Compatibilidade cross-origin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
