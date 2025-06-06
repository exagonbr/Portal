'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  BookmarkIcon,
  StarIcon,
  HeartIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import PageLayout from '@/components/layout/PageLayout';
import ContentSection from '@/components/layout/ContentSection';
import SearchBar from '@/components/layout/SearchBar';
import StatCard from '@/components/layout/StatCard';
import { Button, ButtonGroup } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/roles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { mockBooks as importedMockBooks, carouselBookImages } from '@/constants/mockData';
import {
  Book,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Eye,
  Star,
  Calendar,
  MoreVertical,
  FileText,
  Bookmark,
  Heart,
  Share2
} from 'lucide-react';

// Extend the imported books with additional properties
interface ExtendedBook {
  id: string;
  title: string;
  author: string;
  cover?: string;
  category: string;
  progress: number;
  lastRead: string;
  pages: number;
  rating: number;
  status: 'reading' | 'completed' | 'wishlist';
  format: 'pdf' | 'epub';
  size: string;
}

// Map imported books to extended format
const mockBooks: ExtendedBook[] = importedMockBooks.map((book, index) => ({
  ...book,
  category: ['Literatura', 'Tecnologia', 'Ciências', 'História', 'Literatura Brasileira', 'Ficção'][index % 6],
  lastRead: book.progress && book.progress > 0 ? '2024-03-20' : '-',
  pages: book.pageCount || 200,
  rating: book.progress === 100 ? 5 : book.progress && book.progress > 50 ? 4 : 3,
  status: book.progress === 100 ? 'completed' : book.progress && book.progress > 0 ? 'reading' : 'wishlist',
  size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
  progress: book.progress || 0,
  format: book.format || 'pdf'
}));

const categories = ['Todos', 'Literatura', 'Literatura Brasileira', 'Ciências', 'História', 'Matemática', 'Geografia', 'Tecnologia', 'Ficção'];
const formats = ['Todos', 'pdf', 'epub'];

