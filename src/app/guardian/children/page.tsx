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
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Meus Filhos</h1>
            <p className="text-gray-600">Acompanhe o desenvolvimento acadêmico dos seus filhos</p>
          </div>
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors">
            <span className="material-symbols-outlined">download</span>
            <span>Relatório Completo</span>
          </button>
        </div>

        {/* Children Selector */}
        <div className="flex space-x-4 mb-6">
          {MOCK_CHILDREN.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                selectedChild.id === child.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">person</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-primary-dark">{child.name}</div>
                <div className="text-sm text-gray-600">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Média Atual</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.academicInfo.currentAverage}</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 0.3</span>
              <span className="text-gray-500 text-sm ml-2">este bimestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Frequência</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.academicInfo.attendance}%</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 2%</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Comportamento</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.academicInfo.behavior}</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">→ 0</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Idade</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">{selectedChild.age} anos</div>
            <div className="mt-4 flex items-center">
              <span className="text-gray-500 text-sm">{selectedChild.grade}</span>
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
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setSelectedTab('grades')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'grades'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notas Recentes
            </button>
            <button
              onClick={() => setSelectedTab('schedule')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'schedule'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Próximos Eventos
            </button>
            <button
              onClick={() => setSelectedTab('teachers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
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
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Perfil do Aluno</h3>
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">person</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-primary">{selectedChild.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Matrícula: {selectedChild.studentId}</p>
                    <p className="text-sm text-gray-600">Turma: {selectedChild.grade}</p>
                    <p className="text-sm text-gray-600">Escola: {selectedChild.school}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Data de Nascimento: {new Date(selectedChild.birthDate).toLocaleDateString('pt-BR')}</p>
                    <p className="text-sm text-gray-600">Idade: {selectedChild.age} anos</p>
                    <p className="text-sm text-gray-600">Status: {selectedChild.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Resumo Acadêmico</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary-dark mb-3">Desempenho Atual</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Média Geral:</span>
                    <span className="font-semibold text-primary">{selectedChild.academicInfo.currentAverage}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Frequência:</span>
                    <span className="font-semibold text-primary">{selectedChild.academicInfo.attendance}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Comportamento:</span>
                    <span className="font-semibold text-primary">{selectedChild.academicInfo.behavior}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-primary-dark mb-3">Última Avaliação</h4>
                <p className="text-gray-600">
                  {new Date(selectedChild.academicInfo.lastEvaluation).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grades Tab */}
      {selectedTab === 'grades' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Notas Recentes</h3>
          <div className="space-y-4">
            {selectedChild.recentGrades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-sm">school</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">{grade.subject}</h4>
                    <p className="text-sm text-gray-600">{new Date(grade.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    grade.grade >= 9 ? 'text-accent-green' :
                    grade.grade >= 7 ? 'text-primary' :
                    grade.grade >= 5 ? 'text-accent-yellow' : 'text-error'
                  }`}>
                    {grade.grade.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {selectedTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Próximos Eventos</h3>
          <div className="space-y-4">
            {selectedChild.upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    event.type === 'Prova' ? 'bg-error/20' :
                    event.type === 'Trabalho' ? 'bg-primary/20' :
                    event.type === 'Apresentação' ? 'bg-accent-purple/20' : 'bg-accent-green/20'
                  }`}>
                    <span className={`material-symbols-outlined text-sm ${
                      event.type === 'Prova' ? 'text-error' :
                      event.type === 'Trabalho' ? 'text-primary' :
                      event.type === 'Apresentação' ? 'text-accent-purple' : 'text-accent-green'
                    }`}>
                      {event.type === 'Prova' ? 'quiz' :
                       event.type === 'Trabalho' ? 'assignment' :
                       event.type === 'Apresentação' ? 'presentation' : 'event'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">{event.type}</h4>
                    <p className="text-sm text-gray-600">
                      {event.subject ? `${event.subject} - ` : ''}{new Date(event.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  event.type === 'Prova' ? 'bg-error/20 text-error' :
                  event.type === 'Trabalho' ? 'bg-primary/20 text-primary' :
                  event.type === 'Apresentação' ? 'bg-accent-purple/20 text-accent-purple' : 'bg-accent-green/20 text-accent-green'
                }`}>
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Teachers Tab */}
      {selectedTab === 'teachers' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-primary mb-4">Professores</h3>
          <div className="space-y-4">
            {selectedChild.teachers.map((teacher, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-accent-purple/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-accent-purple">person</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-primary">{teacher.name}</h4>
                    <p className="text-sm text-gray-600">{teacher.subject}</p>
                    <p className="text-xs text-gray-500">{teacher.contact}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="text-primary hover:text-primary-dark flex items-center space-x-1 transition-colors">
                    <span className="material-symbols-outlined text-sm">mail</span>
                    <span className="text-sm">Contatar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}