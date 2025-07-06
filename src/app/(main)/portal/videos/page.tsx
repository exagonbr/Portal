'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { carouselVideoImages } from '@/constants/mockData';
import { api } from '@/lib/api';
import { getWatchHistory } from '@/services/viewingStatusService';
import { TVShowCollection, TVShowVideo } from '@/types/collections';
import UniversalVideoPlayer from '@/components/UniversalVideoPlayer';
import { suppressHydrationWarnings } from '@/utils/suppressHydrationWarnings';
import { UnifiedAuthService } from '@/services/unifiedAuthService';

// Interface para os dados de visualização
interface ViewingStatus {
  id: number;
  video_id: string;
  tv_show_id?: string;
  current_play_time: number;
  completion_percentage?: number;
  completed?: boolean;
  last_watched_at?: string;
  content_type?: string;
  video?: {
    id: number;
    title: string;
    thumbnail_url?: string;
    duration?: string;
    tv_show_id?: number;
  };
  tv_show?: {
    id: number;
    name: string;
    poster_image_url?: string;
    backdrop_image_url?: string;
  };
}

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen bg-black">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

// Netflix-style Hero Section
const HeroSection = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const featuredVideos = carouselVideoImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentVideo((prev) => (prev + 1) % featuredVideos.length);
        setIsTransitioning(false);
      }, 500);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredVideos.length]);

  const current = featuredVideos[currentVideo];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Video/Image with smooth transitions */}
      <div className="absolute inset-0">
        {featuredVideos.map((video, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentVideo 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            <img
              src={video.src}
              alt={video.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        
        {/* Enhanced gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        
        {/* Bottom fade shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
        
        {/* Side shadows for depth */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-gray-900/50 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-gray-900/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="px-20 max-w-5xl">
          <div className={`transition-all duration-700 ease-out ${
            isTransitioning ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'
          }`}>
            <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-2xl">
              {current.title}
            </h1>
            <p className="text-lg text-gray-200 mb-8 line-clamp-3 leading-relaxed max-w-3xl drop-shadow-lg">
              Explore conteúdo educacional de alta qualidade. Aprenda com os melhores professores e desenvolva novas habilidades no seu próprio ritmo.
            </p>
            
            {/* Buttons */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-3 px-8 py-3 bg-white text-black rounded hover:bg-gray-200 transition-all duration-300 text-lg font-semibold shadow-2xl hover:shadow-white/20 hover:scale-105">
                <PlayIcon className="w-6 h-6" />
                Assistir
              </button>
              <button className="flex items-center gap-3 px-8 py-3 bg-gray-500/70 text-white rounded hover:bg-gray-500/50 transition-all duration-300 text-lg font-semibold backdrop-blur-sm shadow-xl hover:shadow-gray-500/20 hover:scale-105">
                <InformationCircleIcon className="w-6 h-6" />
                Mais informações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {featuredVideos.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentVideo(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentVideo 
                ? 'bg-white scale-125 shadow-lg' 
                : 'bg-white/50 hover:bg-white/80 hover:scale-110'
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentVideo((prev) => prev === 0 ? featuredVideos.length - 1 : prev - 1);
            setIsTransitioning(false);
          }, 300);
        }}
        className="absolute left-8 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm z-10"
      >
        <ChevronLeftIcon className="w-8 h-8 text-white" />
      </button>

      <button
        onClick={() => {
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentVideo((prev) => (prev + 1) % featuredVideos.length);
            setIsTransitioning(false);
          }, 300);
        }}
        className="absolute right-8 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 backdrop-blur-sm z-10"
      >
        <ChevronRightIcon className="w-8 h-8 text-white" />
      </button>
    </div>
  );
};

