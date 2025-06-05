'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Clock,
  Eye,
  MessageCircle,
  ThumbsUp,
  Pin,
  Lock,
  User,
  Calendar,
  TrendingUp,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  topicsCount: number;
  postsCount: number;
  lastPost?: {
    id: string;
    title: string;
    author: string;
    date: Date;
  };
}

interface ForumStats {
  topics: number;
  replies: number;
  activeUsers: number;
  responseRate: number;
}

interface ForumAuthor {
  id: string;
  name: string;
  avatar?: string;
}

interface ForumTopic {
  id: string;
  title: string;
  preview: string;
  author: ForumAuthor;
  category: string;
  createdAt: string;
  lastReply: string;
  views: number;
  replies: number;
  likes: number;
  isPinned: boolean;
  isLocked: boolean;
  tags: string[];
}

export default function ForumPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [recentTopics, setRecentTopics] = useState<ForumTopic[]>([]);
  const [popularTopics, setPopularTopics] = useState<ForumTopic[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTopics, setTotalTopics] = useState(0);

  // Mock data
  const stats: ForumStats = {
    topics: 1234,
    replies: 5678,
    activeUsers: 890,
    responseRate: 89
  };

  const mockTopics: ForumTopic[] = [
    {
      id: '1',
      title: 'Comunicado Importante: Calendário de Provas',
      preview: 'Confira as datas e horários das avaliações do próximo bimestre.',
      category: 'Avisos e Comunicados',
      author: { id: '1', name: 'Coordenação' },
      createdAt: '2025-03-15T10:00:00Z',
      lastReply: '2025-03-15T12:00:00Z',
      views: 234,
      replies: 12,
      likes: 45,
      isPinned: true,
      isLocked: false,
      tags: ['aviso', 'provas', 'calendário']
    },
    {
      id: '2',
      title: 'Dúvida sobre Cálculo I',
      preview: 'Alguém pode me ajudar com derivadas parciais?',
      category: 'Dúvidas Acadêmicas',
      author: { id: '2', name: 'João Silva' },
      createdAt: '2025-03-14T15:30:00Z',
      lastReply: '2025-03-15T17:30:00Z',
      views: 156,
      replies: 8,
      likes: 23,
      isPinned: false,
      isLocked: false,
      tags: ['matemática', 'cálculo', 'dúvida']
    },
    {
      id: '3',
      title: 'Grupo de Estudos para o ENEM',
      preview: 'Vamos criar um grupo de estudos para o ENEM 2025?',
      category: 'Projetos e Trabalhos',
      author: { id: '3', name: 'Maria Santos' },
      createdAt: '2025-03-13T10:00:00Z',
      lastReply: '2025-03-13T12:00:00Z',
      views: 89,
      replies: 15,
      likes: 34,
      isPinned: false,
      isLocked: false,
      tags: ['enem', 'grupo de estudos', 'vestibular']
    }
  ];

  // Filtrar tópicos baseado na busca e categoria
  const filteredTopics = mockTopics.filter(topic => {
    const matchesSearch = searchTerm === '' || 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || 
      topic.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    loadForumData();
  }, []);

  const loadForumData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      const mockCategories: ForumCategory[] = [
        {
          id: '1',
          name: 'Avisos e Comunicados',
          description: 'Informações importantes da instituição',
          icon: '📢',
          color: 'bg-blue-500',
          topicsCount: 15,
          postsCount: 45,
          lastPost: {
            id: '1',
            title: 'Calendário Escolar 2025',
            author: 'Coordenação',
            date: new Date()
          }
        },
        {
          id: '2',
          name: 'Dúvidas Acadêmicas',
          description: 'Tire suas dúvidas sobre conteúdos e atividades',
          icon: '❓',
          color: 'bg-emerald-500',
          topicsCount: 128,
          postsCount: 512,
          lastPost: {
            id: '2',
            title: 'Dúvida sobre exercício de matemática',
            author: 'João Silva',
            date: new Date()
          }
        },
        {
          id: '3',
          name: 'Projetos e Trabalhos',
          description: 'Discussões sobre projetos em grupo',
          icon: '💡',
          color: 'bg-purple-500',
          topicsCount: 34,
          postsCount: 156,
          lastPost: {
            id: '3',
            title: 'Grupo para projeto de ciências',
            author: 'Maria Santos',
            date: new Date()
          }
        },
        {
          id: '4',
          name: 'Eventos e Atividades',
          description: 'Informações sobre eventos escolares',
          icon: '🎉',
          color: 'bg-amber-500',
          topicsCount: 22,
          postsCount: 89,
          lastPost: {
            id: '4',
            title: 'Feira de Ciências 2025',
            author: 'Prof. Carlos',
            date: new Date()
          }
        }
      ];

      const mockTopics: ForumTopic[] = [
        {
          id: '1',
          title: 'Calendário Escolar 2025 - Datas Importantes',
          category: 'Avisos e Comunicados',
          author: { id: '1', name: 'Coordenação' },
          createdAt: '2025-03-15T10:00:00Z',
          lastReply: '2025-03-15T12:00:00Z',
          views: 234,
          replies: 12,
          likes: 45,
          isPinned: true,
          isLocked: false,
          tags: ['importante', 'calendário', '2025']
        },
        {
          id: '2',
          title: 'Como resolver equações de segundo grau?',
          category: 'Dúvidas Acadêmicas',
          author: { id: '2', name: 'João Silva' },
          createdAt: '2025-03-14T15:30:00Z',
          lastReply: '2025-03-15T17:30:00Z',
          views: 156,
          replies: 8,
          likes: 23,
          isPinned: false,
          isLocked: false,
          tags: ['matemática', 'equações']
        },
        {
          id: '3',
          title: 'Formação de grupos para projeto de história',
          category: 'Projetos e Trabalhos',
          author: { id: '3', name: 'Maria Santos' },
          createdAt: '2025-03-13T10:00:00Z',
          lastReply: '2025-03-13T12:00:00Z',
          views: 89,
          replies: 15,
          likes: 12,
          isPinned: false,
          isLocked: false,
          tags: ['história', 'projeto', 'grupo']
        }
      ];

      setCategories(mockCategories);
      setRecentTopics(mockTopics);
      setPopularTopics([...mockTopics].sort((a, b) => b.views - a.views));

    } catch (error) {
      console.error('Erro ao carregar dados do fórum:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutos atrás`;
    if (hours < 24) return `${hours} horas atrás`;
    if (days < 7) return `${days} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-primary" />
              Fórum Acadêmico
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Participe das discussões e compartilhe conhecimento com a comunidade escolar
            </p>
          </div>
          <button className="button-primary flex items-center justify-center gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Novo Tópico</span>
          </button>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tópicos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base bg-white"
            >
              <option value="">Todas Categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary focus:border-primary text-sm sm:text-base flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filtros</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.topics}
              </p>
              <p className="text-sm text-gray-600">Tópicos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100">
              <MessageCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.replies}
              </p>
              <p className="text-sm text-gray-600">Respostas</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stats.responseRate}%
              </p>
              <p className="text-sm text-gray-600">Taxa de Resposta</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Tópicos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
        {filteredTopics.map((topic) => (
          <div key={topic.id} className="p-3 sm:p-4 lg:p-6 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {topic.author.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {topic.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                      {topic.preview}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{topic.replies}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{topic.views}</span>
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-xs text-gray-500">
                    Última resposta
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {topic.lastReply}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-3 py-2 sm:px-4 rounded-lg">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> até{' '}
              <span className="font-medium">10</span> de{' '}
              <span className="font-medium">{totalTopics}</span> tópicos
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Anterior</span>
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              {/* Números das páginas */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    page === currentPage
                      ? 'z-10 bg-primary text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Próxima</span>
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
