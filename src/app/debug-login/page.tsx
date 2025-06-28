'use client';

import { useState } from 'react';
import { checkEnvironmentVariables } from '@/utils/check-env';
import { debugLogin } from '@/utils/debug-login';

export default function DebugLoginPage() {
  const [email, setEmail] = useState('admin@sabercon.edu.br');
  const [password, setPassword] = useState('password123');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      console.log('🔍 Iniciando diagnóstico completo...');
      
      // 1. Verificar variáveis de ambiente
      const envCheck = checkEnvironmentVariables();
      
      // 2. Executar debug de login
      const loginDebug = await debugLogin(email, password);
      
      // 3. Compilar resultados
      const diagnosticResults = {
        timestamp: new Date().toISOString(),
        environment: envCheck,
        loginTest: loginDebug,
        browser: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine
        }
      };
      
      setResults(diagnosticResults);
      console.log('✅ Diagnóstico completo:', diagnosticResults);
      
    } catch (error) {
      console.error('❌ Erro durante diagnóstico:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Debug de Login</h1>
        
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8">
          <p className="text-yellow-700">
            <strong>⚠️ Atenção:</strong> Esta página é apenas para desenvolvimento e debug.
            Não deve estar disponível em produção.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Credenciais de Teste</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Executando diagnóstico...' : 'Executar Diagnóstico'}
            </button>
          </div>
        </div>
        
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados do Diagnóstico</h2>
            
            <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
              <pre className="text-xs">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
            
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Resumo:</h3>
              
              {results.error ? (
                <div className="text-red-600">
                  ❌ Erro: {results.error}
                </div>
              ) : (
                <>
                  <div className={results.loginTest?.success ? 'text-green-600' : 'text-red-600'}>
                    {results.loginTest?.success ? '✅' : '❌'} Login: {results.loginTest?.success ? 'Sucesso' : 'Falhou'}
                  </div>
                  
                  <div className="text-gray-600">
                    📡 Status HTTP: {results.loginTest?.status || 'N/A'}
                  </div>
                  
                  <div className="text-gray-600">
                    🌐 Backend URL: {results.environment?.NEXT_PUBLIC_BACKEND_URL || 'Não configurada'}
                  </div>
                  
                  <div className="text-gray-600">
                    🔧 Ambiente: {results.environment?.NODE_ENV || 'Não definido'}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Verifique o console do navegador (F12) para logs detalhados.</p>
        </div>
      </div>
    </div>
  );
}