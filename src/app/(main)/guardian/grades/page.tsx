'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_GRADES_DATA = [
  {
    childId: 1,
    childName: 'Ana Silva Santos',
    grade: '8º Ano B',
    subjects: [
      {
        id: 1,
        name: 'Matemática',
        teacher: 'Prof. João Silva',
        grades: [
          { type: 'Prova', value: 8.5, weight: 3, date: '2024-03-15', description: 'Prova Bimestral' },
          { type: 'Trabalho', value: 9.0, weight: 2, date: '2024-03-10', description: 'Trabalho em Grupo' },
          { type: 'Participação', value: 8.0, weight: 1, date: '2024-03-05', description: 'Participação em Aula' }
        ],
        average: 8.5,
        status: 'Aprovado'
      },
      {
        id: 2,
        name: 'Português',
        teacher: 'Profa. Maria Santos',
        grades: [
          { type: 'Prova', value: 8.0, weight: 3, date: '2024-03-14', description: 'Prova de Literatura' },
          { type: 'Redação', value: 8.5, weight: 2, date: '2024-03-08', description: 'Redação Dissertativa' },
          { type: 'Seminário', value: 9.0, weight: 1, date: '2024-03-01', description: 'Apresentação Oral' }
        ],
        average: 8.3,
        status: 'Aprovado'
      },
      {
        id: 3,
        name: 'História',
        teacher: 'Prof. Carlos Lima',
        grades: [
          { type: 'Prova', value: 8.8, weight: 3, date: '2024-03-13', description: 'Prova de História do Brasil' },
          { type: 'Trabalho', value: 9.2, weight: 2, date: '2024-03-06', description: 'Pesquisa Histórica' }
        ],
        average: 8.9,
        status: 'Aprovado'
      },
      {
        id: 4,
        name: 'Ciências',
        teacher: 'Profa. Ana Costa',
        grades: [
          { type: 'Prova', value: 7.9, weight: 3, date: '2024-03-12', description: 'Prova de Biologia' },
          { type: 'Experimento', value: 8.5, weight: 2, date: '2024-03-04', description: 'Experimento de Laboratório' }
        ],
        average: 8.1,
        status: 'Aprovado'
      }
    ],
    overallAverage: 8.45
  },
  {
    childId: 2,
    childName: 'Pedro Silva Santos',
    grade: '5º Ano A',
    subjects: [
      {
        id: 1,
        name: 'Matemática',
        teacher: 'Profa. Ana Costa',
        grades: [
          { type: 'Prova', value: 9.2, weight: 3, date: '2024-03-15', description: 'Prova de Frações' },
          { type: 'Exercícios', value: 9.0, weight: 2, date: '2024-03-10', description: 'Lista de Exercícios' },
          { type: 'Participação', value: 9.5, weight: 1, date: '2024-03-05', description: 'Participação em Aula' }
        ],
        average: 9.2,
        status: 'Aprovado'
      },
      {
        id: 2,
        name: 'Português',
        teacher: 'Profa. Ana Costa',
        grades: [
          { type: 'Prova', value: 9.0, weight: 3, date: '2024-03-14', description: 'Prova de Interpretação' },
          { type: 'Redação', value: 8.8, weight: 2, date: '2024-03-08', description: 'Redação Narrativa' }
        ],
        average: 8.9,
        status: 'Aprovado'
      },
      {
        id: 3,
        name: 'Ciências',
        teacher: 'Profa. Ana Costa',
        grades: [
          { type: 'Prova', value: 9.3, weight: 3, date: '2024-03-13', description: 'Prova do Sistema Solar' },
          { type: 'Projeto', value: 9.5, weight: 2, date: '2024-03-06', description: 'Projeto de Astronomia' }
        ],
        average: 9.4,
        status: 'Aprovado'
      }
    ],
    overallAverage: 9.17
  }
]

