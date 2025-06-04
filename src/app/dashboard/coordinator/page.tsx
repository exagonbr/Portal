'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
  Activity,
  Briefcase,
  Star,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_COLORS } from '@/types/roles';
import { apiClient, ApiClientError } from '@/services/apiClient'; // Added

interface CoordinatorStats {
  totalCycles: number;
  activeCycles: number;
  totalTeachers: number;
  totalStudents: number;
  averagePerformance: number;
  curriculumCompletion: number;
  teacherSatisfaction: number;
  studentProgress: number;
}

interface EducationCycleOverview {
  id: string;
  name: string;
  level: string;
  students: number;
  teachers: number;
  performance: number;
  completion: number;
  status: 'on-track' | 'delayed' | 'ahead' | 'at-risk';
}

interface TeacherPerformance {
  id: string;
  name: string;
  subject: string;
  classes: number;
  students: number;
  averageGrade: number;
  satisfaction: number;
  attendance: number;
}

interface CurriculumItem {
  id: string;
  subject: string;
  cycle: string;
  completion: number;
  lastUpdate: Date;
  responsible: string;
  status: 'approved' | 'pending' | 'revision';
}

interface AcademicAlert {
  id: string;
  type: 'performance' | 'attendance' | 'curriculum' | 'teacher';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  actionRequired: boolean;
}

