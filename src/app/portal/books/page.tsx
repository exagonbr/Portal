'use client';

import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon,
  Square2StackIcon,
  DocumentArrowUpIcon,
  BookOpenIcon,
  HeartIcon,
  ChatBubbleBottomCenterTextIcon,
  BookmarkIcon,
  FolderIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
  Bars4Icon,
  DocumentTextIcon,
  ArchiveBoxIcon,
  CloudArrowUpIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  ListBulletIcon,
  TableCellsIcon,
  RectangleStackIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import BookCard from '../../../components/BookCard';
import { mockBooks, Book } from '../../../constants/mockData';
import ImportFilesModal from '../../../components/ImportFilesModal';
import { s3Service } from '../../../services/s3Service';
import { useToast } from '../../../components/Toast';
import SimpleCarousel from '../../../components/SimpleCarousel';
import { carouselBookImages } from '../../../constants/mockData';
import dynamic from 'next/dynamic';

// Importação dinâmica do KoodoViewer para evitar problemas de SSR e hot reload
const KoodoViewer = dynamic(() => import('../../../components/books/BookViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Carregando visualizador...</p>
      </div>
    </div>
  ),
});

// Tipos do sistema de roteamento (copiado do koodo-reader)
type RouteType = 'home' | 'pdf' | 'epub' | 'favorites' | 'highlights' | 'annotations' | 'content' | 'trash' | 'settings' | 'about';

interface RouteState {
  type: RouteType;
  id?: string;
  title?: string;
  file?: string;
  bookId?: string;
}

interface Filters {
  search: string;
  view: 'grid' | 'list' | 'cover' | 'table';
  category: string;
  format: string;
  orderBy: string;
  showType: 'all' | 'inProgress' | 'completed' | 'notStarted';
}

// Menu lateral (copiado exatamente do koodo-reader)
const sidebarMenuItems = [
  {
    id: 'home',
    label: 'Biblioteca',
    icon: BookOpenIcon,
    route: 'home',
    count: 0
  },
  {
    id: 'favorites',
    label: 'Favoritos',
    icon: HeartIcon,
    route: 'favorites',
    count: 0
  },
  {
    id: 'highlights',
    label: 'Destaques',
    icon: PencilIcon,
    route: 'highlights',
    count: 0
  },
  {
    id: 'annotations',
    label: 'Anotações',
    icon: ChatBubbleBottomCenterTextIcon,
    route: 'annotations',
    count: 0
  },
  {
    id: 'bookmarks',
    label: 'Marcadores',
    icon: BookmarkIcon,
    route: 'content',
    count: 0
  }
];

const bottomMenuItems = [
  {
    id: 'settings',
    label: 'Configurações',
    icon: Cog6ToothIcon,
    route: 'settings'
  },
  {
    id: 'about',
    label: 'Sobre',
    icon: QuestionMarkCircleIcon,
    route: 'about'
  }
];

const categories = ['all', 'Matemática', 'Física', 'Biologia', 'História', 'Geografia', 'Literatura'];
const formats = ['all', 'PDF', 'EPUB'];
const showTypes = [
  { value: 'all', label: 'Todos' },
  { value: 'inProgress', label: 'Em Progresso' },
  { value: 'completed', label: 'Concluídos' },
  { value: 'notStarted', label: 'Não Iniciados' }
];

const sortOptions = [
  { value: 'title', label: 'Título' },
  { value: 'author', label: 'Autor' },
  { value: 'progress', label: 'Progresso' },
  { value: 'recent', label: 'Mais Recentes' },
  { value: 'size', label: 'Tamanho' },
  { value: 'date', label: 'Data' }
];

