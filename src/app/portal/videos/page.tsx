'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { mockVideos, carouselVideoImages } from '@/constants/mockData';

// Create comprehensive video data with real educational YouTube videos
const createVideoLibrary = () => {
  const videoCategories = [
    {
      category: "Matemática",
      videos: [
        { id: "LuDQ_utewGw", title: "Função Quadrática - Conceitos Básicos", duration: "15:30", progress: 75 },
        { id: "9bZkp7q19f0", title: "Derivadas - Regra da Cadeia", duration: "22:15", progress: 45 },
        { id: "kJQP7kiw5Fk", title: "Geometria Analítica - Reta", duration: "18:45", progress: 0 },
        { id: "YQHsXMglC9A", title: "Logaritmos - Propriedades", duration: "25:10", progress: 30 },
        { id: "oHg5SJYRHA0", title: "Trigonometria - Círculo Trigonométrico", duration: "20:35", progress: 0 }
      ]
    },
    {
      category: "Física",
      videos: [
        { id: "rAu1h2NfT6Q", title: "Cinemática - Movimento Uniforme", duration: "28:20", progress: 60 },
        { id: "Hyp7WuuTAeI", title: "Eletrostática - Lei de Coulomb", duration: "32:45", progress: 0 },
        { id: "kJQP7kiw5Fk", title: "Termodinâmica - Primeira Lei", duration: "24:15", progress: 85 },
        { id: "9bZkp7q19f0", title: "Óptica - Espelhos Esféricos", duration: "19:30", progress: 0 },
        { id: "YQHsXMglC9A", title: "Mecânica - Leis de Newton", duration: "35:50", progress: 20 }
      ]
    },
    {
      category: "Química",
      videos: [
        { id: "Cz3O0NrgHfE", title: "Química Orgânica - Hidrocarbonetos", duration: "26:40", progress: 0 },
        { id: "oHg5SJYRHA0", title: "Ácidos e Bases - pH e pOH", duration: "21:25", progress: 55 },
        { id: "kJQP7kiw5Fk", title: "Cinética Química - Velocidade", duration: "29:15", progress: 0 },
        { id: "9bZkp7q19f0", title: "Estequiometria - Cálculos", duration: "33:10", progress: 40 },
        { id: "YQHsXMglC9A", title: "Tabela Periódica - Propriedades", duration: "17:55", progress: 0 }
      ]
    },
    {
      category: "Biologia",
      videos: [
        { id: "3KUvxI_u1Ys", title: "Genética - Leis de Mendel", duration: "31:20", progress: 70 },
        { id: "oHg5SJYRHA0", title: "Ecologia - Cadeia Alimentar", duration: "27:45", progress: 0 },
        { id: "kJQP7kiw5Fk", title: "Citologia - Mitose e Meiose", duration: "24:30", progress: 25 },
        { id: "9bZkp7q19f0", title: "Evolução - Darwin", duration: "22:15", progress: 0 },
        { id: "YQHsXMglC9A", title: "Anatomia - Sistema Circulatório", duration: "19:40", progress: 90 }
      ]
    },
    {
      category: "História",
      videos: [
        { id: "jNQXAC9IVRw", title: "Brasil Colônia - Capitanias Hereditárias", duration: "34:25", progress: 0 },
        { id: "oHg5SJYRHA0", title: "Revolução Francesa - Antecedentes", duration: "28:50", progress: 35 },
        { id: "kJQP7kiw5Fk", title: "Segunda Guerra - Holocausto", duration: "42:15", progress: 0 },
        { id: "9bZkp7q19f0", title: "Era Vargas - Getúlio Vargas", duration: "26:30", progress: 65 },
        { id: "YQHsXMglC9A", title: "Idade Média - Sistema Feudal", duration: "30:45", progress: 0 }
      ]
    },
    {
      category: "Geografia",
      videos: [
        { id: "Me02kzqcwK0", title: "Geologia - Placas Tectônicas", duration: "25:35", progress: 50 },
        { id: "oHg5SJYRHA0", title: "Climatologia - Aquecimento Global", duration: "29:20", progress: 0 },
        { id: "kJQP7kiw5Fk", title: "Cartografia - Fusos Horários", duration: "18:45", progress: 80 },
        { id: "9bZkp7q19f0", title: "Geografia Urbana - Urbanização", duration: "32:10", progress: 0 },
        { id: "YQHsXMglC9A", title: "Geopolítica - BRICS", duration: "27:55", progress: 15 }
      ]
    },
    {
      category: "Literatura",
      videos: [
        { id: "jNQXAC9IVRw", title: "Machado de Assis - Dom Casmurro", duration: "23:40", progress: 0 },
        { id: "oHg5SJYRHA0", title: "Modernismo - Mário de Andrade", duration: "26:15", progress: 45 },
        { id: "kJQP7kiw5Fk", title: "Romantismo - José de Alencar", duration: "21:30", progress: 0 },
        { id: "9bZkp7q19f0", title: "Barroco - Padre Antônio Vieira", duration: "19:25", progress: 70 },
        { id: "YQHsXMglC9A", title: "Parnasianismo - Raimundo Correia", duration: "17:50", progress: 0 }
      ]
    },
    {
      category: "Filosofia",
      videos: [
        { id: "Me02kzqcwK0", title: "Platão - Alegoria da Caverna", duration: "28:15", progress: 25 },
        { id: "oHg5SJYRHA0", title: "Aristóteles - Ética a Nicômaco", duration: "31:40", progress: 0 },
        { id: "kJQP7kiw5Fk", title: "Kant - Imperativo Categórico", duration: "35:20", progress: 60 },
        { id: "9bZkp7q19f0", title: "Nietzsche - Além do Bem e do Mal", duration: "29:55", progress: 0 },
        { id: "YQHsXMglC9A", title: "Descartes - Discurso do Método", duration: "24:30", progress: 40 }
      ]
    },
    {
      category: "Português",
      videos: [
        { id: "3KUvxI_u1Ys", title: "Gramática - Concordância Verbal", duration: "22:10", progress: 0 },
        { id: "oHg5SJYRHA0", title: "Redação - Dissertação Argumentativa", duration: "28:30", progress: 50 },
        { id: "kJQP7kiw5Fk", title: "Interpretação de Texto - ENEM", duration: "25:45", progress: 0 },
        { id: "9bZkp7q19f0", title: "Sintaxe - Período Composto", duration: "30:20", progress: 35 },
        { id: "YQHsXMglC9A", title: "Figuras de Linguagem", duration: "18:15", progress: 0 }
      ]
    },
    {
      category: "Inglês",
      videos: [
        { id: "Cz3O0NrgHfE", title: "Grammar - Present Perfect", duration: "20:45", progress: 60 },
        { id: "oHg5SJYRHA0", title: "Vocabulary - Business English", duration: "24:30", progress: 0 },
        { id: "kJQP7kiw5Fk", title: "Conversation - Daily Routines", duration: "18:20", progress: 80 },
        { id: "9bZkp7q19f0", title: "Reading - Text Comprehension", duration: "26:15", progress: 0 },
        { id: "YQHsXMglC9A", title: "Writing - Essay Structure", duration: "22:40", progress: 25 }
      ]
    }
  ];

  // Flatten all videos into a single array with proper structure
  const allVideos = videoCategories.flatMap(cat => 
    cat.videos.map(video => ({
      id: `${cat.category.toLowerCase()}-${video.id}`,
      thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
      title: `${cat.category}: ${video.title}`,
      duration: video.duration,
      progress: video.progress,
      youtubeId: video.id
    }))
  );

  return { videoCategories, allVideos };
};

