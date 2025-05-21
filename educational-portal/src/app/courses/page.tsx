'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockCourses, mockTeachers, mockStudents } from '@/constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Courses() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user) {
    redirect('/login')
  }

  const userCourses = mockCourses.filter(course => {
    if (user.type === 'teacher') {
      const teacher = mockTeachers.find(t => t.id === user.id)
      return teacher?.courses.includes(course.id)
    } else {
      const student = mockStudents.find(s => s.id === user.id)
      return student?.enrolledCourses.includes(course.id)
    }
  })

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">
            Portal do {user.type === 'teacher' ? 'Professor' : 'Aluno'}
          </h2>
          <p className="text-sm opacity-75">{user.name}</p>
        </div>
        <nav className="space-y-4">
          <Link href={`/dashboard/${user.type}`} className="nav-link block">
            Dashboard
          </Link>
          <Link href="/courses" className="nav-link active block">
            {user.type === 'teacher' ? 'Meus Cursos' : 'Cursos'}
          </Link>
          {user.type === 'teacher' && (
            <Link href="/students" className="nav-link block">
              Alunos
            </Link>
          )}
          <Link href="/assignments" className="nav-link block">
            Atividades
          </Link>
          <Link href="/live" className="nav-link block">
            Aulas ao Vivo
          </Link>
          {user.type === 'student' && (
            <Link href="/chat" className="nav-link block">
              Chat
            </Link>
          )}
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1B365D]">
            {user.type === 'teacher' ? 'Meus Cursos' : 'Cursos Disponíveis'}
          </h1>
          {user.type === 'teacher' && (
            <button className="btn-primary">Criar Novo Curso</button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {userCourses.map((course) => (
            <div key={course.id} className="card hover:shadow-lg transition-shadow">
              <div className="h-40 bg-[#1B365D] rounded-t-lg flex items-center justify-center">
                <span className="text-white text-4xl font-bold opacity-20">
                  {course.name[0]}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#1B365D] mb-2">
                  {course.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Nível:</span>
                    <span className="ml-2">{course.level}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Ciclo:</span>
                    <span className="ml-2">{course.cycle}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Duração:</span>
                    <span className="ml-2">{course.duration}</span>
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Link
                    href={`/courses/${course.id}`}
                    className="btn-primary"
                  >
                    {user.type === 'teacher' ? 'Gerenciar' : 'Acessar'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
