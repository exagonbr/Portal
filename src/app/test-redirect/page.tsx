'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { getDashboardPath } from '@/utils/roleRedirect';

export default function TestRedirectPage() {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const router = useRouter();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    const result = {
      timestamp: new Date().toISOString(),
      step,
      status,
      message,
      data
    };
    setTestResults(prev => [...prev, result]);
    
    const emoji = { success: '✅', error: '❌', info: '🔍' }[status];
    console.log(`${emoji} [TEST-REDIRECT] ${step}: ${message}`, data || '');
  };

  const runFullTest = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      addResult('INICIO', 'info', 'Iniciando teste completo de redirecionamento');
      
      // 1. Verificar estado inicial
      addResult('ESTADO-INICIAL', 'info', 'Verificando estado inicial', {
        isAuthenticated,
        hasUser: !!user,
        currentUrl: window.location.href
      });

      // 2. Fazer logout se necessário
      if (isAuthenticated) {
        addResult('LOGOUT', 'info', 'Fazendo logout para teste limpo');
        localStorage.removeItem('accessToken');
        window.location.reload();
        return;
      }

      // 3. Testar API de login
      addResult('API-TEST', 'info', 'Testando API de login');
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sistema.com',
          password: 'admin123'
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addResult('API-SUCCESS', 'success', 'API de login funcionou', {
          status: response.status,
          hasToken: !!data.data?.accessToken,
          hasUser: !!data.data?.user
        });

        // 4. Verificar token
        if (data.data?.accessToken) {
          const token = data.data.accessToken;
          const parts = token.split('.');
          
          if (parts.length === 3) {
            try {
              const payload = JSON.parse(atob(parts[1]));
              addResult('TOKEN-VALID', 'success', 'Token JWT válido', {
                id: payload.id,
                email: payload.email,
                role: payload.role
              });

              // 5. Verificar dashboard path
              const dashboardPath = getDashboardPath(payload.role);
              if (dashboardPath) {
                addResult('DASHBOARD-PATH', 'success', 'Dashboard path encontrado', {
                  role: payload.role,
                  path: dashboardPath
                });

                // 6. Simular o que o AuthContext faz
                addResult('AUTH-CONTEXT', 'info', 'Simulando AuthContext');
                localStorage.setItem('accessToken', token);
                
                // 7. Aguardar e verificar se o contexto atualiza
                setTimeout(() => {
                  addResult('CONTEXT-UPDATE', 'info', 'Verificando atualização do contexto', {
                    isAuthenticated,
                    hasUser: !!user,
                    userRole: user?.role
                  });
                }, 1000);

                // 8. Tentar redirecionamento manual
                addResult('REDIRECT-MANUAL', 'info', 'Tentando redirecionamento manual');
                setTimeout(() => {
                  router.push(dashboardPath);
                  
                  // 9. Verificar redirecionamento após delay
                  setTimeout(() => {
                    const currentPath = window.location.pathname;
                    const redirectSuccess = currentPath === dashboardPath;
                    
                    addResult('REDIRECT-CHECK', redirectSuccess ? 'success' : 'error', 
                      redirectSuccess ? 'Redirecionamento bem-sucedido' : 'Redirecionamento falhou', {
                      expectedPath: dashboardPath,
                      currentPath,
                      success: redirectSuccess
                    });
                  }, 2000);
                }, 1500);
              } else {
                addResult('DASHBOARD-PATH', 'error', 'Dashboard path não encontrado', {
                  role: payload.role
                });
              }
            } catch (error) {
              addResult('TOKEN-PARSE', 'error', 'Erro ao parsear token', error);
            }
          } else {
            addResult('TOKEN-FORMAT', 'error', 'Token com formato inválido', {
              parts: parts.length
            });
          }
        } else {
          addResult('API-NO-TOKEN', 'error', 'API não retornou token');
        }
      } else {
        addResult('API-ERROR', 'error', 'Erro na API de login', {
          status: response.status,
          message: data.message
        });
      }
    } catch (error) {
      addResult('ERRO-GERAL', 'error', 'Erro geral no teste', error);
    } finally {
      setIsRunning(false);
    }
  };

  const testDirectLogin = async () => {
    setIsRunning(true);
    addResult('DIRECT-LOGIN', 'info', 'Testando login direto via AuthContext');
    
    try {
      await login('admin@sistema.com', 'admin123');
      addResult('DIRECT-LOGIN-SUCCESS', 'success', 'Login direto bem-sucedido');
    } catch (error) {
      addResult('DIRECT-LOGIN-ERROR', 'error', 'Erro no login direto', error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teste de Redirecionamento</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Painel de Controle */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Controles</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Estado Atual:</h3>
                <div className="text-sm text-gray-600">
                  <div>Autenticado: {isAuthenticated ? '✅' : '❌'}</div>
                  <div>Carregando: {isLoading ? '🔄' : '✅'}</div>
                  <div>Usuário: {user?.name || 'Nenhum'}</div>
                  <div>Role: {user?.role || 'Nenhuma'}</div>
                  <div>URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={runFullTest}
                  disabled={isRunning}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {isRunning ? 'Executando...' : 'Teste Completo'}
                </button>
                
                <button
                  onClick={testDirectLogin}
                  disabled={isRunning}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  {isRunning ? 'Executando...' : 'Login Direto'}
                </button>
                
                <button
                  onClick={() => console.log('Diagnóstico removido')}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Diagnosticar Estado
                </button>
                
                <button
                  onClick={clearResults}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded"
                >
                  Limpar Resultados
                </button>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resultados</h2>
            
            <div className="max-h-96 overflow-y-auto space-y-2">
              {testResults.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Nenhum teste executado ainda
                </div>
              ) : (
                testResults.map((result, index) => {
                  const emojiMap = {
                    success: '✅',
                    error: '❌',
                    info: '🔍'
                  } as const;
                  const emoji = emojiMap[result.status as keyof typeof emojiMap] || '❓';
                  
                  return (
                    <div key={index} className="border-b pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{emoji}</span>
                            <span className="font-medium text-sm">{result.step}</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {result.message}
                          </div>
                          {result.data && (
                            <div className="text-xs text-gray-500 mt-1 bg-gray-50 p-2 rounded">
                              <pre>{JSON.stringify(result.data, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {result.timestamp.split('T')[1].split('.')[0]}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 