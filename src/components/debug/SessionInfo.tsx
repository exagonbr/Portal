'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedAuthService } from '@/services/unifiedAuthService';
import { useSessionHeartbeat } from '@/hooks/useSessionHeartbeat';
import { isDevelopment } from '@/utils/env';

const SessionInfo: React.FC = () => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Hook de heartbeat
  const heartbeat = useSessionHeartbeat({
    enabled: true,
    interval: 2 * 60 * 1000, // 2 minutos
    onSessionExpired: () => {
      console.log('🔒 Sessão expirada detectada');
    },
    onError: (error) => {
      console.error('❌ Erro no heartbeat:', error);
    }
  });

  // Atualizar dados da sessão
  const updateSessionData = () => {
    const user = UnifiedAuthService.getCurrentUser();
    const accessToken = UnifiedAuthService.getAccessToken();
    const sessionId = UnifiedAuthService.getSessionId();
    const authData = {
      user,
      accessToken,
      sessionId,
      isValid: !!(user && accessToken)
    };
    setSessionData(authData);
    setLastUpdate(new Date());
  };

  // Efeito para atualizar dados periodicamente
  useEffect(() => {
    updateSessionData();
    
    const interval = setInterval(updateSessionData, 30000); // 30 segundos
    
    return () => clearInterval(interval);
  }, []);

  // Não mostrar em produção
  if (!isDevelopment()) {
    return null;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageSize = () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length;
        }
      }
      return formatBytes(total);
    } catch (error) {
      return 'N/A';
    }
  };

  const clearAllData = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de autenticação?')) {
      const token = UnifiedAuthService.getAccessToken();
      const sessionId = UnifiedAuthService.getSessionId();
      
      await UnifiedAuthService.clearAuthData(sessionId || undefined, token || undefined);
      updateSessionData();
      
      console.log('🧹 Dados limpos manualmente');
    }
  };

  const syncStorages = () => {
    // Sincronização não é mais necessária
    updateSessionData();
    console.log('🔄 Sincronização não é mais necessária');
  };

  return (
    <div className="fixed top-4 left-4 bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-sm z-50 text-xs">
      <div 
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="font-bold">🔧 Session Info</h3>
        <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div className="mt-2 space-y-2">
          {/* Status da Autenticação */}
          <div>
            <h4 className="font-semibold text-yellow-400">🔐 Autenticação:</h4>
            <p>Status: {UnifiedAuthService.isAuthenticated() ? '✅ Autenticado' : '❌ Não autenticado'}</p>
            <p>Usuário: {sessionData?.user?.name || 'N/A'}</p>
            <p>Role: {sessionData?.user?.role || 'N/A'}</p>
          </div>

          {/* Dados dos Storages */}
          <div>
            <h4 className="font-semibold text-blue-400">💾 Storages:</h4>
            <p>localStorage: {sessionData?.accessToken ? '✅' : '❌'}</p>
            <p>Cookies: {sessionData?.isValid ? '✅' : '❌'}</p>
            <p>Tamanho: {getStorageSize()}</p>
          </div>

          {/* Heartbeat */}
          <div>
            <h4 className="font-semibold text-green-400">💓 Heartbeat:</h4>
            <p>Ativo: {heartbeat.isActive ? '✅' : '❌'}</p>
            <p>Última atividade: {Math.floor(heartbeat.getTimeSinceLastActivity() / 1000)}s atrás</p>
          </div>

          {/* Sessão Redis */}
          <div>
            <h4 className="font-semibold text-purple-400">🗄️ Redis:</h4>
            <p>Session ID: {sessionData?.sessionId || 'N/A'}</p>
          </div>

          {/* Informações do Sistema */}
          <div>
            <h4 className="font-semibold text-gray-400">ℹ️ Sistema:</h4>
            <p>Última atualização: {formatTime(lastUpdate)}</p>
            <p>URL: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
          </div>

          {/* Ações */}
          <div className="space-y-1 pt-2 border-t border-gray-700">
            <button
              onClick={updateSessionData}
              className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
            >
              🔄 Atualizar
            </button>
            
            <button
              onClick={syncStorages}
              className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
            >
              🔄 Sincronizar
            </button>
            
            <button
              onClick={heartbeat.forceHeartbeat}
              className="w-full bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
            >
              💓 Heartbeat
            </button>
            
            <button
              onClick={clearAllData}
              className="w-full bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
            >
              🧹 Limpar Dados
            </button>
          </div>

          {/* Debug Raw Data */}
          {sessionData && (
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-400">📋 Dados Raw</summary>
              <pre className="mt-1 bg-gray-800 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

export default SessionInfo; 