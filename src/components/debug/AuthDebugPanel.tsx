'use client';

import { useState, useEffect } from 'react';
import { AuthDebugHelper, type AuthDebugInfo } from '@/utils/auth-debug-helper';

interface AuthDebugPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AuthDebugPanel({ isOpen = false, onClose }: AuthDebugPanelProps) {
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refreshDebugInfo();
    }
  }, [isOpen]);

  const refreshDebugInfo = () => {
    const info = AuthDebugHelper.getAuthDebugInfo();
    setDebugInfo(info);
  };

  const runAuthTest = async () => {
    setIsLoading(true);
    try {
      const result = await AuthDebugHelper.testAuthenticatedRequest();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        status: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    AuthDebugHelper.clearAllAuthData();
    refreshDebugInfo();
    setTestResult(null);
  };

  const runFullDiagnostic = async () => {
    await AuthDebugHelper.runFullDiagnostic();
    refreshDebugInfo();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🔍 Debug de Autenticação</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Ações */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={refreshDebugInfo}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                🔄 Atualizar
              </button>
              <button
                onClick={runAuthTest}
                disabled={isLoading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? '⏳' : '🧪'} Testar Auth
              </button>
              <button
                onClick={clearAuthData}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                🧹 Limpar Dados
              </button>
              <button
                onClick={runFullDiagnostic}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                📊 Diagnóstico Completo
              </button>
            </div>

            {/* Informações do Token */}
            {debugInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">🔐 Informações do Token</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tem Token:</span>
                    <span className={`ml-2 ${debugInfo.hasToken ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.hasToken ? '✅ Sim' : '❌ Não'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Fonte:</span>
                    <span className="ml-2">{debugInfo.tokenSource || 'Nenhuma'}</span>
                  </div>
                  <div>
                    <span className="font-medium">Tamanho:</span>
                    <span className="ml-2">{debugInfo.tokenLength} caracteres</span>
                  </div>
                  <div>
                    <span className="font-medium">É JWT:</span>
                    <span className={`ml-2 ${debugInfo.isJWT ? 'text-green-600' : 'text-yellow-600'}`}>
                      {debugInfo.isJWT ? '✅ Sim' : '⚠️ Não'}
                    </span>
                  </div>
                  {debugInfo.tokenPreview && (
                    <div className="col-span-2">
                      <span className="font-medium">Preview:</span>
                      <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                        {debugInfo.tokenPreview}
                      </span>
                    </div>
                  )}
                </div>

                {/* JWT Payload */}
                {debugInfo.isJWT && debugInfo.jwtPayload && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <h4 className="font-medium mb-2">📋 JWT Payload</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Usuário:</span>
                        <span className="ml-2">{debugInfo.jwtPayload.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Role:</span>
                        <span className="ml-2">{debugInfo.jwtPayload.role || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Expiração:</span>
                        <span className="ml-2">
                          {debugInfo.jwtPayload.exp 
                            ? new Date(debugInfo.jwtPayload.exp * 1000).toLocaleString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Expirado:</span>
                        <span className={`ml-2 ${debugInfo.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                          {debugInfo.isExpired ? '❌ Sim' : '✅ Não'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Estado do Armazenamento */}
            {debugInfo && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">📦 Estado do Armazenamento</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">LocalStorage</h4>
                    {Object.entries(debugInfo.storageState.localStorage).map(([key, hasValue]) => (
                      <div key={key} className="text-sm">
                        <span className={hasValue ? 'text-green-600' : 'text-red-600'}>
                          {hasValue ? '✅' : '❌'}
                        </span>
                        <span className="ml-2">{key}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">SessionStorage</h4>
                    {Object.entries(debugInfo.storageState.sessionStorage).map(([key, hasValue]) => (
                      <div key={key} className="text-sm">
                        <span className={hasValue ? 'text-green-600' : 'text-red-600'}>
                          {hasValue ? '✅' : '❌'}
                        </span>
                        <span className="ml-2">{key}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Cookies</h4>
                    <div className="text-sm">
                      {debugInfo.storageState.cookies.length > 0 ? (
                        debugInfo.storageState.cookies.map(cookie => (
                          <div key={cookie}>{cookie}</div>
                        ))
                      ) : (
                        <span className="text-red-600">❌ Nenhum cookie</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Client */}
            {debugInfo?.apiClientState && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">🔧 API Client</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tem Token:</span>
                    <span className={`ml-2 ${debugInfo.apiClientState.hasToken ? 'text-green-600' : 'text-red-600'}`}>
                      {debugInfo.apiClientState.hasToken ? '✅ Sim' : '❌ Não'}
                    </span>
                  </div>
                  {debugInfo.apiClientState.tokenPreview && (
                    <div>
                      <span className="font-medium">Preview:</span>
                      <span className="ml-2 font-mono text-xs bg-gray-200 px-2 py-1 rounded">
                        {debugInfo.apiClientState.tokenPreview}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resultado do Teste */}
            {testResult && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">🧪 Resultado do Teste</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <span className={`ml-2 ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {testResult.status} - {testResult.success ? 'Sucesso' : 'Falha'}
                    </span>
                  </div>
                  {testResult.error && (
                    <div>
                      <span className="font-medium">Erro:</span>
                      <span className="ml-2 text-red-600">{testResult.error}</span>
                    </div>
                  )}
                  {testResult.response && (
                    <div>
                      <span className="font-medium">Resposta:</span>
                      <pre className="mt-2 p-2 bg-gray-200 rounded text-xs overflow-auto">
                        {JSON.stringify(testResult.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">💡 Instruções</h3>
              <div className="text-sm space-y-2">
                <p>• <strong>Atualizar:</strong> Recarrega as informações de debug</p>
                <p>• <strong>Testar Auth:</strong> Faz uma requisição para testar se o token funciona</p>
                <p>• <strong>Limpar Dados:</strong> Remove todos os dados de autenticação armazenados</p>
                <p>• <strong>Diagnóstico Completo:</strong> Executa análise completa no console</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar o debug panel
export function useAuthDebug() {
  const [isOpen, setIsOpen] = useState(false);

  const openDebug = () => setIsOpen(true);
  const closeDebug = () => setIsOpen(false);

  return {
    isOpen,
    openDebug,
    closeDebug,
    DebugPanel: () => <AuthDebugPanel isOpen={isOpen} onClose={closeDebug} />
  };
} 