'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockCourses, mockTeachers, mockStudents } from '@/constants/mockData'
import CourseCard from '@/components/dashboard/CourseCard'

export default function Courses() {
  const { user } = useAuth()

  if (!user) return null // Will be handled by AuthenticatedDashboardLayout

  const userCourses = mockCourses.filter(course => {
    if (user.role === 'teacher') {
      const teacher = mockTeachers.find(t => t.id === user.id)
      return teacher?.courses.includes(course.id)
    } else {
      const student = mockStudents.find(s => s.id === user.id)
      return student?.enrolledCourses.includes(course.id)
    }
  })

  return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.role === 'teacher' ? 'Meus Cursos' : 'Cursos Disponíveis'}
          </h1>
          {user.role === 'teacher' && (
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                <span className="material-symbols-outlined mr-2">add</span>
                Criar Novo Curso
              </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userCourses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                <span className="material-symbols-outlined text-6xl mb-4">school</span>
                <p className="text-lg">
                  {user.role === 'teacher'
                      ? 'Você ainda não tem cursos cadastrados'
                      : 'Nenhum curso disponível no momento'}
                </p>
                {user.role === 'teacher' && (
                    <button className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      <span className="material-symbols-outlined mr-2">add</span>
                      Criar Primeiro Curso
                    </button>
                )}
              </div>
          ) : (
              userCourses.map((course) => (
                  <CourseCard
                      key={course.id}
                      course={course}
                      userType={user.role as 'teacher' | 'student'}
                  />
              ))
          )}
        </div>
      </div>
  )
}
