'use client';

import { useState } from 'react';

export default function DebugSettingsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSaveSettings = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔧 Iniciando teste de salvamento de configurações...');
      
      const testSettings = {
        site_name: 'Portal Teste - ' + new Date().toISOString(),
        site_description: 'Teste de configuração - ' + Date.now()
      };
      
      console.log('📝 Configurações de teste:', testSettings);
      
      const response = await fetch('/api/admin/system/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include',
        body: JSON.stringify(testSettings)
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📡 Response data:', data);
      
      setResult({
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testLoadSettings = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      console.log('🔧 Iniciando teste de carregamento de configurações...');
      
      const response = await fetch('/api/admin/system/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        credentials: 'include'
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const data = await response.json();
      console.log('📡 Response data:', data);
      
      setResult({
        success: response.ok,
        status: response.status,
        data,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">
          Debug - Configurações do Sistema
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Testes Disponíveis</h2>
          
          <div className="space-y-4">
            <button
              onClick={testLoadSettings}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded mr-4"
            >
              {loading ? 'Testando...' : 'Testar Carregamento'}
            </button>
            
            <button
              onClick={testSaveSettings}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Testando...' : 'Testar Salvamento'}
            </button>
          </div>
        </div>
        
        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado do Teste</h2>
            
            <div className={`p-4 rounded mb-4 ${
              result.success ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'
            }`}>
              <p className={`font-semibold ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? '✅ Sucesso' : '❌ Erro'}
              </p>
              <p className="text-sm text-gray-600">Status: {result.status}</p>
              <p className="text-sm text-gray-600">Timestamp: {result.timestamp}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-semibold mb-2">Dados:</h3>
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Instruções:</h3>
          <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
            <li>Abra as ferramentas de desenvolvedor (F12) para ver os logs detalhados</li>
            <li>Certifique-se de estar logado como administrador do sistema</li>
            <li>Os logs mostrarão exatamente onde o erro está ocorrendo</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 