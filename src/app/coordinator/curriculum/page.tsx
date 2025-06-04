'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_CURRICULUM = [
  {
    id: 1,
    cycle: 'Ensino Fundamental I',
    grade: '1º Ano',
    subjects: [
      {
        id: 1,
        name: 'Português',
        weeklyHours: 5,
        totalHours: 200,
        competencies: ['Alfabetização', 'Leitura', 'Escrita'],
        status: 'Aprovado'
      },
      {
        id: 2,
        name: 'Matemática',
        weeklyHours: 5,
        totalHours: 200,
        competencies: ['Números', 'Operações básicas', 'Geometria'],
        status: 'Aprovado'
      },
      {
        id: 3,
        name: 'Ciências',
        weeklyHours: 3,
        totalHours: 120,
        competencies: ['Corpo humano', 'Natureza', 'Meio ambiente'],
        status: 'Em revisão'
      }
    ]
  },
  {
    id: 2,
    cycle: 'Ensino Fundamental II',
    grade: '6º Ano',
    subjects: [
      {
        id: 4,
        name: 'Português',
        weeklyHours: 5,
        totalHours: 200,
        competencies: ['Interpretação de texto', 'Gramática', 'Produção textual'],
        status: 'Aprovado'
      },
      {
        id: 5,
        name: 'Matemática',
        weeklyHours: 5,
        totalHours: 200,
        competencies: ['Álgebra básica', 'Geometria', 'Estatística'],
        status: 'Aprovado'
      },
      {
        id: 6,
        name: 'História',
        weeklyHours: 3,
        totalHours: 120,
        competencies: ['História antiga', 'Civilizações', 'Cultura'],
        status: 'Pendente'
      }
    ]
  }
]

export default function CoordinatorCurriculumPage() {
  const { user } = useAuth()
  const [selectedCycle, setSelectedCycle] = useState('all')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState<any>(null)

  const filteredCurriculum = MOCK_CURRICULUM.filter(item => {
    if (selectedCycle !== 'all' && item.cycle !== selectedCycle) return false
    if (selectedGrade !== 'all' && item.grade !== selectedGrade) return false
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Gestão Curricular</h1>
            <p className="text-gray-600">Gerencie o currículo e competências por ciclo educacional</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Nova Disciplina</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <select 
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todos os Ciclos</option>
            <option value="Ensino Fundamental I">Ensino Fundamental I</option>
            <option value="Ensino Fundamental II">Ensino Fundamental II</option>
            <option value="Ensino Médio">Ensino Médio</option>
          </select>
          
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas as Séries</option>
            <option value="1º Ano">1º Ano</option>
            <option value="2º Ano">2º Ano</option>
            <option value="3º Ano">3º Ano</option>
            <option value="6º Ano">6º Ano</option>
            <option value="7º Ano">7º Ano</option>
            <option value="8º Ano">8º Ano</option>
            <option value="9º Ano">9º Ano</option>
          </select>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Disciplinas</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">24</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 2</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Carga Horária Total</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">3.840h</div>
            <div className="mt-4 flex items-center">
              <span className="text-primary text-sm">→ 0h</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Aprovadas</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">18</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 3</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Em Revisão</div>
            <div className="text-3xl font-bold text-gray-700 dark:text-gray-800">6</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-yellow text-sm">↓ 2</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum List */}
      <div className="space-y-6">
        {filteredCurriculum.map((curriculumItem) => (
          <div key={curriculumItem.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold text-primary">{curriculumItem.cycle}</h3>
                <p className="text-gray-600">{curriculumItem.grade}</p>
              </div>
              <button className="text-primary hover:text-primary-dark flex items-center space-x-1 transition-colors">
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Exportar Grade</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-primary">Disciplina</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Carga Horária</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Competências</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-primary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {curriculumItem.subjects.map((subject) => (
                    <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-primary-dark">{subject.name}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">
                          {subject.weeklyHours}h/semana
                        </div>
                        <div className="text-xs text-gray-500">
                          {subject.totalHours}h total
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {subject.competencies.slice(0, 2).map((competency, index) => (
                            <span key={index} className="px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                              {competency}
                            </span>
                          ))}
                          {subject.competencies.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{subject.competencies.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          subject.status === 'Aprovado'
                            ? 'bg-accent-green/20 text-accent-green'
                            : subject.status === 'Em revisão'
                            ? 'bg-accent-yellow/20 text-accent-yellow'
                            : 'bg-error/20 text-error'
                        }`}>
                          {subject.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setEditingSubject(subject)}
                            className="text-primary hover:text-primary-dark transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button className="text-accent-green hover:text-accent-green/80 transition-colors">
                            <span className="material-symbols-outlined text-sm">visibility</span>
                          </button>
                          <button className="text-error hover:text-error/80 transition-colors">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for New/Edit Subject */}
      {(showModal || editingSubject) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">
                {editingSubject ? 'Editar Disciplina' : 'Nova Disciplina'}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false)
                  setEditingSubject(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciclo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Ensino Fundamental I</option>
                    <option>Ensino Fundamental II</option>
                    <option>Ensino Médio</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>1º Ano</option>
                    <option>2º Ano</option>
                    <option>3º Ano</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Disciplina</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Matemática"
                  defaultValue={editingSubject?.name}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária Semanal</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="5"
                    defaultValue={editingSubject?.weeklyHours}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária Total</label>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="200"
                    defaultValue={editingSubject?.totalHours}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Competências</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                  placeholder="Digite as competências separadas por vírgula"
                  defaultValue={editingSubject?.competencies?.join(', ')}
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingSubject(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {editingSubject ? 'Salvar Alterações' : 'Criar Disciplina'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}