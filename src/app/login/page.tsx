'use client';

import { LoginForm } from '../../components/auth/LoginForm';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [showUnauthorizedMessage, setShowUnauthorizedMessage] = useState(false);
  const { settings, isLoading } = useSystemSettings();

  useEffect(() => {
    const error = searchParams?.get('error');
    if (error === 'unauthorized') {
      setShowUnauthorizedMessage(true);
      // Remove the error parameter from URL after showing the message
      const newUrl = window.location.pathname;
      router.replace(newUrl);
    }
  }, [searchParams, router]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const renderBackground = () => {
    if (isLoading) return null;

    const { loginBackground } = settings;

    switch (loginBackground.type) {
      case 'video':
        return (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute min-w-full min-h-full object-cover opacity-100"
            preload="auto"
          >
            <source src={loginBackground.value} type="video/mp4" />
            Seu navegador não suporta a tag de vídeo.
          </video>
        );

      case 'url':
        // Detectar se é vídeo ou imagem pela extensão
        const isVideo = loginBackground.value.match(/\.(mp4|webm|ogg)$/i);
        
        if (isVideo) {
          return (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute min-w-full min-h-full object-cover opacity-100"
              preload="auto"
            >
              <source src={loginBackground.value} type="video/mp4" />
              Seu navegador não suporta a tag de vídeo.
            </video>
          );
        } else {
          return (
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${loginBackground.value})`,
                opacity: (loginBackground.opacity || 100) / 100
              }}
            />
          );
        }

      case 'color':
        return (
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: loginBackground.value,
              opacity: (loginBackground.opacity || 100) / 100
            }}
          />
        );

      default:
        return (
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
        );
    }
  };

  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Redirecionando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center" role="main">
      {/* Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" aria-hidden="true">
        {renderBackground()}
        {/* Overlay opcional para melhor legibilidade */}
        {settings.loginBackground.overlay && (
          <div className="absolute inset-0 bg-black/20" />
        )}
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">
              Acesso negado. Você precisa fazer login para acessar esta página.
            </span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
              onClick={() => setShowUnauthorizedMessage(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </span>
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
