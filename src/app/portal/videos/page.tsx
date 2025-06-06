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
import { useAuth } from '@/contexts/AuthContext';
import { 
  Play,
  Plus,
  Search,
  Filter,
  Upload,
  Eye,
  Calendar,
  MoreVertical,
  Video,
  Folder,
  Star,
  Download
} from 'lucide-react';

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

export default function VideoPortalPage() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    loadVideos();
    loadCategories();
  }, [filterCategory, filterCourse, sortBy]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      // Simular carregamento de dados
      setTimeout(() => {
        setVideos([
          {
            id: '1',
            title: 'Introdução às Equações do 2º Grau',
            description: 'Aula completa sobre os conceitos fundamentais das equações quadráticas',
            thumbnail: 'https://via.placeholder.com/320x180/4F46E5/FFFFFF?text=Matemática',
            duration: '45:30',
            course: 'Matemática Básica',
            category: 'Aulas',
            uploaded_by: 'Prof. João Silva',
            uploaded_at: '2024-03-10',
            views: 234,
            likes: 45,
            status: 'published',
            url: 'https://example.com/video1.mp4',
            size: '250 MB'
          },
          {
            id: '2',
            title: 'Exercícios Resolvidos - Bhaskara',
            description: 'Resolução passo a passo de exercícios usando a fórmula de Bhaskara',
            thumbnail: 'https://via.placeholder.com/320x180/10B981/FFFFFF?text=Exercícios',
            duration: '32:15',
            course: 'Matemática Básica',
            category: 'Exercícios',
            uploaded_by: 'Prof. João Silva',
            uploaded_at: '2024-03-12',
            views: 189,
            likes: 38,
            status: 'published',
            url: 'https://example.com/video2.mp4',
            size: '180 MB'
          },
          {
            id: '3',
            title: 'Concordância Verbal - Regras Básicas',
            description: 'Explicação detalhada sobre as principais regras de concordância verbal',
            thumbnail: 'https://via.placeholder.com/320x180/F59E0B/FFFFFF?text=Português',
            duration: '28:45',
            course: 'Português - Gramática',
            category: 'Aulas',
            uploaded_by: 'Prof. Maria Santos',
            uploaded_at: '2024-03-08',
            views: 156,
            likes: 29,
            status: 'published',
            url: 'https://example.com/video3.mp4',
            size: '150 MB'
          },
          {
            id: '4',
            title: 'Brasil Colonial - Documentário',
            description: 'Documentário educativo sobre o período colonial brasileiro',
            thumbnail: 'https://via.placeholder.com/320x180/EF4444/FFFFFF?text=História',
            duration: '52:00',
            course: 'História do Brasil',
            category: 'Documentários',
            uploaded_by: 'Prof. Roberto Lima',
            uploaded_at: '2024-03-05',
            views: 312,
            likes: 67,
            status: 'published',
            url: 'https://example.com/video4.mp4',
            size: '380 MB'
          },
          {
            id: '5',
            title: 'Tutorial: Gravação de Aulas',
            description: 'Como gravar e editar suas aulas para o portal',
            thumbnail: 'https://via.placeholder.com/320x180/8B5CF6/FFFFFF?text=Tutorial',
            duration: '15:20',
            course: 'Geral',
            category: 'Tutoriais',
            uploaded_by: 'Admin',
            uploaded_at: '2024-03-01',
            views: 89,
            likes: 15,
            status: 'processing',
            url: 'https://example.com/video5.mp4',
            size: '95 MB'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategories([
      { id: '1', name: 'Aulas', count: 45, icon: '🎓' },
      { id: '2', name: 'Exercícios', count: 32, icon: '📝' },
      { id: '3', name: 'Documentários', count: 12, icon: '🎬' },
      { id: '4', name: 'Tutoriais', count: 8, icon: '💡' },
      { id: '5', name: 'Webinars', count: 5, icon: '🎯' }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado';
      case 'draft':
        return 'Rascunho';
      case 'processing':
        return 'Processando';
      default:
        return status;
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || video.category === filterCategory
    const matchesCourse = filterCourse === 'all' || video.course === filterCourse
    return matchesSearch && matchesCategory && matchesCourse
  });

  const sortedVideos = [...filteredVideos].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
      case 'popular':
        return b.views - a.views;
      case 'mostLiked':
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const uniqueCourses = Array.from(new Set(videos.map(v => v.course)));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Portal de Vídeos
        </h1>
        <p className="text-slate-600">
          Biblioteca de vídeos educacionais para suas aulas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Vídeos</p>
              <p className="text-2xl font-bold text-slate-800">{videos.length}</p>
            </div>
            <Video className="h-8 w-8 text-slate-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Visualizações</p>
              <p className="text-2xl font-bold text-blue-600">
                {videos.reduce((acc, v) => acc + v.views, 0)}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Duração Total</p>
              <p className="text-2xl font-bold text-green-600">12h 45m</p>
            </div>
            <Clock className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Armazenamento</p>
              <p className="text-2xl font-bold text-purple-600">2.3 GB</p>
            </div>
            <Folder className="h-8 w-8 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Categorias */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Categorias</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${
                filterCategory === category.name
                  ? 'bg-primary-dark text-white border-primary-dark'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="text-lg">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar vídeos..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary-dark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>
        
        {user?.role === 'TEACHER' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1 px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors"
          >
            <Upload className="h-4 w-4" />
            Enviar Vídeo
          </button>
        )}
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Curso
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="all">Todos os Cursos</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ordenar por
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Visualizados</option>
                <option value="mostLiked">Mais Curtidos</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid de vídeos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
          </div>
        ) : sortedVideos.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Video className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Nenhum vídeo encontrado</p>
          </div>
        ) : (
          sortedVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video bg-slate-100">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {video.duration}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 line-clamp-2 flex-1">
                    {video.title}
                  </h3>
                  <button className="p-1 hover:bg-slate-100 rounded ml-2">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                  {video.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>{video.course}</span>
                  <span className={`px-2 py-1 rounded-full ${getStatusColor(video.status)}`}>
                    {getStatusLabel(video.status)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {video.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {video.likes}
                    </span>
                  </div>
                  <span>{video.size}</span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <p>{video.uploaded_by}</p>
                    <p>{new Date(video.uploaded_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                  {user?.role === 'TEACHER' && (
                    <button className="text-primary-dark hover:text-primary-darker">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
