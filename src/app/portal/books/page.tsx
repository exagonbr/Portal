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
import Button from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/roles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { mockBooks as importedMockBooks, carouselBookImages } from '@/constants/mockData';

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

export default function PortalBooksPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFormat, setSelectedFormat] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter books
  const filteredBooks = useMemo(() => {
    return mockBooks.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || book.category === selectedCategory;
      const matchesFormat = selectedFormat === 'Todos' || book.format.toLowerCase() === selectedFormat.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesFormat;
    });
  }, [searchTerm, selectedCategory, selectedFormat]);

  // Statistics
  const stats = useMemo(() => ({
    total: mockBooks.length,
    reading: mockBooks.filter(b => b.status === 'reading').length,
    completed: mockBooks.filter(b => b.status === 'completed').length,
    wishlist: mockBooks.filter(b => b.status === 'wishlist').length
  }), []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="w-4 h-4 text-gray-300" />
      )
    ));
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      reading: { text: 'Lendo', className: 'bg-blue-100 text-blue-700' },
      completed: { text: 'Concluído', className: 'bg-green-100 text-green-700' },
      wishlist: { text: 'Lista de Desejos', className: 'bg-yellow-100 text-yellow-700' }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.className}`}>
        {badge.text}
      </span>
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
            value={stats.total.toString()}
            icon={<BookOpenIcon className="w-6 h-6 text-gray-600" />}
          />
          <StatCard
            title="Lendo Atualmente"
            value={stats.reading.toString()}
            icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
          />
          <StatCard
            title="Concluídos"
            value={stats.completed.toString()}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
          />
          <StatCard
            title="Lista de Desejos"
            value={stats.wishlist.toString()}
            icon={<BookmarkIcon className="w-6 h-6 text-yellow-600" />}
          />
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Link href="/portal/books/favorites">
            <Button variant="outline" leftIcon={<HeartIcon className="w-4 h-4" />}>
              Favoritos
            </Button>
          </Link>
          <Link href="/portal/books/highlights">
            <Button variant="outline" leftIcon={<StarIcon className="w-4 h-4" />}>
              Destaques
            </Button>
          </Link>
          <Link href="/portal/books/annotations">
            <Button variant="outline" leftIcon={<PencilSquareIcon className="w-4 h-4" />}>
              Anotações
            </Button>
          </Link>
          <Link href="/portal/books/content">
            <Button variant="outline" leftIcon={<BookmarkIcon className="w-4 h-4" />}>
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
                placeholder="Buscar livros ou autores..."
                className="flex-1"
              />
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowFilters(!showFilters)}
                  leftIcon={<FunnelIcon className="w-4 h-4" />}
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
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formato
                  </label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </ContentSection>

        {/* Books Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {filteredBooks.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Book Cover */}
                <div className="aspect-[3/4] bg-gray-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <BookOpenIcon className="w-16 h-16" />
                  </div>
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(book.status)}
                  </div>
                </div>
                
                {/* Book Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {book.category} • {book.pages} páginas • {book.format.toUpperCase()}
                  </p>
                  
                  {/* Progress */}
                  {book.status === 'reading' && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progresso</span>
                        <span>{book.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Rating */}
                  {book.rating > 0 && (
                    <div className="flex items-center mb-3">
                      {renderStars(book.rating)}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => router.push(`/portal/books/${book.id}`)}
                    >
                      {book.status === 'wishlist' ? 'Adicionar' : 'Abrir'}
                    </Button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <DocumentArrowDownIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ContentSection>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Livro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progresso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-14 bg-gray-100 rounded flex items-center justify-center mr-3">
                            <BookOpenIcon className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                            <div className="text-sm text-gray-500">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          {book.format.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500">{book.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(book.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mr-2"
                          onClick={() => router.push(`/portal/books/${book.id}`)}
                        >
                          Abrir
                        </Button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <DocumentArrowDownIcon className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ContentSection>
        )}

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum livro encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tente ajustar os filtros ou adicione um novo livro.
            </p>
          </div>
        )}
      </PageLayout>
    </ProtectedRoute>
  );
}
