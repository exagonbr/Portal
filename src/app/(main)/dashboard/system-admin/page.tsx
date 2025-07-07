'use client';

import React, { useState, useEffect } from 'react';
import { isDevelopment } from '@/utils/env';
import {
  Shield,
  Building2,
  Users,
  Server,
  Activity,
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Lock,
  Settings,
  TrendingUp,
  BarChart3,
  PieChart,
  Zap,
  HardDrive,
  Cpu,
  WifiOff,
  RefreshCw,
  School,
  UserCheck,
  Clock,
  Cloud,
  Eye,
  Terminal,
  FileText,
  Gauge,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { InstitutionType } from '@/types/institution';
import { debugAuth } from '@/utils/auth-debug';
import { StatCard, ContentCard, SimpleCard } from '@/components/ui/StandardCard';
import { initializeGlobalErrorHandler } from '@/utils/global-error-handler';
import { runAllChunkErrorTests } from '@/utils/chunk-error-test';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Registrando os componentes necessários do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type SystemDashboardData = any;

interface RealUserStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  users_by_role: Record<string, number>;
  users_by_institution: Record<string, number>;
  recent_registrations: number;
}

interface InstitutionStats {
  id: string;
  name: string;
  code: string;
  cnpj?: string;
  type: InstitutionType;
  nature?: string;
  description?: string;
  address?: string | object;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  active?: boolean;
  schools_count?: number;
  users_count?: number;
  created_at: string;
  updated_at: string;
}

interface RoleStats {
  totalRoles: number;
  systemRoles: number;
  customRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  totalUsers: number;
}

