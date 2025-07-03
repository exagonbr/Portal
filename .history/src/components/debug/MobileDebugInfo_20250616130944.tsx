'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { runFullDiagnostics, type NetworkDiagnostics, type ConnectivityTest } from '@/utils/mobile-network-diagnostics';

interface DeviceInfo {
  userAgent: string;
  platform: string;
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  touchSupport: boolean;
  cookiesEnabled: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  devicePixelRatio: number;
  orientation: string;
  connection?: any;
  standalone: boolean;
}

export function MobileDebugInfo() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [networkDiagnostics, setNetworkDiagnostics] = useState<{
    networkInfo: NetworkDiagnostics;
    connectivityTests: ConnectivityTest[];
    recommendations: string[];
  } | null>(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const { user, loading, error } = useAuth();

  useEffect(() => {
    const getDeviceInfo = (): DeviceInfo => {
      const userAgent = navigator.userAgent;
      const platform = navigator.platform;
      const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(userAgent);
      const isIOS = /iPhone|iPad|iPod/.test(userAgent);
      const isAndroid = /Android/.test(userAgent);
      
      return {
        userAgent,
        platform,
        isMobile,
        isIOS,
        isAndroid,
        screenWidth: screen.width,
        screenHeight: screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        cookiesEnabled: navigator.cookieEnabled,
        localStorage: typeof(Storage) !== "undefined",
        sessionStorage: typeof(sessionStorage) !== "undefined",
        devicePixelRatio: window.devicePixelRatio,
        orientation: screen.orientation?.type || 'unknown',
        connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
        standalone: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
      };
    };

    setDeviceInfo(getDeviceInfo());

    // Atualizar informações quando a orientação mudar
    const handleOrientationChange = () => {
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Função para executar diagnósticos de rede
  const runNetworkDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const diagnostics = await runFullDiagnostics();
      setNetworkDiagnostics(diagnostics);
    } catch (error) {
      console.error('Erro ao executar diagnósticos:', error);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  if (!deviceInfo) return null;

  return (
    <>
      {/* Botão flutuante para mostrar/ocultar debug */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        style={{ minWidth: '48px', minHeight: '48px' }}
        aria-label="Toggle debug info"
      >
        🐛
      </button>

      {/* Modal de debug */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Debug Mobile</h2>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Informações de Autenticação */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Autenticação</h3>
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                  <div><strong>Loading:</strong> {loading ? 'true' : 'false'}</div>
                  <div><strong>User:</strong> {user ? user.name : 'null'}</div>
                  <div><strong>Role:</strong> {user?.role || 'null'}</div>
                  <div><strong>Error:</strong> {error || 'null'}</div>
                </div>
              </div>

              {/* Informações do Dispositivo */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Dispositivo</h3>
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                  <div><strong>Mobile:</strong> {deviceInfo.isMobile ? 'true' : 'false'}</div>
                  <div><strong>iOS:</strong> {deviceInfo.isIOS ? 'true' : 'false'}</div>
                  <div><strong>Android:</strong> {deviceInfo.isAndroid ? 'true' : 'false'}</div>
                  <div><strong>Touch:</strong> {deviceInfo.touchSupport ? 'true' : 'false'}</div>
                  <div><strong>Standalone:</strong> {deviceInfo.standalone ? 'true' : 'false'}</div>
                </div>
              </div>

              {/* Informações de Tela */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Tela</h3>
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                  <div><strong>Screen:</strong> {deviceInfo.screenWidth}x{deviceInfo.screenHeight}</div>
                  <div><strong>Window:</strong> {deviceInfo.windowWidth}x{deviceInfo.windowHeight}</div>
                  <div><strong>DPR:</strong> {deviceInfo.devicePixelRatio}</div>
                  <div><strong>Orientation:</strong> {deviceInfo.orientation}</div>
                </div>
              </div>

              {/* Informações de Armazenamento */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Armazenamento</h3>
                <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                  <div><strong>Cookies:</strong> {deviceInfo.cookiesEnabled ? 'enabled' : 'disabled'}</div>
                  <div><strong>localStorage:</strong> {deviceInfo.localStorage ? 'available' : 'unavailable'}</div>
                  <div><strong>sessionStorage:</strong> {deviceInfo.sessionStorage ? 'available' : 'unavailable'}</div>
                </div>
              </div>

              {/* Informações de Conexão */}
              {deviceInfo.connection && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-700 mb-2">Conexão</h3>
                  <div className="bg-gray-50 p-2 rounded text-xs space-y-1">
                    <div><strong>Type:</strong> {deviceInfo.connection.effectiveType || 'unknown'}</div>
                    <div><strong>Downlink:</strong> {deviceInfo.connection.downlink || 'unknown'} Mbps</div>
                    <div><strong>RTT:</strong> {deviceInfo.connection.rtt || 'unknown'} ms</div>
                  </div>
                </div>
              )}

              {/* User Agent */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">User Agent</h3>
                <div className="bg-gray-50 p-2 rounded text-xs break-all">
                  {deviceInfo.userAgent}
                </div>
              </div>

              {/* Cookies atuais */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">Cookies</h3>
                <div className="bg-gray-50 p-2 rounded text-xs break-all max-h-20 overflow-y-auto">
                  {document.cookie || 'Nenhum cookie encontrado'}
                </div>
              </div>

              {/* localStorage */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2">localStorage</h3>
                <div className="bg-gray-50 p-2 rounded text-xs break-all max-h-20 overflow-y-auto">
                  {Object.keys(localStorage).length > 0 
                    ? Object.keys(localStorage).map(key => `${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`).join('\n')
                    : 'Nenhum dado no localStorage'
                  }
                </div>
              </div>

              {/* Diagnósticos de Rede */}
              <div>
                <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center justify-between">
                  Diagnósticos de Rede
                  <button
                    onClick={runNetworkDiagnostics}
                    disabled={isRunningDiagnostics}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                  >
                    {isRunningDiagnostics ? 'Testando...' : 'Executar'}
                  </button>
                </h3>
                
                {networkDiagnostics ? (
                  <div className="bg-gray-50 p-2 rounded text-xs space-y-2">
                    <div><strong>Status:</strong> {networkDiagnostics.networkInfo.isOnline ? 'Online' : 'Offline'}</div>
                    <div><strong>Tipo:</strong> {networkDiagnostics.networkInfo.connectionType}</div>
                    {networkDiagnostics.networkInfo.effectiveType && (
                      <div><strong>Velocidade:</strong> {networkDiagnostics.networkInfo.effectiveType}</div>
                    )}
                    {networkDiagnostics.networkInfo.rtt && (
                      <div><strong>Latência:</strong> {networkDiagnostics.networkInfo.rtt}ms</div>
                    )}
                    
                    <div className="border-t pt-2 mt-2">
                      <strong>Testes de Conectividade:</strong>
                      {networkDiagnostics.connectivityTests.map((test, index) => (
                        <div key={index} className="text-xs">
                          {test.endpoint}: {test.success ? 
                            `✅ ${test.responseTime}ms` : 
                            `❌ ${test.error?.substring(0, 30)}...`
                          }
                        </div>
                      ))}
                    </div>
                    
                    {networkDiagnostics.recommendations.length > 0 && (
                      <div className="border-t pt-2 mt-2">
                        <strong>Recomendações:</strong>
                        {networkDiagnostics.recommendations.map((rec, index) => (
                          <div key={index} className="text-xs">• {rec}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    Clique em "Executar" para testar a conectividade
                  </div>
                )}
              </div>

              {/* Botões de ação */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    sessionStorage.clear();
                    document.cookie.split(";").forEach(c => {
                      const eqPos = c.indexOf("=");
                      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                    });
                    alert('Dados limpos! Recarregue a página.');
                  }}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded text-sm hover:bg-red-700"
                >
                  Limpar Todos os Dados
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
                >
                  Recarregar Página
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 