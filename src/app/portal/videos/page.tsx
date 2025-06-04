'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
  FireIcon,
  PlayCircleIcon,
  AdjustmentsHorizontalIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  BookmarkIcon,
  BookOpenIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { XMarkIcon as XMarkSolidIcon } from '@heroicons/react/24/solid';
import Carousel from '../../../components/Carousel';
import VideoCard from '../../../components/VideoCard';
import SimpleCarousel from "@/components/SimpleCarousel";
import { mockVideos, carouselVideoImages } from '@/constants/mockData';

// Types
type ViewMode = 'grid' | 'list';
type SortOption = 'title' | 'duration' | 'progress' | 'recent';
type FilterCategory = 'all' | 'inProgress' | 'notStarted' | 'completed';

interface FilterState {
  category: FilterCategory;
  searchQuery: string;
  durationRange: [number, number];
  subjects: string[];
}

// Extract unique subjects from video titles
const extractSubjects = (videos: typeof mockVideos) => {
  const subjects = new Set<string>();
  videos.forEach(video => {
    const subject = video.title.split(':')[0].trim();
    subjects.add(subject);
  });
  return Array.from(subjects).sort();
};

// Duration parser (converts "MM:SS" to seconds)
const parseDuration = (duration: string): number => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

// Format duration for display
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Carousel settings
const carouselSettings = {
  slidesToShow: 6,
  slidesToScroll: 1,
  infinite: true,
  dots: false,
  arrows: true,
  autoplay: false,
  responsive: [
    {
      breakpoint: 1536,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 1280,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
};

export default function VideosPage() {
  // State for view mode, filters, and sorting
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchQuery: '',
    durationRange: [0, 60 * 60], // 0 seconds to 60 minutes
    subjects: [],
  });

  // Get all available subjects
  const allSubjects = useMemo(() => extractSubjects(mockVideos), []);
  
  // Get min and max duration from all videos
  const durationRange = useMemo(() => {
    const durations = mockVideos.map(video => parseDuration(video.duration));
    return [Math.min(...durations), Math.max(...durations)] as [number, number];
  }, []);

  // Filter videos for different sections
  const continueWatching = useMemo(() =>
    mockVideos.filter(video => video.progress && video.progress > 0),
  []);
  
  const recommendations = useMemo(() =>
    mockVideos.filter((_, index) => index < 15),
  []);
  
  const newReleases = useMemo(() =>
    mockVideos.slice(0, 10),
  []);
  
  const popular = useMemo(() =>
    mockVideos.slice(10, 20),
  []);

  // Apply filters to all videos
  const filteredVideos = useMemo(() => {
    return mockVideos.filter(video => {
      // Filter by category
      if (filters.category === 'inProgress' && (!video.progress || video.progress === 0)) return false;
      if (filters.category === 'notStarted' && video.progress) return false;
      if (filters.category === 'completed' && (!video.progress || video.progress < 100)) return false;
      
      // Filter by search query
      if (filters.searchQuery && !video.title.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
      
      // Filter by duration
      const duration = parseDuration(video.duration);
      if (duration < filters.durationRange[0] || duration > filters.durationRange[1]) return false;
      
      // Filter by subjects
      if (filters.subjects.length > 0) {
        const videoSubject = video.title.split(':')[0].trim();
        if (!filters.subjects.includes(videoSubject)) return false;
      }
      
      return true;
    });
  }, [filters]);

  // Sort filtered videos
  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      switch (sortOption) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'duration':
          return parseDuration(a.duration) - parseDuration(b.duration);
        case 'progress':
          const progressA = a.progress || 0;
          const progressB = b.progress || 0;
          return progressB - progressA;
        case 'recent':
        default:
          // Assuming newer videos have higher IDs
          return b.id.localeCompare(a.id);
      }
    });
  }, [filteredVideos, sortOption]);

  // Handle filter changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((category: FilterCategory) => {
    setFilters(prev => ({ ...prev, category }));
  }, []);

  const handleDurationChange = useCallback((range: [number, number]) => {
    setFilters(prev => ({ ...prev, durationRange: range }));
  }, []);

  const handleSubjectToggle = useCallback((subject: string) => {
    setFilters(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      category: 'all',
      searchQuery: '',
      durationRange: durationRange,
      subjects: [],
    });
  }, [durationRange]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsFilterOpen(false);
      setIsSortOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Render video grid or list
  const renderVideoItems = (videos: typeof mockVideos) => {
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {videos.map(video => (
            <VideoCard
              key={video.id}
              id={video.id}
              thumbnail={video.thumbnail}
              title={video.title}
              duration={video.duration}
              progress={video.progress}
            />
          ))}
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          {videos.map(video => (
            <div
              key={video.id}
              className="flex items-center bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-3 cursor-pointer"
              onClick={() => {/* Handle video click */}}
            >
              <div className="relative w-32 h-20 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover rounded-md"
                />
                {video.progress !== undefined && video.progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div className="h-full bg-gray-200/30">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${video.progress}%` }}
                      />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-medium rounded-md">
                  {video.duration}
                </div>
              </div>
              <div className="ml-4 flex-grow">
                <h3 className="text-sm font-medium text-gray-700 line-clamp-2">{video.title}</h3>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  {video.progress !== undefined && (
                    <span className="flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {video.progress === 100 ? 'Concluído' : `${video.progress}% completo`}
                    </span>
                  )}
                </div>
              </div>
              <PlayCircleIcon className="w-8 h-8 text-blue-600 flex-shrink-0 ml-4" />
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Featured Carousel */}
      <section className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-b from-gray-900 to-gray-800">
        <SimpleCarousel images={carouselVideoImages} autoplaySpeed={3000} />
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-30 bg-white shadow-md border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto sm:flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar vídeos..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={filters.searchQuery}
                onChange={handleSearchChange}
              />
              {filters.searchQuery && (
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                >
                  <XMarkIcon className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              {/* Filter Button */}
              <div className="relative">
                <button
                  className={`flex items-center px-3 py-2 border ${isFilterOpen || Object.values(filters).some(v =>
                    Array.isArray(v) ? v.length > 0 : Boolean(v) && v !== 'all'
                  ) ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-700'} rounded-md bg-white text-sm font-medium hover:bg-gray-50`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterOpen(!isFilterOpen);
                    setIsSortOpen(false);
                  }}
                >
                  <FunnelIcon className="h-4 w-4 mr-2" />
                  Filtros
                  {(filters.category !== 'all' || filters.subjects.length > 0 ||
                   filters.durationRange[0] !== durationRange[0] ||
                   filters.durationRange[1] !== durationRange[1]) && (
                    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-500 rounded-full">
                      {(filters.category !== 'all' ? 1 : 0) +
                       (filters.subjects.length > 0 ? 1 : 0) +
                       (filters.durationRange[0] !== durationRange[0] ||
                        filters.durationRange[1] !== durationRange[1] ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-700">Filtros</h3>
                        <button
                          className="text-gray-400 hover:text-gray-500"
                          onClick={resetFilters}
                        >
                          <span className="text-xs text-blue-600">Limpar</span>
                        </button>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="p-4 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            filters.category === 'all'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => handleCategoryChange('all')}
                        >
                          Todos
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            filters.category === 'inProgress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => handleCategoryChange('inProgress')}
                        >
                          <div className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            Em Progresso
                          </div>
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            filters.category === 'notStarted'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => handleCategoryChange('notStarted')}
                        >
                          <div className="flex items-center">
                            <BookmarkIcon className="w-3 h-3 mr-1" />
                            Não Iniciados
                          </div>
                        </button>
                        <button
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            filters.category === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          onClick={() => handleCategoryChange('completed')}
                        >
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-3 h-3 mr-1" />
                            Concluídos
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Duration Range */}
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Duração</h4>
                        <span className="text-xs text-gray-500">
                          {formatDuration(filters.durationRange[0])} - {formatDuration(filters.durationRange[1])}
                        </span>
                      </div>
                      <div className="px-2">
                        <input
                          type="range"
                          min={durationRange[0]}
                          max={durationRange[1]}
                          value={filters.durationRange[1]}
                          onChange={(e) => handleDurationChange([filters.durationRange[0], parseInt(e.target.value)])}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Curto</span>
                        <span>Longo</span>
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="p-4 max-h-60 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Disciplinas</h4>
                      <div className="space-y-2">
                        {allSubjects.map(subject => (
                          <div key={subject} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`subject-${subject}`}
                              checked={filters.subjects.includes(subject)}
                              onChange={() => handleSubjectToggle(subject)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`subject-${subject}`} className="ml-2 text-sm text-gray-700">
                              {subject}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Button */}
              <div className="relative">
                <button
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortOpen(!isSortOpen);
                    setIsFilterOpen(false);
                  }}
                >
                  <ArrowsUpDownIcon className="h-4 w-4 mr-2" />
                  Ordenar
                </button>

                {/* Sort Dropdown */}
                {isSortOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      {[
                        { value: 'recent', label: 'Mais Recentes' },
                        { value: 'title', label: 'Título (A-Z)' },
                        { value: 'duration', label: 'Duração (Menor)' },
                        { value: 'progress', label: 'Progresso' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          className={`flex items-center justify-between w-full px-4 py-2 text-sm ${
                            sortOption === option.value ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
                          }`}
                          onClick={() => {
                            setSortOption(option.value as SortOption);
                            setIsSortOpen(false);
                          }}
                        >
                          {option.label}
                          {sortOption === option.value && (
                            <CheckIcon className="h-4 w-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <button
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Continue Watching Section */}
        {continueWatching.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-700">Continue Assistindo</h2>
                <p className="text-sm text-gray-600 mt-1">Retome de onde parou</p>
              </div>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => {
                  setFilters(prev => ({ ...prev, category: 'inProgress' }));
                  setShowAllVideos(true);
                }}
              >
                Ver todos <ChevronRightIcon className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="relative">
              <Carousel settings={carouselSettings}>
                {continueWatching.map(video => (
                  <div key={video.id} className="px-2">
                    <VideoCard
                      id={video.id}
                      thumbnail={video.thumbnail}
                      title={video.title}
                      duration={video.duration}
                      progress={video.progress}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
          </section>
        )}

        {/* Popular Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-700">Mais Populares</h2>
              <p className="text-sm text-gray-600 mt-1">Os conteúdos mais assistidos da biblioteca</p>
            </div>
            <button
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              onClick={() => {
                setShowAllVideos(true);
              }}
            >
              Ver todos <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="relative">
            <Carousel settings={carouselSettings}>
              {popular.map(video => (
                <div key={video.id} className="px-2">
                  <VideoCard
                    id={video.id}
                    thumbnail={video.thumbnail}
                    title={video.title}
                    duration={video.duration}
                    progress={video.progress}
                  />
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* All Videos Section (when filters are applied or "Ver todos" is clicked) */}
        {(showAllVideos || filters.searchQuery || filters.category !== 'all' ||
          filters.subjects.length > 0 ||
          filters.durationRange[0] !== durationRange[0] ||
          filters.durationRange[1] !== durationRange[1]) && (
          <section className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-700">
                  {filters.searchQuery
                    ? `Resultados para "${filters.searchQuery}"`
                    : filters.category !== 'all'
                      ? filters.category === 'inProgress'
                        ? 'Vídeos em Progresso'
                        : filters.category === 'notStarted'
                          ? 'Vídeos Não Iniciados'
                          : 'Vídeos Concluídos'
                      : 'Todos os Vídeos'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {sortedVideos.length} {sortedVideos.length === 1 ? 'vídeo encontrado' : 'vídeos encontrados'}
                </p>
              </div>
              {(filters.searchQuery || filters.category !== 'all' ||
                filters.subjects.length > 0 ||
                filters.durationRange[0] !== durationRange[0] ||
                filters.durationRange[1] !== durationRange[1]) && (
                <button
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  onClick={resetFilters}
                >
                  <XMarkSolidIcon className="h-4 w-4 mr-1" />
                  Limpar filtros
                </button>
              )}
            </div>

            {sortedVideos.length > 0 ? (
              renderVideoItems(sortedVideos)
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  <XMarkSolidIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">Nenhum vídeo encontrado</h3>
                <p className="text-gray-500 max-w-md">
                  Não encontramos vídeos que correspondam aos seus filtros. Tente ajustar os critérios de busca.
                </p>
                <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={resetFilters}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
