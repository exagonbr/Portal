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
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Notas e Avaliações</h1>
            <p className="text-text-secondary">Acompanhe o desempenho acadêmico dos seus filhos</p>
          </div>
          <div className="flex space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="current">Bimestre Atual</option>
              <option value="previous">Bimestre Anterior</option>
              <option value="semester">Semestre</option>
              <option value="year">Ano Letivo</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <span className="material-symbols-outlined">download</span>
              <span>Boletim</span>
            </button>
          </div>
        </div>

        {/* Children Selector */}
        <div className="flex space-x-4 mb-6">
          {MOCK_GRADES_DATA.map((child) => (
            <button
              key={child.childId}
              onClick={() => setSelectedChild(child)}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all ${
                selectedChild.childId === child.childId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600">person</span>
              </div>
              <div className="text-left">
                <div className="font-medium text-text-primary">{child.childName}</div>
                <div className="text-sm text-text-secondary">{child.grade}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Overall Performance Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Desempenho Geral - {selectedChild.childName}</h3>
              <div className="text-4xl font-bold">{selectedChild.overallAverage.toFixed(2)}</div>
              <p className="text-blue-100 mt-2">Média geral do bimestre</p>
            </div>
            <div className="text-right">
              <div className="text-green-300 flex items-center space-x-1">
                <span className="material-symbols-outlined">trending_up</span>
                <span className="font-medium">+0.3</span>
              </div>
              <p className="text-blue-100 text-sm">vs. bimestre anterior</p>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {selectedChild.subjects.map((subject) => (
          <div key={subject.id} className="bg-background-primary rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">{subject.name}</h3>
                <p className="text-sm text-text-secondary">{subject.teacher}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                subject.status === 'Aprovado' 
                  ? 'bg-green-100 text-green-800'
                  : subject.status === 'Recuperação'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {subject.status}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">Média</span>
                <span className={`text-2xl font-bold ${
                  subject.average >= 9 ? 'text-green-600' :
                  subject.average >= 7 ? 'text-blue-600' :
                  subject.average >= 5 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {subject.average.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    subject.average >= 9 ? 'bg-green-500' :
                    subject.average >= 7 ? 'bg-blue-500' :
                    subject.average >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${(subject.average / 10) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-text-primary">Avaliações Recentes:</h4>
              {subject.grades.slice(0, 3).map((grade, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-text-secondary">{grade.type}</span>
                  <span className={`font-medium ${
                    grade.value >= 9 ? 'text-green-600' :
                    grade.value >= 7 ? 'text-blue-600' :
                    grade.value >= 5 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {grade.value.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setSelectedSubject(subject)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>

      {/* Subject Details Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-background-primary rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Detalhes - {selectedSubject.name}</h3>
              <button 
                onClick={() => setSelectedSubject(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Informações da Disciplina</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Professor:</span> {selectedSubject.teacher}</div>
                    <div><span className="font-medium">Média Atual:</span> {selectedSubject.average.toFixed(2)}</div>
                    <div><span className="font-medium">Status:</span> {selectedSubject.status}</div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Estatísticas</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Total de Avaliações:</span> {selectedSubject.grades.length}</div>
                    <div><span className="font-medium">Maior Nota:</span> {Math.max(...selectedSubject.grades.map((g: any) => g.value)).toFixed(1)}</div>
                    <div><span className="font-medium">Menor Nota:</span> {Math.min(...selectedSubject.grades.map((g: any) => g.value)).toFixed(1)}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-text-primary mb-4">Histórico de Avaliações</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-text-primary">Data</th>
                        <th className="text-left py-3 px-4 font-medium text-text-primary">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-text-primary">Descrição</th>
                        <th className="text-left py-3 px-4 font-medium text-text-primary">Peso</th>
                        <th className="text-left py-3 px-4 font-medium text-text-primary">Nota</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubject.grades.map((grade: any, index: number) => (
                        <tr key={index} className="border-b border-border">
                          <td className="py-3 px-4 text-sm text-text-secondary">
                            {new Date(grade.date).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              grade.type === 'Prova' ? 'bg-red-100 text-red-800' :
                              grade.type === 'Trabalho' ? 'bg-blue-100 text-blue-800' :
                              grade.type === 'Projeto' ? 'bg-purple-100 text-purple-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {grade.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-text-primary">{grade.description}</td>
                          <td className="py-3 px-4 text-sm text-text-secondary">{grade.weight}</td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              grade.value >= 9 ? 'text-green-600' :
                              grade.value >= 7 ? 'text-blue-600' :
                              grade.value >= 5 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {grade.value.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                  Contatar Professor
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Baixar Relatório
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}