// Netflix-style Video Card
const NetflixVideoCard = ({ video, onPlay }: { video: any, onPlay?: () => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Verificar se o vídeo é válido
  if (!video || typeof video !== 'object') {
    return (
      <div className="h-full bg-gray-800 rounded-lg overflow-hidden shadow-lg p-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-400 text-sm text-center">Vídeo indisponível</p>
      </div>
    );
  }
  
  const progressPercentage = video.progress || video.completion_percentage || 0;

  return (
    <div
      className="relative group cursor-pointer h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onPlay}
    >
      <div className={`relative transition-all duration-300 h-full ${isHovered ? 'scale-105 z-50' : 'scale-100'}`}>
        {/* Card Container with fixed dimensions */}
        <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col shadow-lg">
          {/* Thumbnail with fixed aspect ratio */}
          <div className="relative w-full h-44 bg-gray-700 flex-shrink-0">
            <img
              src={video.thumbnail_url || 
                   (video.tv_show?.poster_image_url || video.tv_show?.backdrop_image_url) || 
                   (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg` : '')}
              alt={video.title || 'Vídeo'}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.src = '/placeholder-collection.jpg';
              }}
            />
            
            {/* Progress Bar */}
            {progressPercentage > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-600">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            {/* Play Button on Hover */}
            {isHovered && (
              <div 
                className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
              >
                <PlayIcon className="w-12 h-12 text-white" />
              </div>
            )}
          </div>

          {/* Video Info - Increased height and better spacing */}
          <div className="p-5 flex-grow flex flex-col justify-between min-h-[160px]">
            <h3 className="text-white font-medium text-sm mb-4 line-clamp-2 leading-tight">
              {video.title || 'Vídeo sem título'}
            </h3>
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400 font-bold text-sm bg-green-400/20 px-3 py-1.5 rounded-md border border-green-400/30">
                  ✓ Educacional
                </span>
                {progressPercentage > 0 && (
                  <span className="text-gray-300 bg-gray-700 px-3 py-1.5 rounded-md font-medium">
                    {Math.round(progressPercentage)}%
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span className="font-medium">{video.duration || '00:00'}</span>
                <span className="text-gray-500">HD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Netflix-style Carousel Row
const CarouselRow = ({ title, videos, onPlayVideo }: { title: string; videos: any[]; onPlayVideo?: (video: any) => void }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

  // Verificar se videos é um array válido
  const validVideos = Array.isArray(videos) ? videos.filter(video => video && typeof video === 'object') : [];
  
  // Se não houver vídeos válidos, não renderizar o carrossel
  if (validVideos.length === 0) {
    return null;
  }

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Auto scroll functionality
  const startAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    
    autoScrollRef.current = setInterval(() => {
      if (!isHovered && scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        // If at the end, scroll back to beginning
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Continue scrolling right
          scroll('right');
        }
      }
    }, 4000); // Auto scroll every 4 seconds
  };

  const stopAutoScroll = () => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = null;
    }
  };

  // Start auto scroll on mount
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    stopAutoScroll();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startAutoScroll();
  };

  return (
    <div 
      className="relative group mb-16"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <h2 className="text-2xl font-semibold text-white mb-8 px-12">{title}</h2>
      
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 z-[60] w-10 h-16 bg-black/80 hover:bg-black/95 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md shadow-lg"
          style={{ top: 'calc(50% + 16px)' }}
        >
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Videos Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-12 pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {validVideos.map((video) => (
          <div key={video.id || Math.random().toString(36).substring(7)} className="flex-shrink-0 w-80 h-80">
            <NetflixVideoCard 
              video={video} 
              onPlay={() => onPlayVideo && onPlayVideo(video)}
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 z-[60] w-10 h-16 bg-black/80 hover:bg-black/95 transition-all duration-200 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md shadow-lg"
          style={{ top: 'calc(50% + 16px)' }}
        >
          <ChevronRightIcon className="w-6 h-6 text-white" />
        </button>
      )}
    </div>
  );
};

export default function VideoPortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tvShows, setTvShows] = useState<TVShowCollection[]>([]);
  const [continueWatching, setContinueWatching] = useState<ViewingStatus[]>([]);
  const [popularShows, setPopularShows] = useState<TVShowCollection[]>([]);
  const [recentReleases, setRecentReleases] = useState<TVShowCollection[]>([]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [currentVideoCollection, setCurrentVideoCollection] = useState<string>('');

  // Carregar dados das coleções
  const loadTvShows = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('Token de autenticação não encontrado');
        return;
      }

      console.log('🔍 Carregando coleções de vídeos...');
      
      const response = await fetch('/api/tv-shows?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.tvShows) {
          console.log(`✅ ${data.data.tvShows.length} coleções carregadas com sucesso`);
          
          // Processar coleções para garantir URLs de imagens
          const processedShows = data.data.tvShows.map((show: TVShowCollection) => {
            // Verificar e ajustar URLs de imagens
            if (!show.poster_image_url && show.poster_path) {
              show.poster_image_url = show.poster_path.startsWith('http') 
                ? show.poster_path 
                : `/api/images/${show.poster_path}`;
            }
            
            if (!show.backdrop_image_url && show.backdrop_path) {
              show.backdrop_image_url = show.backdrop_path.startsWith('http') 
                ? show.backdrop_path 
                : `/api/images/${show.backdrop_path}`;
            }
            
            return show;
          });
          
          setTvShows(processedShows);
          
          // Ordenar por popularidade para os shows populares
          const popular = [...processedShows]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 10);
          setPopularShows(popular);
          
          // Ordenar por data para lançamentos recentes
          const recent = [...processedShows]
            .sort((a, b) => new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime())
            .slice(0, 10);
          setRecentReleases(recent);
          
          console.log('📊 Dados processados: ', {
            total: processedShows.length,
            popular: popular.length,
            recent: recent.length
          });
        }
      } else {
        console.error('❌ Erro ao carregar coleções:', response.status);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar coleções:', error);
    }
  };

  // Carregar histórico de visualização (Continue assistindo)
  const loadWatchHistory = async () => {
    try {
      console.log('🔍 Tentando carregar histórico de visualização...');
      
      // Tentar carregar o histórico de visualização
      try {
        const result = await getWatchHistory(10, 0, false);
        if (result && result.items) {
          console.log(`✅ Histórico de visualização carregado: ${result.items.length} itens`);
          setContinueWatching(result.items);
          return;
        }
      } catch (apiError) {
        console.error('❌ Erro na API de histórico:', apiError);
        // Continuar para o fallback
      }
      
      // Fallback: usar dados mockados
      console.log('⚠️ Usando dados mockados para o histórico de visualização');
      setContinueWatching([]);
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico de visualização:', error);
      setContinueWatching([]);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    // Suprimir avisos de hidratação
    suppressHydrationWarnings();
    
    // Inicializar autenticação
    initializeAuth();
    
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else {
        const loadData = async () => {
          try {
            console.log('🔄 Carregando dados iniciais...');
            
            // Usar Promise.allSettled para garantir que um erro em uma promessa não afete as outras
            const results = await Promise.allSettled([
              loadTvShows(),
              loadWatchHistory()
            ]);
            
            // Verificar resultados
            results.forEach((result, index) => {
              if (result.status === 'rejected') {
                console.error(`❌ Erro ao carregar dados (promessa ${index}):`, result.reason);
              }
            });
            
            console.log('✅ Carregamento de dados concluído');
          } catch (error) {
            console.error('❌ Erro geral ao carregar dados:', error);
          } finally {
            setIsLoading(false);
          }
        };
        
        loadData();
      }
    }
  }, [user, loading, router]);

  // Inicializar autenticação
  const initializeAuth = () => {
    try {
      // Sincronizar storages (localStorage, cookies)
      UnifiedAuthService.syncStorages();
      
      // Verificar se há token válido
      const token = UnifiedAuthService.getAccessToken();
      if (token) {
        console.log('✅ Token encontrado no UnifiedAuthService');
      } else {
        console.warn('⚠️ Nenhum token encontrado no UnifiedAuthService');
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
    }
  };

  // Effect para fazer a página completamente fullscreen (sobre header e sidebar)
  useEffect(() => {
    // Hide sidebar and header
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    const sidebarContainer = document.querySelector('[class*="sidebar"]');
    
    if (sidebar) {
      (sidebar as HTMLElement).style.display = 'none';
    }
    if (header) {
      (header as HTMLElement).style.display = 'none';
    }
    if (sidebarContainer) {
      (sidebarContainer as HTMLElement).style.display = 'none';
    }

    // Force body to be fullscreen
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';
    document.body.style.padding = '0';

    // Get all possible parent containers and make them fullscreen
    const selectors = [
      'main',
      '[class*="dashboard"]',
      '[class*="page"]',
      '[class*="content"]',
      '[class*="container"]',
      'body > div',
      '#__next',
      '#__next > div'
    ];

    const elements = selectors.map(selector => document.querySelector(selector)).filter(Boolean) as HTMLElement[];
    
    // Store original styles
    const originalStyles = elements.map(el => ({
      element: el,
      padding: el.style.padding,
      margin: el.style.margin,
      marginLeft: el.style.marginLeft,
      marginTop: el.style.marginTop,
      maxWidth: el.style.maxWidth,
      width: el.style.width,
      height: el.style.height,
      position: el.style.position,
      top: el.style.top,
      left: el.style.left
    }));

    // Apply fullscreen styles
    elements.forEach(el => {
      el.style.padding = '0';
      el.style.margin = '0';
      el.style.marginLeft = '0';
      el.style.marginTop = '0';
      el.style.maxWidth = 'none';
      el.style.width = '100vw';
      el.style.height = '100vh';
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
    });

    // Cleanup
    return () => {
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
      if (header) {
        (header as HTMLElement).style.display = '';
      }
      if (sidebarContainer) {
        (sidebarContainer as HTMLElement).style.display = '';
      }
      
      document.body.style.overflow = '';
      document.body.style.margin = '';
      document.body.style.padding = '';
      
      originalStyles.forEach(({ element, padding, margin, marginLeft, marginTop, maxWidth, width, height, position, top, left }) => {
        element.style.padding = padding;
        element.style.margin = margin;
        element.style.marginLeft = marginLeft;
        element.style.marginTop = marginTop;
        element.style.maxWidth = maxWidth;
        element.style.width = width;
        element.style.height = height;
        element.style.position = position;
        element.style.top = top;
        element.style.left = left;
      });
    };
  }, []);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Função para reproduzir um vídeo
  const handlePlayVideo = (video: any) => {
    console.log('🎬 Iniciando reprodução do vídeo:', {
      id: video.id,
      title: video.title,
      hasUrl: !!video.video_url,
      hasTvShow: !!video.tv_show
    });
    
    // Verificar se o vídeo possui URL
    if (!video.video_url) {
      console.log('⚠️ Vídeo sem URL, tentando buscar URL alternativa');
      // Aqui poderia implementar lógica para buscar URL do vídeo se necessário
    }
    
    // Definir nome da coleção
    const collectionName = video.tv_show?.name || 'Vídeo Educacional';
    console.log('📺 Reproduzindo vídeo da coleção:', collectionName);
    
    // Configurar player
    setCurrentVideo(video);
    setCurrentVideoCollection(collectionName);
    setShowPlayer(true);
  };

  // Função para fechar o player
  const handleClosePlayer = () => {
    setShowPlayer(false);
    setCurrentVideo(null);
  };

  // Agrupar coleções por categoria
  const groupByCategory = (collections: TVShowCollection[]) => {
    const categories: Record<string, TVShowCollection[]> = {};
    
    collections.forEach(show => {
      // Usar o produtor como categoria, ou "Geral" se não houver
      const category = show.producer || 'Geral';
      
      if (!categories[category]) {
        categories[category] = [];
      }
      
      categories[category].push(show);
    });
    
    return Object.entries(categories);
  };

  const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    // Verificar todas as possíveis fontes de token
    const possibleKeys = [
      'accessToken',
      'authToken',
      'auth_token',
      'token',
      'jwt',
      'bearerToken'
    ];
    
    // Verificar em localStorage
    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value && value.length > 10) {
        return value;
      }
    }
    
    // Verificar em sessionStorage
    for (const key of possibleKeys) {
      const value = sessionStorage.getItem(key);
      if (value && value.length > 10) {
        return value;
      }
    }
    
    // Verificar cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (possibleKeys.includes(name)) {
        const decodedValue = decodeURIComponent(value);
        if (decodedValue && decodedValue.length > 10) {
          return decodedValue;
        }
      }
    }
    
    // Último recurso: verificar se existe objeto de usuário com token
    try {
      const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        if (userData && userData.token && userData.token.length > 10) {
          return userData.token;
        }
      }
    } catch (error) {
      console.error('Erro ao analisar dados do usuário:', error);
    }
    
    return null;
  };

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  // Agrupar por categoria
  const categorizedShows = groupByCategory(tvShows);

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 overflow-y-auto overflow-x-hidden z-50">
        {/* Back to Dashboard Button */}
        <button
          onClick={handleBackToDashboard}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg transition-colors backdrop-blur-sm border border-white/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Dashboard
        </button>

        {/* Hero Section */}
        <HeroSection />

        {/* Video Rows */}
        <div className="relative -mt-20 z-20 pb-20 bg-gray-900">
          {/* Continue Watching */}
          {continueWatching && continueWatching.length > 0 && (
            <div className="pt-16">
              <CarouselRow
                title="Continue assistindo"
                videos={continueWatching}
                onPlayVideo={handlePlayVideo}
              />
            </div>
          )}

          {/* Popular Shows */}
          {popularShows && popularShows.length > 0 && (
            <CarouselRow
              title="Populares na plataforma"
              videos={popularShows.map(show => ({
                id: show.id,
                title: show.name,
                thumbnail_url: show.poster_image_url || show.backdrop_image_url,
                description: show.overview,
                duration: show.total_load || '',
                popularity: show.popularity,
                tv_show: {
                  id: show.id,
                  name: show.name,
                  poster_image_url: show.poster_image_url,
                  backdrop_image_url: show.backdrop_image_url
                }
              }))}
              onPlayVideo={handlePlayVideo}
            />
          )}

          {/* Categorized Collections */}
          {categorizedShows && categorizedShows.length > 0 && categorizedShows.map(([category, shows]) => (
            <CarouselRow
              key={category}
              title={category}
              videos={shows.map(show => ({
                id: show.id,
                title: show.name,
                thumbnail_url: show.poster_image_url || show.backdrop_image_url,
                description: show.overview,
                duration: show.total_load || '',
                popularity: show.popularity,
                tv_show: {
                  id: show.id,
                  name: show.name,
                  poster_image_url: show.poster_image_url,
                  backdrop_image_url: show.backdrop_image_url
                }
              }))}
              onPlayVideo={handlePlayVideo}
            />
          ))}

          {/* Recent Releases */}
          {recentReleases && recentReleases.length > 0 && (
            <CarouselRow
              title="Lançamentos"
              videos={recentReleases.map(show => ({
                id: show.id,
                title: show.name,
                thumbnail_url: show.poster_image_url || show.backdrop_image_url,
                description: show.overview,
                duration: show.total_load || '',
                popularity: show.popularity,
                tv_show: {
                  id: show.id,
                  name: show.name,
                  poster_image_url: show.poster_image_url,
                  backdrop_image_url: show.backdrop_image_url
                }
              }))}
              onPlayVideo={handlePlayVideo}
            />
          )}
          
          {/* Mensagem quando não há conteúdo */}
          {(!popularShows || popularShows.length === 0) && 
           (!categorizedShows || categorizedShows.length === 0) && 
           (!recentReleases || recentReleases.length === 0) && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Nenhum conteúdo disponível</h3>
              <p className="text-gray-500 max-w-md text-center">
                Não foi possível carregar as coleções de vídeos. Verifique sua conexão ou tente novamente mais tarde.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {showPlayer && currentVideo && (
        <UniversalVideoPlayer
          videos={[{
            id: currentVideo.id,
            title: currentVideo.title,
            url: currentVideo.video_url || '',
            type: 'mp4',
            thumbnail: currentVideo.thumbnail_url || 
                      currentVideo.tv_show?.poster_image_url || 
                      currentVideo.tv_show?.backdrop_image_url || 
                      '/placeholder-collection.jpg',
            duration: currentVideo.duration || '00:00',
            description: currentVideo.description || '',
          }]}
          initialVideoIndex={0}
          collectionName={currentVideoCollection}
          onClose={handleClosePlayer}
          autoplay={true}
        />
      )}

      {/* Global CSS to force complete fullscreen */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Hide all navigation elements */
        aside,
        header,
        [class*="sidebar"],
        [class*="header"] {
          display: none !important;
        }
        
        /* Force complete fullscreen */
        html,
        body,
        #__next,
        #__next > div,
        main,
        [class*="dashboard"],
        [class*="page"],
        [class*="content"],
        [class*="container"] {
          margin: 0 !important;
          padding: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: none !important;
          max-height: none !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          overflow: hidden !important;
        }
        
        /* Ensure our content is on top */
        main > div {
          z-index: 50 !important;
        }
      `}</style>
    </>
  );
}