export default function GuardianGradesPage() {
  const { user } = useAuth()
  const [selectedChild, setSelectedChild] = useState(MOCK_GRADES_DATA[0])
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 dark:text-gray-800 truncate">Notas e Avaliações</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Acompanhe o desempenho acadêmico dos seus filhos</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 sm:px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            >
              <option value="current">Bimestre Atual</option>
              <option value="previous">Bimestre Anterior</option>
              <option value="semester">Semestre</option>
              <option value="year">Ano Letivo</option>
            </select>
            <button className="bg-primary text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center justify-center space-x-2 transition-colors text-sm sm:text-base">
              <span className="material-symbols-outlined text-lg sm:text-xl">download</span>
              <span>Boletim</span>
            </button>
          </div>
        </div>

        {/* Children Selector - Responsivo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          {MOCK_GRADES_DATA.map((child) => (
            <button
              key={child.childId}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-3 sm:p-4 rounded-lg border-2 transition-all w-full sm:w-auto ${
                selectedChild.childId === child.childId
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-lg sm:text-xl">person</span>
              </div>
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium text-primary text-sm sm:text-base truncate">{child.childName}</div>
                <div className="text-xs sm:text-sm text-gray-600">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Overall Performance Card - Responsivo */}
        <div className="bg-gradient-to-r from-primary to-accent-purple rounded-lg p-4 sm:p-6 text-white mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Desempenho Geral - {selectedChild.childName}</h3>
              <div className="text-3xl sm:text-4xl font-bold">{selectedChild.overallAverage.toFixed(2)}</div>
              <p className="text-blue-100 mt-2 text-sm sm:text-base">Média geral do bimestre</p>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-green-300 flex items-center justify-center sm:justify-end space-x-1">
                <span className="material-symbols-outlined">trending_up</span>
                <span className="font-medium">+0.3</span>
              </div>
              <p className="text-blue-100 text-xs sm:text-sm">vs. bimestre anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid - Responsivo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {selectedChild.subjects.map((subject) => (
          <div key={subject.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-primary truncate">{subject.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{subject.teacher}</p>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                subject.status === 'Aprovado'
                  ? 'bg-accent-green/20 text-accent-green'
                  : subject.status === 'Recuperação'
                  ? 'bg-accent-yellow/20 text-accent-yellow'
                  : 'bg-error/20 text-error'
              }`}>
                {subject.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-gray-600">Média</span>
                <span className={`text-lg sm:text-xl font-bold ${
                  subject.average >= 9 ? 'text-accent-green' :
                  subject.average >= 7 ? 'text-primary' :
                  subject.average >= 5 ? 'text-accent-yellow' : 'text-error'
                }`}>
                  {subject.average.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    subject.average >= 9 ? 'bg-accent-green' :
                    subject.average >= 7 ? 'bg-primary' :
                    subject.average >= 5 ? 'bg-accent-yellow' : 'bg-error'
                  }`}
                  style={{ width: `${(subject.average / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700">Avaliações Recentes:</h4>
              {subject.grades.slice(0, 3).map((grade, index) => (
                <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-600 truncate flex-1 mr-2">{grade.type}</span>
                  <span className={`font-medium ${
                    grade.value >= 9 ? 'text-accent-green' :
                    grade.value >= 7 ? 'text-primary' :
                    grade.value >= 5 ? 'text-accent-yellow' : 'text-error'
                  }`}>
                    {grade.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedSubject(subject)}
              className="w-full mt-4 px-3 py-2 text-xs sm:text-sm text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>

      {/* Subject Details Modal/Panel - Responsivo */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg sm:text-xl font-semibold text-primary truncate">{selectedSubject.name}</h3>
                <button
                  onClick={() => setSelectedSubject(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Professor: {selectedSubject.teacher}</p>
                <p className="text-sm text-gray-600">Média: <span className="font-semibold text-primary">{selectedSubject.average.toFixed(1)}</span></p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h4 className="font-medium text-gray-700">Todas as Avaliações:</h4>
                {selectedSubject.grades.map((grade: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-gray-700 text-sm sm:text-base truncate">{grade.description}</h5>
                        <p className="text-xs sm:text-sm text-gray-600">{grade.type} • Peso {grade.weight}</p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`text-lg sm:text-xl font-bold ${
                          grade.value >= 9 ? 'text-accent-green' :
                          grade.value >= 7 ? 'text-primary' :
                          grade.value >= 5 ? 'text-accent-yellow' : 'text-error'
                        }`}>
                          {grade.value.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500">{new Date(grade.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}