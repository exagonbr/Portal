'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { mockBooks } from '@/constants/mockData';
import dynamic from 'next/dynamic';

// Importação dinâmica do KoodoViewer
const KoodoViewer = dynamic(
  () => import('@/components/books/BookViewer/KoodoViewer'),
  { ssr: false }
);

// Tipos para o sistema de roteamento (copiados do koodo-reader)
type RouteType = 'home' | 'pdf' | 'epub' | 'favorites' | 'highlights' | 'annotations' | 'content' | 'trash' | 'settings' | 'about';

interface RouteState {
  type: RouteType;
  id?: string;
  title?: string;
  file?: string;
  bookId?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  format: 'pdf' | 'epub';
  progress?: number;
  isFavorite?: boolean;
  size: string;
  category: string;
  lastRead?: string;
  filePath?: string;
}

// Dados mockados estendidos
const extendedMockBooks: Book[] = mockBooks.map((book, index) => ({
  id: book.id,
  title: book.title,
  author: book.author,
  cover: book.thumbnail,
  format: (book.format || 'pdf') as 'pdf' | 'epub',
  progress: book.progress || 0,
  isFavorite: index < 3, // Primeiros 3 são favoritos
  size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
  category: ['Literatura', 'Tecnologia', 'Ciências', 'História'][index % 4],
  lastRead: book.progress && book.progress > 0 ? '2024-03-20' : undefined,
  filePath: book.filePath || `https://d26a2wm7tuz2gu.cloudfront.net/upload/sample-${book.id}.pdf`
}));

// Itens da sidebar (copiados do koodo-reader)
const sidebarMenuItems = [
  { id: 'home', label: 'Biblioteca', icon: '📚', count: 0 },
  { id: 'favorites', label: 'Favoritos', icon: '❤️', count: 0 },
  { id: 'highlights', label: 'Destaques', icon: '🎨', count: 23 },
  { id: 'annotations', label: 'Anotações', icon: '📝', count: 15 },
  { id: 'bookmarks', label: 'Marcadores', icon: '🔖', count: 8 },
  { id: 'trash', label: 'Lixeira', icon: '🗑️', count: 0 },
  { id: 'settings', label: 'Configurações', icon: '⚙️', count: 0 },
  { id: 'about', label: 'Sobre', icon: '❓', count: 0 }
];

