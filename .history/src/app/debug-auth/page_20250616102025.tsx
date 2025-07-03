'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
  const { user, loading, error } = useAuth();
  const [cookies, setCookies] = useState<string>('');
  const [localStorage, setLocalStorage] = useState<any>({});
  const [sessionStorage, setSessionStorage] = useState<any>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      // Verificar cookies
      setCookies(document.cookie);
      
      // Verificar localStorage
      const localData: any = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          localData[key] = window.localStorage.getItem(key);
        }
      }
      setLocalStorage(localData);
      
      // Verificar sessionStorage
      const sessionData: any = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          sessionData[key] = window.sessionStorage.getItem(key);
        }
      }
      setSessionStorage(sessionData);
    }
  }, [mounted]);

  const clearAllData = () => {
    if (typeof window !== 'undefined') {
      // Limpar localStorage
      window.localStorage.clear();
      
      // Limpar sessionStorage
      window.sessionStorage.clear();
      
      // Limpar cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        if (name) {
          document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        }
      });
      
      // Recarregar página
      window.location.reload();
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando debug...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticação</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado do AuthContext */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Estado do AuthContext</h2>
            <div className="space-y-2">
              <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
              <p><strong>Error:</strong> {error || 'null'}</p>
              <p><strong>User:</strong></p>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {user ? JSON.stringify(user, null, 2) : 'null'}
              </pre>
            </div>
          </div>

          {/* Cookies */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Cookies</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto h-32">
              {cookies || 'Nenhum cookie encontrado'}
            </pre>
          </div>

          {/* localStorage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">localStorage</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto h-32">
              {Object.keys(localStorage).length > 0 
                ? JSON.stringify(localStorage, null, 2)
                : 'Nenhum dado no localStorage'
              }
            </pre>
          </div>

          {/* sessionStorage */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">sessionStorage</h2>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto h-32">
              {Object.keys(sessionStorage).length > 0 
                ? JSON.stringify(sessionStorage, null, 2)
                : 'Nenhum dado no sessionStorage'
              }
            </pre>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Ações</h2>
          <div className="space-x-4">
            <button
              onClick={clearAllData}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Limpar Todos os Dados
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/login';
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ir para Login
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/dashboard/system-admin';
                }
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ir para Dashboard System Admin
            </button>
          </div>
        </div>

        {/* Informações da URL */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informações da URL</h2>
          <div className="space-y-2">
            <p><strong>Pathname:</strong> {mounted && typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
            <p><strong>Search:</strong> {mounted && typeof window !== 'undefined' ? window.location.search : 'N/A'}</p>
            <p><strong>Hash:</strong> {mounted && typeof window !== 'undefined' ? window.location.hash : 'N/A'}</p>
            <p><strong>Origin:</strong> {mounted && typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}