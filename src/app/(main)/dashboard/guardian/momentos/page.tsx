'use client';

import React, { useState, useEffect } from 'react';
import { 
  Camera,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MapPin,
  Send,
  Filter,
  Search,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  class: string;
  age: number;
  photo?: string;
  school: string;
}

interface PhotoPost {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherAvatar?: string;
  studentIds: string[];
  studentNames: string[];
  imageUrl: string;
  caption: string;
  location?: string;
  activity: string;
  timestamp: Date;
  likes: number;
  comments: PhotoComment[];
  tags: string[];
  isLikedByParent: boolean;
}

interface PhotoComment {
  id: string;
  authorId: string;
  authorName: string;
  authorType: 'parent' | 'teacher' | 'admin';
  content: string;
  timestamp: Date;
  likes: number;
}

export default function MomentosPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [photoPosts, setPhotoPosts] = useState<PhotoPost[]>([]);
  const [photoFilter, setPhotoFilter] = useState<'all' | 'my-children'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMomentosData();
  }, []);

  const loadMomentosData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados dos filhos
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'João Silva',
          class: '5º Ano A',
          age: 11,
          school: 'Colégio Esperança'
        },
        {
          id: '2',
          name: 'Maria Silva',
          class: '3º Ano B',
          age: 9,
          school: 'Colégio Esperança'
        }
      ];
      setStudents(mockStudents);

      // Feed de fotos dos eventos
      setPhotoPosts([
        {
          id: '1',
          teacherId: 'teacher1',
          teacherName: 'Prof. Ana Silva',
          teacherAvatar: '👩‍🏫',
          studentIds: ['1', '2'],
          studentNames: ['João Silva', 'Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&h=500&fit=crop',
          caption: 'Projeto de robótica em andamento! Os alunos estão construindo seus próprios robôs e aprendendo programação básica. 🤖✨',
          location: 'Laboratório de Ciências',
          activity: 'Robótica',
          timestamp: new Date(Date.now() - 86400000 * 1), // 1 dia atrás
          likes: 24,
          comments: [
            {
              id: 'c1',
              authorId: 'parent1',
              authorName: 'Pai do João',
              authorType: 'parent',
              content: 'Que orgulho! João chegou em casa super animado falando do projeto! 🥰',
              timestamp: new Date(Date.now() - 86400000 * 1 + 3600000),
              likes: 5
            },
            {
              id: 'c2',
              authorId: 'teacher1',
              authorName: 'Prof. Ana Silva',
              authorType: 'teacher',
              content: 'Ele realmente se destacou hoje! Muito criativo na programação! 👏',
              timestamp: new Date(Date.now() - 86400000 * 1 + 7200000),
              likes: 3
            }
          ],
          tags: ['#robótica', '#ciências', '#tecnologia', '#aprendizado'],
          isLikedByParent: true
        },
        {
          id: '2',
          teacherId: 'teacher2',
          teacherName: 'Prof. Sandra Costa',
          teacherAvatar: '👩‍🎨',
          studentIds: ['2'],
          studentNames: ['Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
          caption: 'Exposição de arte da turma! Maria criou uma obra incrível sobre a natureza. Cores vibrantes e muita criatividade! 🎨🌿',
          location: 'Sala de Artes',
          activity: 'Artes Visuais',
          timestamp: new Date(Date.now() - 86400000 * 2),
          likes: 31,
          comments: [
            {
              id: 'c3',
              authorId: 'parent2',
              authorName: 'Mãe da Maria',
              authorType: 'parent',
              content: 'Linda demais! Ela tem muito talento mesmo! ❤️',
              timestamp: new Date(Date.now() - 86400000 * 2 + 1800000),
              likes: 8
            }
          ],
          tags: ['#arte', '#criatividade', '#exposição', '#natureza'],
          isLikedByParent: true
        },
        {
          id: '3',
          teacherId: 'teacher3',
          teacherName: 'Prof. Carlos Santos',
          teacherAvatar: '👨‍🏫',
          studentIds: ['1'],
          studentNames: ['João Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=500&h=500&fit=crop',
          caption: 'Aula de campo no parque! Estudando a biodiversidade local e coletando amostras para nosso projeto de ciências. 🌱🔬',
          location: 'Parque Municipal',
          activity: 'Ciências Naturais',
          timestamp: new Date(Date.now() - 86400000 * 3),
          likes: 18,
          comments: [
            {
              id: 'c4',
              authorId: 'parent3',
              authorName: 'Pai da Ana',
              authorType: 'parent',
              content: 'Que experiência rica! Aprender na prática é muito melhor! 🌿',
              timestamp: new Date(Date.now() - 86400000 * 3 + 3600000),
              likes: 4
            }
          ],
          tags: ['#ciências', '#natureza', '#auladecampo', '#biodiversidade'],
          isLikedByParent: false
        },
        {
          id: '4',
          teacherId: 'teacher4',
          teacherName: 'Prof. Roberto Lima',
          teacherAvatar: '👨‍🏫',
          studentIds: ['1', '2'],
          studentNames: ['João Silva', 'Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&h=500&fit=crop',
          caption: 'Competição de matemática! Nossos alunos se saíram muito bem resolvendo problemas em equipe. Parabéns a todos! 🏆📊',
          location: 'Auditório',
          activity: 'Matemática',
          timestamp: new Date(Date.now() - 86400000 * 4),
          likes: 42,
          comments: [
            {
              id: 'c5',
              authorId: 'parent1',
              authorName: 'Pai do João',
              authorType: 'parent',
              content: 'João adorou a competição! Já está pedindo mais desafios! 🤓',
              timestamp: new Date(Date.now() - 86400000 * 4 + 1800000),
              likes: 6
            },
            {
              id: 'c6',
              authorId: 'parent2',
              authorName: 'Mãe da Maria',
              authorType: 'parent',
              content: 'Maria disse que trabalhar em equipe foi o melhor! 👥',
              timestamp: new Date(Date.now() - 86400000 * 4 + 3600000),
              likes: 4
            }
          ],
          tags: ['#matemática', '#competição', '#trabalhoequipe', '#desafio'],
          isLikedByParent: true
        },
        {
          id: '5',
          teacherId: 'teacher5',
          teacherName: 'Prof. Lucia Fernandes',
          teacherAvatar: '👩‍🏫',
          studentIds: ['2'],
          studentNames: ['Maria Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop',
          caption: 'Apresentação de poesia! Maria recitou um poema lindo sobre amizade. A turma toda ficou emocionada! 📚💕',
          location: 'Biblioteca',
          activity: 'Português',
          timestamp: new Date(Date.now() - 86400000 * 5),
          likes: 28,
          comments: [
            {
              id: 'c7',
              authorId: 'parent2',
              authorName: 'Mãe da Maria',
              authorType: 'parent',
              content: 'Ela treinou tanto em casa! Que orgulho! 🥺❤️',
              timestamp: new Date(Date.now() - 86400000 * 5 + 900000),
              likes: 12
            }
          ],
          tags: ['#poesia', '#português', '#apresentação', '#amizade'],
          isLikedByParent: true
        },
        {
          id: '6',
          teacherId: 'teacher6',
          teacherName: 'Prof. Maria Oliveira',
          teacherAvatar: '👩‍🔬',
          studentIds: ['1'],
          studentNames: ['João Silva'],
          imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&h=500&fit=crop',
          caption: 'Experimento de vulcão! Os alunos aprenderam sobre reações químicas de forma super divertida! 🌋⚗️',
          location: 'Laboratório',
          activity: 'Química',
          timestamp: new Date(Date.now() - 86400000 * 6),
          likes: 35,
          comments: [
            {
              id: 'c8',
              authorId: 'parent1',
              authorName: 'Pai do João',
              authorType: 'parent',
              content: 'João não parava de falar sobre o vulcão! Quer fazer em casa agora! 😄',
              timestamp: new Date(Date.now() - 86400000 * 6 + 2700000),
              likes: 7
            }
          ],
          tags: ['#química', '#experimento', '#vulcão', '#ciência'],
          isLikedByParent: true
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Agora mesmo';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const handleLikePost = (postId: string) => {
    setPhotoPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLikedByParent: !post.isLikedByParent,
          likes: post.isLikedByParent ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const filteredPosts = photoPosts
    .filter(post => photoFilter === 'all' || post.studentIds.some(id => students.some(s => s.id === id)))
    .filter(post => 
      searchTerm === '' || 
      post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.GUARDIAN, UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="📸 Momentos Especiais"
        subtitle="Acompanhe os momentos únicos dos seus filhos na escola"
      >
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 space-y-4 sm:space-y-6">
          {/* Header com navegação e filtros - Responsivo */}
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm">
            <div className="flex flex-col space-y-3 sm:space-y-4">
              {/* Navegação de volta */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Link 
                  href="/dashboard/guardian"
                  className="flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm font-medium">Voltar ao Dashboard</span>
                </Link>
              </div>

              {/* Título e controles - Layout responsivo */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600 flex-shrink-0" />
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 truncate">Momentos Especiais</h1>
                </div>
                
                {/* Controles - Stack vertical no mobile */}
                <div className="flex flex-col gap-3">
                  {/* Barra de pesquisa - Largura total no mobile */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar momentos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Filtros - Layout responsivo */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <select 
                      value={photoFilter} 
                      onChange={(e) => setPhotoFilter(e.target.value as any)}
                      className="bg-white border border-gray-300 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:ring-2 focus:ring-pink-500 flex-1 sm:flex-none sm:min-w-[160px]"
                    >
                      <option value="all">Todas as fotos</option>
                      <option value="my-children">Apenas meus filhos</option>
                    </select>
                    
                    <button className="flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 sm:py-2.5 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium">
                      <Filter className="w-4 h-4" />
                      <span>Filtrar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feed de Fotos estilo Instagram - Responsivo */}
          <div className="space-y-4 sm:space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Camera className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-600 mb-2">Nenhum momento encontrado</h3>
                <p className="text-sm sm:text-base text-gray-500 px-4">
                  {searchTerm ? 'Tente ajustar sua pesquisa' : 'Novos momentos aparecerão aqui em breve!'}
                </p>
              </div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Header do Post - Responsivo */}
                  <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm sm:text-lg flex-shrink-0">
                        {post.teacherAvatar || post.teacherName.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{post.teacherName}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{post.location}</span>
                          </div>
                          <span className="hidden sm:inline">•</span>
                          <span className="truncate">{post.activity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTimeAgo(post.timestamp)}
                    </div>
                  </div>

                  {/* Imagem do Post - Altura responsiva */}
                  <div className="relative">
                    <img 
                      src={post.imageUrl} 
                      alt={post.caption}
                      className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                    />
                    {/* Tags dos Estudantes - Responsivas */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 sm:gap-2 max-w-[calc(100%-2rem)]">
                      {post.studentNames.map(name => (
                        <span key={name} className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs truncate max-w-[100px] sm:max-w-[140px]">
                          👤 {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ações do Post - Layout responsivo */}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <button 
                          className={`flex items-center gap-1 sm:gap-2 transition-colors ${
                            post.isLikedByParent ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                          }`}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isLikedByParent ? 'fill-current' : ''}`} />
                          <span className="text-xs sm:text-sm font-medium">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-blue-500 transition-colors">
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-medium">{post.comments.length}</span>
                        </button>
                        <button className="flex items-center gap-1 sm:gap-2 text-gray-500 hover:text-green-500 transition-colors">
                          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Compartilhar</span>
                        </button>
                      </div>
                      <button className="text-gray-500 hover:text-gray-700 transition-colors">
                        <Bookmark className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>

                    {/* Caption - Texto responsivo */}
                    <div className="mb-3">
                      <p className="text-gray-800 leading-relaxed text-sm sm:text-base">{post.caption}</p>
                    </div>

                    {/* Tags - Layout responsivo */}
                    <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-blue-600 text-xs sm:text-sm hover:text-blue-800 cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Comentários - Layout responsivo */}
                    {post.comments.length > 0 && (
                      <div className="space-y-2 sm:space-y-3 border-t border-gray-100 pt-3">
                        <div className="text-xs sm:text-sm font-medium text-gray-600">
                          {post.comments.length} comentário{post.comments.length !== 1 ? 's' : ''}
                        </div>
                        {post.comments.slice(0, 2).map(comment => (
                          <div key={comment.id} className="flex items-start gap-2 sm:gap-3">
                            <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                              comment.authorType === 'parent' ? 'bg-blue-100 text-blue-700' :
                              comment.authorType === 'teacher' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {comment.authorType === 'parent' ? '👨‍👩‍👧‍👦' :
                               comment.authorType === 'teacher' ? '👩‍🏫' : '👤'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <span className="font-medium text-gray-800 text-xs sm:text-sm truncate">{comment.authorName}</span>
                                <span className="text-xs text-gray-500 flex-shrink-0">{formatTimeAgo(comment.timestamp)}</span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-700 break-words leading-relaxed">{comment.content}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <button className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                                  ❤️ {comment.likes}
                                </button>
                                <button className="text-xs text-gray-500 hover:text-blue-500 transition-colors">
                                  Responder
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {post.comments.length > 2 && (
                          <button className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            Ver todos os {post.comments.length} comentários
                          </button>
                        )}
                      </div>
                    )}

                    {/* Adicionar Comentário - Layout responsivo */}
                    <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        👨‍👩‍👧‍👦
                      </div>
                      <input 
                        type="text" 
                        placeholder="Adicione um comentário..."
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent min-w-0"
                      />
                      <button className="text-pink-600 hover:text-pink-700 transition-colors flex-shrink-0">
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Botão para carregar mais - Responsivo */}
          {filteredPosts.length > 0 && (
            <div className="text-center px-3 sm:px-4">
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 sm:px-8 py-3 rounded-full hover:from-pink-600 hover:to-purple-700 transition-all hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto max-w-xs">
                📸 Carregar mais momentos
              </button>
            </div>
          )}
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  );
}