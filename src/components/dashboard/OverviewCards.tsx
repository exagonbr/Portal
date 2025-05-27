'use client'

import { useAuth } from '@/contexts/AuthContext'
import { teacherMockData, studentMockData } from '@/constants/mockData'

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
        value: `${teacherMockData.averageAttendance}%`,
        subtitle: 'Últimos 30 dias',
        icon: '📊',
        trend: 3,
        color: 'purple'
      },
      { 
        title: 'Próximas Aulas', 
        value: teacherMockData.upcomingClasses.length,
        subtitle: 'Agendadas para hoje',
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
    const completionRate = Math.round((studentMockData.completedAssignments / studentMockData.totalAssignments) * 100)
    
    const stats = [
      { 
        title: 'Média Geral', 
        value: studentMockData.currentGrade.toFixed(1),
        subtitle: 'De 0 a 10',
        icon: '📊',
        trend: 8,
        color: 'blue'
      },
      { 
        title: 'Taxa de Presença', 
        value: `${studentMockData.attendanceRate}%`,
        subtitle: 'No período atual',
        icon: '📅',
        trend: 3,
        color: 'green'
      },
      { 
        title: 'Atividades', 
        value: `${completionRate}%`,
        subtitle: `${studentMockData.completedAssignments} de ${studentMockData.totalAssignments} concluídas`,
        icon: '✅',
        trend: 12,
        color: 'purple'
      },
      { 
        title: 'Próximas Entregas', 
        value: studentMockData.upcomingDeadlines.length,
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
