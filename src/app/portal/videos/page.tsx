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
  CheckCircleIcon,
  PlayIcon,
  HeartIcon,
  ShareIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';
import { XMarkIcon as XMarkSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Carousel from '../../../components/Carousel';
import VideoCard from '../../../components/VideoCard';
import SimpleCarousel from "@/components/SimpleCarousel";
import { mockVideos, carouselVideoImages } from '@/constants/mockData';
import { useTheme } from '@/contexts/ThemeContext';

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

// Modern Video Card Component
const ModernVideoCard = ({ video, viewMode }: { video: typeof mockVideos[0], viewMode: ViewMode }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();

  if (viewMode === 'list') {
    return (
      <div 
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center p-4">
          {/* Thumbnail */}
          <div className="relative w-48 h-28 flex-shrink-0 rounded-lg overflow-hidden">
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {/* Play Overlay */}
            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              <PlayIcon className="w-12 h-12 text-white" />
            </div>
            {/* Duration */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded">
              {video.duration}
            </div>
            {/* Progress Bar */}
            {video.progress !== undefined && video.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300/50">
                <div
                  className="h-full transition-all duration-300"
                  style={{ 
                    width: `${video.progress}%`,
                    backgroundColor: theme.colors.primary.DEFAULT
                  }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-grow ml-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
              {video.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {video.progress !== undefined && (
                <span className="flex items-center gap-1">
                  {video.progress === 100 ? (
                    <>
                      <CheckCircleIcon className="w-4 h-4" style={{ color: theme.colors.status.success }} />
                      <span style={{ color: theme.colors.status.success }}>Concluído</span>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="w-4 h-4" />
                      {video.progress}% assistido
                    </>
                  )}
                </span>
              )}
              <span className="flex items-center gap-1">
                <PlayCircleIcon className="w-4 h-4" />
                1.2K visualizações
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isLiked ? (
                <HeartSolidIcon className="w-5 h-5" style={{ color: theme.colors.accent.DEFAULT }} />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play Button Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-110">
            <PlayIcon className="w-8 h-8 text-gray-900 ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 text-white text-xs font-medium rounded-md">
          {video.duration}
        </div>

        {/* Progress Bar */}
        {video.progress !== undefined && video.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300/30">
            <div
              className="h-full transition-all duration-300"
              style={{ 
                width: `${video.progress}%`,
                backgroundColor: theme.colors.primary.DEFAULT
              }}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            {isLiked ? (
              <HeartSolidIcon className="w-4 h-4" style={{ color: theme.colors.accent.DEFAULT }} />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {video.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <PlayCircleIcon className="w-4 h-4" />
            1.2K views
          </span>
          {video.progress !== undefined && video.progress > 0 && (
            <span className="flex items-center gap-1">
              {video.progress === 100 ? (
                <CheckCircleIcon className="w-4 h-4" style={{ color: theme.colors.status.success }} />
              ) : (
                <>
                  <ClockIcon className="w-4 h-4" />
                  {video.progress}%
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Hero Section Component
const HeroSection = () => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselVideoImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[500px] overflow-hidden">
      {/* Background Images */}
      {carouselVideoImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={typeof image === 'string' ? image : image.src}
            alt={`Slide ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-4xl px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in">
            Biblioteca de Vídeos
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Explore nossa coleção de conteúdos educacionais em vídeo
          </p>
          <button
            className="px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: 'white'
            }}
          >
            Começar a Assistir
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {carouselVideoImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function VideosPage() {
  const { theme } = useTheme();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    searchQuery: '',
    durationRange: [0, 60 * 60],
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
    mockVideos.filter(video => video.progress && video.progress > 0 && video.progress < 100),
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
          return b.id.localeCompare(a.id);
      }
    });
  }, [filteredVideos, sortOption]);

  // Get videos by tab
  const getVideosByTab = () => {
    switch (activeTab) {
      case 'continue':
        return continueWatching;
      case 'new':
        return newReleases;
      case 'popular':
        return popular;
      case 'recommendations':
        return recommendations;
      default:
        return sortedVideos;
    }
  };

  // Handle filter changes
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    setActiveTab('all');
  }, []);

  const handleCategoryChange = useCallback((category: FilterCategory) => {
    setFilters(prev => ({ ...prev, category }));
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

  const tabs = [
    { id: 'all', label: 'Todos', icon: Squares2X2Icon, count: mockVideos.length },
    { id: 'continue', label: 'Continuar', icon: ClockIcon, count: continueWatching.length },
    { id: 'new', label: 'Novos', icon: SparklesIcon, count: newReleases.length },
    { id: 'popular', label: 'Populares', icon: FireIcon, count: popular.length },
    { id: 'recommendations', label: 'Recomendados', icon: BookOpenIcon, count: recommendations.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="w-full">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-grow">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar vídeos..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all"
                  style={{ '--tw-ring-color': theme.colors.primary.DEFAULT } as React.CSSProperties}
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                />
                {filters.searchQuery && (
                  <button
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <div className="relative">
                <button
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    isFilterOpen || filters.category !== 'all' || filters.subjects.length > 0
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: isFilterOpen || filters.category !== 'all' || filters.subjects.length > 0
                      ? theme.colors.primary.DEFAULT
                      : undefined
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFilterOpen(!isFilterOpen);
                    setIsSortOpen(false);
                  }}
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filtros
                  {(filters.category !== 'all' || filters.subjects.length > 0) && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {(filters.category !== 'all' ? 1 : 0) + filters.subjects.length}
                    </span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filtros</h3>
                        <button
                          className="text-sm font-medium transition-colors"
                          style={{ color: theme.colors.primary.DEFAULT }}
                          onClick={resetFilters}
                        >
                          Limpar tudo
                        </button>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status</h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { value: 'all', label: 'Todos', icon: null },
                          { value: 'inProgress', label: 'Em Progresso', icon: ClockIcon },
                          { value: 'notStarted', label: 'Não Iniciados', icon: BookmarkIcon },
                          { value: 'completed', label: 'Concluídos', icon: CheckCircleIcon }
                        ].map((option) => (
                          <button
                            key={option.value}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              filters.category === option.value
                                ? 'text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                            style={{
                              backgroundColor: filters.category === option.value ? theme.colors.primary.DEFAULT : undefined
                            }}
                            onClick={() => handleCategoryChange(option.value as FilterCategory)}
                          >
                            {option.icon && <option.icon className="w-3 h-3" />}
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subjects */}
                    <div className="p-4 max-h-60 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Disciplinas</h4>
                      <div className="space-y-2">
                        {allSubjects.map(subject => (
                          <label key={subject} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={filters.subjects.includes(subject)}
                              onChange={() => handleSubjectToggle(subject)}
                              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 focus:ring-2"
                              style={{ accentColor: theme.colors.primary.DEFAULT }}
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{subject}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort Button */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSortOpen(!isSortOpen);
                    setIsFilterOpen(false);
                  }}
                >
                  <ArrowsUpDownIcon className="w-5 h-5" />
                  Ordenar
                </button>

                {/* Sort Dropdown */}
                {isSortOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {[
                      { value: 'recent', label: 'Mais Recentes' },
                      { value: 'title', label: 'Título (A-Z)' },
                      { value: 'duration', label: 'Duração' },
                      { value: 'progress', label: 'Progresso' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        className={`flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          sortOption === option.value ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}
                        style={{
                          backgroundColor: sortOption === option.value ? theme.colors.primary.DEFAULT : undefined
                        }}
                        onClick={() => {
                          setSortOption(option.value as SortOption);
                          setIsSortOpen(false);
                        }}
                      >
                        {option.label}
                        {sortOption === option.value && (
                          <CheckIcon className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                  style={{
                    backgroundColor: viewMode === 'grid' ? theme.colors.primary.DEFAULT : 'transparent'
                  }}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                  style={{
                    backgroundColor: viewMode === 'list' ? theme.colors.primary.DEFAULT : 'transparent'
                  }}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'text-white shadow-lg transform scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id ? theme.colors.primary.DEFAULT : undefined
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Videos Grid/List */}
        <div className="px-4 pb-4">
          {getVideosByTab().length > 0 ? (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                : 'space-y-4'
            }>
              {getVideosByTab().map(video => (
                <ModernVideoCard key={video.id} video={video} viewMode={viewMode} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: theme.colors.primary.DEFAULT + '20' }}>
                <PlayCircleIcon className="w-10 h-10" style={{ color: theme.colors.primary.DEFAULT }} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhum vídeo encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Não encontramos vídeos que correspondam aos seus filtros. Tente ajustar os critérios de busca.
              </p>
              {(filters.searchQuery || filters.category !== 'all' || filters.subjects.length > 0) && (
                <button
                  className="mt-6 px-6 py-3 text-white font-medium rounded-xl transition-all hover:shadow-lg"
                  style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                  onClick={resetFilters}
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
