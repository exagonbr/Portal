'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  FileText,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from '@/components/dashboard/DashboardLayout'

interface Assignment {
  id: string
  title: string
  course: string
  type: 'homework' | 'quiz' | 'project' | 'exam'
  due_date: string
  status: 'draft' | 'published' | 'closed'
  submissions_count: number
  total_students: number
  average_grade: number | null
  description: string
}

export default function TeacherAssignmentsPage() {
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setAssignments([
          {
            id: '1',
            title: 'Exercícios de Equações do 2º Grau',
            course: 'Matemática Básica',
            type: 'homework',
            due_date: '2024-03-15T23:59:00',
            status: 'published',
            submissions_count: 25,
            total_students: 32,
            average_grade: 7.5,
            description: 'Resolver os exercícios do capítulo 5'
          },
          {
            id: '2',
            title: 'Prova Bimestral - Gramática',
            course: 'Português - Gramática',
            type: 'exam',
            due_date: '2024-03-20T14:00:00',
            status: 'draft',
            submissions_count: 0,
            total_students: 28,
            average_grade: null,
            description: 'Prova sobre concordância verbal e nominal'
          },
          {
            id: '3',
            title: 'Projeto: Linha do Tempo Histórica',
            course: 'História do Brasil',
            type: 'project',
            due_date: '2024-04-01T23:59:00',
            status: 'published',
            submissions_count: 18,
            total_students: 25,
            average_grade: 8.2,
            description: 'Criar uma linha do tempo interativa sobre o período colonial'
          },
          {
            id: '4',
            title: 'Quiz - Funções Matemáticas',
            course: 'Matemática Básica',
            type: 'quiz',
            due_date: '2024-03-10T23:59:00',
            status: 'closed',
            submissions_count: 32,
            total_students: 32,
            average_grade: 6.8,
            description: 'Quiz online sobre funções lineares e quadráticas'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.log('Erro ao carregar atividades:', error)
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'homework':
        return <FileText className="h-4 w-4" />
      case 'quiz':
        return <CheckCircle className="h-4 w-4" />
      case 'project':
        return <Users className="h-4 w-4" />
      case 'exam':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'homework':
        return 'Tarefa'
      case 'quiz':
        return 'Quiz'
      case 'project':
        return 'Projeto'
      case 'exam':
        return 'Prova'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'homework':
        return 'bg-blue-100 text-blue-800'
      case 'quiz':
        return 'bg-purple-100 text-purple-800'
      case 'project':
        return 'bg-green-100 text-green-800'
      case 'exam':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicada'
      case 'draft':
        return 'Rascunho'
      case 'closed':
        return 'Encerrada'
      default:
        return status
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || assignment.type === filterType
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <DashboardLayout>
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Gestão de Atividades
        </h1>
        <p className="text-slate-600">
          Crie e gerencie atividades, tarefas e avaliações
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Atividades</p>
              <p className="text-2xl font-bold text-slate-800">{assignments.length}</p>
            </div>
            <FileText className="h-8 w-8 text-slate-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Publicadas</p>
              <p className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.status === 'published').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Rascunhos</p>
              <p className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => a.status === 'draft').length}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Taxa de Entrega</p>
              <p className="text-2xl font-bold text-blue-600">78%</p>
            </div>
            <Users className="h-8 w-8 text-blue-300" />
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar atividades..."
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
        
        <button className="flex items-center gap-1 px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors">
          <Plus className="h-4 w-4" />
          Nova Atividade
        </button>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tipo
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos</option>
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
                <option value="published">Publicadas</option>
                <option value="draft">Rascunhos</option>
                <option value="closed">Encerradas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de atividades */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Prazo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Entregas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Média
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
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-dark"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500">
                    Nenhuma atividade encontrada
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => {
                  const daysUntilDue = getDaysUntilDue(assignment.due_date)
                  return (
                    <tr key={assignment.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-slate-900">{assignment.title}</div>
                          <div className="text-sm text-slate-500">{assignment.course}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(assignment.type)}`}>
                          {getTypeIcon(assignment.type)}
                          {getTypeLabel(assignment.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className={daysUntilDue < 3 && assignment.status === 'published' ? 'text-red-600 font-medium' : 'text-slate-600'}>
                            {new Date(assignment.due_date).toLocaleDateString('pt-BR')}
                          </span>
                          {assignment.status === 'published' && daysUntilDue > 0 && (
                            <span className="text-xs text-slate-500">
                              ({daysUntilDue} dias)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-primary-dark h-2 rounded-full"
                              style={{ width: `${(assignment.submissions_count / assignment.total_students) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600">
                            {assignment.submissions_count}/{assignment.total_students}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-slate-900">
                          {assignment.average_grade !== null ? assignment.average_grade.toFixed(1) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                          {getStatusLabel(assignment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-indigo-600 hover:text-indigo-900 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}
