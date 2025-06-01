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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden" role="main">
      {/* Video Background com overlay gradient */}
      <div className="absolute inset-0 w-full h-full" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover"
          preload="auto"
        >
          <source src="/back_video4.mp4" type="video/mp4" />
          Seu navegador não suporta a tag de vídeo.
        </video>
        {/* Overlay gradient estilo CRM */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar-bg/80 via-primary/60 to-secondary/40 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
      </div>

      {/* Elementos decorativos */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-md w-full mx-4 animate-fade-in">
        <div className="card-modern bg-background-card/95 backdrop-blur-xl shadow-2xl border border-border-light/50 p-8 space-y-8">
          {/* Logo Container */}
          <div className="text-center">
            <div className="relative w-48 h-16 mx-auto mb-2">
              <Image
                src="/sabercon-logo.png"
                alt="Sabercon Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
                sizes="(max-width: 768px) 192px, 192px"
              />
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-text-primary">
              Bem-vindo ao Portal Educacional
            </h1>
            <p className="text-text-secondary">
              Acesse sua plataforma de aprendizado
            </p>
          </div>

          {/* Unauthorized Message */}
          {showUnauthorizedMessage && (
            <div className="rounded-xl bg-warning/10 border border-warning/20 p-4 animate-slide-down" role="alert">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.004-.833-.77-2.5 1.732-2.5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-warning">Acesso não autorizado</h3>
                  <p className="text-sm text-text-secondary mt-1">
                    Você precisa fazer login para acessar esta página.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            <LoginForm />
          </div>

          {/* Footer Links */}
          <div className="pt-6 border-t border-border-light space-y-4">
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-secondary transition-colors duration-200 font-medium group"
                aria-label="Recuperar senha"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Esqueceu sua senha?
              </Link>
            </div>

            {/* Additional Links */}
            <div className="flex justify-center gap-6 text-xs text-text-tertiary">
              <Link href="/terms" className="hover:text-primary transition-colors duration-200">
                Termos de Uso
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-primary transition-colors duration-200">
                Privacidade
              </Link>
              <span>•</span>
              <Link href="/help" className="hover:text-primary transition-colors duration-200">
                Ajuda
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}