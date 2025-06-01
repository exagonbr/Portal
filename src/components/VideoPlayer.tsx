'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface VideoPlayerProps {
  videoId: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoId, onClose }: VideoPlayerProps): JSX.Element | null {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!mounted) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-sidebar-bg/90 backdrop-blur-md p-4 sm:p-8 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
    >
      {/* Botão de fechar moderno */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-secondary-light z-[100000]
                 transition-all duration-300 transform hover:scale-110 hover:rotate-90 focus:outline-none
                 focus:ring-4 focus:ring-white/20 rounded-full p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm
                 border border-white/10 hover:border-white/20"
        aria-label="Fechar reprodutor de vídeo"
      >
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Container principal com vídeo e menu lateral */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl h-[90vh] lg:h-[85vh] animate-slide-up">
        {/* Container do vídeo com loading state */}
        <div className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl border border-border-dark/20 backdrop-blur-sm hover-glow">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="loading-spinner w-12 h-12 border-primary/30 border-t-primary"></div>
                <p className="text-white/80 text-sm font-medium">Carregando vídeo...</p>
              </div>
            </div>
          )}
          <iframe
            id="video-player"
            title="Reprodutor de vídeo educacional"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full rounded-2xl"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Menu lateral moderno estilo CRM */}
        <div className="w-full lg:w-80 bg-background-card rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border-light backdrop-blur-sm hover-lift">
          {/* Header do menu */}
          <div className="p-6 border-b border-border-light bg-gradient-to-r from-primary/5 to-secondary/5">
            <h2 id="video-title" className="text-xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m8 6h1a3 3 0 000-6h-1" />
                </svg>
              </div>
              Opções do Vídeo
            </h2>
            <p className="text-text-tertiary text-sm mt-1">Interaja com o conteúdo</p>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {/* Seção de Avaliação */}
            <div className="p-6 border-b border-border-light hover:bg-background-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-yellow/20 to-accent-orange/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-accent-orange" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">Avaliação</h3>
                    <p className="text-sm text-text-tertiary">Avalie este conteúdo</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-accent-yellow hover:text-accent-orange transition-all duration-200 cursor-pointer hover:scale-125"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Seção de Anotações */}
            <div className="p-6 border-b border-border-light hover:bg-background-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-secondary transition-colors duration-200">Anotações</h3>
                    <p className="text-sm text-text-tertiary">Fazer anotações pessoais</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-text-tertiary group-hover:text-secondary transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Seção de Compartilhar */}
            <div className="p-6 border-b border-border-light hover:bg-background-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-green/20 to-secondary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-green transition-colors duration-200">Compartilhar</h3>
                    <p className="text-sm text-text-tertiary">Compartilhar com colegas</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-text-tertiary group-hover:text-accent-green transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Seção de Marcadores */}
            <div className="p-6 border-b border-border-light hover:bg-background-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-accent-purple/20 to-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-purple transition-colors duration-200">Marcadores</h3>
                    <p className="text-sm text-text-tertiary">Salvar momentos importantes</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-text-tertiary group-hover:text-accent-purple transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Seção de Relatório */}
            <div className="p-6 hover:bg-background-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-error/20 to-warning/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.0 04-.833-.77-2.5 1.732-2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary group-hover:text-error transition-colors duration-200">Reportar</h3>
                    <p className="text-sm text-text-tertiary">Reportar problema</p>
                  </div>
                </div>
                <svg className="w-6 h-6 text-text-tertiary group-hover:text-error transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Footer do menu */}
          <div className="p-6 border-t border-border-light bg-gradient-to-r from-background-secondary to-background-tertiary">
            <div className="flex items-center justify-between text-sm text-text-tertiary">
              <span>Qualidade: HD</span>
              <span>Duração: --:--</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
