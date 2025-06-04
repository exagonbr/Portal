'use client';

import { LoginForm } from '../components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const searchParams = useSearchParams();
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);

  useEffect(() => {
    const error = searchParams?.get('error');
    if (error === 'unauthorized') {
      setShowUnauthorizedMessage(true);
      // Remove the error parameter from URL after showing the message
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      window.history.replaceState({}, '', url.toString());
    }
  }, [searchParams]);

  return (
    <div className="relative min-h-screen flex items-center justify-center" role="main">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-100"
          preload="auto"
        >
          <source src="/back_video4.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
      </div>

      {/* Content */}
      <div className="opacity-100 relative z-10 max-w-md w-full space-y-8 p-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="text-center">
          <div className="relative w-48 h-16 mx-auto">
            <Image
              src="/sabercon-logo.png"
              alt="Sabercon Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 192px, 192px"
            />
          </div>
        </div>

        {/* Unauthorized Message */}
        {showUnauthorizedMessage && (
          <div className="rounded-md bg-orange-50 p-4 border border-orange-200" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-orange-400" aria-hidden="true">warning</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Não autorizado</h3>
                <p className="text-sm text-orange-700 mt-1">
                  Você precisa fazer login para acessar esta página.
                </p>
              </div>
            </div>
          </div>
        )}

        <LoginForm />

        <div className="text-center mt-4">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
            aria-label="Recuperar senha"
          >
            Esqueceu sua senha?
          </Link>
        </div>
      </div>
    </div>
  );
}
