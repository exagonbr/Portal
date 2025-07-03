'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preservar todos os parâmetros de query string
    const params = new URLSearchParams();
    
    if (searchParams) {
      searchParams.forEach((value, key) => {
        params.append(key, value);
      });
    }

    // Redirecionar para a rota correta de login
    const redirectUrl = params.toString() 
      ? `/auth/login?${params.toString()}`
      : '/auth/login';

    console.log(`🔄 Redirecionando de /login para ${redirectUrl}`);
    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecionando para o login...</p>
      </div>
    </div>
  );
}