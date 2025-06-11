'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState<string>('unknown');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const type = searchParams.get('type') || 'unknown';
    setErrorType(type);

    // Configurar contador regressivo para redirecionamento automático
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Limpar cookies de autenticação e redirecionamento
          document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = 'refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = 'session_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = 'user_data=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = 'redirect_count=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          
          // Redirecionar para login
          window.location.href = '/login?error=session_error';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  // Mensagens de erro específicas
  const errorMessages: Record<string, { title: string; message: string }> = {
    redirect_loop: {
      title: 'Problema de Redirecionamento Detectado',
      message: 'O sistema detectou um problema ao tentar validar sua sessão. Isso pode ocorrer devido a um problema com os cookies ou sessão.'
    },
    session_expired: {
      title: 'Sessão Expirada',
      message: 'Sua sessão expirou. Por favor, faça login novamente.'
    },
    unauthorized: {
      title: 'Acesso Não Autorizado',
      message: 'Você não tem permissão para acessar este recurso.'
    },
    unknown: {
      title: 'Erro de Autenticação',
      message: 'Ocorreu um erro desconhecido durante a autenticação.'
    }
  };

  const { title, message } = errorMessages[errorType] || errorMessages.unknown;

  const handleLogout = () => {
    // Limpar cookies
    document.cookie = 'auth_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = 'refresh_token=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = 'session_id=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = 'user_data=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie = 'redirect_count=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    
    // Redirecionar para login
    window.location.href = '/login?error=session_error';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-bold text-red-600">{title}</h1>
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="mb-6 rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Você será redirecionado para a página de login em <span className="font-bold">{countdown}</span> segundos.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-center text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Ir para Login
          </button>
          
          <Link
            href="/portal/videos"
            className="w-full rounded-md border border-gray-300 bg-white py-2 px-4 text-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Acessar Portal Público
          </Link>
        </div>
      </div>
    </div>
  );
} 