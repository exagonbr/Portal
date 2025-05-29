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
  ChevronRight
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

interface ForumTopic {
  id: string;
  title: string;
  category: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  lastReply: Date;
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
          color: 'bg-green-500',
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
          color: 'bg-yellow-500',
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
          createdAt: new Date(),
          lastReply: new Date(),
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
          createdAt: new Date(Date.now() - 86400000),
          lastReply: new Date(),
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
          createdAt: new Date(Date.now() - 172800000),
          lastReply: new Date(Date.now() - 3600000),
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              Fórum da Comunidade
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Participe das discussões e compartilhe conhecimento
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Novo Tópico
          </button>
        </div>

        {/* Barra de Pesquisa e Filtros */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar tópicos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {categories.reduce((acc, cat) => acc + cat.topicsCount, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tópicos</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {categories.reduce((acc, cat) => acc + cat.postsCount, 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Respostas</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                1,234
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Membros Ativos</p>
            </div>
            <User className="w-8 h-8 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                89%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Resposta</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-500 opacity-50" />
          </div>
        </div>
      </div>

      {/* Categorias */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categorias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${category.color} bg-opacity-10 text-4xl`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {category.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{category.topicsCount} tópicos</span>
                      <span>•</span>
                      <span>{category.postsCount} posts</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
              {category.lastPost && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500">Último post:</p>
                  <p className="text-sm font-medium truncate">{category.lastPost.title}</p>
                  <p className="text-xs text-gray-400">
                    por {category.lastPost.author} • {formatDate(category.lastPost.date)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tópicos Recentes e Populares */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tópicos Recentes */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Tópicos Recentes
          </h2>
          <div className="space-y-3">
            {recentTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                      {topic.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                      <h3 className="font-medium hover:text-blue-600 transition-colors">
                        {topic.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {topic.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(topic.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {topic.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {topic.replies}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{topic.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tópicos Populares */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Tópicos Populares
          </h2>
          <div className="space-y-3">
            {popularTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {topic.isPinned && <Pin className="w-4 h-4 text-red-500" />}
                      {topic.isLocked && <Lock className="w-4 h-4 text-gray-500" />}
                      <h3 className="font-medium hover:text-blue-600 transition-colors">
                        {topic.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {topic.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(topic.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {topic.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {topic.replies}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      {topic.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm">{topic.likes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
