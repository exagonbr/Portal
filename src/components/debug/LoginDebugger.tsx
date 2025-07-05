'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getDashboardPath } from '@/utils/roleRedirect';

export function LoginDebugger() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<any[]>([]);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
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
      const response = await fetch('/api/auth/login', {
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
      console.log('🔍 Login Debug Response:', data);
      
      if (data.success) {
        // Simular o que o AuthContext faz
        const token = data.data.accessToken;
        localStorage.setItem('accessToken', token);
        
        // Aguardar um pouco e verificar se o redirecionamento acontece
        setTimeout(() => {
          console.log('🔍 Verificando redirecionamento após login...');
          console.log('URL atual:', window.location.href);
          console.log('Usuário autenticado:', isAuthenticated);
          console.log('Dados do usuário:', user);
        }, 2000);
      }
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
          className="bg-green-500 text-white px-4 py-2 rounded text-sm"
          disabled={!user}
        >
          Manual Redirect
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
      </div>
    </div>
  );
} 