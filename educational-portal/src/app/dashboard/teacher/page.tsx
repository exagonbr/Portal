'use client'

import { useAuth } from '@/contexts/AuthContext'
import { mockTeachers, mockCourses, mockStudents, mockLiveClasses, mockAssignments } from '@/constants/mockData'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function TeacherDashboard() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    )
  }

  if (!user || user.type !== 'teacher') {
    redirect('/login')
  }

  const teacher = mockTeachers.find(t => t.id === user.id)
  const teacherCourses = mockCourses.filter(course => teacher?.courses.includes(course.id))
  const upcomingClasses = mockLiveClasses.filter(
    liveClass => teacher?.courses.includes(liveClass.courseId) && liveClass.status === 'scheduled'
  )
  const activeAssignments = mockAssignments.filter(
    assignment => teacher?.courses.includes(assignment.courseId) && assignment.status === 'active'
  )
  const teacherStudents = mockStudents.filter(student => 
    student.enrolledCourses.some(courseId => teacher?.courses.includes(courseId))
  )

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">Portal do Professor</h2>
          <p className="text-sm opacity-75">{user.name}</p>
        </div>
        <nav className="space-y-4">
          <Link href="/dashboard/teacher" className="nav-link active block">Dashboard</Link>
          <Link href="/courses" className="nav-link block">Meus Cursos</Link>
          <Link href="/students" className="nav-link block">Alunos</Link>
          <Link href="/assignments" className="nav-link block">Atividades</Link>
          <Link href="/live" className="nav-link block">Aulas ao Vivo</Link>
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
            <h3 className="text-lg font-semibold text-[#1B365D]">Cursos</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{teacherCourses.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Alunos</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{teacherStudents.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Aulas Agendadas</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{upcomingClasses.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-[#1B365D]">Atividades Ativas</h3>
            <p className="text-2xl font-bold text-[#1B365D]">{activeAssignments.length}</p>
          </div>
        </div>

        {/* Upcoming Classes */}
        <div className="card mb-8">
          <h2 className="section-title">Próximas Aulas</h2>
          <div className="space-y-4">
            {upcomingClasses.map(liveClass => (
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
        <div className="card mb-8">
          <h2 className="section-title">Atividades Ativas</h2>
          <div className="space-y-4">
            {activeAssignments.map(assignment => (
              <div key={assignment.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      Prazo: {assignment.dueDate} • {assignment.totalPoints} pontos
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                  </div>
                  <span className="bg-[#1B365D] text-white px-3 py-1 rounded-full text-sm">
                    {assignment.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Students Overview */}
        <div className="card">
          <h2 className="section-title">Visão Geral dos Alunos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-[#F7FAFC]">
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                    Progresso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                    Média
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#1B365D] uppercase tracking-wider">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {teacherStudents.map(student => {
                  const averageGrade = (
                    (student.grades.assignments + student.grades.tests + student.grades.participation) / 3
                  ).toFixed(1)

                  return (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-[#1B365D]">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-[#1B365D] h-2.5 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{student.progress}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {averageGrade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/students/${student.id}`}
                          className="text-[#1B365D] hover:text-[#2A4C80]"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
