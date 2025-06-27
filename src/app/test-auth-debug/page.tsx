'use client';

import { useState } from 'react';
import { systemAdminService } from '@/services/systemAdminService';
import { authService } from '@/services/authService';
import { apiClient } from '@/lib/api-client';

export default function TestAuthDebugPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testTokenStorage = () => {
    console.log('🧪 Testando armazenamento de token...');
    
    const localStorage_auth_token = localStorage.getItem('auth_token');
    const localStorage_token = localStorage.getItem('token');
    const localStorage_authToken = localStorage.getItem('authToken');
    
    const cookies = document.cookie;
    
    addResult('Token Storage Test', {
      localStorage_auth_token: localStorage_auth_token ? localStorage_auth_token.substring(0, 20) + '...' : null,
      localStorage_token: localStorage_token ? localStorage_token.substring(0, 20) + '...' : null,
      localStorage_authToken: localStorage_authToken ? localStorage_authToken.substring(0, 20) + '...' : null,
      cookies: cookies,
      hasAnyToken: !!(localStorage_auth_token || localStorage_token || localStorage_authToken)
    });
  };

  const testManualLogin = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testando login manual...');
      
      // Tentar fazer login com credenciais de teste
      const loginResult = await authService.login('admin@test.com', 'password123');
      
      addResult('Manual Login Test', {
        success: loginResult.success,
        hasUser: !!loginResult.user,
        hasToken: !!loginResult.token,
        token: loginResult.token ? loginResult.token.substring(0, 20) + '...' : null,
        user: loginResult.user,
        message: loginResult.message
      });
      
      // Verificar se o token foi armazenado
      setTimeout(() => {
        testTokenStorage();
      }, 1000);
      
    } catch (error: any) {
      addResult('Manual Login Test', {
        success: false,
        error: error.message || error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiCall = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testando chamada da API...');
      
      const authTest = await systemAdminService.testAuthentication();
      addResult('API Call Test', authTest);
      
    } catch (error: any) {
      addResult('API Call Test', {
        success: false,
        error: error.message || error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testDirectApiCall = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testando chamada direta da API...');
      
      const response = await apiClient.get('/api/users/stats');
      addResult('Direct API Call Test', {
        success: response.success,
        data: response.data,
        message: response.message
      });
      
    } catch (error: any) {
      addResult('Direct API Call Test', {
        success: false,
        error: error.message || error.toString()
      });
    } finally {
      setLoading(false);
    }
  };

  const setTestToken = () => {
    console.log('🧪 Definindo token de teste...');
    
    // Criar um token JWT de teste simples
    const testPayload = {
      userId: 'test-admin-id',
      email: 'admin@test.com',
      name: 'Test Admin',
      role: 'SYSTEM_ADMIN',
      institutionId: 'test-institution',
      permissions: ['admin', 'read', 'write'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 horas
    };
    
    // Codificar como base64 (token de fallback)
    const testToken = btoa(JSON.stringify(testPayload));
    
    // Armazenar o token
    localStorage.setItem('auth_token', testToken);
    apiClient.setAuthToken(testToken);
    
    addResult('Set Test Token', {
      success: true,
      token: testToken.substring(0, 20) + '...',
      payload: testPayload
    });
    
    // Verificar se foi armazenado
    setTimeout(() => {
      testTokenStorage();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Debug de Autenticação
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes de Autenticação</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testTokenStorage}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Verificar Token Storage
            </button>
            
            <button
              onClick={setTestToken}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Definir Token de Teste
            </button>
            
            <button
              onClick={testManualLogin}
              disabled={loading}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Login Manual'}
            </button>
            
            <button
              onClick={testApiCall}
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Autenticação API'}
            </button>
            
            <button
              onClick={testDirectApiCall}
              disabled={loading}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              {loading ? 'Testando...' : 'Testar Chamada Direta'}
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Limpar Resultados
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Resultados dos Testes</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">Nenhum teste executado ainda.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{result.test}</h3>
                    <span className="text-sm text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 