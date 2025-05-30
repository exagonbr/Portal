'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  Square2StackIcon,
  DocumentArrowUpIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import BookCard from '../../../components/BookCard';
import { mockBooks, Book } from '../../../constants/mockData';
import ImportFilesModal from '../../../components/ImportFilesModal';
import { s3Service } from '../../../services/s3Service';
import { useToast } from '../../../components/Toast';
import SimpleCarousel from '../../../components/SimpleCarousel';
import { carouselBookImages } from '../../../constants/mockData';
import OptimizedViewer from '../../../components/books/BookViewer/OptimizedViewer';

interface Filters {
  search: string;
  view: 'grid' | 'list' | 'cover';
  category: string;
  format: string;
  orderBy: string;
  showType: 'all' | 'inProgress' | 'completed' | 'notStarted';
}

const categories = ['all', 'Matemática', 'Física', 'Biologia', 'História', 'Geografia', 'Literatura'];
const formats = ['all', 'PDF', 'EPUB'];
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
    category: 'all',
    format: 'all',
    orderBy: 'title',
    showType: 'all'
  });

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const { showToast } = useToast();

  // Filtrar e ordenar livros
  const filteredBooks = useMemo(() => {
    let result = [...mockBooks];

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower) ||
          book.publisher.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de categoria
    if (filters.category !== 'all') {
      result = result.filter(book => 
        book.title.includes(filters.category)
      );
    }

    // Filtro de formato
    if (filters.format !== 'all') {
      result = result.filter(book => book.format?.toUpperCase() === filters.format);
    }

    // Filtro por tipo de progresso
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

    // Ordenação
    return result.sort((a, b) => {
      switch (filters.orderBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'progress':
          return ((b.progress || 0) - (a.progress || 0));
        case 'recent':
          return a.id.localeCompare(b.id);
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
        const contentTypeMap: Record<string, any> = {
          'application/pdf': 'PDF',
          'application/epub+zip': 'EPUB'
        };
        const contentType = contentTypeMap[file.type] || 'PDF';

        const { uploadUrl } = await s3Service.initiateUpload(file, {
          title: file.name,
          type: contentType
        });

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

        showToast({ type: 'success', message: `${file.name} importado com sucesso!` });
      } catch (error) {
        console.error(error);
        showToast({ 
          type: 'error', 
          message: `Erro ao enviar ${file.name}: ${error instanceof Error ? error.message : error}` 
        });
      }
    }
  };

  const handleBookOpen = useCallback((book: Book) => {
    try {
      console.log('📖 Tentando abrir livro:', book);
      
      // Verificações de segurança
      if (!book) {
        console.error('❌ Livro não definido');
        showToast({ type: 'error', message: 'Erro: Dados do livro não disponíveis' });
        return;
      }
      
      if (!book.id) {
        console.error('❌ ID do livro não definido');
        showToast({ type: 'error', message: 'Erro: ID do livro inválido' });
        return;
      }
      
      if (!book.format || (book.format !== 'pdf' && book.format !== 'epub')) {
        console.error('❌ Formato do livro inválido:', book.format);
        showToast({ type: 'error', message: 'Erro: Formato de livro não suportado' });
        return;
      }
      
      console.log('✅ Livro válido, abrindo viewer...');
      setSelectedBook(book);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('💥 Erro ao abrir livro:', error);
      showToast({ 
        type: 'error', 
        message: `Erro ao abrir livro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    }
  }, [showToast]);

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
    // Verificação adicional de segurança
    if (!selectedBook || !selectedBook.id) {
      console.error('❌ Erro: selectedBook inválido no render');
      setIsViewerOpen(false);
      setSelectedBook(null);
      showToast({ type: 'error', message: 'Erro: Dados do livro corrompidos' });
      return null;
    }

    return (
      <div className="h-screen w-full overflow-hidden">
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
    <div className="min-h-screen bg-gray-50">
      {/* Seção Hero com Carrossel - Sem título sobreposto */}
      <section className="relative w-full h-[300px] lg:h-[350px] bg-gradient-to-b from-gray-900 to-gray-800 mb-6">
        <SimpleCarousel images={carouselBookImages} autoplaySpeed={4000} />
      </section>

      {/* Barra de Filtros Aprimorada */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Linha principal com busca e controles */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
            
            {/* Barra de Busca */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Buscar por título, autor ou editora..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Controles de Visualização e Botão Importar */}
            <div className="flex flex-wrap gap-3 items-center">
              
              {/* Toggle de Visualização */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, view: 'grid' }))}
                  className={`p-2 rounded-md transition-all ${
                    filters.view === 'grid'
                      ? 'bg-white shadow text-blue-600'
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
                      ? 'bg-white shadow text-blue-600'
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
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Visualização em capa"
                >
                  <Square2StackIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Botão Importar */}
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                Importar Livros
              </button>
            </div>
          </div>

          {/* Segunda linha com filtros */}
          <div className="flex flex-wrap gap-3 items-center">
            
            {/* Filtro Categoria */}
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas as Categorias' : category}
                </option>
              ))}
            </select>

            {/* Filtro Formato */}
            <select
              value={filters.format}
              onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {formats.map(format => (
                <option key={format} value={format}>
                  {format === 'all' ? 'Todos os Formatos' : format}
                </option>
              ))}
            </select>

            {/* Filtros de Progresso */}
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
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filters.showType === type.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Ordenação */}
            <select
              value={filters.orderBy}
              onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="title">Título</option>
              <option value="author">Autor</option>
              <option value="progress">Progresso</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid de Livros com Layout Responsivo */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div
          className={`${
            filters.view === 'cover'
              ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4'
              : filters.view === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
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

        {/* Mensagem quando não há livros */}
        {filteredBooks.length === 0 && (
          <div className="text-center py-12">
            <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum livro encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente ajustar os filtros ou importar novos livros.
            </p>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 inline-flex items-center gap-2"
            >
              <DocumentArrowUpIcon className="w-5 h-5" />
              Importar Primeiro Livro
            </button>
          </div>
        )}

        {/* Espaço adicional no final para garantir rolagem completa */}
        <div className="h-20"></div>
      </div>

      {/* Modal de Importação */}
      <ImportFilesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
