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
  Activity,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { classService } from '@/services/classService';
import { Class } from '@/types/class';
import { SHIFT_LABELS } from '@/types/class';
import { UserRole, ROLE_COLORS } from '@/types/roles';

import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { StatCard, ContentCard, SimpleCard } from '@/components/ui/StandardCard';

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
  nextEvaluation: number;
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
        badges: 8,
        nextEvaluation: 3
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
    <div className="p-3 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-4"
      >
        <h1 className="text-xl font-bold text-gray-800 mb-1">
          Olá, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 text-sm">
          Bem-vindo(a) ao seu portal educacional. Acompanhe seu progresso e organize seus estudos.
        </p>
      </motion.div>

      {/* Navegação por Abas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-4"
      >
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedView('overview')}
            className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
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
            className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
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
            className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
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
            className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
              selectedView === 'calendar' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-600 hover:text-white'
            }`}
          >
            Calendário
          </motion.button>
        </div>
      </motion.div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={TrendingUp}
          title="Média Geral"
          value={stats.averageGrade.toFixed(1)}
          subtitle="Desempenho acadêmico"
          color="blue"
        />

        <StatCard
          icon={CheckCircle}
          title="Frequência"
          value={`${stats.attendance.toFixed(1)}%`}
          subtitle="Taxa de presença"
          color="green"
        />

        <StatCard
          icon={Clock}
          title="Tarefas Pendentes"
          value={stats.pendingTasks}
          subtitle="Para entregar"
          color="amber"
        />

        <StatCard
          icon={Calendar}
          title="Próxima Avaliação"
          value={stats.nextEvaluation}
          subtitle="Em breve"
          color="purple"
        />
      </div>

      {/* Aulas do Dia */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Aulas de Hoje</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-md border border-gray-200">
            <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 text-sm">science</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700 text-sm">Matemática</h3>
              <p className="text-xs text-gray-500">Prof. Silva • 08:00 - 09:30</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-700">Sala 203</div>
              <div className="text-xs text-green-600">Presença Confirmada</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md border border-gray-200">
            <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600 text-sm">menu_book</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700 text-sm">Português</h3>
              <p className="text-xs text-gray-500">Prof. Santos • 10:00 - 11:30</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-700">Sala 105</div>
              <div className="text-xs text-green-600">Presença Confirmada</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tarefas Pendentes */}
      <div className="bg-white p-3 rounded-lg shadow-sm mb-3">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Tarefas Pendentes</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-md border border-gray-200">
            <div className="w-8 h-8 rounded-md bg-red-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-red-600 text-sm">assignment</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700 text-sm">Exercícios de Matemática</h3>
              <p className="text-xs text-gray-500">Entrega: Hoje, 23:59</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-700">Status</div>
              <div className="text-xs text-red-600">Pendente</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md border border-gray-200">
            <div className="w-8 h-8 rounded-md bg-yellow-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-yellow-600 text-sm">assignment</span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-700 text-sm">Resenha de Literatura</h3>
              <p className="text-xs text-gray-500">Entrega: Amanhã, 23:59</p>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-gray-700">Status</div>
              <div className="text-xs text-yellow-600">Em Andamento</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas Recentes */}
      <div className="bg-white p-3 rounded-lg shadow-sm">
        <h2 className="text-base font-semibold text-gray-700 mb-3">Notas Recentes</h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-md border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-sm">science</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 text-sm">Matemática</h3>
                <p className="text-xs text-gray-500">Prova Bimestral</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-600">9.0</div>
              <div className="text-xs text-green-600">Acima da média</div>
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-md border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-sm">menu_book</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 text-sm">Português</h3>
                <p className="text-xs text-gray-500">Redação</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-600">8.5</div>
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
    <StudentDashboardContent />
  );
}



