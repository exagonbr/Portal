'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardPageLayout from '@/components/dashboard/DashboardPageLayout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'
import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Button, ButtonGroup } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { motion } from 'framer-motion'

interface Activity {
  id: string
  title: string
  description: string
  type: 'assignment' | 'quiz' | 'project' | 'exam'
  course_name: string
  class_name: string
  due_date: string
  points: number
  status: 'pending' | 'submitted' | 'graded' | 'late'
  grade?: number
  submitted_at?: string
  created_at: string
}

// Mock data
const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Trabalho de Programação Web',
    description: 'Desenvolver uma aplicação web completa usando React e Node.js',
    type: 'project',
    course_name: 'Desenvolvimento Web',
    class_name: 'Turma A - 2024',
    due_date: '2024-03-15',
    points: 100,
    status: 'pending',
    created_at: '2024-03-01'
  },
  {
    id: '2',
    title: 'Quiz - Fundamentos de JavaScript',
    description: 'Teste seus conhecimentos sobre os conceitos básicos de JavaScript',
    type: 'quiz',
    course_name: 'JavaScript Avançado',
    class_name: 'Turma B - 2024',
    due_date: '2024-03-10',
    points: 50,
    status: 'submitted',
    submitted_at: '2024-03-08',
    created_at: '2024-03-05'
  },
  {
    id: '3',
    title: 'Prova Final - Banco de Dados',
    description: 'Avaliação final do módulo de banco de dados',
    type: 'exam',
    course_name: 'Banco de Dados',
    class_name: 'Turma C - 2024',
    due_date: '2024-03-20',
    points: 200,
    status: 'graded',
    grade: 180,
    submitted_at: '2024-03-20',
    created_at: '2024-03-10'
  }
]

