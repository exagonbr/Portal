'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Search,
  Grid,
  List,
  Filter,
  Upload,
  BookOpen,
  Settings,
  Eye,
  Star,
  Clock,
  TrendingUp,
  Download,
  Users,
  Book,
  Library
} from 'lucide-react';
import BookCard from '../../../components/BookCard';
import ImportFilesModal from '../../../components/ImportFilesModal';
import { s3Service } from '../../../services/s3Service';
import { useToast } from '../../../components/Toast';
import SimpleCarousel from '../../../components/SimpleCarousel';
import OptimizedViewer from '../../../components/books/BookViewer/OptimizedViewer';
import { apiService } from '../../../services/api';

interface BookType {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  publication_year?: number;
  language?: string;
  pages?: number;
  category?: string;
  cover_url?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  status: 'available' | 'unavailable';
  institution_id: string;
  institution_name?: string;
  created_at: string;
  updated_at: string;
  progress?: number;
}

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

const carouselBookImages: string[] = [
  '/images/books/book1.jpg',
  '/images/books/book2.jpg',
  '/images/books/book3.jpg'
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

  const [books, setBooks] = useState<BookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<BookType | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const { showToast } = useToast();

  // Carregar livros da API
  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const response = await apiService.getBooks({
          search: filters.search || undefined
        });

        if (response.success && Array.isArray(response.data)) {
          setBooks(response.data);
        } else {
          setBooks([]);
          showToast({ type: 'error', message: 'Erro ao carregar livros' });
        }
      } catch (error) {
        console.error('Erro ao carregar livros:', error);
        showToast({ type: 'error', message: 'Erro ao carregar livros' });
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, [filters.search, showToast]);

  // Filtrar e ordenar livros
  const filteredBooks = useMemo(() => {
    let result = [...books];

    // Filtro de formato
    if (filters.format !== 'all') {
      result = result.filter(book => book.file_type?.toUpperCase() === filters.format);
    }

    // Filtro por tipo de progresso (simulado - seria necessário implementar no backend)
    if (filters.showType !== 'all') {
      // Por enquanto, todos os livros são considerados "não iniciados"
      // Isso seria implementado com dados reais de progresso do usuário
      if (filters.showType !== 'notStarted') {
        result = [];
      }
    }

    // Ordenação
    return result.sort((a, b) => {
      switch (filters.orderBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
  }, [books, filters]);

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
        
        // Recarregar livros após importação
        const booksResponse = await apiService.getBooks({ search: undefined });
        if (booksResponse.success && Array.isArray(booksResponse.data)) {
          setBooks(booksResponse.data);
        }
      } catch (error) {
        console.error(error);
        showToast({ 
          type: 'error', 
          message: `Erro ao enviar ${file.name}: ${error instanceof Error ? error.message : error}` 
        });
      }
    }
  };

  const handleBookOpen = useCallback((book: BookType) => {
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
      
      if (!book.file_type || (book.file_type.toLowerCase() !== 'pdf' && book.file_type.toLowerCase() !== 'epub')) {
        console.error('❌ Formato do livro inválido:', book.file_type);
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

  const updateFilters = (updates: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <div className="bg-background-card border-b border-border-light sticky top-0 z-10 backdrop-blur-xl">
        <div className="container-responsive py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <Library className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="page-title">Biblioteca Digital</h1>
                <p className="page-subtitle">Acesse seus livros e materiais educacionais</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="button-primary group inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Importar Livros
              </button>
              <button className="button-icon">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar livros por título, autor ou editora..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="input-field-modern pl-10"
              />
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="input-field-modern min-w-[150px]"
              >
                <option value="all">Todas as matérias</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.showType}
                onChange={(e) => updateFilters({ showType: e.target.value as any })}
                className="input-field-modern min-w-[150px]"
              >
                {showTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.orderBy}
                onChange={(e) => updateFilters({ orderBy: e.target.value })}
                className="input-field-modern min-w-[120px]"
              >
                <option value="title">Título</option>
                <option value="author">Autor</option>
                <option value="recent">Recentes</option>
              </select>
              
              <div className="flex items-center gap-1 bg-background-tertiary rounded-xl p-1">
                <button
                  onClick={() => updateFilters({ view: 'grid' })}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    filters.view === 'grid' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-text-secondary hover:text-primary hover:bg-background-hover'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => updateFilters({ view: 'list' })}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    filters.view === 'list' 
                      ? 'bg-primary text-white shadow-lg' 
                      : 'text-text-secondary hover:text-primary hover:bg-background-hover'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              
              <button className="button-icon">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured Carousel */}
            <div className="card-modern overflow-hidden">
              <div className="p-6">
                <h2 className="section-title mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent-yellow" />
                  Livros em Destaque
                </h2>
                <SimpleCarousel images={carouselBookImages} />
              </div>
            </div>

            {/* Books Grid/List */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">
                  Minha Biblioteca ({filteredBooks.length} livros)
                </h2>
                <div className="text-sm text-text-tertiary">
                  Ordenado por: {
                    filters.orderBy === 'title' ? 'Título' :
                    filters.orderBy === 'author' ? 'Autor' : 'Recentes'
                  }
                </div>
              </div>
              
              {filteredBooks.length > 0 ? (
                <div className={
                  filters.view === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }>
                  {filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className={
                        filters.view === 'list'
                          ? 'card hover-lift cursor-pointer'
                          : 'group'
                      }
                      onClick={() => handleBookOpen(book)}
                    >
                      {filters.view === 'list' ? (
                        <div className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors line-clamp-1">
                                {book.title}
                              </h3>
                              <p className="text-sm text-text-secondary mt-1">
                                por {book.author}
                              </p>
                              <p className="text-xs text-text-tertiary mt-1">
                                {book.publisher}
                              </p>
                              
                              {book.progress !== undefined && (
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                                    <span>Progresso</span>
                                    <span>{book.progress}%</span>
                                  </div>
                                  <div className="w-full bg-background-tertiary rounded-full h-2">
                                    <div 
                                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${book.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <span className={`badge ${
                                book.file_type?.toUpperCase() === 'PDF' ? 'badge-primary' : 'badge-info'
                              }`}>
                                {book.file_type?.toUpperCase() || 'PDF'}
                              </span>
                              <button className="button-icon opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <BookCard 
                          book={book} 
                          onOpen={() => handleBookOpen(book)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-2">
                    Nenhum livro encontrado
                  </h3>
                  <p className="text-text-secondary mb-6">
                    Tente ajustar os filtros ou importe novos livros para sua biblioteca
                  </p>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="button-primary"
                  >
                    Importar Livros
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="card-modern">
              <div className="p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Estatísticas
                </h3>
                
                <div className="space-y-4">
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Total de Livros</p>
                        <p className="stat-value text-primary">{books.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Book className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Em Progresso</p>
                        <p className="stat-value text-secondary">
                          {books.filter(b => b.progress && b.progress > 0 && b.progress < 100).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Concluídos</p>
                        <p className="stat-value text-accent-green">
                          {books.filter(b => b.progress === 100).length}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-accent-green" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-modern">
              <div className="p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent-orange" />
                  Atividade Recente
                </h3>
                
                <div className="space-y-3">
                  {books.slice(0, 4).map((book, index) => (
                    <div key={book.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-background-hover transition-colors cursor-pointer">
                      <div className="w-8 h-10 bg-gradient-to-br from-primary/20 to-secondary/20 rounded flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary line-clamp-1">
                          {book.title}
                        </p>
                        <p className="text-xs text-text-tertiary">
                          {book.author}
                        </p>
                      </div>
                      {book.progress !== undefined && (
                        <div className="text-xs text-text-tertiary">
                          {book.progress}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card-modern">
              <div className="p-6">
                <h3 className="font-bold text-text-primary mb-4">Ações Rápidas</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-background-hover transition-colors text-left group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-text-primary font-medium">Importar Livros</span>
                  </button>
                  
                  <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-background-hover transition-colors text-left group">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <Download className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-text-primary font-medium">Baixar Offline</span>
                  </button>
                  
                  <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-background-hover transition-colors text-left group">
                    <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center group-hover:bg-accent-green/20 transition-colors">
                      <Users className="w-5 h-5 text-accent-green" />
                    </div>
                    <span className="text-text-primary font-medium">Compartilhar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <ImportFilesModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
          acceptedTypes={['.pdf', '.epub']}
          maxFiles={10}
          title="Importar Livros"
          description="Selecione arquivos PDF ou EPUB para adicionar à sua biblioteca"
        />
      )}

      {/* Book Viewer */}
      {isViewerOpen && selectedBook && (
        <OptimizedViewer
          book={selectedBook}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
          onAnnotationAdd={handleAnnotationAdd}
        />
      )}
    </div>
  );
}
