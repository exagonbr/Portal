'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ClassEditModal from '@/components/ClassEditModal'

interface ClassData {
  id: string;
  name: string;
  period: 'Manhã' | 'Tarde' | 'Noite' | 'Integral';
  status: 'Ativa' | 'Inativa' | 'Em Planejamento';
  teacher: string;
  teacherId?: string;
  maxStudents: number;
  currentStudents: number;
  averageGrade: number;
  attendanceRate: number;
  room?: string;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  subjects?: string[];
  level?: string;
  academicYear?: string;
}

export default function InstitutionClassesPage() {
  const { user } = useAuth()
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewClass, setIsNewClass] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPeriod, setFilterPeriod] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortBy, setSortBy] = useState('name')

  // Mock data - replace with actual API call
  const [classes, setClasses] = useState<ClassData[]>([
    {
      id: '1',
      name: 'Turma A',
      period: 'Manhã',
      status: 'Ativa',
      teacher: 'João Silva',
      maxStudents: 35,
      currentStudents: 32,
      averageGrade: 8.2,
      attendanceRate: 94,
      room: 'Sala 101',
      academicYear: '2025',
      subjects: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia']
    },
    {
      id: '2',
      name: 'Turma B',
      period: 'Tarde',
      status: 'Ativa',
      teacher: 'Maria Oliveira',
      maxStudents: 35,
      currentStudents: 28,
      averageGrade: 7.8,
      attendanceRate: 92,
      room: 'Sala 102',
      academicYear: '2025',
      subjects: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia']
    },
    {
      id: '3',
      name: 'Turma C',
      period: 'Manhã',
      status: 'Ativa',
      teacher: 'Pedro Santos',
      maxStudents: 30,
      currentStudents: 30,
      averageGrade: 8.5,
      attendanceRate: 96,
      room: 'Sala 103',
      academicYear: '2025',
      subjects: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês']
    },
    {
      id: '4',
      name: 'Turma D',
      period: 'Noite',
      status: 'Ativa',
      teacher: 'Ana Costa',
      maxStudents: 40,
      currentStudents: 35,
      averageGrade: 7.5,
      attendanceRate: 88,
      room: 'Sala 201',
      academicYear: '2025',
      subjects: ['Matemática', 'Português', 'Ciências', 'História']
    },
    {
      id: '5',
      name: 'Turma E',
      period: 'Integral',
      status: 'Em Planejamento',
      teacher: 'Carlos Mendes',
      maxStudents: 25,
      currentStudents: 0,
      averageGrade: 0,
      attendanceRate: 0,
      room: 'Sala 301',
      academicYear: '2025',
      subjects: ['Matemática', 'Português', 'Ciências', 'História', 'Geografia', 'Inglês', 'Artes']
    }
  ])

  const handleOpenModal = (classData: ClassData | null, isNew: boolean = false) => {
    setSelectedClass(classData)
    setIsNewClass(isNew)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setSelectedClass(null)
    setIsNewClass(false)
    setIsModalOpen(false)
  }

  const handleSaveClass = (classData: ClassData) => {
    if (isNewClass) {
      // Add new class
      setClasses([...classes, classData])
    } else {
      // Update existing class
      setClasses(classes.map(c => c.id === classData.id ? classData : c))
    }
    handleCloseModal()
  }

  // Filter and sort classes
  const filteredClasses = classes.filter(classItem => {
    const matchesSearch = classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classItem.teacher.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPeriod = !filterPeriod || classItem.period === filterPeriod
    const matchesStatus = !filterStatus || classItem.status === filterStatus
    
    return matchesSearch && matchesPeriod && matchesStatus
  })

  const sortedClasses = [...filteredClasses].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'students':
        return b.currentStudents - a.currentStudents
      case 'performance':
        return b.averageGrade - a.averageGrade
      default:
        return 0
    }
  })

  // Calculate statistics
  const totalClasses = classes.length
  const activeClasses = classes.filter(c => c.status === 'Ativa').length
  const totalStudents = classes.reduce((sum, c) => sum + c.currentStudents, 0)
  const averageStudents = totalStudents / (activeClasses || 1)
  const overallAverage = classes.reduce((sum, c) => sum + (c.averageGrade * c.currentStudents), 0) / (totalStudents || 1)
  const overallAttendance = classes.reduce((sum, c) => sum + (c.attendanceRate * c.currentStudents), 0) / (totalStudents || 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Turmas</h1>
          <p className="text-gray-600">Gerencie as turmas e suas configurações</p>
        </div>
        <div className="space-x-4">
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar Lista
          </button>
          <button
            onClick={() => handleOpenModal(null, true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Turma
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Total de Turmas</div>
              <div className="text-2xl font-bold text-gray-800">{totalClasses}</div>
              <div className="text-xs text-green-600 mt-2">
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {activeClasses} ativas
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Média de Alunos</div>
              <div className="text-2xl font-bold text-gray-800">{averageStudents.toFixed(0)}</div>
              <div className="text-xs text-blue-600 mt-2">
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {totalStudents} total
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Desempenho Médio</div>
              <div className="text-2xl font-bold text-gray-800">{overallAverage.toFixed(1)}</div>
              <div className="text-xs text-green-600 mt-2">
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +0.2 este mês
              </div>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Taxa de Frequência</div>
              <div className="text-2xl font-bold text-gray-800">{overallAttendance.toFixed(0)}%</div>
              <div className="text-xs text-green-600 mt-2">
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                +3% este mês
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar turmas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os Períodos</option>
          <option value="Manhã">Manhã</option>
          <option value="Tarde">Tarde</option>
          <option value="Noite">Noite</option>
          <option value="Integral">Integral</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos os Status</option>
          <option value="Ativa">Ativas</option>
          <option value="Inativa">Inativas</option>
          <option value="Em Planejamento">Em Planejamento</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="name">Ordenar por Nome</option>
          <option value="students">Ordenar por Alunos</option>
          <option value="performance">Ordenar por Desempenho</option>
        </select>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedClasses.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{classItem.name}</h3>
                  <p className="text-sm text-gray-600">Período: {classItem.period}</p>
                  {classItem.room && (
                    <p className="text-sm text-gray-500 mt-1">{classItem.room}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  classItem.status === 'Ativa' ? 'bg-green-100 text-green-800' :
                  classItem.status === 'Inativa' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {classItem.status}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Professor</span>
                  <span className="text-sm font-medium">{classItem.teacher}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Alunos</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {classItem.currentStudents}/{classItem.maxStudents}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(classItem.currentStudents / classItem.maxStudents) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Média da Turma</span>
                  <span className={`text-sm font-medium ${
                    classItem.averageGrade >= 8 ? 'text-green-600' :
                    classItem.averageGrade >= 6 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {classItem.averageGrade.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Frequência</span>
                  <span className={`text-sm font-medium ${
                    classItem.attendanceRate >= 90 ? 'text-green-600' :
                    classItem.attendanceRate >= 75 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {classItem.attendanceRate}%
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(classItem)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Gerenciar
                  </button>
                  <button className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Class Card */}
        <div
          onClick={() => handleOpenModal(null, true)}
          className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all hover:shadow-md min-h-[320px]"
        >
          <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm font-medium">Adicionar Nova Turma</span>
        </div>
      </div>

      {/* Empty State */}
      {sortedClasses.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma turma encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando uma nova turma ou ajuste os filtros de busca.
          </p>
          <div className="mt-6">
            <button
              onClick={() => handleOpenModal(null, true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Turma
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {sortedClasses.length > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Anterior
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Próximo
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">1</span> a{' '}
                <span className="font-medium">{Math.min(9, sortedClasses.length)}</span> de{' '}
                <span className="font-medium">{sortedClasses.length}</span> turmas
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  2
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Class Edit Modal */}
      <ClassEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        classData={selectedClass}
        onSave={handleSaveClass}
        isNew={isNewClass}
      />
    </div>
  )
}
