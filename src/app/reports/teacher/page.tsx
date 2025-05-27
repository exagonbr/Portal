'use client'

import { useAuth } from '@/contexts/AuthContext'

interface ClassPerformance {
  class: string
  studentsCount: number
  averageGrade: number
  attendanceRate: number
  completionRate: number
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  image: string
}

const MOCK_CLASS_PERFORMANCE: ClassPerformance[] = [
  {
    class: 'Matemática Avançada - Turma A',
    studentsCount: 35,
    averageGrade: 8.5,
    attendanceRate: 92,
    completionRate: 88,
    trend: 'up',
    trendValue: 5,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80'
  },
  {
    class: 'Cálculo I - Turma B',
    studentsCount: 30,
    averageGrade: 7.8,
    attendanceRate: 88,
    completionRate: 82,
    trend: 'stable',
    trendValue: 0,
    image: 'https://images.unsplash.com/photo-1635070037783-b42d0aadb67b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80'
  },
  {
    class: 'Álgebra Linear - Turma C',
    studentsCount: 28,
    averageGrade: 7.2,
    attendanceRate: 85,
    completionRate: 75,
    trend: 'down',
    trendValue: 3,
    image: 'https://images.unsplash.com/photo-1635070041544-22beaa325f28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80'
  }
]

const TREND_COLORS = {
  up: 'text-green-500',
  down: 'text-red-500',
  stable: 'text-blue-500'
}

const TREND_ICONS = {
  up: 'trending_up',
  down: 'trending_down',
  stable: 'trending_flat'
}

export default function TeacherReportsPage() {
  const { user } = useAuth()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Relatórios e Análises</h1>
            <p className="text-gray-600">Acompanhe o desempenho das suas turmas</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              <span className="material-icons text-sm mr-2">file_download</span>
              Exportar PDF
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <span className="material-icons text-sm mr-2">share</span>
              Compartilhar
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Alunos</div>
            <div className="text-2xl font-bold text-gray-800">93</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 8</span>
              <span className="text-gray-500 text-sm ml-2">vs. semestre anterior</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média Geral</div>
            <div className="text-2xl font-bold text-blue-600">7.8</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 0.3</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Aprovação</div>
            <div className="text-2xl font-bold text-green-600">82%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 5%</span>
              <span className="text-gray-500 text-sm ml-2">vs. média histórica</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Engajamento</div>
            <div className="text-2xl font-bold text-purple-600">88%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 3%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance by Class */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {MOCK_CLASS_PERFORMANCE.map((classData) => (
          <div key={classData.class} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Class Image */}
            <div className="relative h-48">
              <img
                src={classData.image}
                alt={classData.class}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold text-white">{classData.class}</h3>
                <p className="text-sm text-white/80">{classData.studentsCount} alunos</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Média da Turma</p>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-bold text-gray-800">
                      {classData.averageGrade.toFixed(1)}
                    </span>
                    <span className={`material-icons ml-2 ${TREND_COLORS[classData.trend]}`}>
                      {TREND_ICONS[classData.trend]}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Frequência</p>
                  <div className="flex items-center mt-1">
                    <span className="text-2xl font-bold text-gray-800">
                      {classData.attendanceRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progresso do Conteúdo</span>
                    <span className="text-gray-800">{classData.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${classData.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Distribuição de Notas</span>
                  </div>
                  <div className="flex h-2 space-x-0.5">
                    <div className="flex-1 bg-red-500 rounded-l"></div>
                    <div className="flex-1 bg-orange-500"></div>
                    <div className="flex-1 bg-yellow-500"></div>
                    <div className="flex-1 bg-green-500"></div>
                    <div className="flex-1 bg-green-600 rounded-r"></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0</span>
                    <span>2.5</span>
                    <span>5.0</span>
                    <span>7.5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-700">
                  Ver Relatório Completo
                </button>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <span className="material-icons">mail</span>
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <span className="material-icons">analytics</span>
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
<span className="material-icons">mais_vert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Notas</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Gráfico de Distribuição de Notas</span>
          </div>
        </div>

        {/* Attendance Trends Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendências de Frequência</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Gráfico de Tendências de Frequência</span>
          </div>
        </div>

        {/* Performance Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Linha do Tempo de Desempenho</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Gráfico de Linha do Tempo de Desempenho</span>
          </div>
        </div>
      </div>
    </div>
  )
}
