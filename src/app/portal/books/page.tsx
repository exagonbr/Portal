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
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { UserRole } from '@/types/roles'

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

export default function PortalBooksPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')

  const books: Book[] = [
    {
      id: 1,
      title: 'O Pequeno Príncipe',
      author: 'Antoine de Saint-Exupéry',
      cover: '/books/pequeno-principe.jpg',
      category: 'Literatura',
      progress: 85,
      lastRead: '2024-03-20',
      pages: 96,
      rating: 5,
      status: 'reading'
    },
    {
      id: 2,
      title: 'Dom Casmurro',
      author: 'Machado de Assis',
      cover: '/books/dom-casmurro.jpg',
      category: 'Literatura Brasileira',
      progress: 100,
      lastRead: '2024-03-15',
      pages: 208,
      rating: 4,
      status: 'completed'
    },
    {
      id: 3,
      title: 'Física Quântica',
      author: 'Prof. Carlos Silva',
      cover: '/books/fisica-quantica.jpg',
      category: 'Ciências',
      progress: 42,
      lastRead: '2024-03-18',
      pages: 345,
      rating: 4,
      status: 'reading'
    },
    {
      id: 4,
      title: 'História do Brasil',
      author: 'Dr. Ana Costa',
      cover: '/books/historia-brasil.jpg',
      category: 'História',
      progress: 0,
      lastRead: '-',
      pages: 280,
      rating: 0,
      status: 'wishlist'
    }
  ]

  const filteredBooks = books.filter(book => {
    const categoryMatch = selectedCategory === 'all' || book.category === selectedCategory
    const searchMatch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       book.author.toLowerCase().includes(searchTerm.toLowerCase())
    return categoryMatch && searchMatch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading': return 'bg-accent-blue/20 text-accent-blue'
      case 'completed': return 'bg-accent-green/20 text-accent-green'
      case 'wishlist': return 'bg-accent-yellow/20 text-accent-yellow'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'reading': return 'Lendo'
      case 'completed': return 'Concluído'
      case 'wishlist': return 'Lista de Desejos'
      default: return 'Desconhecido'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined text-sm ${
          i < rating ? 'text-accent-yellow' : 'text-gray-300'
        }`}
      >
        star
      </span>
    ))
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.STUDENT, UserRole.TEACHER, UserRole.COORDINATOR]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Biblioteca Digital"
          subtitle="Explore e gerencie seus livros digitais"
        >
          <div className="space-y-6">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <input
                  type="text"
                  placeholder="Buscar livros ou autores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="Literatura">Literatura</option>
                  <option value="Literatura Brasileira">Literatura Brasileira</option>
                  <option value="Ciências">Ciências</option>
                  <option value="História">História</option>
                </select>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">list</span>
                  </button>
                </div>
                
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200">
                  Adicionar Livro
                </button>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Total de Livros</div>
                    <div className="text-2xl font-bold text-gray-600">{books.length}</div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20">
                    <span className="material-symbols-outlined text-lg text-primary">library_books</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Lendo Atualmente</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {books.filter(book => book.status === 'reading').length}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-blue/20">
                    <span className="material-symbols-outlined text-lg text-accent-blue">menu_book</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Concluídos</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {books.filter(book => book.status === 'completed').length}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-green/20">
                    <span className="material-symbols-outlined text-lg text-accent-green">check_circle</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Lista de Desejos</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {books.filter(book => book.status === 'wishlist').length}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-yellow/20">
                    <span className="material-symbols-outlined text-lg text-accent-yellow">bookmark</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista/Grid de Livros */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="aspect-[3/4] bg-gray-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-6xl">book</span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(book.status)}`}>
                          {getStatusText(book.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-700 mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                      <p className="text-xs text-gray-400 mb-3">{book.category} • {book.pages} páginas</p>
                      
                      {book.status === 'reading' && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>{book.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-accent-blue h-2 rounded-full transition-all duration-300"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {book.rating > 0 && (
                        <div className="flex items-center mb-3">
                          {renderStars(book.rating)}
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <button className="text-primary hover:text-primary/80 text-sm font-medium transition-colors duration-200">
                          {book.status === 'wishlist' ? 'Adicionar' : 'Abrir'}
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                          <span className="material-symbols-outlined text-sm">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Livro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Categoria
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Progresso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Última Leitura
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-12 bg-gray-200 rounded flex items-center justify-center mr-3">
                                <span className="material-symbols-outlined text-gray-400">book</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-700">{book.title}</div>
                                <div className="text-sm text-gray-500">{book.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {book.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-accent-blue h-2 rounded-full"
                                  style={{ width: `${book.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-500">{book.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(book.status)}`}>
                              {getStatusText(book.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {book.lastRead}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary hover:text-primary/80 mr-3 transition-colors duration-200">
                              Abrir
                            </button>
                            <button className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200">
                              Detalhes
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Livros em Destaque */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Livros em Destaque</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="material-symbols-outlined text-accent-green mr-2">trending_up</span>
                      <span className="font-medium text-gray-700">Mais Popular</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">O Pequeno Príncipe</div>
                      <div>Antoine de Saint-Exupéry</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="material-symbols-outlined text-accent-blue mr-2">new_releases</span>
                      <span className="font-medium text-gray-700">Novo Lançamento</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">História do Brasil</div>
                      <div>Dr. Ana Costa</div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <span className="material-symbols-outlined text-accent-yellow mr-2">star</span>
                      <span className="font-medium text-gray-700">Melhor Avaliado</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">Dom Casmurro</div>
                      <div>Machado de Assis</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
