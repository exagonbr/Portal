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
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { institutionService } from '@/services/institutionService';
import { schoolService } from '@/services/schoolService';
import { classService } from '@/services/classService';
import { Institution } from '@/types/institution';
import { School as SchoolType } from '@/services/schoolService';
import { EDUCATION_LEVEL_LABELS, EDUCATION_LEVEL_COLORS } from '@/types/educationCycle';
import { ClassResponseDto } from '@/types/api';

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
  const [classes, setClasses] = useState<ClassResponseDto[]>([]);

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
    }
  }, [selectedSchool]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const institutionsResponse = await institutionService.getAll();
      setInstitutions(institutionsResponse as any);
      
      // Calcular estatísticas gerais básicas
      let totalSchools = 0;

      for (const institution of institutionsResponse) {
        const schoolsData = await schoolService.getByInstitution(institution.id);
        totalSchools += schoolsData.length;
      }

      setStats({
        totalInstitutions: institutionsResponse.length,
        totalSchools,
        totalClasses: 0, // Placeholder - implementar quando necessário
        totalStudents: 0, // Placeholder - implementar quando necessário
        totalTeachers: 0, // Placeholder - implementar quando necessário
        activeClasses: 0 // Placeholder - implementar quando necessário
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

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        {/* Card Instituições */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-blue-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-blue-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-12 right-8 w-1 h-1 bg-purple-200 rounded-full animate-ping delay-500"></div>
          </div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <Building2 className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalInstitutions}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-blue-100 font-semibold tracking-wide">INSTITUIÇÕES</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Instituições</h3>
              <p className="text-blue-100 text-sm font-medium">Total gerenciadas</p>
            </div>
          </div>
        </div>

        {/* Card Escolas */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-green-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-green-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-12 right-8 w-1 h-1 bg-teal-200 rounded-full animate-ping delay-500"></div>
          </div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <School className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalSchools}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-lime-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-green-100 font-semibold tracking-wide">ESCOLAS</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Escolas</h3>
              <p className="text-green-100 text-sm font-medium">Unidades ativas</p>
            </div>
          </div>
        </div>

        {/* Card Turmas */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-purple-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-purple-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-violet-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-200 rounded-full animate-ping delay-500"></div>
          </div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <GraduationCap className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalClasses}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-purple-100 font-semibold tracking-wide">TURMAS</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Turmas</h3>
              <p className="text-purple-100 text-sm font-medium">Total cadastradas</p>
            </div>
          </div>
        </div>

        {/* Card Estudantes */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-600 to-red-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-amber-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-amber-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-12 right-8 w-1 h-1 bg-red-200 rounded-full animate-ping delay-500"></div>
          </div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <Users className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalStudents}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-amber-100 font-semibold tracking-wide">ESTUDANTES</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Estudantes</h3>
              <p className="text-amber-100 text-sm font-medium">Matriculados</p>
            </div>
          </div>
        </div>

        {/* Card Professores */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-cyan-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-cyan-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-blue-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-12 right-8 w-1 h-1 bg-indigo-200 rounded-full animate-ping delay-500"></div>
          </div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <UserCheck className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.totalTeachers}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-cyan-100 font-semibold tracking-wide">PROFESSORES</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Professores</h3>
              <p className="text-cyan-100 text-sm font-medium">Corpo docente</p>
            </div>
          </div>
        </div>

        {/* Card Turmas Ativas */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 border-2 border-rose-300 transform hover:-translate-y-2 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-8 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="absolute top-8 right-12 w-1 h-1 bg-rose-200 rounded-full animate-ping"></div>
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-pink-200 rounded-full animate-pulse delay-300"></div>
            <div className="absolute bottom-12 right-8 w-1 h-1 bg-fuchsia-200 rounded-full animate-ping delay-500"></div>
          </div>
          <div className="relative p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 border border-white/30">
                <CheckCircle className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-white drop-shadow-lg tracking-tight">{stats.activeClasses}</p>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <div className="w-3 h-3 bg-rose-400 rounded-full animate-pulse shadow-lg"></div>
                  <span className="text-sm text-rose-100 font-semibold tracking-wide">ATIVAS</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Turmas Ativas</h3>
              <p className="text-rose-100 text-sm font-medium">Em funcionamento</p>
            </div>
          </div>
        </div>
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
          {selectedSchool ? (
            <div>
              {/* Informações da Escola */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">{selectedSchool.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Código:</strong> {selectedSchool.code || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Cidade:</strong> {selectedSchool.city || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Estado:</strong> {selectedSchool.state || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Status:</strong> {selectedSchool.status === 'active' ? 'Ativa' : 'Inativa'}
                </p>
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
                          {classItem.description || 'Sem descrição'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          <span className="font-medium">{classItem.status}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {classItem.active ? 'Ativa' : 'Inativa'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {classes.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Nenhuma turma encontrada
                  </p>
                )}
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