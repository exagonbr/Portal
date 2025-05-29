'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

const MOCK_TEACHERS = [
  {
    id: 1,
    name: 'Prof. João Silva',
    email: 'joao.silva@escola.com',
    phone: '(11) 99999-1111',
    subjects: ['Matemática', 'Física'],
    classes: ['9º A', '9º B', '1º Médio A'],
    experience: '8 anos',
    qualification: 'Mestrado em Matemática',
    performance: 4.8,
    status: 'Ativo',
    avatar: '/avatars/teacher1.jpg',
    totalStudents: 85,
    weeklyHours: 20
  },
  {
    id: 2,
    name: 'Profa. Maria Santos',
    email: 'maria.santos@escola.com',
    phone: '(11) 99999-2222',
    subjects: ['Português', 'Literatura'],
    classes: ['8º A', '8º B', '9º A'],
    experience: '12 anos',
    qualification: 'Doutorado em Letras',
    performance: 4.9,
    status: 'Ativo',
    avatar: '/avatars/teacher2.jpg',
    totalStudents: 78,
    weeklyHours: 18
  },
  {
    id: 3,
    name: 'Prof. Carlos Oliveira',
    email: 'carlos.oliveira@escola.com',
    phone: '(11) 99999-3333',
    subjects: ['História', 'Geografia'],
    classes: ['7º A', '7º B'],
    experience: '5 anos',
    qualification: 'Especialização em História',
    performance: 4.6,
    status: 'Licença',
    avatar: '/avatars/teacher3.jpg',
    totalStudents: 56,
    weeklyHours: 16
  },
  {
    id: 4,
    name: 'Profa. Ana Costa',
    email: 'ana.costa@escola.com',
    phone: '(11) 99999-4444',
    subjects: ['Ciências', 'Biologia'],
    classes: ['6º A', '6º B', '7º A'],
    experience: '10 anos',
    qualification: 'Mestrado em Biologia',
    performance: 4.7,
    status: 'Ativo',
    avatar: '/avatars/teacher4.jpg',
    totalStudents: 92,
    weeklyHours: 22
  }
]

export default function CoordinatorTeachersPage() {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)

  const filteredTeachers = MOCK_TEACHERS.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter
    const matchesSubject = subjectFilter === 'all' || teacher.subjects.includes(subjectFilter)
    
    return matchesSearch && matchesStatus && matchesSubject
  })

  const allSubjects = Array.from(new Set(MOCK_TEACHERS.flatMap(teacher => teacher.subjects)))

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão do Corpo Docente</h1>
            <p className="text-gray-600">Monitore e gerencie o desempenho dos professores</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <span className="material-symbols-outlined">person_add</span>
            <span>Novo Professor</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Professores</div>
            <div className="text-2xl font-bold text-gray-800">{MOCK_TEACHERS.length}</div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 2</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Professores Ativos</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_TEACHERS.filter(t => t.status === 'Ativo').length}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">→ 0</span>
              <span className="text-gray-500 text-sm ml-2">este mês</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Avaliação Média</div>
            <div className="text-2xl font-bold text-gray-800">
              {(MOCK_TEACHERS.reduce((acc, t) => acc + t.performance, 0) / MOCK_TEACHERS.length).toFixed(1)}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 0.2</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total de Alunos</div>
            <div className="text-2xl font-bold text-gray-800">
              {MOCK_TEACHERS.reduce((acc, t) => acc + t.totalStudents, 0)}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-green-500 text-sm">↑ 15</span>
              <span className="text-gray-500 text-sm ml-2">este semestre</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Licença">Em Licença</option>
            <option value="Inativo">Inativo</option>
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
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">person</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.email}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                teacher.status === 'Ativo' 
                  ? 'bg-green-100 text-green-800'
                  : teacher.status === 'Licença'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {teacher.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Disciplinas:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {teacher.subjects.map((subject, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Turmas:</p>
                <p className="text-sm text-gray-600">{teacher.classes.join(', ')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Experiência</p>
                  <p className="text-gray-600">{teacher.experience}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Alunos</p>
                  <p className="text-gray-600">{teacher.totalStudents}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Avaliação</span>
                  <span className="text-sm text-gray-600">{teacher.performance}/5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full" 
                    style={{ width: `${(teacher.performance / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSelectedTeacher(teacher)}
                className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-sm">visibility</span>
                <span>Ver Detalhes</span>
              </button>
              <div className="flex space-x-2">
                <button className="text-green-600 hover:text-green-800">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button className="text-purple-600 hover:text-purple-800">
                  <span className="material-symbols-outlined text-sm">analytics</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Detalhes do Professor</h3>
              <button 
                onClick={() => setSelectedTeacher(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-2xl">person</span>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedTeacher.name}</h4>
                  <p className="text-gray-600">{selectedTeacher.qualification}</p>
                  <p className="text-sm text-gray-500">{selectedTeacher.experience} de experiência</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">{selectedTeacher.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Telefone</p>
                  <p className="text-gray-600">{selectedTeacher.phone}</p>
                </div>
              </div>

              {/* Teaching Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-gray-700 mb-2">Disciplinas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTeacher.subjects.map((subject: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-700 mb-2">Turmas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedTeacher.classes.map((className: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {className}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedTeacher.totalStudents}</div>
                  <div className="text-sm text-gray-600">Total de Alunos</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedTeacher.weeklyHours}h</div>
                  <div className="text-sm text-gray-600">Carga Horária Semanal</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{selectedTeacher.performance}</div>
                  <div className="text-sm text-gray-600">Avaliação Média</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
                  Editar Perfil
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Ver Relatórios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Teacher Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Professor</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do professor"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@escola.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input 
                    type="tel" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualificação</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Mestrado em Matemática"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Disciplinas</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Disciplinas separadas por vírgula"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Adicionar Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}