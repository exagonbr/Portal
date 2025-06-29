'use client'

import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { UserRole } from '@/types/roles'

interface StatItem {
  id: string
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease' | 'neutral'
    period: string
  }
  icon: string
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  description?: string
  trend?: number[]
}

interface StatsGridProps {
  userRole: UserRole
  stats: StatItem[]
  loading?: boolean
  className?: string
}

const roleBasedStats: Record<UserRole, StatItem[]> = {
  [UserRole.SYSTEM_ADMIN]: [
    {
      id: 'total-institutions',
      title: 'Instituições Ativas',
      value: '127',
      change: { value: 8.2, type: 'increase', period: 'último mês' },
      icon: 'business',
      color: 'primary',
      description: 'Total de instituições cadastradas'
    },
    {
      id: 'total-users',
      title: 'Usuários Globais',
      value: '45.2K',
      change: { value: 12.5, type: 'increase', period: 'último mês' },
      icon: 'group',
      color: 'secondary',
      description: 'Usuários ativos na plataforma'
    },
    {
      id: 'system-uptime',
      title: 'Uptime do Sistema',
      value: '99.9%',
      change: { value: 0.1, type: 'increase', period: 'último mês' },
      icon: 'monitoring',
      color: 'success',
      description: 'Disponibilidade do sistema'
    },
    {
      id: 'storage-usage',
      title: 'Uso de Armazenamento',
      value: '2.4TB',
      change: { value: 15.3, type: 'increase', period: 'último mês' },
      icon: 'storage',
      color: 'warning',
      description: 'Espaço utilizado no servidor'
    }
  ],
  [UserRole.INSTITUTION_MANAGER]: [
    {
      id: 'total-students',
      title: 'Alunos Matriculados',
      value: '1.2K',
      change: { value: 5.4, type: 'increase', period: 'este semestre' },
      icon: 'school',
      color: 'primary',
      description: 'Total de alunos ativos'
    },
    {
      id: 'total-teachers',
      title: 'Professores',
      value: '89',
      change: { value: 2.1, type: 'increase', period: 'este semestre' },
      icon: 'person',
      color: 'secondary',
      description: 'Corpo docente ativo'
    },
    {
      id: 'academic-performance',
      title: 'Performance Acadêmica',
      value: '87.5%',
      change: { value: 3.2, type: 'increase', period: 'último bimestre' },
      icon: 'trending_up',
      color: 'success',
      description: 'Média geral de aprovação'
    },
    {
      id: 'financial-health',
      title: 'Saúde Financeira',
      value: '94.2%',
      change: { value: 1.8, type: 'decrease', period: 'último mês' },
      icon: 'account_balance',
      color: 'accent',
      description: 'Taxa de adimplência'
    }
  ],
  [UserRole.COORDINATOR]: [
    {
      id: 'curriculum-completion',
      title: 'Conclusão Curricular',
      value: '78.3%',
      change: { value: 4.1, type: 'increase', period: 'este bimestre' },
      icon: 'assignment_turned_in',
      color: 'primary',
      description: 'Progresso do currículo'
    },
    {
      id: 'teacher-performance',
      title: 'Avaliação Docente',
      value: '4.6/5',
      change: { value: 0.2, type: 'increase', period: 'último período' },
      icon: 'star',
      color: 'secondary',
      description: 'Média de avaliação dos professores'
    },
    {
      id: 'student-engagement',
      title: 'Engajamento Estudantil',
      value: '82.7%',
      change: { value: 6.3, type: 'increase', period: 'última semana' },
      icon: 'psychology',
      color: 'success',
      description: 'Participação em atividades'
    },
    {
      id: 'quality-indicators',
      title: 'Indicadores de Qualidade',
      value: '91.2%',
      change: { value: 2.4, type: 'increase', period: 'último trimestre' },
      icon: 'verified',
      color: 'accent',
      description: 'Métricas de qualidade educacional'
    }
  ],
  [UserRole.TEACHER]: [
    {
      id: 'my-classes',
      title: 'Minhas Turmas',
      value: '6',
      change: { value: 1, type: 'increase', period: 'este semestre' },
      icon: 'class',
      color: 'primary',
      description: 'Turmas sob sua responsabilidade'
    },
    {
      id: 'total-students',
      title: 'Total de Alunos',
      value: '156',
      change: { value: 8, type: 'increase', period: 'este semestre' },
      icon: 'group',
      color: 'secondary',
      description: 'Alunos em todas as turmas'
    },
    {
      id: 'assignments-pending',
      title: 'Atividades Pendentes',
      value: '23',
      change: { value: 5, type: 'decrease', period: 'esta semana' },
      icon: 'assignment',
      color: 'warning',
      description: 'Atividades para correção'
    },
    {
      id: 'class-average',
      title: 'Média das Turmas',
      value: '8.4',
      change: { value: 0.3, type: 'increase', period: 'último bimestre' },
      icon: 'grade',
      color: 'success',
      description: 'Média geral de notas'
    }
  ],
  [UserRole.STUDENT]: [
    {
      id: 'current-courses',
      title: 'Cursos Ativos',
      value: '5',
      change: { value: 1, type: 'increase', period: 'este semestre' },
      icon: 'menu_book',
      color: 'primary',
      description: 'Cursos em andamento'
    },
    {
      id: 'assignments-completed',
      title: 'Atividades Concluídas',
      value: '87%',
      change: { value: 12, type: 'increase', period: 'este mês' },
      icon: 'task_alt',
      color: 'success',
      description: 'Taxa de conclusão de atividades'
    },
    {
      id: 'current-grade',
      title: 'Média Atual',
      value: '8.7',
      change: { value: 0.5, type: 'increase', period: 'último bimestre' },
      icon: 'grade',
      color: 'secondary',
      description: 'Sua média geral'
    },
    {
      id: 'study-hours',
      title: 'Horas de Estudo',
      value: '24h',
      change: { value: 3, type: 'increase', period: 'esta semana' },
      icon: 'schedule',
      color: 'accent',
      description: 'Tempo dedicado aos estudos'
    }
  ],
  [UserRole.GUARDIAN]: [
    {
      id: 'children-performance',
      title: 'Performance dos Filhos',
      value: '8.5',
      change: { value: 0.3, type: 'increase', period: 'último bimestre' },
      icon: 'child_care',
      color: 'primary',
      description: 'Média geral dos filhos'
    },
    {
      id: 'attendance-rate',
      title: 'Taxa de Frequência',
      value: '96.2%',
      change: { value: 1.2, type: 'increase', period: 'este mês' },
      icon: 'fact_check',
      color: 'success',
      description: 'Frequência escolar'
    },
    {
      id: 'pending-payments',
      title: 'Pagamentos Pendentes',
      value: '0',
      change: { value: 2, type: 'decrease', period: 'este mês' },
      icon: 'payments',
      color: 'success',
      description: 'Mensalidades em aberto'
    },
    {
      id: 'upcoming-events',
      title: 'Próximos Eventos',
      value: '3',
      change: { value: 1, type: 'increase', period: 'próxima semana' },
      icon: 'event',
      color: 'accent',
      description: 'Eventos escolares agendados'
    }
  ]
}

