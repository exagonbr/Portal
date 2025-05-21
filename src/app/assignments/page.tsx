'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockAssignments, mockCourses, mockTeachers, mockStudents } from '@/constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Assignments() {
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

  let userAssignments = []

  if (user.type === 'teacher') {
    const teacher = mockTeachers.find(t => t.id === user.id)
    const teacherCourses = teacher?.courses || []
    userAssignments = mockAssignments.filter(assignment =>
      teacherCourses.includes(assignment.courseId)
    )
  } else {
    const student = mockStudents.find(s => s.id === user.id)
    const studentCourses = student?.enrolledCourses || []
    userAssignments = mockAssignments.filter(assignment =>
      studentCourses.includes(assignment.courseId) && assignment.status === 'active'
    )
  }

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
          <Link href="/courses" className="nav-link block">
            Cursos
          </Link>
          {user.type === 'teacher' && (
            <Link href="/students" className="nav-link block">
              Alunos
            </Link>
          )}
          <Link href="/assignments" className="nav-link active block">
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
          <h1 className="text-2xl font-bold text-[#1B365D]">Atividades</h1>
          {user.type === 'teacher' && (
            <button className="btn-primary">Criar Nova Atividade</button>
          )}
        </header>

        <div className="space-y-6 mt-6">
          {userAssignments.length === 0 ? (
            <p className="text-gray-600">Nenhuma atividade encontrada.</p>
          ) : (
            userAssignments.map(assignment => (
              <div key={assignment.id} className="card hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-[#1B365D] mb-2">{assignment.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Prazo: {assignment.dueDate} • {assignment.totalPoints} pontos
                  </p>
                  <span className="bg-[#1B365D] text-white px-3 py-1 rounded-full text-sm">
                    {assignment.type}
                  </span>
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/assignments/${assignment.id}`}
                      className="btn-primary"
                    >
                      {user.type === 'teacher' ? 'Editar' : 'Iniciar'}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
