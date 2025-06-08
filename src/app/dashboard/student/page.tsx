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
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

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
  const { theme } = useTheme();
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
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: theme.colors.text.primary }}>
            <BookOpen className="w-8 h-8" style={{ color: theme.colors.primary.DEFAULT }} />
            Portal do Estudante
          </h1>
          <p className="mt-2" style={{ color: theme.colors.text.secondary }}>
            Acompanhe seu progresso acadêmico e atividades
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedView === 'overview' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Visão Geral
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedView('academic')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedView === 'academic' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Acadêmico
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedView('activities')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedView === 'activities' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Atividades
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedView('calendar')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              selectedView === 'calendar' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Calendário
          </motion.button>
        </div>
      </motion.div>

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Média Geral</div>
          <div className="text-2xl font-bold text-gray-600">8.7</div>
          <div className="text-xs text-green-600 mt-2">↑ 0.2 este bimestre</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Presença</div>
          <div className="text-2xl font-bold text-gray-600">96%</div>
          <div className="text-xs text-green-600 mt-2">↑ 1% este mês</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Tarefas Pendentes</div>
          <div className="text-2xl font-bold text-gray-600">2</div>
          <div className="text-xs text-red-600 mt-2">1 para hoje</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm font-medium text-gray-500 mb-1">Próxima Avaliação</div>
          <div className="text-2xl font-bold text-gray-600">15/05</div>
          <div className="text-xs text-blue-600 mt-2">Matemática</div>
        </div>
      </div>

      {/* Aulas do Dia */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Aulas de Hoje</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">science</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700">Matemática</h3>
              <p className="text-sm text-gray-500">Prof. Silva • 08:00 - 09:30</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Sala 203</div>
              <div className="text-xs text-green-600">Presença Confirmada</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600">menu_book</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700">Português</h3>
              <p className="text-sm text-gray-500">Prof. Santos • 10:00 - 11:30</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Sala 105</div>
              <div className="text-xs text-green-600">Presença Confirmada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarefas Pendentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Tarefas Pendentes</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600">assignment</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700">Exercícios de Matemática</h3>
              <p className="text-sm text-gray-500">Entrega: Hoje, 23:59</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Status</div>
              <div className="text-xs text-red-600">Pendente</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600">assignment</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700">Resenha de Literatura</h3>
              <p className="text-sm text-gray-500">Entrega: Amanhã, 23:59</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">Status</div>
              <div className="text-xs text-yellow-600">Em Andamento</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Notas Recentes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">science</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Matemática</h3>
                <p className="text-sm text-gray-500">Prova Bimestral</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-600">9.0</div>
              <div className="text-xs text-green-600">Acima da média</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600">menu_book</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Português</h3>
                <p className="text-sm text-gray-500">Redação</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-600">8.5</div>
              <div className="text-xs text-green-600">Acima da média</div>
            </div>
          </div>
        </div>
      </div>
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
          <Icon className={`w-5 h-5 ${color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
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

