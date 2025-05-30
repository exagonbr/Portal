'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  Square2StackIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import BookCard from '../../../components/BookCard';
import { mockBooks, Book } from '../../../constants/mockData';
import ImportFilesModal from '../../../components/ImportFilesModal';
import { s3Service } from '../../../services/s3Service';
import { useToast } from '../../../components/Toast';
import SimpleCarousel from '../../../components/SimpleCarousel';
import { carouselBookImages } from '../../../constants/mockData';
import OptimizedViewer from '../../../components/books/BookViewer/OptimizedViewer';

const carouselSettings = {
  slidesToShow: 6,
  slidesToScroll: 1,
  infinite: true,
  dots: true,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 5000,
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

interface Filters {
  search: string;
  view: 'grid' | 'list' | 'cover';
  orderBy: string;
  category: string;
  showType: 'all' | 'inProgress' | 'completed' | 'notStarted';
}

const categories = ['all', 'Matemática', 'Física', 'Biologia', 'História', 'Geografia', 'Literatura'];
const showTypes = [
  { value: 'all', label: 'Todos' },
  { value: 'inProgress', label: 'Em Progresso' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'notStarted', label: 'Não Iniciados' }
];

export default function BooksPage() {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    view: 'grid',
    orderBy: 'title',
    category: 'all',
    showType: 'all'
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const { showToast } = useToast();

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...mockBooks];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.publisher.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter based on book title
    if (filters.category !== 'all') {
      result = result.filter(book => 
        book.title.includes(filters.category)
      );
    }

    // Apply show type filter based on progress
    if (filters.showType !== 'all') {
      switch (filters.showType) {
        case 'inProgress':
          result = result.filter(book => book.progress && book.progress > 0 && book.progress < 100);
          break;
        case 'completed':
          result = result.filter(book => book.progress === 100);
          break;
        case 'notStarted':
          result = result.filter(book => !book.progress || book.progress === 0);
          break;
      }
    }

    // Sort books
    return result.sort((a, b) => {
      switch (filters.orderBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'progress':
          return ((b.progress || 0) - (a.progress || 0));
        default:
          return 0;
      }
    });
  }, [filters]);

  const handleImport = async (files: File[]) => {
    if (!window.confirm(`Confirma a importação de ${files.length} arquivo(s)?`)) {
      return;
    }

    for (const file of files) {
      try {
        // Determine content type based on file type
        const contentTypeMap: Record<string, any> = {
          'application/pdf': 'PDF',
          'application/epub+zip': 'EPUB'
        };
        const contentType = contentTypeMap[file.type] || 'PDF';

        // Initiate upload to get presigned URL
        const { uploadUrl } = await s3Service.initiateUpload(file, {
          title: file.name,
          type: contentType
        });

        // Upload file to presigned URL
        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        if (!response.ok) {
          throw new Error(`Falha ao enviar o arquivo ${file.name}`);
        }

        console.log(`Arquivo ${file.name} enviado com sucesso.`);
      } catch (error) {
        console.error(error);
        showToast({ type: 'error', message: `Erro ao enviar o arquivo ${file.name}: ${error instanceof Error ? error.message : error}` });
      }
    }
  };

  const handleBookOpen = useCallback((book: Book) => {
    setSelectedBook(book);
    setIsViewerOpen(true);
  }, []);

  const handleCloseViewer = useCallback(() => {
    setIsViewerOpen(false);
    setSelectedBook(null);
  }, []);

  const handleAnnotationAdd = useCallback((annotation: any) => {
    console.log('Anotação adicionada:', annotation);
    showToast({ type: 'success', message: 'Anotação adicionada com sucesso!' });
  }, [showToast]);

  const handleHighlightAdd = useCallback((highlight: any) => {
    console.log('Destaque adicionado:', highlight);
    showToast({ type: 'success', message: 'Destaque adicionado com sucesso!' });
  }, [showToast]);

  const handleBookmarkAdd = useCallback((bookmark: any) => {
    console.log('Marcador adicionado:', bookmark);
    showToast({ type: 'success', message: 'Marcador adicionado com sucesso!' });
  }, [showToast]);

  // Se o visualizador estiver aberto, mostrar apenas ele
  if (isViewerOpen && selectedBook) {
    return (
      <div className="h-screen w-full">
        <OptimizedViewer
          book={selectedBook}
          onBack={handleCloseViewer}
          onAnnotationAdd={handleAnnotationAdd}
          onHighlightAdd={handleHighlightAdd}
          onBookmarkAdd={handleBookmarkAdd}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* Hero Section with Featured Carousel */}
      <section className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] bg-gradient-to-b from-gray-900 to-gray-800">
        <SimpleCarousel images={carouselBookImages} autoplaySpeed={3000} />
      </section>

      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        {/* Main Filters */}
        <div className="px-2 sm:px-4 py-2 sm:py-3 space-y-2 sm:space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            {/* Search Bar */}
            <div className="flex-1 w-full sm:max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                  placeholder="Procurar por título, autor ou editora"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* View Toggle & Sort */}
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: 'grid' }))}
                  className={`p-2 rounded-md transition-all ${
                    filters.view === 'grid'
                      ? 'bg-white shadow text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Visualização em grade"
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: 'list' }))}
                  className={`p-2 rounded-md transition-all ${
                    filters.view === 'list'
                      ? 'bg-white shadow text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Visualização em lista"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: 'cover' }))}
                  className={`p-2 rounded-md transition-all ${
                    filters.view === 'cover'
                      ? 'bg-white shadow text-primary'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Visualização em Capa"
                >
                  <Square2StackIcon className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors duration-200"
              >
                Importar
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, category: e.target.value }))
                }
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent bg-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Todas as Categorias' : category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {showTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() =>
                    setFilters(prev => ({
                      ...prev,
                      showType: type.value as Filters['showType']
                    }))
                  }
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    filters.showType === type.value
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <select
              value={filters.orderBy}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, orderBy: e.target.value }))
              }
              className="p-1.5 sm:p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-transparent bg-white text-sm"
            >
              <option value="title">Título</option>
              <option value="author">Autor</option>
              <option value="progress">Progresso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="p-4">
        <div
          className={`${
            filters.view === 'cover'
              ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3 sm:gap-4'
              : filters.view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }`}
        >
          {filteredBooks.map(book => (
            <div key={book.id} className="h-full">
              <BookCard
                viewMode={filters.view}
                id={book.id}
                thumbnail={book.thumbnail}
                title={book.title}
                author={book.author}
                publisher={book.publisher}
                synopsis={book.synopsis}
                duration={book.duration}
                progress={book.progress}
                format={book.format}
                pageCount={book.pageCount}
                onBookOpen={() => handleBookOpen(book)}
              />
            </div>
          ))}
        </div>

        {/* No Books Message */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhum livro encontrado para os filtros selecionados.
            </p>
          </div>
        )}
      </div>

      <ImportFilesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
