'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  School,
  Users, 
  GraduationCap,
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Bell,
  Settings,
  UserPlus,
  BookOpen,
  Clock,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_COLORS } from '@/types/roles';

interface InstitutionStats {
  totalSchools: number;
  activeSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  averagePerformance: number;
  attendanceRate: number;
  graduationRate: number;
  budget: number;
  expenses: number;
}

interface SchoolOverview {
  id: string;
  name: string;
  type: string;
  students: number;
  teachers: number;
  classes: number;
  performance: number;
  status: 'excellent' | 'good' | 'attention' | 'critical';
}

interface PerformanceMetric {
  month: string;
  students: number;
  performance: number;
  attendance: number;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  author: string;
  targetAudience: string[];
}

export default function InstitutionManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<InstitutionStats>({
    totalSchools: 0,
    activeSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    averagePerformance: 0,
    attendanceRate: 0,
    graduationRate: 0,
    budget: 0,
    expenses: 0
  });
  const [schools, setSchools] = useState<SchoolOverview[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      setStats({
        totalSchools: 12,
        activeSchools: 11,
        totalStudents: 4567,
        totalTeachers: 234,
        totalClasses: 156,
        averagePerformance: 78.5,
        attendanceRate: 92.3,
        graduationRate: 87.2,
        budget: 2500000,
        expenses: 1850000
      });

      setSchools([
        {
          id: '1',
          name: 'Escola Central Alpha',
          type: 'Ensino Médio',
          students: 1234,
          teachers: 56,
          classes: 42,
          performance: 85.2,
          status: 'excellent'
        },
        {
          id: '2',
          name: 'Colégio Beta',
          type: 'Fundamental II',
          students: 890,
          teachers: 45,
          classes: 35,
          performance: 76.8,
          status: 'good'
        },
        {
          id: '3',
          name: 'Instituto Gamma',
          type: 'Técnico',
          students: 567,
          teachers: 34,
          classes: 28,
          performance: 68.5,
          status: 'attention'
        },
        {
          id: '4',
          name: 'Escola Delta',
          type: 'Fundamental I',
          students: 456,
          teachers: 28,
          classes: 24,
          performance: 82.1,
          status: 'good'
        }
      ]);

      setPerformanceData([
        { month: 'Jan', students: 4200, performance: 75, attendance: 90 },
        { month: 'Fev', students: 4350, performance: 76, attendance: 91 },
        { month: 'Mar', students: 4400, performance: 77, attendance: 92 },
        { month: 'Abr', students: 4450, performance: 78, attendance: 92 },
        { month: 'Mai', students: 4500, performance: 78.5, attendance: 92.3 }
      ]);

      setAnnouncements([
        {
          id: '1',
          title: 'Reunião de Diretores',
          content: 'Reunião mensal de alinhamento estratégico',
          priority: 'high',
          date: new Date(Date.now() + 86400000),
          author: 'Sistema',
          targetAudience: ['directors', 'coordinators']
        },
        {
          id: '2',
          title: 'Novo Protocolo de Segurança',
          content: 'Implementação de novas medidas de segurança nas escolas',
          priority: 'medium',
          date: new Date(),
          author: 'Coordenação Geral',
          targetAudience: ['all']
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: SchoolOverview['status']) => {
    switch (status) {
      case 'excellent': return 'text-accent-green bg-green-100';
      case 'good': return 'text-primary bg-primary/10';
      case 'attention': return 'text-accent-yellow bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusLabel = (status: SchoolOverview['status']) => {
    switch (status) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'attention': return 'Atenção';
      case 'critical': return 'Crítico';
    }
  };

  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-accent-yellow/10 text-accent-yellow';
      case 'low': return 'bg-primary/10 text-primary-dark';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
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
              <Building2 className="w-8 h-8 text-primary-dark" />
              Painel de Gestão Institucional
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerenciamento completo da rede educacional
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-dark dark:bg-gray-300"
            >
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
              <option value="quarter">Último Trimestre</option>
              <option value="year">Último Ano</option>
            </select>
            <button className="px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary transition-colors flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={School}
          title="Escolas Ativas"
          value={`${stats.activeSchools}/${stats.totalSchools}`}
          subtitle="91.7% operacionais"
          trend="+2"
          trendUp={true}
          color="bg-primary-dark"
        />
        <StatCard
          icon={Users}
          title="Total de Alunos"
          value={stats.totalStudents.toLocaleString('pt-BR')}
          subtitle={`${stats.totalTeachers} professores`}
          trend="+5.2%"
          trendUp={true}
          color="bg-primary"
        />
        <StatCard
          icon={TrendingUp}
          title="Desempenho Médio"
          value={`${stats.averagePerformance}%`}
          subtitle="Meta: 80%"
          trend="+2.3%"
          trendUp={true}
          color="bg-accent-green"
        />
        <StatCard
          icon={DollarSign}
          title="Orçamento"
          value={`${((stats.expenses / stats.budget) * 100).toFixed(1)}%`}
          subtitle="R$ 650k disponível"
          trend="74%"
          trendUp={false}
          color="bg-accent-yellow"
        />
      </div>

      {/* Indicadores de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <PerformanceIndicator
          title="Taxa de Presença"
          value={stats.attendanceRate}
          target={95}
          icon={UserPlus}
          color="primary"
        />
        <PerformanceIndicator
          title="Taxa de Aprovação"
          value={stats.graduationRate}
          target={90}
          icon={GraduationCap}
          color="accent-green"
        />
        <PerformanceIndicator
          title="Satisfação Geral"
          value={85.6}
          target={90}
          icon={Award}
          color="accent-purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escolas */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <School className="w-5 h-5 mr-2 text-primary-dark" />
                Escolas da Rede
              </h2>
              <button className="text-sm text-primary-dark hover:text-primary">
                Ver todas
              </button>
            </div>
            
            <div className="space-y-4">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="p-4 bg-gray-50 dark:bg-gray-300 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{school.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(school.status)}`}>
                          {getStatusLabel(school.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <p className="font-medium">{school.students}</p>
                          <p className="text-xs">Alunos</p>
                        </div>
                        <div>
                          <p className="font-medium">{school.teachers}</p>
                          <p className="text-xs">Professores</p>
                        </div>
                        <div>
                          <p className="font-medium">{school.classes}</p>
                          <p className="text-xs">Turmas</p>
                        </div>
                        <div>
                          <p className="font-medium">{school.performance}%</p>
                          <p className="text-xs">Desempenho</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-sm bg-primary-dark/10 text-primary-dark rounded-lg hover:bg-primary-dark/20">
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Evolução de Matrículas</h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                Gráfico de linha - Matrículas por mês
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição por Nível</h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                Gráfico de pizza - Alunos por nível de ensino
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary-dark text-white rounded-lg hover:bg-primary transition-colors flex items-center justify-center gap-2">
                <School className="w-4 h-4" />
                Nova Escola
              </button>
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Gerenciar Usuários
              </button>
              <button className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Relatórios
              </button>
              <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                Comunicados
              </button>
            </div>
          </div>

          {/* Comunicados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-accent-orange" />
              Comunicados Recentes
            </h3>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-3 bg-gray-50 dark:bg-gray-300 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{announcement.title}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority === 'high' ? 'Alta' : 
                       announcement.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {announcement.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{announcement.author}</span>
                    <span>{announcement.date.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Metas e Objetivos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-accent-green" />
              Metas do Período
            </h3>
            <div className="space-y-3">
              <MetricProgress
                label="Taxa de Retenção"
                current={92}
                target={95}
                unit="%"
              />
              <MetricProgress
                label="Novas Matrículas"
                current={234}
                target={300}
                unit=""
              />
              <MetricProgress
                label="Satisfação dos Pais"
                current={88}
                target={90}
                unit="%"
              />
              <MetricProgress
                label="Formação de Professores"
                current={45}
                target={60}
                unit="h"
              />
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
  trend: string;
  trendUp: boolean;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, trend, trendUp, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <span className={`text-sm font-medium flex items-center gap-1 ${
          trendUp ? 'text-accent-green' : 'text-gray-600'
        }`}>
          {trendUp && <TrendingUp className="w-4 h-4" />}
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

// Componente de Indicador de Performance
interface PerformanceIndicatorProps {
  title: string;
  value: number;
  target: number;
  icon: React.ElementType;
  color: string;
}

function PerformanceIndicator({ title, value, target, icon: Icon, color }: PerformanceIndicatorProps) {
  const percentage = (value / target) * 100;
  const isAboveTarget = value >= target;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
        <Icon className={`w-5 h-5 ${color === 'primary' ? 'text-primary' : color === 'accent-green' ? 'text-accent-green' : 'text-accent-purple'}`} />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}%</p>
        <p className="text-sm text-gray-500 mb-1">/ {target}%</p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-300 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${color === 'primary' ? 'bg-primary' : color === 'accent-green' ? 'bg-accent-green' : 'bg-accent-purple'} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className={isAboveTarget ? 'text-accent-green' : 'text-accent-yellow'}>
          {isAboveTarget ? 'Meta atingida' : `Faltam ${(target - value).toFixed(1)}%`}
        </span>
        {isAboveTarget && <CheckCircle className="w-4 h-4 text-accent-green" />}
      </div>
    </div>
  );
}

// Componente de Progresso de Métrica
interface MetricProgressProps {
  label: string;
  current: number;
  target: number;
  unit: string;
}

function MetricProgress({ label, current, target, unit }: MetricProgressProps) {
  const percentage = (current / target) * 100;
  const isComplete = current >= target;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-300 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isComplete ? 'bg-accent-green' : percentage >= 70 ? 'bg-accent-yellow' : 'bg-red-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}