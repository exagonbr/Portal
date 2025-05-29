'use client';

import React from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  TrendingUp,
  Award,
  Bell,
  CheckCircle,
  Star,
  Target,
  BarChart,
  Trophy,
  Zap,
  Brain,
  Users,
  Video,
  Gamepad2,
  Activity
} from 'lucide-react';

// Componente de Card de Estatística
interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle: string;
  color: string;
  trend?: string;
}

function StatCard({ icon: Icon, title, value, subtitle, color, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-xs text-green-600 font-medium">{trend}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-xs text-gray-500 dark:text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function TestStudentDashboard() {
  // Dados mock para teste
  const stats = {
    averageGrade: 8.5,
    completedTasks: 24,
    pendingTasks: 3,
    attendance: 95,
    ranking: 5,
    totalStudents: 28,
    xpPoints: 2450,
    level: 12,
    streakDays: 7,
    badges: 8
  };

  const assignments = [
    {
      id: '1',
      title: 'Exercícios de Matemática - Frações',
      subject: 'Matemática',
      dueDate: '2025-02-05',
      status: 'pending' as const
    },
    {
      id: '2',
      title: 'Redação sobre Meio Ambiente',
      subject: 'Português',
      dueDate: '2025-02-03',
      status: 'submitted' as const
    },
    {
      id: '3',
      title: 'Pesquisa sobre Sistema Solar',
      subject: 'Ciências',
      dueDate: '2025-02-01',
      status: 'graded' as const,
      grade: 9.0
    }
  ];

  const getStatusColor = (status: 'pending' | 'submitted' | 'graded') => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      case 'graded':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          Dashboard do Estudante - Teste (SEM AUTENTICAÇÃO)
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Olá, Estudante! Este é um teste do dashboard sem proteção de rota.
        </p>
      </div>

      {/* Barra de Progresso e Gamificação */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl font-bold">{stats.level}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-1">
                <Star className="w-4 h-4 text-yellow-900" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">Nível {stats.level} - Explorador</h2>
              <p className="text-blue-100">
                {stats.xpPoints} XP • Próximo nível em {(stats.level + 1) * 250 - stats.xpPoints} XP
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Trophy className="w-5 h-5 text-yellow-300" />
                <span className="text-2xl font-bold">{stats.badges}</span>
              </div>
              <p className="text-xs text-blue-100">conquistas</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Users className="w-5 h-5 text-green-300" />
                <span className="text-2xl font-bold">{stats.ranking}º</span>
              </div>
              <p className="text-xs text-blue-100">no ranking</p>
            </div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${(stats.xpPoints % 250) / 250 * 100}%` }}
          />
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          title="Média Geral"
          value={stats.averageGrade.toFixed(1)}
          subtitle="de 10.0"
          color="bg-blue-500"
          trend="+0.5"
        />
        <StatCard
          icon={CheckCircle}
          title="Tarefas"
          value={stats.completedTasks}
          subtitle={`${stats.pendingTasks} pendentes`}
          color="bg-green-500"
        />
        <StatCard
          icon={Calendar}
          title="Frequência"
          value={`${stats.attendance}%`}
          subtitle="de presença"
          color="bg-purple-500"
        />
        <StatCard
          icon={Activity}
          title="Atividade"
          value={`${stats.streakDays}d`}
          subtitle="sequência atual"
          color="bg-orange-500"
        />
      </div>

      {/* Tarefas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          Minhas Tarefas
        </h2>
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <h3 className="font-medium">{assignment.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>{assignment.subject}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {assignment.grade !== undefined && (
                  <span className="font-bold text-green-600">
                    {assignment.grade.toFixed(1)}
                  </span>
                )}
                <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}>
                  {assignment.status === 'pending' ? 'Pendente' :
                   assignment.status === 'submitted' ? 'Enviada' : 'Corrigida'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status de Teste */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Dashboard Funcionando!</h3>
        <p className="text-green-800">
          Se você está vendo este conteúdo, significa que o problema está na autenticação ou no componente RoleProtectedRoute, 
          não na estrutura do dashboard em si.
        </p>
        <div className="mt-4 space-y-2 text-sm text-green-700">
          <p>• CSS e Tailwind estão funcionando corretamente</p>
          <p>• Componentes React estão renderizando</p>
          <p>• Ícones do Lucide estão carregando</p>
          <p>• Layout responsivo está aplicado</p>
        </div>
      </div>
    </div>
  );
}