'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_CURRICULUM = [
  {
    id: 1,
    grade: '6º Ano',
    subjects: [
      { name: 'Matemática', hours: 5, teacher: 'Prof. João Silva' },
      { name: 'Português', hours: 5, teacher: 'Profa. Maria Santos' },
      { name: 'História', hours: 3, teacher: 'Prof. Carlos Lima' },
      { name: 'Geografia', hours: 3, teacher: 'Profa. Ana Costa' },
      { name: 'Ciências', hours: 4, teacher: 'Prof. Pedro Oliveira' },
      { name: 'Educação Física', hours: 2, teacher: 'Prof. Lucas Ferreira' }
    ]
  },
  {
    id: 2,
    grade: '7º Ano',
    subjects: [
      { name: 'Matemática', hours: 5, teacher: 'Prof. João Silva' },
      { name: 'Português', hours: 5, teacher: 'Profa. Maria Santos' },
      { name: 'História', hours: 3, teacher: 'Prof. Carlos Lima' },
      { name: 'Geografia', hours: 3, teacher: 'Profa. Ana Costa' },
      { name: 'Ciências', hours: 4, teacher: 'Prof. Pedro Oliveira' },
      { name: 'Inglês', hours: 2, teacher: 'Profa. Julia Brown' }
    ]
  }
]

export default function InstitutionCurriculumPage() {
  const { user } = useAuth()
  const [selectedGrade, setSelectedGrade] = useState(MOCK_CURRICULUM[0])
  const [showEditModal, setShowEditModal] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Currículo Escolar</h1>
            <p className="text-gray-600">Gestão do currículo e grade curricular</p>
          </div>
          <button 
            onClick={() => setShowEditModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">edit</span>
            <span>Editar Currículo</span>
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          {MOCK_CURRICULUM.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                selectedGrade.id === grade.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {grade.grade}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Grade Curricular - {selectedGrade.grade}
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Disciplina</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Carga Horária</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Professor</th>
                <th className="text-left py-3 px-6 font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {selectedGrade.subjects.map((subject, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 font-medium text-gray-800">{subject.name}</td>
                  <td className="py-4 px-6 text-gray-600">{subject.hours}h/semana</td>
                  <td className="py-4 px-6 text-gray-600">{subject.teacher}</td>
                  <td className="py-4 px-6">
                    <button className="text-blue-600 hover:text-blue-800">
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Total de Disciplinas:</span>
              <span className="ml-2 text-gray-600">{selectedGrade.subjects.length}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Carga Horária Total:</span>
              <span className="ml-2 text-gray-600">
                {selectedGrade.subjects.reduce((total, subject) => total + subject.hours, 0)}h/semana
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Professores:</span>
              <span className="ml-2 text-gray-600">
                {new Set(selectedGrade.subjects.map(s => s.teacher)).size}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Editar Currículo - {selectedGrade.grade}</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedGrade.subjects.map((subject, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                    <input 
                      type="text" 
                      defaultValue={subject.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária</label>
                    <input 
                      type="number" 
                      defaultValue={subject.hours}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Professor</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>{subject.teacher}</option>
                      <option>Prof. João Silva</option>
                      <option>Profa. Maria Santos</option>
                      <option>Prof. Carlos Lima</option>
                    </select>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}