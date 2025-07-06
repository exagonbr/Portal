'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, Settings, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatVideoTime, formatVideoDuration } from '@/utils/date';
import { useAuth } from '@/hooks/useAuth';
import { trackVideoProgress, getVideoStatus, startVideoSession } from '@/services/viewingStatusService';

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
  const [isMobile, setIsMobile] = useState(false);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

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

  const { user } = useAuth();
  const progressTrackingInterval = useRef<NodeJS.Timeout | null>(null);
  const lastProgressUpdate = useRef<number>(0);
  const totalDurationRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for our shortcuts
      switch (e.key) {
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'h':
        case 'H':
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            toggleAllUI();
          }
          break;
        case 's':
        case 'S':
          if (!e.ctrlKey && !e.altKey && !e.metaKey && videos.length > 1) {
            e.preventDefault();
            toggleSidebars();
          }
          break;
        case 'b':
        case 'B':
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            toggleBottomBar();
          }
          break;
        case ' ':
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            togglePlayPause();
          }
          break;
        case 'ArrowLeft':
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            handlePreviousVideo();
          }
          break;
        case 'ArrowRight':
          if (!e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            handleNextVideo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFullscreen, showSidebars, showBottomBar, videos.length]);

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
    
    // No modo cinema, não mostrar automaticamente as barras laterais e inferior
    if (!isCinemaMode) {
      setShowSidebars(true);
      setShowBottomBar(true);
    }
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
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    
    // Registrar a interação de busca
    trackProgress();
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
    const newCinemaMode = !isCinemaMode;
    setIsCinemaMode(newCinemaMode);
    
    // No modo cinema, ocultar barras laterais e inferior
    if (newCinemaMode) {
      setShowSidebars(false);
      setShowBottomBar(false);
    } else {
      // Sair do modo cinema
      setShowSidebars(true);
      setShowBottomBar(true);
    }
    
    // Mostrar controles brevemente
    setShowControls(true);
    
    // Ocultar controles após um tempo
    if (newCinemaMode) {
      setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
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
      console.log('❌ URL do vídeo está vazia:', video)
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
          className="w-full h-full object-contain"
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

  // Efeito para detectar dispositivos móveis
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = typeof window.navigator === 'undefined' ? '' : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
      );
      setIsMobile(mobile);
      
      // Em dispositivos móveis, iniciar com barras laterais ocultas
      if (mobile) {
        setShowSidebars(false);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Efeito para ajustar o layout em telas menores
  useEffect(() => {
    const handleResize = () => {
      // Em telas menores, ocultar barras laterais automaticamente
      if (window.innerWidth < 768) {
        setShowSidebars(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adicionar useEffect para aplicar estilos CSS personalizados
  useEffect(() => {
    // Adicionar estilos CSS para animações e transições suaves
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Estilos para o player de vídeo */
      .video-container {
        transition: all 0.3s ease-in-out;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
      }
      
      .video-container video,
      .video-container iframe {
        width: 100%;
        height: 100%;
        object-fit: contain;
        transition: all 0.3s ease-in-out;
        max-height: 100%;
      }
      
      /* Modo cinema - quando as barras estão ocultas */
      .cinema-mode .video-container {
        padding: 0;
      }
      
      .cinema-mode-container {
        transition: all 0.5s ease-in-out;
      }
      
      .cinema-mode-container video,
      .cinema-mode-container iframe {
        object-fit: contain;
        max-height: 100vh;
        max-width: 100%;
        transition: all 0.5s ease-in-out;
      }
      
      /* Melhorias para controles de vídeo */
      input[type="range"].slider {
        -webkit-appearance: none;
        height: 5px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.3);
        outline: none;
      }
      
      input[type="range"].slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 15px;
        height: 15px;
        border-radius: 50%;
        background: #ffffff;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      input[type="range"].slider::-webkit-slider-thumb:hover {
        transform: scale(1.2);
      }
      
      /* Animações para botões e controles */
      .control-button {
        transition: all 0.2s ease;
      }
      
      .control-button:hover {
        transform: scale(1.1);
        background-color: rgba(255, 255, 255, 0.1);
      }
      
      /* Animação de fade para os controles */
      .fade-controls {
        transition: opacity 0.3s ease;
      }
      
      /* Estilos responsivos para dispositivos móveis */
      @media (max-width: 640px) {
        .video-controls {
          padding: 8px;
        }
        
        .video-title {
          font-size: 14px;
        }
      }
      
      /* Ajuste para tela cheia */
      .player-fullscreen video,
      .player-fullscreen iframe {
        object-fit: contain;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Adicionar efeito para ajustar o tamanho do vídeo quando os menus são retraídos
  useEffect(() => {
    // Ajustar o tamanho do vídeo quando os menus são retraídos
    const adjustVideoSize = () => {
      if (videoRef.current) {
        if (!showSidebars && !showBottomBar) {
          // Modo cinema - vídeo em tela cheia
          videoRef.current.style.maxWidth = '100%';
          videoRef.current.style.maxHeight = '100vh';
        } else {
          // Modo normal
          videoRef.current.style.maxWidth = '';
          videoRef.current.style.maxHeight = '';
        }
      }
    };
    
    adjustVideoSize();
  }, [showSidebars, showBottomBar]);

  // Adicionar efeito para ajustar o vídeo quando o modo cinema é alterado
  useEffect(() => {
    // Ajustar o vídeo quando o modo cinema é alterado
    const adjustVideoForCinemaMode = () => {
      const videoContainer = document.querySelector('.video-container');
      if (videoContainer) {
        if (isCinemaMode) {
          videoContainer.classList.add('cinema-mode-container');
        } else {
          videoContainer.classList.remove('cinema-mode-container');
        }
      }
    };
    
    adjustVideoForCinemaMode();
  }, [isCinemaMode]);

  // Função para rastrear o progresso do vídeo
  const trackProgress = async () => {
    if (!user || !videoRef.current) return;
    
    const currentVideo = videos[currentVideoIndex];
    if (!currentVideo) return;
    
    const videoId = parseInt(currentVideo.id);
    if (isNaN(videoId)) return;
    
    const currentTime = Math.floor(videoRef.current.currentTime);
    const totalDuration = Math.floor(videoRef.current.duration);
    totalDurationRef.current = totalDuration;
    
    // Evitar atualizações muito frequentes (a cada 5 segundos ou quando avançar mais de 10 segundos)
    if (
      currentTime - lastProgressUpdate.current >= 10 || 
      Date.now() - lastProgressUpdate.current >= 5000
    ) {
      try {
        await trackVideoProgress({
          videoId,
          currentPlayTime: currentTime,
          totalDuration,
          tvShowId: sessionNumber ? parseInt(sessionNumber.toString()) : undefined,
          contentType: sessionNumber ? 'tv_show' : 'video',
          contentId: sessionNumber ? parseInt(sessionNumber.toString()) : videoId,
          quality: selectedQuality,
          playbackSpeed: playbackSpeed
        });
        
        lastProgressUpdate.current = currentTime;
      } catch (error) {
        console.error('Erro ao rastrear progresso do vídeo:', error);
      }
    }
  };
  
  // Iniciar rastreamento de progresso
  useEffect(() => {
    if (videoRef.current && user) {
      // Rastrear progresso a cada 5 segundos
      progressTrackingInterval.current = setInterval(trackProgress, 5000);
      
      // Também rastrear em eventos importantes
      const handleTimeUpdate = () => {
        trackProgress();
      };
      
      const handleEnded = () => {
        trackProgress();
      };
      
      videoRef.current.addEventListener('ended', handleEnded);
      videoRef.current.addEventListener('pause', handleTimeUpdate);
      
      return () => {
        if (progressTrackingInterval.current) {
          clearInterval(progressTrackingInterval.current);
        }
        
        if (videoRef.current) {
          videoRef.current.removeEventListener('ended', handleEnded);
          videoRef.current.removeEventListener('pause', handleTimeUpdate);
        }
      };
    }
  }, [currentVideoIndex, user]);
  
  // Quando o vídeo terminar, registrar como concluído
  const handleVideoEnd = () => {
    if (!videoRef.current) return;
    
    // Registrar o vídeo como concluído
    trackProgress();
    
    // Reproduzir o próximo vídeo se existir
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // Carregar o progresso anterior do vídeo
  useEffect(() => {
    const loadVideoProgress = async () => {
      if (!user || !videos[currentVideoIndex]) return;
      
      const videoId = parseInt(videos[currentVideoIndex].id);
      if (isNaN(videoId)) return;
      
      try {
        // Iniciar uma nova sessão de visualização
        await startVideoSession(
          videoId, 
          sessionNumber ? parseInt(sessionNumber.toString()) : undefined
        );
        
        // Carregar o progresso anterior
        const status = await getVideoStatus(
          videoId, 
          sessionNumber ? parseInt(sessionNumber.toString()) : undefined
        );
        
        if (status && status.currentPlayTime > 0 && videoRef.current) {
          // Se o vídeo já foi assistido mais de 95%, começar do início
          if (status.completionPercentage >= 95) {
            videoRef.current.currentTime = 0;
          } 
          // Caso contrário, continuar de onde parou
          else {
            videoRef.current.currentTime = status.currentPlayTime;
            setCurrentTime(status.currentPlayTime);
          }
          
          // Mostrar mensagem de continuação
          if (status.currentPlayTime > 0 && status.completionPercentage < 95) {
            setShowMessage(true);
            setMessage(`Continuando de ${formatVideoTime(status.currentPlayTime)}`);
            
            // Esconder a mensagem após 3 segundos
            setTimeout(() => {
              setShowMessage(false);
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar progresso do vídeo:', error);
      }
    };
    
    loadVideoProgress();
  }, [currentVideoIndex, user]);

  if (!mounted) {
    return null;
  }
  
  if (!currentVideo) {
    console.log('❌ UniversalVideoPlayer: currentVideo não está definido')
    return null;
  }
  
  if (!currentVideo.url || !currentVideo.url.trim()) {
    console.log('❌ UniversalVideoPlayer: URL do vídeo atual está vazia:', currentVideo)
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
      className={`fixed inset-0 z-[99999] flex bg-black ${isFullscreen ? 'player-fullscreen' : ''} ${isCinemaMode ? 'cinema-mode' : ''}`}
      onMouseMove={handleMouseMove}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-title"
    >
      {/* Top control bar */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-[100000] fade-controls ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={toggleAllUI}
              className="text-white hover:text-gray-300 transition-colors p-1 md:p-2 rounded-full hover:bg-white/20"
              title={isCinemaMode ? 'Sair do modo cinema' : 'Modo cinema (ocultar menus)'}
            >
              {isCinemaMode ? (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            
            {videos.length > 1 && !isMobile && (
              <button
                onClick={toggleSidebars}
                className="text-white hover:text-gray-300 transition-colors p-1 md:p-2 rounded-full hover:bg-white/20 hidden sm:block"
                title={showSidebars ? 'Ocultar menus laterais' : 'Mostrar menus laterais'}
              >
                {showSidebars ? (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}
            
            <button
              onClick={toggleBottomBar}
              className="text-white hover:text-gray-300 transition-colors p-1 md:p-2 rounded-full hover:bg-white/20 hidden sm:block"
              title={showBottomBar ? 'Ocultar barra inferior' : 'Mostrar barra inferior'}
            >
              {showBottomBar ? (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
            </button>
          </div>

          {/* Center title */}
          <div className="flex-1 text-center px-2">
            <h1 className="text-white text-sm md:text-lg font-semibold truncate">
              {collectionName || currentVideo.title}
            </h1>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white rounded-full p-1 md:p-2"
              aria-label="Fechar player de vídeo"
            >
              <svg
                className="w-6 h-6 md:w-8 md:h-8"
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
      <div className="flex w-full h-full overflow-hidden">
        {/* Left sidebar - Video list */}
        {videos.length > 1 && (
          <div className={`${isMobile ? 'w-full' : 'w-72 md:w-80'} bg-gray-900 flex flex-col border-r border-gray-700 transition-all duration-300 ease-in-out ${
            showSidebars 
              ? 'translate-x-0 flex-shrink-0' 
              : isMobile 
                ? '-translate-x-full absolute inset-0 z-[100001]' 
                : '-translate-x-full w-0 absolute left-0 top-0 bottom-0'
          }`}>
            {/* Header com botão de fechar para mobile */}
            <div className="p-4 md:p-6 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">
                  {collectionName || 'Playlist'}
                </h2>
                <p className="text-gray-400 text-xs md:text-sm">
                  {sessionNumber && `Sessão ${sessionNumber} • `}{videos.length} vídeos
                </p>
              </div>
              
              {isMobile && (
                <button 
                  onClick={toggleSidebars}
                  className="text-white p-2 hover:bg-gray-800 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
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
        <div className={`flex-1 flex flex-col relative transition-all duration-300 ease-in-out`}>
          {/* Video player */}
          <div className={`flex-1 relative bg-black transition-all duration-300 ease-in-out ${
            !showBottomBar ? 'h-full' : ''
          }`}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center video-container">
              {renderVideoPlayer()}
            </div>
            
            {/* Mensagem de continuação */}
            {showMessage && (
              <div className="absolute top-4 left-0 right-0 flex justify-center">
                <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg shadow-lg">
                  {message}
                </div>
              </div>
            )}
            
            {/* Custom controls for MP4 videos */}
            {(currentVideo.type === 'mp4' || currentVideo.type === 'direct') && (
              <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:p-4 video-controls fade-controls ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                {/* Progress bar */}
                <div className="mb-2 md:mb-4">
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
                  <div className="flex items-center gap-2 md:gap-4">
                    <button
                      onClick={togglePlayPause}
                      className="text-white hover:text-gray-300 transition-colors control-button"
                    >
                      {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" /> : <Play className="w-5 h-5 md:w-6 md:h-6" />}
                    </button>
                    
                    <div className="flex items-center gap-1 md:gap-2">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-gray-300 transition-colors control-button"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-12 md:w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>
                    
                    <span className="text-white text-xs md:text-sm hidden xs:inline-block">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                      className="text-white hover:text-gray-300 transition-colors control-button"
                    >
                      <Maximize className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation controls for all video types */}
            {videos.length > 1 && (
              <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-black bg-opacity-70 rounded-lg px-2 md:px-4 py-1 md:py-2 fade-controls ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}>
                <button
                  onClick={handlePreviousVideo}
                  disabled={currentVideoIndex === 0}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-white disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 rounded transition-colors control-button"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden xs:inline">Anterior</span>
                </button>
                
                <span className="text-white text-xs md:text-sm">
                  {currentVideoIndex + 1} de {videos.length}
                </span>
                
                <button
                  onClick={handleNextVideo}
                  disabled={currentVideoIndex === videos.length - 1}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 text-white disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-white hover:bg-opacity-20 rounded transition-colors control-button"
                >
                  <span className="hidden xs:inline">Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Video info bar */}
          <div className={`bg-gray-900 border-t border-gray-700 transition-all duration-300 ease-in-out ${
            showBottomBar ? 'p-3 md:p-4 max-h-[20vh] md:max-h-[30%] overflow-y-auto' : 'max-h-0 overflow-hidden p-0'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-base md:text-lg font-semibold text-white mb-1 line-clamp-1">{currentVideo.title}</h3>
                <p className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
                  Episódio {currentVideo.episode_number || currentVideoIndex + 1}
                  {sessionNumber && ` • Sessão ${sessionNumber}`}
                </p>
                {currentVideo.description && (
                  <p className="text-gray-300 text-xs md:text-sm line-clamp-2">{currentVideo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400 ml-2 flex-shrink-0">
                {currentVideo.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span>{formatVideoDuration(currentVideo.duration)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - Options menu */}
        <div className={`${isMobile ? 'w-full' : 'w-72 md:w-80'} bg-gray-900 flex flex-col border-l border-gray-700 transition-all duration-300 ease-in-out ${
          showSidebars 
            ? 'translate-x-0 flex-shrink-0' 
            : isMobile 
              ? 'translate-x-full absolute inset-0 z-[100001]' 
              : 'translate-x-full w-0 absolute right-0 top-0 bottom-0'
        }`}>
          {/* Header com botão de fechar para mobile */}
          <div className="p-4 md:p-6 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-white">Opções do Vídeo</h2>
            
            {isMobile && (
              <button 
                onClick={toggleSidebars}
                className="text-white p-2 hover:bg-gray-800 rounded-full"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
            <div className="p-6 border-b border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer">
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

            {/* Atalhos do Teclado */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Atalhos do Teclado</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Alternar todos os menus</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">H</kbd>
                </div>
                {videos.length > 1 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Alternar menus laterais</span>
                    <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">S</kbd>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Alternar barra inferior</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">B</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Play/Pause</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">Espaço</kbd>
                </div>
                {videos.length > 1 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Vídeo anterior</span>
                      <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">←</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Próximo vídeo</span>
                      <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">→</kbd>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fechar player</span>
                  <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botão de modo cinema para dispositivos móveis */}
      {isMobile && (
        <button
          onClick={toggleAllUI}
          className={`fixed right-4 bottom-20 z-[100001] bg-blue-500 text-white p-3 rounded-full shadow-lg control-button ${
            isCinemaMode ? 'bg-yellow-500' : ''
          }`}
          aria-label={isCinemaMode ? 'Sair do modo cinema' : 'Modo cinema'}
        >
          {isCinemaMode ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      )}
      
      {/* Botões flutuantes para dispositivos móveis */}
      {isMobile && !showSidebars && videos.length > 1 && (
        <button
          onClick={toggleSidebars}
          className="fixed left-4 bottom-20 z-[100001] bg-blue-500 text-white p-3 rounded-full shadow-lg control-button"
          aria-label="Mostrar lista de vídeos"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}
    </div>,
    document.body
  );
}