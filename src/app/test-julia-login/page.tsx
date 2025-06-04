'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestJuliaLoginPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const testJuliaLogin = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('🔄 Testando login da Julia...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'julia.c@ifsp.com', 
          password: 'admin123' 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Login bem-sucedido para Julia!
🎓 Usuário: ${data.user?.name}
📋 Role: ${data.user?.role}
🏫 Permissões: ${data.user?.permissions?.length || 0} encontradas
🔐 Token: ${data.token ? 'Gerado com sucesso' : 'Erro na geração'}

🔄 Redirecionando para dashboard de estudante...`);
        
        // Aguardar um pouco para mostrar a mensagem
        setTimeout(() => {
          router.push('/dashboard/student');
        }, 2000);
        
      } else {
        setResult(`❌ Erro no login: ${data.message || 'Falha no login'}`);
      }
    } catch (error) {
      setResult(`❌ Erro de conexão: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDashboardAccess = () => {
    router.push('/dashboard/student');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🧪 Teste de Login - Julia IFSP
        </h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">Informações do Teste:</h2>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>📧 Email: julia.c@ifsp.com</li>
              <li>🔐 Senha: admin123</li>
              <li>👤 Role Esperado: STUDENT</li>
              <li>🎯 Dashboard: /dashboard/student</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={testJuliaLogin}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '🔄 Testando...' : '🚀 Testar Login Julia'}
            </button>
            
            <button
              onClick={testDashboardAccess}
              className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              📊 Ir para Dashboard
            </button>
          </div>

          {result && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Resultado:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            ← Voltar para login normal
          </a>
        </div>
      </div>
    </div>
  );
} 