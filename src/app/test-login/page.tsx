'use client';

import { useState } from 'react';

export default function TestLoginPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testLogin = async (email: string, password: string) => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Login bem-sucedido!\nUsuário: ${data.user?.name}\nRole: ${data.user?.role_name}`);
      } else {
        setResult(`❌ Erro: ${data.message || 'Falha no login'}`);
      }
    } catch (error) {
      setResult(`❌ Erro de conexão: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testCredentials = [
    { email: 'admin@portal.com', password: 'password123', role: 'SYSTEM_ADMIN' },
    { email: 'gestor@sabercon.edu.br', password: 'password123', role: 'INSTITUTION_MANAGER' },
    { email: 'coordenador@sabercon.edu.br', password: 'password123', role: 'ACADEMIC_COORDINATOR' },
    { email: 'professor@sabercon.edu.br', password: 'password123', role: 'TEACHER' },
    { email: 'julia.costa@sabercon.edu.br', password: 'password123', role: 'STUDENT' },
    { email: 'responsavel@sabercon.edu.br', password: 'password123', role: 'GUARDIAN' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">🧪 Teste de Login - Portal Sabercon</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {testCredentials.map((cred, index) => (
            <button
              key={index}
              onClick={() => testLogin(cred.email, cred.password)}
              disabled={loading}
              className="p-4 border rounded-lg hover:bg-blue-50 disabled:opacity-50 text-left"
            >
              <div className="font-medium text-blue-600">{cred.role}</div>
              <div className="text-sm text-gray-600">{cred.email}</div>
              <div className="text-xs text-gray-400">Senha: {cred.password}</div>
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2">Testando login...</span>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium text-yellow-800 mb-2">💡 Informações importantes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Todos os usuários de teste usam a senha: <code className="bg-yellow-100 px-1 rounded">password123</code></li>
            <li>• Se o login falhar, pode ser que o seed não foi executado ou o backend não está rodando</li>
            <li>• Backend deve estar rodando em: <code className="bg-yellow-100 px-1 rounded">http://localhost:3001</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
} 