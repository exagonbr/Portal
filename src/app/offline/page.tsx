'use client';

import { useEffect } from 'react';
import { FaWifi } from 'react-icons/fa';
import Link from 'next/link';

export default function OfflinePage() {
  useEffect(() => {
    // Try to reconnect periodically
    const checkConnection = setInterval(() => {
      if (navigator.onLine) {
        window.location.reload();
      }
    }, 5000);

    return () => clearInterval(checkConnection);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-start p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <FaWifi className="text-6xl text-warning opacity-50" />
        </div>
        
        <h1 className="text-3xl font-bold text-text-primary">
          Você está offline
        </h1>
        
        <p className="text-text-secondary">
          Não foi possível conectar ao Portal Educacional. Verifique sua conexão com a internet e tente novamente.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full button-primary"
          >
            Tentar novamente
          </button>

          <Link
            href="/"
            className="block w-full py-2 px-4 text-center text-primary hover:text-primary-dark transition-colors"
          >
            Voltar para a página inicial
          </Link>
        </div>

        <div className="text-sm text-text-secondary">
          <p>Algumas funcionalidades podem estar disponíveis offline.</p>
          <p>Os dados serão sincronizados quando você estiver online novamente.</p>
        </div>
      </div>
    </div>
  );
}
