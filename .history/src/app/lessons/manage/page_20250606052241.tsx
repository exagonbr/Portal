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
  BookOpen,
  FileText,
  Video,
  Download,
  Upload,
  MoreVertical
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface Lesson {
  id: string
  title: string
  course: string
  module: string
  order: number
  type: 'video' | 'text' | 'interactive' | 'quiz'
  duration: number // em minutos
  status: 'draft' | 'published' | 'archived'
  views_count: number
  completion_rate: number
  materials_count: number
  last_updated: string
  description: string
}

export default function TeacherLessonsPage() {
  const { user } = useAuth()
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      setLoading(true)
      // Simular carregamento de dados
      setTimeout(() => {
        setLessons([
          {
            id: '1',
            title: 'Introdução às Equações do 2º Grau',
            course: 'Matemática Básica',
            module: 'Módulo 3 - Álgebra',
            order: 1,
            type: 'video',
            duration: 45,
            status: 'published',
            views_count: 156,
            completion_rate: 78,
            materials_count: 3,
            last_updated: '2024-03-10',
            description: 'Conceitos fundamentais sobre equações quadráticas'
          },
          {
            id: '2',
            title: 'Exercícios Práticos - Equações',
            course: 'Matemática Básica',
            module: 'Módulo 3 - Álgebra',
            order: 2,
            type: 'interactive',
            duration: 30,
            status: 'published',
            views_count: 142,
            completion_rate: 65,
            materials_count: 5,
            last_updated: '2024-03-11',
            description: 'Exercícios interativos para praticar equações'
          },
          {
            id: '3',
            title: 'Concordância Verbal - Teoria',
            course: 'Português - Gramática',
            module: 'Módulo 2 - Sintaxe',
            order: 1,
            type: 'text',
            duration: 20,
            status: 'published',
            views_count: 98,
            completion_rate: 82,
            materials_count: 2,
            last_updated: '2024-03-08',
            description: 'Regras de concordância verbal na língua portuguesa'
          },
          {
            id: '4',
            title: 'Quiz - Brasil Colonial',
            course: 'História do Brasil',
            module: 'Módulo 1 - Período Colonial',
            order: 5,
            type: 'quiz',
            duration: 15,
            status: 'draft',
            views_count: 0,
            completion_rate: 0,
            materials_count: 1,
            last_updated: '2024-03-12',
            description: 'Avaliação sobre o período colonial brasileiro'
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Erro ao carregar aulas:', error)
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'interactive':
        return <BookOpen className="h-4 w-4" />
      case 'quiz':
        return <Edit className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'video':
        return 'Vídeo'
      case 'text':
        return 'Texto'
      case 'interactive':
        return 'Interativa'
      case 'quiz':
        return 'Quiz'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-purple-100 text-purple-800'
      case 'text':
        return 'bg-blue-100 text-blue-800'
      case 'interactive':
        return 'bg-green-100 text-green-800'
      case 'quiz':
        return 'bg-orange-100 text-orange-800'
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
      case 'archived':
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
      case 'archived':
        return 'Arquivada'
      default:
        return status
    }
  }

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.module.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || lesson.type === filterType
    const matchesStatus = filterStatus === 'all' || lesson.status === filterStatus
    const matchesCourse = filterCourse === 'all' || lesson.course === filterCourse
    return matchesSearch && matchesType && matchesStatus && matchesCourse
  })

  const uniqueCourses = Array.from(new Set(lessons.map(l => l.course)))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Gestão de Aulas
        </h1>
        <p className="text-slate-600">
          Crie e organize o conteúdo das suas aulas
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total de Aulas</p>
              <p className="text-2xl font-bold text-slate-800">{lessons.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Publicadas</p>
              <p className="text-2xl font-bold text-green-600">
                {lessons.filter(l => l.status === 'published').length}
              </p>
            </div>
            <Eye className="h-8 w-8 text-green-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Visualizações</p>
              <p className="text-2xl font-bold text-blue-600">
                {lessons.reduce((acc, l) => acc + l.views_count, 0)}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-300" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(lessons.reduce((acc, l) => acc + l.completion_rate, 0) / lessons.length)}%
              </p>
            </div>
            <Clock className="h-8 w-8 text-purple-300" />
          </div>
        </div>
      </div>

      {/* Barra de ações */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar aulas..."
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
            Importar
          </button>
          <button className="flex items-center gap-1 px-4 py-2 bg-primary-dark text-white rounded-lg text-sm hover:bg-primary-darker transition-colors">
            <Plus className="h-4 w-4" />
            Nova Aula
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
                Tipo
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-dark"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">Todos os Tipos</option>
                <option value="video">Vídeo</option>
                <option value="text">Texto</option>
                <option value="interactive">Interativa</option>
                <option value="quiz">Quiz</option>
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
                <option value="archived">Arquivadas</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Lista de aulas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Aula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Conclusão
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
              ) : filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-slate-500">
                    Nenhuma aula encontrada
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{lesson.title}</div>
                        <div className="text-xs text-slate-500">{lesson.course} • {lesson.module}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(lesson.type)}`}>
                        {getTypeIcon(lesson.type)}
                        {getTypeLabel(lesson.type)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {lesson.duration} min
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {lesson.views_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-primary-dark h-2 rounded-full"
                            style={{ width: `${lesson.completion_rate}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-600">{lesson.completion_rate}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lesson.status)}`}>
                        {getStatusLabel(lesson.status)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
