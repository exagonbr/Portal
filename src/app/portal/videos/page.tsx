'use client';

import React, { useEffect, useState, useRef } from 'react';
import { PlayIcon, InformationCircleIcon, ChevronLeftIcon, ChevronRightIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import VideoPlayer from '@/components/VideoPlayer';
import { mockVideos, carouselVideoImages } from '@/constants/mockData';

// Group videos by subject
const groupVideosBySubject = (videos: typeof mockVideos) => {
  const groups = videos.reduce((acc, video) => {
    const subject = video.title.split(':')[0].trim();
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(video);
    return acc;
  }, {} as Record<string, typeof mockVideos>);

  return Object.entries(groups).map(([subject, videos]) => ({
    subject,
    videos
  }));
};

// Get videos in progress
const getVideosInProgress = (videos: typeof mockVideos) => {
  return videos.filter(video => video.progress && video.progress > 0 && video.progress < 100)
    .sort((a, b) => (b.progress || 0) - (a.progress || 0));
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
const NetflixVideoCard = ({ video }: { video: typeof mockVideos[0] }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const progressPercentage = video.progress || 0;

  const getVideoId = () => {
    const match = video.thumbnail.match(/\/vi\/([^/]+)\/maxresdefault\.jpg/);
    return match ? match[1] : '';
  };

  return (
    <>
      <div
        className="relative group cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative transition-all duration-300 h-full ${isHovered ? 'scale-110 z-50' : 'scale-100'}`}>
          {/* Card Container with fixed height */}
          <div className="bg-gray-900 rounded overflow-hidden h-full flex flex-col">
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gray-800 flex-shrink-0">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              
              {/* Progress Bar */}
              {progressPercentage > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
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

            {/* Video Info - Always visible */}
            <div className="p-3 flex-grow flex flex-col">
              <h3 className="text-white font-medium text-sm mb-2 line-clamp-2 flex-grow">
                {video.title}
              </h3>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-green-500 font-semibold">95% relevante</span>
                  <span>{video.duration}</span>
                </div>
                {progressPercentage > 0 && (
                  <span className="text-gray-400">{progressPercentage}%</span>
                )}
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
const CarouselRow = ({ title, videos }: { title: string; videos: typeof mockVideos }) => {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative group mb-8">
      <h2 className="text-xl font-semibold text-white mb-3 px-12">{title}</h2>
      
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-12 h-40 bg-black/70 hover:bg-black/90 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
        >
          <ChevronLeftIcon className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Videos Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-12 pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-[280px] h-[220px]">
            <NetflixVideoCard video={video} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-12 h-40 bg-black/70 hover:bg-black/90 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
        >
          <ChevronRightIcon className="w-8 h-8 text-white" />
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

  const continueWatchingVideos = getVideosInProgress(mockVideos);
  const videoCollections = groupVideosBySubject(mockVideos);

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
            videos={mockVideos.slice(0, 10)}
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
            videos={mockVideos.slice(-8)}
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
