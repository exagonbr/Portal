'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVideoTime, formatVideoDuration } from '@/utils/date';

interface VideoSource {
  id: string;
  title: string;
  url: string;
  type: 'mp4' | 'youtube' | 'vimeo' | 'direct';
  thumbnail?: string;
  duration?: string;
  description?: string;
  episode_number?: number;
}

interface UniversalVideoPlayerProps {
  videos: VideoSource[];
  initialVideoIndex?: number;
  collectionName?: string;
  sessionNumber?: number;
  onClose: () => void;
  autoplay?: boolean;
}

export default function UniversalVideoPlayer({ 
  videos, 
  initialVideoIndex = 0,
  collectionName,
  sessionNumber,
  onClose,
  autoplay = true
}: UniversalVideoPlayerProps): JSX.Element | null {
  console.log('🎬 UniversalVideoPlayer inicializado com:', {
    videosCount: videos?.length || 0,
    initialVideoIndex,
    collectionName,
    sessionNumber,
    autoplay,
    firstVideoUrl: videos?.[0]?.url,
    firstVideoTitle: videos?.[0]?.title
  })
  
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebars, setShowSidebars] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const currentVideo = videos[currentVideoIndex];
  
  console.log('🎯 Vídeo atual selecionado:', {
    index: currentVideoIndex,
    video: currentVideo ? {
      id: currentVideo.id,
      title: currentVideo.title,
      url: currentVideo.url,
      type: currentVideo.type,
      hasUrl: !!currentVideo.url
    } : null
  })

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle escape key to close player
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, isFullscreen]);

  // Auto-hide controls and UI elements
  useEffect(() => {
    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSidebars(false);
        setShowBottomBar(false);
      }, 3000);
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls]);

  const handleMouseMove = () => {
    setShowControls(true);
    setShowSidebars(true);
    setShowBottomBar(true);
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setIsLoading(true);
    setCurrentTime(0);
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      handleVideoSelect(currentVideoIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      handleVideoSelect(currentVideoIndex + 1);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const enterFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const toggleSidebars = () => {
    setShowSidebars(!showSidebars);
  };

  const toggleBottomBar = () => {
    setShowBottomBar(!showBottomBar);
  };

  const toggleAllUI = () => {
    const newState = !showSidebars || !showBottomBar;
    setShowSidebars(newState);
    setShowBottomBar(newState);
    setShowControls(newState);
  };

  // Usando a função utilitária de formatação de tempo
  const formatTime = formatVideoTime;

  const getVideoSource = (video: VideoSource) => {
    console.log('🎯 getVideoSource chamado para:', {
      id: video.id,
      title: video.title,
      url: video.url,
      type: video.type,
      hasUrl: !!video.url
    })
    
    if (!video.url || !video.url.trim()) {
      console.error('❌ URL do vídeo está vazia:', video)
      return ''
    }
    
    switch (video.type) {
      case 'youtube':
        const youtubeId = extractYouTubeId(video.url);
        const youtubeUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`;
        console.log('🔗 URL YouTube gerada:', youtubeUrl)
        return youtubeUrl;
      case 'vimeo':
        const vimeoId = extractVimeoId(video.url);
        const vimeoUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=${autoplay ? 1 : 0}`;
        console.log('🔗 URL Vimeo gerada:', vimeoUrl)
        return vimeoUrl;
      case 'mp4':
      case 'direct':
      default:
        console.log('🔗 URL direta retornada:', video.url)
        return video.url;
    }
  };

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  const extractVimeoId = (url: string) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : '';
  };

  const renderVideoPlayer = () => {
    if (currentVideo.type === 'youtube' || currentVideo.type === 'vimeo') {
      return (
        <iframe
          key={currentVideo.id}
          title={currentVideo.title}
          src={getVideoSource(currentVideo)}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          onLoad={() => setIsLoading(false)}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        key={currentVideo.id}
        className="w-full h-full object-contain"
        onLoadedData={() => setIsLoading(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleNextVideo}
        autoPlay={autoplay}
        controls={false}
      >
        <source src={getVideoSource(currentVideo)} type="video/mp4" />
        Seu navegador não suporta a reprodução de vídeo.
      </video>
    );
  };

  if (!mounted) {
    return null;
  }
  
  if (!currentVideo) {
    console.error('❌ UniversalVideoPlayer: currentVideo não está definido')
    return null;
  }
  
  if (!currentVideo.url || !currentVideo.url.trim()) {
    console.error('❌ UniversalVideoPlayer: URL do vídeo atual está vazia:', currentVideo)
    return createPortal(
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Erro no Vídeo</h2>
          <p className="text-lg mb-6">URL do vídeo não está disponível.</p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
          >
            Fechar Player
          </button>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] flex bg-black"
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
    >
      {/* Top control bar */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-[100000] transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleAllUI}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/20"
              title={showSidebars && showBottomBar ? 'Ocultar menus (modo cinema)' : 'Mostrar menus'}
            >
              {showSidebars && showBottomBar ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            
            {videos.length > 1 && (
              <button
                onClick={toggleSidebars}
                className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/20"
                title={showSidebars ? 'Ocultar menus laterais' : 'Mostrar menus laterais'}
              >
                {showSidebars ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}
            
            <button
              onClick={toggleBottomBar}
              className="text-white hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/20"
              title={showBottomBar ? 'Ocultar barra inferior' : 'Mostrar barra inferior'}
            >
              {showBottomBar ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>

          {/* Center title */}
          <div className="flex-1 text-center">
            <h1 className="text-white text-lg font-semibold truncate">
              {collectionName || currentVideo.title}
            </h1>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-2"
              aria-label="Fechar player de vídeo"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex w-full h-full">
        {/* Left sidebar - Video list */}
        {videos.length > 1 && (
          <div className={`w-80 bg-gray-900 flex flex-col border-r border-gray-700 transition-transform duration-300 ${
            showSidebars ? 'translate-x-0' : '-translate-x-full'
          }`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white mb-2">
                {collectionName || 'Playlist'}
              </h2>
              <p className="text-gray-400 text-sm">
                {sessionNumber && `Sessão ${sessionNumber} • `}{videos.length} vídeos
              </p>
            </div>
            
            {/* Video list */}
            <div className="flex-1 overflow-y-auto">
              {videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(index)}
                  className={`p-4 border-b border-gray-800 cursor-pointer transition-colors hover:bg-gray-800 ${
                    index === currentVideoIndex ? 'bg-gray-800 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-12 bg-gray-700 rounded overflow-hidden">
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Episode number */}
                      <div className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {video.episode_number || index + 1}
                      </div>
                      
                      {/* Play indicator for current video */}
                      {index === currentVideoIndex && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Video info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium line-clamp-2 mb-1 ${
                        index === currentVideoIndex ? 'text-white' : 'text-gray-300'
                      }`}>
                        {video.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {video.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatVideoDuration(video.duration)}</span>
                          </div>
                        )}
                        <span>Ep. {video.episode_number || index + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col relative">
          {/* Video player */}
          <div className="flex-1 relative bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            
            {renderVideoPlayer()}
            
            {/* Custom controls for MP4 videos */}
            {(currentVideo.type === 'mp4' || currentVideo.type === 'direct') && (
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Progress bar */}
                <div className="mb-4">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                {/* Control buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors"
                      >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                      className="text-white hover:text-gray-300 transition-colors"
                    >
                      <Maximize className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation controls for all video types */}
            {videos.length > 1 && (
              <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black bg-opacity-70 rounded-lg px-4 py-2 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                <button
                  onClick={handlePreviousVideo}
                  disabled={currentVideoIndex === 0}
                  className="flex items-center gap-2 px-3 py-1 text-white disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                
                <span className="text-white text-sm">
                  {currentVideoIndex + 1} de {videos.length}
                </span>
                
                <button
                  onClick={handleNextVideo}
                  disabled={currentVideoIndex === videos.length - 1}
                  className="flex items-center gap-2 px-3 py-1 text-white disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  Próximo
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Video info bar */}
          <div className={`bg-gray-900 p-4 border-t border-gray-700 transition-transform duration-300 ${
            showBottomBar ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{currentVideo.title}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Episódio {currentVideo.episode_number || currentVideoIndex + 1}
                  {sessionNumber && ` • Sessão ${sessionNumber}`}
                </p>
                {currentVideo.description && (
                  <p className="text-gray-300 text-sm line-clamp-2">{currentVideo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {currentVideo.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatVideoDuration(currentVideo.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Options menu */}
        <div className={`w-80 bg-gray-900 flex flex-col border-l border-gray-700 transition-transform duration-300 ${
          showSidebars ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Opções do Vídeo</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {/* Avaliação */}
            <div className="p-6 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Avaliação</h3>
                  <p className="text-sm text-gray-400">Avalie este conteúdo</p>
                </div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Última Nota */}
            <div className="p-6 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Última Nota</h3>
                  <p className="text-sm text-gray-400">Sua última avaliação</p>
                </div>
                <div className="text-2xl font-bold text-green-400">8.5</div>
              </div>
            </div>

            {/* Anotações */}
            <div className="p-6 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Anotações</h3>
                  <p className="text-sm text-gray-400">Fazer anotações</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>

            {/* Material Complementar */}
            <div className="p-6 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Material Complementar</h3>
                  <p className="text-sm text-gray-400">Baixar PDFs e recursos</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>

            {/* Discussão */}
            <div className="p-6 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Discussão</h3>
                  <p className="text-sm text-gray-400">Participar do fórum</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>

            {/* Certificado */}
            <div className="p-6 hover:bg-gray-800 transition-colors cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Certificado</h3>
                  <p className="text-sm text-gray-400">Baixar certificado</p>
                </div>
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}