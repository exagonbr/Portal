'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function TestJuliaLogin() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [loginStatus, setLoginStatus] = useState<string>('');

  const testLogin = async () => {
    try {
      setLoginStatus('Tentando fazer login como Julia Costa...');
      await login('julia.c@edu.com', 'password123');
      setLoginStatus('Login realizado com sucesso!');
    } catch (error) {
      setLoginStatus(`Erro no login: ${error}`);
    }
  };

  useEffect(() => {
    if (user) {
      setLoginStatus(`Usuário logado: ${user.name} (${user.role})`);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Login - Julia Costa</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Teste de Login - Julia Costa</h1>
      
      <div className="mb-4">
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Fazer Login como Julia Costa
        </button>
      </div>

      <div className="mb-4">
        <p><strong>Status:</strong> {loginStatus}</p>
      </div>

      {user && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Dados do Usuário:</h2>
          <p>Nome: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>ID: {user.id}</p>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => router.push('/dashboard/student')}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
        >
          Ir para Dashboard do Estudante
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Ir para Dashboard Genérico
        </button>
      </div>

      <div className="text-sm text-gray-600">
        <p>Este é um teste para verificar se o loop de redirecionamento foi corrigido.</p>
        <p>Julia Costa deve conseguir acessar /dashboard/student sem problemas.</p>
      </div>
    </div>
  );
}