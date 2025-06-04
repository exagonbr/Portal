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
  School
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_COLORS } from '@/types/roles';

interface SystemStats {
  totalInstitutions: number;
  activeInstitutions: number;
  totalUsers: number;
  activeUsers: number;
  totalSchools: number;
  systemUptime: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
}

interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  timestamp: Date;
  resolved: boolean;
}

interface InstitutionOverview {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'suspended';
  schools: number;
  users: number;
  lastActivity: Date;
  healthScore: number;
}

export default function SystemAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<SystemStats>({
    totalInstitutions: 0,
    activeInstitutions: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalSchools: 0,
    systemUptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    storageUsage: 0,
    activeConnections: 0,
    requestsPerMinute: 0,
    errorRate: 0
  });
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionOverview[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(() => {
      loadSystemMetrics();
    }, 30000);
    
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dados simulados
      setStats({
        totalInstitutions: 45,
        activeInstitutions: 42,
        totalUsers: 15234,
        activeUsers: 12890,
        totalSchools: 156,
        systemUptime: 99.98,
        cpuUsage: 45,
        memoryUsage: 62,
        storageUsage: 38,
        activeConnections: 3421,
        requestsPerMinute: 8934,
        errorRate: 0.02
      });

      setAlerts([
        {
          id: '1',
          type: 'warning',
          title: 'Alto uso de CPU',
          description: 'Servidor APP-02 está com 85% de uso de CPU',
          timestamp: new Date(),
          resolved: false
        },
        {
          id: '2',
          type: 'info',
          title: 'Backup concluído',
          description: 'Backup diário do banco de dados concluído com sucesso',
          timestamp: new Date(Date.now() - 3600000),
          resolved: true
        },
        {
          id: '3',
          type: 'critical',
          title: 'Falha na autenticação',
          description: 'Múltiplas tentativas de login falhadas detectadas',
          timestamp: new Date(Date.now() - 7200000),
          resolved: false
        }
      ]);

      setInstitutions([
        {
          id: '1',
          name: 'Rede Educacional Alpha',
          type: 'PRIVATE',
          status: 'active',
          schools: 12,
          users: 3456,
          lastActivity: new Date(),
          healthScore: 98
        },
        {
          id: '2',
          name: 'Sistema Municipal de Ensino',
          type: 'PUBLIC',
          status: 'active',
          schools: 45,
          users: 8901,
          lastActivity: new Date(Date.now() - 1800000),
          healthScore: 95
        },
        {
          id: '3',
          name: 'Instituto Beta',
          type: 'MIXED',
          status: 'suspended',
          schools: 3,
          users: 234,
          lastActivity: new Date(Date.now() - 86400000),
          healthScore: 45
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados do sistema:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    // Simular atualização de métricas em tempo real
    setStats(prev => ({
      ...prev,
      cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 10)),
      memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 5)),
      activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 100)),
      requestsPerMinute: Math.max(0, prev.requestsPerMinute + Math.floor((Math.random() - 0.5) * 500))
    }));
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

  const getStatusColor = (status: InstitutionOverview['status']) => {
    switch (status) {
      case 'active':
        return 'bg-accent-green/10 text-accent-green';
      case 'inactive':
        return 'bg-gray-100 text-gray-600';
      case 'suspended':
        return 'bg-red-100 text-red-800';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-accent-green';
    if (score >= 70) return 'text-accent-yellow';
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800 flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Painel do Administrador do Sistema
            </h1>
            <p className="text-gray-600 dark:text-gray-600 mt-2">
              Monitoramento e gestão completa da plataforma
            </p>
          </div>
          <button 
            onClick={loadSystemMetrics}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Alertas do Sistema */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.filter(a => !a.resolved).map(alert => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.type === 'critical' ? 'bg-red-50 border-red-200' :
                alert.type === 'warning' ? 'bg-accent-yellow/10 border-accent-yellow/20' :
                'bg-primary/10 border-primary/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {alert.timestamp.toLocaleString('pt-BR')}
                  </p>
                </div>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Resolver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Métricas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Server}
          title="Uptime do Sistema"
          value={`${stats.systemUptime}%`}
          subtitle="Últimos 30 dias"
          color="bg-accent-green"
        />
        <MetricCard
          icon={Cpu}
          title="Uso de CPU"
          value={`${stats.cpuUsage.toFixed(1)}%`}
          subtitle="Média dos servidores"
          color="bg-primary"
          isRealtime
        />
        <MetricCard
          icon={HardDrive}
          title="Memória"
          value={`${stats.memoryUsage.toFixed(1)}%`}
          subtitle="16GB / 32GB"
          color="bg-accent-purple"
          isRealtime
        />
        <MetricCard
          icon={Database}
          title="Armazenamento"
          value={`${stats.storageUsage}%`}
          subtitle="380GB / 1TB"
          color="bg-accent-yellow"
        />
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={Building2}
          title="Instituições"
          value={stats.totalInstitutions}
          subtitle={`${stats.activeInstitutions} ativas`}
          color="bg-primary-dark"
        />
        <StatCard
          icon={School}
          title="Escolas"
          value={stats.totalSchools}
          subtitle="Total cadastradas"
          color="bg-primary"
        />
        <StatCard
          icon={Users}
          title="Usuários"
          value={stats.totalUsers.toLocaleString('pt-BR')}
          subtitle={`${stats.activeUsers.toLocaleString('pt-BR')} ativos`}
          color="bg-accent-green"
        />
        <StatCard
          icon={Globe}
          title="Conexões"
          value={stats.activeConnections.toLocaleString('pt-BR')}
          subtitle="Usuários online"
          color="bg-accent-purple"
          isRealtime
        />
        <StatCard
          icon={Zap}
          title="Requisições"
          value={`${(stats.requestsPerMinute / 1000).toFixed(1)}k`}
          subtitle="Por minuto"
          color="bg-accent-yellow"
          isRealtime
        />
        <StatCard
          icon={AlertTriangle}
          title="Taxa de Erro"
          value={`${stats.errorRate}%`}
          subtitle="Últimas 24h"
          color="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Instituições */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2 text-primary-dark" />
              Instituições Cadastradas
            </h2>
            <div className="space-y-3">
              {institutions.map((institution) => (
                <div
                  key={institution.id}
                  className="p-4 bg-gray-50 dark:bg-gray-300 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{institution.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(institution.status)}`}>
                          {institution.status === 'active' ? 'Ativa' : 
                           institution.status === 'inactive' ? 'Inativa' : 'Suspensa'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-600">
                        <span>{institution.schools} escolas</span>
                        <span>•</span>
                        <span>{institution.users.toLocaleString('pt-BR')} usuários</span>
                        <span>•</span>
                        <span>Última atividade: {institution.lastActivity.toLocaleTimeString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${getHealthColor(institution.healthScore)}`}>
                        {institution.healthScore}%
                      </p>
                      <p className="text-xs text-gray-500">Saúde</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 text-center text-sm text-primary hover:text-primary-dark">
              Ver todas as instituições
            </button>
          </div>

          {/* Gráficos de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Uso de Recursos (24h)</h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                Gráfico de linha - CPU, Memória, Rede
              </div>
            </div>
            <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Usuários</h3>
              <div className="h-48 flex items-center justify-center text-gray-500">
                Gráfico de pizza - Por tipo de usuário
              </div>
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Ações Rápidas */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Ações do Sistema</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Nova Instituição
              </button>
              <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Gerenciar Usuários
              </button>
              <button className="w-full px-4 py-2 bg-accent-purple text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Políticas de Segurança
              </button>
              <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Configurações
              </button>
            </div>
          </div>

          {/* Logs Recentes */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Logs do Sistema</h3>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-gray-50 dark:bg-gray-300 rounded">
                <p className="font-mono text-xs">
                  [INFO] 12:15:23 - Backup iniciado
                </p>
              </div>
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <p className="font-mono text-xs text-yellow-800 dark:text-yellow-200">
                  [WARN] 12:14:15 - Alto uso de CPU detectado
                </p>
              </div>
              <div className="p-2 bg-gray-50 dark:bg-gray-300 rounded">
                <p className="font-mono text-xs">
                  [INFO] 12:10:45 - Nova instituição cadastrada
                </p>
              </div>
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <p className="font-mono text-xs text-red-800 dark:text-red-200">
                  [ERROR] 12:08:32 - Falha na autenticação
                </p>
              </div>
            </div>
            <button className="w-full mt-4 text-center text-sm text-primary hover:text-primary-dark">
              Ver todos os logs
            </button>
          </div>

          {/* Status dos Serviços */}
          <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Status dos Serviços</h3>
            <div className="space-y-3">
              <ServiceStatus name="API Principal" status="online" />
              <ServiceStatus name="Banco de Dados" status="online" />
              <ServiceStatus name="Servidor de Email" status="online" />
              <ServiceStatus name="CDN" status="degraded" />
              <ServiceStatus name="Backup Service" status="offline" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de Card de Métrica
interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  isRealtime?: boolean;
}

function MetricCard({ icon: Icon, title, value, subtitle, color, isRealtime }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {isRealtime && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Tempo real</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800 dark:text-gray-800">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
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
  isRealtime?: boolean;
}

function StatCard({ icon: Icon, title, value, subtitle, color, isRealtime }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {isRealtime && (
          <Activity className="w-3 h-3 text-accent-green animate-pulse" />
        )}
      </div>
      <p className="text-xl font-bold text-gray-700 dark:text-gray-800">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
    </div>
  );
}

// Componente de Status de Serviço
interface ServiceStatusProps {
  name: string;
  status: 'online' | 'offline' | 'degraded';
}

function ServiceStatus({ name, status }: ServiceStatusProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online': return 'bg-accent-green';
      case 'degraded': return 'bg-accent-yellow';
      case 'offline': return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return 'Online';
      case 'degraded': return 'Degradado';
      case 'offline': return 'Offline';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{name}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`}></div>
        <span className="text-xs text-gray-500">{getStatusText()}</span>
      </div>
    </div>
  );
}