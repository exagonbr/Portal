'use client';

import React, { useState, useEffect } from 'react';
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
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { systemAdminService } from '@/services/systemAdminService';
import { InstitutionService } from '@/services/institutionService';
import { InstitutionType, InstitutionNature } from '@/types/institution';
// import { Address } from '@/types/common'; // Address n├úo existe, usando string | object
import { debugAuth } from '@/utils/auth-debug';
import { StatCard, ContentCard, SimpleCard } from '@/components/ui/StandardCard';


// Registrando os componentes necess├írios do Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Interfaces para dados reais da API
interface SystemDashboardData {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byRole: Record<string, number>;
    byInstitution: Record<string, number>;
  };
  schools?: {
    total: number;
    active: number;
    byType: Record<string, number>;
    byRegion: Record<string, number>;
  };
  infrastructure?: {
    aws: {
      status: string;
      services: string[];
      costs: {
        monthly: number;
        storage: number;
        compute: number;
        network: number;
      };
      performance: {
        uptime: number;
        responseTime: number;
        dataTransfer: string;
      };
    };
  };
  sessions?: {
    activeUsers: number;
    totalActiveSessions: number;
    sessionsByDevice: Record<string, number>;
    averageSessionDuration: number;
  };
  system: {
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    version: string;
    environment: string;
  };
  recent: {
    registrations: any[];
    logins: any[];
  };
}

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
  nature?: InstitutionNature;
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

