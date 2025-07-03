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
  ChevronLeft,
  Tag,
  Heart,
  Star,
  Award,
  Bookmark
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
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
  course: string;
  category: 'doubt' | 'discussion' | 'announcement' | 'resource';
  tags: string[];
  created_at: string;
  updated_at: string;
  views: number;
  replies: number;
  likes: number;
  is_pinned: boolean;
  is_resolved?: boolean;
  last_reply?: {
    author: string;
    date: string;
  };
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: 'teacher' | 'student';
    avatar?: string;
  };
  category: 'doubt' | 'discussion' | 'announcement' | 'material';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  replies: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isPinned: boolean;
  isSolved?: boolean;
}

interface Reply {
  id: string;
  postId: string;
  content: string;
  author: {
    name: string;
    role: 'teacher' | 'student';
    avatar?: string;
  };
  createdAt: string;
  likes: number;
  isLiked: boolean;
  isBestAnswer?: boolean;
}

export default function ForumPage() {
  const { user } = useAuth();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTopics();
  }, [filterCategory, filterCourse, sortBy]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      // Simular carregamento de dados
      setTimeout(() => {
        setTopics([
          {
            id: '1',
            title: 'Dúvida sobre equações do 2º grau - Fórmula de Bhaskara',
            content: 'Alguém pode me ajudar a entender quando usar a fórmula de Bhaskara?',
            author: {
              id: '1',
              name: 'Ana Silva',
              role: 'STUDENT'
            },
            course: 'Matemática Básica',
            category: 'doubt',
            tags: ['matemática', 'equações', 'bhaskara'],
            created_at: '2024-03-14T10:30:00',
            updated_at: '2024-03-14T15:45:00',
            views: 45,
            replies: 8,
            likes: 12,
            is_pinned: false,
            is_resolved: true,
            last_reply: {
              author: 'Prof. João',
              date: '2024-03-14T15:45:00'
            }
          },
          {
            id: '2',
            title: '📌 Regras do Fórum e Boas Práticas',
            content: 'Bem-vindos ao fórum! Aqui estão as regras e diretrizes para uma boa convivência...',
            author: {
              id: '2',
              name: 'Prof. Maria',
              role: 'TEACHER'
            },
            course: 'Geral',
            category: 'announcement',
            tags: ['regras', 'importante'],
            created_at: '2024-03-01T08:00:00',
            updated_at: '2024-03-01T08:00:00',
            views: 234,
            replies: 0,
            likes: 45,
            is_pinned: true,
            is_resolved: false
          },
          {
            id: '3',
            title: 'Discussão: Aplicações práticas da gramática no dia a dia',
            content: 'Vamos compartilhar exemplos de como a gramática é importante no cotidiano?',
            author: {
              id: '3',
              name: 'Carlos Santos',
              role: 'STUDENT'
            },
            course: 'Português - Gramática',
            category: 'discussion',
            tags: ['português', 'gramática', 'discussão'],
            created_at: '2024-03-13T14:20:00',
            updated_at: '2024-03-14T09:15:00',
            views: 67,
            replies: 15,
            likes: 23,
            is_pinned: false,
            is_resolved: false,
            last_reply: {
              author: 'Maria Oliveira',
              date: '2024-03-14T09:15:00'
            }
          },
          {
            id: '4',
            title: 'Material complementar - Período Colonial',
            content: 'Compartilho aqui alguns links e recursos sobre o período colonial brasileiro...',
            author: {
              id: '4',
              name: 'Prof. Roberto',
              role: 'TEACHER'
            },
            course: 'História do Brasil',
            category: 'resource',
            tags: ['história', 'material', 'colonial'],
            created_at: '2024-03-12T16:00:00',
            updated_at: '2024-03-12T16:00:00',
            views: 89,
            replies: 5,
            likes: 34,
            is_pinned: false,
            is_resolved: false,
            last_reply: {
              author: 'João Pereira',
              date: '2024-03-13T11:30:00'
            }
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar tópicos:', error);
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'doubt':
        return '❓';
      case 'discussion':
        return '💬';
      case 'announcement':
        return '📢';
      case 'resource':
        return '📚';
      default:
        return '📝';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'doubt':
        return 'Dúvida';
      case 'discussion':
        return 'Discussão';
      case 'announcement':
        return 'Anúncio';
      case 'resource':
        return 'Material';
      default:
        return category;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'doubt':
        return 'bg-yellow-100 text-yellow-800';
      case 'discussion':
        return 'bg-blue-100 text-blue-800';
      case 'announcement':
        return 'bg-red-100 text-red-800';
      case 'resource':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return 'text-purple-600 bg-purple-100';
      case 'STUDENT':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return 'Professor';
      case 'STUDENT':
        return 'Aluno';
      default:
        return role;
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || topic.category === filterCategory;
    const matchesCourse = filterCourse === 'all' || topic.course === filterCourse;
    return matchesSearch && matchesCategory && matchesCourse;
  });

  const sortedTopics = [...filteredTopics].sort((a, b) => {
    // Pinned topics always come first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;

    switch (sortBy) {
      case 'recent':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      case 'popular':
        return b.views - a.views;
      case 'mostReplies':
        return b.replies - a.replies;
      default:
        return 0;
    }
  });

  const uniqueCourses = Array.from(new Set(topics.map(t => t.course)));

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Há menos de 1 hora';
    if (diffInHours < 24) return `Há ${diffInHours} horas`;
    if (diffInHours < 48) return 'Ontem';
    return past.toLocaleDateString('pt-BR');
  };

  const categories = [
    { value: 'all', label: 'Todas', icon: 'forum', color: 'gray' },
    { value: 'doubt', label: 'Dúvidas', icon: 'help', color: 'blue' },
    { value: 'discussion', label: 'Discussões', icon: 'chat_bubble', color: 'green' },
    { value: 'announcement', label: 'Anúncios', icon: 'campaign', color: 'red' },
    { value: 'material', label: 'Materiais', icon: 'folder', color: 'purple' }
  ];

  const popularTags = [
    'matemática', 'programação', 'react', 'javascript', 'física', 
    'química', 'história', 'português', 'inglês', 'biologia'
  ];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.views + b.likes + b.replies) - (a.views + a.likes + a.replies);
      case 'unanswered':
        return a.replies - b.replies;
      default: // recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const formatDate = (date: string) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Há menos de 1 hora';
    if (diffInHours < 24) return `Há ${Math.floor(diffInHours)} horas`;
    if (diffInHours < 48) return 'Ontem';
    if (diffInHours < 168) return `Há ${Math.floor(diffInHours / 24)} dias`;
    
    return postDate.toLocaleDateString('pt-BR');
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  return (
    <DashboardLayout>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Fórum de Discussão</h1>
        <p className="text-gray-600">Tire dúvidas, compartilhe conhecimento e participe de discussões</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Tópicos</p>
              <p className="text-2xl font-bold text-gray-900">{topics.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Respostas Hoje</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
            </div>
            <MessageCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-gray-900">123</p>
            </div>
            <User className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taxa de Solução</p>
              <p className="text-2xl font-bold text-gray-900">89%</p>
            </div>
            <Award className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>
      </DashboardLayout>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Categorias</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    selectedCategory === category.value
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {category.icon}
                  </span>
                  <span className="font-medium">{category.label}</span>
                  <span className="ml-auto text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {category.value === 'all' 
                      ? topics.length 
                      : topics.filter(p => p.category === category.value).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Tags Populares</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchTerm(tag)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Top Contribuidores</h3>
            <div className="space-y-3">
              {[
                { name: 'Prof. Maria Santos', points: 1250, role: 'teacher' },
                { name: 'João Silva', points: 890, role: 'student' },
                { name: 'Ana Costa', points: 756, role: 'student' }
              ].map((user, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.points} pontos</p>
                  </div>
                  {user.role === 'teacher' && (
                    <Star className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar tópicos, tags ou conteúdo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="popular">Mais Populares</option>
                  <option value="unanswered">Sem Resposta</option>
                </select>
                
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Novo Tópico
                </button>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {post.isPinned && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                          📌 Fixado
                        </span>
                      )}
                      {post.isSolved && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          ✓ Resolvido
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(post.category)}`}>
                        {categories.find(c => c.value === post.category)?.label}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className={post.author.role === 'teacher' ? 'font-medium text-blue-600' : ''}>
                          {post.author.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.views} visualizações</span>
                      </div>
                    </div>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag) => (
                          <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        post.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>
                    
                    <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies} respostas</span>
                    </button>
                    
                    <button
                      onClick={() => handleBookmarkPost(post.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        post.isBookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
                    Ver discussão
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Topic Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Criar Novo Tópico</h2>
            <p className="text-gray-600 mb-4">Funcionalidade de criação de tópicos será implementada em breve.</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
