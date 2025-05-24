'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockLiveClasses, mockCourses, mockTeachers, mockStudents } from '@/constants/mockData'
import LiveClassCard from '@/components/dashboard/LiveClassCard'

export default function LiveClasses() {
  const { user } = useAuth()

  if (!user) return null // Will be handled by AuthenticatedDashboardLayout

  const getUserClasses = () => {
    if (user.type === 'teacher') {
      const teacher = mockTeachers.find(t => t.id === user.id)
      const teacherCourses = teacher?.courses || []
      return mockLiveClasses.filter(liveClass =>
        teacherCourses.includes(liveClass.courseId)
      )
    } else {
      const student = mockStudents.find(s => s.id === user.id)
      const studentCourses = student?.enrolledCourses || []
      return mockLiveClasses.filter(liveClass =>
        studentCourses.includes(liveClass.courseId)
      )
    }
  }

  const userClasses = getUserClasses()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Aulas ao Vivo</h1>
        {user.type === 'teacher' && (
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            <span className="material-symbols-outlined mr-2">add</span>
            Agendar Nova Aula
          </button>
        )}
      </div>

      <div className="space-y-4">
        {userClasses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex flex-col items-center justify-center text-gray-500">
              <span className="material-symbols-outlined text-6xl mb-4">
                video_camera_front
              </span>
              <p className="text-lg mb-2">Nenhuma aula ao vivo encontrada</p>
              <p className="text-sm text-gray-400">
                {user.type === 'teacher' 
                  ? 'Clique no botão acima para agendar uma nova aula'
                  : 'Não há aulas ao vivo agendadas no momento'}
              </p>
            </div>
          </div>
        ) : (
          userClasses.map(liveClass => {
            const course = mockCourses.find(c => c.id === liveClass.courseId)
            return (
              <LiveClassCard
                key={liveClass.id}
                liveClass={liveClass}
                course={course}
                userType={user.type as 'teacher' | 'student'}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
