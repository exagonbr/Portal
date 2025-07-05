'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/utils/roleRedirect';
import { loginDiagnostics, LoginDiagnostics } from '@/utils/login-diagnostics';

export function LoginDebugger() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [diagnostics, setDiagnostics] = useState<LoginDiagnostics[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  // Atualizar diagnósticos em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setDiagnostics(loginDiagnostics.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const info = {
      timestamp: new Date().toISOString(),
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } : null,
      isAuthenticated,
      isLoading,
      currentUrl: typeof window !== 'undefined' ? window.location.href : '',
      localStorage: typeof window !== 'undefined' ? {
        accessToken: localStorage.getItem('accessToken')?.substring(0, 50) + '...',
        hasToken: !!localStorage.getItem('accessToken')
      } : null,
      dashboardPath: user ? getDashboardPath(user.role) : null
    };

    setDebugInfo(prev => [...prev.slice(-10), info]);
  }, [user, isAuthenticated, isLoading]);

  const handleTestLogin = async () => {
    try {
      await loginDiagnostics.diagnoseLoginFlow('admin@sistema.com', 'admin123');
    } catch (error) {
      console.error('❌ Erro no teste de login:', error);
    }
  };

  const handleManualRedirect = () => {
    if (user) {
      const dashboardPath = getDashboardPath(user.role);
      console.log('🎯 Redirecionamento manual para:', dashboardPath);
      if (dashboardPath) {
        router.push(dashboardPath);
      }
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md max-h-96 overflow-auto z-50 border">
      <h3 className="font-bold text-lg mb-2">Login Debugger</h3>
      
      <div className="mb-4">
        <button
          onClick={handleTestLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 text-sm"
        >
          Test Login
        </button>
        <button
          onClick={handleManualRedirect}
          className="bg-green-500 text-white px-4 py-2 rounded mr-2 text-sm"
          disabled={!user}
        >
          Manual Redirect
        </button>
        <button
          onClick={() => loginDiagnostics.diagnoseCurrentState()}
          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 text-sm"
        >
          Diagnose State
        </button>
        <button
          onClick={() => loginDiagnostics.clearLogs()}
          className="bg-red-500 text-white px-4 py-2 rounded text-sm"
        >
          Clear Logs
        </button>
      </div>

      <div className="text-xs space-y-2">
        <div>
          <strong>Status Atual:</strong>
          <div>Autenticado: {isAuthenticated ? '✅' : '❌'}</div>
          <div>Carregando: {isLoading ? '🔄' : '✅'}</div>
          <div>URL: {currentUrl}</div>
          {user && (
            <div>
              <div>Usuário: {user.name}</div>
              <div>Role: {user.role}</div>
              <div>Dashboard: {getDashboardPath(user.role)}</div>
            </div>
          )}
        </div>

        <div>
          <strong>Log de Estados:</strong>
          <div className="max-h-32 overflow-y-auto">
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs border-b pb-1 mb-1">
                <div>{info.timestamp.split('T')[1].split('.')[0]}</div>
                <div>Auth: {info.isAuthenticated ? '✅' : '❌'}</div>
                <div>User: {info.user?.name || 'None'}</div>
                <div>Role: {info.user?.role || 'None'}</div>
                <div>Dashboard: {info.dashboardPath || 'None'}</div>
                <div>Token: {info.localStorage?.hasToken ? '✅' : '❌'}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <strong>Diagnósticos de Login:</strong>
          <div className="max-h-40 overflow-y-auto">
            {diagnostics.slice(-10).map((diag, index) => {
              const emoji = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: '🔍'
              }[diag.status];
              
              return (
                <div key={index} className="text-xs border-b pb-1 mb-1">
                  <div className="flex justify-between">
                    <span>{diag.timestamp.split('T')[1].split('.')[0]}</span>
                    <span>{emoji}</span>
                  </div>
                  <div><strong>{diag.step}:</strong> {diag.message}</div>
                  {diag.data && (
                    <div className="text-gray-600 truncate">
                      {JSON.stringify(diag.data).substring(0, 100)}...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
} 