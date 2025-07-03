'use client';

import React, { useState, useEffect } from 'react';
import { isAuthenticated, getCurrentToken, validateToken, syncTokenWithApiClient, clearAllTokens } from '@/utils/token-validator';
import { systemAdminService } from '@/services/systemAdminService';

interface TokenDebugInfo {
  hasToken: boolean;
  tokenValid: boolean;
  needsRefresh: boolean;
  tokenPreview?: string;
  payload?: any;
  error?: string;
  apiTest?: {
    success: boolean;
    error?: string;
  };
}

export default function TokenDebugger() {
  const [debugInfo, setDebugInfo] = useState<TokenDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    
    try {
      console.log('🔍 [TOKEN-DEBUGGER] Iniciando diagnóstico...');
      
      // Verificar autenticação
      const authStatus = isAuthenticated();
      const token = getCurrentToken();
      
      let tokenInfo: TokenDebugInfo = {
        hasToken: !!token,
        tokenValid: authStatus.authenticated,
        needsRefresh: authStatus.needsRefresh,
        error: authStatus.error
      };

      if (token) {
        tokenInfo.tokenPreview = token.substring(0, 30) + '...';
        
        // Validar token específico
        const validation = validateToken(token);
        tokenInfo.payload = validation.payload;
        
        // Testar API
        try {
          const authCheck = await systemAdminService.checkAuthenticationStatus();
          tokenInfo.apiTest = {
            success: authCheck.tokenValid,
            error: authCheck.error
          };
        } catch (apiError) {
          tokenInfo.apiTest = {
            success: false,
            error: apiError instanceof Error ? apiError.message : 'Erro desconhecido na API'
          };
        }
      }

      setDebugInfo(tokenInfo);
      console.log('🔍 [TOKEN-DEBUGGER] Diagnóstico completo:', tokenInfo);
    } catch (error) {
      console.error('❌ [TOKEN-DEBUGGER] Erro no diagnóstico:', error);
      setDebugInfo({
        hasToken: false,
        tokenValid: false,
        needsRefresh: true,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncToken = async () => {
    setLoading(true);
    try {
      const success = await syncTokenWithApiClient();
      console.log('🔄 [TOKEN-DEBUGGER] Sincronização:', success ? 'sucesso' : 'falha');
      await runDiagnostic();
    } catch (error) {
      console.error('❌ [TOKEN-DEBUGGER] Erro na sincronização:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearTokens = () => {
    clearAllTokens();
    console.log('🧹 [TOKEN-DEBUGGER] Tokens limpos');
    runDiagnostic();
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  if (!debugInfo) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔍 Token Debugger</h3>
        <p>Carregando diagnóstico...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg space-y-4">
      <h3 className="text-lg font-semibold mb-2">🔍 Token Debugger</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${debugInfo.hasToken ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>Token presente: {debugInfo.hasToken ? 'Sim' : 'Não'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${debugInfo.tokenValid ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span>Token válido: {debugInfo.tokenValid ? 'Sim' : 'Não'}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`w-3 h-3 rounded-full ${debugInfo.needsRefresh ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
          <span>Precisa refresh: {debugInfo.needsRefresh ? 'Sim' : 'Não'}</span>
        </div>
        
        {debugInfo.apiTest && (
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${debugInfo.apiTest.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span>Teste da API: {debugInfo.apiTest.success ? 'Sucesso' : 'Falha'}</span>
          </div>
        )}
      </div>

      {debugInfo.tokenPreview && (
        <div className="bg-gray-200 p-2 rounded text-sm">
          <strong>Token Preview:</strong><br />
          <code className="text-xs">{debugInfo.tokenPreview}</code>
        </div>
      )}

      {debugInfo.payload && (
        <div className="bg-gray-200 p-2 rounded text-sm">
          <strong>Payload:</strong><br />
          <pre className="text-xs overflow-x-auto">
            {JSON.stringify(debugInfo.payload, null, 2)}
          </pre>
        </div>
      )}

      {debugInfo.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          <strong>Erro:</strong> {debugInfo.error}
        </div>
      )}

      {debugInfo.apiTest?.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          <strong>Erro da API:</strong> {debugInfo.apiTest.error}
        </div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Reexecutar'}
        </button>
        
        <button
          onClick={syncToken}
          disabled={loading}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
        >
          Sincronizar Token
        </button>
        
        <button
          onClick={clearTokens}
          disabled={loading}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 disabled:opacity-50"
        >
          Limpar Tokens
        </button>
      </div>
    </div>
  );
} 