export default function StatsGrid({ 
  userRole, 
  stats, 
  loading = false, 
  className = '' 
}: StatsGridProps) {
  const { theme } = useTheme()
  
  // Use role-based stats if no custom stats provided
  const displayStats = stats.length > 0 ? stats : roleBasedStats[userRole] || []

  const getColorValue = (color: StatItem['color']) => {
    switch (color) {
      case 'primary': return theme.colors.primary.DEFAULT
      case 'secondary': return theme.colors.secondary.DEFAULT
      case 'accent': return theme.colors.accent.DEFAULT
      case 'success': return theme.colors.status.success
      case 'warning': return theme.colors.status.warning
      case 'error': return theme.colors.status.error
      default: return theme.colors.primary.DEFAULT
    }
  }

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase': return 'trending_up'
      case 'decrease': return 'trending_down'
      case 'neutral': return 'trending_flat'
    }
  }

  const getChangeColor = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase': return theme.colors.status.success
      case 'decrease': return theme.colors.status.error
      case 'neutral': return theme.colors.text.secondary
    }
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl animate-pulse"
            style={{
              backgroundColor: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.light}`
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: theme.colors.background.tertiary }}
              />
              <div 
                className="w-16 h-4 rounded"
                style={{ backgroundColor: theme.colors.background.tertiary }}
              />
            </div>
            <div 
              className="w-20 h-8 rounded mb-2"
              style={{ backgroundColor: theme.colors.background.tertiary }}
            />
            <div 
              className="w-full h-4 rounded"
              style={{ backgroundColor: theme.colors.background.tertiary }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {displayStats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="p-6 rounded-xl transition-all duration-200 hover:shadow-lg cursor-pointer group"
          style={{
            backgroundColor: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.light}`,
            boxShadow: theme.shadows.sm
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
              style={{ 
                backgroundColor: getColorValue(stat.color) + '20',
                color: getColorValue(stat.color)
              }}
            >
              <span className="material-symbols-outlined text-xl">
                {stat.icon}
              </span>
            </div>
            
            {stat.change && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: getChangeColor(stat.change.type) + '20',
                  color: getChangeColor(stat.change.type)
                }}
              >
                <span className="material-symbols-outlined text-sm">
                  {getChangeIcon(stat.change.type)}
                </span>
                {stat.change.value}%
              </div>
            )}
          </div>

          {/* Value */}
          <div className="mb-2">
            <h3 
              className="text-2xl font-bold"
              style={{ color: theme.colors.text.primary }}
            >
              {stat.value}
            </h3>
            <p 
              className="text-sm font-medium"
              style={{ color: theme.colors.text.secondary }}
            >
              {stat.title}
            </p>
          </div>

          {/* Description */}
          {stat.description && (
            <p 
              className="text-xs"
              style={{ color: theme.colors.text.tertiary }}
            >
              {stat.description}
            </p>
          )}

          {/* Change Period */}
          {stat.change && (
            <p 
              className="text-xs mt-2"
              style={{ color: theme.colors.text.tertiary }}
            >
              {stat.change.period}
            </p>
          )}

          {/* Trend Line (Simple visualization) */}
          {stat.trend && stat.trend.length > 0 && (
            <div className="mt-4 h-8 flex items-end gap-1">
              {stat.trend.map((value, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
                  style={{
                                         height: `${(value / Math.max(...(stat.trend || []))) * 100}%`,
                    backgroundColor: getColorValue(stat.color) + '60',
                    minHeight: '4px'
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
} 