'use client';

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  UserCheck,
  Activity,
  Briefcase,
  Star,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/roles';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout';

interface CoordinatorStats {
  totalCycles: number;
  activeCycles: number;
  totalTeachers: number;
  totalStudents: number;
  averagePerformance: number;
  curriculumCompletion: number;
  teacherSatisfaction: number;
  studentProgress: number;
}

interface EducationCycleOverview {
  id: string;
  name: string;
  level: string;
  students: number;
  teachers: number;
  performance: number;
  completion: number;
  status: 'on-track' | 'delayed' | 'ahead' | 'at-risk';
}

interface TeacherPerformance {
  id: string;
  name: string;
  subject: string;
  classes: number;
  students: number;
  averageGrade: number;
  satisfaction: number;
  attendance: number;
}

interface CurriculumItem {
  id: string;
  subject: string;
  cycle: string;
  completion: number;
  lastUpdate: Date;
  responsible: string;
  status: 'approved' | 'pending' | 'revision';
}

interface AcademicAlert {
  id: string;
  type: 'performance' | 'attendance' | 'curriculum' | 'teacher';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  actionRequired: boolean;
}

export default function CoordinatorDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute requiredRole={[UserRole.ACADEMIC_COORDINATOR]}>
      <DashboardPageLayout
        title="Painel do Coordenador"
        subtitle="Gerencie o planejamento acadêmico e o corpo docente"
      >
        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Total de Professores</div>
              <div className="text-2xl font-bold text-gray-600">24</div>
              <div className="text-xs text-green-600 mt-2">↑ 2 este mês</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Turmas Ativas</div>
              <div className="text-2xl font-bold text-gray-600">18</div>
              <div className="text-xs text-blue-600 mt-2">3 em formação</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Média de Desempenho</div>
              <div className="text-2xl font-bold text-gray-600">8.2</div>
              <div className="text-xs text-green-600 mt-2">↑ 0.3 este bimestre</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-sm font-medium text-gray-500 mb-1">Reuniões Pendentes</div>
              <div className="text-2xl font-bold text-gray-600">5</div>
              <div className="text-xs text-red-600 mt-2">2 para hoje</div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">calendar_month</span>
                <span className="text-sm font-medium text-gray-700">Gerenciar Ciclos</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">menu_book</span>
                <span className="text-sm font-medium text-gray-700">Gestão Curricular</span>
              </button>
              <button className="flex items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <span className="material-symbols-outlined text-blue-600">groups</span>
                <span className="text-sm font-medium text-gray-700">Gestão de Docentes</span>
              </button>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Atividades Recentes</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">assignment</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-700">Nova Avaliação Criada</h3>
                  <p className="text-sm text-gray-500">Matemática - 9º Ano • Prof. Silva</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Status</div>
                  <div className="text-xs text-green-600">Concluído</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-600">update</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-700">Planejamento Atualizado</h3>
                  <p className="text-sm text-gray-500">Português - 8º Ano • Prof. Santos</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Status</div>
                  <div className="text-xs text-green-600">Concluído</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-600">event</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-700">Reunião de Planejamento</h3>
                  <p className="text-sm text-gray-500">Equipe de Matemática • 15:00</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">Status</div>
                  <div className="text-xs text-yellow-600">Pendente</div>
                </div>
              </div>
            </div>
          </div>

          {/* Desempenho por Disciplina */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Desempenho por Disciplina</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">science</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Matemática</h3>
                    <p className="text-sm text-gray-500">Prof. Silva</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-600">8.7</div>
                  <div className="text-xs text-green-600">↑ 0.3 este bimestre</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-green-600">menu_book</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700">Português</h3>
                    <p className="text-sm text-gray-500">Prof. Santos</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-600">8.5</div>
                  <div className="text-xs text-green-600">↑ 0.2 este bimestre</div>
                </div>
              </div>
            </div>
          </div>

          {/* Próximas Reuniões */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Próximas Reuniões</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-700">Reunião de Planejamento</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Hoje</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Reunião com a equipe de Matemática para planejamento do próximo bimestre.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>15:00 - 16:30</span>
                  <span>Sala de Reuniões</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-700">Avaliação de Desempenho</h3>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full">Amanhã</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  Reunião individual com Prof. Santos para avaliação de desempenho.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>10:00 - 11:00</span>
                  <span>Sala de Coordenação</span>
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
  color: string;
}

function StatCard({ icon: Icon, title, value, subtitle, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-700 dark:text-gray-800 dark:text-gray-800">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-600">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
}

// Componente de Indicador de Qualidade
interface QualityIndicatorProps {
  title: string;
  value: number;
  icon: React.ElementType;
  description: string;
}

function QualityIndicator({ title, value, icon: Icon, description }: QualityIndicatorProps) {
  const getColor = () => {
    if (value >= 85) return 'text-accent-green';
    if (value >= 70) return 'text-accent-yellow';
    return 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-100 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
        <span className={`text-3xl font-bold ${getColor()}`}>
          {value}%
        </span>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-600">{description}</p>
    </div>
  );
}