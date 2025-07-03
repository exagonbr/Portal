'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  description: string
  course: string
  courseId: string
  dueDate: Date
  submittedAt?: Date
  status: 'pending' | 'submitted' | 'graded' | 'late' | 'overdue'
  grade?: number
  maxGrade: number
  type: 'homework' | 'quiz' | 'project' | 'exam'
  attachments?: {
    id: string
    name: string
    url: string
  }[]
  feedback?: string
}

export default function StudentAssignmentsPage() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded' | 'overdue'>('all')
  const [sortBy, setSortBy] = useState<'dueDate' | 'course' | 'status'>('dueDate')

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      // Simular dados por enquanto
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Exercícios de Equações',
          description: 'Resolver os exercícios do capítulo 5',
          course: 'Matemática Básica',
          courseId: '1',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 dias
          status: 'pending',
          maxGrade: 10,
          type: 'homework'
        },
        {
          id: '2',
          title: 'Redação sobre Meio Ambiente',
          description: 'Escrever uma redação de 500 palavras sobre preservação ambiental',
          course: 'Português - Gramática',
          courseId: '2',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias
          status: 'pending',
          maxGrade: 10,
          type: 'project'
        },
        {
          id: '3',
          title: 'Quiz - Revolução Industrial',
          description: 'Questionário sobre a Revolução Industrial',
          course: 'História do Brasil',
          courseId: '3',
          dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          status: 'graded',
          grade: 8.5,
          maxGrade: 10,
          type: 'quiz',
          feedback: 'Ótimo trabalho! Apenas revise a questão sobre as consequências sociais.'
        },
        {
          id: '4',
          title: 'Prova de Gramática',
          description: 'Prova sobre concordância verbal e nominal',
          course: 'Português - Gramática',
          courseId: '2',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // ontem
          status: 'overdue',
          maxGrade: 10,
          type: 'exam'
        },
        {
          id: '5',
          title: 'Trabalho em Grupo - Ecossistemas',
          description: 'Apresentação sobre ecossistemas brasileiros',
          course: 'Ciências Naturais',
          courseId: '4',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          submittedAt: new Date(),
          status: 'submitted',
          maxGrade: 10,
          type: 'project'
        }
      ]
      
      setAssignments(mockAssignments)
      setLoading(false)
    } catch (error) {
      console.log('Erro ao buscar atividades:', error)
      setLoading(false)
    }
  }

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true
    return assignment.status === filter
  }).sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return a.dueDate.getTime() - b.dueDate.getTime()
      case 'course':
        return a.course.localeCompare(b.course)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.status.warning
      case 'submitted': return theme.colors.status.info
      case 'graded': return theme.colors.status.success
      case 'late': return theme.colors.status.error
      case 'overdue': return theme.colors.status.error
      default: return theme.colors.text.secondary
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'submitted': return 'Enviada'
      case 'graded': return 'Avaliada'
      case 'late': return 'Atrasada'
      case 'overdue': return 'Vencida'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'homework': return 'edit_note'
      case 'quiz': return 'quiz'
      case 'project': return 'folder_open'
      case 'exam': return 'assignment'
      default: return 'assignment'
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Hoje'
    if (days === 1) return 'Amanhã'
    if (days === -1) return 'Ontem'
    if (days > 0 && days <= 7) return `Em ${days} dias`
    if (days < 0 && days >= -7) return `${Math.abs(days)} dias atrás`
    
    return date.toLocaleDateString('pt-BR')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" 
             style={{ borderColor: theme.colors.primary.DEFAULT }}></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text.primary }}>
          Minhas Atividades
        </h1>
        <p style={{ color: theme.colors.text.secondary }}>
          Gerencie suas tarefas e acompanhe seus prazos
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: 'Pendentes', value: assignments.filter(a => a.status === 'pending').length, color: theme.colors.status.warning },
          { label: 'Enviadas', value: assignments.filter(a => a.status === 'submitted').length, color: theme.colors.status.info },
          { label: 'Avaliadas', value: assignments.filter(a => a.status === 'graded').length, color: theme.colors.status.success },
          { label: 'Vencidas', value: assignments.filter(a => a.status === 'overdue').length, color: theme.colors.status.error }
        ].map((stat, index) => (
          <div
            key={stat.label}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            <p className="text-sm mb-1" style={{ color: theme.colors.text.secondary }}>
              {stat.label}
            </p>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6 flex flex-col md:flex-row gap-4"
      >
        {/* Filtro por Status */}
        <div className="flex gap-2">
          {(['all', 'pending', 'submitted', 'graded', 'overdue'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                filter === status ? 'shadow-md' : ''
              }`}
              style={{
                backgroundColor: filter === status ? theme.colors.primary.DEFAULT : theme.colors.background.card,
                color: filter === status ? 'white' : theme.colors.text.secondary,
                borderWidth: '1px',
                borderColor: filter === status ? theme.colors.primary.DEFAULT : theme.colors.border.DEFAULT
              }}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Ordenação */}
        <div className="ml-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 rounded-lg border text-sm"
            style={{
              backgroundColor: theme.colors.background.card,
              borderColor: theme.colors.border.DEFAULT,
              color: theme.colors.text.primary
            }}
          >
            <option value="dueDate">Ordenar por prazo</option>
            <option value="course">Ordenar por curso</option>
            <option value="status">Ordenar por status</option>
          </select>
        </div>
      </motion.div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment, index) => (
          <motion.div
            key={assignment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
            style={{
              backgroundColor: theme.colors.background.card,
              borderWidth: '1px',
              borderColor: theme.colors.border.DEFAULT
            }}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                {/* Ícone */}
                <div className="p-3 rounded-lg flex-shrink-0"
                     style={{ backgroundColor: getStatusColor(assignment.status) + '20' }}>
                  <span className="material-symbols-outlined text-2xl"
                        style={{ color: getStatusColor(assignment.status) }}>
                    {getTypeIcon(assignment.type)}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.text.primary }}>
                        {assignment.title}
                      </h3>
                      <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                        {assignment.course}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: getStatusColor(assignment.status) + '20',
                            color: getStatusColor(assignment.status)
                          }}>
                      {getStatusLabel(assignment.status)}
                    </span>
                  </div>

                  <p className="text-sm mb-3" style={{ color: theme.colors.text.secondary }}>
                    {assignment.description}
                  </p>

                  {/* Informações */}
                  <div className="flex flex-wrap gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-base"
                            style={{ color: theme.colors.text.tertiary }}>
                        calendar_today
                      </span>
                      <span style={{ color: theme.colors.text.secondary }}>
                        Prazo: {formatDate(assignment.dueDate)}
                      </span>
                    </div>
                    
                    {assignment.grade !== undefined && (
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-base"
                              style={{ color: theme.colors.text.tertiary }}>
                          grade
                        </span>
                        <span style={{ color: theme.colors.text.secondary }}>
                          Nota: {assignment.grade}/{assignment.maxGrade}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Feedback */}
                  {assignment.feedback && (
                    <div className="p-3 rounded-lg mb-3"
                         style={{ backgroundColor: theme.colors.background.secondary }}>
                      <p className="text-sm font-medium mb-1" style={{ color: theme.colors.text.primary }}>
                        Feedback do Professor:
                      </p>
                      <p className="text-sm" style={{ color: theme.colors.text.secondary }}>
                        {assignment.feedback}
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2">
                    {assignment.status === 'pending' && (
                      <Link
                        href={`/student/assignments/${assignment.id}/submit`}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                        style={{
                          backgroundColor: theme.colors.primary.DEFAULT,
                          color: 'white'
                        }}
                      >
                        Fazer Atividade
                      </Link>
                    )}
                    {assignment.status === 'submitted' && (
                      <Link
                        href={`/student/assignments/${assignment.id}`}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
                        style={{
                          borderColor: theme.colors.primary.DEFAULT,
                          color: theme.colors.primary.DEFAULT
                        }}
                      >
                        Ver Envio
                      </Link>
                    )}
                    {assignment.status === 'graded' && (
                      <Link
                        href={`/student/assignments/${assignment.id}`}
                        className="px-4 py-2 rounded-lg font-medium text-sm transition-colors border"
                        style={{
                          borderColor: theme.colors.status.success,
                          color: theme.colors.status.success
                        }}
                      >
                        Ver Resultado
                      </Link>
                    )}
                    {assignment.status === 'overdue' && (
                      <button
                        disabled
                        className="px-4 py-2 rounded-lg font-medium text-sm cursor-not-allowed"
                        style={{
                          backgroundColor: theme.colors.background.secondary,
                          color: theme.colors.text.tertiary
                        }}
                      >
                        Prazo Vencido
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <span className="material-symbols-outlined text-6xl mb-4"
                style={{ color: theme.colors.text.tertiary }}>
            assignment
          </span>
          <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
            Nenhuma atividade encontrada
          </p>
        </motion.div>
      )}
    </div>
  )
} 