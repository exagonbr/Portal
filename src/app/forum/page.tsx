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
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types/roles';

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

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  replies: number;
  views: number;
  lastActivity: string;
  isPinned: boolean;
  isLocked: boolean;
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

  const forumPosts: ForumPost[] = [
    {
      id: 1,
      title: 'Dúvidas sobre a prova de Matemática',
      content: 'Alguém pode me ajudar com as questões de função quadrática?',
      author: 'Ana Silva',
      category: 'Matemática',
      replies: 15,
      views: 234,
      lastActivity: '2024-03-20 14:30',
      isPinned: true,
      isLocked: false
    },
    {
      id: 2,
      title: 'Discussão sobre Literatura Brasileira',
      content: 'Vamos discutir sobre as características do Romantismo brasileiro...',
      author: 'Prof. João Santos',
      category: 'Português',
      replies: 28,
      views: 456,
      lastActivity: '2024-03-20 13:45',
      isPinned: false,
      isLocked: false
    },
    {
      id: 3,
      title: 'Projeto de Ciências - Grupo A',
      content: 'Compartilhando resultados do experimento sobre fotossíntese',
      author: 'Carlos Lima',
      category: 'Ciências',
      replies: 8,
      views: 156,
      lastActivity: '2024-03-20 12:15',
      isPinned: false,
      isLocked: true
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

  const filteredPosts = forumPosts.filter(post => {
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       post.content.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
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
    <ProtectedRoute requiredRole={[UserRole.STUDENT, UserRole.TEACHER]}>
      <DashboardLayout>
        <DashboardPageLayout
          title="Fórum de Discussões"
          subtitle="Participe das discussões acadêmicas e tire suas dúvidas"
        >
          <div className="space-y-6">
            {/* Controles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <input
                  type="text"
                  placeholder="Buscar discussões..."
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
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-colors duration-200">
                Nova Discussão
              </button>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Total de Tópicos</div>
                    <div className="text-2xl font-bold text-gray-600">{forumPosts.length}</div>
                  </div>
                  <div className="p-3 rounded-full bg-primary/20">
                    <span className="material-symbols-outlined text-lg text-primary">forum</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Total de Respostas</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {forumPosts.reduce((total, post) => total + post.replies, 0)}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-blue/20">
                    <span className="material-symbols-outlined text-lg text-accent-blue">chat</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Visualizações</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {forumPosts.reduce((total, post) => total + post.views, 0)}
                    </div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-green/20">
                    <span className="material-symbols-outlined text-lg text-accent-green">visibility</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Usuários Ativos</div>
                    <div className="text-2xl font-bold text-gray-600">89</div>
                  </div>
                  <div className="p-3 rounded-full bg-accent-yellow/20">
                    <span className="material-symbols-outlined text-lg text-accent-yellow">people</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Discussões */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">
                  Discussões ({filteredPosts.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.isPinned && (
                            <span className="material-symbols-outlined text-accent-yellow text-sm">push_pin</span>
                          )}
                          {post.isLocked && (
                            <span className="material-symbols-outlined text-gray-400 text-sm">lock</span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            post.category === 'Matemática' ? 'bg-accent-blue/20 text-accent-blue' :
                            post.category === 'Português' ? 'bg-accent-green/20 text-accent-green' :
                            post.category === 'Ciências' ? 'bg-primary/20 text-primary' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {post.category}
                          </span>
                        </div>
                        
                        <h4 className="font-semibold text-gray-700 mb-2">{post.title}</h4>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>
                        
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>Por: {post.author}</span>
                          <span>•</span>
                          <span>{post.replies} respostas</span>
                          <span>•</span>
                          <span>{post.views} visualizações</span>
                          <span>•</span>
                          <span>Última atividade: {post.lastActivity}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="text-primary hover:text-primary/80 transition-colors duration-200">
                          <span className="material-symbols-outlined">visibility</span>
                        </button>
                        <button className="text-accent-blue hover:text-accent-blue/80 transition-colors duration-200">
                          <span className="material-symbols-outlined">reply</span>
                        </button>
                                                 {user?.role === 'teacher' && (
                           <button className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                             <span className="material-symbols-outlined">more_vert</span>
                           </button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Categorias Populares */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-600">Categorias Populares</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category, index) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-700">{category.name}</h4>
                        <span className="text-xs text-gray-500">
                          {forumPosts.filter(post => post.category === category.id).length} tópicos
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div>
                          {forumPosts.filter(post => post.category === category.id)
                            .reduce((total, post) => total + post.replies, 0)} respostas
                        </div>
                        <div>
                          Última atividade: {
                            forumPosts.filter(post => post.category === category.id)
                              .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())[0]?.lastActivity || 'N/A'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Regras do Fórum */}
            <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-6">
              <div className="flex items-start">
                <span className="material-symbols-outlined text-accent-blue mr-3 mt-1">info</span>
                <div>
                  <h4 className="font-medium text-accent-blue mb-2">Regras do Fórum</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Mantenha um tom respeitoso em todas as discussões</li>
                    <li>• Use categorias apropriadas para seus tópicos</li>
                    <li>• Evite spam e mensagens duplicadas</li>
                    <li>• Respeite as opiniões diferentes</li>
                    <li>• Professores podem moderar discussões</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DashboardPageLayout>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