export default function StudentActivitiesPage() {
  const { theme } = useTheme()
  const [activities] = useState<Activity[]>(mockActivities)
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'due_date' | 'created_at'>('due_date')

  const getTypeIcon = (type: Activity['type']) => {
    const icons = {
      assignment: 'assignment',
      quiz: 'quiz',
      project: 'folder_special',
      exam: 'school'
    }
    return icons[type] || 'task'
  }

  const getTypeColor = (type: Activity['type']) => {
    const colors = {
      assignment: theme.colors.primary.DEFAULT,
      quiz: theme.colors.secondary.DEFAULT,
      project: theme.colors.accent.DEFAULT,
      exam: theme.colors.status.warning
    }
    return colors[type] || theme.colors.text.secondary
  }

  const getStatusBadge = (activity: Activity) => {
    const statusConfig = {
      pending: { label: 'Pendente', color: theme.colors.status.warning },
      submitted: { label: 'Enviado', color: theme.colors.status.info },
      graded: { label: 'Avaliado', color: theme.colors.status.success },
      late: { label: 'Atrasado', color: theme.colors.status.error }
    }

    const config = statusConfig[activity.status]
    const isLate = new Date(activity.due_date) < new Date() && activity.status === 'pending'
    const finalConfig = isLate ? statusConfig.late : config

    return (
      <span 
        className="px-3 py-1 rounded-full text-xs font-medium"
        style={{ 
          backgroundColor: finalConfig.color + '20',
          color: finalConfig.color
        }}
      >
        {finalConfig.label}
      </span>
    )
  }

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Atrasado'
    if (diffDays === 0) return 'Hoje'
    if (diffDays === 1) return 'Amanhã'
    return `${diffDays} dias`
  }

  const filteredActivities = activities
    .filter(activity => {
      if (filter !== 'all' && activity.status !== filter) return false
      if (searchQuery && !activity.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(sortBy === 'due_date' ? a.due_date : a.created_at)
      const dateB = new Date(sortBy === 'due_date' ? b.due_date : b.created_at)
      return dateA.getTime() - dateB.getTime()
    })

  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    submitted: activities.filter(a => a.status === 'submitted').length,
    graded: activities.filter(a => a.status === 'graded').length,
    averageGrade: activities
      .filter(a => a.grade !== undefined)
      .reduce((acc, a) => acc + (a.grade! / a.points * 100), 0) / activities.filter(a => a.grade).length || 0
  }

  return (
          <ProtectedRoute requiredRole={[UserRole.STUDENT, UserRole.SYSTEM_ADMIN]}>
        <DashboardPageLayout
          title="Minhas Atividades"
          subtitle="Acompanhe suas tarefas, trabalhos e avaliações"
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                    Total de Atividades
                  </span>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.primary.DEFAULT }}>
                    assignment
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                  {stats.total}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                    Pendentes
                  </span>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.status.warning }}>
                    pending_actions
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                  {stats.pending}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                    Enviadas
                  </span>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.status.info }}>
                    task_alt
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                  {stats.submitted}
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                    Média Geral
                  </span>
                  <span className="material-symbols-outlined" style={{ color: theme.colors.status.success }}>
                    grade
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.colors.text.primary }}>
                  {stats.averageGrade.toFixed(1)}%
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              type="search"
              placeholder="Buscar atividades..."
              leftIcon="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            
            <Select
              value={filter}
              onChange={(value) => setFilter(value as any)}
              options={[
                { value: 'all', label: 'Todas' },
                { value: 'pending', label: 'Pendentes' },
                { value: 'submitted', label: 'Enviadas' },
                { value: 'graded', label: 'Avaliadas' }
              ]}
              className="w-48"
            />
            
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value as any)}
              options={[
                { value: 'due_date', label: 'Data de Entrega' },
                { value: 'created_at', label: 'Data de Criação' }
              ]}
              className="w-48"
            />
          </div>

          {/* Activities List */}
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ 
                            backgroundColor: getTypeColor(activity.type) + '20',
                            color: getTypeColor(activity.type)
                          }}
                        >
                          <span className="material-symbols-outlined text-2xl">
                            {getTypeIcon(activity.type)}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1" style={{ color: theme.colors.text.primary }}>
                            {activity.title}
                          </h3>
                          <p className="text-sm mb-2" style={{ color: theme.colors.text.secondary }}>
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm" style={{ color: theme.colors.text.secondary }}>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">school</span>
                              {activity.course_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">groups</span>
                              {activity.class_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">event</span>
                              Entrega: {new Date(activity.due_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(activity)}
                        {activity.status === 'pending' && (
                          <span 
                            className="text-sm font-medium"
                            style={{ 
                              color: getDaysRemaining(activity.due_date) === 'Atrasado' 
                                ? theme.colors.status.error 
                                : theme.colors.text.secondary 
                            }}
                          >
                            {getDaysRemaining(activity.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: theme.colors.border.light }}>
                      <div className="flex items-center gap-4">
                        <span className="text-sm" style={{ color: theme.colors.text.secondary }}>
                          <span className="font-medium">{activity.points}</span> pontos
                        </span>
                        {activity.grade !== undefined && (
                          <span className="text-sm" style={{ color: theme.colors.status.success }}>
                            <span className="font-medium">Nota: {activity.grade}/{activity.points}</span>
                            {' '}({(activity.grade / activity.points * 100).toFixed(1)}%)
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {activity.status === 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            icon="upload"
                          >
                            Enviar
                          </Button>
                        )}
                        {activity.status === 'submitted' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="edit"
                          >
                            Editar Envio
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          icon="visibility"
                        >
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredActivities.length === 0 && (
            <Card>
              <div className="p-12 text-center">
                <span className="material-symbols-outlined text-6xl mb-4 opacity-20" style={{ color: theme.colors.text.secondary }}>
                  assignment
                </span>
                <p className="text-lg" style={{ color: theme.colors.text.secondary }}>
                  Nenhuma atividade encontrada
                </p>
              </div>
            </Card>
          )}
        </DashboardPageLayout>
    </ProtectedRoute>
  )
} 