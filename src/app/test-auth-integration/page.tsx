'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/services/auth';

export default function TestAuthIntegration() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const testUsers = [
    { email: 'student@example.com', password: 'teste123', role: 'student', name: 'João Silva' },
    { email: 'teacher@example.com', password: 'teste123', role: 'teacher', name: 'Maria Santos' },
    { email: 'admin@example.com', password: 'teste123', role: 'system_admin', name: 'Admin Sistema' },
    { email: 'coordinator@example.com', password: 'teste123', role: 'academic_coordinator', name: 'Ana Costa' },
    { email: 'manager@example.com', password: 'teste123', role: 'institution_manager', name: 'Carlos Oliveira' },
    { email: 'guardian@example.com', password: 'teste123', role: 'guardian', name: 'Pedro Souza' },
  ];

  const handleLogin = async (email: string, password: string, expectedRole: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await login(email, password);
      
      if (result.success && result.user) {
        setSuccess(`Login bem-sucedido! Usuário: ${result.user.name} (${result.user.role})`);
        
        // Aguardar um pouco antes de redirecionar
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (err: any) {
      setError(`Erro no login: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestBackendConnection = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/validate');
      const data = await response.json();
      
      if (response.ok) {
        setSuccess('Conexão com o backend está funcionando!');
      } else {
        setError(`Erro na conexão: ${data.message}`);
      }
    } catch (err: any) {
      setError(`Erro ao testar conexão: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Teste de Integração - Autenticação e Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Use esta página para testar o login com diferentes roles
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Test Backend Connection */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testar Conexão com Backend</h2>
          <button
            onClick={handleTestBackendConnection}
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Testando...' : 'Testar Conexão'}
          </button>
        </div>

        {/* Test Users */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Usuários de Teste</h2>
          <div className="space-y-4">
            {testUsers.map((user) => (
              <div
                key={user.email}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">
                      Email: {user.email} | Senha: {user.password}
                    </p>
                    <p className="text-sm text-gray-500">
                      Role: <span className="font-medium">{user.role}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleLogin(user.email, user.password, user.role)}
                    disabled={loading}
                    className="ml-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Fazendo login...' : 'Fazer Login'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">
            Instruções de Teste
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
            <li>Primeiro, teste a conexão com o backend clicando no botão acima</li>
            <li>Certifique-se de que o backend está rodando na porta 3001</li>
            <li>Clique em "Fazer Login" para qualquer usuário de teste</li>
            <li>Você será redirecionado automaticamente para o dashboard apropriado</li>
            <li>Cada role tem um dashboard diferente:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>student → /dashboard/student</li>
                <li>teacher → /dashboard/teacher</li>
                <li>system_admin → /dashboard/system-admin</li>
                <li>academic_coordinator → /dashboard/coordinator</li>
                <li>institution_manager → /dashboard/institution-manager</li>
                <li>guardian → /dashboard/guardian</li>
              </ul>
            </li>
          </ol>
        </div>

        {/* Backend Status */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Backend URL: {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}</p>
          <p>Frontend URL: {process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}</p>
        </div>
      </div>
    </div>
  );
}