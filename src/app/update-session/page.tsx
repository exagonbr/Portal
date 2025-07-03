'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UpdateSessionPage() {
  const [status, setStatus] = useState('');
  const [currentExpiry, setCurrentExpiry] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const router = useRouter();

  useEffect(() => {
    updateSession();
  }, []);

  const updateSession = () => {
    if (typeof window !== 'undefined') {
      try {
        // Ler sessão atual
        const userSession = localStorage.getItem('user_session');
        if (userSession) {
          const sessionData = JSON.parse(userSession);
          const currentExpiryDate = new Date(sessionData.expiresAt);
          setCurrentExpiry(currentExpiryDate.toLocaleString('pt-BR'));

          // Calcular nova expiração (1 dia a partir de agora)
          const now = Date.now();
          const oneDayFromNow = now + (24 * 60 * 60 * 1000);
          const newExpiryDate = new Date(oneDayFromNow);
          setNewExpiry(newExpiryDate.toLocaleString('pt-BR'));

          // Atualizar sessão
          const updatedSessionData = {
            ...sessionData,
            timestamp: now,
            expiresAt: oneDayFromNow
          };

          // Salvar no localStorage
          localStorage.setItem('user_session', JSON.stringify(updatedSessionData));
          localStorage.setItem('last_activity', now.toString());

          // Atualizar cookie de expiração também
          document.cookie = `session_expires=${oneDayFromNow}; path=/; max-age=${24 * 60 * 60}`;

          setStatus('✅ Sessão atualizada com sucesso!');
        } else {
          setStatus('❌ Nenhuma sessão encontrada');
        }
      } catch (error) {
        console.error('Erro ao atualizar sessão:', error);
        setStatus('❌ Erro ao atualizar sessão');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Atualizar Sessão</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-800 mb-2">Status:</h2>
            <p className="text-blue-700">{status}</p>
          </div>

          {currentExpiry && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="font-semibold text-gray-800 mb-2">Expiração Anterior:</h2>
              <p className="text-gray-700">{currentExpiry}</p>
            </div>
          )}

          {newExpiry && (
            <div className="p-4 bg-green-50 rounded-lg">
              <h2 className="font-semibold text-green-800 mb-2">Nova Expiração:</h2>
              <p className="text-green-700">{newExpiry}</p>
            </div>
          )}

          <div className="space-y-2">
            <button
              onClick={updateSession}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Atualizar Novamente
            </button>
            
            <button
              onClick={() => router.push('/dashboard/system-admin')}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Ir para Dashboard
            </button>
            
            <button
              onClick={() => router.push('/debug-auth')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Ver Debug
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 