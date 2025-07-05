'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const [email, setEmail] = useState('admin@sistema.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      console.log('Login result:', result);
      
      // Redirecionar manualmente após login bem-sucedido
      setTimeout(() => {
        router.push('/dashboard/system-admin');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const createMockSession = () => {
    // Criar sessão mock para teste
    const mockUser = {
      id: '1',
      email: 'admin@sistema.com',
      name: 'Administrador do Sistema',
      role: 'SYSTEM_ADMIN',
      permissions: ['all']
    };

    // Salvar nos cookies
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(mockUser))}; path=/; max-age=${24 * 60 * 60}`;
    document.cookie = `session_expires=${expiresAt}; path=/; max-age=${24 * 60 * 60}`;
    document.cookie = `auth_token=mock-token-123; path=/; max-age=${24 * 60 * 60}`;

    // Salvar no localStorage também
    localStorage.setItem('user', JSON.stringify({
      user: mockUser,
      expiresAt: expiresAt
    }));
    localStorage.setItem('auth_token', 'mock-token-123');
    localStorage.setItem('last_activity', Date.now().toString());

    alert('Sessão mock criada! Redirecionando...');
    
    setTimeout(() => {
      router.push('/dashboard/system-admin');
    }, 1000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Teste de Login</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Fazendo login...' : 'Fazer Login'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Teste Rápido</h2>
          <button
            onClick={createMockSession}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
          >
            Criar Sessão Mock (SYSTEM_ADMIN)
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Cria uma sessão mock para testar o dashboard sem backend
          </p>
        </div>

        <div className="mt-4 space-y-2">

          
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
          >
            Ir para Login Real
          </button>
        </div>
      </div>
    </div>
  );
} 