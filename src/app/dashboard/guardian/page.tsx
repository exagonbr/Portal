'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Bell,
  MessageSquare,
  FileText,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle,
  Eye,
  Heart,
  Shield,
  Phone,
  Mail,
  Video,
  ChevronRight,
  Download,
  Star,
  Target,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_COLORS } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';

interface Student {
  id: string;
  name: string;
  class: string;
  age: number;
  photo?: string;
}

interface GuardianStats {
  totalStudents: number;
  averageGrade: number;
  averageAttendance: number;
  pendingTasks: number;
  upcomingMeetings: number;
  unreadMessages: number;
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  currentGrade: number;
  previousGrade: number;
  trend: 'up' | 'down' | 'stable';
  attendance: number;
  behavior: 'excellent' | 'good' | 'regular' | 'needs-attention';
  pendingTasks: number;
  completedTasks: number;
  strengths: string[];
  challenges: string[];
  lastUpdate: Date;
}

interface AcademicEvent {
  id: string;
  type: 'exam' | 'assignment' | 'meeting' | 'event' | 'holiday';
  title: string;
  description: string;
  date: Date;
  time?: string;
  studentId?: string;
  studentName?: string;
  location?: string;
  isImportant: boolean;
}

interface TeacherMessage {
  id: string;
  from: string;
  subject: string;
  preview: string;
  date: Date;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  studentId: string;
  studentName: string;
}

interface BehaviorReport {
  id: string;
  studentId: string;
  studentName: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  date: Date;
  reportedBy: string;
}

interface FinancialInfo {
  studentId: string;
  studentName: string;
  monthlyFee: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: Date;
  additionalCharges?: {
    description: string;
    amount: number;
  }[];
}

