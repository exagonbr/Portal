'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isDevelopment, isProduction, getNodeEnv } from '@/utils/env';

interface RouteInfo {
  currentPath: string;
  cookies: Record<string, string>;
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  userAgent: string;
  timestamp: string;
}

export function RouteDebugger() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Só mostrar em desenvolvimento ou quando explicitamente solicitado
    const shouldShow = isDevelopment() ||
                      localStorage.getItem('debug_routes') === 'true';
    
    if (shouldShow) {
      collectRouteInfo();
    }
  }, [pathname]);

  const collectRouteInfo = () => {
    const info: RouteInfo = {
      currentPath: pathname,
      cookies: {},
      localStorage: {},
      sessionStorage: {},
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Coletar cookies
    if (typeof document !== 'undefined') {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name) {
          info.cookies[name] = value || '';
        }
      });
    }

    // Coletar localStorage
    if (typeof window !== 'undefined') {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            info.localStorage[key] = localStorage.getItem(key) || '';
          }
        }
      } catch (e) {
        info.localStorage['error'] = 'Não foi possível acessar localStorage';
      }

      // Coletar sessionStorage
      try {
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            info.sessionStorage[key] = sessionStorage.getItem(key) || '';
          }
        }
      } catch (e) {
        info.sessionStorage['error'] = 'Não foi possível acessar sessionStorage';
      }
    }

    setRouteInfo(info);
  };

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      // Limpar localStorage
      localStorage.clear();
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Limpar cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      // Atualizar informações
      collectRouteInfo();
      
      alert('Todos os dados foram limpos!');
    }
  };

  const testLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        alert('Logout executado com sucesso!');
        collectRouteInfo();
      } else {
        alert(`Erro no logout: ${response.status}`);
      }
    } catch (error) {
      alert(`Erro na requisição de logout: ${error}`);
    }
  };

  const navigateToRoute = (route: string) => {
    router.push(route);
  };

  // Só renderizar se debug estiver ativo
  if (process.env.NODE_ENV === 'production' && 
      typeof window !== 'undefined' && 
      localStorage.getItem('debug_routes') !== 'true') {
    return null;
  }

  if (!routeInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-500 text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-red-600"
        title="Debug de Rotas"
      >
        🐛
      </button>

      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Debug de Rotas</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <strong>Rota Atual:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono">
                {routeInfo.currentPath}
              </div>
            </div>

            <div>
              <strong>Cookies de Auth:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                {Object.entries(routeInfo.cookies)
                  .filter(([key]) => key.includes('auth') || key.includes('session') || key.includes('user'))
                  .map(([key, value]) => (
                    <div key={key} className="font-mono text-xs">
                      <span className="text-blue-600">{key}:</span> {value.substring(0, 30)}...
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <strong>LocalStorage de Auth:</strong>
              <div className="bg-gray-100 p-2 rounded mt-1 max-h-20 overflow-y-auto">
                {Object.entries(routeInfo.localStorage)
                  .filter(([key]) => key.includes('auth') || key.includes('session') || key.includes('user'))
                  .map(([key, value]) => (
                    <div key={key} className="font-mono text-xs">
                      <span className="text-green-600">{key}:</span> {value.substring(0, 30)}...
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={collectRouteInfo}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                Atualizar
              </button>
              
              <button
                onClick={clearAllData}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
              >
                Limpar Tudo
              </button>
              
              <button
                onClick={testLogout}
                className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
              >
                Test Logout
              </button>
            </div>

            <div>
              <strong>Navegação Rápida:</strong>
              <div className="flex flex-wrap gap-1 mt-1">
                {['/login', '/portal/videos', '/portal/books', '/dashboard'].map(route => (
                  <button
                    key={route}
                    onClick={() => navigateToRoute(route)}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-300"
                  >
                    {route}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-gray-500">
              <div>Timestamp: {routeInfo.timestamp}</div>
              <div>Ambiente: {process.env.NODE_ENV}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RouteDebugger; 