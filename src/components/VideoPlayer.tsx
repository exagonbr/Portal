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
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-text-primary/80 backdrop-blur-md p-4 sm:p-8" // Adjusted padding for smaller screens
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title" // Assuming video title might be added later
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:text-secondary-light z-[100000]
                 transition-all duration-200 transform hover:scale-110 focus:outline-none
                 focus:ring-2 focus:ring-white rounded-full p-2 bg-black/30 hover:bg-black/50"
        aria-label="Close video player"
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

      {/* Main container with video and side menu */}
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl h-[90vh] lg:h-[80vh]"> {/* Adjusted height for responsiveness */}
        {/* Video container with loading state */}
        <div className="relative flex-1 bg-black rounded-xl overflow-hidden shadow-2xl border border-border-dark/50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-light"></div>
            </div>
          )}
          <iframe
            id="video-player"
            title="Video player" // It's good practice to have a more descriptive title if possible
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            onLoad={() => setIsLoading(false)}
          />
        </div>

        {/* Side menu - consider making this collapsible on smaller screens or optional */}
        <div className="w-full lg:w-80 bg-background-secondary rounded-xl shadow-2xl overflow-hidden flex flex-col border border-border-DEFAULT">
          <div className="p-4 sm:p-6 border-b border-border-light">
            <h2 id="video-title" className="text-lg sm:text-xl font-bold text-text-primary">Opções do Vídeo</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Example items - replace with actual functionality */}
            <div className="p-4 sm:p-6 border-b border-border-light hover:bg-background-tertiary transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md sm:text-lg font-semibold text-text-primary mb-1">Avaliação</h3>
                  <p className="text-xs sm:text-sm text-text-tertiary">Avalie este conteúdo</p>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-accent-yellow-DEFAULT hover:text-accent-yellow-dark transition-transform cursor-pointer"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 border-b border-border-light hover:bg-background-tertiary transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md sm:text-lg font-semibold text-text-primary mb-1">Anotações</h3>
                  <p className="text-xs sm:text-sm text-text-tertiary">Fazer anotações</p>
                </div>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
             {/* Add more options as needed */}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
