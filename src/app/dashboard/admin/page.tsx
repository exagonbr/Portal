'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  School, 
  Users, 
  GraduationCap,
  UserCheck,
  TrendingUp,
  Plus,
  Edit,
  Eye,
  Settings,
  BarChart3,
  Calendar,
  Bell
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { institutionService } from '@/services/institutionService';
import { schoolService } from '@/services/schoolService';
import { classService } from '@/services/classService';
import { School as SchoolType } from '@/types/school';
import { Class } from '@/types/class';
import { InstitutionDto, InstitutionResponseDto } from '@/types/api';

// Modal de CRUD de Instituições
import InstitutionModal from '@/components/modals/InstitutionModal';
// Modal de CRUD de Escolas
import SchoolModal from '@/components/modals/SchoolModal';
// Modal de CRUD de Turmas
import ClassModal from '@/components/modals/ClassModal';

interface DashboardStats {
  totalInstitutions: number;
  totalSchools: number;
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
  monthlyGrowth: number;
  satisfactionRate: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInstitutions: 0,
    totalSchools: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0,
    monthlyGrowth: 0,
    satisfactionRate: 0
  });

  // Estados para modais
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Dados para listagens
  const [recentInstitutions, setRecentInstitutions] = useState<InstitutionDto[]>([]);
  const [recentSchools, setRecentSchools] = useState<SchoolType[]>([]);
  const [recentClasses, setRecentClasses] = useState<Class[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar instituições
      const institutionsResponse = await institutionService.list({ limit: 5 });
      setRecentInstitutions(institutionsResponse.items || []);
      
      // Carregar escolas recentes
      const schoolsResponse = await schoolService.list({ limit: 5 });
      setRecentSchools(schoolsResponse.items || []);
      
      // Carregar turmas recentes
      const classesResponse = await classService.list({ limit: 5 });
      setRecentClasses(classesResponse.items || []);

      // Calcular estatísticas
      let totalStudents = 0;
      let totalTeachers = 0;
      let activeClasses = 0;

      // Para cada escola, buscar estatísticas
      for (const school of schoolsResponse.items || []) {
        try {
          const stats = await schoolService.getStats(school.id);
          totalStudents += stats.totalStudents;
          totalTeachers += stats.totalTeachers;
          activeClasses += stats.activeClasses;
        } catch (error) {
          console.error('Erro ao buscar stats da escola:', error);
        }
      }

      setStats({
        totalInstitutions: institutionsResponse.pagination?.total || 0,
        totalSchools: schoolsResponse.pagination?.total || 0,
        totalClasses: classesResponse.pagination?.total || 0,
        totalStudents,
        totalTeachers,
        activeClasses,
        monthlyGrowth: 12.5, // Mock - implementar cálculo real
        satisfactionRate: 87.3 // Mock - implementar pesquisa real
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditInstitution = (institution: InstitutionDto) => {
    setSelectedItem(institution);
    setShowInstitutionModal(true);
  };

  const handleEditSchool = (school: SchoolType) => {
    setSelectedItem(school);
    setShowSchoolModal(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedItem(classItem);
    setShowClassModal(true);
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
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-slate-600">
          Bem-vindo(a), {user?.name}! Gerencie todo o sistema educacional.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Building2}
          title="Instituições"
          value={stats.totalInstitutions}
          trend={`+${stats.monthlyGrowth}%`}
          color="purple"
        />
        <StatCard
          icon={School}
          title="Escolas"
          value={stats.totalSchools}
          subtitle={`${stats.activeClasses} turmas ativas`}
          color="blue"
        />
        <StatCard
          icon={GraduationCap}
          title="Alunos"
          value={stats.totalStudents}
          subtitle="Total matriculado"
          color="green"
        />
        <StatCard
          icon={UserCheck}
          title="Professores"
          value={stats.totalTeachers}
          subtitle={`${stats.satisfactionRate}% satisfação`}
          color="orange"
        />
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <QuickActionCard
          title="Nova Instituição"
          description="Cadastre uma nova instituição no sistema"
          icon={Building2}
          onClick={() => {
            setSelectedItem(null);
            setShowInstitutionModal(true);
          }}
        />
        <QuickActionCard
          title="Nova Escola"
          description="Adicione uma escola a uma instituição"
          icon={School}
          onClick={() => {
            setSelectedItem(null);
            setShowSchoolModal(true);
          }}
        />
        <QuickActionCard
          title="Nova Turma"
          description="Crie uma nova turma em uma escola"
          icon={Users}
          onClick={() => {
            setSelectedItem(null);
            setShowClassModal(true);
          }}
        />
        <QuickActionCard
          title="Demo de Modais"
          description="Teste todos os modais de CRUD criados"
          icon={Settings}
          onClick={() => {
            window.location.href = '/admin/demo-modals';
          }}
        />
        <QuickActionCard
          title="Navegação do Sistema"
          description="Mapa completo de todas as páginas"
          icon={TrendingUp}
          onClick={() => {
            window.location.href = '/admin/system-nav';
          }}
        />
      </div>

      {/* Tabelas de Dados Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Instituições Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Instituições Recentes</h2>
            <button
              onClick={() => window.location.href = '/institution/manage'}
              className="text-primary-dark hover:text-primary text-sm"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {recentInstitutions.map((institution) => (
              <div
                key={institution.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{institution.name}</p>
                  <p className="text-sm text-slate-500">{institution.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditInstitution(institution)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-slate-200 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escolas Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Escolas Recentes</h2>
            <button
              onClick={() => window.location.href = '/institution/schools'}
              className="text-primary-dark hover:text-primary text-sm"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {recentSchools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{school.name}</p>
                  <p className="text-sm text-slate-500">
                    {school.city} - {school.state}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSchool(school)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:bg-slate-200 rounded">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Crescimento Mensal
          </h3>
          <div className="h-64 flex items-center justify-center text-slate-500">
            Gráfico de crescimento (implementar com Chart.js)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Eventos Próximos
          </h3>
          <div className="space-y-3">
            <EventItem
              date="15/06"
              title="Reunião de Diretores"
              type="meeting"
            />
            <EventItem
              date="20/06"
              title="Início das Férias"
              type="holiday"
            />
            <EventItem
              date="01/07"
              title="Matrícula 2º Semestre"
              type="enrollment"
            />
          </div>
        </div>
      </div>

      {/* Modais */}
      {showInstitutionModal && (
        <InstitutionModal
          institution={selectedItem}
          onClose={() => {
            setShowInstitutionModal(false);
            setSelectedItem(null);
            loadDashboardData();
          }}
        />
      )}

      {showSchoolModal && (
        <SchoolModal
          school={selectedItem}
          onClose={() => {
            setShowSchoolModal(false);
            setSelectedItem(null);
            loadDashboardData();
          }}
        />
      )}

      {showClassModal && (
        <ClassModal
          classItem={selectedItem}
          onClose={() => {
            setShowClassModal(false);
            setSelectedItem(null);
            loadDashboardData();
          }}
        />
      )}
    </div>
  );
}

// Componente de Card de Estatística
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  subtitle?: string;
  trend?: string;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, trend, color }: StatCardProps) {
  const colorClasses = {
    purple: 'bg-primary-dark/10 text-primary-dark',
    blue: 'bg-primary/10 text-primary',
    green: 'bg-accent-green/10 text-accent-green',
    orange: 'bg-accent-orange/10 text-accent-orange'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-sm text-accent-green font-medium">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-800">
        {value.toLocaleString('pt-BR')}
      </p>
      <p className="text-sm text-slate-600">{title}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// Componente de Ação Rápida
interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  onClick: () => void;
}

function QuickActionCard({ title, description, icon: Icon, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
    >
      <div className="flex items-center mb-3">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <Plus className="w-4 h-4 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-600">{description}</p>
    </button>
  );
}

// Componente de Item de Evento
interface EventItemProps {
  date: string;
  title: string;
  type: 'meeting' | 'holiday' | 'enrollment';
}

function EventItem({ date, title, type }: EventItemProps) {
  const typeColors = {
    meeting: 'bg-primary/10 text-primary-dark',
    holiday: 'bg-accent-green/10 text-accent-green',
    enrollment: 'bg-primary-dark/10 text-primary-dark'
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center">
          <div className="text-sm font-medium text-slate-500 w-12">
          {date}
        </div>
        <div className="ml-3">
            <p className="text-sm font-medium text-slate-800">{title}</p>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[type]}`}>
        {type === 'meeting' ? 'Reunião' : type === 'holiday' ? 'Feriado' : 'Matrícula'}
      </span>
    </div>
  );
}
