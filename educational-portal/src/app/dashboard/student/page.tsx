'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockCourses, mockStudents, mockLiveClasses, mockAssignments } from '@/constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function StudentDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user || user.type !== 'student') {
    redirect('/login')
  }

  const studentCourses = mockCourses.filter(course => user.courses?.includes(course.id))
  const studentAssignments = mockAssignments.filter(
    assignment => user.courses?.includes(assignment.courseId) && assignment.status === 'active'
  )
  const studentClasses = mockLiveClasses.filter(
    liveClass => user.courses?.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  )
  const student = mockStudents.find(s => s.id === user.id)

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Portal do Aluno</h2>
          <p className="text-sm opacity-75">{user.name}</p>
        </div>
        <nav className="space-y-4">
          <Link href="/dashboard/student" className="nav-link active block">Dashboard</Link>
          <Link href="/courses" className="nav-link block">Meus Cursos</Link>
          <Link href="/assignments" className="nav-link block">Atividades</Link>
          <Link href="/live" className="nav-link block">Aulas ao Vivo</Link>
          <Link href="/chat" className="nav-link block">Chat</Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1B365D]">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button className="btn-secondary">Sair</button>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Progresso Geral</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{student?.progress}%</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Cursos Ativos</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{studentCourses.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Atividades Pendentes</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{studentAssignments.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Próximas Aulas</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{studentClasses.length}</p>
          </div>
        </div>

        {/* Courses Progress */}
        <div className="card mb-8">
          <h2 className="section-title">Meus Cursos</h2>
          <div className="space-y-4">
            {studentCourses.map(course => (
              <div key={course.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </div>
                  <Link href={`/courses/${course.id}`} className="btn-primary">
                    Acessar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="card mb-8">
          <h2 className="section-title">Próximas Aulas</h2>
          <div className="space-y-4">
            {studentClasses.map(liveClass => (
              <div key={liveClass.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{liveClass.title}</h3>
                    <p className="text-sm text-gray-600">
                      {liveClass.date} • {liveClass.time}
                    </p>
                    {liveClass.description && (
                      <p className="text-sm text-gray-600 mt-1">{liveClass.description}</p>
                    )}
                  </div>
                  <Link href={liveClass.meetingUrl} className="btn-primary">
                    Entrar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Assignments */}
        <div className="card">
          <h2 className="section-title">Atividades Pendentes</h2>
          <div className="space-y-4">
            {studentAssignments.map(assignment => (
              <div key={assignment.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      Prazo: {assignment.dueDate} • {assignment.totalPoints} pontos
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  </div>
                  <Link href={`/assignments/${assignment.id}`} className="btn-primary">
                    Iniciar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
