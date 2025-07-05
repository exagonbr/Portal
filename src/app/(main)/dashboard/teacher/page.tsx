'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  FileText,
  TrendingUp,
  Award,
  Bell,
  Video,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Target,
  UserCheck,
  Activity,
  PenTool,
  ClipboardList,
  Eye,
  Send,
  Paperclip,
  Download,
  Upload,
  Heart,
  Brain,
  Lightbulb,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { classService } from '@/services/classService';
import { Class } from '@/types/class';
import { UserClass } from '@/types/userClass';
import { SHIFT_LABELS } from '@/types/class';
import { UserRole, ROLE_COLORS } from '@/types/roles';
import { RoleProtectedRoute } from '@/components/auth/RoleProtectedRoute';


interface TeacherStats {
  totalClasses: number;
  totalStudents: number;
  totalActivities: number;
  totalMessages: number;
  upcomingEvents: number;
  pendingTasks: number;
  averageGrade: number;
  attendanceRate: number;
}

interface StudentProgress {
  id: string;
  name: string;
  class: string;
  currentGrade: number;
  previousGrade: number;
  trend: 'up' | 'down' | 'stable';
  attendance: number;
  assignments: number;
  needsAttention: boolean;
  strengths: string[];
  challenges: string[];
}

interface UpcomingClass {
  id: string;
  className: string;
  time: string;
  room: string;
  students: number;
  topic: string;
  materials: boolean;
}

interface RecentActivity {
  id: string;
  type: 'assignment' | 'grade' | 'message' | 'announcement' | 'parent' | 'behavior';
  title: string;
  description: string;
  time: string;
  status?: 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
}

interface LearningResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'interactive' | 'assessment';
  subject: string;
  duration: string;
  usage: number;
}

function TeacherDashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [myClasses, setMyClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    totalActivities: 0,
    totalMessages: 0,
    upcomingEvents: 0,
    pendingTasks: 0,
    averageGrade: 0,
    attendanceRate: 0
  });
  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [learningResources, setLearningResources] = useState<LearningResource[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedView, setSelectedView] = useState<'overview' | 'students' | 'resources' | 'communication'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar turmas do professor
      // Por enquanto vamos simular os dados
      const mockClasses: Class[] = [
        {
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
        },
        {
          id: '2',
          name: '5º Ano B',
          code: '5B-2025',
          school_id: 'school1',
          year: 2025,
          shift: 'AFTERNOON',
          max_students: 28,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      setMyClasses(mockClasses);
      
      // Estatísticas simuladas
      setStats({
        totalClasses: 2,
        totalStudents: 58,
        totalActivities: 100,
        totalMessages: 50,
        upcomingEvents: 3,
        pendingTasks: 12,
        averageGrade: 7.8,
        attendanceRate: 92.5
      });

      // Progresso dos alunos
      setStudentProgress([
        {
          id: '1',
          name: 'Ana Silva',
          class: '5º Ano A',
          currentGrade: 8.5,
          previousGrade: 7.8,
          trend: 'up',
          attendance: 95,
          assignments: 100,
          needsAttention: false,
          strengths: ['Matemática', 'Ciências'],
          challenges: ['Redação']
        },
        {
          id: '2',
          name: 'João Santos',
          class: '5º Ano A',
          currentGrade: 6.2,
          previousGrade: 6.8,
          trend: 'down',
          attendance: 88,
          assignments: 75,
          needsAttention: true,
          strengths: ['Artes', 'Educação Física'],
          challenges: ['Matemática', 'Português']
        },
        {
          id: '3',
          name: 'Maria Oliveira',
          class: '5º Ano B',
          currentGrade: 9.2,
          previousGrade: 9.0,
          trend: 'stable',
          attendance: 98,
          assignments: 100,
          needsAttention: false,
          strengths: ['Todas as disciplinas'],
          challenges: []
        }
      ]);

      // Próximas aulas
      setUpcomingClasses([
        {
          id: '1',
          className: '5º Ano A - Matemática',
          time: '08:00',
          room: 'Sala 201',
          students: 28,
          topic: 'Frações e Decimais',
          materials: true
        },
        {
          id: '2',
          className: '5º Ano B - Português',
          time: '10:00',
          room: 'Sala 203',
          students: 26,
          topic: 'Produção Textual',
          materials: true
        },
        {
          id: '3',
          className: '5º Ano A - Ciências',
          time: '14:00',
          room: 'Lab. Ciências',
          students: 28,
          topic: 'Sistema Solar',
          materials: false
        }
      ]);

      // Atividades recentes
      setRecentActivities([
        {
          id: '1',
          type: 'assignment',
          title: 'Nova tarefa postada',
          description: 'Exercícios de Matemática - Frações',
          time: 'Há 2 horas',
          status: 'completed'
        },
        {
          id: '2',
          type: 'grade',
          title: 'Notas lançadas',
          description: 'Prova de Português - 5º Ano B',
          time: 'Há 5 horas',
          status: 'completed'
        },
        {
          id: '3',
          type: 'message',
          title: 'Nova mensagem',
          description: 'Maria Silva - Dúvida sobre tarefa',
          time: 'Há 1 dia',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: '4',
          type: 'parent',
          title: 'Reunião agendada',
          description: 'Pais de João Santos - Desempenho escolar',
          time: 'Há 2 dias',
          status: 'pending',
          priority: 'high'
        },
        {
          id: '5',
          type: 'behavior',
          title: 'Registro comportamental',
          description: 'Pedro Lima - Comportamento exemplar em aula',
          time: 'Há 3 dias',
          status: 'completed',
          priority: 'low'
        }
      ]);

      // Recursos de aprendizagem
      setLearningResources([
        {
          id: '1',
          title: 'Vídeo: Introdução às Frações',
          type: 'video',
          subject: 'Matemática',
          duration: '15 min',
          usage: 24
        },
        {
          id: '2',
          title: 'Exercícios Interativos - Sistema Solar',
          type: 'interactive',
          subject: 'Ciências',
          duration: '30 min',
          usage: 18
        },
        {
          id: '3',
          title: 'Modelo de Redação Narrativa',
          type: 'document',
          subject: 'Português',
          duration: '10 min',
          usage: 32
        }
      ]);

    } catch (error) {
      console.log('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              Painel do Professor
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bem-vindo(a), {user?.name}! Acompanhe o progresso dos seus alunos.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'overview'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedView('students')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'students'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Alunos
            </button>
            <button
              onClick={() => setSelectedView('resources')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'resources'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Recursos
            </button>
            <button
              onClick={() => setSelectedView('communication')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'communication'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              Comunicação
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Turmas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalClasses}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Turmas</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Turmas Ativas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Minhas turmas em andamento</p>
          </div>
        </div>

        {/* Card Estudantes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estudantes</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total de Alunos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sob minha orientação</p>
          </div>
        </div>

        {/* Card Atividades */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalActivities}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Atividades</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Atividades</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Criadas e aplicadas</p>
          </div>
        </div>

        {/* Card Média */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.averageGrade.toFixed(1)}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Média</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notas</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Média geral das turmas</p>
          </div>
        </div>
      </div>

      {/* Segunda linha de cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card Frequência */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.attendanceRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Frequência</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Presença</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Taxa média de presença</p>
          </div>
        </div>

        {/* Card Mensagens */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-lg">
              <MessageSquare className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalMessages}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mensagens</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comunicação</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Trocadas com estudantes</p>
          </div>
        </div>

        {/* Card Eventos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Eventos</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Agenda</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Próximos agendados</p>
          </div>
        </div>

        {/* Card Tarefas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <ClipboardList className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tarefas</p>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pendências</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Para correção</p>
          </div>
        </div>
      </div>

      {/* Seletor de Turma e Ações Rápidas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Turma:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as turmas</option>
              {myClasses.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name} - {SHIFT_LABELS[classItem.shift]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm">
              <Video className="w-4 h-4" />
              Iniciar Aula
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm">
              <FileText className="w-4 h-4" />
              Nova Tarefa
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 shadow-sm">
              <MessageSquare className="w-4 h-4" />
              Avisos
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo baseado na view selecionada */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Aulas */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Próximas Aulas
            </h2>
            <div className="space-y-3">
              {upcomingClasses.map((upClass) => (
                <div
                  key={upClass.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{upClass.time}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{upClass.className}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {upClass.topic}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {upClass.room} • {upClass.students} alunos
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {upClass.materials && (
                      <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                        Material pronto
                      </span>
                    )}
                    <button className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                      Iniciar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alunos que Precisam de Atenção */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <AlertCircle className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              Alunos que Precisam de Atenção
            </h2>
            <div className="space-y-4">
              {studentProgress.filter(s => s.needsAttention).map((student) => (
                <div
                  key={student.id}
                  className="p-4 border border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{student.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.class}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">{student.currentGrade.toFixed(1)}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {student.trend === 'down' ? '↓' : student.trend === 'up' ? '↑' : '→'}
                        {student.previousGrade.toFixed(1)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Presença</p>
                      <p className="font-medium text-gray-900 dark:text-white">{student.attendance}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Tarefas</p>
                      <p className="font-medium text-gray-900 dark:text-white">{student.assignments}%</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Desafios:</span> {student.challenges.join(', ')}
                    </p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                      Plano de Ação
                    </button>
                    <button className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                      Contatar Pais
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ações Pedagógicas</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <PenTool className="w-4 h-4" />
                Criar Atividade
              </button>
              <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <ClipboardList className="w-4 h-4" />
                Lançar Notas
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <UserCheck className="w-4 h-4" />
                Registrar Presença
              </button>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                <MessageSquare className="w-4 h-4" />
                Enviar Comunicado
              </button>
            </div>
          </div>

          {/* Recursos Mais Usados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
              Recursos Populares
            </h3>
            <div className="space-y-3">
              {learningResources.slice(0, 3).map((resource) => (
                <div
                  key={resource.id}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{resource.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {resource.subject} • {resource.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{resource.usage} usos</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              Ver biblioteca completa
            </button>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
              <Bell className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Notificações
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-3 rounded-lg border ${
                    activity.priority === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                    activity.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                    'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === 'assignment' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                        activity.type === 'grade' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        activity.type === 'message' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                        activity.type === 'parent' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                        activity.type === 'behavior' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                      }`}>
                        {activity.type === 'assignment' ? <FileText className="w-4 h-4" /> :
                         activity.type === 'grade' ? <Award className="w-4 h-4" /> :
                         activity.type === 'message' ? <MessageSquare className="w-4 h-4" /> :
                         activity.type === 'parent' ? <Users className="w-4 h-4" /> :
                         activity.type === 'behavior' ? <Heart className="w-4 h-4" /> :
                         <Bell className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{activity.time}</p>
                      </div>
                    </div>
                    {activity.status && (
                      <div>
                        {activity.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* View de Alunos */}
      {selectedView === 'students' && (
        <div className="space-y-6">
          <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Acompanhamento Individual
              </h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Exportar Relatório
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 text-gray-400 border-b">
                    <th className="pb-3">Aluno</th>
                    <th className="pb-3">Turma</th>
                    <th className="pb-3">Média</th>
                    <th className="pb-3">Tendência</th>
                    <th className="pb-3">Presença</th>
                    <th className="pb-3">Tarefas</th>
                    <th className="pb-3">Pontos Fortes</th>
                    <th className="pb-3">Desafios</th>
                    <th className="pb-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {studentProgress.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50 hover:bg-gray-300">
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {student.needsAttention && (
                            <AlertCircle className="w-4 h-4 text-yellow-500" />
                          )}
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </td>
                      <td className="py-4 text-sm">{student.class}</td>
                      <td className="py-4">
                        <span className={`font-bold ${
                          student.currentGrade >= 7 ? 'text-green-600' :
                          student.currentGrade >= 5 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {student.currentGrade.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className={`text-2xl ${
                          student.trend === 'up' ? 'text-green-600' :
                          student.trend === 'down' ? 'text-red-600' : 'text-gray-400'
                        }`}>
                          {student.trend === 'up' ? '↑' : student.trend === 'down' ? '↓' : '→'}
                        </span>
                      </td>
                      <td className="py-4 text-sm">{student.attendance}%</td>
                      <td className="py-4 text-sm">{student.assignments}%</td>
                      <td className="py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {student.strengths.map((strength, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {student.challenges.map((challenge, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              {challenge}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4">
                        <button className="text-primary hover:text-primary-dark text-sm">
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View de Recursos */}
      {selectedView === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-accent-purple" />
                Biblioteca de Recursos Pedagógicos
              </h2>
              
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Buscar recursos..."
                  className="flex-1 px-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-300"
                />
                <select className="px-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-gray-300">
                  <option value="">Todas as disciplinas</option>
                  <option value="math">Matemática</option>
                  <option value="portuguese">Português</option>
                  <option value="science">Ciências</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {learningResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="p-4 border border-gray-200 border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2 rounded-lg ${
                        resource.type === 'video' ? 'bg-red-100 text-red-600' :
                        resource.type === 'document' ? 'bg-primary/20 text-primary' :
                        resource.type === 'interactive' ? 'bg-accent-green/20 text-accent-green' :
                        'bg-accent-purple/20 text-accent-purple'
                      }`}>
                        {resource.type === 'video' ? <Video className="w-5 h-5" /> :
                         resource.type === 'document' ? <FileText className="w-5 h-5" /> :
                         resource.type === 'interactive' ? <Brain className="w-5 h-5" /> :
                         <ClipboardList className="w-5 h-5" />}
                      </div>
                      <span className="text-xs text-gray-500">{resource.usage} usos</span>
                    </div>
                    <h3 className="font-semibold mb-1">{resource.title}</h3>
                    <p className="text-sm text-gray-600 text-gray-400 mb-2">
                      {resource.subject} • {resource.duration}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark text-sm">
                        Usar
                      </button>
                      <button className="px-3 py-1 bg-gray-200 bg-gray-300 rounded hover:bg-gray-300 hover:bg-gray-600 text-sm">
                        Prévia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Criar Novo Recurso</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload de Material
                </button>
                <button className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <PenTool className="w-4 h-4" />
                  Criar Atividade
                </button>
                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <Video className="w-4 h-4" />
                  Gravar Aula
                </button>
              </div>
            </div>

            <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Recursos Recomendados</h3>
              <p className="text-sm text-gray-600 text-gray-400 mb-4">
                Baseado no desempenho dos seus alunos
              </p>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 bg-blue-300/20 rounded-lg">
                  <p className="font-medium text-sm">Exercícios de Reforço - Frações</p>
                  <p className="text-xs text-gray-600 text-gray-400 mt-1">
                    Recomendado para 5 alunos com dificuldade
                  </p>
                </div>
                <div className="p-3 bg-green-50 bg-green-900/20 rounded-lg">
                  <p className="font-medium text-sm">Desafios Avançados - Geometria</p>
                  <p className="text-xs text-gray-600 text-gray-400 mt-1">
                    Para alunos com desempenho acima da média
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View de Comunicação */}
      {selectedView === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary-dark" />
                Central de Comunicação
              </h2>
              
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <button className="px-4 py-2 bg-primary-dark text-white rounded-lg">
                    Mensagens
                  </button>
                  <button className="px-4 py-2 bg-gray-200 bg-gray-300 rounded-lg">
                    Comunicados
                  </button>
                  <button className="px-4 py-2 bg-gray-200 bg-gray-300 rounded-lg">
                    Reuniões
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">Maria Silva (Mãe de Ana Silva)</p>
                        <p className="text-sm text-gray-600 text-gray-400">
                          Dúvida sobre tarefa de matemática
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">Há 2 horas</span>
                    </div>
                    <p className="text-sm mb-3">
                      Olá professor, a Ana está com dificuldade nos exercícios de frações...
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-primary text-white rounded text-sm">
                        Responder
                      </button>
                      <button className="px-3 py-1 bg-gray-200 bg-gray-300 rounded text-sm">
                        Marcar reunião
                      </button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">João Santos (Pai de João Jr.)</p>
                        <p className="text-sm text-gray-600 text-gray-400">
                          Reunião agendada - Desempenho escolar
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">Amanhã, 14:00</span>
                    </div>
                    <p className="text-sm mb-3">
                      Confirmada reunião para discutir o progresso do João Jr...
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-accent-green text-white rounded text-sm">
                        Ver detalhes
                      </button>
                      <button className="px-3 py-1 bg-gray-200 bg-gray-300 rounded text-sm">
                        Reagendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Comunicação Rápida</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Mensagem
                </button>
                <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Bell className="w-4 h-4" />
                  Novo Comunicado
                </button>
                <button className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Agendar Reunião
                </button>
              </div>
            </div>

            <div className="bg-white bg-gray-300 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Estatísticas de Comunicação</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1 text-black">
                    <span>Taxa de Resposta</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-accent-green h-2 rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Engajamento dos Pais</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 text-gray-400">
                    <span className="font-medium">15</span> mensagens esta semana
                  </p>
                  <p className="text-sm text-gray-600 text-gray-400">
                    <span className="font-medium">3</span> reuniões agendadas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de Card de Estatística
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white bg-gray-500 rounded-lg shadow-sm p-3">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-md ${color} bg-opacity-10`}>
          <Icon className={`w-3 h-3 ${color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
        </div>
      </div>
      <p className="text-lg font-bold text-gray-700">
        {value}
      </p>
      <p className="text-xs text-gray-600 text-gray-400">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}

// Componente principal com proteção de rotas
export default function TeacherDashboard() {
  return <TeacherDashboardContent />;
}
