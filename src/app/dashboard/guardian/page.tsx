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

export default function GuardianDashboard() {
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            Portal do Responsável
          </h1>
          <p className="text-gray-600 dark:text-gray-600 mt-2">
            Acompanhe o desenvolvimento dos seus filhos
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-400 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-300"
          >
            <option value="all">Todos os filhos</option>
            {students.map(student => (
              <option key={student.id} value={student.id}>
                {student.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'overview'
                  ? 'bg-primary-dark text-white'
                  : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedView('academic')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'academic'
                  ? 'bg-primary-dark text-white'
                  : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
              }`}
            >
              Acadêmico
            </button>
            <button
              onClick={() => setSelectedView('communication')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'communication'
                  ? 'bg-primary-dark text-white'
                  : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
              }`}
            >
              Comunicação
            </button>
            <button
              onClick={() => setSelectedView('financial')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedView === 'financial'
                  ? 'bg-primary-dark text-white'
                  : 'bg-gray-200 dark:bg-gray-300 text-gray-700 dark:text-gray-700'
              }`}
            >
              Financeiro
            </button>
          </div>
        </div>
      </div>

      {/* Alertas Importantes */}
      {messages.filter(m => !m.isRead && m.priority === 'high').length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Você tem mensagens importantes não lidas
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {messages.filter(m => !m.isRead && m.priority === 'high').length} mensagem(ns) de alta prioridade aguardando resposta
              </p>
            </div>
            <button 
              onClick={() => setSelectedView('communication')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ver Mensagens
            </button>
          </div>
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={Users}
          title="Filhos"
          value={stats.totalStudents}
          subtitle="matriculados"
          color="bg-primary-dark"
        />
        <StatCard
          icon={TrendingUp}
          title="Média Geral"
          value={stats.averageGrade.toFixed(1)}
          subtitle="de 10.0"
          color="bg-primary"
        />
        <StatCard
          icon={Calendar}
          title="Frequência"
          value={`${stats.averageAttendance}%`}
          subtitle="média"
          color="bg-accent-green"
        />
        <StatCard
          icon={FileText}
          title="Tarefas"
          value={stats.pendingTasks}
          subtitle="pendentes"
          color="bg-accent-yellow"
        />
        <StatCard
          icon={Video}
          title="Reuniões"
          value={stats.upcomingMeetings}
          subtitle="agendadas"
          color="bg-accent-purple"
        />
        <StatCard
          icon={MessageSquare}
          title="Mensagens"
          value={stats.unreadMessages}
          subtitle="não lidas"
          color="bg-accent-orange"
        />
      </div>

      {/* Conteúdo baseado na view selecionada */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Desempenho dos Filhos */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-dark" />
                <span className="text-primary-dark">Desempenho dos Filhos</span>
              </h2>
              
              <div className="space-y-4">
                {performances.map((performance) => (
                  <div
                    key={performance.studentId}
                    className="p-4 bg-gray-50 dark:bg-gray-300 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{performance.studentName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-600">
                          Última atualização: {performance.lastUpdate.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-sm rounded-full ${getBehaviorColor(performance.behavior)}`}>
                        {getBehaviorLabel(performance.behavior)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Média</p>
                        <p className="text-xl font-bold flex items-center gap-1">
                          {performance.currentGrade.toFixed(1)}
                          {performance.trend === 'up' && <TrendingUp className="w-4 h-4 text-accent-green" />}
                          {performance.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Frequência</p>
                        <p className="text-xl font-bold">{performance.attendance}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tarefas</p>
                        <p className="text-xl font-bold">
                          {performance.completedTasks}/{performance.completedTasks + performance.pendingTasks}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pendentes</p>
                        <p className="text-xl font-bold text-accent-yellow">{performance.pendingTasks}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="font-medium text-accent-green mb-1">Pontos Fortes:</p>
                        <div className="flex flex-wrap gap-1">
                          {performance.strengths.map((strength, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-accent-green rounded-full text-xs">
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-accent-orange mb-1">Áreas de Melhoria:</p>
                        <div className="flex flex-wrap gap-1">
                          {performance.challenges.map((challenge, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-100 text-accent-orange rounded-full text-xs">
                              {challenge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button className="px-3 py-1 bg-primary-dark text-white rounded text-sm hover:bg-indigo-700">
                        Ver Detalhes
                      </button>
                      <button className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500">
                        Histórico
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximos Eventos */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                <span className="text-primary-dark">Próximos Eventos</span>
              </h2>
              
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className={`p-4 rounded-lg border ${
                      event.isImportant
                        ? 'border-primary/30 bg-primary/5 dark:border-primary/50 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          event.type === 'exam' ? 'bg-red-100 text-red-600' :
                          event.type === 'meeting' ? 'bg-primary/20 text-primary' :
                          event.type === 'assignment' ? 'bg-yellow-100 text-yellow-600' :
                          event.type === 'event' ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {event.type === 'exam' ? <FileText className="w-4 h-4" /> :
                           event.type === 'meeting' ? <Video className="w-4 h-4" /> :
                           event.type === 'assignment' ? <BookOpen className="w-4 h-4" /> :
                           <Calendar className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-primary-dark">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-600 mt-1">
                            {event.description}
                          </p>
                          {event.studentName && (
                            <p className="text-xs text-gray-500 mt-1">
                              {event.studentName}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {event.date.toLocaleDateString('pt-BR')}
                        </p>
                        {event.time && (
                          <p className="text-xs text-gray-500">{event.time}</p>
                        )}
                      </div>
                    </div>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-dark">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Enviar Mensagem
                </button>
                <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <Video className="w-4 h-4" />
                  Agendar Reunião
                </button>
                <button className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Boletim
                </button>
                <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contatar Escola
                </button>
              </div>
            </div>

            {/* Relatórios Comportamentais Recentes */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-accent-orange" />
                <span className="text-primary-dark">Comportamento</span>
              </h3>
              <div className="space-y-3">
                {behaviorReports.slice(0, 3).map((report) => (
                  <div
                    key={report.id}
                    className={`p-3 rounded-lg ${
                      report.type === 'positive' ? 'bg-green-50 dark:bg-green-900/20' :
                      report.type === 'negative' ? 'bg-red-50 dark:bg-red-900/20' :
                      'bg-gray-50 dark:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-medium text-sm">{report.title}</p>
                      {report.type === 'positive' ? (
                        <Star className="w-4 h-4 text-accent-green" />
                      ) : report.type === 'negative' ? (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      ) : (
                        <Bell className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-600">
                      {report.studentName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {report.date.toLocaleDateString('pt-BR')} - {report.reportedBy}
                    </p>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 text-sm text-primary-dark hover:text-indigo-800">
                Ver todos os relatórios
              </button>
            </div>

            {/* Informações de Contato */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-dark">Contatos Importantes</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Secretaria</p>
                    <p className="text-xs text-gray-500">(11) 1234-5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Coordenação</p>
                    <p className="text-xs text-gray-500">coordenacao@escola.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">WhatsApp</p>
                    <p className="text-xs text-gray-500">(11) 98765-4321</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Acadêmica */}
      {selectedView === 'academic' && (
        <div className="space-y-6">
          {performances.map((performance) => (
            <div key={performance.studentId} className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
                <span className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-primary" />
                  <span className="text-primary-dark">Desempenho Acadêmico - {performance.studentName}</span>
                </span>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Baixar Relatório
                </button>
              </h2>
              
              {/* Gráficos e estatísticas detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="relative inline-flex">
                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <p className="text-3xl font-bold">{performance.currentGrade.toFixed(1)}</p>
                        <p className="text-sm text-gray-500">Média Geral</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Frequência</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-accent-green h-2 rounded-full"
                          style={{ width: `${performance.attendance}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{performance.attendance}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tarefas Completas</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${(performance.completedTasks / (performance.completedTasks + performance.pendingTasks)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((performance.completedTasks / (performance.completedTasks + performance.pendingTasks)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2">Evolução por Disciplina</p>
                  <div className="h-32 bg-gray-100 dark:bg-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                    Gráfico de barras (implementar)
                  </div>
                </div>
              </div>
              
              {/* Detalhes por matéria */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-primary-dark">Desempenho por Disciplina</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês'].map((subject) => (
                    <div key={subject} className="p-4 bg-gray-50 dark:bg-gray-300 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{subject}</h4>
                        <span className="text-lg font-bold text-primary">8.5</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Última prova:</span>
                          <span>9.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Trabalhos:</span>
                          <span>8.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Participação:</span>
                          <span>8.5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View de Comunicação */}
      {selectedView === 'communication' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
                <span className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-primary-dark" />
                  <span className="text-primary-dark">Mensagens</span>
                </span>
                <button className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Nova Mensagem
                </button>
              </h2>
              
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border ${
                      !message.isRead
                        ? 'border-primary-dark/30 bg-primary-dark/5 dark:border-primary-dark/50 dark:bg-primary-dark/10'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{message.subject}</h3>
                          {message.priority === 'high' && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              Urgente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-600">
                          De: {message.from} • Sobre: {message.studentName}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {message.date.toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-700 mb-3">
                      {message.preview}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-primary-dark text-white rounded text-sm hover:bg-indigo-700">
                        Ler Completa
                      </button>
                      <button className="px-3 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-500">
                        Responder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Canais de Comunicação */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-dark">Canais de Comunicação</h3>
              <div className="space-y-3">
                <button className="w-full p-3 bg-gray-50 dark:bg-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium">Videochamada</p>
                        <p className="text-xs text-gray-500">Agendar reunião online</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-50 dark:bg-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-accent-green" />
                      <div>
                        <p className="font-medium">Telefone</p>
                        <p className="text-xs text-gray-500">Ligar para a escola</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                <button className="w-full p-3 bg-gray-50 dark:bg-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-accent-purple" />
                      <div>
                        <p className="font-medium">E-mail</p>
                        <p className="text-xs text-gray-500">Enviar mensagem</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              </div>
            </div>

            {/* Histórico de Comunicações */}
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 text-primary-dark">Histórico Recente</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Reunião realizada</p>
                    <p className="text-xs text-gray-500">Prof. Ana - 15/01/2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Mensagem enviada</p>
                    <p className="text-xs text-gray-500">Coordenação - 10/01/2025</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium">Ligação realizada</p>
                    <p className="text-xs text-gray-500">Secretaria - 05/01/2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Financeira */}
      {selectedView === 'financial' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center justify-between">
              <span className="flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-accent-green" />
                <span className="text-primary-dark">Informações Financeiras</span>
              </span>
              <button className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Baixar Extrato
              </button>
            </h2>
            
            <div className="space-y-4">
              {financialInfo.map((info) => (
                <div
                  key={info.studentId}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{info.studentName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-600">
                        Mensalidade: R$ {info.monthlyFee.toFixed(2)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm rounded-full ${getFinancialStatusColor(info.status)}`}>
                      {info.status === 'paid' ? 'Pago' :
                       info.status === 'pending' ? 'Pendente' : 'Vencido'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Vencimento:</span>
                      <span>{info.dueDate.toLocaleDateString('pt-BR')}</span>
                    </div>
                    
                    {info.additionalCharges && info.additionalCharges.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1">Cobranças Adicionais:</p>
                        {info.additionalCharges.map((charge, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-500">{charge.description}:</span>
                            <span>R$ {charge.amount.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-2 border-t flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>
                        R$ {(info.monthlyFee + (info.additionalCharges?.reduce((sum, charge) => sum + charge.amount, 0) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {info.status !== 'paid' && (
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-accent-green text-white rounded hover:bg-green-700">
                        Pagar Agora
                      </button>
                      <button className="px-4 py-2 bg-gray-200 dark:bg-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-200">
                        Ver Boleto
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Pagamentos */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary-dark">Histórico de Pagamentos</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 dark:text-gray-600 border-b">
                    <th className="pb-2">Mês</th>
                    <th className="pb-2">Aluno</th>
                    <th className="pb-2">Valor</th>
                    <th className="pb-2">Data Pagamento</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: 'Janeiro/2025', student: 'João Silva', value: 850.00, date: '05/01/2025', status: 'paid' },
                    { month: 'Janeiro/2025', student: 'Maria Silva', value: 970.00, date: '05/01/2025', status: 'paid' },
                    { month: 'Dezembro/2024', student: 'João Silva', value: 850.00, date: '05/12/2024', status: 'paid' },
                    { month: 'Dezembro/2024', student: 'Maria Silva', value: 850.00, date: '05/12/2024', status: 'paid' },
                  ].map((payment, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 dark:hover:bg-gray-300">
                      <td className="py-3 text-sm">{payment.month}</td>
                      <td className="py-3 text-sm">{payment.student}</td>
                      <td className="py-3 text-sm">R$ {payment.value.toFixed(2)}</td>
                      <td className="py-3 text-sm">{payment.date}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 text-xs bg-green-100 text-accent-green rounded-full">
                          Pago
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  subtitle: string;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
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