export default function KoodoReaderPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Estados principais (copiados do koodo-reader)
  const [currentRoute, setCurrentRoute] = useState<RouteState>({ type: 'home' });
  const [books, setBooks] = useState<Book[]>(extendedMockBooks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedFormat, setSelectedFormat] = useState('Todos');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'cover' | 'table'>('grid');
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Contar favoritos
  const favoritesCount = books.filter(book => book.isFavorite).length;

  // Atualizar contadores da sidebar
  const updatedSidebarItems = useMemo(() => {
    return sidebarMenuItems.map(item => {
      let count = 0;
      switch (item.id) {
        case 'home': count = books.length; break;
        case 'favorites': count = favoritesCount; break;
        case 'highlights': count = 23; break; // Mock
        case 'annotations': count = 15; break; // Mock
        case 'bookmarks': count = 8; break; // Mock
        case 'trash': count = 0; break; // Mock
      }
      return { ...item, count };
    });
  }, [books.length, favoritesCount]);

  // Filtrar livros
  const filteredBooks = useMemo(() => {
    let filtered = books;

    // Filtro por rota
    if (currentRoute.type === 'favorites') {
      filtered = filtered.filter(book => book.isFavorite);
    }

    // Filtro por busca
    if (searchQuery) {
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por categoria
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filtro por formato
    if (selectedFormat !== 'Todos') {
      filtered = filtered.filter(book => book.format === selectedFormat.toLowerCase());
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title': return a.title.localeCompare(b.title);
        case 'author': return a.author.localeCompare(b.author);
        case 'recent': return (b.lastRead || '').localeCompare(a.lastRead || '');
        case 'progress': return (b.progress || 0) - (a.progress || 0);
        default: return 0;
      }
    });

    return filtered;
  }, [books, currentRoute, searchQuery, selectedCategory, selectedFormat, sortBy]);

  // Navegação (como koodo-reader)
  const navigateTo = (route: RouteState) => {
    setCurrentRoute(route);
    // Abre viewer se for PDF/EPUB
    if ((route.type === 'pdf' || route.type === 'epub') && route.id) {
      const book = books.find(b => b.id === route.id);
      if (book) {
        setSelectedBook(book);
        setIsViewerOpen(true);
      }
    }
  };

  // Abrir livro
  const handleBookOpen = (book: Book) => {
    const route: RouteState = {
      type: book.format,
      id: book.id,
      title: book.title,
      file: book.id,
      bookId: book.id
    };
    navigateTo(route);
  };

  // Fechar viewer
  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedBook(null);
    navigateTo({ type: 'home' });
  };

  // Toggle favorito
  const toggleFavorite = (bookId: string) => {
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, isFavorite: !book.isFavorite } : book
    ));
  };

  // Renderizar conteúdo baseado na rota
  const renderMainContent = () => {
    // Se viewer está aberto, renderizar KoodoViewer
    if (isViewerOpen && selectedBook) {
      return (
        <KoodoViewer
          book={selectedBook}
          onClose={handleCloseViewer}
        />
      );
    }

    // Renderizar página específica baseada na rota
    switch (currentRoute.type) {
      case 'favorites':
        return renderFavoritesPage();
      case 'highlights':
        return renderHighlightsPage();
      case 'annotations':
        return renderAnnotationsPage();
      case 'bookmarks':
        return renderBookmarksPage();
      case 'trash':
        return renderTrashPage();
      case 'settings':
        return renderSettingsPage();
      case 'about':
        return renderAboutPage();
      default:
        return renderHomePage();
    }
  };

  // Página principal (biblioteca)
  const renderHomePage = () => (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Barra de ferramentas */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
              {currentRoute.type === 'favorites' ? 'Favoritos' : 'Biblioteca'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Importar</span>
            </button>
          </div>
        </div>

        {/* Barra de busca e filtros */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Buscar livros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todos">Todas as categorias</option>
            <option value="Literatura">Literatura</option>
            <option value="Tecnologia">Tecnologia</option>
            <option value="Ciências">Ciências</option>
            <option value="História">História</option>
          </select>
          
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todos">Todos os formatos</option>
            <option value="PDF">PDF</option>
            <option value="EPUB">EPUB</option>
          </select>
        </div>

        {/* Modos de visualização */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Visualização:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {['grid', 'list', 'cover', 'table'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as any)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    viewMode === mode
                      ? 'bg-white shadow-sm text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {mode === 'grid' && '⊞'}
                  {mode === 'list' && '☰'}
                  {mode === 'cover' && '📚'}
                  {mode === 'table' && '📋'}
                  <span className="ml-1 capitalize">{mode}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Mais recentes</option>
              <option value="title">Título</option>
              <option value="author">Autor</option>
              <option value="progress">Progresso</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conteúdo dos livros */}
      <div className="flex-1 p-4">
        {renderBooksView()}
      </div>
    </div>
  );

  // Renderizar livros baseado no modo de visualização
  const renderBooksView = () => {
    if (filteredBooks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum livro encontrado</h3>
          <p className="text-gray-500">Tente ajustar os filtros ou importar novos livros</p>
        </div>
      );
    }

    switch (viewMode) {
      case 'grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleBookOpen(book)}
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(book.id);
                    }}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <svg className={`w-4 h-4 ${book.isFavorite ? 'text-red-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </button>
                  {book.progress && book.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className="space-y-2">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center space-x-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleBookOpen(book)}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{book.title}</h3>
                  <p className="text-sm text-gray-600">{book.author}</p>
                  <p className="text-xs text-gray-500">{book.category} • {book.format.toUpperCase()}</p>
                </div>
                {book.progress && book.progress > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{book.progress}%</span>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(book.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg className={`w-4 h-4 ${book.isFavorite ? 'text-red-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        );

      case 'cover':
        return (
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-2">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="aspect-[3/4] cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleBookOpen(book)}
              >
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover rounded shadow-md"
                />
              </div>
            ))}
          </div>
        );

      case 'table':
        return (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Formato</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progresso</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-8 h-10 object-cover rounded mr-3"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{book.title}</div>
                          <div className="text-sm text-gray-500">{book.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {book.author}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {book.format.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {book.progress && book.progress > 0 ? (
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">{book.progress}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Não iniciado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleBookOpen(book)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        Ler
                      </button>
                      <button
                        onClick={() => toggleFavorite(book.id)}
                        className={`${book.isFavorite ? 'text-red-600 hover:text-red-900' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        ♥
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  // Páginas específicas (copiadas do koodo-reader)
  const renderFavoritesPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❤️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seus Livros Favoritos</h2>
        <p className="text-gray-600 mb-8">Adicione livros aos favoritos para vê-los aqui.</p>
        {favoritesCount > 0 && (
          <div className="max-w-4xl mx-auto">
            {renderBooksView()}
          </div>
        )}
      </div>
    </div>
  );

  const renderHighlightsPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎨</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seus Destaques</h2>
        <p className="text-gray-600">Destaques dos seus livros aparecerão aqui.</p>
      </div>
    </div>
  );

  const renderAnnotationsPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Suas Anotações</h2>
        <p className="text-gray-600">Anotações dos seus livros aparecerão aqui.</p>
      </div>
    </div>
  );

  const renderBookmarksPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔖</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Seus Marcadores</h2>
        <p className="text-gray-600">Marcadores dos seus livros aparecerão aqui.</p>
      </div>
    </div>
  );

  const renderTrashPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🗑️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Lixeira</h2>
        <p className="text-gray-600">Livros removidos aparecerão aqui.</p>
      </div>
    </div>
  );

  const renderSettingsPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h2>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferências de Leitura</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema Padrão
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Claro</option>
                <option>Escuro</option>
                <option>Automático</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modo de Leitura
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Simples</option>
                <option>Dupla Página</option>
                <option>Rolagem</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sincronização</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span className="text-sm text-gray-700">Sincronizar posições de leitura</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" defaultChecked />
              <span className="text-sm text-gray-700">Sincronizar anotações e destaques</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAboutPage = () => (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-6">📚</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Ex$4G Leitor - Portal de Livros</h2>
        <p className="text-gray-600 mb-8">Versão 4.1.3</p>
        
        <div className="bg-white rounded-lg shadow-sm p-6 text-left">
          <p className="text-gray-700 mb-6">
            Um leitor de livros eletrônicos moderno e elegante, projetado para proporcionar 
            a melhor experiência de leitura possível.
          </p>
          
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Funcionalidades:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Suporte para formatos PDF e EPUB</li>
            <li>• Anotações e destaques personalizáveis</li>
            <li>• Sincronização de progresso de leitura</li>
            <li>• Temas personalizáveis (claro/escuro)</li>
            <li>• Modos de leitura flexíveis</li>
            <li>• Organização inteligente da biblioteca</li>
            <li>• Busca avançada e filtros</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar (copiada do koodo-reader) */}
        <div className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className="p-4">
            
            <nav className="space-y-2">
              {updatedSidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo({ type: item.id as RouteType })}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    currentRoute.type === item.id
                      ? 'bg-blue-50 text-blue-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.count > 0 && (
                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Conteúdo principal */}
        {renderMainContent()}

        {/* Modal de importação */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h3 className="text-lg font-semibold mb-4">Importar Livros</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-600 mb-4">Arraste e solte seus arquivos aqui</p>
                <p className="text-sm text-gray-500">ou</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Selecionar Arquivos
                </button>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Importar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