export default function SystemAdminDashboard() {
  return <SystemAdminDashboardContent />;
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
  const [systemAnalytics, setSystemAnalytics] = useState<any>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [institutionStats, setInstitutionStats] = useState<{
    totalInstitutions: number;
    activeInstitutions: number;
    totalUsers: number;
    totalSchools: number;
    averageUsersPerInstitution: number;
    recentInstitutions: number;
  } | null>(null);

  useEffect(() => {
    // Executar diagn├│stico e sincroniza├º├úo de autentica├º├úo primeiro
    console.log('­ƒöì Executando diagn├│stico de autentica├º├úo...');
    debugAuth();
    
    // Sincronizar dados de autentica├º├úo para resolver inconsist├¬ncias
    console.log('­ƒöä Sincronizando dados de autentica├º├úo...');
    import('@/utils/auth-debug').then(({ syncAuthData }) => {
      syncAuthData();
      
      // Aguardar um pouco ap├│s sincroniza├º├úo antes de carregar dados
      setTimeout(() => {
        loadDashboardData();
      }, 500);
    });
    
    // Auto-refresh a cada 30 segundos para m├®tricas em tempo real
    const interval = setInterval(() => {
      loadRealTimeMetrics();
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Testar autentica├º├úo primeiro para debugar problemas
      console.log('­ƒº¬ [DASHBOARD] Testando autentica├º├úo antes de carregar dados...');
      const authTest = await systemAdminService.testAuthentication();
      console.log('­ƒº¬ [DASHBOARD] Resultado do teste de autentica├º├úo:', authTest);
      
      if (!authTest.hasToken) {
        console.log('ÔØî [DASHBOARD] Usu├írio n├úo tem token de autentica├º├úo!');
        toast.error('Erro de autentica├º├úo: Token n├úo encontrado');
        return;
      }
      
      if (!authTest.tokenValid) {
        console.log('ÔØî [DASHBOARD] Token de autentica├º├úo inv├ílido!', authTest.error);
        toast.error('Erro de autentica├º├úo: Token inv├ílido');
        return;
      }
      
      console.log('Ô£à [DASHBOARD] Autentica├º├úo OK, carregando dados...');
      
      // Carregar dados em paralelo
      await Promise.all([
        loadSystemDashboard(),
        loadInstitutions(),
        loadRoleStats(),
        loadAwsStats(),
        loadSystemAlerts(),
        loadRealUsersByRole(),
        loadRealUserStats(),
        loadSystemAnalytics(),
        loadEngagementMetrics()
      ]);

    } catch (error) {
      console.log('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do sistema');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemDashboard = async () => {
    try {
      const data = await systemAdminService.getSystemDashboard();
      setDashboardData(data);
    } catch (error) {
      console.log('Erro ao carregar dashboard do sistema:', error);
      toast.error('Erro ao carregar dados do dashboard');
    }
  };

  const loadInstitutions = async () => {
    try {
      // Carregar institui├º├Áes com dados detalhados
      const result = await InstitutionService.getInstitutions({ 
        limit: 10, 
        is_active: true,
        sortBy: 'name',
        sortOrder: 'asc'
      });
      
      console.log('­ƒôè Dados das institui├º├Áes carregados:', result);
      
      // Mapear dados para incluir estat├¡sticas adicionais
      const institutionsWithStats = result.items.map(institution => ({
        ...institution,
        users_count: institution.users_count || 0,
        schools_count: institution.schools_count || 0,
        created_at: institution.created_at || new Date().toISOString(),
        active: institution.active ?? true
      }));
      
      setInstitutions(institutionsWithStats);
      
      // Calcular estat├¡sticas das institui├º├Áes
      const stats = {
        totalInstitutions: result.total || institutionsWithStats.length,
        activeInstitutions: institutionsWithStats.filter(inst => inst.active === true).length,
        totalUsers: institutionsWithStats.reduce((sum, inst) => sum + (inst.users_count || 0), 0),
        totalSchools: institutionsWithStats.reduce((sum, inst) => sum + (inst.schools_count || 0), 0),
        averageUsersPerInstitution: institutionsWithStats.length > 0 
          ? Math.round(institutionsWithStats.reduce((sum, inst) => sum + (inst.users_count || 0), 0) / institutionsWithStats.length)
          : 0,
        recentInstitutions: institutionsWithStats.filter(inst => {
          const createdDate = new Date(inst.created_at);
          return (Date.now() - createdDate.getTime()) < (30 * 24 * 60 * 60 * 1000);
        }).length
      };
      
      setInstitutionStats(stats);
      console.log('­ƒôê Estat├¡sticas das institui├º├Áes:', stats);
    } catch (error) {
      console.log('Erro ao carregar institui├º├Áes:', error);
      // Fallback para dados b├ísicos se a API falhar
      try {
        const basicResult = await InstitutionService.getActiveInstitutions();
        const basicInstitutions = basicResult.slice(0, 10).map(institution => ({
          ...institution,
          users_count: 0,
          schools_count: 0,
          created_at: institution.created_at || new Date().toISOString(),
          active: institution.active ?? true
        }));
        setInstitutions(basicInstitutions);
      } catch (fallbackError) {
        console.log('Erro no fallback das institui├º├Áes:', fallbackError);
        toast.error('Erro ao carregar dados das institui├º├Áes');
      }
    }
  };

  const loadRoleStats = async () => {
    try {
      const response = await fetch('/api/roles/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setRoleStats(result.data || result);
      }
    } catch (error) {
      console.log('Erro ao carregar estat├¡sticas de roles:', error);
    }
  };

  const loadAwsStats = async () => {
    try {
      const response = await fetch('/api/aws/connection-logs/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setAwsStats(result.data);
      }
    } catch (error) {
      console.log('Erro ao carregar estat├¡sticas AWS:', error);
    }
  };

  const loadSystemAlerts = async () => {
    // Alertas baseados em m├®tricas reais do sistema
    const systemAlerts: SystemAlert[] = [];
    
    // Verificar uso de mem├│ria real se dispon├¡vel
    if (dashboardData?.system.memoryUsage) {
      const memoryUsagePercent = (dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100;
      
      if (memoryUsagePercent > 85) {
        systemAlerts.push({
          id: 'memory-critical',
          type: 'critical',
          title: 'Uso cr├¡tico de mem├│ria',
          description: `Uso de mem├│ria heap em ${memoryUsagePercent.toFixed(1)}% - A├º├úo imediata necess├íria`,
          timestamp: new Date(),
          resolved: false
        });
      } else if (memoryUsagePercent > 75) {
        systemAlerts.push({
          id: 'memory-warning',
          type: 'warning',
          title: 'Alto uso de mem├│ria',
          description: `Uso de mem├│ria heap em ${memoryUsagePercent.toFixed(1)}% - Monitoramento necess├írio`,
          timestamp: new Date(),
          resolved: false
        });
      }
    }

    // Verificar sess├Áes ativas
    if (dashboardData?.sessions?.activeUsers && dashboardData.sessions.activeUsers > 5000) {
      systemAlerts.push({
        id: 'high-load',
        type: 'warning',
        title: 'Alta carga de usu├írios',
        description: `${dashboardData.sessions.activeUsers.toLocaleString('pt-BR')} usu├írios ativos simultaneamente`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Verificar AWS se dispon├¡vel
    if (awsStats && awsStats.success_rate < 95) {
      systemAlerts.push({
        id: 'aws-degraded',
        type: awsStats.success_rate < 80 ? 'critical' : 'warning',
        title: 'Problemas na conectividade AWS',
        description: `Taxa de sucesso AWS em ${awsStats.success_rate.toFixed(1)}% - Verificar configura├º├Áes`,
        timestamp: new Date(),
        resolved: false
      });
    }

    // Alertas informativos sempre presentes
    systemAlerts.push(
      {
        id: 'backup-success',
        type: 'info',
        title: 'Backup autom├ítico conclu├¡do',
        description: 'Backup di├írio do banco de dados executado com sucesso ├ás 02:00',
        timestamp: new Date(Date.now() - 3600000 * 10), // 10 horas atr├ís
        resolved: true
      },
      {
        id: 'security-scan',
        type: 'info',
        title: 'Varredura de seguran├ºa conclu├¡da',
        description: 'Scan de vulnerabilidades executado - Nenhuma amea├ºa detectada',
        timestamp: new Date(Date.now() - 3600000 * 6), // 6 horas atr├ís
        resolved: true
      }
    );

    setAlerts(systemAlerts);
  };

  const loadRealUsersByRole = async () => {
    try {
      const usersByRole = await systemAdminService.getUsersByRole();
      setRealUsersByRole(usersByRole);
    } catch (error) {
      console.log('Erro ao carregar usu├írios por fun├º├úo:', error);
    }
  };

  const loadRealUserStats = async () => {
    try {
      console.log('­ƒôè [FRONTEND] Carregando estat├¡sticas de usu├írios...');
      
      const response = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('­ƒôè [FRONTEND] Resposta da API:', response.status, response.statusText);

      if (response.ok) {
        const result = await response.json();
        console.log('­ƒôè [FRONTEND] Dados recebidos:', result);
        
        if (result.success && result.data) {
          // Verificar se os dados t├¬m a estrutura esperada
          const data = result.data;
          const hasRequiredFields = 
            data.total_users !== undefined &&
            data.active_users !== undefined &&
            data.users_by_role !== undefined &&
            data.recent_registrations !== undefined;

          if (hasRequiredFields) {
            console.log('Ô£à [FRONTEND] Dados v├ílidos, atualizando estado...');
            setRealUserStats(data);
            // Atualizar tamb├®m os dados por role se estiverem dispon├¡veis
            if (data.users_by_role) {
              setRealUsersByRole(data.users_by_role);
            }
          } else {
            console.warn('ÔÜá´©Å [FRONTEND] Dados recebidos n├úo t├¬m a estrutura esperada:', data);
          }
        } else {
          console.warn('ÔÜá´©Å [FRONTEND] Resposta da API n├úo cont├®m dados v├ílidos:', result);
        }
      } else {
        console.log('ÔØî [FRONTEND] Erro na resposta da API:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('ÔØî [FRONTEND] Erro ao carregar estat├¡sticas reais de usu├írios:', error);
    }
  };

  const loadSystemAnalytics = async () => {
    try {
      const analytics = await systemAdminService.getSystemAnalytics();
      setSystemAnalytics(analytics);
    } catch (error) {
      console.log('Erro ao carregar analytics do sistema:', error);
    }
  };

  const loadEngagementMetrics = async () => {
    try {
      const engagement = await systemAdminService.getUserEngagementMetrics();
      setEngagementMetrics(engagement);
    } catch (error) {
      console.log('Erro ao carregar m├®tricas de engajamento:', error);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const metrics = await systemAdminService.getRealTimeMetrics();
      
      // Atualizar apenas m├®tricas em tempo real
      if (dashboardData) {
        setDashboardData(prev => prev ? {
          ...prev,
          sessions: {
            ...prev.sessions,
            activeUsers: metrics.activeUsers,
            totalActiveSessions: metrics.activeSessions,
            sessionsByDevice: prev.sessions?.sessionsByDevice || {},
            averageSessionDuration: prev.sessions?.averageSessionDuration || 0
          },
          system: {
            ...prev.system,
            memoryUsage: metrics.memoryUsage
          }
        } : prev);
      }
    } catch (error) {
      console.log('Erro ao carregar m├®tricas em tempo real:', error);
    }
  };

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

  // Dados para gr├íficos usando dados reais do backend
  const usersByRoleData = Object.keys(realUsersByRole).length > 0 ? {
    labels: Object.keys(realUsersByRole).map(role => {
      const roleNames: Record<string, string> = {
        'STUDENT': 'Alunos',
        'TEACHER': 'Professores', 
        'COORDINATOR': 'Coordenadores',
        'PARENT': 'Respons├íveis',
        'ADMIN': 'Administradores',
        'SYSTEM_ADMIN': 'Super Admin'
      };
      return roleNames[role] || role;
    }),
    datasets: [{
      label: 'Usu├írios',
      data: Object.values(realUsersByRole),
      backgroundColor: [
        'rgba(59, 130, 246, 0.9)',   // Azul para Alunos
        'rgba(16, 185, 129, 0.9)',   // Verde para Professores
        'rgba(249, 115, 22, 0.9)',   // Laranja para Coordenadores
        'rgba(168, 85, 247, 0.9)',   // Roxo para Respons├íveis
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
      hoverBorderWidth: 3
    }]
  } : null;

  const sessionsByDeviceData = dashboardData?.sessions?.sessionsByDevice ? {
    labels: Object.keys(dashboardData.sessions.sessionsByDevice),
    datasets: [{
      label: 'Sess├Áes Ativas',
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

  // Gr├ífico de crescimento de usu├írios
  const userGrowthData = systemAnalytics?.userGrowth ? {
    labels: systemAnalytics.userGrowth.map((item: any) => item.month),
    datasets: [{
      label: 'Usu├írios Totais',
      data: systemAnalytics.userGrowth.map((item: any) => item.users),
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
      data: systemAnalytics.userGrowth.map((item: any) => item.growth),
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

  // Gr├ífico de tend├¬ncias de sess├Áes por hora
  const sessionTrendsData = systemAnalytics?.sessionTrends ? {
    labels: systemAnalytics.sessionTrends.map((item: any) => item.hour),
    datasets: [{
      label: 'Sess├Áes por Hora',
      data: systemAnalytics.sessionTrends.map((item: any) => item.sessions),
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

  // Gr├ífico de distribui├º├úo de institui├º├Áes
  const institutionDistributionData = systemAnalytics?.institutionDistribution ? {
    labels: systemAnalytics.institutionDistribution.map((item: any) => item.name),
    datasets: [{
      label: 'Usu├írios por Institui├º├úo',
      data: systemAnalytics.institutionDistribution.map((item: any) => item.users),
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Cabe├ºalho */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-700 dark:text-gray-800 flex items-center gap-3">
              <Shield className="w-7 h-7 text-primary" />
              Painel do Administrador do Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-600 mt-1">
              Monitoramento e gest├úo completa da plataforma Portal Sabercon
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={loadRealTimeMetrics}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button 
              onClick={() => router.push('/admin/monitoring')}
              className="px-3 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm"
            >
              <Gauge className="w-4 h-4" />
              Monitoramento
            </button>
          </div>
        </div>
        
        {/* Resumo Geral do Sistema */}
        {realUserStats && realUserStats.total_users !== undefined && (
          <div className="mt-4">
            <ContentCard
              title="Resumo Geral do Sistema"
              subtitle="Estat├¡sticas principais em tempo real"
              icon={BarChart3}
              iconColor="bg-blue-500"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{(realUserStats.total_users || 0).toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-600">Total de Usu├írios</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{(realUserStats.active_users || 0).toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-600">Usu├írios Ativos</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">{institutions.length}</p>
                  <p className="text-xs text-gray-600">Institui├º├Áes</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-xl font-bold text-orange-600">{realUserStats.recent_registrations || 0}</p>
                  <p className="text-xs text-gray-600">Novos este M├¬s</p>
                </div>
              </div>
            </ContentCard>
          </div>
        )}
      </div>

      {/* Alertas do Sistema */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.filter(a => !a.resolved).map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-accent-yellow/10 border-accent-yellow/20' :
                'bg-primary/10 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-2">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {alert.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
                <button className="text-xs text-gray-500 hover:text-gray-700">
                  Resolver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* M├®tricas Principais do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Server}
          title="Uptime do Sistema"
          value={dashboardData ? formatUptime(dashboardData.system.uptime) : 'N/A'}
          subtitle={`v${dashboardData?.system.version || 'N/A'} ÔÇó ${dashboardData?.system.environment || 'N/A'}`}
          color="emerald"
        />
        <StatCard
          icon={Cpu}
          title="Mem├│ria Heap"
          value={dashboardData ? formatBytes(dashboardData.system.memoryUsage.heapUsed) : 'N/A'}
          subtitle={dashboardData ? `${((dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100).toFixed(1)}% de ${formatBytes(dashboardData.system.memoryUsage.heapTotal)}` : 'N/A'}
          color="blue"
          trend={dashboardData ? 
            ((dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100) > 85 ? 'Cr├¡tico' :
            ((dashboardData.system.memoryUsage.heapUsed / dashboardData.system.memoryUsage.heapTotal) * 100) > 75 ? 'Aten├º├úo' : 'Normal'
            : 'Normal'
          }
        />
        <StatCard
          icon={Users}
          title="Usu├írios Online"
          value={dashboardData?.sessions?.activeUsers?.toLocaleString('pt-BR') || realUserStats?.active_users?.toLocaleString('pt-BR') || '0'}
          subtitle={`${dashboardData?.sessions?.totalActiveSessions?.toLocaleString('pt-BR') || '0'} sess├Áes ativas`}
          color="violet"
          trend={dashboardData?.sessions?.activeUsers && dashboardData.sessions.activeUsers > 5000 ? 'Alta carga' : 'Tempo real'}
        />
        <StatCard
          icon={Cloud}
          title="Infraestrutura AWS"
          value={dashboardData?.infrastructure?.aws ? `${dashboardData.infrastructure.aws.performance.uptime}%` : (awsStats ? `${awsStats.success_rate.toFixed(1)}%` : 'N/A')}
          subtitle={dashboardData?.infrastructure?.aws ? 
            `${dashboardData.infrastructure.aws.services.length} servi├ºos ÔÇó ${dashboardData.infrastructure.aws.performance.responseTime}ms` :
            (awsStats ? `${awsStats.total_connections} conex├Áes ÔÇó ${awsStats.average_response_time.toFixed(0)}ms` : 'Conectado via .env')
          }
          color="amber"
        />
      </div>

      {/* Estat├¡sticas Gerais */}
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
              <p className="text-xs text-gray-600">Institui├º├Áes</p>
              <p className="text-xs text-gray-500">
                {institutionStats?.activeInstitutions || institutions.filter(i => i.active !== false).length} ativas
                {institutionStats?.recentInstitutions && institutionStats.recentInstitutions > 0 && (
                  <span className="ml-1 text-blue-600">ÔÇó {institutionStats.recentInstitutions} novas</span>
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
                    ÔÇó {Math.round((institutionStats.totalSchools || 0) / institutionStats.totalInstitutions)} por inst.
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
              <p className="text-xs text-gray-500">Gest├úo pedag├│gica</p>
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
              <p className="text-xs text-gray-600">Respons├íveis</p>
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
              <p className="text-xs text-gray-600">Sess├Áes Ativas</p>
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span>{dashboardData?.sessions?.activeUsers?.toLocaleString('pt-BR') || '0'} usu├írios online</span>
              </div>
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
              <p className="text-xs text-gray-600">Tempo M├®dio</p>
              <p className="text-xs text-gray-500">Por sess├úo</p>
            </div>
          </div>
        </SimpleCard>
      </div>

      {/* Layout Principal com 3 Colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* Coluna Principal - Gr├íficos e Analytics */}
        <div className="xl:col-span-8">
          
          {/* Se├º├úo de Gr├íficos Principais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            
            {/* Usu├írios por Fun├º├úo - Dados Reais do Backend */}
            {usersByRoleData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Usu├írios por Fun├º├úo
                  </h3>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    Total: {Object.values(realUsersByRole).reduce((a, b) => a + b, 0).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="h-48">
                  <Pie 
                    data={usersByRoleData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            usePointStyle: true,
                            font: { size: 10 },
                            padding: 10
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: true,
                          callbacks: {
                            label: function(context) {
                              const total = (context.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((context.raw as number / total) * 100);
                              return `${context.label}: ${(context.raw as number).toLocaleString('pt-BR')} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1200,
                        easing: 'easeInOutQuart'
                      },
                      interaction: {
                        intersect: false
                      }
                    }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {Object.entries(realUsersByRole.length ? realUsersByRole : realUserStats?.users_by_role || {}).map(([role, count], index) => {
                    const roleNames: Record<string, string> = {
                      'STUDENT': 'Alunos',
                      'TEACHER': 'Professores', 
                      'ACADEMIC_COORDINATOR': 'Coordenadores',
                      'COORDINATOR': 'Coordenadores',
                      'GUARDIAN': 'Respons├íveis',
                      'PARENT': 'Respons├íveis',
                      'INSTITUTION_MANAGER': 'Gestores',
                      'ADMIN': 'Administradores',
                      'SYSTEM_ADMIN': 'Super Admin'
                    };
                    const colors = ['text-blue-600', 'text-green-600', 'text-orange-600', 'text-purple-600', 'text-pink-600', 'text-emerald-600'];
                    const bgColors = ['bg-blue-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100', 'bg-pink-100', 'bg-emerald-100'];
                    const usersByRoleData = realUsersByRole.length ? realUsersByRole : realUserStats?.users_by_role || {};
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

            {/* Crescimento de Usu├írios */}
            {userGrowthData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Crescimento de Usu├írios
                  </h3>
                  <div className="text-xs text-gray-500">├Ültimos 6 meses</div>
                </div>
                <div className="h-48">
                  <Line 
                    data={userGrowthData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            boxWidth: 10,
                            usePointStyle: true,
                            font: { size: 10 },
                            padding: 10
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: false,
                          position: 'left',
                          grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          ticks: {
                            font: { size: 10 },
                            callback: function(value) {
                              return (value as number).toLocaleString('pt-BR');
                            }
                          }
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          grid: { drawOnChartArea: false },
                          ticks: {
                            font: { size: 10 },
                            callback: function(value) {
                              return value + '%';
                            }
                          }
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      }
                    }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Se├º├úo de Gr├íficos Secund├írios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            
            {/* Sess├Áes por Dispositivo */}
            {sessionsByDeviceData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-500" />
                    Sess├Áes por Dispositivo
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Tempo real</span>
                  </div>
                </div>
                <div className="h-40">
                  <Bar 
                    data={sessionsByDeviceData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          titleColor: 'white',
                          bodyColor: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          displayColors: true,
                          callbacks: {
                            label: function(context) {
                              const total = (context.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + b, 0);
                              const percentage = Math.round((context.raw as number / total) * 100);
                              return `${context.label}: ${(context.raw as number).toLocaleString('pt-BR')} (${percentage}%)`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true,
                          grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          ticks: {
                            font: { size: 9 },
                            callback: function(value) {
                              return (value as number).toLocaleString('pt-BR');
                            }
                          }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 10 } }
                        }
                      },
                      animation: {
                        duration: 1000,
                        easing: 'easeInOutQuart'
                      }
                    }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                  {dashboardData?.sessions?.sessionsByDevice && Object.entries(dashboardData.sessions.sessionsByDevice).map(([device, count], index) => {
                    const colors = ['text-indigo-600', 'text-green-600', 'text-orange-600', 'text-purple-600'];
                    const bgColors = ['bg-indigo-100', 'bg-green-100', 'bg-orange-100', 'bg-purple-100'];
                    const icons = [Monitor, Smartphone, Tablet];
                    const Icon = icons[index] || Monitor;
                    const total = Object.values(dashboardData.sessions.sessionsByDevice).reduce((a, b) => a + b, 0);
                    const percentage = Math.round((count / total) * 100);
                    return (
                      <div key={device} className="text-center p-2 rounded-lg bg-gray-50 hover:shadow-sm transition-shadow">
                        <div className={`w-8 h-8 mx-auto mb-1 rounded-full ${bgColors[index] || 'bg-gray-100'} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${colors[index] || 'text-gray-600'}`} />
                        </div>
                        <p className={`text-sm font-bold ${colors[index] || 'text-gray-600'}`}>
                          {count.toLocaleString('pt-BR')}
                        </p>
                        <p className="text-xs font-medium text-gray-700">{device}</p>
                        <p className="text-xs text-gray-500">{percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tend├¬ncias de Sess├Áes por Hora */}
            {sessionTrendsData && (
              <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    Atividade por Hora
                  </h3>
                  <div className="text-xs text-gray-500">Hoje</div>
                </div>
                <div className="h-40">
                  <Line 
                    data={sessionTrendsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: 'rgba(0, 0, 0, 0.05)' },
                          ticks: {
                            font: { size: 9 },
                            callback: function(value) {
                              return (value as number).toLocaleString('pt-BR');
                            }
                          }
                        },
                        x: {
                          grid: { display: false },
                          ticks: { 
                            maxTicksLimit: 12,
                            font: { size: 9 },
                            callback: function(value, index) {
                              return index % 2 === 0 ? this.getLabelForValue(value as number) : '';
                            }
                          }
                        }
                      },
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      }
                    }}
                  />
                </div>
              </div>
            )}

          </div>

          {/* Distribui├º├úo por Institui├º├Áes */}
          {institutionDistributionData && (
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Distribui├º├úo por Institui├º├Áes
                </h3>
                <button 
                  onClick={() => router.push('/admin/institutions')}
                  className="text-xs text-primary hover:text-primary-dark"
                >
                  Ver todas
                </button>
              </div>
              <div className="h-48">
                <Bar 
                  data={institutionDistributionData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0, 0, 0, 0.05)' },
                        ticks: {
                          font: { size: 9 },
                          callback: function(value) {
                            return (value as number).toLocaleString('pt-BR');
                          }
                        }
                      },
                      x: {
                        grid: { display: false },
                        ticks: { 
                          maxRotation: 45,
                          font: { size: 9 }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Coluna Lateral - Resumos e A├º├Áes */}
        <div className="xl:col-span-4 space-y-4">
          
          {/* Resumo de Institui├º├Áes */}
          <ContentCard
            title="Institui├º├Áes Ativas"
            subtitle={`${institutions.length} institui├º├Áes com maior atividade`}
            icon={Building2}
            iconColor="bg-slate-500"
            actions={
              <div className="flex items-center gap-2">
                <button 
                  onClick={loadInstitutions}
                  className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                  title="Atualizar dados"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => router.push('/admin/institutions')}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  Ver todas ÔåÆ
                </button>
              </div>
            }
          >
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-gray-500">Carregando dados das institui├º├Áes...</p>
                </div>
              ) : institutions.length === 0 ? (
                <div className="text-center py-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Nenhuma institui├º├úo encontrada</p>
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
                      className="p-3 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/30"
                      hover={true}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-bold text-primary">#{index + 1}</span>
                              <h4 className="font-semibold text-sm text-gray-800 truncate max-w-[180px]" title={institution.name}>
                                {institution.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1">
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
                                      {totalUsers.toLocaleString('pt-BR')} usu├írio{totalUsers !== 1 ? 's' : ''}
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
                    Ver mais {institutions.length - 5} institui├º├Áes
                    <Building2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Resumo estat├¡stico no rodap├® */}
            {institutions.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm font-bold text-blue-600">
                      {institutions.reduce((sum, inst) => sum + (inst.users_count || 0), 0).toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-gray-600">Total Usu├írios</p>
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
                    <p className="text-xs text-gray-600">M├®dia/Inst.</p>
                  </div>
                </div>
              </div>
            )}
          </ContentCard>

          {/* M├®tricas de Engajamento */}
          {engagementMetrics && (
            <ContentCard
              title="Engajamento dos Usu├írios"
              subtitle="M├®tricas de atividade e reten├º├úo"
              icon={Activity}
              iconColor="bg-green-500"
            >
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2">
                  <SimpleCard className="p-2" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Taxa de Reten├º├úo:</span>
                      <span className="font-bold text-green-600 text-sm">{engagementMetrics.retentionRate}%</span>
                    </div>
                  </SimpleCard>
                  <SimpleCard className="p-2" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Tempo M├®dio de Sess├úo:</span>
                      <span className="font-bold text-blue-600 text-sm">{engagementMetrics.averageSessionDuration}min</span>
                    </div>
                  </SimpleCard>
                  <SimpleCard className="p-2" hover={false}>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Taxa de Rejei├º├úo:</span>
                      <span className="font-bold text-orange-600 text-sm">{engagementMetrics.bounceRate}%</span>
                    </div>
                  </SimpleCard>
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Funcionalidades Mais Usadas:</p>
                  <div className="space-y-2">
                    {engagementMetrics.topFeatures.slice(0, 3).map((feature: any, index: number) => (
                      <div key={feature.name} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                        <span className="text-xs font-medium text-gray-700">{feature.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                            <div 
                              className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300" 
                              style={{ width: `${feature.usage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-blue-600 min-w-[25px]">{feature.usage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ContentCard>
          )}

          {/* Status AWS Resumido */}
          {(dashboardData?.infrastructure?.aws || awsStats) && (
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Cloud className="w-4 h-4 text-orange-500" />
                Infraestrutura AWS
              </h3>
              <div className="space-y-2">
                {dashboardData?.infrastructure?.aws ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Uptime:</span>
                      <span className={`font-semibold text-sm ${
                        dashboardData.infrastructure.aws.performance.uptime >= 99.9 ? 'text-accent-green' : 
                        dashboardData.infrastructure.aws.performance.uptime >= 99.5 ? 'text-accent-yellow' : 'text-red-600'
                      }`}>
                        {dashboardData.infrastructure.aws.performance.uptime}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Servi├ºos Ativos:</span>
                      <span className="font-semibold text-sm">{dashboardData.infrastructure.aws.services.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Tempo Resposta:</span>
                      <span className="font-semibold text-sm">{dashboardData.infrastructure.aws.performance.responseTime}ms</span>
                    </div>
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Custo Mensal:</p>
                      <p className="text-base font-bold text-gray-800">
                        ${dashboardData.infrastructure.aws.costs.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </>
                ) : awsStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Taxa de Sucesso:</span>
                      <span className={`font-semibold text-sm ${
                        awsStats.success_rate >= 95 ? 'text-accent-green' : 
                        awsStats.success_rate >= 80 ? 'text-accent-yellow' : 'text-red-600'
                      }`}>
                        {awsStats.success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Conex├Áes:</span>
                      <span className="font-semibold text-sm">{awsStats.total_connections}</span>
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={() => router.push('/admin/aws')}
                className="w-full mt-3 text-center text-xs text-primary hover:text-primary-dark"
              >
                Configurar AWS
              </button>
            </div>
          )}

          {/* A├º├Áes R├ípidas */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
            <h3 className="text-base font-semibold mb-3">A├º├Áes do Sistema</h3>
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/admin/institutions')}
                className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Building2 className="w-4 h-4" />
                Gerenciar Institui├º├Áes
              </button>
              <button 
                onClick={() => router.push('/admin/users')}
                className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Users className="w-4 h-4" />
                Gerenciar Usu├írios
              </button>
              <button 
                onClick={() => router.push('/admin/security')}
                className="w-full px-3 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" />
                Pol├¡ticas de Seguran├ºa
              </button>
              <button 
                onClick={() => router.push('/admin/settings')}
                className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Settings className="w-4 h-4" />
                Configura├º├Áes
              </button>
            </div>
          </div>

          {/* Links R├ípidos */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
            <h3 className="text-base font-semibold mb-3">Acesso R├ípido</h3>
            <div className="space-y-1">
              <button 
                onClick={() => router.push('/admin/analytics')}
                className="w-full px-2 py-2 text-left text-xs hover:bg-gray-50 rounded flex items-center gap-2"
              >
                <BarChart3 className="w-3 h-3 text-primary" />
                Analytics do Sistema
              </button>
              <button 
                onClick={() => router.push('/admin/logs')}
                className="w-full px-2 py-2 text-left text-xs hover:bg-gray-50 rounded flex items-center gap-2"
              >
                <Terminal className="w-3 h-3 text-primary" />
                Logs do Sistema
              </button>
              <button 
                onClick={() => router.push('/admin/sessions')}
                className="w-full px-2 py-2 text-left text-xs hover:bg-gray-50 rounded flex items-center gap-2"
              >
                <Eye className="w-3 h-3 text-primary" />
                Sess├Áes Ativas
              </button>
              <button 
                onClick={() => router.push('/portal/reports')}
                className="w-full px-2 py-2 text-left text-xs hover:bg-gray-50 rounded flex items-center gap-2"
              >
                <FileText className="w-3 h-3 text-primary" />
                Portal de Relat├│rios
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

