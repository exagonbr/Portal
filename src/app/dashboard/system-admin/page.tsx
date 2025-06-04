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
// import { institutionService } from '@/services/institutionService'; // To be replaced
// import { schoolService } from '@/services/schoolService'; // To be replaced
// import { classService } from '@/services/classService'; // To be replaced
import { apiClient, ApiClientError } from '@/services/apiClient'; // Added
import { School as SchoolType } from '@/types/school';
import { Class } from '@/types/class';
import { InstitutionResponseDto, PaginatedResponseDto } from '@/types/api'; // Added PaginatedResponseDto
import { useRouter } from 'next/navigation';
import { InstitutionDto } from '@/types/institution';


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
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionResponseDto | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Dados para listagens
  const [recentInstitutions, setRecentInstitutions] = useState<InstitutionResponseDto[]>([]);
  const [recentSchools, setRecentSchools] = useState<SchoolType[]>([]);
  const [recentClasses, setRecentClasses] = useState<Class[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar instituições
      // TODO: Adjust API endpoint and response structure as needed
      const institutionsApiResponse = await apiClient.get<PaginatedResponseDto<InstitutionResponseDto>>('/api/institutions', { limit: 5 });
      const institutionsData = institutionsApiResponse.data;
      setRecentInstitutions(institutionsData?.items || []);
      
      // Carregar escolas recentes
      // TODO: Adjust API endpoint and response structure as needed
      const schoolsApiResponse = await apiClient.get<PaginatedResponseDto<SchoolType>>('/api/schools', { limit: 5 });
      const schoolsData = schoolsApiResponse.data;
      setRecentSchools(schoolsData?.items || []);
      
      // Carregar turmas recentes
      // TODO: Adjust API endpoint and response structure as needed
      const classesApiResponse = await apiClient.get<PaginatedResponseDto<Class>>('/api/classes', { limit: 5 });
      const classesData = classesApiResponse.data;
      setRecentClasses(classesData?.items || []);

      // Calcular estatísticas
      let totalStudents = 0;
      let totalTeachers = 0;
      let activeClasses = 0;

      // Para cada escola, buscar estatísticas
      // TODO: Adjust API endpoint for school stats and response structure as needed
      for (const school of schoolsData?.items || []) {
        try {
          const schoolStatsResponse = await apiClient.get<{ totalStudents: number; totalTeachers: number; activeClasses: number }>(`/api/schools/${school.id}/stats`);
          if (schoolStatsResponse.success && schoolStatsResponse.data) {
            totalStudents += schoolStatsResponse.data.totalStudents;
            totalTeachers += schoolStatsResponse.data.totalTeachers;
            activeClasses += schoolStatsResponse.data.activeClasses;
          }
        } catch (err) {
          console.error(`Erro ao buscar stats da escola ${school.id}:`, err);
        }
      }
      
      // TODO: Fetch monthlyGrowth and satisfactionRate from an API
      const generalStatsResponse = await apiClient.get<{ monthlyGrowth?: number; satisfactionRate?: number }>(`/api/system-admin/dashboard/stats`);
      const generalStatsData = generalStatsResponse.data || {};

      setStats({
        totalInstitutions: institutionsData?.pagination?.total || 0,
        totalSchools: schoolsData?.pagination?.total || 0,
        totalClasses: classesData?.pagination?.total || 0,
        totalStudents,
        totalTeachers,
        activeClasses,
        monthlyGrowth: generalStatsData.monthlyGrowth || 12.5, // Fallback to mock
        satisfactionRate: generalStatsData.satisfactionRate || 87.3 // Fallback to mock
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard do system-admin:', err);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Erro desconhecido ao carregar dados do dashboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditInstitution = (institution: InstitutionResponseDto) => {
    setSelectedInstitution(institution);
    setShowInstitutionModal(true);
  };

  const handleEditSchool = (school: SchoolType) => {
    setSelectedSchool(school);
    setShowSchoolModal(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setShowClassModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
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
            setSelectedInstitution(null);
            setShowInstitutionModal(true);
          }}
        />
        <QuickActionCard
          title="Nova Escola"
          description="Adicione uma escola a uma instituição"
          icon={School}
          onClick={() => {
            setSelectedSchool(null);
            setShowSchoolModal(true);
          }}
        />
        <QuickActionCard
          title="Nova Turma"
          description="Crie uma nova turma em uma escola"
          icon={Users}
          onClick={() => {
            setSelectedClass(null);
            setShowClassModal(true);
          }}
        />
        <QuickActionCard
          title="Demo de Modais"
          description="Teste todos os modais de CRUD criados"
          icon={Settings}
          onClick={() => {
            router.push('/admin/demo-modals');
          }}
        />
        <QuickActionCard
          title="Navegação do Sistema"
          description="Mapa completo de todas as páginas"
          icon={TrendingUp}
          onClick={() => {
            router.push('/admin/system-nav');
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
              onClick={() => router.push('/institution/manage')}
              className="text-primary-dark hover:text-primary text-sm"
            >
              Ver todas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentInstitutions.map((institution) => (
                  <tr key={institution.id} className="border-b">
                    <td className="py-3">{institution.name}</td>
                    <td className="py-3">{institution.type}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        institution.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {institution.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleEditInstitution(institution)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Escolas Recentes */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Escolas Recentes</h2>
            <button
              onClick={() => router.push('/school/manage')}
              className="text-primary-dark hover:text-primary text-sm"
            >
              Ver todas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">Instituição</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentSchools.map((school) => (
                  <tr key={school.id} className="border-b">
                    <td className="py-3">{school.name}</td>
                    <td className="py-3">{school.institution_id}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        school.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {school.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleEditSchool(school)}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modais */}
      {showInstitutionModal && (
        <InstitutionModal
          institution={selectedInstitution ? {
            ...selectedInstitution,
            created_at: new Date(selectedInstitution.created_at),
            updated_at: new Date(selectedInstitution.updated_at)
          } : null}
          onClose={() => {
            setShowInstitutionModal(false);
            setSelectedInstitution(null);
            loadDashboardData();
          }}
          onSave={async (data: any) => {
            try {
              if (selectedInstitution) {
                // TODO: Adjust API endpoint for updating institution
                await apiClient.put(`/api/institutions/${selectedInstitution.id}`, data);
              } else {
                // TODO: Adjust API endpoint for creating institution
                await apiClient.post('/api/institutions', data);
              }
              loadDashboardData();
              setShowInstitutionModal(false);
              setSelectedInstitution(null);
            } catch (err) {
              console.error('Erro ao salvar instituição:', err);
              // TODO: Adicionar toast de erro
              if (err instanceof ApiClientError) setError(err.message); else setError('Erro ao salvar instituição.');
            }
          }}
        />
      )}

      {showSchoolModal && (
        <SchoolModal
          school={selectedSchool ? {
            ...selectedSchool,
            created_at: new Date(selectedSchool.created_at),
            updated_at: new Date(selectedSchool.updated_at)
          } : null}
          onClose={() => {
            setShowSchoolModal(false);
            setSelectedSchool(null);
            loadDashboardData();
          }}
          onSave={async (data: any) => {
            try {
              if (selectedSchool) {
                // TODO: Adjust API endpoint for updating school
                await apiClient.put(`/api/schools/${selectedSchool.id}`, data);
              } else {
                // TODO: Adjust API endpoint for creating school
                await apiClient.post('/api/schools', data);
              }
              loadDashboardData();
              setShowSchoolModal(false);
              setSelectedSchool(null);
            } catch (err) {
              console.error('Erro ao salvar escola:', err);
              // TODO: Adicionar toast de erro
              if (err instanceof ApiClientError) setError(err.message); else setError('Erro ao salvar escola.');
            }
          }}
        />
      )}

      {showClassModal && (
        <ClassModal
          classItem={selectedClass}
          onClose={() => {
            setShowClassModal(false);
            setSelectedClass(null);
            loadDashboardData();
          }}
          onSave={async (data: any) => {
            try {
              if (selectedClass) {
                // TODO: Adjust API endpoint for updating class
                await apiClient.put(`/api/classes/${selectedClass.id}`, data);
              } else {
                // TODO: Adjust API endpoint for creating class
                await apiClient.post('/api/classes', data);
              }
              loadDashboardData();
              setShowClassModal(false);
              setSelectedClass(null);
            } catch (err) {
              console.error('Erro ao salvar turma:', err);
              // TODO: Adicionar toast de erro
              if (err instanceof ApiClientError) setError(err.message); else setError('Erro ao salvar turma.');
            }
          }}
        />
      )}
    </div>
  );
}

// Componentes auxiliares
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  subtitle?: string;
  trend?: string;
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <span className={`text-sm font-medium text-${color}-600`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-gray-600">{title}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

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
      className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
