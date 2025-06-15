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
  Activity,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, ROLE_COLORS } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';
import { institutionService, Institution, InstitutionQueryParams } from '@/services/institutionService';

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

export default function InstitutionManagerDashboardPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<InstitutionQueryParams>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  useEffect(() => {
    fetchInstitutions();
  }, [queryParams]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await institutionService.getInstitutions(queryParams);
      setInstitutions(response.data);
    } catch (err) {
      setError('Erro ao carregar instituições. Verifique se o backend está rodando.');
      console.error('Error fetching institutions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole={[UserRole.INSTITUTION_MANAGER]}>
        <DashboardPageLayout
          title="Painel do Gestor"
          subtitle="Gerencie sua instituição de ensino"
        >
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando...</div>
          </div>
        </DashboardPageLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole={[UserRole.INSTITUTION_MANAGER]}>
        <DashboardPageLayout
          title="Painel do Gestor"
          subtitle="Gerencie sua instituição de ensino"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div className="text-red-700">{error}</div>
            </div>
            <button 
              onClick={fetchInstitutions}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        </DashboardPageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole={[UserRole.INSTITUTION_MANAGER]}>
      <DashboardPageLayout
        title="Painel do Gestor"
        subtitle="Gerencie sua instituição de ensino"
      >
        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Total de Instituições</div>
              <div className="text-2xl font-bold text-gray-600">{institutions.length}</div>
              <div className="text-xs text-green-600 mt-2">
                {institutions.filter(i => i.active).length} ativas
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Escolas</div>
              <div className="text-2xl font-bold text-gray-600">
                {institutions.filter(i => i.type === 'SCHOOL').length}
              </div>
              <div className="text-xs text-blue-600 mt-2">Ensino básico</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Universidades</div>
              <div className="text-2xl font-bold text-gray-600">
                {institutions.filter(i => i.type === 'UNIVERSITY').length}
              </div>
              <div className="text-xs text-purple-600 mt-2">Ensino superior</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Centros Técnicos</div>
              <div className="text-2xl font-bold text-gray-600">
                {institutions.filter(i => i.type === 'TECH_CENTER').length}
              </div>
              <div className="text-xs text-orange-600 mt-2">Ensino técnico</div>
            </div>
          </div>

          {/* Lista de Instituições */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Instituições</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="w-4 h-4" />
                Nova Instituição
              </button>
            </div>
            
            {institutions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma instituição encontrada
              </div>
            ) : (
              <div className="space-y-4">
                {institutions.map((institution) => (
                  <div key={institution.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        institution.type === 'SCHOOL' ? 'bg-blue-100' :
                        institution.type === 'UNIVERSITY' ? 'bg-purple-100' :
                        institution.type === 'COLLEGE' ? 'bg-green-100' :
                        'bg-orange-100'
                      }`}>
                        <School className={`w-6 h-6 ${
                          institution.type === 'SCHOOL' ? 'text-blue-600' :
                          institution.type === 'UNIVERSITY' ? 'text-purple-600' :
                          institution.type === 'COLLEGE' ? 'text-green-600' :
                          'text-orange-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-700">{institution.name}</h3>
                        <p className="text-sm text-gray-500">
                          {institution.code} • {institution.type?.replace('_', ' ') || institution.type}
                        </p>
                        {institution.city && institution.state && (
                          <p className="text-xs text-gray-400">
                            {institution.city}, {institution.state}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        institution.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {institution.active ? 'Ativa' : 'Inativa'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">school</span>
                <span className="text-sm font-medium text-gray-700">Gerenciar Escolas</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">groups</span>
                <span className="text-sm font-medium text-gray-700">Gerenciar Turmas</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">person</span>
                <span className="text-sm font-medium text-gray-700">Gerenciar Professores</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">person_add</span>
                <span className="text-sm font-medium text-gray-700">Gerenciar Alunos</span>
              </button>
            </div>
          </div>

          {/* Visão Geral das Escolas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Visão Geral das Escolas</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">school</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Escola Central</h3>
                    <p className="text-sm text-gray-500">500 alunos • 25 professores</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Taxa de Ocupação</div>
                  <div className="text-xs text-green-600">95%</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">school</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Escola Norte</h3>
                    <p className="text-sm text-gray-500">350 alunos • 18 professores</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Taxa de Ocupação</div>
                  <div className="text-xs text-green-600">88%</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-yellow-600">school</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Escola Sul</h3>
                    <p className="text-sm text-gray-500">400 alunos • 20 professores</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Taxa de Ocupação</div>
                  <div className="text-xs text-yellow-600">75%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicadores de Desempenho */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Indicadores de Desempenho</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Taxa de Aprovação</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Taxa de Evasão</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-2">Satisfação dos Pais</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Próximos Eventos</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-700">Reunião de Diretores</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Hoje</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Reunião mensal com diretores das unidades para alinhamento estratégico.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>14:00 - 16:00</span>
                  <span>Sala de Reuniões</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-700">Inauguração Nova Unidade</h3>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">15/05</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Cerimônia de inauguração da nova unidade escolar.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>10:00 - 12:00</span>
                  <span>Nova Unidade</span>
                </div>
              </div>
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
  trend: string;
  trendUp: boolean;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, trend, trendUp, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
        </div>
        <span className={`text-sm font-medium flex items-center gap-1 ${
          trendUp ? 'text-accent-green' : 'text-gray-600'
        }`}>
          {trendUp && <TrendingUp className="w-4 h-4" />}
          {trend}
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800 dark:text-gray-800">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
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
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-600">{title}</h3>
        <Icon className={`w-5 h-5 ${color === 'primary' ? 'text-primary' : color === 'accent-green' ? 'text-accent-green' : 'text-accent-purple'}`} />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <p className="text-3xl font-bold text-gray-700 dark:text-gray-800">{value}%</p>
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
        <span className="text-gray-600 dark:text-gray-600">{label}</span>
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