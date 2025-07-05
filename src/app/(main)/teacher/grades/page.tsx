'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  Download,
  Upload,
  Edit,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Award,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Grade {
  id: string
  student_id: string
  student_name: string
  enrollment_number: string
  course: string
  class: string
  assignment_id: string
  assignment_title: string
  assignment_type: 'homework' | 'quiz' | 'project' | 'exam'
  grade: number | null
  max_grade: number
  submission_date: string | null
  graded_date: string | null
  status: 'pending' | 'graded' | 'late' | 'missing'
  feedback?: string
}

interface GradeStats {
  average: number
  highest: number
  lowest: number
  pending: number
  graded: number
  late: number
  missing: number
}

export default function TeacherGradesPage() {
  const { user } = useAuth()
  const [grades, setGrades] = useState<Grade[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [filterAssignment, setFilterAssignment] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [editingGrade, setEditingGrade] = useState<string | null>(null)
  const [tempGrades, setTempGrades] = useState<{ [key: string]: number }>({})
  const [stats, setStats] = useState<GradeStats>({
    average: 0,
    highest: 0,
    lowest: 0,
    pending: 0,
    graded: 0,
    late: 0,
    missing: 0
  })

  useEffect(() => {
    loadGrades()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [grades])

  const loadGrades = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setGrades([
          {
            id: '1',
            student_id: '1',
            student_name: 'Ana Silva',
            enrollment_number: '2024001',
            course: 'Matemática Básica',
            class: 'Turma A',
            assignment_id: '1',
            assignment_title: 'Exercícios de Equações do 2º Grau',
            assignment_type: 'homework',
            grade: 8.5,
            max_grade: 10,
            submission_date: '2024-03-14T22:30:00',
            graded_date: '2024-03-15T10:00:00',
            status: 'graded',
            feedback: 'Ótimo trabalho! Continue assim.'
          },
          {
            id: '2',
            student_id: '2',
            student_name: 'Carlos Santos',
            enrollment_number: '2024002',
            course: 'Matemática Básica',
            class: 'Turma A',
            assignment_id: '1',
            assignment_title: 'Exercícios de Equações do 2º Grau',
            assignment_type: 'homework',
            grade: null,
            max_grade: 10,
            submission_date: '2024-03-15T23:59:00',
            graded_date: null,
            status: 'pending',
          },
          {
            id: '3',
            student_id: '3',
            student_name: 'Maria Oliveira',
            enrollment_number: '2024003',
            course: 'Português - Gramática',
            class: 'Turma B',
            assignment_id: '2',
            assignment_title: 'Prova Bimestral - Gramática',
            assignment_type: 'exam',
            grade: 9.2,
            max_grade: 10,
            submission_date: '2024-03-10T14:00:00',
            graded_date: '2024-03-12T16:00:00',
            status: 'graded',
            feedback: 'Excelente desempenho!'
          },
          {
            id: '4',
            student_id: '4',
            student_name: 'João Pereira',
            enrollment_number: '2024004',
            course: 'História do Brasil',
            class: 'Turma C',
            assignment_id: '3',
            assignment_title: 'Projeto: Linha do Tempo Histórica',
            assignment_type: 'project',
            grade: null,
            max_grade: 10,
            submission_date: null,
            graded_date: null,
            status: 'missing',
          },
          {
            id: '5',
            student_id: '1',
            student_name: 'Ana Silva',
            enrollment_number: '2024001',
            course: 'Matemática Básica',
            class: 'Turma A',
            assignment_id: '4',
            assignment_title: 'Quiz - Funções Matemáticas',
            assignment_type: 'quiz',
            grade: 7.0,
            max_grade: 10,
            submission_date: '2024-03-11T10:00:00',
            graded_date: '2024-03-11T10:30:00',
            status: 'late',
            feedback: 'Entregue com atraso. Revise o conteúdo sobre funções quadráticas.'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.log('Erro ao carregar avaliações:', error)
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const gradedGrades = grades.filter(g => g.status === 'graded' && g.grade !== null)
    const gradeValues = gradedGrades.map(g => (g.grade! / g.max_grade) * 10)
    
    setStats({
      average: gradeValues.length > 0 ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length : 0,
      highest: gradeValues.length > 0 ? Math.max(...gradeValues) : 0,
      lowest: gradeValues.length > 0 ? Math.min(...gradeValues) : 0,
      pending: grades.filter(g => g.status === 'pending').length,
      graded: grades.filter(g => g.status === 'graded').length,
      late: grades.filter(g => g.status === 'late').length,
      missing: grades.filter(g => g.status === 'missing').length
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'late':
        return 'bg-orange-100 text-orange-800'
      case 'missing':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'graded':
        return 'Avaliado'
      case 'pending':
        return 'Pendente'
      case 'late':
        return 'Atrasado'
      case 'missing':
        return 'Não Entregue'
      default:
        return status
    }
  }

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleEditGrade = (gradeId: string, currentGrade: number | null) => {
    setEditingGrade(gradeId)
    setTempGrades({ ...tempGrades, [gradeId]: currentGrade || 0 })
  }

  const handleSaveGrade = (gradeId: string) => {
    const grade = grades.find(g => g.id === gradeId)
    if (grade) {
      grade.grade = tempGrades[gradeId]
      grade.status = 'graded'
      grade.graded_date = new Date().toISOString()
      setGrades([...grades])
    }
    setEditingGrade(null)
  }

  const handleCancelEdit = () => {
    setEditingGrade(null)
    setTempGrades({})
  }

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.enrollment_number.includes(searchTerm) ||
                         grade.assignment_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = filterCourse === 'all' || grade.course === filterCourse
    const matchesAssignment = filterAssignment === 'all' || grade.assignment_type === filterAssignment
    const matchesStatus = filterStatus === 'all' || grade.status === filterStatus
    return matchesSearch && matchesCourse && matchesAssignment && matchesStatus
  })

  const uniqueCourses = Array.from(new Set(grades.map(g => g.course)))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Avaliações
        </h1>
        <p className="text-slate-600">
          Gerencie as notas e avaliações dos seus alunos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Média Geral</p>
              <p className="text-2xl font-bold text-slate-800">{stats.average.toFixed(1)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-slate-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avaliadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Não Entregues</p>
              <p className="text-2xl font-bold text-red-600">{stats.missing}</p>
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
              placeholder="Buscar aluno ou atividade..."
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
        
        <div className="flex gap-2">
          <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            <Upload className="h-4 w-4" />
            Importar Notas
          </button>
          <button className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition-colors">
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                Tipo de Atividade
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filterAssignment}
                onChange={(e) => setFilterAssignment(e.target.value)}
              >
                <option value="all">Todos os Tipos</option>
                <option value="homework">Tarefas</option>
                <option value="quiz">Quizzes</option>
                <option value="project">Projetos</option>
                <option value="exam">Provas</option>
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
                <option value="graded">Avaliadas</option>
                <option value="pending">Pendentes</option>
                <option value="late">Atrasadas</option>
                <option value="missing">Não Entregues</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de avaliações */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Entrega
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-dark"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                    Nenhuma avaliação encontrada
                  </td>
                </tr>
              ) : (
                filteredGrades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{grade.student_name}</div>
                        <div className="text-xs text-slate-500">#{grade.enrollment_number} • {grade.class}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-slate-900">{grade.assignment_title}</div>
                        <div className="text-xs text-slate-500">{grade.course}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {grade.submission_date ? (
                        new Date(grade.submission_date).toLocaleDateString('pt-BR')
                      ) : (
                        <span className="text-red-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingGrade === grade.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={grade.max_grade}
                            step="0.1"
                            value={tempGrades[grade.id] || 0}
                            onChange={(e) => setTempGrades({ ...tempGrades, [grade.id]: parseFloat(e.target.value) })}
                            className="w-20 px-2 py-1 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-dark"
                          />
                          <span className="text-sm text-slate-500">/ {grade.max_grade}</span>
                        </div>
                      ) : (
                        <div>
                          {grade.grade !== null ? (
                            <span className={`font-bold ${getGradeColor(grade.grade, grade.max_grade)}`}>
                              {grade.grade.toFixed(1)} / {grade.max_grade}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(grade.status)}`}>
                        {getStatusLabel(grade.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {editingGrade === grade.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleSaveGrade(grade.id)}
                            className="text-green-600 hover:text-green-900 p-1"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditGrade(grade.id, grade.grade)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          disabled={grade.status === 'missing'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
