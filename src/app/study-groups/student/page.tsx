'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  BookOpen,
  Star,
  Filter,
  UserPlus,
  Settings,
  Video,
  Phone,
  Share2,
  Award,
  Target,
  TrendingUp,
  Heart,
  Eye,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  level: 'iniciante' | 'intermediario' | 'avancado';
  members: number;
  maxMembers: number;
  isPublic: boolean;
  isMember: boolean;
  isOwner: boolean;
  avatar?: string;
  tags: string[];
  nextMeeting?: {
    date: string;
    time: string;
    location: string;
    type: 'presencial' | 'online';
  };
  stats: {
    sessionsCompleted: number;
    averageRating: number;
    totalStudyHours: number;
  };
  recentActivity: string;
  createdAt: string;
  owner: {
    name: string;
    avatar?: string;
  };
}

interface StudySession {
  id: string;
  groupId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  type: 'presencial' | 'online';
  participants: number;
  maxParticipants: number;
  status: 'agendada' | 'em-andamento' | 'concluida' | 'cancelada';
}

export default function StudyGroupsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [mySessions, setMySessions] = useState<StudySession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('todos');
  const [selectedLevel, setSelectedLevel] = useState('todos');
  const [selectedView, setSelectedView] = useState<'grupos' | 'sessoes' | 'meus-grupos'>('grupos');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    level: 'iniciante' as const,
    maxMembers: 10,
    isPublic: true,
    tags: [] as string[]
  });

  useEffect(() => {
    loadStudyGroups();
    loadMySessions();
  }, []);

  const loadStudyGroups = async () => {
    try {
      // Dados simulados
      const mockGroups: StudyGroup[] = [
        {
          id: '1',
          name: 'Matemática Avançada',
          description: 'Grupo focado em álgebra e geometria para o ensino médio',
          subject: 'Matemática',
          level: 'avancado',
          members: 8,
          maxMembers: 12,
          isPublic: true,
          isMember: true,
          isOwner: false,
          tags: ['álgebra', 'geometria', 'ensino-médio'],
          nextMeeting: {
            date: '2025-02-01',
            time: '15:00',
            location: 'Biblioteca Central',
            type: 'presencial'
          },
          stats: {
            sessionsCompleted: 15,
            averageRating: 4.8,
            totalStudyHours: 45
          },
          recentActivity: 'Nova sessão agendada para amanhã',
          createdAt: '2024-12-01',
          owner: {
            name: 'Ana Silva',
            avatar: '/avatars/ana.jpg'
          }
        },
        {
          id: '2',
          name: 'Clube de Leitura',
          description: 'Discussões sobre literatura brasileira e mundial',
          subject: 'Português',
          level: 'intermediario',
          members: 12,
          maxMembers: 15,
          isPublic: true,
          isMember: false,
          isOwner: false,
          tags: ['literatura', 'redação', 'interpretação'],
          nextMeeting: {
            date: '2025-02-03',
            time: '14:00',
            location: 'Sala Virtual',
            type: 'online'
          },
          stats: {
            sessionsCompleted: 22,
            averageRating: 4.6,
            totalStudyHours: 66
          },
          recentActivity: 'Novo livro selecionado: Dom Casmurro',
          createdAt: '2024-11-15',
          owner: {
            name: 'Carlos Santos',
            avatar: '/avatars/carlos.jpg'
          }
        },
        {
          id: '3',
          name: 'Física Experimental',
          description: 'Experimentos práticos e resolução de problemas',
          subject: 'Física',
          level: 'intermediario',
          members: 6,
          maxMembers: 10,
          isPublic: true,
          isMember: true,
          isOwner: true,
          tags: ['experimentos', 'mecânica', 'eletricidade'],
          nextMeeting: {
            date: '2025-02-02',
            time: '16:30',
            location: 'Laboratório de Física',
            type: 'presencial'
          },
          stats: {
            sessionsCompleted: 8,
            averageRating: 4.9,
            totalStudyHours: 24
          },
          recentActivity: 'Experimento sobre ondas agendado',
          createdAt: '2025-01-10',
          owner: {
            name: 'Você',
            avatar: '/avatars/user.jpg'
          }
        },
        {
          id: '4',
          name: 'História do Brasil',
          description: 'Estudo cronológico da história brasileira',
          subject: 'História',
          level: 'iniciante',
          members: 15,
          maxMembers: 20,
          isPublic: true,
          isMember: false,
          isOwner: false,
          tags: ['brasil', 'cronologia', 'república'],
          stats: {
            sessionsCompleted: 12,
            averageRating: 4.4,
            totalStudyHours: 36
          },
          recentActivity: 'Discussão sobre Era Vargas',
          createdAt: '2024-12-20',
          owner: {
            name: 'Maria Oliveira',
            avatar: '/avatars/maria.jpg'
          }
        }
      ];

      setStudyGroups(mockGroups);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMySessions = async () => {
    try {
      const mockSessions: StudySession[] = [
        {
          id: '1',
          groupId: '1',
          title: 'Revisão de Álgebra Linear',
          description: 'Revisão dos conceitos fundamentais de matrizes e determinantes',
          date: '2025-02-01',
          time: '15:00',
          duration: 120,
          location: 'Biblioteca Central',
          type: 'presencial',
          participants: 6,
          maxParticipants: 8,
          status: 'agendada'
        },
        {
          id: '2',
          groupId: '3',
          title: 'Experimento: Movimento Harmônico',
          description: 'Análise prática do movimento harmônico simples',
          date: '2025-02-02',
          time: '16:30',
          duration: 90,
          location: 'Laboratório de Física',
          type: 'presencial',
          participants: 4,
          maxParticipants: 6,
          status: 'agendada'
        }
      ];

      setMySessions(mockSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    }
  };

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = selectedSubject === 'todos' || group.subject === selectedSubject;
    const matchesLevel = selectedLevel === 'todos' || group.level === selectedLevel;
    
    return matchesSearch && matchesSubject && matchesLevel;
  });

  const myGroups = studyGroups.filter(group => group.isMember);

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isMember: true, members: group.members + 1 }
        : group
    ));
  };

  const handleLeaveGroup = (groupId: string) => {
    setStudyGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isMember: false, members: group.members - 1 }
        : group
    ));
  };

  const handleCreateGroup = () => {
    const group: StudyGroup = {
      id: Date.now().toString(),
      ...newGroup,
      members: 1,
      isMember: true,
      isOwner: true,
      stats: {
        sessionsCompleted: 0,
        averageRating: 0,
        totalStudyHours: 0
      },
      recentActivity: 'Grupo criado',
      createdAt: new Date().toISOString().split('T')[0],
      owner: {
        name: 'Você',
        avatar: '/avatars/user.jpg'
      }
    };

    setStudyGroups(prev => [group, ...prev]);
    setShowCreateModal(false);
    setNewGroup({
      name: '',
      description: '',
      subject: '',
      level: 'iniciante',
      maxMembers: 10,
      isPublic: true,
      tags: []
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'iniciante': return 'bg-green-100 text-green-700';
      case 'intermediario': return 'bg-yellow-100 text-yellow-700';
      case 'avancado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada': return 'bg-blue-100 text-blue-700';
      case 'em-andamento': return 'bg-green-100 text-green-700';
      case 'concluida': return 'bg-gray-100 text-gray-700';
      case 'cancelada': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-700">Grupos de Estudo</h1>
              <p className="text-gray-600 mt-2">
                Conecte-se com outros estudantes e aprenda em grupo
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Criar Grupo
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setSelectedView('grupos')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedView === 'grupos'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todos os Grupos
            </button>
            <button
              onClick={() => setSelectedView('meus-grupos')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedView === 'meus-grupos'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Meus Grupos ({myGroups.length})
            </button>
            <button
              onClick={() => setSelectedView('sessoes')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedView === 'sessoes'
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Próximas Sessões ({mySessions.length})
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        {(selectedView === 'grupos' || selectedView === 'meus-grupos') && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar grupos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="todos">Todas as Matérias</option>
                <option value="Matemática">Matemática</option>
                <option value="Português">Português</option>
                <option value="Física">Física</option>
                <option value="História">História</option>
                <option value="Química">Química</option>
                <option value="Biologia">Biologia</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="todos">Todos os Níveis</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>

              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {selectedView === 'grupos' ? filteredGroups.length : myGroups.length} grupos encontrados
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {selectedView === 'grupos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.subject}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(group.level)}`}>
                      {group.level}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {group.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                    {group.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{group.tags.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{group.members}/{group.maxMembers} membros</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span>{group.stats.averageRating.toFixed(1)}</span>
                      </div>
                    </div>

                    {group.nextMeeting && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(group.nextMeeting.date).toLocaleDateString('pt-BR')} às {group.nextMeeting.time}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="w-4 h-4" />
                      <span>{group.stats.sessionsCompleted} sessões concluídas</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {group.isMember ? (
                      <>
                        <button
                          onClick={() => router.push(`/chat/group/${group.id}`)}
                          className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat
                        </button>
                        {!group.isOwner && (
                          <button
                            onClick={() => handleLeaveGroup(group.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Sair
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.members >= group.maxMembers}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        {group.members >= group.maxMembers ? 'Grupo Lotado' : 'Participar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'meus-grupos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{group.name}</h3>
                        <p className="text-sm text-gray-600">{group.subject}</p>
                      </div>
                    </div>
                    {group.isOwner && (
                      <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                        Proprietário
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Última atividade:</span>
                      <span className="font-medium">{group.recentActivity}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Horas de estudo:</span>
                      <span className="font-medium">{group.stats.totalStudyHours}h</span>
                    </div>

                    {group.nextMeeting && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-1">
                          <Calendar className="w-4 h-4" />
                          Próxima reunião
                        </div>
                        <p className="text-sm text-blue-600">
                          {new Date(group.nextMeeting.date).toLocaleDateString('pt-BR')} às {group.nextMeeting.time}
                        </p>
                        <p className="text-xs text-blue-500 mt-1">
                          {group.nextMeeting.location}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/chat/group/${group.id}`)}
                      className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat
                    </button>
                    {group.isOwner && (
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedView === 'sessoes' && (
          <div className="space-y-4">
            {mySessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{session.title}</h3>
                    <p className="text-gray-600 mt-1">{session.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                    {session.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {new Date(session.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{session.time} ({session.duration}min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{session.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {session.participants}/{session.maxParticipants} participantes
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {session.type === 'online' && session.status === 'agendada' && (
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Entrar na Sala
                    </button>
                  )}
                  <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Group Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Criar Novo Grupo</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Grupo
                  </label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Matemática Avançada"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Descreva o objetivo e foco do grupo..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Matéria
                    </label>
                    <select
                      value={newGroup.subject}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Selecione uma matéria</option>
                      <option value="Matemática">Matemática</option>
                      <option value="Português">Português</option>
                      <option value="Física">Física</option>
                      <option value="História">História</option>
                      <option value="Química">Química</option>
                      <option value="Biologia">Biologia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível
                    </label>
                    <select
                      value={newGroup.level}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, level: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo de Membros
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={newGroup.maxMembers}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newGroup.isPublic}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-700">
                    Grupo público (qualquer pessoa pode participar)
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateGroup}
                  disabled={!newGroup.name || !newGroup.subject}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Grupo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 