export default function BooksPage() {
  // Debug logs para rastrear problemas de importação
  console.log('📊 BooksPage iniciando...');
  console.log('📊 KoodoViewer carregado:', !!KoodoViewer, typeof KoodoViewer);

  // Estado de roteamento (copiado do koodo-reader)
  const [currentRoute, setCurrentRoute] = useState<RouteState>({ type: 'home' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados existentes
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
  const [isViewerReady, setIsViewerReady] = useState(false);

  const { showToast } = useToast();

  // Verificar se o viewer está pronto após montagem
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsViewerReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Modo de recuperação para desenvolvimento
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
          console.log('🔄 Recarregamento forçado do viewer...');
          setIsViewerReady(false);
          setIsViewerOpen(false);
          setTimeout(() => {
            setIsViewerReady(true);
          }, 500);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  // Sistema de navegação (copiado do koodo-reader)
  const navigateTo = useCallback((route: RouteState) => {
    console.log('🧭 Navegando para:', route);
    setCurrentRoute(route);
    
    // Se for abrir um livro, preparar viewer
    if ((route.type === 'pdf' || route.type === 'epub') && route.id) {
      const book = mockBooks.find(b => b.id === route.id);
      if (book) {
        setSelectedBook(book);
        setIsViewerOpen(true);
      }
    } else {
      setIsViewerOpen(false);
      setSelectedBook(null);
    }
  }, []);

  // Filtrar e ordenar livros baseado na rota atual
  const filteredBooks = useMemo(() => {
    let result = [...mockBooks];

    // Filtros baseados na rota (copiado do koodo-reader)
    switch (currentRoute.type) {
      case 'favorites':
        // Implementar filtro de favoritos
        result = result.filter(book => book.id.includes('1') || book.id.includes('3')); // Mock
        break;
      case 'trash':
        result = []; // Mock: nenhum livro na lixeira
        break;
      case 'home':
      default:
        // Mostrar todos os livros
        break;
    }

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
        case 'size':
          return (b.pageCount || 0) - (a.pageCount || 0);
        case 'date':
          return a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });
  }, [filters, currentRoute.type]);

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
      console.log('📖 Abrindo livro com sistema koodo-reader:', book);
      
      if (!book || !book.id) {
        showToast({ type: 'error', message: 'Erro: Dados do livro inválidos' });
        return;
      }
      
      if (!book.format || (book.format !== 'pdf' && book.format !== 'epub')) {
        showToast({ type: 'error', message: 'Erro: Formato não suportado' });
        return;
      }
      
      // Navegar usando o sistema de rotas do koodo-reader
      const route: RouteState = {
        type: book.format as 'pdf' | 'epub',
        id: book.id,
        title: book.title,
        file: book.id,
        bookId: book.id
      };
      
      navigateTo(route);
    } catch (error) {
      console.error('💥 Erro ao abrir livro:', error);
      showToast({ 
        type: 'error', 
        message: `Erro ao abrir livro: ${error instanceof Error ? error.message : 'Erro desconhecido'}` 
      });
    }
  }, [navigateTo, showToast]);

  const handleCloseViewer = useCallback(() => {
    console.log('📖 Fechando KoodoViewer e voltando para biblioteca');
    navigateTo({ type: 'home' });
  }, [navigateTo]);

  const handleAnnotationAdd = useCallback((annotation: any) => {
    console.log('📝 Anotação adicionada via KoodoViewer:', annotation);
    showToast({ type: 'success', message: 'Anotação adicionada com sucesso!' });
  }, [showToast]);

  const handleHighlightAdd = useCallback((highlight: any) => {
    console.log('🎨 Destaque adicionado via KoodoViewer:', highlight);
    showToast({ type: 'success', message: 'Destaque adicionado com sucesso!' });
  }, [showToast]);

  const handleBookmarkAdd = useCallback((bookmark: any) => {
    console.log('🔖 Marcador adicionado via KoodoViewer:', bookmark);
    showToast({ type: 'success', message: 'Marcador adicionado com sucesso!' });
  }, [showToast]);

  // Atualizar contadores dos menus (copiado do koodo-reader)
  const updatedSidebarItems = useMemo(() => {
    return sidebarMenuItems.map(item => {
      let count = 0;
      switch (item.id) {
        case 'home':
          count = mockBooks.length;
          break;
        case 'favorites':
          count = mockBooks.filter(b => b.id.includes('1') || b.id.includes('3')).length; // Mock
          break;
        case 'highlights':
          count = 23; // Mock
          break;
        case 'annotations':
          count = 15; // Mock
          break;
        case 'bookmarks':
          count = 8; // Mock
          break;
        case 'trash':
          count = 0; // Mock
          break;
      }
      return { ...item, count };
    });
  }, []);

  // Título da página baseado na rota (copiado do koodo-reader)
  const getPageTitle = () => {
    switch (currentRoute.type) {
      case 'home':
        return 'Biblioteca';
      case 'favorites':
        return 'Favoritos';
      case 'highlights':
        return 'Destaques';
      case 'annotations':
        return 'Anotações';
      case 'content':
        return 'Marcadores';
      case 'trash':
        return 'Lixeira';
      case 'settings':
        return 'Configurações';
      case 'about':
        return 'Sobre';
      case 'pdf':
      case 'epub':
        return currentRoute.title || 'Livro';
      default:
        return 'Koodo Reader';
    }
  };

  // Se o visualizador estiver aberto, mostrar apenas o KoodoViewer
  if (isViewerOpen && selectedBook) {
    // Aguardar componente estar pronto
    if (!isViewerReady) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="text-center">
            <div className="animate-pulse rounded-full h-16 w-16 bg-blue-500 mx-auto mb-4"></div>
            <p className="text-white text-lg">Preparando visualizador...</p>
          </div>
        </div>
      );
    }

    // Verificar se o KoodoViewer foi carregado corretamente
    if (!KoodoViewer) {
      console.error('❌ KoodoViewer não foi carregado corretamente');
      return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-white text-lg mb-4">Erro ao carregar o visualizador</p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                🔄 Recarregar Página
              </button>
              <button
                onClick={handleCloseViewer}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Voltar à Biblioteca
              </button>
            </div>
          </div>
        </div>
      );
    }

    console.log('📖 Renderizando KoodoViewer para livro:', selectedBook.title);

    try {
      return (
        <div className="h-screen w-full overflow-hidden">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen bg-gray-900">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-white text-lg">Inicializando visualizador...</p>
                </div>
              </div>
            }
          >
            <KoodoViewer
              book={selectedBook}
              onBack={handleCloseViewer}
              onAnnotationAdd={handleAnnotationAdd}
              onHighlightAdd={handleHighlightAdd}
              onBookmarkAdd={handleBookmarkAdd}
            />
          </Suspense>
        </div>
      );
    } catch (error) {
      console.error('❌ Erro ao renderizar KoodoViewer:', error);
      return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <ExclamationTriangleIcon className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-white text-lg mb-4">Erro inesperado no visualizador</p>
            <button
              onClick={handleCloseViewer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Voltar à Biblioteca
            </button>
          </div>
        </div>
      );
    }
  }

  // Interface principal com sidebar (idêntica ao koodo-reader)
  return (
    <div className="flex h-full bg-gray-50 full-screen-content">
      {/* Overlay móvel */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header com botão mobile e título */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden mr-3 p-2 rounded-md hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
          </div>
          
          {/* Botão de fechar mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Renderizar conteúdo baseado na rota */}
        {currentRoute.type === 'home' && (
          <div className="flex-1 overflow-auto">
            {/* Seção Hero com Carrossel - apenas na home */}
            <section className="relative w-full h-[200px] lg:h-[250px] bg-gradient-to-b from-gray-900 to-gray-800">
              <SimpleCarousel images={carouselBookImages} autoplaySpeed={4000} />
            </section>

            {/* Filtros da biblioteca (copiados do koodo-reader) */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
              <div className="px-4 py-4">
                {/* Barra de busca */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-4">
                  <div className="flex-1 max-w-2xl">
                    <div className="relative">
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        placeholder="Buscar livros..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  {/* Controles de visualização */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, view: 'grid' }))}
                        className={`p-2 rounded-md transition-all ${
                          filters.view === 'grid'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Grade"
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
                        title="Lista"
                      >
                        <ListBulletIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, view: 'cover' }))}
                        className={`p-2 rounded-md transition-all ${
                          filters.view === 'cover'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Capas"
                      >
                        <RectangleStackIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setFilters(prev => ({ ...prev, view: 'table' }))}
                        className={`p-2 rounded-md transition-all ${
                          filters.view === 'table'
                            ? 'bg-white shadow text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                        title="Tabela"
                      >
                        <TableCellsIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <DocumentArrowUpIcon className="w-5 h-5" />
                      Importar
                    </button>
                  </div>
                </div>

                {/* Filtros secundários */}
                <div className="flex flex-wrap gap-3 items-center">
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'Todas as Categorias' : category}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.format}
                    onChange={(e) => setFilters(prev => ({ ...prev, format: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    {formats.map(format => (
                      <option key={format} value={format}>
                        {format === 'all' ? 'Todos os Formatos' : format}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.orderBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, orderBy: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
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
                </div>
              </div>
            </div>

            {/* Grid de livros */}
            <div className="flex-1 p-6">
              <div
                className={`${
                  filters.view === 'cover'
                    ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4'
                    : filters.view === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                    : filters.view === 'table'
                    ? 'overflow-x-auto'
                    : 'space-y-4'
                }`}
              >
                {filters.view === 'table' ? (
                  <table className="w-full bg-white rounded-lg shadow">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBooks.map(book => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img src={book.thumbnail} alt={book.title} className="w-10 h-14 object-cover rounded mr-4" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                <div className="text-sm text-gray-500">{book.publisher}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              book.format === 'pdf' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {book.format?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${book.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{book.progress || 0}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleBookOpen(book)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  filteredBooks.map(book => (
                    <div key={book.id} className="h-full">
                      <BookCard
                        viewMode={filters.view === 'table' ? 'grid' : filters.view}
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
                  ))
                )}
              </div>

              {/* Mensagem quando não há livros */}
              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    {currentRoute.type === 'home' ? 'Nenhum livro encontrado' : 'Seção vazia'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {currentRoute.type === 'home' 
                      ? 'Tente ajustar os filtros ou importar novos livros.'
                      : 'Não há itens nesta seção.'
                    }
                  </p>
                  {currentRoute.type === 'home' && (
                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <DocumentArrowUpIcon className="w-5 h-5" />
                      Importar Primeiro Livro
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Outras páginas do koodo-reader */}
        {currentRoute.type === 'favorites' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <HeartIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Seus Livros Favoritos</h3>
              <p className="text-gray-600">Adicione livros aos favoritos para vê-los aqui.</p>
            </div>
          </div>
        )}

        {currentRoute.type === 'highlights' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <PencilIcon className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Seus Destaques</h3>
              <p className="text-gray-600">Destaques dos seus livros aparecerão aqui.</p>
            </div>
          </div>
        )}

        {currentRoute.type === 'annotations' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Suas Anotações</h3>
              <p className="text-gray-600">Anotações dos seus livros aparecerão aqui.</p>
            </div>
          </div>
        )}

        {currentRoute.type === 'content' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <BookmarkIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Seus Marcadores</h3>
              <p className="text-gray-600">Marcadores dos seus livros aparecerão aqui.</p>
            </div>
          </div>
        )}

        {currentRoute.type === 'trash' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <TrashIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Lixeira</h3>
              <p className="text-gray-600">Livros removidos aparecerão aqui.</p>
            </div>
          </div>
        )}

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
