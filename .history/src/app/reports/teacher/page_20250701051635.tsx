'use client'

import React, { useState, useEffect } from 'react'
import { 
  Download,
  FileText,
  TrendingUp,
  Users,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface ReportData {
  students: {
    total: number
    active: number
    inactive: number
    averageGrade: number
    averageAttendance: number
  }
  courses: {
    total: number
    inProgress: number
    completed: number
    averageCompletion: number
  }
  activities: {
    total: number
    graded: number
    pending: number
    averageScore: number
  }
  performance: {
    monthlyGrades: { month: string; average: number }[]
    gradeDistribution: { range: string; count: number }[]
    attendanceByClass: { class: string; rate: number }[]
  }
}

export default function TeacherReportsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [reportData, setReportData] = useState<ReportData>({
    students: {
      total: 85,
      active: 78,
      inactive: 7,
      averageGrade: 7.8,
      averageAttendance: 92
    },
    courses: {
      total: 4,
      inProgress: 3,
      completed: 1,
      averageCompletion: 68
    },
    activities: {
      total: 45,
      graded: 38,
      pending: 7,
      averageScore: 7.5
    },
    performance: {
      monthlyGrades: [
        { month: 'Jan', average: 7.2 },
        { month: 'Fev', average: 7.5 },
        { month: 'Mar', average: 7.8 }
      ],
      gradeDistribution: [
        { range: '0-4', count: 5 },
        { range: '5-6', count: 12 },
        { range: '7-8', count: 35 },
        { range: '9-10', count: 33 }
      ],
      attendanceByClass: [
        { class: 'Turma A', rate: 95 },
        { class: 'Turma B', rate: 88 },
        { class: 'Turma C', rate: 92 }
      ]
    }
  })

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod, selectedCourse])

  const loadReportData = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.log('Erro ao carregar dados do relatório:', error)
      setLoading(false)
    }
  }

  const exportReport = (format: 'pdf' | 'excel') => {
    // Implementar exportação
    console.log(`Exportando relatório em formato ${format}`)
  }

  return (
    <DashboardLayout>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Relatórios
        </h1>
        <p className="text-slate-600">
          Visualize e exporte relatórios detalhados sobre suas turmas
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Período
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="current">Período Atual</option>
              <option value="last30">Últimos 30 dias</option>
              <option value="last90">Últimos 90 dias</option>
              <option value="year">Este Ano</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Curso
            </label>
            <select
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">Todos os Cursos</option>
              <option value="math">Matemática Básica</option>
              <option value="port">Português - Gramática</option>
              <option value="hist">História do Brasil</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => exportReport('pdf')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Exportar PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors"
            >
              <Download className="h-4 w-4" />
              Exportar Excel
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
        </div>
      ) : (
        <>
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-8 w-8 text-blue-500" />
                <span className="text-xs text-slate-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{reportData.students.total}</p>
              <p className="text-sm text-slate-600">Alunos</p>
              <div className="mt-2 text-xs text-slate-500">
                {reportData.students.active} ativos • {reportData.students.inactive} inativos
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <span className="text-xs text-slate-500">Média</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{reportData.students.averageGrade.toFixed(1)}</p>
              <p className="text-sm text-slate-600">Nota Geral</p>
              <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${reportData.students.averageGrade * 10}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="h-8 w-8 text-purple-500" />
                <span className="text-xs text-slate-500">Taxa</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{reportData.students.averageAttendance}%</p>
              <p className="text-sm text-slate-600">Presença</p>
              <div className="mt-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${reportData.students.averageAttendance}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-2">
                <Activity className="h-8 w-8 text-orange-500" />
                <span className="text-xs text-slate-500">Total</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">{reportData.activities.total}</p>
              <p className="text-sm text-slate-600">Atividades</p>
              <div className="mt-2 text-xs text-slate-500">
                {reportData.activities.graded} corrigidas • {reportData.activities.pending} pendentes
              </div>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Evolução das Notas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-slate-600" />
                Evolução das Médias
              </h3>
              <div className="space-y-3">
                {reportData.performance.monthlyGrades.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">{item.month}</span>
                      <span className="font-medium">{item.average.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className="bg-primary-dark h-3 rounded-full transition-all duration-500"
                        style={{ width: `${item.average * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Distribuição de Notas */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-slate-600" />
                Distribuição de Notas
              </h3>
              <div className="space-y-3">
                {reportData.performance.gradeDistribution.map((item, index) => {
                  const colors = ['bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                        <span className="text-sm text-slate-600">Notas {item.range}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index]}`}
                            style={{ width: `${(item.count / reportData.students.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Tabela de Presença por Turma */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-600" />
              Taxa de Presença por Turma
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Taxa de Presença
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Visualização
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reportData.performance.attendanceByClass.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {item.class}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {item.rate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full max-w-xs bg-slate-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              item.rate >= 90 ? 'bg-green-500' : 
                              item.rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${item.rate}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Relatórios Disponíveis */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Relatórios Disponíveis para Download
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Relatório de Desempenho</p>
                    <p className="text-sm text-slate-600">Análise detalhada do desempenho dos alunos</p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-slate-400" />
              </button>

              <button className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Award className="h-8 w-8 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Boletim de Notas</p>
                    <p className="text-sm text-slate-600">Notas consolidadas por período</p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-slate-400" />
              </button>

              <button className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-purple-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Relatório de Frequência</p>
                    <p className="text-sm text-slate-600">Controle de presença detalhado</p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-slate-400" />
              </button>

              <button className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-orange-500" />
                  <div className="text-left">
                    <p className="font-medium text-slate-800">Relatório de Atividades</p>
                    <p className="text-sm text-slate-600">Status e resultados das atividades</p>
                  </div>
                </div>
                <Download className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
    </DashboardLayout>
  )
}