export default function CoordinatorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CoordinatorStats>({
    totalCycles: 0,
    activeCycles: 0,
    totalTeachers: 0,
    totalStudents: 0,
    averagePerformance: 0,
    curriculumCompletion: 0,
    teacherSatisfaction: 0,
    studentProgress: 0
  });
  const [cycles, setCycles] = useState<EducationCycleOverview[]>([]);
  const [teachers, setTeachers] = useState<TeacherPerformance[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [alerts, setAlerts] = useState<AcademicAlert[]>([]);
  const [selectedCycle, setSelectedCycle] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    if (user?.id) {
      loadDashboardData(user.id, selectedCycle, selectedDepartment);
    } else if (!user && !loading) {
        console.warn("Usuário não autenticado para carregar dashboard do coordenador.");
        setLoading(false);
    }
  }, [user, loading, selectedCycle, selectedDepartment]); // Added user and loading

  interface CoordinatorDashboardData {
    stats: CoordinatorStats;
    cycles: EducationCycleOverview[];
    teachers: TeacherPerformance[];
    curriculum: CurriculumItem[];
    alerts: AcademicAlert[];
  }

  const loadDashboardData = async (userId: string | number, cycleFilter: string, departmentFilter: string) => {
    try {
      setLoading(true);
      
      // TODO: Ajustar o endpoint da API e parâmetros de filtro.
      const params: Record<string, string> = {};
      if (cycleFilter !== 'all') params.cycle = cycleFilter;
      if (departmentFilter !== 'all') params.department = departmentFilter;

      const response = await apiClient.get<CoordinatorDashboardData>(
        `/api/coordinators/${userId}/dashboard`,
        params
      );

      if (response.success && response.data) {
        const data = response.data;
        setStats(data.stats || { totalCycles: 0, activeCycles: 0, totalTeachers: 0, totalStudents: 0, averagePerformance: 0, curriculumCompletion: 0, teacherSatisfaction: 0, studentProgress: 0 });
        setCycles(data.cycles || []);
        setTeachers(data.teachers || []);
        setCurriculum(data.curriculum || []);
        setAlerts(data.alerts || []);
      } else {
        console.error('Falha ao buscar dados do dashboard do coordenador:', response.message);
        // Adicionar estado de erro para UI, se necessário
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard do coordenador:', error);
      if (error instanceof ApiClientError) {
        // Tratar erro da API
      }
      // Adicionar estado de erro para UI
    } finally {
      setLoading(false);
    }
  };
  
  // Adicionado para cobrir o caso de user ainda não carregado
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Autenticando...</p>
      </div>
    );
  }

  const getStatusColor = (status: EducationCycleOverview['status']) => {
    switch (status) {
      case 'on-track': return 'text-accent-green bg-green-100';
      case 'ahead': return 'text-primary bg-primary/10';
      case 'delayed': return 'text-accent-yellow bg-yellow-100';
      case 'at-risk': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusLabel = (status: EducationCycleOverview['status']) => {
    switch (status) {
      case 'on-track': return 'No prazo';
      case 'ahead': return 'Adiantado';
      case 'delayed': return 'Atrasado';
      case 'at-risk': return 'Em risco';
    }
  };

  const getCurriculumStatusColor = (status: CurriculumItem['status']) => {
    switch (status) {
      case 'approved': return 'text-accent-green bg-green-100';
      case 'pending': return 'text-accent-yellow bg-yellow-100';
      case 'revision': return 'text-accent-orange bg-orange-100';
    }
  };

  const getSeverityIcon = (severity: AcademicAlert['severity']) => {
    switch (severity) {
      case 'high': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium': return <AlertCircle className="w-5 h-5 text-accent-yellow" />;
      case 'low': return <AlertCircle className="w-5 h-5 text-primary" />;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary" />
              Coordenação Acadêmica
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Monitoramento e gestão pedagógica
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-300"
            >
              <option value="all">Todos os Ciclos</option>
              <option value="fundamental1">Fundamental I</option>
              <option value="fundamental2">Fundamental II</option>
              <option value="medio">Ensino Médio</option>
            </select>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Alertas Acadêmicos */}
      {alerts.filter(a => a.actionRequired).length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.filter(a => a.actionRequired).map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.severity === 'high' ? 'bg-red-50 border-red-200' :
                alert.severity === 'medium' ? 'bg-accent-yellow/10 border-accent-yellow/20' :
                'bg-primary/10 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                </div>
                <button className="text-sm text-primary hover:text-primary-dark">
                  Tomar ação
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BookOpen}
          title="Ciclos Ativos"
          value={`${stats.activeCycles}/${stats.totalCycles}`}
          subtitle="83% em andamento"
          color="bg-primary"
        />
        <StatCard
          icon={Users}
          title="Professores"
          value={stats.totalTeachers}
          subtitle={`${stats.totalStudents} alunos`}
          color="bg-accent-green"
        />
        <StatCard
          icon={TrendingUp}
          title="Desempenho Médio"
          value={`${stats.averagePerformance}%`}
          subtitle="Meta: 80%"
          color="bg-accent-purple"
        />
        <StatCard
          icon={Target}
          title="Currículo"
          value={`${stats.curriculumCompletion}%`}
          subtitle="Completo"
          color="bg-accent-yellow"
        />
      </div>

      {/* Indicadores de Qualidade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <QualityIndicator
          title="Progresso dos Alunos"
          value={stats.studentProgress}
          icon={Activity}
          description="Taxa de aprovação e evolução"
        />
        <QualityIndicator
          title="Satisfação Docente"
          value={stats.teacherSatisfaction}
          icon={Star}
          description="Pesquisa de clima organizacional"
        />
        <QualityIndicator
          title="Execução Curricular"
          value={stats.curriculumCompletion}
          icon={CheckCircle}
          description="Conteúdo programático cumprido"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ciclos Educacionais */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" />
                Ciclos Educacionais
              </h2>
              <button className="text-sm text-primary hover:text-primary-dark">
                Gerenciar ciclos
              </button>
            </div>
            
            <div className="space-y-4">
              {cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className="p-4 bg-gray-50 dark:bg-gray-300 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{cycle.name}</h3>
                      <p className="text-sm text-gray-500">{cycle.level}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(cycle.status)}`}>
                      {getStatusLabel(cycle.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Alunos</p>
                      <p className="font-medium">{cycle.students}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Professores</p>
                      <p className="font-medium">{cycle.teachers}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Desempenho</p>
                      <p className="font-medium">{cycle.performance}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conclusão</p>
                      <p className="font-medium">{cycle.completion}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${cycle.completion}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desempenho dos Professores */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-accent-green" />
                Desempenho Docente
              </h2>
              <button className="text-sm text-primary hover:text-primary-dark">
                Ver todos
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 dark:text-gray-400 border-b">
                    <th className="pb-2">Professor</th>
                    <th className="pb-2">Disciplina</th>
                    <th className="pb-2">Turmas</th>
                    <th className="pb-2">Média</th>
                    <th className="pb-2">Satisfação</th>
                    <th className="pb-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-300">
                      <td className="py-3">
                        <p className="font-medium">{teacher.name}</p>
                        <p className="text-xs text-gray-500">{teacher.students} alunos</p>
                      </td>
                      <td className="py-3 text-sm">{teacher.subject}</td>
                      <td className="py-3 text-sm">{teacher.classes}</td>
                      <td className="py-3">
                        <span className={`font-medium ${
                          teacher.averageGrade >= 8 ? 'text-accent-green' :
                          teacher.averageGrade >= 6 ? 'text-accent-yellow' : 'text-red-600'
                        }`}>
                          {teacher.averageGrade.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                teacher.satisfaction >= 90 ? 'bg-accent-green' :
                                teacher.satisfaction >= 70 ? 'bg-accent-yellow' : 'bg-red-500'
                              }`}
                              style={{ width: `${teacher.satisfaction}%` }}
                            />
                          </div>
                          <span className="text-xs">{teacher.satisfaction}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <button className="text-primary hover:text-primary-dark text-sm">
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Novo Ciclo
              </button>
              <button className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Atualizar Currículo
              </button>
              <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                Avaliar Professores
              </button>
              <button className="w-full px-4 py-2 bg-accent-yellow text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Relatórios
              </button>
            </div>
          </div>

          {/* Status do Currículo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-accent-purple" />
              Status Curricular
            </h3>
            <div className="space-y-3">
              {curriculum.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 dark:bg-gray-300 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{item.subject}</p>
                      <p className="text-xs text-gray-500">{item.cycle}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCurriculumStatusColor(item.status)}`}>
                      {item.status === 'approved' ? 'Aprovado' :
                       item.status === 'pending' ? 'Pendente' : 'Revisão'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{item.responsible}</span>
                    <span>{item.completion}% completo</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                    <div
                      className="bg-accent-purple h-1 rounded-full"
                      style={{ width: `${item.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Métricas de Qualidade */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-accent-yellow" />
              Indicadores de Qualidade
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taxa de Aprovação</span>
                  <span className="font-medium">87%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-accent-green h-2 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Evasão Escolar</span>
                  <span className="font-medium">3.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '3.2%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Participação em Projetos</span>
                  <span className="font-medium">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

// Componente de Indicador de Qualidade
interface QualityIndicatorProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

function QualityIndicator({ title, value, icon: Icon, description }: QualityIndicatorProps) {
  const getColor = () => {
    if (value >= 85) return 'text-accent-green';
    if (value >= 70) return 'text-accent-yellow';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
        <span className={`text-3xl font-bold ${getColor()}`}>
          {value}%
        </span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}