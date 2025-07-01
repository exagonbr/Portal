'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  Mail,
  Phone,
  MoreVertical,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Student {
  id: string
  name: string
  email: string
  phone: string
  enrollment_number: string
  course: string
  class: string
  status: 'active' | 'inactive' | 'suspended'
  average_grade: number
  attendance_rate: number
  completed_activities: number
  total_activities: number
  last_access: string
  profile_image?: string
}

export default function TeacherStudentsPage() {
  const { user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setStudents([
          {
            id: '1',
            name: 'Ana Silva',
            email: 'ana.silva@email.com',
            phone: '(11) 98765-4321',
            enrollment_number: '2024001',
            course: 'Matemática Básica',
            class: 'Turma A',
            status: 'active',
            average_grade: 8.5,
            attendance_rate: 95,
            completed_activities: 18,
            total_activities: 20,
            last_access: '2024-03-14T10:30:00'
          },
          {
            id: '2',
            name: 'Carlos Santos',
            email: 'carlos.santos@email.com',
            phone: '(11) 98765-4322',
            enrollment_number: '2024002',
            course: 'Matemática Básica',
            class: 'Turma A',
            status: 'active',
            average_grade: 7.2,
            attendance_rate: 88,
            completed_activities: 15,
            total_activities: 20,
            last_access: '2024-03-13T14:20:00'
          },
          {
            id: '3',
            name: 'Maria Oliveira',
            email: 'maria.oliveira@email.com',
            phone: '(11) 98765-4323',
            enrollment_number: '2024003',
            course: 'Português - Gramática',
            class: 'Turma B',
            status: 'active',
            average_grade: 9.1,
            attendance_rate: 98,
            completed_activities: 22,
            total_activities: 22,
            last_access: '2024-03-14T09:15:00'
          },
          {
            id: '4',
            name: 'João Pereira',
            email: 'joao.pereira@email.com',
            phone: '(11) 98765-4324',
            enrollment_number: '2024004',
            course: 'História do Brasil',
            class: 'Turma C',
            status: 'inactive',
            average_grade: 6.5,
            attendance_rate: 72,
            completed_activities: 10,
            total_activities: 18,
            last_access: '2024-03-01T16:45:00'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.log('Erro ao carregar alunos:', error)
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'inactive':
        return 'Inativo'
      case 'suspended':
        return 'Suspenso'
      default:
        return status
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 8) return 'text-green-600'
    if (grade >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.enrollment_number.includes(searchTerm)
    const matchesCourse = filterCourse === 'all' || student.course === filterCourse
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus
    return matchesSearch && matchesCourse && matchesStatus
  })

  const uniqueCourses = Array.from(new Set(students.map(s => s.course)))

  const getDaysSinceLastAccess = (lastAccess: string) => {
    const last = new Date(lastAccess)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - last.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Meus Alunos
        </h1>
        <p className="text-slate-600">
          Acompanhe o desempenho e progresso dos seus alunos
        </p>
      </div>

      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Alunos</p>
              <p className="text-2xl font-bold text-slate-800">{students.length}</p>
            </div>
            <UserCheck className="h-8 w-8 text-slate-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Média Geral</p>
              <p className="text-2xl font-bold text-blue-600">
                {(students.reduce((acc, s) => acc + s.average_grade, 0) / students.length).toFixed(1)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Taxa de Presença</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(students.reduce((acc, s) => acc + s.attendance_rate, 0) / students.length)}%
              </p>
            </div>
            <Award className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Alunos em Risco</p>
              <p className="text-2xl font-bold text-red-600">
                {students.filter(s => s.average_grade < 6 || s.attendance_rate < 75).length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-300" />
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar alunos..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary-dark"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Curso
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="all">Todos os Cursos</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="suspended">Suspensos</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de alunos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-dark"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <UserX className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Nenhum aluno encontrado</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-slate-600">
                        {student.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{student.name}</h3>
                      <p className="text-sm text-slate-500">#{student.enrollment_number}</p>
                    </div>
                  </div>
                  <button className="p-1 hover:bg-slate-100 rounded">
                    <MoreVertical className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Curso:</span>
                    <span className="font-medium text-slate-800">{student.course}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Turma:</span>
                    <span className="font-medium text-slate-800">{student.class}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Média:</span>
                    <span className={`font-bold ${getGradeColor(student.average_grade)}`}>
                      {student.average_grade.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Presença:</span>
                    <span className={`font-medium ${student.attendance_rate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
                      {student.attendance_rate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Atividades:</span>
                    <span className="font-medium text-slate-800">
                      {student.completed_activities}/{student.total_activities}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                    {getStatusLabel(student.status)}
                  </span>
                  <span className="text-xs text-slate-500">
                    Último acesso há {getDaysSinceLastAccess(student.last_access)} dias
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                    <Mail className="h-4 w-4" />
                    Email
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
