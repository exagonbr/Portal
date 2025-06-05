'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Award,
  Bell,
  Download,
  CheckCircle,
  AlertCircle,
  Star,
  Target,
  BarChart,
  MessageSquare,
  Trophy,
  Zap,
  Brain,
  Users,
  Video,
  Gamepad2,
  Heart,
  Flame,
  Shield,
  Gem,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { classService } from '@/services/classService';
import { Class } from '@/types/class';
import { SHIFT_LABELS } from '@/types/class';
import { UserRole, ROLE_COLORS } from '@/types/roles';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';

interface StudentStats {
  averageGrade: number;
  completedTasks: number;
  pendingTasks: number;
  attendance: number;
  ranking: number;
  totalStudents: number;
  xpPoints: number;
  level: number;
  streakDays: number;
  badges: number;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

interface Grade {
  id: string;
  subject: string;
  assessment: string;
  grade: number;
  maxGrade: number;
  date: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  uploadDate: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  total: number;
  unlocked: boolean;
  xpReward: number;
}

interface LearningPath {
  id: string;
  subject: string;
  currentTopic: string;
  progress: number;
  nextTopic: string;
  estimatedTime: string;
}

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  members: number;
  nextMeeting: string;
  isActive: boolean;
}

function StudentDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [myClass, setMyClass] = useState<Class | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    averageGrade: 0,
    completedTasks: 0,
    pendingTasks: 0,
    attendance: 0,
    ranking: 0,
    totalStudents: 0,
    xpPoints: 0,
    level: 0,
    streakDays: 0,
    badges: 0
  });
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [recentGrades, setRecentGrades] = useState<Grade[]>([]);
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'academic' | 'activities' | 'calendar'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar turma do aluno
      // Por enquanto vamos simular os dados
      const mockClass: Class = {
        id: '1',
        name: '5º Ano A',
        code: '5A-2025',
        school_id: 'school1',
        year: 2025,
        shift: 'MORNING',
        max_students: 30,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setMyClass(mockClass);
      
      // Estatísticas simuladas
      setStats({
        averageGrade: 8.5,
        completedTasks: 24,
        pendingTasks: 3,
        attendance: 95,
        ranking: 5,
        totalStudents: 28,
        xpPoints: 2450,
        level: 12,
        streakDays: 7,
        badges: 8
      });

      // Tarefas
      setAssignments([
        {
          id: '1',
          title: 'Exercícios de Matemática - Frações',
          subject: 'Matemática',
          dueDate: '2025-02-05',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Redação sobre Meio Ambiente',
          subject: 'Português',
          dueDate: '2025-02-03',
          status: 'submitted'
        },
        {
          id: '3',
          title: 'Pesquisa sobre Sistema Solar',
          subject: 'Ciências',
          dueDate: '2025-02-01',
          status: 'graded',
          grade: 9.0
        }
      ]);

      // Notas recentes
      setRecentGrades([
        {
          id: '1',
          subject: 'Matemática',
          assessment: 'Prova Mensal',
          grade: 8.5,
          maxGrade: 10,
          date: '2025-01-25'
        },
        {
          id: '2',
          subject: 'Português',
          assessment: 'Trabalho em Grupo',
          grade: 9.0,
          maxGrade: 10,
          date: '2025-01-23'
        },
        {
          id: '3',
          subject: 'História',
          assessment: 'Apresentação',
          grade: 8.0,
          maxGrade: 10,
          date: '2025-01-20'
        }
      ]);

      // Materiais de estudo
      setStudyMaterials([
        {
          id: '1',
          title: 'Apostila de Matemática - Cap. 5',
          subject: 'Matemática',
          type: 'pdf',
          uploadDate: '2025-01-28'
        },
        {
          id: '2',
          title: 'Vídeo Aula - Verbos',
          subject: 'Português',
          type: 'video',
          uploadDate: '2025-01-27'
        },
        {
          id: '3',
          title: 'Exercícios Complementares',
          subject: 'Ciências',
          type: 'document',
          uploadDate: '2025-01-26'
        }
      ]);

      // Comunicados
      setAnnouncements([
        {
          id: '1',
          title: 'Reunião de Pais',
          content: 'Convidamos todos os pais para a reunião bimestral',
          author: 'Coordenação',
          date: '2025-01-28',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Excursão ao Museu',
          content: 'Próxima sexta-feira visitaremos o Museu de Ciências',
          author: 'Prof. Ana',
          date: '2025-01-27',
          priority: 'medium'
        }
      ]);

      // Conquistas
      setAchievements([
        {
          id: '1',
          title: 'Estudante Dedicado',
          description: 'Complete 10 tarefas consecutivas',
          icon: 'star',
          progress: 8,
          total: 10,
          unlocked: false,
          xpReward: 100
        },
        {
          id: '2',
          title: 'Mestre da Matemática',
          description: 'Obtenha média 9+ em Matemática',
          icon: 'calculator',
          progress: 1,
          total: 1,
          unlocked: true,
          xpReward: 200
        },
        {
          id: '3',
          title: 'Colaborador',
          description: 'Participe de 5 grupos de estudo',
          icon: 'users',
          progress: 3,
          total: 5,
          unlocked: false,
          xpReward: 150
        }
      ]);

      // Trilhas de aprendizagem
      setLearningPaths([
        {
          id: '1',
          subject: 'Matemática',
          currentTopic: 'Frações',
          progress: 65,
          nextTopic: 'Decimais',
          estimatedTime: '2h'
        },
        {
          id: '2',
          subject: 'Português',
          currentTopic: 'Verbos',
          progress: 80,
          nextTopic: 'Concordância',
          estimatedTime: '1h30'
        },
        {
          id: '3',
          subject: 'Ciências',
          currentTopic: 'Sistema Solar',
          progress: 45,
          nextTopic: 'Planetas',
          estimatedTime: '3h'
        }
      ]);

      // Grupos de estudo
      setStudyGroups([
        {
          id: '1',
          name: 'Matemática Avançada',
          subject: 'Matemática',
          members: 8,
          nextMeeting: '2025-02-01 15:00',
          isActive: true
        },
        {
          id: '2',
          name: 'Clube de Leitura',
          subject: 'Português',
          members: 12,
          nextMeeting: '2025-02-03 14:00',
          isActive: true
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'graded':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Portal do Estudante
          </h1>
          <p className="text-gray-600 dark:text-gray-600 mt-2">
            Acompanhe seu progresso acadêmico e atividades
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'overview'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setSelectedView('academic')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'academic'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
            }`}
          >
            Acadêmico
          </button>
          <button
            onClick={() => setSelectedView('activities')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'activities'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
            }`}
          >
            Atividades
          </button>
          <button
            onClick={() => setSelectedView('calendar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === 'calendar'
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
            }`}
          >
            Calendário
          </button>
        </div>
      </div>

      {/* Barra de Progresso e Gamificação */}
      <div className="bg-gradient-to-r from-accent-purple to-primary text-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.level}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Star className="w-4 h-4 text-yellow-900" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Nível {stats.level} - Explorador</h2>
              <p className="text-blue-100">
                {stats.xpPoints} XP • Próximo nível em {(stats.level + 1) * 250 - stats.xpPoints} XP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="w-5 h-5 text-orange-300" />
                <span className="text-2xl font-bold">{stats.streakDays}</span>
              </div>
              <p className="text-xs text-blue-100">dias seguidos</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-2xl font-bold">{stats.badges}</span>
              </div>
              <p className="text-xs text-blue-100">conquistas</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-5 h-5 text-green-300" />
                <span className="text-2xl font-bold">{stats.ranking}º</span>
              </div>
              <p className="text-xs text-blue-100">no ranking</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${(stats.xpPoints % 250) / 250 * 100}%` }}
          />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          title="Média Geral"
          value={stats.averageGrade.toFixed(1)}
          subtitle="de 10.0"
          color="bg-primary-light"
          trend="+0.5"
        />
        <StatCard
          icon={CheckCircle}
          title="Tarefas"
          value={stats.completedTasks}
          subtitle={`${stats.pendingTasks} pendentes`}
          color="bg-accent-green"
        />
        <StatCard
          icon={Calendar}
          title="Frequência"
          value={`${stats.attendance}%`}
          subtitle="de presença"
          color="bg-accent-purple"
        />
        <StatCard
          icon={Activity}
          title="Atividade"
          value={`${stats.streakDays}d`}
          subtitle="sequência atual"
          color="bg-accent-orange"
        />
      </div>

      {/* Conteúdo baseado na view selecionada */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarefas Pendentes */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Minhas Tarefas
            </h2>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 bg-primary/10 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>{assignment.subject}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {assignment.grade !== undefined && (
                      <span className={`font-bold ${getGradeColor(assignment.grade, 10)}`}>
                        {assignment.grade.toFixed(1)}
                      </span>
                    )}
                    <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                      {assignment.status === 'pending' ? 'Pendente' :
                       assignment.status === 'submitted' ? 'Enviada' : 'Corrigida'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/assignments/view-all')}
              className="w-full mt-4 text-center text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Ver todas as tarefas
            </button>
          </div>

          {/* Notas Recentes */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-accent-green" />
              Notas Recentes
            </h2>
            <div className="space-y-3">
              {recentGrades.map((grade) => (
                <div
                  key={grade.id}
                  className="flex items-center justify-between p-4 bg-gray-50 bg-primary/10 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{grade.subject}</h3>
                    <p className="text-sm text-gray-500">{grade.assessment}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(grade.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getGradeColor(grade.grade, grade.maxGrade)}`}>
                      {grade.grade.toFixed(1)}
                    </p>
                    <p className="text-sm text-gray-500">de {grade.maxGrade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trilhas de Aprendizagem */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-accent-purple" />
              Minhas Trilhas de Aprendizagem
            </h2>
            <div className="space-y-4">
              {learningPaths.map((path) => (
                <div key={path.id} className="p-4 bg-gray-50 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{path.subject}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-600">
                        Tópico atual: {path.currentTopic}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{path.estimatedTime}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progresso</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-accent-purple h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Próximo: {path.nextTopic}
                  </p>
                  <button className="mt-2 text-sm text-accent-purple hover:text-purple-800">
                    Continuar aprendendo →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
          {/* Desafio do Dia */}
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Desafio do Dia
            </h3>
            <p className="text-sm mb-3">
              Complete 3 exercícios de matemática para ganhar 50 XP bonus!
            </p>
            <div className="flex justify-between items-center">
              <div className="text-xs">
                <p>Progresso: 1/3</p>
                <p>Expira em: 8h</p>
              </div>
              <button className="px-3 py-1 bg-white/20 rounded hover:bg-white/30 transition-colors">
                Aceitar
              </button>
            </div>
          </div>

          {/* Materiais de Estudo */}
          <div className="bg-white bg-primary/10 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-accent-purple" />
              Materiais de Estudo
            </h2>
            <div className="space-y-3">
              {studyMaterials.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between p-3 bg-gray-50 bg-primary/10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      material.type === 'pdf' ? 'bg-red-100 text-red-600' :
                      material.type === 'video' ? 'bg-primary/20 text-primary' :
                      material.type === 'document' ? 'bg-accent-green/20 text-accent-green' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{material.title}</p>
                      <p className="text-xs text-gray-500">{material.subject}</p>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/portal/student/materials')}
              className="w-full mt-4 text-center text-sm text-primary hover:text-primary-dark transition-colors"
            >
              Ver todos os materiais
            </button>
          </div>

          {/* Comunicados */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-accent-orange" />
              Comunicados
            </h2>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 bg-gray-50 bg-primary/10 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{announcement.title}</h3>
                    {announcement.priority === 'high' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-600 mb-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{announcement.author}</span>
                    <span>{new Date(announcement.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Próximas Conquistas */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-accent-yellow" />
              Próximas Conquistas
            </h3>
            <div className="space-y-3">
              {achievements.filter(a => !a.unlocked).slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="p-3 bg-gray-50 bg-primary/10 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                    <span className="text-xs text-accent-purple font-medium">
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-accent-yellow h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.progress}/{achievement.total}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/live/student')}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Video className="w-4 h-4" />
                Aula ao Vivo
              </button>
              <button 
                onClick={() => router.push('/quiz/student')}
                className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Gamepad2 className="w-4 h-4" />
                Quiz Interativo
              </button>
              <button 
                onClick={() => router.push('/study-groups/student')}
                className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" />
                Grupo de Estudos
              </button>
              <button 
                onClick={() => router.push('/chat/teacher')}
                className="w-full px-4 py-2 bg-accent-orange text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Falar com Professor
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* View de Aprendizado */}
      {selectedView === 'academic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-accent-purple" />
                Recursos de Aprendizagem Personalizados
              </h2>
              
              <div className="mb-6">
                <div className="flex flex-col md:flex-row gap-2 mb-4">
                  <button className="px-4 py-2 bg-accent-purple text-white rounded-lg">
                    Para Você
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-300 rounded-lg">
                    Todos
                  </button>
                  <button className="px-4 py-2 bg-gray-200 dark:bg-gray-300 rounded-lg">
                    Favoritos
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studyMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-4 border border-gray-200 dark:border-gray-400 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 rounded-lg ${
                          material.type === 'video' ? 'bg-red-100 text-red-600' :
                          material.type === 'pdf' ? 'bg-primary/20 text-primary' :
                          material.type === 'document' ? 'bg-accent-green/20 text-accent-green' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {material.type === 'video' ? <Video className="w-6 h-6" /> :
                           <FileText className="w-6 h-6" />}
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                      <h3 className="font-semibold mb-1">{material.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-600 mb-3">
                        {material.subject}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(material.uploadDate).toLocaleDateString('pt-BR')}
                        </span>
                        <button className="px-3 py-1 bg-accent-purple text-white rounded text-sm hover:bg-purple-700">
                          Acessar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Jogos Educativos */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Gamepad2 className="w-5 h-5 mr-2 text-accent-green" />
                  Jogos Educativos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-primary-light to-primary text-white rounded-lg">
                    <Zap className="w-8 h-8 mb-2" />
                    <h4 className="font-semibold">Math Quest</h4>
                    <p className="text-sm text-blue-100">Aventura matemática</p>
                    <button className="mt-2 text-sm underline">Jogar →</button>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-accent-green to-green-600 text-white rounded-lg">
                    <Brain className="w-8 h-8 mb-2" />
                    <h4 className="font-semibold">Word Master</h4>
                    <p className="text-sm text-green-100">Desafio de palavras</p>
                    <button className="mt-2 text-sm underline">Jogar →</button>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-accent-purple to-purple-600 text-white rounded-lg">
                    <Star className="w-8 h-8 mb-2" />
                    <h4 className="font-semibold">Science Lab</h4>
                    <p className="text-sm text-purple-100">Experimentos virtuais</p>
                    <button className="mt-2 text-sm underline">Jogar →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Recomendações Personalizadas */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recomendado para Você</h3>
              <p className="text-sm text-gray-600 dark:text-gray-600 mb-4">
                Baseado no seu desempenho e interesses
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 bg-blue-900/20 rounded-lg">
                  <p className="font-medium text-sm">Reforço em Frações</p>
                  <p className="text-xs text-gray-600 dark:text-gray-600 mt-1">
                    Melhore sua nota em matemática
                  </p>
                  <button className="mt-2 text-xs text-primary hover:text-primary-dark">
                    Começar agora →
                  </button>
                </div>
                <div className="p-3 bg-green-50 bg-green-900/20 rounded-lg">
                  <p className="font-medium text-sm">Desafio de Redação</p>
                  <p className="text-xs text-gray-600 dark:text-gray-600 mt-1">
                    Pratique escrita criativa
                  </p>
                  <button className="mt-2 text-xs text-accent-green hover:text-green-800">
                    Aceitar desafio →
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas de Aprendizado */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Seu Progresso</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tempo de estudo hoje</span>
                    <span className="font-medium">2h 15min</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Exercícios completados</span>
                    <span className="font-medium">18/25</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-accent-green h-2 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Vídeos assistidos</span>
                    <span className="font-medium">5/8</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-accent-purple h-2 rounded-full" style={{ width: '62.5%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Social */}
      {selectedView === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Grupos de Estudo
              </h2>
              
              <div className="space-y-4">
                {studyGroups.map((group) => (
                  <div
                    key={group.id}
                    className="p-4 border border-gray-200 dark:border-gray-400 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{group.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-600">
                          {group.subject} • {group.members} membros
                        </p>
                      </div>
                      {group.isActive && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                          Ativo agora
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        Próximo encontro: {new Date(group.nextMeeting).toLocaleString('pt-BR')}
                      </p>
                      <button className="px-3 py-1 bg-primary text-white rounded text-sm hover:bg-primary-dark">
                        Participar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-300 rounded-lg hover:bg-gray-300 hover:bg-gray-600 transition-colors">
                Criar Novo Grupo
              </button>
            </div>

            {/* Ranking da Turma */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-accent-yellow" />
                Ranking da Turma
              </h2>
              
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((position) => (
                  <div
                    key={position}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      position === stats.ranking ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50 bg-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        position === 1 ? 'bg-yellow-400 text-yellow-900' :
                        position === 2 ? 'bg-gray-300 text-gray-700' :
                        position === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {position}
                      </div>
                      <div>
                        <p className="font-medium">
                          {position === stats.ranking ? user?.name : `Aluno ${position}`}
                        </p>
                        <p className="text-xs text-gray-500">{2500 - (position - 1) * 100} XP</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Nível {13 - position}</p>
                      <p className="text-xs text-gray-500">Média: {(9.5 - (position - 1) * 0.3).toFixed(1)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Atividade dos Amigos */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Atividade dos Amigos</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
                    M
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Maria</span> completou o desafio de matemática
                    </p>
                    <p className="text-xs text-gray-500">Há 2 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-green flex items-center justify-center text-white text-sm font-bold">
                    J
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">João</span> subiu para o nível 15!
                    </p>
                    <p className="text-xs text-gray-500">Há 5 horas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-purple flex items-center justify-center text-white text-sm font-bold">
                    A
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">Ana</span> criou um grupo de estudos
                    </p>
                    <p className="text-xs text-gray-500">Ontem</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desafios em Grupo */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Desafios em Grupo</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-accent-purple to-pink-500 text-white rounded-lg">
                  <h4 className="font-medium">Maratona de Matemática</h4>
                  <p className="text-sm text-purple-100 mt-1">
                    Resolva 50 problemas em equipe
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs">3 dias restantes</span>
                    <button className="text-sm underline">Participar →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View de Conquistas */}
      {selectedView === 'calendar' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-accent-yellow" />
              Minhas Conquistas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg ${
                    achievement.unlocked
                      ? 'border-yellow-400 bg-yellow-50 bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-400 bg-gray-50 bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-gray-200 dark:bg-gray-300 text-gray-500'
                    }`}>
                      {achievement.icon === 'star' ? <Star className="w-6 h-6" /> :
                       achievement.icon === 'calculator' ? <Brain className="w-6 h-6" /> :
                       <Users className="w-6 h-6" />}
                    </div>
                    {achievement.unlocked && (
                      <Shield className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <h3 className={`font-semibold mb-1 ${
                    !achievement.unlocked && 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-600 mb-3">
                    {achievement.description}
                  </p>
                  {!achievement.unlocked && (
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso</span>
                        <span>{achievement.progress}/{achievement.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-600">
                      +{achievement.xpReward} XP
                    </span>
                    {achievement.unlocked && (
                      <span className="text-xs text-gray-500">
                        Desbloqueado!
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estatísticas de Conquistas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 text-center">
              <Gem className="w-12 h-12 mx-auto mb-3 text-accent-purple" />
              <h3 className="text-2xl font-bold mb-1">{stats.badges}</h3>
              <p className="text-gray-600 dark:text-gray-600">Conquistas Desbloqueadas</p>
            </div>
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 text-center">
              <Zap className="w-12 h-12 mx-auto mb-3 text-accent-yellow" />
              <h3 className="text-2xl font-bold mb-1">{stats.xpPoints}</h3>
              <p className="text-gray-600 dark:text-gray-600">Pontos de Experiência</p>
            </div>
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 text-center">
              <Flame className="w-12 h-12 mx-auto mb-3 text-accent-orange" />
              <h3 className="text-2xl font-bold mb-1">{stats.streakDays}</h3>
              <p className="text-gray-600 dark:text-gray-600">Dias de Sequência</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente principal com proteção de rotas
export default function StudentDashboard() {
  return (
    <RoleProtectedRoute
      allowedRoles={['student', 'aluno', 'Aluno']}
      fallbackPath="/login"
      loadingComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-600">Verificando permissões...</p>
          </div>
        </div>
      }
      unauthorizedComponent={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-800 mb-2">
              Acesso Negado
            </h2>
            <p className="text-gray-600 dark:text-gray-600 mb-4">
              Você não tem permissão para acessar o dashboard de estudante.
            </p>
            <button
              onClick={() => window.location.href = '/login?error=unauthorized'}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Fazer Login
            </button>
          </div>
        </div>
      }
    >
      <StudentDashboardContent />
    </RoleProtectedRoute>
  );
}

// Componente de Card de Estatística
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  trend?: string;
}

function StatCard({ icon: Icon, title, value, subtitle, color, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800 dark:text-black">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-600">{subtitle}</p>
    </div>
  );
}

