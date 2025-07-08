'use client';

import { useState } from 'react';
import { AuthDebugHelper } from '@/utils/auth-debug-helper';

export function AuthDebugButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDiagnostic = async () => {
    setIsLoading(true);
    try {
      const result = await AuthDebugHelper.runFullDiagnostic();
      setDiagnosticResult(result);
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const repairAuth = async () => {
    setIsLoading(true);
    try {
      const result = await AuthDebugHelper.autoRepairAuth();
      
      if (result.needsLogin) {
        // Redirecionar para login se necessário
        window.location.href = '/login';
        return;
      }
      
      // Executar diagnóstico novamente para atualizar resultados
      await runDiagnostic();
    } catch (error) {
      console.error('Erro ao tentar reparar autenticação:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuth = () => {
    AuthDebugHelper.clearAllAuthData();
    // Atualizar diagnóstico
    runDiagnostic();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => {
            setIsOpen(true);
            runDiagnostic();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg"
        >
          🔍 Debug Auth
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Diagnóstico de Autenticação</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Carregando...</span>
            </div>
          ) : diagnosticResult ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Status do Token</h4>
                <div className="bg-gray-50 p-2 rounded mt-1">
                  <p>Token encontrado: {diagnosticResult.authInfo.hasToken ? '✅' : '❌'}</p>
                  {diagnosticResult.authInfo.hasToken && (
                    <>
                      <p>Fonte: {diagnosticResult.authInfo.tokenSource}</p>
                      <p>Formato JWT válido: {diagnosticResult.authInfo.isJWT ? '✅' : '❌'}</p>
                      <p>Expirado: {diagnosticResult.authInfo.isExpired ? '❌ Sim' : '✅ Não'}</p>
                      {diagnosticResult.authInfo.expirationDate && (
                        <p>Expira em: {new Date(diagnosticResult.authInfo.expirationDate).toLocaleString()}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {diagnosticResult.testResult && (
                <div>
                  <h4 className="font-semibold">Teste de API</h4>
                  <div className="bg-gray-50 p-2 rounded mt-1">
                    <p>Status: {diagnosticResult.testResult.success ? '✅ OK' : `❌ Falha (${diagnosticResult.testResult.status})`}</p>
                    {diagnosticResult.testResult.error && (
                      <p>Erro: {diagnosticResult.testResult.error}</p>
                    )}
                  </div>
                </div>
              )}
              
              {diagnosticResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold">Recomendações</h4>
                  <ul className="bg-yellow-50 p-2 rounded mt-1 list-disc pl-5">
                    {diagnosticResult.recommendations.map((rec: string, i: number) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={runDiagnostic}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                >
                  Atualizar
                </button>
                <button
                  onClick={repairAuth}
                  className="bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded text-sm"
                >
                  Tentar Corrigir
                </button>
                <button
                  onClick={clearAuth}
                  className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm"
                >
                  Limpar Dados
                </button>
              </div>
            </div>
          ) : (
            <p>Nenhum resultado disponível</p>
          )}
        </div>
      )}
    </div>
  );
} 