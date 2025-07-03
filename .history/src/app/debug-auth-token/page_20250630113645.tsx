'use client';

import { useState, useEffect } from 'react';
import { debugTokenIssue } from '@/scripts/debug-token-issue';
import { getCurrentToken, validateToken, isAuthenticated } from '@/utils/token-validator';

export default function DebugAuthTokenPage() {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    // Carregar informações básicas do token
    const currentToken = getCurrentToken();
    const validation = currentToken ? validateToken(currentToken) : null;
    const authStatus = isAuthenticated();

    setTokenInfo({
      hasToken: !!currentToken,
      tokenLength: currentToken ? currentToken.length : 0,
      tokenPreview: currentToken ? currentToken.substring(0, 30) + '...' : 'N/A',
      validation,
      authStatus
    });
  }, []);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result = await debugTokenIssue();
      setDebugResult(result);
    } catch (error) {
      setDebugResult({
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    if (typeof window !== 'undefined') {
      // Limpar localStorage
      const keys = ['auth_token', 'token', 'authToken', 'user', 'userData'];
      keys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Limpar cookies
      const cookiesToClear = ['auth_token', 'token', 'authToken', 'user_data'];
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      });

      alert('Tokens limpos! Recarregue a página.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 Debug de Token de Autenticação
        </h1>

        <div className="grid gap-6">
          {/* Informações Básicas do Token */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Informações do Token</h2>
            {tokenInfo ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Token presente:</span>
                  <span className={tokenInfo.hasToken ? 'text-green-600' : 'text-red-600'}>
                    {tokenInfo.hasToken ? '✅ Sim' : '❌ Não'}
                  </span>
                </div>
                {tokenInfo.hasToken && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tamanho:</span>
                      <span>{tokenInfo.tokenLength} caracteres</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Preview:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {tokenInfo.tokenPreview}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Válido:</span>
                      <span className={tokenInfo.validation?.isValid ? 'text-green-600' : 'text-red-600'}>
                        {tokenInfo.validation?.isValid ? '✅ Sim' : '❌ Não'}
                      </span>
                    </div>
                    {tokenInfo.validation?.error && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Erro:</span>
                        <span className="text-red-600">{tokenInfo.validation.error}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Autenticado:</span>
                      <span className={tokenInfo.authStatus?.authenticated ? 'text-green-600' : 'text-red-600'}>
                        {tokenInfo.authStatus?.authenticated ? '✅ Sim' : '❌ Não'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div>Carregando...</div>
            )}
          </div>

          {/* Ações de Debug */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🛠️ Ações de Debug</h2>
            <div className="flex gap-4">
              <button
                onClick={runDiagnostic}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Executando...' : '🧪 Executar Diagnóstico Completo'}
              </button>
              <button
                onClick={clearTokens}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                🗑️ Limpar Todos os Tokens
              </button>
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                🔐 Ir para Login
              </button>
            </div>
          </div>

          {/* Resultado do Diagnóstico */}
          {debugResult && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">📊 Resultado do Diagnóstico</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(debugResult, null, 2)}
              </pre>
              
              {/* Interpretação do Resultado */}
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Interpretação:</h3>
                <div className="text-blue-800">
                  {!debugResult.hasToken && (
                    <p>❌ Nenhum token encontrado. Você precisa fazer login.</p>
                  )}
                  {debugResult.hasToken && !debugResult.tokenValid && (
                    <p>⚠️ Token presente mas inválido. Pode estar expirado ou corrompido.</p>
                  )}
                  {debugResult.hasToken && debugResult.tokenValid && debugResult.backendResponse?.status === 401 && (
                    <p>🔒 Token válido localmente mas rejeitado pelo backend. Possível problema de sincronização.</p>
                  )}
                  {debugResult.hasToken && debugResult.tokenValid && debugResult.backendResponse?.success && (
                    <p>✅ Token funcionando corretamente!</p>
                  )}
                  {debugResult.networkError && (
                    <p>🌐 Erro de rede: {debugResult.networkError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Informações de Storage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">💾 Storage Debug</h2>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  console.log('🔍 [STORAGE-DEBUG] localStorage:');
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                      const value = localStorage.getItem(key);
                      console.log(`  ${key}:`, value ? `${value.length} chars` : 'null');
                    }
                  }
                  
                  console.log('🔍 [STORAGE-DEBUG] sessionStorage:');
                  for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key) {
                      const value = sessionStorage.getItem(key);
                      console.log(`  ${key}:`, value ? `${value.length} chars` : 'null');
                    }
                  }
                  
                  console.log('🔍 [STORAGE-DEBUG] cookies:', document.cookie);
                  alert('Informações de storage logadas no console!');
                }
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              📋 Logar Storage no Console
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 