'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  School,
  BookOpen,
  TrendingUp,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Bell,
  Settings,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Award,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { schoolService } from '@/services/schoolService';
import { classService } from '@/services/classService';
import { School as SchoolType } from '@/types/school';
import { Class } from '@/types/class';
import { SHIFT_LABELS } from '@/types/class';
import { MANAGER_POSITION_LABELS } from '@/types/schoolManager';

interface ManagerStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  activeClasses: number;
  averageAttendance: number;
  averageGrade: number;
  monthlyRevenue: number;
  pendingPayments: number;
}

interface TeacherPerformance {
  id: string;
  name: string;
  classes: number;
  students: number;
  averageGrade: number;
  attendance: number;
}

interface ClassPerformance {
  id: string;
  name: string;
  teacher: string;
  students: number;
  averageGrade: number;
  attendance: number;
  status: 'excellent' | 'good' | 'attention' | 'critical';
}

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<SchoolType | null>(null);
  const [stats, setStats] = useState<ManagerStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    activeClasses: 0,
    averageAttendance: 0,
    averageGrade: 0,
    monthlyRevenue: 0,
    pendingPayments: 0
  });
  const [teacherPerformance, setTeacherPerformance] = useState<TeacherPerformance[]>([]);
  const [classPerformance, setClassPerformance] = useState<ClassPerformance[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados da escola
      // Por enquanto vamos simular os dados
      const mockSchool: SchoolType = {
        id: 'school1',
        name: 'Escola Municipal São Paulo',
        code: 'EMSP001',
        institution_id: 'inst1',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        phone: '(11) 1234-5678',
        email: 'contato@emsp.edu.br',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      setSchool(mockSchool);
      
      // Estatísticas simuladas
      setStats({
        totalStudents: 450,
        totalTeachers: 28,
        totalClasses: 18,
        activeClasses: 16,
        averageAttendance: 92.5,
        averageGrade: 7.8,
        monthlyRevenue: 125000,
        pendingPayments: 8500
      });

      // Desempenho dos professores
      setTeacherPerformance([
        {
          id: '1',
          name: 'Ana Santos',
          classes: 3,
          students: 75,
          averageGrade: 8.5,
          attendance: 95
        },
        {
          id: '2',
          name: 'Carlos Oliveira',
          classes: 2,
          students: 52,
          averageGrade: 7.8,
          attendance: 93
        },
        {
          id: '3',
          name: 'Beatriz Lima',
          classes: 3,
          students: 78,
          averageGrade: 8.2,
          attendance: 94
        }
      ]);

      // Desempenho das turmas
      setClassPerformance([
        {
          id: '1',
          name: '5º Ano A',
          teacher: 'Ana Santos',
          students: 28,
          averageGrade: 8.5,
          attendance: 95,
          status: 'excellent'
        },
        {
          id: '2',
          name: '4º Ano B',
          teacher: 'Carlos Oliveira',
          students: 26,
          averageGrade: 7.2,
          attendance: 88,
          status: 'attention'
        },
        {
          id: '3',
          name: '3º Ano A',
          teacher: 'Beatriz Lima',
          students: 25,
          averageGrade: 8.0,
          attendance: 92,
          status: 'good'
        }
      ]);

      // Alertas
      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Baixa frequência',
          description: '4º Ano B está com frequência abaixo de 90%',
          date: '2025-01-28',
          priority: 'high'
        },
        {
          id: '2',
          type: 'info',
          title: 'Reunião de pais',
          description: 'Reunião bimestral agendada para 05/02',
          date: '2025-01-27',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'success',
          title: 'Meta atingida',
          description: 'Frequência geral acima de 92% este mês',
          date: '2025-01-26',
          priority: 'low'
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ClassPerformance['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'attention':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'info':
        return <Bell className="w-4 h-4" />;
      case 'success':
        return <CheckCircle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
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
        <h1 className="text-3xl font-bold text-primary-dark text-gray-600 mb-2">
          Painel de Gestão
        </h1>
        <p className="text-gray-600 text-gray-400">
          {school?.name} • {user?.name}
        </p>
      </div>

      {/* Seletor de Período */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-sm font-medium">Período:</label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-300 border-gray-600 rounded-lg focus:ring-2 focus:ring-primary bg-blue-100"
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Ano</option>
        </select>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          title="Total de Alunos"
          value={stats.totalStudents}
          trend="+5%"
          trendUp={true}
          color="bg-primary"
        />
        <StatCard
          icon={UserCheck}
          title="Professores Ativos"
          value={stats.totalTeachers}
          trend="+2"
          trendUp={true}
          color="bg-accent-green"
        />
        <StatCard
          icon={BookOpen}
          title="Turmas Ativas"
          value={`${stats.activeClasses}/${stats.totalClasses}`}
          trend="89%"
          trendUp={true}
          color="bg-accent-purple"
        />
        <StatCard
          icon={Activity}
          title="Frequência Média"
          value={`${stats.averageAttendance}%`}
          trend="-2%"
          trendUp={false}
          color="bg-accent-yellow"
        />
      </div>

      {/* Indicadores Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-accent-green" />
            <span className="text-primary-dark">Indicadores Financeiros</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 text-gray-400">Receita Mensal</p>
              <p className="text-2xl font-bold text-accent-green">
                R$ {stats.monthlyRevenue.toLocaleString('pt-BR')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 text-gray-400">Pendências</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {stats.pendingPayments.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            <span className="text-primary-dark">Metas do Período</span>
          </h3>
          <div className="space-y-3">
            <ProgressBar label="Matrículas" value={85} target={100} />
            <ProgressBar label="Retenção" value={92} target={95} />
            <ProgressBar label="Satisfação" value={88} target={90} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desempenho das Turmas */}
        <div className="lg:col-span-2">
          <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-accent-purple" />
                <span className="text-primary-dark">Desempenho das Turmas</span>
              </h2>
              <button className="text-sm text-primary hover:text-primary-dark transition-colors duration-200">
                Ver todas
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 text-gray-400 border-b">
                    <th className="pb-2">Turma</th>
                    <th className="pb-2">Professor</th>
                    <th className="pb-2">Alunos</th>
                    <th className="pb-2">Média</th>
                    <th className="pb-2">Freq.</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {classPerformance.map((classItem) => (
                    <tr key={classItem.id} className="border-b hover:bg-gray-50 hover:bg-gray-300">
                      <td className="py-3 font-medium">{classItem.name}</td>
                      <td className="py-3 text-sm">{classItem.teacher}</td>
                      <td className="py-3 text-sm">{classItem.students}</td>
                      <td className="py-3 text-sm font-medium">{classItem.averageGrade.toFixed(1)}</td>
                      <td className="py-3 text-sm">{classItem.attendance}%</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(classItem.status)}`}>
                          {classItem.status === 'excellent' ? 'Excelente' :
                           classItem.status === 'good' ? 'Bom' :
                           classItem.status === 'attention' ? 'Atenção' : 'Crítico'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desempenho dos Professores */}
          <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-primary" />
              <span className="text-primary-dark">Top Professores</span>
            </h2>
            <div className="space-y-3">
              {teacherPerformance.map((teacher, index) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-4 bg-gray-50 bg-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-gray-500">
                        {teacher.classes} turmas • {teacher.students} alunos
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{teacher.averageGrade.toFixed(1)}</p>
                    <p className="text-sm text-gray-500">{teacher.attendance}% freq.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas e Notificações */}
        <div>
          <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-accent-orange" />
              <span className="text-primary-dark">Alertas e Avisos</span>
            </h2>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg ${
                    alert.type === 'warning' ? 'bg-yellow-50 bg-yellow-900/20' :
                    alert.type === 'info' ? 'bg-blue-50 bg-blue-900/20' :
                    alert.type === 'success' ? 'bg-green-50 bg-green-900/20' :
                    'bg-red-50 bg-red-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${
                      alert.type === 'warning' ? 'text-yellow-600' :
                      alert.type === 'info' ? 'text-blue-600' :
                      alert.type === 'success' ? 'text-green-600' :
                      'text-red-600'
                    }`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 text-gray-400 mt-1">
                        {alert.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(alert.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-primary-dark">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Gerar Relatório
              </button>
              <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendar Reunião
              </button>
              <button className="w-full px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                <Bell className="w-4 h-4" />
                Enviar Comunicado
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-primary-dark">Evolução de Matrículas</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de linha (implementar com Chart.js)
          </div>
        </div>

        <div className="bg-white bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-primary-dark">Distribuição por Turno</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de pizza (implementar com Chart.js)
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
  trend: string;
  trendUp: boolean;
  color: string;
}

function StatCard({ icon: Icon, title, value, trend, trendUp, color }: StatCardProps) {
  return (
    <div className="bg-white bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
        </div>
        <span className={`text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800-dark text-gray-600">
        {value}
      </p>
      <p className="text-sm text-gray-600 text-gray-400">{title}</p>
    </div>
  );
}

// Componente de Barra de Progresso
interface ProgressBarProps {
  label: string;
  value: number;
  target: number;
}

function ProgressBar({ label, value, target }: ProgressBarProps) {
  const percentage = (value / target) * 100;
  const color = percentage >= 90 ? 'bg-accent-green' : percentage >= 70 ? 'bg-accent-yellow' : 'bg-error';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 text-gray-400">{label}</span>
        <span className="font-medium">{value}/{target}</span>
      </div>
      <div className="w-full bg-gray-200 bg-gray-300 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
