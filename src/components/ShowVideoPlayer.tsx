'use client';

import React from 'react';
import { useVideosByShow } from '@/hooks/useVideosByShow';
import UniversalVideoPlayer from './UniversalVideoPlayer';

interface ShowVideoPlayerProps {
  showId: number | string;
  collectionName?: string;
  initialVideoIndex?: number;
  onClose: () => void;
}

export default function ShowVideoPlayer({ 
  showId, 
  collectionName,
  initialVideoIndex = 0,
  onClose 
}: ShowVideoPlayerProps): JSX.Element | null {
  
  const { videos, loading, error } = useVideosByShow(showId);

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando vídeos...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-white text-xl font-bold mb-2">Erro ao carregar vídeos</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!videos || videos.length === 0) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-gray-400 text-6xl mb-4">📹</div>
          <h2 className="text-white text-xl font-bold mb-2">Nenhum vídeo encontrado</h2>
          <p className="text-gray-300 mb-4">Esta coleção ainda não possui vídeos disponíveis.</p>
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <UniversalVideoPlayer
      videos={videos}
      initialVideoIndex={initialVideoIndex}
      collectionName={collectionName || 'Coleção de Vídeos'}
      onClose={onClose}
      autoplay={true}
    />
  );
}