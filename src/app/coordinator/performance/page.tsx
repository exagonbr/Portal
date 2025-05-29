'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_PERFORMANCE_DATA = {
  overview: {
    totalStudents: 1150,
    averageGrade: 7.8,
    approvalRate: 94,
    attendanceRate: 96
  },
  gradeDistribution: [
    { grade: '0-2', count: 15, percentage: 1.3 },
    { grade: '3-4', count: 35, percentage: 3.0 },
    { grade: '5-6', count: 180, percentage: 15.7 },
    { grade: '7-8', count: 520, percentage: 45.2 },
    { grade: '9-10', count: 400, percentage: 34.8 }
  ],
  subjectPerformance: [
    { subject: 'Matemática', average: 7.5, trend: 'up', change: '+0.3', students: 850 },
    { subject: 'Português', average: 8.2, trend: 'up', change: '+0.1', students: 850 },
    { subject: 'História', average: 8.0, trend: 'stable', change: '0.0', students: 650 },
    { subject: 'Geografia', average: 7.8, trend: 'up', change: '+0.2', students: 650 },
    { subject: 'Ciências', average: 7.6, trend: 'down', change: '-0.1', students: 450 },
    { subject: 'Física', average: 7.2, trend: 'down', change: '-0.4', students: 320 },
    { subject: 'Química', average: 7.4, trend: 'up', change: '+0.2', students: 320 },
    { subject: 'Biologia', average: 8.1, trend: 'up', change: '+0.5', students: 320 }
  ],
  classPerformance: [
    { class: '6º A', students: 28, average: 8.2, attendance: 98, teacher: 'Profa. Maria Silva' },
    { class: '6º B', students: 30, average: 7.8, attendance: 96, teacher: 'Prof. João Santos' },
    { class: '7º A', students: 25, average: 8.0, attendance: 97, teacher: 'Profa. Ana Costa' },
    { class: '7º B', students: 27, average: 7.5, attendance: 94, teacher: 'Prof. Carlos Lima' },
    { class: '8º A', students: 29, average: 7.9, attendance: 95, teacher: 'Profa. Beatriz Oliveira' },
    { class: '8º B', students: 26, average: 7.6, attendance: 93, teacher: 'Prof. Pedro Mendes' },
    { class: '9º A', students: 24, average: 8.1, attendance: 97, teacher: 'Profa. Lucia Ferreira' },
    { class: '9º B', students: 28, average: 7.7, attendance: 95, teacher: 'Prof. Roberto Silva' }
  ]
}

export default function CoordinatorPerformancePage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('current')
  const [selectedCycle, setSelectedCycle] = useState('all')

  const { overview, gradeDistribution, subjectPerformance, classPerformance } = MOCK_PERFORMANCE_DATA

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Análise de Desempenho</h1>
            <p className="text-gray-600">Monitore o desempenho acadêmico da instituição</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current">Bimestre Atual</option>
              <option value="semester">Semestre</option>
              <option value="year">Ano Letivo</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <span className="material-symbols-outlined">download</span>
              <span>Exportar Relatório</span>
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Alunos</div>
            <div className="text-2xl font-bold text-gray-800">{overview.totalStudents.toLocaleString()}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 45</span>
              <span className="text-gray-500 text-sm ml-2">este ano</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média Geral</div>
            <div className="text-2xl font-bold text-gray-800">{overview.averageGrade.toFixed(1)}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 0.2</span>
              <span className="text-gray-500 text-sm ml-2">este bimestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Aprovação</div>
            <div className="text-2xl font-bold text-gray-800">{overview.approvalRate}%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2%</span>
              <span className="text-gray-500 text-sm ml-2">este ano</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Frequência</div>
            <div className="text-2xl font-bold text-gray-800">{overview.attendanceRate}%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 1%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedTab('subjects')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'subjects'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Por Disciplina
            </button>
            <button
              onClick={() => setSelectedTab('classes')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'classes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Por Turma
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Grade Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Notas</h3>
            <div className="space-y-4">
              {gradeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-16 text-sm font-medium text-gray-700">
                      {item.grade}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 w-64">
                      <div 
                        className={`h-4 rounded-full ${
                          item.grade === '9-10' ? 'bg-green-500' :
                          item.grade === '7-8' ? 'bg-blue-500' :
                          item.grade === '5-6' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${item.percentage * 2}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">{item.count} alunos</span>
                    <span className="font-medium text-gray-800">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Trends */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendências de Desempenho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Excelente (9-10)</span>
                  <span className="text-green-600 text-sm">↑ 5%</span>
                </div>
                <div className="text-2xl font-bold text-green-600">34.8%</div>
                <div className="text-xs text-gray-500">400 alunos</div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Bom (7-8)</span>
                  <span className="text-blue-600 text-sm">↑ 2%</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">45.2%</div>
                <div className="text-xs text-gray-500">520 alunos</div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Necessita Apoio (0-6)</span>
                  <span className="text-red-600 text-sm">↓ 3%</span>
                </div>
                <div className="text-2xl font-bold text-red-600">20.0%</div>
                <div className="text-xs text-gray-500">230 alunos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {selectedTab === 'subjects' && (
        <div className="space-y-4">
          {subjectPerformance.map((subject, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">school</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{subject.subject}</h3>
                    <p className="text-sm text-gray-600">{subject.students} alunos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800">{subject.average.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">Média</div>
                  </div>
                  
                  <div className={`flex items-center space-x-1 ${
                    subject.trend === 'up' ? 'text-green-600' :
                    subject.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <span className="material-symbols-outlined">
                      {subject.trend === 'up' ? 'trending_up' :
                       subject.trend === 'down' ? 'trending_down' : 'trending_flat'}
                    </span>
                    <span className="font-medium">{subject.change}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round((subject.students * 0.35))}
                  </div>
                  <div className="text-sm text-gray-600">Excelente (9-10)</div>
                </div>
                
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-semibold text-blue-600">
                    {Math.round((subject.students * 0.45))}
                  </div>
                  <div className="text-sm text-gray-600">Bom (7-8)</div>
                </div>
                
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-600">
                    {Math.round((subject.students * 0.20))}
                  </div>
                  <div className="text-sm text-gray-600">Necessita Apoio</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      subject.average >= 8 ? 'bg-green-500' :
                      subject.average >= 7 ? 'bg-blue-500' :
                      subject.average >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${(subject.average / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Classes Tab */}
      {selectedTab === 'classes' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Turma</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Professor</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Alunos</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Média</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Frequência</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {classPerformance.map((classItem, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{classItem.class}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600">{classItem.teacher}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-800">{classItem.students}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`font-medium ${
                        classItem.average >= 8 ? 'text-green-600' :
                        classItem.average >= 7 ? 'text-blue-600' :
                        classItem.average >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {classItem.average.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`font-medium ${
                        classItem.attendance >= 95 ? 'text-green-600' :
                        classItem.attendance >= 90 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {classItem.attendance}%
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        classItem.average >= 7 && classItem.attendance >= 90
                          ? 'bg-green-100 text-green-800'
                          : classItem.average >= 6 && classItem.attendance >= 85
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {classItem.average >= 7 && classItem.attendance >= 90 ? 'Excelente' :
                         classItem.average >= 6 && classItem.attendance >= 85 ? 'Atenção' : 'Crítico'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                        <button className="text-green-600 hover:text-green-800">
                          <span className="material-symbols-outlined text-sm">analytics</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}