// Hero Section Component
const HeroSection = () => {
  const { theme } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselBookImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[500px] overflow-hidden">
      {/* Background Images */}
      {carouselBookImages.map((image, index) => (
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
            Biblioteca Digital
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Explore nossa coleção de livros e materiais didáticos
          </p>
          <button
            className="px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
            style={{
              backgroundColor: theme.colors.primary.DEFAULT,
              color: 'white'
            }}
          >
            Começar a Ler
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {carouselBookImages.map((_, index) => (
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

interface BookItem {
  id: string;
  title: string;
  author: string;
  description: string;
  cover: string;
  category: string;
  subject: string;
  pages: number;
  language: string;
  year: number;
  isbn?: string;
  publisher?: string;
  uploaded_by: string;
  uploaded_at: string;
  downloads: number;
  views: number;
  rating: number;
  reviews_count: number;
  file_size: string;
  file_type: 'pdf' | 'epub' | 'mobi';
  is_favorite?: boolean;
  reading_progress?: number;
}

interface BookCategory {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export default function PortalBooksPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFormat, setSelectedFormat] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [books, setBooks] = useState<BookItem[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');

  useEffect(() => {
    loadBooks();
    loadCategories();
  }, [filterCategory, filterSubject, sortBy]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      // Simular carregamento de dados
      setTimeout(() => {
        setBooks([
          {
            id: '1',
            title: 'Dom Casmurro',
            author: 'Machado de Assis',
            description: 'Um dos maiores clássicos da literatura brasileira, narra a história de Bentinho e Capitu.',
            cover: 'https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=Dom+Casmurro',
            category: 'Literatura Clássica',
            subject: 'Português',
            pages: 256,
            language: 'Português',
            year: 1899,
            isbn: '978-85-7232-406-7',
            publisher: 'Editora Globo',
            uploaded_by: 'Biblioteca Digital',
            uploaded_at: '2024-01-15',
            downloads: 1234,
            views: 3456,
            rating: 4.8,
            reviews_count: 89,
            file_size: '2.5 MB',
            file_type: 'pdf',
            is_favorite: true,
            reading_progress: 45
          },
          {
            id: '2',
            title: 'O Cortiço',
            author: 'Aluísio Azevedo',
            description: 'Romance naturalista que retrata a vida em um cortiço do Rio de Janeiro.',
            cover: 'https://via.placeholder.com/200x300/10B981/FFFFFF?text=O+Cortiço',
            category: 'Literatura Clássica',
            subject: 'Português',
            pages: 320,
            language: 'Português',
            year: 1890,
            uploaded_by: 'Biblioteca Digital',
            uploaded_at: '2024-01-20',
            downloads: 987,
            views: 2345,
            rating: 4.6,
            reviews_count: 67,
            file_size: '3.1 MB',
            file_type: 'pdf',
            is_favorite: false,
            reading_progress: 0
          },
          {
            id: '3',
            title: 'Matemática Básica - Volume 1',
            author: 'João Silva',
            description: 'Livro didático completo para o ensino fundamental de matemática.',
            cover: 'https://via.placeholder.com/200x300/F59E0B/FFFFFF?text=Matemática',
            category: 'Didático',
            subject: 'Matemática',
            pages: 450,
            language: 'Português',
            year: 2023,
            publisher: 'Editora Educação',
            uploaded_by: 'Prof. João Silva',
            uploaded_at: '2024-02-10',
            downloads: 567,
            views: 1890,
            rating: 4.9,
            reviews_count: 45,
            file_size: '15.2 MB',
            file_type: 'pdf',
            is_favorite: true,
            reading_progress: 78
          },
          {
            id: '4',
            title: 'História do Brasil Colonial',
            author: 'Maria Santos',
            description: 'Uma análise completa do período colonial brasileiro.',
            cover: 'https://via.placeholder.com/200x300/EF4444/FFFFFF?text=História',
            category: 'Didático',
            subject: 'História',
            pages: 380,
            language: 'Português',
            year: 2022,
            uploaded_by: 'Prof. Roberto Lima',
            uploaded_at: '2024-02-15',
            downloads: 432,
            views: 1567,
            rating: 4.7,
            reviews_count: 34,
            file_size: '8.7 MB',
            file_type: 'epub',
            is_favorite: false
          },
          {
            id: '5',
            title: 'Contos Infantis Brasileiros',
            author: 'Vários Autores',
            description: 'Coletânea de contos populares do folclore brasileiro.',
            cover: 'https://via.placeholder.com/200x300/8B5CF6/FFFFFF?text=Contos',
            category: 'Literatura Infantil',
            subject: 'Português',
            pages: 180,
            language: 'Português',
            year: 2024,
            uploaded_by: 'Biblioteca Digital',
            uploaded_at: '2024-03-01',
            downloads: 789,
            views: 2134,
            rating: 4.9,
            reviews_count: 56,
            file_size: '5.4 MB',
            file_type: 'pdf',
            is_favorite: true
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setCategories([
      { id: '1', name: 'Literatura Clássica', count: 45, icon: '📚' },
      { id: '2', name: 'Didático', count: 78, icon: '📖' },
      { id: '3', name: 'Literatura Infantil', count: 32, icon: '🧸' },
      { id: '4', name: 'Referência', count: 23, icon: '📔' },
      { id: '5', name: 'Paradidático', count: 19, icon: '📕' }
    ]);
  };

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || book.category === filterCategory;
      const matchesSubject = filterSubject === 'all' || book.subject === filterSubject;
      
      return matchesSearch && matchesCategory && matchesSubject;
    });
  }, [searchTerm, filterCategory, filterSubject, books]);

  const sortedBooks = useMemo(() => {
    return [...filteredBooks].sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [filteredBooks, sortBy]);

  const uniqueSubjects = useMemo(() => {
    return Array.from(new Set(books.map(b => b.subject)));
  }, [books]);

  const toggleFavorite = (bookId: string) => {
    setBooks(books.map(book => 
      book.id === bookId ? { ...book, is_favorite: !book.is_favorite } : book
    ));
  };

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <ProtectedRoute requiredRole={[UserRole.STUDENT, UserRole.TEACHER, UserRole.ACADEMIC_COORDINATOR]}>
      <HeroSection />
      <PageLayout
        title="Biblioteca Digital"
        description="Explore e gerencie seus livros digitais"
        breadcrumbs={[
          { label: 'Portal', href: '/portal' },
          { label: 'Biblioteca' }
        ]}
      >
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total de Livros"
            value={books.length.toString()}
            icon={<Book className="h-6 w-6 text-gray-600" />}
          />
          <StatCard
            title="Downloads"
            value={books.reduce((acc, b) => acc + b.downloads, 0).toString()}
            icon={<Download className="h-6 w-6 text-blue-600" />}
          />
          <StatCard
            title="Favoritos"
            value={books.filter(b => b.is_favorite).length.toString()}
            icon={<Heart className="h-6 w-6 text-red-600" />}
          />
          <StatCard
            title="Em Leitura"
            value={books.filter(b => b.reading_progress && b.reading_progress > 0).length.toString()}
            icon={<Bookmark className="h-6 w-6 text-green-600" />}
          />
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/portal/books/favorites">
            <Button variant="outline" leftIcon={<Heart className="w-4 h-4" />}>
              Favoritos
            </Button>
          </Link>
          <Link href="/portal/books/highlights">
            <Button variant="outline" leftIcon={<Star className="w-4 h-4" />}>
              Destaques
            </Button>
          </Link>
          <Link href="/portal/books/annotations">
            <Button variant="outline" leftIcon={<PencilSquareIcon className="w-4 h-4" />}>
              Anotações
            </Button>
          </Link>
          <Link href="/portal/books/content">
            <Button variant="outline" leftIcon={<Bookmark className="w-4 h-4" />}>
              Marcadores
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <ContentSection className="mb-6">
          <div className="space-y-4">
            {/* Search and View Controls */}
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar livros, autores..."
                className="flex-1"
              />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<Filter className="h-4 w-4" />}
                >
                  Filtros
                </Button>
                
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                    }`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['all', ...categories.map(c => c.name)].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Disciplina
                  </label>
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['all', ...uniqueSubjects].map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </ContentSection>

        {/* Barra de ações */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex w-full md:w-auto gap-2">
            <div className="relative flex-grow md:flex-grow-0">
              <input
                type="text"
                placeholder="Buscar livros, autores..."
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
          
          <div className="flex gap-2">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Grade
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Lista
              </button>
            </div>
            {user?.role === 'TEACHER' && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-1 px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors"
              >
                <Upload className="h-4 w-4" />
                Enviar Livro
              </button>
            )}
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="popular">Mais Baixados</option>
                  <option value="rating">Melhor Avaliados</option>
                  <option value="title">Título (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Grid/Lista de livros */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
              </div>
            ) : sortedBooks.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Book className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Nenhum livro encontrado</p>
              </div>
            ) : (
              sortedBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-64 object-cover"
                    />
                    {book.reading_progress && book.reading_progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
                        <div className="flex items-center justify-between text-white text-xs mb-1">
                          <span>Leitura: {book.reading_progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1">
                          <div 
                            className="bg-green-500 h-1 rounded-full"
                            style={{ width: `${book.reading_progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => toggleFavorite(book.id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Heart className={`h-4 w-4 ${book.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">{book.author}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      {renderRatingStars(book.rating)}
                      <span className="text-xs text-slate-500">({book.reviews_count})</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span>{book.pages} páginas</span>
                      <span className="uppercase">{book.file_type}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors">
                        <Download className="h-4 w-4" />
                        Baixar
                      </button>
                      <button className="flex items-center justify-center px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
              </div>
            ) : sortedBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <Book className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">Nenhum livro encontrado</p>
              </div>
            ) : (
              sortedBooks.map((book) => (
                <div key={book.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-6">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-32 h-48 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold text-slate-800 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-slate-600 mb-2">por {book.author}</p>
                        </div>
                        <button
                          onClick={() => toggleFavorite(book.id)}
                          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                          <Heart className={`h-5 w-5 ${book.is_favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {book.description}
                      </p>
                      
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          {renderRatingStars(book.rating)}
                          <span className="text-sm text-slate-500">({book.reviews_count} avaliações)</span>
                        </div>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-500">{book.downloads} downloads</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                        <span><strong>Categoria:</strong> {book.category}</span>
                        <span><strong>Páginas:</strong> {book.pages}</span>
                        <span><strong>Idioma:</strong> {book.language}</span>
                        <span><strong>Formato:</strong> {book.file_type.toUpperCase()}</span>
                        <span><strong>Tamanho:</strong> {book.file_size}</span>
                      </div>
                      
                      {book.reading_progress && book.reading_progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-600">Progresso de leitura</span>
                            <span className="font-medium">{book.reading_progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${book.reading_progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors">
                          <Download className="h-4 w-4" />
                          Baixar ({book.file_size})
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                          <Eye className="h-4 w-4" />
                          Ler Online
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                          <Share2 className="h-4 w-4" />
                          Compartilhar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </PageLayout>
    </ProtectedRoute>
  );
}
