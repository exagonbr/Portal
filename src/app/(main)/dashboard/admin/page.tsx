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
import { StatCard, ContentCard } from '@/components/ui/StandardCard';
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
      const institutionsResponse = await institutionService.getInstitutions({ limit: 5 });
      setRecentInstitutions(institutionsResponse.items || []);
      
      // Carregar escolas recentes
      const schoolsResponse = await schoolService.list({ limit: 5 });
      setRecentSchools((schoolsResponse.items || []) as any);
      
      // Carregar turmas recentes
      const classesResponse = await classService.list({ limit: 5 });
      setRecentClasses((classesResponse.items || []) as any);

      // Calcular estatísticas
      let totalStudents = 0;
      let totalTeachers = 0;
      let activeClasses = 0;

      // TODO: Implementar cálculo real de estatísticas quando getStats estiver disponível
      // for (const school of schoolsResponse.items || []) {
      //   try {
      //     const stats = await schoolService.getStats(school.id);
      //     totalStudents += stats.totalStudents;
      //     totalTeachers += stats.totalTeachers;
      //     activeClasses += stats.activeClasses;
      //   } catch (error) {
      //     console.warn(`Erro ao carregar estatísticas da escola ${school.id}:`, error);
      //   }
      // }
      
      // Valores mock temporários
      totalStudents = Math.floor(Math.random() * 1000) + 500;
      totalTeachers = Math.floor(Math.random() * 100) + 50;
      activeClasses = Math.floor(Math.random() * 50) + 20;

      setStats({
        totalInstitutions: (institutionsResponse as any).pagination?.total || (institutionsResponse as any).total || 0,
        totalSchools: (schoolsResponse as any).total || (schoolsResponse as any).pagination?.total || 0,
        totalClasses: (classesResponse as any).total || (classesResponse as any).pagination?.total || 0,
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
    <div className="p-3 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-800 mb-1">
          Painel Administrativo
        </h1>
        <p className="text-slate-600 text-sm">
          Bem-vindo(a), {user?.name}! Gerencie todo o sistema educacional.
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          icon={Building2}
          title="Instituições"
          value={stats.totalInstitutions}
          subtitle="Total registradas"
          color="blue"
        />

        <StatCard
          icon={Users}
          title="Usuários"
          value={stats.totalStudents + stats.totalTeachers}
          subtitle="Total no sistema"
          color="green"
        />

        <StatCard
          icon={GraduationCap}
          title="Turmas"
          value={stats.totalClasses}
          subtitle="Ativas no sistema"
          color="purple"
        />

        <StatCard
          icon={BarChart3}
          title="Relatórios"
          value={0}
          subtitle="Gerados hoje"
          color="amber"
        />
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-4">
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
          title="Central de Notificações"
          description="Gerencie e envie notificações do sistema"
          icon={Bell}
          onClick={() => {
            window.location.href = '/notifications';
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Instituições Recentes */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Instituições Recentes</h2>
            <button
              onClick={() => window.location.href = '/institution/manage'}
              className="text-primary-dark hover:text-primary text-xs"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-2">
            {recentInstitutions.map((institution) => (
              <div
                key={institution.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
              >
                <div>
                  <p className="font-medium text-sm">{institution.name}</p>
                  <p className="text-xs text-slate-500">{institution.code}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditInstitution(institution)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-slate-200 rounded">
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Escolas Recentes */}
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Escolas Recentes</h2>
            <button
              onClick={() => window.location.href = '/institution/schools'}
              className="text-primary-dark hover:text-primary text-xs"
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-2">
            {recentSchools.map((school) => (
              <div
                key={school.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-md"
              >
                <div>
                  <p className="font-medium text-sm">{school.name}</p>
                  <p className="text-xs text-slate-500">
                    {school.city} - {school.state}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditSchool(school)}
                    className="p-1 hover:bg-slate-200 rounded"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button className="p-1 hover:bg-slate-200 rounded">
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Crescimento Mensal
          </h3>
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">
            Gráfico de crescimento (implementar com Chart.js)
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3">
          <h3 className="text-sm font-semibold mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Eventos Próximos
          </h3>
          <div className="space-y-2">
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
      className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow text-left"
    >
      <div className="flex items-center mb-2">
                <div className="p-1.5 bg-primary/10 rounded-md mr-2">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <Plus className="w-3 h-3 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-800 mb-1 text-sm">{title}</h3>
      <p className="text-xs text-slate-600">{description}</p>
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
    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
      <div className="flex items-center">
          <div className="text-xs font-medium text-slate-500 w-10">
          {date}
        </div>
        <div className="ml-2">
            <p className="text-xs font-medium text-slate-800">{title}</p>
        </div>
      </div>
      <span className={`px-1.5 py-0.5 text-xs rounded-full ${typeColors[type]}`}>
        {type === 'meeting' ? 'Reunião' : type === 'holiday' ? 'Feriado' : 'Matrícula'}
      </span>
    </div>
  );
}