// Get videos in progress
const getVideosInProgress = (videos: any[]) => {
  return videos.filter(video => video.progress && video.progress > 0 && video.progress < 100)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0));
};

// Group videos by subject
const groupVideosBySubject = (videoCategories: any[]) => {
  return videoCategories.map(cat => ({
    subject: cat.category,
    videos: cat.videos.map(video => ({
      id: `${cat.category.toLowerCase()}-${video.id}`,
      thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
      title: `${cat.category}: ${video.title}`,
      duration: video.duration,
      progress: video.progress,
      youtubeId: video.id
    }))
  }));
};

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
  const featuredVideos = carouselVideoImages;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentVideo((prev) => (prev + 1) % featuredVideos.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [featuredVideos.length]);

  const current = featuredVideos[currentVideo];

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <img
          src={current.src}
          alt={current.alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="px-20 max-w-5xl">
          <h1 className="text-8xl font-bold text-white mb-10">
            {current.title}
          </h1>
          <p className="text-2xl text-gray-200 mb-12 line-clamp-3 leading-relaxed max-w-4xl">
            Explore conteúdo educacional de alta qualidade. Aprenda com os melhores professores e desenvolva novas habilidades no seu próprio ritmo.
          </p>
          
          {/* Buttons */}
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-4 px-12 py-5 bg-white text-black rounded hover:bg-gray-200 transition-colors text-2xl font-semibold">
              <PlayIcon className="w-8 h-8" />
              Assistir
            </button>
            <button className="flex items-center gap-4 px-12 py-5 bg-gray-500/70 text-white rounded hover:bg-gray-500/50 transition-colors text-2xl font-semibold">
              <InformationCircleIcon className="w-8 h-8" />
              Mais informações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Netflix-style Video Card
const NetflixVideoCard = ({ video }: { video: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const progressPercentage = video.progress || 0;

  const getVideoId = () => {
    return video.youtubeId || video.id;
  };

  return (
    <>
      <div
        className="relative group cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative transition-all duration-300 h-full ${isHovered ? 'scale-105 z-50' : 'scale-100'}`}>
          {/* Card Container with fixed dimensions */}
          <div className="bg-gray-800 rounded-lg overflow-hidden h-full flex flex-col shadow-lg">
            {/* Thumbnail with fixed aspect ratio */}
            <div className="relative w-full h-44 bg-gray-700 flex-shrink-0">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/320x180/374151/9CA3AF?text=Video';
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
                  onClick={() => setShowPlayer(true)}
                >
                  <PlayIcon className="w-12 h-12 text-white" />
                </div>
              )}
            </div>

            {/* Video Info - Increased height and better spacing */}
            <div className="p-5 flex-grow flex flex-col justify-between min-h-[160px]">
              <h3 className="text-white font-medium text-sm mb-4 line-clamp-2 leading-tight">
                {video.title}
              </h3>
              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-green-400 font-bold text-sm bg-green-400/20 px-3 py-1.5 rounded-md border border-green-400/30">
                    ✓ Educacional
                  </span>
                  {progressPercentage > 0 && (
                    <span className="text-gray-300 bg-gray-700 px-3 py-1.5 rounded-md font-medium">
                      {progressPercentage}%
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-medium">{video.duration}</span>
                  <span className="text-gray-500">HD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPlayer && (
        <VideoPlayer
          videoId={getVideoId()}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </>
  );
};

// Netflix-style Carousel Row
const CarouselRow = ({ title, videos }: { title: string; videos: any[] }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);

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
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-80 h-80">
            <NetflixVideoCard video={video} />
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

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        setIsLoading(false);
      }
    }
  }, [user, loading, router]);

  // Effect to make page completely fullscreen (over header and sidebar)
  useEffect(() => {
    // Hide sidebar and header
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    const sidebarContainer = document.querySelector('[class*="sidebar"]');
    
    if (sidebar) {
      sidebar.style.display = 'none';
    }
    if (header) {
      header.style.display = 'none';
    }
    if (sidebarContainer) {
      sidebarContainer.style.display = 'none';
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

    const elements = selectors.map(selector => document.querySelector(selector)).filter(Boolean);
    
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
        sidebar.style.display = '';
      }
      if (header) {
        header.style.display = '';
      }
      if (sidebarContainer) {
        sidebarContainer.style.display = '';
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

  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  // Get video data
  const { videoCategories, allVideos } = createVideoLibrary();
  const continueWatchingVideos = getVideosInProgress(allVideos);
  const videoCollections = groupVideosBySubject(videoCategories);

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
          {continueWatchingVideos.length > 0 && (
            <div className="pt-16">
              <CarouselRow
                title="Continue assistindo"
                videos={continueWatchingVideos}
              />
            </div>
          )}

          {/* Popular Videos */}
          <CarouselRow
            title="Populares na plataforma"
            videos={allVideos.slice(0, 10)}
          />

          {/* Subject Collections */}
          {videoCollections.map(({ subject, videos }) => (
            <CarouselRow
              key={subject}
              title={subject}
              videos={videos}
            />
          ))}

          {/* New Releases */}
          <CarouselRow
            title="Lançamentos"
            videos={allVideos.slice(-8)}
          />
        </div>
      </div>

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