interface AwsConnectionStats {
  total_connections: number;
  successful_connections: number;
  failed_connections: number;
  success_rate: number;
  average_response_time: number;
  last_connection: Date | null;
  services_used: string[];
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

interface EngagementMetrics {
  retentionRate: number;
  averageSessionDuration: number;
  bounceRate: number;
  topFeatures: Array<{
    name: string;
    usage: number;
  }>;
}

interface SystemAnalytics {
  userGrowth?: Array<{
    month: string;
    users: number;
    growth: number;
  }>;
  sessionTrends?: Array<{
    hour: string;
    sessions: number;
  }>;
  institutionDistribution?: Array<{
    name: string;
    users: number;
  }>;
}

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.error?.message || '';
      if (errorMessage.includes("Cannot read properties of undefined (reading 'call')") ||
          errorMessage.includes("originalFactory is undefined") ||
          errorMessage.includes("ChunkLoadError") ||
          errorMessage.includes("Loading chunk") ||
          errorMessage.includes("Loading CSS chunk")) {
        console.log('🔥 Chunk loading error capturado:', event.error);
        setError(event.error);
        setHasError(true);
        event.preventDefault();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reasonMessage = event.reason?.message || '';
      if (reasonMessage.includes("Cannot read properties of undefined (reading 'call')") ||
          reasonMessage.includes("originalFactory is undefined") ||
          reasonMessage.includes("ChunkLoadError") ||
          reasonMessage.includes("Loading chunk") ||
          reasonMessage.includes("Loading CSS chunk")) {
        console.log('🔥 Promise rejection capturada:', event.reason);
        setError(event.reason);
        setHasError(true);
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center p-4 sm:p-6 max-w-md w-full">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Erro de Carregamento</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-4">
            Ocorreu um erro ao carregar alguns componentes. Isso pode ser devido a problemas de rede.
          </p>
          <button
            onClick={() => {
              setHasError(false);
              setError(null);
              window.location.reload();
            }}
            className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm sm:text-base"
          >
            Recarregar Página
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function SystemAdminDashboard() {
  return (
    <ErrorBoundary>
      <SystemAdminDashboardContent />
    </ErrorBoundary>
  );
}

function SystemAdminDashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<SystemDashboardData | null>(null);
  const [institutions, setInstitutions] = useState<InstitutionStats[]>([]);
  const [roleStats, setRoleStats] = useState<RoleStats | null>(null);
  const [awsStats, setAwsStats] = useState<AwsConnectionStats | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [realUsersByRole, setRealUsersByRole] = useState<Record<string, number>>({});
  const [realUserStats, setRealUserStats] = useState<RealUserStats | null>(null);
  const [systemAnalytics, setSystemAnalytics] = useState<SystemAnalytics | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [institutionStats, setInstitutionStats] = useState<{
    totalInstitutions: number;
    activeInstitutions: number;
    totalUsers: number;
    totalSchools: number;
    averageUsersPerInstitution: number;
    recentInstitutions: number;
  } | null>(null);

  useEffect(() => {
    
    // Inicializar handler global de erros
    initializeGlobalErrorHandler();
    
    // Executar testes de chunk error (apenas em desenvolvimento)
    if (isDevelopment()) {
      runAllChunkErrorTests().catch(console.log);
    }
    

    loadDashboardData();
    
    // Auto-refresh a cada 30 segundos para métricas em tempo real
    const interval = setInterval(() => {
      loadRealTimeMetrics();
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    // Mock data to bring the dashboard to life
    setRealUserStats({
      total_users: 12540,
      active_users: 9870,
      inactive_users: 2670,
      users_by_role: {
        'STUDENT': 8000,
        'TEACHER': 1500,
        'COORDINATOR': 200,
        'PARENT': 2500,
        'ADMIN': 50,
        'SYSTEM_ADMIN': 5
      },
      users_by_institution: {},
      recent_registrations: 320,
    });

    setInstitutions([
      { id: '1', name: 'Colégio Saber', code: 'CS', users_count: 2500, schools_count: 3, created_at: new Date().toISOString(), type: InstitutionType.COLLEGE, active: true, updated_at: new Date().toISOString() },
      { id: '2', name: 'Escola Conhecer', code: 'EC', users_count: 1800, schools_count: 2, created_at: new Date().toISOString(), type: InstitutionType.SCHOOL, active: true, updated_at: new Date().toISOString() },
      { id: '3', name: 'Instituto Aprender Mais', code: 'IAM', users_count: 3200, schools_count: 5, created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), type: InstitutionType.TECH_CENTER, active: true, updated_at: new Date().toISOString() },
    ]);

    setAlerts([
      { id: 'memory-warning', type: 'warning', title: 'Alto uso de memória', description: 'Uso de memória heap em 82.1% - Monitoramento necessário', timestamp: new Date(), resolved: false },
      { id: 'backup-success', type: 'info', title: 'Backup automático concluído', description: 'Backup diário do banco de dados executado com sucesso', timestamp: new Date(Date.now() - 3600000 * 8), resolved: true },
    ]);
    
    setDashboardData({
        system: {
            uptime: 86400 * 5, // 5 days
            version: '2.5.1',
            environment: 'production',
            memoryUsage: { heapUsed: 350 * 1024 * 1024, heapTotal: 512 * 1024 * 1024 }
        },
        sessions: {
            activeUsers: 123,
            totalActiveSessions: 150,
            sessionsByDevice: { Desktop: 90, Mobile: 50, Tablet: 10 },
            averageSessionDuration: 25
        },
        infrastructure: {
            aws: {
                performance: { uptime: 99.98, responseTime: 120 },
                services: ['S3', 'EC2', 'RDS', 'Lambda'],
                costs: { monthly: 1500.50 }
            }
        }
    });

    setRealUsersByRole({
        'STUDENT': 8000,
        'TEACHER': 1500,
        'COORDINATOR': 200,
        'PARENT': 2500,
        'ADMIN': 50,
        'SYSTEM_ADMIN': 5
    });

    setEngagementMetrics({
        retentionRate: 85,
        averageSessionDuration: 25,
        bounceRate: 22,
        topFeatures: [
            { name: 'Visualização de Notas', usage: 78 },
            { name: 'Entrega de Atividades', usage: 65 },
            { name: 'Fórum de Discussão', usage: 45 }
        ]
    });

    setSystemAnalytics({
        userGrowth: [
            { month: 'Jan', users: 7000, growth: 5 },
            { month: 'Fev', users: 7500, growth: 7 },
            { month: 'Mar', users: 8200, growth: 9 },
            { month: 'Abr', users: 9000, growth: 10 },
            { month: 'Mai', users: 10500, growth: 17 },
            { month: 'Jun', users: 12540, growth: 19 }
        ],
        sessionTrends: [
            { hour: '08:00', sessions: 120 },
            { hour: '10:00', sessions: 150 },
            { hour: '14:00', sessions: 180 },
            { hour: '16:00', sessions: 160 },
            { hour: '20:00', sessions: 100 }
        ],
        institutionDistribution: [
            { name: 'Colégio Saber', users: 2500 },
            { name: 'Escola Conhecer', users: 1800 },
            { name: 'Instituto Aprender Mais', users: 3200 },
        ]
    });


    setLoading(false);
  };
  const loadRealTimeMetrics = async () => {};

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-accent-yellow" />;
      case 'info':
        return <CheckCircle className="w-5 h-5 text-primary" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Dados para gráficos usando dados reais do backend
  const usersByRoleData = Object.keys(realUsersByRole).length > 0 ? {
    labels: Object.keys(realUsersByRole).map(role => {
      const roleNames: Record<string, string> = {
        'STUDENT': 'Alunos',
        'TEACHER': 'Professores', 
        'COORDINATOR': 'Coordenadores',
        'PARENT': 'Responsáveis',
        'ADMIN': 'Administradores',
        'SYSTEM_ADMIN': 'Super Admin'
      };
      return roleNames[role] || role;
    }),
    datasets: [{
      label: 'Usuários',
      data: Object.values(realUsersByRole),
      backgroundColor: [
        'rgba(59, 130, 246, 0.9)',   // Azul para Alunos
        'rgba(16, 185, 129, 0.9)',   // Verde para Professores
        'rgba(249, 115, 22, 0.9)',   // Laranja para Coordenadores
        'rgba(168, 85, 247, 0.9)',   // Roxo para Responsáveis
        'rgba(236, 72, 153, 0.9)',   // Rosa para Administradores
        'rgba(34, 197, 94, 0.9)'     // Verde escuro para Super Admin
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(34, 197, 94, 1)'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(34, 197, 94, 1)'
      ],
      hoverBorderWidth: 3,
      hoverOffset: 8
    }]
  } : null;

  const sessionsByDeviceData = dashboardData && dashboardData.sessions?.sessionsByDevice ? {
    labels: Object.keys(dashboardData.sessions.sessionsByDevice),
    datasets: [{
      label: 'Sessões Ativas',
      data: Object.values(dashboardData.sessions.sessionsByDevice),
      backgroundColor: [
        'rgba(99, 102, 241, 0.9)',   // Indigo para Desktop
        'rgba(34, 197, 94, 0.9)',    // Green para Mobile  
        'rgba(251, 146, 60, 0.9)',   // Orange para Tablet
        'rgba(168, 85, 247, 0.9)'    // Purple para outros
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(34, 197, 94, 1)', 
        'rgba(251, 146, 60, 1)',
        'rgba(168, 85, 247, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 146, 60, 1)', 
        'rgba(168, 85, 247, 1)'
      ],
      hoverBorderWidth: 3
    }]
  } : null;

  // Gráfico de crescimento de usuários
  const userGrowthData = systemAnalytics?.userGrowth && Array.isArray(systemAnalytics.userGrowth) ? {
    labels: systemAnalytics.userGrowth.map((item) => item.month),
    datasets: [{
      label: 'Usuários Totais',
      data: systemAnalytics.userGrowth.map((item) => item.users),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgba(59, 130, 246, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }, {
      label: 'Taxa de Crescimento (%)',
      data: systemAnalytics.userGrowth.map((item) => item.growth),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.4,
      yAxisID: 'y1',
      pointBackgroundColor: 'rgba(16, 185, 129, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  } : null;

  // Gráfico de tendências de sessões por hora
  const sessionTrendsData = systemAnalytics?.sessionTrends && Array.isArray(systemAnalytics.sessionTrends) ? {
    labels: systemAnalytics.sessionTrends.map((item) => item.hour),
    datasets: [{
      label: 'Sessões por Hora',
      data: systemAnalytics.sessionTrends.map((item) => item.sessions),
      borderColor: 'rgba(168, 85, 247, 1)',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
      pointBackgroundColor: 'rgba(168, 85, 247, 1)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5
    }]
  } : null;

  // Gráfico de distribuição de instituições
  const institutionDistributionData = systemAnalytics?.institutionDistribution && Array.isArray(systemAnalytics.institutionDistribution) ? {
    labels: systemAnalytics.institutionDistribution.map((item) => item.name),
    datasets: [{
      label: 'Usuários por Instituição',
      data: systemAnalytics.institutionDistribution.map((item) => item.users),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(249, 115, 22, 0.8)',
        'rgba(168, 85, 247, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(249, 115, 22, 1)',
        'rgba(168, 85, 247, 1)',
        'rgba(236, 72, 153, 1)'
      ],
      borderWidth: 2,
      borderRadius: 6
    }]
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-gray-600 mt-3">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 dark:text-gray-800 flex items-center gap-2 sm:gap-3">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary flex-shrink-0" />
              <span className="truncate">Painel do Administrador do Sistema</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-600 mt-1">
              Monitoramento e gestão completa da plataforma Portal Sabercon
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 w-full sm:w-auto">
            <button 
              onClick={loadRealTimeMetrics}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:inline">Atualizar</span>
            </button>
            <button 
              onClick={() => router.push('/admin/monitoring')}
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Gauge className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:inline">Monitoramento</span>
            </button>
          </div>
        </div>
        
        {/* Resumo Geral do Sistema */}
        <div className="mt-3 sm:mt-4">
            <ContentCard
              title="Resumo Geral do Sistema"
              subtitle="Estatísticas principais em tempo real"
              icon={BarChart3}
              iconColor="bg-blue-500"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg sm:text-xl font-bold text-blue-600">{realUserStats?.total_users?.toLocaleString('pt-BR') ?? '...'}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Total de Usuários</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
                  <p className="text-lg sm:text-xl font-bold text-green-600">{realUserStats?.active_users?.toLocaleString('pt-BR') ?? '...'}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Usuários Ativos</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg sm:text-xl font-bold text-purple-600">{institutions?.length ?? '...'}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Instituições</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <p className="text-lg sm:text-xl font-bold text-orange-600">{realUserStats?.recent_registrations?.toLocaleString('pt-BR') ?? '...'}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Novos este Mês</p>
                </div>
              </div>
            </ContentCard>
          </div>
      </div>

      {/* Alertas do Sistema */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="mb-3 sm:mb-4 space-y-2">
          {alerts.filter(a => !a.resolved).map(alert => (
            <div
              key={alert.id}
              className={`p-2 sm:p-3 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-accent-yellow/10 border-accent-yellow/20' :
                'bg-primary/10 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs sm:text-sm">{alert.title}</h3>
                  <p className="text-xs text-gray-600 mt-1 break-words">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
                <button className="text-xs text-gray-500 hover:text-gray-700 flex-shrink-0 px-2 py-1">
                  Resolver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Métricas Principais do Sistema */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          icon={Server}
          title="Uptime do Sistema"
          value={dashboardData?.system ? formatUptime(dashboardData.system.uptime) : 'N/A'}
          subtitle={`v${dashboardData?.system?.version || 'N/A'} • ${dashboardData?.system?.environment || 'N/A'}`}
          color="emerald"
        />
        <StatCard
          icon={Cpu}
          title="Memória Heap"
          value={dashboardData?.system ? formatBytes(dashboardData.system.memoryUsage.heapUsed) : 'N/A'}
          subtitle={dashboardData?.system ? `${((dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100).toFixed(1)}% de ${formatBytes(dashboardData.system.memoryUsage.heapTotal)}` : 'N/A'}
          color="blue"
          trend={dashboardData?.system ? 
            ((dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100) > 85 ? 'Crítico' :
            ((dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100) > 75 ? 'Atenção' : 'Normal'
            : 'Normal'
          }
        />
        <StatCard
          icon={Users}
          title="Usuários Online"
          value={dashboardData?.sessions?.activeUsers?.toLocaleString('pt-BR') || realUserStats?.active_users?.toLocaleString('pt-BR') || '0'}
          subtitle={`${dashboardData?.sessions?.totalActiveSessions?.toLocaleString('pt-BR') || '0'} sessões ativas`}
          color="violet"
          trend={dashboardData?.sessions?.activeUsers && dashboardData.sessions.activeUsers > 5000 ? 'Alta carga' : 'Tempo real'}
        />

      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-100 rounded-lg">
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {institutionStats?.totalInstitutions || institutions.length}
              </p>
              <p className="text-xs text-gray-600">Instituições</p>
              <p className="text-xs text-gray-500">
                {institutionStats?.activeInstitutions || institutions.filter(i => i.active !== false).length} ativas
                {institutionStats?.recentInstitutions && institutionStats.recentInstitutions > 0 && (
                  <span className="ml-1 text-blue-600">• {institutionStats.recentInstitutions} novas</span>
                )}
              </p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 rounded-lg">
              <School className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {institutionStats?.totalSchools || institutions.reduce((total, inst) => total + (inst.schools_count || 0), 0)}
              </p>
              <p className="text-xs text-gray-600">Escolas</p>
              <p className="text-xs text-gray-500">
                {Math.floor((institutionStats?.totalSchools || institutions.reduce((total, inst) => total + (inst.schools_count || 0), 0)) * 0.91)} ativas
                {institutionStats?.totalInstitutions && institutionStats.totalInstitutions > 0 && (
                  <span className="ml-1 text-indigo-600">
                    • {Math.round((institutionStats.totalSchools || 0) / institutionStats.totalInstitutions)} por inst.
                  </span>
                )}
              </p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {(realUsersByRole.STUDENT || realUserStats?.users_by_role?.STUDENT || 0).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-600">Alunos</p>
              <p className="text-xs text-gray-500">
                {((realUsersByRole.STUDENT || realUserStats?.users_by_role?.STUDENT || 0) / 
                  (realUserStats?.total_users || Object.values(realUsersByRole).reduce((a, b) => a + b, 0) || 1) * 100).toFixed(1)}% do total
              </p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-100 rounded-lg">
              <UserCheck className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {(realUsersByRole.TEACHER || realUserStats?.users_by_role?.TEACHER || 0).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-600">Professores</p>
              <p className="text-xs text-gray-500">Educadores ativos</p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <Users className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {(realUsersByRole.COORDINATOR || realUserStats?.users_by_role?.COORDINATOR || 0).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-600">Coordenadores</p>
              <p className="text-xs text-gray-500">Gestão pedagógica</p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {(realUsersByRole.PARENT || realUserStats?.users_by_role?.PARENT || 0).toLocaleString('pt-BR')}
              </p>
              <p className="text-xs text-gray-600">Responsáveis</p>
              <p className="text-xs text-gray-500">Pais e tutores</p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-pink-100 rounded-lg">
              <Activity className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {dashboardData?.sessions?.totalActiveSessions?.toLocaleString('pt-BR') || '0'}
              </p>
              <p className="text-xs text-gray-600">Sessões Ativas</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 inline-block bg-green-500 rounded-full animate-pulse"></span>
                {dashboardData?.sessions?.activeUsers?.toLocaleString('pt-BR') || '0'} usuários online
              </p>
            </div>
          </div>
        </SimpleCard>

        <SimpleCard className="p-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-teal-100 rounded-lg">
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {dashboardData?.sessions?.averageSessionDuration ? `${dashboardData.sessions.averageSessionDuration.toFixed(0)}min` : 'N/A'}
              </p>
              <p className="text-xs text-gray-600">Tempo Médio</p>
              <p className="text-xs text-gray-500">Por sessão</p>
            </div>
          </div>
        </SimpleCard>
      </div>

      {/* Layout Principal com 3 Colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4">
        {/* Coluna Principal - Gráficos e Analytics */}
        <div className="xl:col-span-12">
          {/* Seção de Gráficos de Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Crescimento de Usuários */}
            {userGrowthData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span className="truncate">Crescimento de Usuários</span>
                  </h3>
                  <div className="text-xs text-gray-500 flex-shrink-0">Últimos 6 meses</div>
                </div>
                <div className="h-48">
                  <Line
                    data={userGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        mode: 'index',
                        intersect: false,
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString('pt-BR');
                            }
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: {
                            drawOnChartArea: false,
                          },
                          ticks: {
                            callback: function(value) {
                              return value + '%';
                            }
                          }
                        },
                      },
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              let label = context.dataset.label || '';
                              if (label) {
                                label += ': ';
                              }
                              if (context.dataset.yAxisID === 'y1') {
                                label += context.parsed.y + '%';
                              } else {
                                label += context.parsed.y.toLocaleString('pt-BR');
                              }
                              return label;
                            }
                          }
                        },
                        legend: {
                          position: 'top',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            padding: 15,
                            font: {
                              size: 10
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Tendências de Sessões por Hora */}
            {sessionTrendsData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Atividade por Hora
                  </h3>
                  <div className="text-xs text-gray-500">Hoje</div>
                </div>
                <div className="h-48">
                  <Bar
                    data={sessionTrendsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return context.parsed.y.toLocaleString('pt-BR') + ' sessões';
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          grid: {
                            display: false
                          }
                        },
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                          },
                          ticks: {
                            callback: function(value) {
                              return value.toLocaleString('pt-BR');
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Distribuição por Instituições */}
            {institutionDistributionData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-500" />
                    Distribuição por Instituições
                  </h3>
                  <button
                    onClick={() => router.push('/admin/institutions')}
                    className="text-xs text-primary hover:text-primary-dark"
                  >
                    Ver todas
                  </button>
                </div>
                <div className="h-48">
                  <Doughnut
                    data={institutionDistributionData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: '65%',
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 15,
                            font: {
                              size: 10
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção de Gráficos Principais */}
          <div className="grid grid-cols-1 ">
            
            {/* Usuários por Função - Dados Reais do Backend */}
            {usersByRoleData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Usuários por Função
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Total: {Object.values(realUsersByRole).reduce((a, b) => a + b, 0).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="h-40 sm:h-48">
                  <Pie
                    data={usersByRoleData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            boxHeight: 8,
                            padding: 10,
                            font: {
                              size: 10
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const label = context.label || '';
                              const value = context.parsed || 0;
                              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((value / total) * 100);
                              return `${label}: ${value.toLocaleString('pt-BR')} (${percentage}%)`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
                <div className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(Object.keys(realUsersByRole).length > 0 ? realUsersByRole : realUserStats?.users_by_role || {}).map(([role, count], index) => {
                    const roleNames: Record<string, string> = {
                      'STUDENT': 'Alunos',
                      'TEACHER': 'Professores', 
                      'ACADEMIC_COORDINATOR': 'Coordenadores',
                      'COORDINATOR': 'Coordenadores',
                      'GUARDIAN': 'Responsáveis',
                      'PARENT': 'Responsáveis',
                      'INSTITUTION_MANAGER': 'Gestores',
                      'ADMIN': 'Administradores',
                      'SYSTEM_ADMIN': 'Super Admin'
                    };
                    const colors = ['text-blue-600', 'text-green-600', 'text-orange-600', 'text-purple-600', 'text-pink-600', 'text-emerald-600'];
                    const bgColors = ['bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100', 'bg-pink-100', 'bg-emerald-100'];
                    const usersByRoleData = Object.keys(realUsersByRole).length > 0 ? realUsersByRole : realUserStats?.users_by_role || {};
                    const total = Object.values(usersByRoleData).reduce((a: number, b: number) => a + b, 0) || realUserStats?.total_users || 1;
                    const percentage = Math.round((count / total) * 100);
                    
                    return (
                      <SimpleCard key={role} className="p-2 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-bold ${colors[index] || 'text-gray-600'}`}>
                              {count.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-xs font-medium text-gray-700">{roleNames[role] || role}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-semibold ${colors[index] || 'text-gray-600'}`}>
                              {percentage}%
                            </p>
                          </div>
                        </div>
                      </SimpleCard>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Seção de Gráficos Secundários */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4">
            

        </div>

</div>
        {/* Coluna Lateral - Resumos e Ações */}
        
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          
          {/* Resumo de Instituições */}
          <ContentCard
            title="Instituições Ativas"
            subtitle={`${institutions.length} instituições com maior atividade`}
            icon={Building2}
            iconColor="bg-slate-500"
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {}}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                  title="Atualizar dados"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button
                  onClick={() => router.push('/admin/institutions')}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  Ver todas →
                </button>
              </div>
            }
          >
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Carregando dados das instituições...</p>
                </div>
              ) : institutions.length === 0 ? (
                <div className="text-center py-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Nenhuma instituição encontrada</p>
                    <p className="text-xs text-gray-500">Verifique os filtros ou aguarde o carregamento</p>
                  </div>
                </div>
              ) : (
                institutions.slice(0, 5).map((institution, index) => {
                  const totalUsers = institution.users_count || 0;
                  const totalSchools = institution.schools_count || 0;
                  const createdDate = new Date(institution.created_at);
                  const isRecent = (Date.now() - createdDate.getTime()) < (30 * 24 * 60 * 60 * 1000); // 30 dias
                  
                  return (
                    <SimpleCard
                      key={institution.id}
                      className="p-2 sm:p-3 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/30"
                      hover={true}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-xs font-bold text-primary flex-shrink-0">#{index + 1}</span>
                              <h4 className="font-semibold text-xs sm:text-sm text-gray-800 truncate" title={institution.name}>
                                {institution.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
                                Ativa
                              </span>
                              {isRecent && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                                  Nova
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className="font-medium text-gray-700 min-w-[60px]">Tipo:</span>
                              <span className="text-gray-600 capitalize">{institution.type?.toLowerCase().replace('_', ' ') || 'N/A'}</span>
                            </div>
                            
                            {(totalSchools > 0 || totalUsers > 0) && (
                              <div className="flex items-center gap-4 text-xs">
                                {totalSchools > 0 && (
                                  <div className="flex items-center gap-1">
                                    <School className="w-3 h-3 text-indigo-500" />
                                    <span className="font-medium text-indigo-700">
                                      {totalSchools.toLocaleString('pt-BR')} escola{totalSchools !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                                {totalUsers > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 text-blue-500" />
                                    <span className="font-medium text-blue-700">
                                      {totalUsers.toLocaleString('pt-BR')} usuário{totalUsers !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="w-3 h-3" />
                                <span>Criada em {createdDate.toLocaleDateString('pt-BR')}</span>
                              </div>
                              
                              {totalUsers > 0 && (
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-green-600">Ativa</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </SimpleCard>
                  );
                })
              )}
              
              {institutions.length > 5 && (
                <div className="text-center pt-2">
                  <button 
                    onClick={() => router.push('/admin/institutions')}
                    className="text-xs text-primary hover:text-primary-dark font-medium flex items-center justify-center gap-1 mx-auto"
                  >
                    Ver mais {institutions.length - 5} instituições
                    <Building2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Resumo estatístico no rodapé */}
            {institutions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-bold text-blue-600">
                      {institutions.reduce((sum, inst) => sum + (inst.users_count || 0), 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Total Usuários</p>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <p className="text-sm font-bold text-indigo-600">
                      {institutions.reduce((sum, inst) => sum + (inst.schools_count || 0), 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Total Escolas</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <p className="text-sm font-bold text-green-600">
                      {Math.round(institutions.reduce((sum, inst) => sum + (inst.users_count || 0), 0) / institutions.length).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Média/Inst.</p>
                  </div>
                </div>
              </div>
            )}
          </ContentCard>

          {/* Métricas de Engajamento */}
          {engagementMetrics && (
            <ContentCard
              title="Engajamento dos Usuários"
              subtitle="Métricas de atividade e retenção"
              icon={Activity}
              iconColor="bg-green-500"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <SimpleCard className="p-2" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Taxa de Retenção:</span>
                      <span className="font-bold text-green-600 text-sm">{engagementMetrics?.retentionRate || 0}%</span>
                    </div>
                  </SimpleCard>
                  <SimpleCard className="p-2" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Tempo Médio de Sessão:</span>
                      <span className="font-bold text-blue-600 text-sm">{engagementMetrics?.averageSessionDuration || 0}min</span>
                    </div>
                  </SimpleCard>
                  <SimpleCard className="p-2" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Taxa de Rejeição:</span>
                      <span className="font-bold text-orange-600 text-sm">{engagementMetrics?.bounceRate || 0}%</span>
                    </div>
                  </SimpleCard>
                </div>
                {engagementMetrics?.topFeatures && Array.isArray(engagementMetrics.topFeatures) && engagementMetrics.topFeatures.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Funcionalidades Mais Usadas:</p>
                    <div className="space-y-2">
                      {engagementMetrics.topFeatures.slice(0, 3).map((feature, index: number) => (
                        <div key={feature?.name || `feature-${index}`} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="text-xs font-medium text-gray-700 truncate">{feature?.name || 'Funcionalidade'}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-12 sm:w-16 h-1.5 bg-gray-200 rounded-full">
                              <div 
                                className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300" 
                                style={{ width: `${feature?.usage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-blue-600 min-w-6 sm:min-w-7 flex-shrink-0">{feature?.usage || 0}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ContentCard>
          )}



          {/* Links Rápidos */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-3 sm:p-4">
            <h3 className="text-sm sm:text-base font-semibold mb-2 sm:mb-3">Acesso Rápido</h3>
            <div className="space-y-1">
              <button 
                onClick={() => router.push('/admin/analytics')}
                className="w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
              >
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="truncate">Analytics do Sistema</span>
              </button>
              <button 
                onClick={() => router.push('/admin/logs')}
                className="w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
              >
                <Terminal className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="truncate">Logs do Sistema</span>
              </button>
              <button 
                onClick={() => router.push('/admin/sessions')}
                className="w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="truncate">Sessões Ativas</span>
              </button>
              <button 
                onClick={() => router.push('/portal/reports')}
                className="w-full px-2 sm:px-3 py-2 text-left text-xs sm:text-sm hover:bg-gray-50 rounded flex items-center gap-2 transition-colors"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="truncate">Portal de Relatórios</span>
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}

