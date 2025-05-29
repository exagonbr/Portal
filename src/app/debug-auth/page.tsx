'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_USERS } from '@/constants/mockData';

export default function DebugAuth() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Debug de Autenticação
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado Atual da Autenticação */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-600">Estado Atual</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium">Loading:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${loading ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                  {loading ? 'Carregando...' : 'Carregado'}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Usuário:</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {user ? 'Autenticado' : 'Não autenticado'}
                </span>
              </div>
              
              {user && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-medium mb-2">Dados do Usuário:</h3>
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Usuários Mock Disponíveis */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-600">Usuários Mock Disponíveis</h2>
            <div className="space-y-3">
              {Object.entries(MOCK_USERS).map(([email, userData]) => (
                <div key={email} className="p-3 border border-gray-200 rounded">
                  <div className="font-medium text-sm">{userData.name}</div>
                  <div className="text-xs text-gray-600">{email}</div>
                  <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ${
                    userData.role === 'admin' ? 'bg-red-100 text-red-800' :
                    userData.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                    userData.role === 'student' ? 'bg-green-100 text-green-800' :
                    userData.role === 'manager' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userData.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Instruções de Teste */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Como Testar</h3>
          <div className="space-y-2 text-blue-800">
            <p>1. Vá para <code className="bg-blue-100 px-2 py-1 rounded">/login</code></p>
            <p>2. Use qualquer email da lista acima</p>
            <p>3. Use a senha: <code className="bg-blue-100 px-2 py-1 rounded">teste123</code></p>
            <p>4. Após o login, você será redirecionado para o dashboard apropriado</p>
          </div>
        </div>

        {/* Links de Teste */}
        <div className="mt-6 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Links de Teste</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center">
              Login
            </a>
            <a href="/test-dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-center">
              Teste Simples
            </a>
            <a href="/test-student" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-center">
              Teste Estudante
            </a>
            <a href="/dashboard/student" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-center">
              Dashboard Real
            </a>
          </div>
        </div>

        {/* Status do LocalStorage */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Status do LocalStorage</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">auth_token:</span>
              <span className="ml-2 text-gray-600">
                {typeof window !== 'undefined' ? localStorage.getItem('auth_token') || 'Não encontrado' : 'N/A (SSR)'}
              </span>
            </div>
            <div>
              <span className="font-medium">user:</span>
              <span className="ml-2 text-gray-600">
                {typeof window !== 'undefined' ? 
                  (localStorage.getItem('user') ? 'Encontrado' : 'Não encontrado') : 
                  'N/A (SSR)'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}