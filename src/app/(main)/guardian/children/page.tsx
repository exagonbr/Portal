'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_CHILDREN = [
  {
    id: 1,
    name: 'Ana Silva Santos',
    photo: '/avatars/student1.jpg',
    grade: '8º Ano B',
    school: 'Escola Municipal João da Silva',
    studentId: '2024001',
    birthDate: '2010-05-15',
    age: 13,
    status: 'Ativo',
    academicInfo: {
      currentAverage: 8.2,
      attendance: 96,
      behavior: 'Excelente',
      lastEvaluation: '2024-03-15'
    },
    recentGrades: [
      { subject: 'Matemática', grade: 8.5, date: '2024-03-15' },
      { subject: 'Português', grade: 8.0, date: '2024-03-14' },
      { subject: 'História', grade: 8.8, date: '2024-03-13' },
      { subject: 'Ciências', grade: 7.9, date: '2024-03-12' }
    ],
    upcomingEvents: [
      { type: 'Prova', subject: 'Matemática', date: '2024-03-25' },
      { type: 'Trabalho', subject: 'História', date: '2024-03-28' },
      { type: 'Reunião de Pais', date: '2024-04-02' }
    ],
    teachers: [
      { name: 'Prof. João Silva', subject: 'Matemática', contact: 'joao.silva@escola.com' },
      { name: 'Profa. Maria Santos', subject: 'Português', contact: 'maria.santos@escola.com' },
      { name: 'Prof. Carlos Lima', subject: 'História', contact: 'carlos.lima@escola.com' }
    ]
  },
  {
    id: 2,
    name: 'Pedro Silva Santos',
    photo: '/avatars/student2.jpg',
    grade: '5º Ano A',
    school: 'Escola Municipal João da Silva',
    studentId: '2024002',
    birthDate: '2014-08-22',
    age: 9,
    status: 'Ativo',
    academicInfo: {
      currentAverage: 9.1,
      attendance: 98,
      behavior: 'Muito Bom',
      lastEvaluation: '2024-03-15'
    },
    recentGrades: [
      { subject: 'Matemática', grade: 9.2, date: '2024-03-15' },
      { subject: 'Português', grade: 9.0, date: '2024-03-14' },
      { subject: 'Ciências', grade: 9.3, date: '2024-03-13' },
      { subject: 'Geografia', grade: 8.8, date: '2024-03-12' }
    ],
    upcomingEvents: [
      { type: 'Prova', subject: 'Português', date: '2024-03-26' },
      { type: 'Apresentação', subject: 'Ciências', date: '2024-03-29' }
    ],
    teachers: [
      { name: 'Profa. Ana Costa', subject: 'Polivalente', contact: 'ana.costa@escola.com' },
      { name: 'Prof. Roberto Lima', subject: 'Educação Física', contact: 'roberto.lima@escola.com' }
    ]
  }
]

export default function GuardianChildrenPage() {
  const { user } = useAuth()
  const [selectedChild, setSelectedChild] = useState(MOCK_CHILDREN[0])
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-800 truncate">Meus Filhos</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Acompanhe o desenvolvimento acadêmico dos seus filhos</p>
          </div>
          <button className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-dark flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base w-full sm:w-auto">
            <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
            <span className="hidden sm:inline">Relatório Completo</span>
            <span className="sm:hidden">Relatório</span>
          </button>
        </div>

        {/* Children Selector - Responsivo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          {MOCK_CHILDREN.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all w-full sm:w-auto ${
                selectedChild.id === child.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-lg sm:text-xl">person</span>
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium text-primary-dark text-sm sm:text-base truncate">{child.name}</div>
                <div className="text-xs sm:text-sm text-gray-600">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Overview Cards - Grid responsivo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Média Atual</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.academicInfo.currentAverage}</div>
            <div className="mt-2 sm:mt-4 flex items-center">
              <span className="text-accent-green text-xs sm:text-sm">↑ 0.3</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1 sm:ml-2">este bimestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Frequência</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.academicInfo.attendance}%</div>
            <div className="mt-2 sm:mt-4 flex items-center">
              <span className="text-accent-green text-xs sm:text-sm">↑ 2%</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1 sm:ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Comportamento</div>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700 dark:text-gray-800 truncate">{selectedChild.academicInfo.behavior}</div>
            <div className="mt-2 sm:mt-4 flex items-center">
              <span className="text-accent-green text-xs sm:text-sm">→ 0</span>
              <span className="text-gray-500 text-xs sm:text-sm ml-1 sm:ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-2 lg:col-span-1">
            <div className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Idade</div>
            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.age} anos</div>
            <div className="mt-2 sm:mt-4 flex items-center">
              <span className="text-gray-500 text-xs sm:text-sm">{selectedChild.grade}</span>
            </div>
          </div>
        </div>

        {/* Tabs - Responsivo com scroll horizontal em mobile */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                selectedTab === 'overview'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedTab('grades')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                selectedTab === 'grades'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notas Recentes
            </button>
            <button
              onClick={() => setSelectedTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                selectedTab === 'schedule'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximos Eventos
            </button>
            <button
              onClick={() => setSelectedTab('teachers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                selectedTab === 'teachers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Professores
            </button>
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Student Profile */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Perfil do Estudante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-500">Nome Completo:</span>
                  <span className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-0">{selectedChild.name}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-500">Matrícula:</span>
                  <span className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-0">{selectedChild.studentId}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-500">Turma:</span>
                  <span className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-0">{selectedChild.grade}</span>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-500">Data de Nascimento:</span>
                  <span className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-0">{new Date(selectedChild.birthDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-500">Escola:</span>
                  <span className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-0 break-words">{selectedChild.school}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <span className="text-sm font-medium text-gray-500">Status:</span>
                  <span className="text-sm sm:text-base text-accent-green font-medium mt-1 sm:mt-0">{selectedChild.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Performance */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Desempenho Recente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{selectedChild.academicInfo.currentAverage}</div>
                <div className="text-sm text-gray-600 mt-1">Média Atual</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl sm:text-3xl font-bold text-accent-green">{selectedChild.academicInfo.attendance}%</div>
                <div className="text-sm text-gray-600 mt-1">Frequência</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg sm:col-span-2 lg:col-span-1">
                <div className="text-lg sm:text-xl font-bold text-accent-blue">{selectedChild.academicInfo.behavior}</div>
                <div className="text-sm text-gray-600 mt-1">Comportamento</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grades Tab */}
      {selectedTab === 'grades' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Notas Recentes</h3>
            <div className="space-y-3 sm:space-y-4">
              {selectedChild.recentGrades.map((grade, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-700 text-sm sm:text-base">{grade.subject}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">{new Date(grade.date).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/20 text-primary">
                      {grade.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {selectedTab === 'schedule' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Próximos Eventos</h3>
            <div className="space-y-3 sm:space-y-4">
              {selectedChild.upcomingEvents.map((event, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-700 text-sm sm:text-base">{event.type}</div>
                    {event.subject && <div className="text-xs sm:text-sm text-gray-600 mt-1">{event.subject}</div>}
                  </div>
                  <div className="mt-2 sm:mt-0 sm:ml-4">
                    <span className="text-xs sm:text-sm text-gray-500">{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Teachers Tab */}
      {selectedTab === 'teachers' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">Professores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {selectedChild.teachers.map((teacher, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-700 text-sm sm:text-base">{teacher.name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">{teacher.subject}</div>
                  <div className="text-xs sm:text-sm text-primary mt-2 break-all">{teacher.contact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}