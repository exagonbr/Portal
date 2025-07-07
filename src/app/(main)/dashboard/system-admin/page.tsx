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
  Tablet,
  Tv,
  BookOpen
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
              
              {/* Informações detalhadas do sistema */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Status do Servidor */}
                <SimpleCard className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-emerald-500" />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700">Status do Servidor</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-medium text-green-600">Online</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Uptime</p>
                      <p className="text-sm font-bold text-gray-700">{formatUptime(dashboardData?.system?.uptime || 0)}</p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600">Versão:</span>
                      <span className="font-medium">{dashboardData?.system?.version || '2.5.1'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-1">
                      <span className="text-gray-600">Ambiente:</span>
                      <span className="font-medium">{dashboardData?.system?.environment || 'production'}</span>
                    </div>
                  </div>
                </SimpleCard>
                
                {/* Uso de Memória */}
                <SimpleCard className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-500" />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700">Uso de Memória</h4>
                        <p className="text-xs text-gray-500 mt-1">Heap usado/total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">
                        {formatBytes(dashboardData?.system?.memoryUsage?.heapUsed || 0)} / {formatBytes(dashboardData?.system?.memoryUsage?.heapTotal || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {Math.round(((dashboardData?.system?.memoryUsage?.heapUsed || 0) / (dashboardData?.system?.memoryUsage?.heapTotal || 1)) * 100)}% utilizado
                      </p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                        style={{ width: `${Math.round(((dashboardData?.system?.memoryUsage?.heapUsed || 0) / (dashboardData?.system?.memoryUsage?.heapTotal || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </SimpleCard>
                
                {/* Infraestrutura AWS */}
                <SimpleCard className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-orange-500" />
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700">Infraestrutura AWS</h4>
                        <p className="text-xs text-gray-500 mt-1">Status dos serviços</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-700">
                        {dashboardData?.infrastructure?.aws?.performance?.uptime || 99.98}% uptime
                      </p>
                      <p className="text-xs text-gray-500">
                        {dashboardData?.infrastructure?.aws?.performance?.responseTime || 120}ms tempo de resposta
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                    {(dashboardData?.infrastructure?.aws?.services || ['S3', 'EC2', 'RDS', 'Lambda']).map((service: string, idx: number) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-xs font-medium">
                        {service}
                      </span>
                    ))}
                  </div>
                </SimpleCard>
              </div>
              
              {/* Métricas de sessões e dispositivos */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Sessões ativas */}
                <SimpleCard className="p-3">
                  <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Sessões Ativas por Dispositivo
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="space-y-2">
                        {Object.entries(dashboardData?.sessions?.sessionsByDevice || {}).map(([device, count], idx) => (
                          <div key={device} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              {device === 'Desktop' && <Monitor className="w-3 h-3 text-indigo-500" />}
                              {device === 'Mobile' && <Smartphone className="w-3 h-3 text-green-500" />}
                              {device === 'Tablet' && <Tablet className="w-3 h-3 text-orange-500" />}
                              <span>{device}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full ${
                                    idx === 0 ? 'bg-indigo-500' : 
                                    idx === 1 ? 'bg-green-500' : 
                                    'bg-orange-500'
                                  }`}
                                  style={{ width: `${Math.round((Number(count) / (dashboardData?.sessions?.totalActiveSessions || 1)) * 100)}%` }}
                                ></div>
                              </div>
                              <span className="font-medium">{String(count)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-shrink-0 border-l border-gray-100 pl-3 text-center">
                      <p className="text-lg font-bold text-indigo-600">{dashboardData?.sessions?.totalActiveSessions || 0}</p>
                      <p className="text-xs text-gray-500">Total de<br />Sessões</p>
                    </div>
                  </div>
                </SimpleCard>
                
                {/* Custos e Recursos */}
                <SimpleCard className="p-3">
                  <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                    <HardDrive className="w-4 h-4 text-emerald-500" />
                    Recursos e Custos
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-emerald-50 rounded-lg">
                      <p className="text-sm font-bold text-emerald-600">R$ {dashboardData?.infrastructure?.aws?.costs?.monthly?.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) || '1.500,50'}</p>
                      <p className="text-xs text-gray-600">Custo Mensal</p>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-sm font-bold text-blue-600">4</p>
                      <p className="text-xs text-gray-600">Serviços AWS</p>
                    </div>
                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                      <p className="text-sm font-bold text-purple-600">2</p>
                      <p className="text-xs text-gray-600">Instâncias EC2</p>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded-lg">
                      <p className="text-sm font-bold text-amber-600">1</p>
                      <p className="text-xs text-gray-600">RDS Database</p>
                    </div>
                  </div>
                </SimpleCard>
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
          icon={Building2}
          title="Instituições"
          value={institutions?.length.toString() || 'N/A'}
          subtitle={`${institutions?.filter(i => i.active !== false).length || 0} ativas`}
          color="emerald"
        />
        <StatCard
          icon={Users}
          title="Usuários"
          value={realUserStats?.total_users?.toLocaleString('pt-BR') || 'N/A'}
          subtitle={`${realUserStats?.active_users?.toLocaleString('pt-BR') || '0'} ativos (${realUserStats?.active_users && realUserStats?.total_users ? ((realUserStats.active_users / realUserStats.total_users) * 100).toFixed(1) : '0'}%)`}
          color="blue"
          trend={realUserStats?.recent_registrations ? `+${realUserStats.recent_registrations} novos` : 'Normal'}
        />
                  <StatCard
          icon={Users}
          title="Usuários Online"
          value={dashboardData?.sessions?.activeUsers?.toLocaleString('pt-BR') || realUserStats?.active_users?.toLocaleString('pt-BR') || '0'}
          subtitle={`${dashboardData?.sessions?.totalActiveSessions?.toLocaleString('pt-BR') || '0'} sessões ativas`}
          color="violet"
          trend={dashboardData?.sessions?.activeUsers && dashboardData.sessions.activeUsers > 5000 ? 'Alta carga' : 'Tempo real'}
        />
          
          <StatCard
          icon={FileText}
          title="Certificados"
          value="2.450"
          subtitle="1.875 emitidos este mês"
          color="amber"
          trend="↑ 12% em relação ao mês anterior"
        />

      </div>
      
      {/* Seção de Cards de Entretenimento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 mt-6 mb-8">
        {/* Card de TV Shows */}
        <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-3 sm:p-4 h-full">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <Tv className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              <span>TV Shows Populares</span>
            </h3>
            <button className="text-xs text-primary hover:text-primary-dark">
              Ver todos
            </button>
          </div>
        
          <div className="space-y-2 sm:space-y-3">
            <SimpleCard className="p-2 sm:p-3 hover:shadow-sm transition-shadow border-l-4 border-purple-500">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate">Stranger Things</h4>
                  <p className="text-xs text-gray-600 truncate">Netflix • Drama, Sci-Fi</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600">9.2/10</span>
                  <p className="text-xs text-gray-500">4 temporadas</p>
                </div>
              </div>
            </SimpleCard>
            
            <SimpleCard className="p-2 sm:p-3 hover:shadow-sm transition-shadow border-l-4 border-purple-500">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate">The Mandalorian</h4>
                  <p className="text-xs text-gray-600 truncate">Disney+ • Sci-Fi, Aventura</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600">8.8/10</span>
                  <p className="text-xs text-gray-500">3 temporadas</p>
                </div>
              </div>
            </SimpleCard>
            
            <SimpleCard className="p-2 sm:p-3 hover:shadow-sm transition-shadow border-l-4 border-purple-500">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate">Breaking Bad</h4>
                  <p className="text-xs text-gray-600 truncate">AMC • Drama, Crime</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-purple-600">9.5/10</span>
                  <p className="text-xs text-gray-500">5 temporadas</p>
                </div>
              </div>
            </SimpleCard>
          </div>
        </div>
      
        {/* Card de Livros */}
        <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-3 sm:p-4 h-full">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              <span>Livros Recomendados</span>
            </h3>
            <button className="text-xs text-primary hover:text-primary-dark">
              Ver todos
            </button>
          </div>
        
          <div className="space-y-2 sm:space-y-3">
            <SimpleCard className="p-2 sm:p-3 hover:shadow-sm transition-shadow border-l-4 border-amber-500">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate">Duna</h4>
                  <p className="text-xs text-gray-600 truncate">Frank Herbert • Ficção Científica</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">4.7/5</span>
                  <p className="text-xs text-gray-500">412 páginas</p>
                </div>
              </div>
            </SimpleCard>
          
            <SimpleCard className="p-2 sm:p-3 hover:shadow-sm transition-shadow border-l-4 border-amber-500">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate">1984</h4>
                  <p className="text-xs text-gray-600 truncate">George Orwell • Distopia</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">4.6/5</span>
                  <p className="text-xs text-gray-500">328 páginas</p>
                </div>
              </div>
            </SimpleCard>
          
            <SimpleCard className="p-2 sm:p-3 hover:shadow-sm transition-shadow border-l-4 border-amber-500">
              <div className="flex justify-between">
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-medium text-xs sm:text-sm truncate">O Senhor dos Anéis</h4>
                  <p className="text-xs text-gray-600 truncate">J.R.R. Tolkien • Fantasia</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-amber-600">4.9/5</span>
                  <p className="text-xs text-gray-500">1178 páginas</p>
                </div>
              </div>
            </SimpleCard>
          </div>
        </div>
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
        </div>
        
        {/* Nova seção de métricas de desempenho */}
        <div className="mb-6">
          <ContentCard
            title="Métricas de Desempenho"
            subtitle="Monitoramento de performance do sistema"
            icon={Gauge}
            iconColor="bg-indigo-500"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Tempo de Resposta */}
              <SimpleCard className="p-3">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Tempo de Resposta
                </h4>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-100" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className="text-amber-500" 
                        strokeWidth="10" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.82)} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-800">82%</p>
                        <p className="text-xs text-gray-500">Excelente</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold text-gray-700">120ms</p>
                    <p className="text-xs text-gray-500">Média atual</p>
                  </div>
                </div>
              </SimpleCard>
              
              {/* Disponibilidade */}
              <SimpleCard className="p-3">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Disponibilidade
                </h4>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-100" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className="text-green-500" 
                        strokeWidth="10" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.9998)} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-800">99,98%</p>
                        <p className="text-xs text-gray-500">Uptime</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold text-green-700">5d 0h 0m</p>
                    <p className="text-xs text-gray-500">Sem interrupções</p>
                  </div>
                </div>
              </SimpleCard>
              
              {/* Carga do Sistema */}
              <SimpleCard className="p-3">
                <h4 className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  Carga do Sistema
                </h4>
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle 
                        className="text-gray-100" 
                        strokeWidth="10" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                      <circle 
                        className="text-blue-500" 
                        strokeWidth="10" 
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - 0.45)} 
                        strokeLinecap="round" 
                        stroke="currentColor" 
                        fill="transparent" 
                        r="40" 
                        cx="50" 
                        cy="50" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xl font-bold text-gray-800">45%</p>
                        <p className="text-xs text-gray-500">CPU</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-semibold text-gray-700">Normal</p>
                    <p className="text-xs text-gray-500">Capacidade adequada</p>
                  </div>
                </div>
              </SimpleCard>
            </div>
            
            {/* Métricas detalhadas */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Tendências de desempenho */}
              <SimpleCard className="p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Tendências de Desempenho (Últimas 24h)</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Tempo de Resposta API</span>
                      <span className="font-medium text-amber-600">120ms (↓ 5%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-amber-500 rounded-full" style={{ width: '30%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Uso de CPU</span>
                      <span className="font-medium text-blue-600">45% (↑ 10%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Uso de Memória</span>
                      <span className="font-medium text-purple-600">68% (↑ 8%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-purple-500 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-600">Tempo de Carregamento</span>
                      <span className="font-medium text-green-600">1.2s (↓ 15%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-1.5 bg-green-500 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                </div>
              </SimpleCard>
              
              {/* Status de Serviços */}
              <SimpleCard className="p-3">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">Status de Serviços</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">API Principal</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Operacional</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Banco de Dados</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Operacional</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Armazenamento</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Operacional</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-gray-700">Processamento em Lote</span>
                    </div>
                    <span className="text-xs text-amber-600 font-medium">Degradado</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700">Autenticação</span>
                    </div>
                    <span className="text-xs text-green-600 font-medium">Operacional</span>
                  </div>
                </div>
              </SimpleCard>
            </div>
          </ContentCard>
        </div>
        
        {/* Nova seção de atividades recentes */}
        <div className="mb-6">
          <ContentCard
            title="Atividades Recentes"
            subtitle="Últimas ações e eventos do sistema"
            icon={Clock}
            iconColor="bg-purple-500"
          >
            <div className="space-y-3">
              <div className="relative">
                <div className="absolute top-0 bottom-0 left-3 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center z-10 relative">
                        <UserCheck className="w-3 h-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-xs font-medium text-gray-700">Novo usuário registrado</p>
                        <p className="text-xs text-gray-500">Hoje, 10:45</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Maria Silva (maria.silva@email.com) - Colégio Saber
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center z-10 relative">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-xs font-medium text-gray-700">Backup automático concluído</p>
                        <p className="text-xs text-gray-500">Hoje, 03:00</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Backup diário do banco de dados concluído com sucesso
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center z-10 relative">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-xs font-medium text-gray-700">Alerta de uso de memória</p>
                        <p className="text-xs text-gray-500">Ontem, 18:32</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Uso de memória heap atingiu 82.1% - Monitoramento necessário
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center z-10 relative">
                        <Settings className="w-3 h-3 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-xs font-medium text-gray-700">Atualização do sistema</p>
                        <p className="text-xs text-gray-500">Ontem, 15:20</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Sistema atualizado para a versão 2.5.1 - Melhorias de segurança
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center z-10 relative">
                        <Building2 className="w-3 h-3 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                        <p className="text-xs font-medium text-gray-700">Nova instituição adicionada</p>
                        <p className="text-xs text-gray-500">2 dias atrás</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Instituto Aprender Mais (IAM) - Adicionado por admin@sistema.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-2">
                <button className="text-xs text-primary hover:text-primary-dark font-medium">
                  Ver histórico completo →
                </button>
              </div>
            </div>
          </ContentCard>
        </div>
    </div>
  );
}

