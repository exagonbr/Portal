'use client'

import { useAuth } from '@/contexts/AuthContext'

// Dados mock locais
const teacherMockData = {
  totalStudents: 125,
  activeClasses: 8,
  pendingAssignments: 12,
  averageGrade: 8.5
}

const studentMockData = {
  completedCourses: 3,
  totalAssignments: 10,
  currentGrade: 8.7,
  attendanceRate: 95,
  nextAssignment: 'Projeto de História'
}

interface OverviewCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: string
  trend?: number
  color?: string
}

function OverviewCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color = 'blue'
}: OverviewCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <span className="text-2xl">{icon}</span>
        </div>
        {trend && (
          <div className={`px-2 py-1 rounded-full ${
            trend >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          } text-xs font-medium`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">{title}</span>
        <span className="text-2xl font-bold mt-1">{value}</span>
        {subtitle && (
          <span className="text-sm text-gray-500 mt-1">{subtitle}</span>
        )}
      </div>
    </div>
  )
}

export default function OverviewCards() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  if (user.role === 'teacher') {
    const stats = [
      { 
        title: 'Total de Alunos', 
        value: teacherMockData.totalStudents,
        subtitle: 'Em todas as turmas',
        icon: '👥',
        trend: 5,
        color: 'blue'
      },
      { 
        title: 'Turmas Ativas', 
        value: teacherMockData.activeClasses,
        subtitle: 'No período atual',
        icon: '📚',
        trend: 2,
        color: 'green'
      },
      { 
        title: 'Média de Presença', 
        value: `${teacherMockData.averageGrade}%`,
        subtitle: 'Últimos 30 dias',
        icon: '📊',
        trend: 3,
        color: 'purple'
      },
      { 
        title: 'Próximas Aulas', 
        value: teacherMockData.pendingAssignments,
        subtitle: 'Pendentes',
        icon: '📅',
        color: 'orange'
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <OverviewCard key={stat.title} {...stat} />
        ))}
      </div>
    )
  }

  if (user.role === 'student') {
    const completionRate = 75 // Valor fixo simplificado
    
    const stats = [
      { 
        title: 'Nota Atual', 
        value: studentMockData.currentGrade,
        subtitle: 'Média geral',
        icon: '🎯',
        trend: 5,
        color: 'green'
      },
      { 
        title: 'Atividades', 
        value: `${completionRate}%`,
        subtitle: `${studentMockData.completedCourses} de 10 concluídas`,
        icon: '✅',
        trend: 12,
        color: 'blue'
      },
      { 
        title: 'Frequência', 
        value: `${studentMockData.attendanceRate}%`,
        subtitle: 'Presença nas aulas',
        icon: '📊',
        trend: -2,
        color: 'purple'
      },
      { 
        title: 'Próximas Entregas', 
        value: '3',
        subtitle: 'Pendentes esta semana',
        icon: '📝',
        color: 'orange'
      }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <OverviewCard key={stat.title} {...stat} />
        ))}
      </div>
    )
  }

  return null
}
