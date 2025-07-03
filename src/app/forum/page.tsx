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
  Hash,
  Users,
  Bell
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
          color: 'from-primary to-primary-light',
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
          color: 'from-accent-green to-secondary',
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
          color: 'from-accent-purple to-primary',
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
          color: 'from-accent-orange to-accent-yellow',
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

    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  const filteredTopics = recentTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === 'all' || topic.category === selectedCategory)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background-secondary flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <div className="loading-spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-text-secondary">Carregando fórum...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary">
      {/* Header */}
      <div className="bg-background-card border-b border-border-light sticky top-0 z-10 backdrop-blur-xl">
        <div className="container-responsive py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="page-title">Fórum Educacional</h1>
                <p className="page-subtitle">Compartilhe conhecimento e tire suas dúvidas</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/forum/create"
                className="button-primary group inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Novo Tópico
              </Link>
              <button className="button-icon relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar tópicos, categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field-modern pl-10"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field-modern min-w-[200px]"
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              
              <button className="button-icon">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Categories Grid */}
            <div>
              <h2 className="section-title mb-6">Categorias</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <Link key={category.id} href={`/forum/category/${category.id}`}>
                    <div className="card-modern hover-lift cursor-pointer group">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform duration-200`}>
                            {category.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors duration-200 truncate">
                              {category.name}
                            </h3>
                            <p className="text-sm text-text-tertiary mt-1 line-clamp-2">
                              {category.description}
                            </p>
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                              <span className="flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {category.topicsCount} tópicos
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />
                                {category.postsCount} posts
                              </span>
                            </div>
                          </div>
                          
                          <ChevronRight className="w-5 h-5 text-text-tertiary group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                        
                        {category.lastPost && (
                          <div className="mt-4 pt-4 border-t border-border-light">
                            <p className="text-xs text-text-tertiary">Último post:</p>
                            <p className="text-sm font-medium text-text-primary truncate mt-1">
                              {category.lastPost.title}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              por {category.lastPost.author} • {formatDate(category.lastPost.date)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Topics */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title">Tópicos Recentes</h2>
                <Link href="/forum/topics" className="text-primary hover:text-secondary transition-colors text-sm font-medium">
                  Ver todos
                </Link>
              </div>
              
              <div className="space-y-4">
                {filteredTopics.map((topic) => (
                  <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                    <div className="card hover-lift cursor-pointer group">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Author Avatar */}
                          <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {topic.author.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  {topic.isPinned && (
                                    <Pin className="w-4 h-4 text-accent-yellow" />
                                  )}
                                  {topic.isLocked && (
                                    <Lock className="w-4 h-4 text-text-muted" />
                                  )}
                                  <span className="badge badge-info text-xs">
                                    {topic.category}
                                  </span>
                                </div>
                                
                                <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors duration-200 line-clamp-2">
                                  {topic.title}
                                </h3>
                                
                                <div className="flex items-center gap-4 mt-3 text-sm text-text-tertiary">
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {topic.author.name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {formatDate(topic.lastReply)}
                                  </span>
                                </div>
                                
                                {/* Tags */}
                                {topic.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {topic.tags.map((tag, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 text-xs bg-background-tertiary text-text-secondary rounded-md"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 text-sm text-text-tertiary">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    {topic.views}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MessageCircle className="w-4 h-4" />
                                    {topic.replies}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <ThumbsUp className="w-4 h-4" />
                                    {topic.likes}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
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
                        <p className="stat-label">Total de Tópicos</p>
                        <p className="stat-value text-primary">
                          {categories.reduce((acc, cat) => acc + cat.topicsCount, 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Hash className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Total de Posts</p>
                        <p className="stat-value text-secondary">
                          {categories.reduce((acc, cat) => acc + cat.postsCount, 0)}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="stat-label">Usuários Ativos</p>
                        <p className="stat-value text-accent-green">1,247</p>
                      </div>
                      <div className="w-12 h-12 bg-accent-green/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-accent-green" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="card-modern">
              <div className="p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent-orange" />
                  Tópicos Populares
                </h3>
                
                <div className="space-y-3">
                  {popularTopics.slice(0, 5).map((topic, index) => (
                    <Link key={topic.id} href={`/forum/topic/${topic.id}`}>
                      <div className="p-3 rounded-xl hover:bg-background-hover transition-colors cursor-pointer group">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-accent-orange to-accent-yellow rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary group-hover:text-primary transition-colors line-clamp-2">
                              {topic.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-text-tertiary">
                              <Eye className="w-3 h-3" />
                              {topic.views} visualizações
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Online Users */}
            <div className="card-modern">
              <div className="p-6">
                <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-accent-green" />
                  Usuários Online
                  <span className="badge badge-success ml-auto">24</span>
                </h3>
                
                <div className="space-y-3">
                  {['Prof. Ana', 'João Silva', 'Maria Santos', 'Carlos Lima'].map((name, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {name.charAt(0)}
                          </span>
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-green rounded-full border-2 border-background-card"></div>
                      </div>
                      <span className="text-sm text-text-primary font-medium">{name}</span>
                    </div>
                  ))}
                  
                  <button className="text-sm text-primary hover:text-secondary transition-colors w-full text-left mt-2">
                    Ver todos os usuários online
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
