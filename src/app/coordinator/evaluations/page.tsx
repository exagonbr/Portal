'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_EVALUATIONS = [
  {
    id: 1,
    title: 'Avaliação Bimestral - Matemática',
    subject: 'Matemática',
    grade: '9º Ano',
    teacher: 'Prof. João Silva',
    type: 'Prova',
    date: '2024-03-15',
    duration: '2h',
    totalQuestions: 20,
    studentsCompleted: 28,
    totalStudents: 30,
    averageScore: 7.8,
    status: 'Finalizada'
  },
  {
    id: 2,
    title: 'Trabalho em Grupo - História',
    subject: 'História',
    grade: '8º Ano',
    teacher: 'Profa. Maria Santos',
    type: 'Trabalho',
    date: '2024-03-20',
    duration: '1 semana',
    totalQuestions: 5,
    studentsCompleted: 25,
    totalStudents: 25,
    averageScore: 8.2,
    status: 'Finalizada'
  },
  {
    id: 3,
    title: 'Simulado ENEM - Português',
    subject: 'Português',
    grade: '3º Médio',
    teacher: 'Prof. Carlos Oliveira',
    type: 'Simulado',
    date: '2024-03-25',
    duration: '4h',
    totalQuestions: 45,
    studentsCompleted: 18,
    totalStudents: 22,
    averageScore: 6.5,
    status: 'Em andamento'
  },
  {
    id: 4,
    title: 'Prova de Recuperação - Física',
    subject: 'Física',
    grade: '2º Médio',
    teacher: 'Profa. Ana Costa',
    type: 'Recuperação',
    date: '2024-03-30',
    duration: '1h30',
    totalQuestions: 15,
    studentsCompleted: 0,
    totalStudents: 8,
    averageScore: 0,
    status: 'Agendada'
  }
]

const PERFORMANCE_DATA = [
  { subject: 'Matemática', average: 7.8, trend: 'up', change: '+0.3' },
  { subject: 'Português', average: 8.1, trend: 'up', change: '+0.2' },
  { subject: 'História', average: 8.2, trend: 'stable', change: '0.0' },
  { subject: 'Física', average: 7.2, trend: 'down', change: '-0.4' },
  { subject: 'Química', average: 7.5, trend: 'up', change: '+0.1' },
  { subject: 'Biologia', average: 8.0, trend: 'up', change: '+0.5' }
]

export default function CoordinatorEvaluationsPage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState('evaluations')
  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [gradeFilter, setGradeFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filteredEvaluations = MOCK_EVALUATIONS.filter(evaluation => {
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter
    const matchesSubject = subjectFilter === 'all' || evaluation.subject === subjectFilter
    const matchesGrade = gradeFilter === 'all' || evaluation.grade === gradeFilter
    
    return matchesStatus && matchesSubject && matchesGrade
  })

  const allSubjects = Array.from(new Set(MOCK_EVALUATIONS.map(evaluation => evaluation.subject)))
  const allGrades = Array.from(new Set(MOCK_EVALUATIONS.map(evaluation => evaluation.grade)))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Avaliações</h1>
            <p className="text-gray-600">Monitore e gerencie as avaliações da instituição</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nova Avaliação</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Avaliações</div>
            <div className="text-2xl font-bold text-gray-800">{MOCK_EVALUATIONS.length}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 3</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Finalizadas</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_EVALUATIONS.filter(e => e.status === 'Finalizada').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2</span>
              <span className="text-gray-500 text-sm ml-2">esta semana</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média Geral</div>
            <div className="text-2xl font-bold text-gray-800">
              {(MOCK_EVALUATIONS.filter(e => e.status === 'Finalizada')
                .reduce((acc, e) => acc + e.averageScore, 0) / 
                MOCK_EVALUATIONS.filter(e => e.status === 'Finalizada').length).toFixed(1)}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 0.2</span>
              <span className="text-gray-500 text-sm ml-2">este bimestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Participação</div>
            <div className="text-2xl font-bold text-gray-800">92%</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 3%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('evaluations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'evaluations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Avaliações
            </button>
            <button
              onClick={() => setSelectedTab('performance')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'performance'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Desempenho por Disciplina
            </button>
          </nav>
        </div>
      </div>

      {selectedTab === 'evaluations' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="Agendada">Agendada</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Finalizada">Finalizada</option>
            </select>
            
            <select 
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Disciplinas</option>
              {allSubjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            
            <select 
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Séries</option>
              {allGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>

          {/* Evaluations List */}
          <div className="space-y-4">
            {filteredEvaluations.map((evaluation) => (
              <div key={evaluation.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{evaluation.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{evaluation.subject} • {evaluation.grade}</span>
                      <span>Por: {evaluation.teacher}</span>
                      <span>Data: {new Date(evaluation.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      evaluation.status === 'Finalizada' 
                        ? 'bg-green-100 text-green-800'
                        : evaluation.status === 'Em andamento'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {evaluation.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      evaluation.type === 'Prova' 
                        ? 'bg-purple-100 text-purple-800'
                        : evaluation.type === 'Trabalho'
                        ? 'bg-orange-100 text-orange-800'
                        : evaluation.type === 'Simulado'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {evaluation.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-800">{evaluation.totalQuestions}</div>
                    <div className="text-sm text-gray-600">Questões</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">{evaluation.duration}</div>
                    <div className="text-sm text-gray-600">Duração</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {evaluation.studentsCompleted}/{evaluation.totalStudents}
                    </div>
                    <div className="text-sm text-gray-600">Participação</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-semibold text-yellow-600">
                      {evaluation.averageScore > 0 ? evaluation.averageScore.toFixed(1) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">Média</div>
                  </div>
                </div>

                {evaluation.status === 'Finalizada' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Taxa de Participação</span>
                      <span className="text-gray-800">
                        {Math.round((evaluation.studentsCompleted / evaluation.totalStudents) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(evaluation.studentsCompleted / evaluation.totalStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">visibility</span>
                    <span>Ver Detalhes</span>
                  </button>
                  <button className="text-green-600 hover:text-green-800 flex items-center space-x-1">
                    <span className="material-symbols-outlined text-sm">analytics</span>
                    <span>Relatório</span>
                  </button>
                  {evaluation.status !== 'Finalizada' && (
                    <button className="text-purple-600 hover:text-purple-800 flex items-center space-x-1">
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>Editar</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Desempenho por Disciplina</h3>
            <div className="space-y-4">
              {PERFORMANCE_DATA.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-blue-600">school</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">{item.subject}</h4>
                      <p className="text-sm text-gray-600">Média: {item.average.toFixed(1)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`flex items-center space-x-1 ${
                        item.trend === 'up' ? 'text-green-600' :
                        item.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        <span className="material-symbols-outlined text-sm">
                          {item.trend === 'up' ? 'trending_up' :
                           item.trend === 'down' ? 'trending_down' : 'trending_flat'}
                        </span>
                        <span className="text-sm font-medium">{item.change}</span>
                      </div>
                    </div>
                    
                    <div className="w-32">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.average >= 8 ? 'bg-green-500' :
                            item.average >= 7 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(item.average / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Evaluation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nova Avaliação</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Avaliação</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Prova Bimestral - Matemática"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Matemática</option>
                    <option>Português</option>
                    <option>História</option>
                    <option>Geografia</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>6º Ano</option>
                    <option>7º Ano</option>
                    <option>8º Ano</option>
                    <option>9º Ano</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Prova</option>
                    <option>Trabalho</option>
                    <option>Simulado</option>
                    <option>Recuperação</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 2h ou 1 semana"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Descrição da avaliação e instruções"
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar Avaliação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}