'use client';

import React, { useState, useEffect, useRef } from 'react';

interface QueueEndpointStats {
  totalRequests: number;
  requestsInWindow: number;
  lastRequestTime: number;
  rateLimited: boolean;
  averageResponseTime: number;
  errors: number;
  windowStart: number;
}

interface RequestLog {
  timestamp: number;
  status: 'success' | 'error' | 'rate-limited';
  responseTime?: number;
  error?: string;
}

const QueueEndpointMonitor: React.FC = () => {
  const [stats, setStats] = useState<QueueEndpointStats>({
    totalRequests: 0,
    requestsInWindow: 0,
    lastRequestTime: 0,
    rateLimited: false,
    averageResponseTime: 0,
    errors: 0,
    windowStart: Date.now()
  });

  const [requestLog, setRequestLog] = useState<RequestLog[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalFetch = useRef<typeof fetch | null>(null);

  // Interceptar fetch para monitorar /api/queue/next
  useEffect(() => {
    if (!originalFetch.current) {
      originalFetch.current = window.fetch;
    }

    const interceptedFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      
      if (url.includes('/api/queue/next')) {
        const startTime = Date.now();
        
        try {
          const response = await originalFetch.current!(input, init);
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          // Atualizar estatísticas
          setStats(prev => {
            const now = Date.now();
            const windowDuration = 10000; // 10 segundos
            
            // Reset window se necessário
            const newWindowStart = now - prev.windowStart > windowDuration ? now : prev.windowStart;
            const requestsInNewWindow = now - prev.windowStart > windowDuration ? 1 : prev.requestsInWindow + 1;
            
            return {
              ...prev,
              totalRequests: prev.totalRequests + 1,
              requestsInWindow: requestsInNewWindow,
              lastRequestTime: now,
              rateLimited: response.status === 429,
              averageResponseTime: (prev.averageResponseTime * prev.totalRequests + responseTime) / (prev.totalRequests + 1),
              windowStart: newWindowStart
            };
          });
          
          // Adicionar ao log
          setRequestLog(prev => [
            {
              timestamp: endTime,
              status: response.status === 429 ? 'rate-limited' : 'success',
              responseTime
            },
            ...prev.slice(0, 19) // Manter apenas os últimos 20
          ]);
          
          return response;
        } catch (error) {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          
          // Atualizar estatísticas de erro
          setStats(prev => ({
            ...prev,
            totalRequests: prev.totalRequests + 1,
            errors: prev.errors + 1,
            lastRequestTime: endTime
          }));
          
          // Adicionar erro ao log
          setRequestLog(prev => [
            {
              timestamp: endTime,
              status: 'error',
              responseTime,
              error: error instanceof Error ? error.message : 'Unknown error'
            },
            ...prev.slice(0, 19)
          ]);
          
          throw error;
        }
      }
      
      return originalFetch.current!(input, init);
    };

    if (isMonitoring) {
      window.fetch = interceptedFetch;
    } else {
      window.fetch = originalFetch.current;
    }

    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
    };
  }, [isMonitoring]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && isMonitoring) {
      intervalRef.current = setInterval(() => {
        setStats(prev => ({ ...prev })); // Trigger re-render
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, isMonitoring]);

  const resetStats = () => {
    setStats({
      totalRequests: 0,
      requestsInWindow: 0,
      lastRequestTime: 0,
      rateLimited: false,
      averageResponseTime: 0,
      errors: 0,
      windowStart: Date.now()
    });
    setRequestLog([]);
  };

  const testEndpoint = async () => {
    try {
      const response = await fetch('/api/queue/next');
      console.log('Test request response:', response.status);
    } catch (error) {
      console.error('Test request error:', error);
    }
  };

  const getStatusColor = (status: RequestLog['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'rate-limited': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: RequestLog['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'rate-limited': return '🚨';
      default: return '❓';
    }
  };

  const timeSinceLastRequest = stats.lastRequestTime ? Date.now() - stats.lastRequestTime : 0;
  const requestRate = stats.requestsInWindow / 10; // requests per second

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">
          🔍 Queue Endpoint Monitor
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`px-2 py-1 text-xs rounded ${
              isMonitoring 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isMonitoring ? 'Parar' : 'Iniciar'}
          </button>
          <button
            onClick={resetStats}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="bg-blue-50 p-2 rounded">
          <div className="font-medium text-blue-800">Total</div>
          <div className="text-blue-600">{stats.totalRequests}</div>
        </div>
        <div className="bg-yellow-50 p-2 rounded">
          <div className="font-medium text-yellow-800">Janela (10s)</div>
          <div className="text-yellow-600">{stats.requestsInWindow}</div>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <div className="font-medium text-green-800">Taxa/s</div>
          <div className="text-green-600">{requestRate.toFixed(1)}</div>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <div className="font-medium text-purple-800">Resp. Média</div>
          <div className="text-purple-600">{stats.averageResponseTime.toFixed(0)}ms</div>
        </div>
      </div>

      {/* Status atual */}
      <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
        <div className="flex justify-between">
          <span>Status:</span>
          <span className={stats.rateLimited ? 'text-red-600 font-medium' : 'text-green-600'}>
            {stats.rateLimited ? '🚨 Rate Limited' : '✅ Normal'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Última req:</span>
          <span className="text-gray-600">
            {timeSinceLastRequest > 0 ? `${(timeSinceLastRequest / 1000).toFixed(1)}s atrás` : 'Nunca'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Erros:</span>
          <span className={stats.errors > 0 ? 'text-red-600' : 'text-green-600'}>
            {stats.errors}
          </span>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={testEndpoint}
          className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          Testar Endpoint
        </button>
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="mr-1"
          />
          Auto
        </label>
      </div>

      {/* Log de requisições */}
      <div className="max-h-32 overflow-y-auto">
        <div className="text-xs font-medium text-gray-700 mb-1">Log (últimas 20):</div>
        {requestLog.length === 0 ? (
          <div className="text-xs text-gray-500 italic">Nenhuma requisição monitorada</div>
        ) : (
          <div className="space-y-1">
            {requestLog.map((log, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  <span>{getStatusIcon(log.status)}</span>
                  <span className={getStatusColor(log.status)}>
                    {log.status}
                  </span>
                </div>
                <div className="text-gray-500">
                  {log.responseTime && `${log.responseTime}ms`}
                  {' '}
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alerta de loop */}
      {requestRate > 2 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
          <div className="font-medium text-red-800">⚠️ POSSÍVEL LOOP DETECTADO!</div>
          <div className="text-red-600">Taxa muito alta: {requestRate.toFixed(1)} req/s</div>
        </div>
      )}
    </div>
  );
};

export default QueueEndpointMonitor; 