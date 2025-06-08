'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  School, 
  Users, 
  GraduationCap, 
  UserCheck,
  BookOpen,
  TrendingUp,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { institutionService } from '@/services/institutionService';
import { schoolService } from '@/services/schoolService';
import { classService } from '@/services/classService';
import { Institution } from '@/types/institution';
import { School as SchoolType, SchoolStats } from '@/types/school';
import { Class } from '@/types/class';
import { SHIFT_LABELS } from '@/types/class';
import { EDUCATION_LEVEL_LABELS, EDUCATION_LEVEL_COLORS } from '@/types/educationCycle';

interface DashboardStats {
  totalInstitutions: number;
  totalSchools: number;
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  activeClasses: number;
}

export default function HierarchicalDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalInstitutions: 0,
    totalSchools: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    activeClasses: 0
  });
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<SchoolType | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadSchools(selectedInstitution.id);
    }
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedSchool) {
      loadClasses(selectedSchool.id);
      loadSchoolStats(selectedSchool.id);
    }
  }, [selectedSchool]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const institutionsResponse = await institutionService.list({ limit: 100 });
      setInstitutions(institutionsResponse.items as any);
      
      // Calcular estatísticas gerais
      let totalSchools = 0;
      let totalClasses = 0;
      let totalStudents = 0;
      let totalTeachers = 0;
      let activeClasses = 0;

      for (const institution of institutionsResponse.items) {
        const schoolsData = await schoolService.getByInstitution(institution.id);
        totalSchools += schoolsData.length;

        for (const school of schoolsData) {
          const stats = await schoolService.getStats(school.id);
          totalClasses += stats.totalClasses;
          totalStudents += stats.totalStudents;
          totalTeachers += stats.totalTeachers;
          activeClasses += stats.activeClasses;
        }
      }

      setStats({
        totalInstitutions: institutionsResponse.items.length,
        totalSchools,
        totalClasses,
        totalStudents,
        totalTeachers,
        activeClasses
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchools = async (institutionId: string) => {
    try {
      const schoolsData = await schoolService.getByInstitution(institutionId);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
    }
  };

  const loadClasses = async (schoolId: string) => {
    try {
      const classesData = await classService.getBySchool(schoolId);
      setClasses(classesData);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
    }
  };

  const loadSchoolStats = async (schoolId: string) => {
    try {
      const stats = await schoolService.getStats(schoolId);
      setSchoolStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas da escola:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800 mb-2">
          Dashboard Hierárquico
        </h1>
        <p className="text-gray-600 dark:text-gray-600">
          Visão completa da estrutura educacional
        </p>
      </div>

      {/* Cards de Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard
          icon={Building2}
          title="Instituições"
          value={stats.totalInstitutions}
          color="bg-purple-500"
        />
        <StatCard
          icon={School}
          title="Escolas"
          value={stats.totalSchools}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Turmas"
          value={stats.totalClasses}
          color="bg-green-500"
        />
        <StatCard
          icon={GraduationCap}
          title="Alunos"
          value={stats.totalStudents}
          color="bg-yellow-500"
        />
        <StatCard
          icon={UserCheck}
          title="Professores"
          value={stats.totalTeachers}
          color="bg-red-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Turmas Ativas"
          value={stats.activeClasses}
          color="bg-indigo-500"
        />
      </div>

      {/* Navegação Hierárquica */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Instituições */}
        <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-purple-500" />
            Instituições
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {institutions.map((institution) => (
              <button
                key={institution.id}
                onClick={() => {
                  setSelectedInstitution(institution);
                  setSelectedSchool(null);
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedInstitution?.id === institution.id
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{institution.name}</p>
                    <p className="text-sm text-gray-500">{institution.code}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Escolas */}
        <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <School className="w-5 h-5 mr-2 text-blue-500" />
            Escolas
            {selectedInstitution && (
              <span className="ml-2 text-sm text-gray-500">
                ({schools.length})
              </span>
            )}
          </h2>
          {selectedInstitution ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {schools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => setSelectedSchool(school)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedSchool?.id === school.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{school.name}</p>
                      <p className="text-sm text-gray-500">
                        {school.city} - {school.state}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Selecione uma instituição
            </p>
          )}
        </div>

        {/* Detalhes da Escola e Turmas */}
        <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-500" />
            Detalhes da Escola
          </h2>
          {selectedSchool && schoolStats ? (
            <div>
              {/* Estatísticas da Escola */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-500">Total de Turmas</p>
                  <p className="text-xl font-semibold">{schoolStats.totalClasses}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-500">Turmas Ativas</p>
                  <p className="text-xl font-semibold">{schoolStats.activeClasses}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-500">Alunos</p>
                  <p className="text-xl font-semibold">{schoolStats.totalStudents}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-300 p-3 rounded">
                  <p className="text-sm text-gray-500">Professores</p>
                  <p className="text-xl font-semibold">{schoolStats.totalTeachers}</p>
                </div>
              </div>

              {/* Lista de Turmas */}
              <h3 className="font-semibold mb-2">Turmas ({classes.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {classes.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-3 bg-gray-50 dark:bg-gray-300 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{classItem.name}</p>
                        <p className="text-sm text-gray-500">
                          {classItem.year} - {SHIFT_LABELS[classItem.shift]}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium">{classItem.max_students}</span> vagas
                        </p>
                        <p className="text-xs text-gray-500">
                          {classItem.is_active ? 'Ativa' : 'Inativa'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Selecione uma escola
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  color: string;
}

function StatCard({ icon: Icon, title, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800 dark:text-gray-800">
        {value.toLocaleString('pt-BR')}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
    </div>
  );
}