'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_CYCLES = [
  {
    id: 1,
    name: 'Ensino Fundamental I',
    description: '1º ao 5º ano do Ensino Fundamental',
    ageRange: '6 a 10 anos',
    totalStudents: 450,
    activeClasses: 18,
    subjects: ['Português', 'Matemática', 'Ciências', 'História', 'Geografia'],
    status: 'Ativo'
  },
  {
    id: 2,
    name: 'Ensino Fundamental II',
    description: '6º ao 9º ano do Ensino Fundamental',
    ageRange: '11 a 14 anos',
    totalStudents: 380,
    activeClasses: 15,
    subjects: ['Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Inglês', 'Arte', 'Educação Física'],
    status: 'Ativo'
  },
  {
    id: 3,
    name: 'Ensino Médio',
    description: '1º ao 3º ano do Ensino Médio',
    ageRange: '15 a 17 anos',
    totalStudents: 320,
    activeClasses: 12,
    subjects: ['Português', 'Matemática', 'Física', 'Química', 'Biologia', 'História', 'Geografia', 'Inglês', 'Filosofia', 'Sociologia'],
    status: 'Ativo'
  }
]

export default function CoordinatorCyclesPage() {
  const { user } = useAuth()
  const [selectedCycle, setSelectedCycle] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">Gestão de Ciclos Educacionais</h1>
            <p className="text-gray-600">Gerencie os ciclos educacionais da instituição</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark flex items-center space-x-2 transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            <span>Novo Ciclo</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Ciclos</div>
            <div className="text-2xl font-bold text-primary">3</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 0</span>
              <span className="text-gray-500 text-sm ml-2">este ano</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Alunos</div>
            <div className="text-2xl font-bold text-primary">1.150</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 45</span>
              <span className="text-gray-500 text-sm ml-2">este ano</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Turmas Ativas</div>
            <div className="text-2xl font-bold text-primary">45</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 3</span>
              <span className="text-gray-500 text-sm ml-2">este ano</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Aprovação</div>
            <div className="text-2xl font-bold text-primary">94%</div>
            <div className="mt-4 flex items-center">
              <span className="text-accent-green text-sm">↑ 2%</span>
              <span className="text-gray-500 text-sm ml-2">este ano</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cycles List */}
      <div className="space-y-6">
        {MOCK_CYCLES.map((cycle) => (
          <div key={cycle.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-primary">{cycle.name}</h3>
                <p className="text-gray-600">{cycle.description}</p>
                <p className="text-sm text-gray-500 mt-1">Faixa etária: {cycle.ageRange}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  cycle.status === 'Ativo'
                    ? 'bg-accent-green/20 text-accent-green'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {cycle.status}
                </span>
                <button className="text-gray-400 hover:text-gray-600">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary">{cycle.totalStudents}</div>
                <div className="text-sm text-gray-600">Total de Alunos</div>
              </div>
              <div className="text-center p-4 bg-accent-green/10 rounded-lg">
                <div className="text-2xl font-bold text-accent-green">{cycle.activeClasses}</div>
                <div className="text-sm text-gray-600">Turmas Ativas</div>
              </div>
              <div className="text-center p-4 bg-accent-purple/10 rounded-lg">
                <div className="text-2xl font-bold text-accent-purple">{cycle.subjects.length}</div>
                <div className="text-sm text-gray-600">Disciplinas</div>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Disciplinas do Ciclo:</h4>
              <div className="flex flex-wrap gap-2">
                {cycle.subjects.map((subject, index) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button className="text-primary hover:text-primary-dark flex items-center space-x-1 transition-colors">
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Visualizar</span>
              </button>
              <button className="text-accent-green hover:text-accent-green/80 flex items-center space-x-1 transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
                <span>Editar</span>
              </button>
              <button className="text-accent-purple hover:text-accent-purple/80 flex items-center space-x-1 transition-colors">
                <span className="material-symbols-outlined text-sm">analytics</span>
                <span>Relatórios</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for New Cycle */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Novo Ciclo Educacional</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Ciclo</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Ensino Fundamental I"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Descrição do ciclo educacional"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Faixa Etária</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 6 a 10 anos"
                />
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
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Criar Ciclo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}