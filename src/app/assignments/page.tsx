'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockAssignments, mockTeachers, mockStudents } from '@/constants/mockData'

export default function Assignments() {
  const { user } = useAuth()

  const getUserAssignments = () => {
    if (!user) return []
    
    if (user.type === 'teacher') {
      const teacher = mockTeachers.find(t => t.id === user.id)
      const teacherCourses = teacher?.courses || []
      return mockAssignments.filter(assignment =>
        teacherCourses.includes(assignment.courseId)
      )
    } else {
      const student = mockStudents.find(s => s.id === user.id)
      const studentCourses = student?.enrolledCourses || []
      return mockAssignments.filter(assignment =>
        studentCourses.includes(assignment.courseId) && assignment.status === 'active'
      )
    }
  }

  const userAssignments = getUserAssignments()

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Atividades</h1>
        {user?.type === 'teacher' && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Criar Nova Atividade
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {userAssignments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-center text-gray-500">
            Nenhuma atividade encontrada.
          </div>
        ) : (
          userAssignments.map(assignment => (
            <div 
              key={assignment.id} 
              className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assignment.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {assignment.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-blue-600 font-medium">
                        Prazo: {assignment.dueDate}
                      </span>
                      <span className="text-sm text-blue-600 font-medium">
                        {assignment.totalPoints} pontos
                      </span>
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">
                      {assignment.type}
                    </span>
                  </div>
                  <button 
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {user?.type === 'teacher' ? 'Editar' : 'Iniciar'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