export default function GuardianDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [stats, setStats] = useState<GuardianStats>({
    totalStudents: 0,
    averageGrade: 0,
    averageAttendance: 0,
    pendingTasks: 0,
    upcomingMeetings: 0,
    unreadMessages: 0
  });
  const [performances, setPerformances] = useState<StudentPerformance[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [behaviorReports, setBehaviorReports] = useState<BehaviorReport[]>([]);
  const [financialInfo, setFinancialInfo] = useState<FinancialInfo[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'academic' | 'communication' | 'financial'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [selectedStudent]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados dos filhos
      const mockStudents: Student[] = [
        {
          id: '1',
          name: 'João Silva',
          class: '5º Ano A',
          age: 11
        },
        {
          id: '2',
          name: 'Maria Silva',
          class: '3º Ano B',
          age: 9
        }
      ];
      setStudents(mockStudents);

      // Estatísticas gerais
      setStats({
        totalStudents: 2,
        averageGrade: 8.2,
        averageAttendance: 94.5,
        pendingTasks: 5,
        upcomingMeetings: 2,
        unreadMessages: 3
      });

      // Desempenho dos alunos
      setPerformances([
        {
          studentId: '1',
          studentName: 'João Silva',
          currentGrade: 8.5,
          previousGrade: 8.2,
          trend: 'up',
          attendance: 95,
          behavior: 'good',
          pendingTasks: 3,
          completedTasks: 24,
          strengths: ['Matemática', 'Ciências'],
          challenges: ['Redação'],
          lastUpdate: new Date()
        },
        {
          studentId: '2',
          studentName: 'Maria Silva',
          currentGrade: 7.8,
          previousGrade: 8.0,
          trend: 'down',
          attendance: 94,
          behavior: 'excellent',
          pendingTasks: 2,
          completedTasks: 28,
          strengths: ['Português', 'Artes'],
          challenges: ['Matemática'],
          lastUpdate: new Date()
        }
      ]);

      // Eventos acadêmicos
      setEvents([
        {
          id: '1',
          type: 'meeting',
          title: 'Reunião de Pais - 5º Ano',
          description: 'Discussão sobre o progresso do bimestre',
          date: new Date(Date.now() + 86400000 * 3),
          time: '19:00',
          studentId: '1',
          studentName: 'João Silva',
          location: 'Sala 201',
          isImportant: true
        },
        {
          id: '2',
          type: 'exam',
          title: 'Prova de Matemática',
          description: 'Avaliação mensal',
          date: new Date(Date.now() + 86400000 * 5),
          time: '08:00',
          studentId: '1',
          studentName: 'João Silva',
          isImportant: true
        },
        {
          id: '3',
          type: 'event',
          title: 'Feira de Ciências',
          description: 'Apresentação dos projetos',
          date: new Date(Date.now() + 86400000 * 10),
          time: '14:00',
          location: 'Quadra Esportiva',
          isImportant: false
        }
      ]);

      // Mensagens dos professores
      setMessages([
        {
          id: '1',
          from: 'Prof. Ana Silva',
          subject: 'Desempenho em Matemática',
          preview: 'Gostaria de conversar sobre o progresso do João...',
          date: new Date(),
          isRead: false,
          priority: 'high',
          studentId: '1',
          studentName: 'João Silva'
        },
        {
          id: '2',
          from: 'Prof. Carlos Santos',
          subject: 'Participação exemplar',
          preview: 'Maria tem se destacado nas aulas de Português...',
          date: new Date(Date.now() - 86400000),
          isRead: false,
          priority: 'medium',
          studentId: '2',
          studentName: 'Maria Silva'
        },
        {
          id: '3',
          from: 'Coordenação',
          subject: 'Calendário de Provas',
          preview: 'Segue o calendário atualizado das avaliações...',
          date: new Date(Date.now() - 86400000 * 2),
          isRead: true,
          priority: 'low',
          studentId: '1',
          studentName: 'João Silva'
        }
      ]);

      // Relatórios comportamentais
      setBehaviorReports([
        {
          id: '1',
          studentId: '2',
          studentName: 'Maria Silva',
          type: 'positive',
          title: 'Liderança em trabalho em grupo',
          description: 'Maria demonstrou excelente liderança no projeto de ciências',
          date: new Date(Date.now() - 86400000),
          reportedBy: 'Prof. Ana Silva'
        },
        {
          id: '2',
          studentId: '1',
          studentName: 'João Silva',
          type: 'neutral',
          title: 'Atenção nas aulas',
          description: 'João tem demonstrado distração em algumas aulas',
          date: new Date(Date.now() - 86400000 * 3),
          reportedBy: 'Prof. Carlos Santos'
        }
      ]);

      // Informações financeiras
      setFinancialInfo([
        {
          studentId: '1',
          studentName: 'João Silva',
          monthlyFee: 850.00,
          status: 'paid',
          dueDate: new Date(Date.now() + 86400000 * 5)
        },
        {
          studentId: '2',
          studentName: 'Maria Silva',
          monthlyFee: 850.00,
          status: 'pending',
          dueDate: new Date(Date.now() + 86400000 * 5),
          additionalCharges: [
            {
              description: 'Material didático',
              amount: 120.00
            }
          ]
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBehaviorColor = (behavior: StudentPerformance['behavior']) => {
    switch (behavior) {
      case 'excellent': return 'text-accent-green bg-green-100';
      case 'good': return 'text-primary bg-primary/10';
      case 'regular': return 'text-accent-yellow bg-yellow-100';
      case 'needs-attention': return 'text-red-600 bg-red-100';
    }
  };

  const getBehaviorLabel = (behavior: StudentPerformance['behavior']) => {
    switch (behavior) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'regular': return 'Regular';
      case 'needs-attention': return 'Requer Atenção';
    }
  };

  const getFinancialStatusColor = (status: FinancialInfo['status']) => {
    switch (status) {
      case 'paid': return 'text-accent-green bg-green-100';
      case 'pending': return 'text-accent-yellow bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
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
          <ProtectedRoute requiredRole={[UserRole.GUARDIAN, UserRole.SYSTEM_ADMIN]}>
      <DashboardPageLayout
        title="Painel do Responsável"
        subtitle="Acompanhe o desenvolvimento dos seus dependentes"
      >
        <div className="space-y-6">
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
              <div className="text-sm font-medium text-gray-500 mb-1">Próxima Reunião</div>
              <div className="text-2xl font-bold text-gray-600">15/05</div>
              <div className="text-xs text-blue-600 mt-2">Com Coordenação</div>
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

          {/* Comunicados */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Comunicados Recentes</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-700">Reunião de Pais</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Importante</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Reunião de pais e mestres agendada para o próximo dia 15/05 às 19h.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Coordenação Pedagógica</span>
                  <span>Há 2 dias</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-700">Festa Junina</h3>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Evento</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Confirmação de presença na Festa Junina da escola, dia 20/06.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Direção</span>
                  <span>Há 5 dias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">event</span>
                <span className="text-sm font-medium text-gray-700">Agendar Reunião</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">message</span>
                <span className="text-sm font-medium text-gray-700">Falar com Professor</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">description</span>
                <span className="text-sm font-medium text-gray-700">Ver Boletim</span>
              </button>
            </div>
          </div>
        </div>
      </DashboardPageLayout>
    </ProtectedRoute>
  );
}

// Componente de Card de Estatística
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800-dark dark:text-gray-800">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
    </div>
  );
}