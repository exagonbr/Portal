'use client'

import { teacherMockData } from '@/constants/dashboardData'
import { useAuth } from '@/contexts/AuthContext'

interface ClassNotification {
  id: number
  subject: string
  time: string
  date: string
  students: number
  type: 'class' | 'notification'
  message?: string
}

export default function ProductList() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const currentDate = new Date()
  const notifications: ClassNotification[] = [
    ...teacherMockData.upcomingClasses.map(classItem => ({
      ...classItem,
      type: 'class' as const,
    })),
    {
      id: 101,
      subject: 'Matemática',
      time: '13:45',
      date: '2024-01-20',
      students: 3,
      type: 'notification',
      message: 'Novos exercícios entregues'
    },
    {
      id: 102,
      subject: 'Física',
      time: '14:30',
      date: '2024-01-20',
      students: 5,
      type: 'notification',
      message: 'Dúvidas pendentes no fórum'
    }
  ]

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Aulas e Notificações</h2>
      <div className="space-y-4">
        {notifications.map((item) => (
          <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl
              ${item.type === 'class' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
              {item.type === 'class' ? '📚' : '🔔'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{item.subject}</h3>
                <span className="text-sm text-gray-500">{item.time}</span>
              </div>
              <p className="text-sm text-gray-600">
                {item.type === 'class' 
                  ? `${item.students} alunos aguardando`
                  : item.message
                }
              </p>
            </div>
          </div>
        ))}
      </div>
      {notifications.length === 0 && (
        <div className="h-48 flex flex-col items-center justify-center text-gray-500 space-y-4">
          <span className="material-symbols-outlined text-4xl">notifications</span>
          <p>Nenhuma notificação no momento</p>
        </div>
      )}
    </div>
  )
}
