'use client';

import React, { useState, useEffect } from 'react';
import { http500Debugger } from '@/utils/debug-http-500';

interface ConnectivityResult {
  endpoint: string;
  status: number;
  ok: boolean;
  responseTime: number;
  error: string | null;
}

interface DiagnosticStats {
  total: number;
  last24h: number;
  lastHour: number;
  lastMinute: number;
  byEndpoint: Record<string, number>;
  byMethod: Record<string, number>;
  mostRecentError?: any;
}

export default function ConnectivityDiagnostic() {
  const [isOpen, setIsOpen] = useState(false);
  const [connectivityResults, setConnectivityResults] = useState<ConnectivityResult[]>([]);
  const [diagnosticStats, setDiagnosticStats] = useState<DiagnosticStats | null>(null);
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Auto refresh a cada 30 segundos se habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const testConnectivity = async () => {
    setIsTestingConnectivity(true);
    try {
      const results = await http500Debugger.testConnectivity();
      setConnectivityResults(results);
    } catch (error) {
      console.error('Erro ao testar conectividade:', error);
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const refreshStats = () => {
    const stats = http500Debugger.getStats();
    setDiagnosticStats(stats);
  };

  const clearErrors = () => {
    http500Debugger.clearErrors();
    refreshStats();
  };

  const generateReport = () => {
    const report = http500Debugger.generateDiagnosticReport();
    
    // Criar arquivo de texto com o relatório
    const reportText = `
RELATÓRIO DE DIAGNÓSTICO HTTP 500
Data: ${new Date().toISOString()}

ESTATÍSTICAS:
- Total de erros: ${report.total}
- Erros nas últimas 24h: ${report.last24h}
- Erros na última hora: ${report.lastHour}
- Erros no último minuto: ${report.lastMinute}

ERROS POR ENDPOINT:
${Object.entries(report.byEndpoint).map(([endpoint, count]) => `- ${endpoint}: ${count}`).join('\n')}

ERROS POR MÉTODO:
${Object.entries(report.byMethod).map(([method, count]) => `- ${method}: ${count}`).join('\n')}

ERRO MAIS RECENTE:
${report.mostRecentError ? `
- Timestamp: ${new Date(report.mostRecentError.timestamp).toISOString()}
- Endpoint: ${report.mostRecentError.endpoint}
- Método: ${report.mostRecentError.method}
- Status: ${report.mostRecentError.status}
- Erro: ${JSON.stringify(report.mostRecentError.error, null, 2)}
- Resposta: ${report.mostRecentError.responseText}
` : 'Nenhum erro registrado'}

TESTE DE CONECTIVIDADE:
${connectivityResults.map(result => `
- ${result.endpoint}: ${result.ok ? 'OK' : 'FALHA'} (${result.status}) - ${result.responseTime}ms
  ${result.error ? `Erro: ${result.error}` : ''}
`).join('\n')}
    `.trim();

    // Download do arquivo
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic-report-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Inicializar stats na primeira renderização
  useEffect(() => {
    refreshStats();
  }, []);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Diagnóstico de Conectividade"
        >
          🔧
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-auto">
      <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Diagnóstico HTTP 500</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Estatísticas */}
        <div className="bg-gray-50 p-3 rounded">
          <h4 className="font-medium text-gray-700 mb-2">Estatísticas de Erros</h4>
          {diagnosticStats ? (
            <div className="text-sm space-y-1">
              <div>Total: <span className="font-mono">{diagnosticStats.total}</span></div>
              <div>Última hora: <span className="font-mono">{diagnosticStats.lastHour}</span></div>
              <div>Último minuto: <span className="font-mono">{diagnosticStats.lastMinute}</span></div>
              
              {Object.keys(diagnosticStats.byEndpoint).length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600">Endpoints problemáticos:</div>
                  {Object.entries(diagnosticStats.byEndpoint).slice(0, 3).map(([endpoint, count]) => (
                    <div key={endpoint} className="text-xs">
                      {endpoint.split('/').pop()}: {count}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Carregando...</div>
          )}
        </div>

        {/* Teste de Conectividade */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-gray-700">Conectividade</h4>
            <button
              onClick={testConnectivity}
              disabled={isTestingConnectivity}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm transition-colors"
            >
              {isTestingConnectivity ? '⏳' : '🔄'} Testar
            </button>
          </div>
          
          {connectivityResults.length > 0 && (
            <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
              {connectivityResults.map((result, index) => (
                <div key={index} className="flex justify-between">
                  <span className="truncate flex-1">
                    {result.endpoint.split('/').pop()}
                  </span>
                  <span className={`ml-2 ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {result.ok ? '✅' : '❌'} {result.status} ({result.responseTime}ms)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={refreshStats}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            🔄 Atualizar
          </button>
          
          <button
            onClick={clearErrors}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            🧹 Limpar
          </button>
          
          <button
            onClick={generateReport}
            className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm transition-colors"
          >
            📄 Relatório
          </button>
          
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="mr-1"
            />
            Auto
          </label>
        </div>

        {/* Erro mais recente */}
        {diagnosticStats?.mostRecentError && (
          <div className="bg-red-50 border border-red-200 p-2 rounded">
            <div className="text-xs text-red-800">
              <div className="font-medium">Último erro:</div>
              <div>{diagnosticStats.mostRecentError.endpoint}</div>
              <div className="text-red-600">
                {new Date(diagnosticStats.mostRecentError.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Instruções */}
        <div className="text-xs text-gray-500 border-t pt-2">
          💡 Pressione F12 → Console → digite <code>window.http500Debugger</code> para debug avançado
        </div>
      </div>
    </div>
  );
} 